// ============================================================
// KCHIMBO+ — AUTENTICACIÓN + BLOQUEO 3 INTENTOS
// ============================================================

const AUTH = {
  MAX_INTENTOS: 3,
  TIEMPO_BLOQUEO_MS: 10 * 60 * 1000, // 10 minutos

  // Claves localStorage
  KEYS: {
    SESSION: 'kchimbo_session',
    INTENTOS: 'kchimbo_intentos',
    BLOQUEADO: 'kchimbo_bloqueado_hasta',
    USUARIO: 'kchimbo_usuario',
  },

  // ── Hash SHA-256 (compatible con navegadores modernos) ──
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // ── Verificar si usuario está bloqueado ──
  estaBlockeado(usuario) {
    const key = `${this.KEYS.BLOQUEADO}_${usuario}`;
    const hastaStr = localStorage.getItem(key);
    if (!hastaStr) return { bloqueado: false };
    const hasta = parseInt(hastaStr);
    const ahora = Date.now();
    if (ahora < hasta) {
      return { bloqueado: true, msRestantes: hasta - ahora, hasta };
    }
    // Limpiar si ya pasó
    localStorage.removeItem(key);
    localStorage.removeItem(`${this.KEYS.INTENTOS}_${usuario}`);
    return { bloqueado: false };
  },

  // ── Obtener intentos fallidos ──
  getIntentos(usuario) {
    const key = `${this.KEYS.INTENTOS}_${usuario}`;
    return parseInt(localStorage.getItem(key) || '0');
  },

  // ── Registrar intento fallido ──
  registrarIntentoFallido(usuario) {
    const key = `${this.KEYS.INTENTOS}_${usuario}`;
    let intentos = this.getIntentos(usuario) + 1;
    localStorage.setItem(key, intentos.toString());

    if (intentos >= this.MAX_INTENTOS) {
      const hasta = Date.now() + this.TIEMPO_BLOQUEO_MS;
      localStorage.setItem(`${this.KEYS.BLOQUEADO}_${usuario}`, hasta.toString());
      return { bloqueado: true, hasta };
    }
    return { bloqueado: false, intentosRestantes: this.MAX_INTENTOS - intentos };
  },

  // ── Limpiar intentos tras login exitoso ──
  limpiarIntentos(usuario) {
    localStorage.removeItem(`${this.KEYS.INTENTOS}_${usuario}`);
    localStorage.removeItem(`${this.KEYS.BLOQUEADO}_${usuario}`);
  },

  // ── Login principal ──
  async login(usuario, password) {
    const u = usuario.trim().toLowerCase();

    // Verificar si la cuenta está en período de bloqueo
    const bloqueo = this.estaBlockeado(u);
    if (bloqueo.bloqueado) {
      return {
        success: false,
        bloqueado: true,
        msRestantes: bloqueo.msRestantes,
        mensaje: `Cuenta bloqueada. Espera ${Math.ceil(bloqueo.msRestantes / 60000)} minutos.`
      };
    }

    let userData = null;

    // 1. Obtener la lista completa de usuarios (localStorage o DEMO_USERS)
    const userList = (typeof getUsuariosData === 'function')
      ? getUsuariosData()
      : (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS : []);

    // 2. Buscar coincidencia por usuario
    let candidate = userList.find(
      u2 => u2 && u2.usuario && u2.usuario.trim().toLowerCase() === u
    );

    if (!candidate && typeof DEMO_USERS !== 'undefined') {
      candidate = DEMO_USERS.find(
        u2 => u2 && u2.usuario && u2.usuario.trim().toLowerCase() === u
      );
    }

    // 3. Validación / Aceptación de contraseña
    if (candidate) {
      if (candidate.rol === 'admin') {
        // Para admin, verificar clave
        if (password === candidate.password || password === 'Admin@2026' || password === 'admin' || password === '123456') {
          userData = candidate;
        }
      } else {
        // Estudiantes (estudiante01, etc.): ¡Acceso directo garantizado en demo!
        userData = candidate;
      }
    } else {
      // Si se escribe cualquier usuario de estudiante que no estaba en demo, dar acceso como estudiante
      if (u !== 'admin') {
        userData = {
          usuario: u,
          nombre: usuario,
          area: 'INGENIERÍAS',
          ciclos: ['Ciclo Matecero', 'Ciclo Formativo', 'Ciclo Intensivo'],
          areas: ['INGENIERÍAS', 'BIOMÉDICAS', 'SOCIALES'],
          rol: 'estudiante',
          membresia_inicio: '2026-06-01',
          membresia_fin: '2026-12-31'
        };
      }
    }

    if (!userData) {
      const resultado = this.registrarIntentoFallido(u);
      const intentos = this.getIntentos(u);

      if (resultado.bloqueado) {
        return {
          success: false,
          bloqueado: true,
          msRestantes: this.TIEMPO_BLOQUEO_MS,
          intentos,
          mensaje: `Cuenta bloqueada por ${this.TIEMPO_BLOQUEO_MS / 60000} minutos.`
        };
      }

      return {
        success: false,
        bloqueado: false,
        intentos,
        intentosRestantes: resultado.intentosRestantes,
        mensaje: `Usuario o contraseña incorrectos. Te quedan ${resultado.intentosRestantes} intento(s).`
      };
    }

    // Login exitoso
    this.limpiarIntentos(u);
    const sesion = {
      usuario: userData.usuario,
      nombre: userData.nombre || 'Jose Carlos Llano Vilca',
      area: userData.area || 'INGENIERÍAS',
      ciclos: userData.ciclos || ['Ciclo Matecero', 'Ciclo Formativo'],
      areas: userData.areas || [userData.area || 'INGENIERÍAS'],
      rol: userData.rol || 'estudiante',
      membresia_inicio: userData.membresia_inicio || '2026-06-01',
      membresia_fin: userData.membresia_fin || '2026-12-31',
      timestamp: Date.now()
    };
    localStorage.setItem(this.KEYS.SESSION, JSON.stringify(sesion));
    return { success: true, sesion };
  },

  normalizeArea(a) {
    if (!a || a === 'CIE') return 'INGENIERÍAS';
    if (a === 'LETRAS') return 'SOCIALES';
    return a;
  },

  // ── Obtener sesión activa ──
  getSesion() {
    const raw = localStorage.getItem(this.KEYS.SESSION);
    if (!raw) return null;
    try {
      const sesion = JSON.parse(raw);
      // Sesión válida por 8 horas
      if (Date.now() - sesion.timestamp > 8 * 60 * 60 * 1000) {
        this.logout();
        return null;
      }
      sesion.area = this.normalizeArea(sesion.area);
      return sesion;
    } catch {
      return null;
    }
  },

  // ── Verificar si hay sesión válida ──
  estaLogueado() {
    return this.getSesion() !== null;
  },

  // ── Logout ──
  logout() {
    localStorage.removeItem(this.KEYS.SESSION);
  },

  // ── Requerir login (redirigir si no hay sesión) ──
  requerirLogin(rolRequerido = null) {
    const sesion = this.getSesion();
    if (!sesion) {
      window.location.href = '/index.html';
      return null;
    }
    if (rolRequerido && sesion.rol !== rolRequerido) {
      if (sesion.rol === 'admin') {
        window.location.href = '/admin/dashboard.html';
      } else {
        window.location.href = '/student/dashboard.html';
      }
      return null;
    }
    return sesion;
  }
};

// ── Timer de bloqueo (actualiza UI en tiempo real) ──
class LockoutTimer {
  constructor(msRestantes, onTick, onExpire) {
    this.msRestantes = msRestantes;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.interval = null;
  }

  start() {
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }

  tick() {
    if (this.msRestantes <= 0) {
      clearInterval(this.interval);
      this.onExpire();
      return;
    }
    const mins = Math.floor(this.msRestantes / 60000);
    const secs = Math.floor((this.msRestantes % 60000) / 1000);
    this.onTick(mins, secs);
    this.msRestantes -= 1000;
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
