// ============================================================
// KCHIMBO+ — GOOGLE SHEETS API INTEGRATION
// Conecta con tu Google Apps Script desplegado como Web App
//
// INSTRUCCIONES DE CONFIGURACIÓN:
// 1. Abre Google Sheets → Extensiones → Apps Script
// 2. Pega el código de apps-script.gs (incluido al final de este archivo)
// 3. Despliega como Web App → "Ejecutar como: Yo" → "Acceso: Todos"
// 4. Copia la URL del deployment y pégala en APPS_SCRIPT_URL abajo
// ============================================================

const SheetsAPI = {
  // ── CONFIGURACIÓN ──────────────────────────────────────
  // Reemplaza con tu URL de Apps Script deployment
  APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL_HERE',

  // Poner en false mientras usas datos demo
  enabled: false,

  // ── REQUEST genérico ──
  async request(action, params = {}) {
    if (!this.enabled) {
      console.warn('SheetsAPI: modo demo, petición ignorada.');
      return null;
    }

    const url = new URL(this.APPS_SCRIPT_URL);
    url.searchParams.set('action', action);
    Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async post(action, body = {}) {
    if (!this.enabled) return null;
    const response = await fetch(this.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // SEGURIDAD FIX: login siempre por POST (nunca exponer password en GET params/URL/logs)
  async verificarLogin(usuario, password) {
    const data = await this.post('verificarLogin', { usuario, password });
    if (data && data.success) return data.usuario;
    return null;
  },

  async getUsuarios() {
    return await this.request('getUsuarios');
  },

  async crearUsuario(usuarioData) {
    return await this.post('crearUsuario', usuarioData);
  },

  async editarUsuario(usuario, campos) {
    return await this.post('editarUsuario', { usuario, ...campos });
  },

  async eliminarUsuario(usuario) {
    return await this.post('eliminarUsuario', { usuario });
  },

  // ── CLASES ──
  async getClases() {
    return await this.request('getClases');
  },

  async crearClase(claseData) {
    return await this.post('crearClase', claseData);
  },

  async editarClase(id, campos) {
    return await this.post('editarClase', { id, ...campos });
  },

  async eliminarClase(id) {
    return await this.post('eliminarClase', { id });
  },

  // ── RESÚMENES ──
  async getResumenes() {
    return await this.request('getResumenes');
  },

  async crearResumen(data) {
    return await this.post('crearResumen', data);
  },

  async editarResumen(id, campos) {
    return await this.post('editarResumen', { id, ...campos });
  },

  async eliminarResumen(id) {
    return await this.post('eliminarResumen', { id });
  },

  // ── PREGUNTAS ──
  async getPreguntas(filtros = {}) {
    return await this.request('getPreguntas', filtros);
  },

  async crearPregunta(data) {
    return await this.post('crearPregunta', data);
  },

  async editarPregunta(id, campos) {
    return await this.post('editarPregunta', { id, ...campos });
  },

  async eliminarPregunta(id) {
    return await this.post('eliminarPregunta', { id });
  },

  // ── PROGRESO ──
  async guardarSimulacro(usuario, resultado) {
    return await this.post('guardarSimulacro', { usuario, ...resultado });
  },

  async getProgreso(usuario) {
    return await this.request('getProgreso', { usuario });
  },

  // ── PAGOS ──
  async getPago(usuario) {
    return await this.request('getPago', { usuario });
  },

  async actualizarMembresia(usuario, inicio, fin) {
    return await this.post('actualizarMembresia', { usuario, inicio, fin });
  }
};

/*
===============================================================
CÓDIGO PARA GOOGLE APPS SCRIPT (apps-script.gs)
Copia esto en tu proyecto de Apps Script:
===============================================================

const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';

function doGet(e) {
  const action = e.parameter.action;
  try {
    let result;
    switch(action) {
      case 'verificarLogin': result = verificarLogin(e.parameter.usuario, e.parameter.password); break;
      case 'getUsuarios':    result = getUsuarios(); break;
      case 'getClases':      result = getClases(); break;
      case 'getResumenes':   result = getResumenes(); break;
      case 'getPreguntas':   result = getPreguntas(e.parameter); break;
      case 'getProgreso':    result = getProgreso(e.parameter.usuario); break;
      case 'getPago':        result = getPago(e.parameter.usuario); break;
      default:               result = { error: 'Acción no reconocida' };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  try {
    let result;
    switch(action) {
      case 'crearUsuario':       result = crearUsuario(body); break;
      case 'editarUsuario':      result = editarUsuario(body); break;
      case 'eliminarUsuario':    result = eliminarUsuario(body.usuario); break;
      case 'crearClase':         result = crearClase(body); break;
      case 'editarClase':        result = editarClase(body); break;
      case 'eliminarClase':      result = eliminarClase(body.id); break;
      case 'crearPregunta':      result = crearPregunta(body); break;
      case 'editarPregunta':     result = editarPregunta(body); break;
      case 'eliminarPregunta':   result = eliminarPregunta(body.id); break;
      case 'guardarSimulacro':   result = guardarSimulacro(body); break;
      case 'actualizarMembresia':result = actualizarMembresia(body); break;
      default:                   result = { error: 'Acción no reconocida' };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function verificarLogin(usuario, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('USUARIOS');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0].toString().toLowerCase() === usuario.toLowerCase() && row[1] === password) {
      return {
        success: true,
        usuario: {
          usuario: row[0], nombre: row[2], area: row[3],
          rol: row[4], membresia_inicio: row[5], membresia_fin: row[6]
        }
      };
    }
  }
  return { success: false };
}

function getClases() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('CLASES');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getPreguntas(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('PREGUNTAS');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let preguntas = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  if (params.curso) preguntas = preguntas.filter(p => p.curso === params.curso);
  if (params.area) preguntas = preguntas.filter(p => p.area === params.area || p.area === 'AMBAS');
  if (params.tema) preguntas = preguntas.filter(p => p.tema === params.tema);
  return preguntas;
}

// ... (implementar el resto de funciones CRUD siguiendo el mismo patrón)
===============================================================
*/
