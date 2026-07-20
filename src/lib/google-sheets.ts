import { google } from "googleapis";
import { MOCK_CURSOS, Curso, Tema } from "./mock-data";

// Interfaces para tipar las Sheets
export interface SheetUsuario {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  username: string;
  correo: string;
  password_hash: string;
  rol: "estudiante" | "admin";
  plan: "gratis" | "premium";
  estado_cuenta: "trial" | "activo" | "expirado" | "bloqueado";
  fecha_registro: string;
  fecha_inicio_membresia: string | null;
  fecha_fin_membresia: string | null;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
  cursos_inscritos: string;
}

export interface SheetProgreso {
  id_progreso: string;
  id_usuario: string;
  id_curso: string;
  id_tema: string;
  completado: string; // "TRUE" | "FALSE"
  fecha_completado: string;
}

// Variables de entorno de Google Sheets API
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Limpieza robusta de la clave privada de Google
const cleanPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  let clean = key.trim();
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  if (clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.slice(1, -1);
  }
  return clean.replace(/\\n/g, "\n");
};

const PRIVATE_KEY = cleanPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

// Verificar si tenemos la configuración real habilitada
const isGoogleSheetsConfigured = !!(SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);

// Proveedor mock en memoria local para cuando no hay variables de entorno configuradas
// Esto permite levantar el proyecto out-of-the-box
class MockDatabase {
  public usuarios: SheetUsuario[] = [
    {
      id: "u_1",
      nombre: "Carlos",
      apellidos: "Estudiante Demo",
      dni: "12345678",
      username: "carlos.est",
      correo: "estudiante@kchimbo.com",
      password_hash: "$2b$10$iqj7xfDSYUPas9XOVxsqLeucjSPycv4nIu1IiE7j3Y9RGMTBQhDfS",
      rol: "estudiante",
      plan: "premium",
      estado_cuenta: "activo",
      fecha_registro: new Date().toISOString(),
      fecha_inicio_membresia: new Date().toISOString(),
      fecha_fin_membresia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      cursos_inscritos: "1,2,3",
    },
    {
      id: "u_2",
      nombre: "Ana",
      apellidos: "Administradora",
      dni: "87654321",
      username: "ana.admin",
      correo: "admin@kchimbo.com",
      password_hash: "$2b$10$b.5.K/niIRWF4SO3fIG5w./U5jaxYOrR3c4ErImHMG1DgPP7MBupu",
      rol: "admin",
      plan: "premium",
      estado_cuenta: "activo",
      fecha_registro: new Date().toISOString(),
      fecha_inicio_membresia: new Date().toISOString(),
      fecha_fin_membresia: null,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      cursos_inscritos: "1,2,3,4",
    },
  ];

  public progreso: SheetProgreso[] = [];
  public cursos: Curso[] = [...MOCK_CURSOS];
}

// Instancia única del mock en memoria (persiste mientras corre el servidor de desarrollo)
const globalRef = global as any;
if (!globalRef.mockDb) {
  globalRef.mockDb = new MockDatabase();
}
const mockDb = globalRef.mockDb as MockDatabase;

// Capa de caché en memoria para Google Sheets real
interface CacheContainer<T> {
  data: T | null;
  timestamp: number;
}
const cache = {
  cursos: { data: null, timestamp: 0 } as CacheContainer<Curso[]>,
  usuarios: { data: null, timestamp: 0 } as CacheContainer<SheetUsuario[]>,
  progreso: { data: null, timestamp: 0 } as CacheContainer<SheetProgreso[]>,
};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de caché

