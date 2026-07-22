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

    // Verificar bloqueo
    const bloqueo = this.estaBlockeado(u);
    if (bloqueo.bloqueado) {
      return {
        success: false,
        bloqueado: true,
        msRestantes: bloqueo.msRestantes,
        mensaje: `Cuenta bloqueada. Espera ${Math.ceil(bloqueo.msRestantes / 60000)} minutos.`
      };
    }

    // Buscar usuario (demo local / localStorage; en producción esto va al Apps Script)
    let userData = null;

    const userList = (typeof getUsuariosData === 'function')
      ? getUsuariosData()
      : (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS : []);

    userData = userList.find(
      u2 => u2.usuario.toLowerCase() === u && u2.password === password
    );

    // Modo REAL: buscar en Google Sheets via SheetsAPI si está activo
    if (!userData && typeof SheetsAPI !== 'undefined' && SheetsAPI.enabled) {
      try {
        userData = await SheetsAPI.verificarLogin(u, password);
      } catch (e) {
        console.error('Error consultando Sheets:', e);
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
      nombre: userData.nombre,
      area: userData.area,
      ciclos: userData.ciclos || ['Ciclo Matecero', 'Ciclo Formativo'],
      areas: userData.areas || [userData.area || 'INGENIERÍAS'],
      rol: userData.rol,
      membresia_inicio: userData.membresia_inicio,
      membresia_fin: userData.membresia_fin,
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