// Obtener cliente autenticado de Google Sheets
function getSheetsClient() {
  if (!isGoogleSheetsConfigured) {
    throw new Error("Google Sheets no está configurado.");
  }
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Log detallado y visible del error real de la API de Google, en vez de un mensaje genérico.
// Esto evita que un fallo real de conexión/permisos quede oculto detrás de un mensaje ambiguo.
function logSheetsError(context: string, error: any) {
  const googleMessage =
    error?.response?.data?.error?.message || error?.errors?.[0]?.message || error?.message || String(error);
  const googleStatus = error?.response?.status || error?.code;
  console.error(
    `\n🔴 [GOOGLE SHEETS ERROR] Contexto: ${context}\n` +
      `   Código/Status: ${googleStatus ?? "desconocido"}\n` +
      `   Mensaje real de Google: ${googleMessage}\n` +
      `   Sugerencia: revisa /api/debug/sheets-test para un diagnóstico paso a paso.\n`
  );
}

// ----------------------------------------------------
// MÉTODOS DE ACCESO A DATOS (ABSTRACCIÓN GOOGLE SHEETS / MOCK)
// ----------------------------------------------------

export async function getCursos(): Promise<Curso[]> {
  if (!isGoogleSheetsConfigured) {
    return mockDb.cursos;
  }

  // Verificar caché
  const now = Date.now();
  if (cache.cursos.data && now - cache.cursos.timestamp < CACHE_TTL_MS) {
    return cache.cursos.data;
  }

  try {
    const sheets = getSheetsClient();
    
    // Leemos Cursos
    const resCursos = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Cursos!A2:H", // Asume encabezados en fila 1
    });

    // Leemos Temas
    const resTemas = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Temas!A2:K",
    });

    const rowsCursos = resCursos.data.values || [];
    const rowsTemas = resTemas.data.values || [];

    // Mapear temas con los nuevos 5 recursos de YouTube y Drive
    const temas: Tema[] = rowsTemas.map((row) => ({
      id_tema: row[0],
      id_curso: row[1],
      slug: row[2],
      orden: parseInt(row[3]) || 0,
      titulo: row[4],
      duracion: row[5],
      video_teoria_url: row[6],
      video_practica_url: row[7] || undefined,
      pdf_resumen_url: row[8] || undefined,
      pdf_teoria_url: row[9] || undefined,
      pdf_preguntas_url: row[10] || undefined,
      material_url: row[8] || undefined,
    }));

    // Mapear cursos y anidar sus temas
    const cursos: Curso[] = rowsCursos.map((row) => {
      const idCurso = row[0];
      const temasCurso = temas
        .filter((t) => t.id_curso === idCurso)
        .sort((a, b) => a.orden - b.orden);

      return {
        id_curso: idCurso,
        slug: row[1],
        titulo: row[2],
        descripcion: row[3],
        categoria: row[4],
        thumbnail_url: row[5],
        nivel: (row[6] as any) || "Secundaria",
        carrera: row[7] || undefined,
        temas: temasCurso,
      };
    });

    // Guardar en caché
    cache.cursos.data = cursos;
    cache.cursos.timestamp = now;

    return cursos;
  } catch (error) {
    console.error("Error cargando cursos de Google Sheets, usando mock data fallback:", error);
    return mockDb.cursos;
  }
}

export async function getUsuarios(): Promise<SheetUsuario[]> {
  if (!isGoogleSheetsConfigured) {
    return mockDb.usuarios;
  }

  const now = Date.now();
  if (cache.usuarios.data && now - cache.usuarios.timestamp < CACHE_TTL_MS) {
    return cache.usuarios.data;
  }

  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Usuarios!A2:P",
    });

    const rows = res.data.values || [];
    const usuarios: SheetUsuario[] = rows.map((row) => ({
      id: row[0],
      nombre: row[1],
      apellidos: row[2] || "",
      dni: row[3] || "",
      username: row[4] || "",
      correo: row[5],
      password_hash: row[6],
      rol: (row[7] as any) || "estudiante",
      plan: (row[8] as any) || "gratis",
      estado_cuenta: (row[9] as any) || "trial",
      fecha_registro: row[10],
      fecha_inicio_membresia: row[11] || null,
      fecha_fin_membresia: row[12] || null,
      intentos_fallidos: parseInt(row[13]) || 0,
      bloqueado_hasta: row[14] || null,
      cursos_inscritos: row[15] || "",
    }));

    cache.usuarios.data = usuarios;
    cache.usuarios.timestamp = now;

    return usuarios;
  } catch (error) {
    console.error("Error leyendo usuarios de Google Sheets, usando mock database:", error);
    return mockDb.usuarios;
  }
}

export async function registrarUsuario(usuario: Omit<SheetUsuario, "id" | "fecha_registro" | "cursos_inscritos">): Promise<SheetUsuario> {
  const nuevoUsuario: SheetUsuario = {
    ...usuario,
    id: `u_${crypto.randomUUID().slice(0, 8)}`,
    fecha_registro: new Date().toISOString(),
    cursos_inscritos: "", // Vacío por defecto
  };

  if (!isGoogleSheetsConfigured) {
    mockDb.usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  }

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Usuarios!A2:P",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            nuevoUsuario.id,
            nuevoUsuario.nombre,
            nuevoUsuario.apellidos,
            nuevoUsuario.dni,
            nuevoUsuario.username,
            nuevoUsuario.correo,
            nuevoUsuario.password_hash,
            nuevoUsuario.rol,
            nuevoUsuario.plan,
            nuevoUsuario.estado_cuenta,
            nuevoUsuario.fecha_registro,
            nuevoUsuario.fecha_inicio_membresia || "",
            nuevoUsuario.fecha_fin_membresia || "",
            nuevoUsuario.intentos_fallidos.toString(),
            nuevoUsuario.bloqueado_hasta || "",
            nuevoUsuario.cursos_inscritos,
          ],
        ],
      },
    });

    // Invalidar caché
    cache.usuarios.data = null;
    return nuevoUsuario;
  } catch (error) {
    logSheetsError("registrarUsuario (escritura en la hoja 'Usuarios')", error);
    // IMPORTANTE: cuando Google Sheets SÍ está configurado pero la escritura falla
    // (permisos, nombre de pestaña incorrecto, API no habilitada, etc.), NO fingimos
    // éxito guardando solo en memoria. Antes esto causaba que el registro "funcionara"
    // en pantalla pero nunca llegara a la hoja real. Ahora se lanza un error real
    // para que el usuario vea el problema y lo podamos diagnosticar.
    throw new Error(
      "No se pudo guardar el usuario en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}

export async function getProgreso(idUsuario: string): Promise<SheetProgreso[]> {
  if (!isGoogleSheetsConfigured) {
    return mockDb.progreso.filter((p) => p.id_usuario === idUsuario);
  }

  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Progreso!A2:F",
    });

    const rows = res.data.values || [];
    const progreso: SheetProgreso[] = rows
      .map((row) => ({
        id_progreso: row[0],
        id_usuario: row[1],
        id_curso: row[2],
        id_tema: row[3],
        completado: row[4],
        fecha_completado: row[5],
      }))
      .filter((p) => p.id_usuario === idUsuario);

    return progreso;
  } catch (error) {
    console.error("Error cargando progreso de Google Sheets, usando mock database:", error);
    return mockDb.progreso.filter((p) => p.id_usuario === idUsuario);
  }
}

export async function guardarProgreso(
  idUsuario: string,
  idCurso: string,
  idTema: string,
  completado: boolean
): Promise<void> {
  const completadoStr = completado ? "TRUE" : "FALSE";
  
  if (!isGoogleSheetsConfigured) {
    const index = mockDb.progreso.findIndex(
      (p) => p.id_usuario === idUsuario && p.id_tema === idTema
    );

    if (index > -1) {
      mockDb.progreso[index].completado = completadoStr;
      mockDb.progreso[index].fecha_completado = new Date().toISOString();
    } else {
      mockDb.progreso.push({
        id_progreso: `p_${Date.now()}`,
        id_usuario: idUsuario,
        id_curso: idCurso,
        id_tema: idTema,
        completado: completadoStr,
        fecha_completado: new Date().toISOString(),
      });
    }
    return;
  }

  try {
    const sheets = getSheetsClient();
    
    // Primero leemos todo el progreso para ver si el registro ya existe en la Sheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Progreso!A2:F",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex(
      (row) => row[1] === idUsuario && row[3] === idTema
    );

    if (rowIndex > -1) {
      // Si existe, actualizamos la columna completado (columna E -> fila es rowIndex + 2 debido al offset de cabecera y 0-index)
      const rowNum = rowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Progreso!E${rowNum}:F${rowNum}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[completadoStr, new Date().toISOString()]],
        },
      });
    } else {
      // Si no existe, agregamos una fila
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Progreso!A2:F",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              `p_${Date.now()}`,
              idUsuario,
              idCurso,
              idTema,
              completadoStr,
              new Date().toISOString(),
            ],
          ],
        },
      });
    }
  } catch (error) {
    logSheetsError("guardarProgreso (escritura en la hoja 'Progreso')", error);
    throw new Error(
      "No se pudo guardar el progreso en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}

export async function registrarCurso(
  curso: Omit<Curso, "id_curso" | "slug" | "temas">
): Promise<Curso> {
  const idCurso = `c_${Date.now()}`;
  const slug = curso.titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const nuevoCurso: Curso = {
    ...curso,
    id_curso: idCurso,
    slug,
    temas: [],
  };

  if (!isGoogleSheetsConfigured) {
    mockDb.cursos.push(nuevoCurso);
    return nuevoCurso;
  }

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Cursos!A2:H",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            nuevoCurso.id_curso,
            nuevoCurso.slug,
            nuevoCurso.titulo,
            nuevoCurso.descripcion,
            nuevoCurso.categoria,
            nuevoCurso.thumbnail_url,
            nuevoCurso.nivel,
            nuevoCurso.carrera || "",
          ],
        ],
      },
    });

    // Invalidar caché
    cache.cursos.data = null;
    return nuevoCurso;
  } catch (error) {
    logSheetsError("registrarCurso (escritura en la hoja 'Cursos')", error);
    throw new Error(
      "No se pudo guardar el curso en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}

async function getSheetIdByName(sheets: any, name: string): Promise<number | null> {
  try {
    const doc = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = doc.data.sheets?.find((s: any) => s.properties?.title === name);
    return sheet?.properties?.sheetId ?? null;
  } catch (e) {
    console.error(`Error al obtener sheetId de la hoja ${name}:`, e);
    return null;
  }
}

export async function actualizarCurso(
  curso: Omit<Curso, "temas" | "slug">
): Promise<Omit<Curso, "temas">> {
  const slug = curso.titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const cursoActualizado = {
    ...curso,
    slug,
  };

  if (!isGoogleSheetsConfigured) {
    const idx = mockDb.cursos.findIndex((c) => c.id_curso === curso.id_curso);
    if (idx !== -1) {
      mockDb.cursos[idx] = {
        ...mockDb.cursos[idx],
        ...cursoActualizado,
      };
    }
    return cursoActualizado;
  }

  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Cursos!A:A",
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === curso.id_curso) + 1;

    if (rowIndex <= 1) {
      throw new Error(`No se encontró el curso con ID ${curso.id_curso} en Google Sheets.`);
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Cursos!A${rowIndex}:H${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            cursoActualizado.id_curso,
            cursoActualizado.slug,
            cursoActualizado.titulo,
            cursoActualizado.descripcion,
            cursoActualizado.categoria,
            cursoActualizado.thumbnail_url,
            cursoActualizado.nivel,
            cursoActualizado.carrera || "",
          ],
        ],
      },
    });

    cache.cursos.data = null;
    return cursoActualizado;
  } catch (error) {
    logSheetsError("actualizarCurso (escritura en la hoja 'Cursos')", error);
    throw new Error(
      "No se pudo actualizar el curso en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}

export async function eliminarCurso(idCurso: string): Promise<boolean> {
  if (!isGoogleSheetsConfigured) {
    mockDb.cursos = mockDb.cursos.filter((c) => c.id_curso !== idCurso);
    return true;
  }

  try {
    const sheets = getSheetsClient();
    
    // 1. Eliminar curso de la hoja "Cursos"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Cursos!A:A",
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === idCurso) + 1;

    if (rowIndex > 1) {
      const sheetIdCursos = await getSheetIdByName(sheets, "Cursos");
      if (sheetIdCursos !== null) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: sheetIdCursos,
                    dimension: "ROWS",
                    startIndex: rowIndex - 1,
                    endIndex: rowIndex,
                  },
                },
              },
            ],
          },
        });
      }
    }

    // 2. Eliminar temas asociados de la hoja "Temas"
    const resTemas = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Temas!B:B", // Columna de id_curso
    });

    const rowsTemas = resTemas.data.values || [];
    const sheetIdTemas = await getSheetIdByName(sheets, "Temas");

    if (sheetIdTemas !== null) {
      // Eliminar las filas de atrás hacia adelante para no alterar los índices de filas subsecuentes al borrar
      const indicesABorrar: number[] = [];
      rowsTemas.forEach((row, idx) => {
        if (row[0] === idCurso) {
          indicesABorrar.push(idx + 1); // 1-indexed
        }
      });

      if (indicesABorrar.length > 0) {
        // Ordenar descendentemente para no descalibrar los índices al borrar
        indicesABorrar.sort((a, b) => b - a);

        const requests = indicesABorrar.map((idx) => ({
          deleteDimension: {
            range: {
              sheetId: sheetIdTemas,
              dimension: "ROWS",
              startIndex: idx - 1,
              endIndex: idx,
            },
          },
        }));

        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests,
          },
        });
      }
    }

    cache.cursos.data = null;
    return true;
  } catch (error) {
    logSheetsError("eliminarCurso (borrado en las hojas 'Cursos'/'Temas')", error);
    throw new Error(
      "No se pudo eliminar el curso en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}


export async function registrarTema(
  tema: Omit<Tema, "id_tema" | "slug">
): Promise<Tema> {
  const idTema = `t_${Date.now()}`;
  const slug = tema.titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const nuevoTema: Tema = {
    ...tema,
    id_tema: idTema,
    slug,
  };

  if (!isGoogleSheetsConfigured) {
    // Buscar curso en mock y agregarlo a su lista
    const cursoIndex = mockDb.cursos.findIndex((c) => c.id_curso === tema.id_curso);
    if (cursoIndex !== -1) {
      if (!mockDb.cursos[cursoIndex].temas) {
        mockDb.cursos[cursoIndex].temas = [];
      }
      mockDb.cursos[cursoIndex].temas!.push(nuevoTema);
    }
    return nuevoTema;
  }

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Temas!A2:K",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            nuevoTema.id_tema,
            nuevoTema.id_curso,
            nuevoTema.slug,
            nuevoTema.orden,
            nuevoTema.titulo,
            nuevoTema.duracion,
            nuevoTema.video_teoria_url,
            nuevoTema.video_practica_url || "",
            nuevoTema.pdf_resumen_url || "",
            nuevoTema.pdf_teoria_url || "",
            nuevoTema.pdf_preguntas_url || "",
          ],
        ],
      },
    });

    // Invalidar caché
    cache.cursos.data = null;
    return nuevoTema;
  } catch (error) {
    logSheetsError("registrarTema (escritura en la hoja 'Temas')", error);
    throw new Error(
      "No se pudo guardar el tema en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}

export async function actualizarTema(tema: Omit<Tema, "slug">): Promise<Tema> {
  const slug = tema.titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const temaActualizado: Tema = {
    ...tema,
    slug,
  };

  if (!isGoogleSheetsConfigured) {
    const cursoIndex = mockDb.cursos.findIndex((c) => c.id_curso === tema.id_curso);
    if (cursoIndex !== -1 && mockDb.cursos[cursoIndex].temas) {
      const temaIndex = mockDb.cursos[cursoIndex].temas!.findIndex(
        (t) => t.id_tema === tema.id_tema
      );
      if (temaIndex !== -1) {
        mockDb.cursos[cursoIndex].temas![temaIndex] = temaActualizado;
      }
    }
    return temaActualizado;
  }

  try {
    const sheets = getSheetsClient();
    
    // Obtener todas las filas para encontrar el ID del tema y su índice
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Temas!A:A",
    });

    const rows = response.data.values || [];
    // Encontrar el índice de la fila (1-indexed para Google Sheets, fila 1 son encabezados)
    const rowIndex = rows.findIndex((row) => row[0] === tema.id_tema) + 1;

    if (rowIndex <= 1) {
      throw new Error(`No se encontró el tema con ID ${tema.id_tema} en Google Sheets.`);
    }

    // Actualizar la fila correspondiente
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Temas!A${rowIndex}:K${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            temaActualizado.id_tema,
            temaActualizado.id_curso,
            temaActualizado.slug,
            temaActualizado.orden,
            temaActualizado.titulo,
            temaActualizado.duracion,
            temaActualizado.video_teoria_url,
            temaActualizado.video_practica_url || "",
            temaActualizado.pdf_resumen_url || "",
            temaActualizado.pdf_teoria_url || "",
            temaActualizado.pdf_preguntas_url || "",
          ],
        ],
      },
    });

    // Invalidar caché
    cache.cursos.data = null;
    return temaActualizado;
  } catch (error) {
    logSheetsError("actualizarTema (escritura en la hoja 'Temas')", error);
    throw new Error(
      "No se pudo actualizar el tema en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}

export async function actualizarUsuario(idUsuario: string, campos: Partial<SheetUsuario>): Promise<SheetUsuario | null> {
  if (!isGoogleSheetsConfigured) {
    const idx = mockDb.usuarios.findIndex((u) => u.id === idUsuario);
    if (idx === -1) return null;
    mockDb.usuarios[idx] = { ...mockDb.usuarios[idx], ...campos };
    return mockDb.usuarios[idx];
  }

  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Usuarios!A2:P",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === idUsuario);
    if (rowIndex === -1) return null;

    const row = rows[rowIndex];
    const usuario: SheetUsuario = {
      id: row[0],
      nombre: campos.nombre ?? row[1],
      apellidos: campos.apellidos ?? row[2] ?? "",
      dni: campos.dni ?? row[3] ?? "",
      username: campos.username ?? row[4] ?? "",
      correo: campos.correo ?? row[5],
      password_hash: campos.password_hash ?? row[6],
      rol: (campos.rol ?? row[7]) as any,
      plan: (campos.plan ?? row[8]) as any,
      estado_cuenta: (campos.estado_cuenta ?? row[9]) as any,
      fecha_registro: row[10],
      fecha_inicio_membresia: campos.fecha_inicio_membresia !== undefined ? campos.fecha_inicio_membresia : (row[11] || null),
      fecha_fin_membresia: campos.fecha_fin_membresia !== undefined ? campos.fecha_fin_membresia : (row[12] || null),
      intentos_fallidos: campos.intentos_fallidos ?? (parseInt(row[13]) || 0),
      bloqueado_hasta: campos.bloqueado_hasta !== undefined ? campos.bloqueado_hasta : (row[14] || null),
      cursos_inscritos: campos.cursos_inscritos ?? row[15] ?? "",
    };

    const sheetRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Usuarios!A${sheetRow}:P${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            usuario.id,
            usuario.nombre,
            usuario.apellidos,
            usuario.dni,
            usuario.username,
            usuario.correo,
            usuario.password_hash,
            usuario.rol,
            usuario.plan,
            usuario.estado_cuenta,
            usuario.fecha_registro,
            usuario.fecha_inicio_membresia || "",
            usuario.fecha_fin_membresia || "",
            usuario.intentos_fallidos.toString(),
            usuario.bloqueado_hasta || "",
            usuario.cursos_inscritos,
          ],
        ],
      },
    });

    cache.usuarios.data = null;
    return usuario;
  } catch (error) {
    logSheetsError("actualizarUsuario (escritura en la hoja 'Usuarios')", error);
    throw new Error(
      "No se pudo actualizar el usuario en Google Sheets. Revisa /api/debug/sheets-test para ver el motivo exacto."
    );
  }
}


