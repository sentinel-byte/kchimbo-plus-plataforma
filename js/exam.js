// ============================================================
// KCHIMBO+ — MOTOR EXAMEN SIMULACRO
// 60 preguntas según distribución real UNA PUNO
// Puntaje: Correcta +1, Incorrecta -0.25, Blanco 0
// Convertido a escala de 20 puntos
// ============================================================

class ExamenSimulacro {
  constructor(area, preguntas) {
    this.area = area;
    this.todasPreguntas = preguntas;
    this.preguntasExamen = [];
    this.respuestasUsuario = new Array(60).fill(null);
    this.preguntaActual = 0;
    this.totalPreguntas = 60;
    this.iniciado = false;
    this.terminado = false;
    this.timerInterval = null;
    this.tiempoRestanteMs = 180 * 60 * 1000; // 3 horas (UNA PUNO)
    this.resultado = null;
  }

  // ── Seleccionar 60 preguntas según distribución ──
  seleccionarPreguntas() {
    const distribucion = DISTRIBUCION_EXAMEN[this.area] || DISTRIBUCION_EXAMEN.CIE;
    let seleccionadas = [];

    for (const [curso, cantidad] of Object.entries(distribucion)) {
      const disponibles = this.todasPreguntas.filter(
        p => p.curso === curso && (
          p.area === this.area ||
          p.area === 'AMBAS' ||
          (this.area === 'INGENIERÍAS' && p.area === 'CIE') ||
          (this.area === 'SOCIALES' && p.area === 'LETRAS')
        )
      );
      const shuffled = this.shuffle([...disponibles]);
      // Si hay menos preguntas que las requeridas, usar todas las disponibles
      const tomadas = shuffled.slice(0, Math.min(cantidad, shuffled.length));
      seleccionadas.push(...tomadas);
    }

    // Completar hasta 60 si falta (con preguntas extra del área)
    if (seleccionadas.length < 60) {
      const ids = new Set(seleccionadas.map(p => p.id));
      const extras = this.todasPreguntas
        .filter(p => !ids.has(p.id) && (
          p.area === this.area ||
          p.area === 'AMBAS' ||
          (this.area === 'INGENIERÍAS' && p.area === 'CIE') ||
          (this.area === 'SOCIALES' && p.area === 'LETRAS')
        ));
      const shuffledExtras = this.shuffle(extras);
      seleccionadas.push(...shuffledExtras.slice(0, 60 - seleccionadas.length));
    }

    // Mezclar el orden final
    this.preguntasExamen = this.shuffle(seleccionadas).slice(0, 60);
    return this.preguntasExamen;
  }

  // ── Fisher-Yates Shuffle ──
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Iniciar examen ──
  iniciar(onTick, onFinish) {
    this.seleccionarPreguntas();
    this.iniciado = true;
    this.timerInterval = setInterval(() => {
      this.tiempoRestanteMs -= 1000;
      if (this.tiempoRestanteMs <= 0) {
        this.tiempoRestanteMs = 0;
        this.terminar();
        onFinish(this.resultado);
        clearInterval(this.timerInterval);
      }
      if (onTick) onTick(this.tiempoRestanteMs);
    }, 1000);
  }

  // ── Responder pregunta ──
  responder(idx, opcion) {
    this.respuestasUsuario[idx] = opcion;
  }

  // ── Calcular puntaje UNA PUNO ──
  calcularPuntaje() {
    let correctas = 0, incorrectas = 0, blancos = 0;
    const detalle = [];

    this.preguntasExamen.forEach((pregunta, idx) => {
      const respuesta = this.respuestasUsuario[idx];
      const correcta = pregunta.respuesta;

      let estado = 'blanco';
      if (respuesta === null || respuesta === undefined) {
        blancos++;
        estado = 'blanco';
      } else if (respuesta === correcta) {
        correctas++;
        estado = 'correcta';
      } else {
        incorrectas++;
        estado = 'incorrecta';
      }

      detalle.push({
        pregunta,
        respuestaUsuario: respuesta,
        respuestaCorrecta: correcta,
        estado
      });
    });

    // Puntaje bruto (con penalización)
    const puntajeBruto = correctas - (incorrectas * 0.25);
    // Convertir a escala de 20
    const puntaje20 = ((puntajeBruto / 60) * 20).toFixed(2);
    // Porcentaje de aciertos
    const porcentaje = ((correctas / 60) * 100).toFixed(1);

    this.resultado = {
      correctas,
      incorrectas,
      blancos,
      puntajeBruto: Math.max(0, puntajeBruto).toFixed(2),
      puntaje20: Math.max(0, parseFloat(puntaje20)).toFixed(2),
      porcentaje,
      detalle,
      area: this.area,
      fecha: new Date().toISOString().split('T')[0]
    };

    return this.resultado;
  }

  // ── Terminar examen ──
  terminar() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.terminado = true;
    this.calcularPuntaje();

    // Guardar en historial local
    const historial = JSON.parse(localStorage.getItem('kchimbo_historial') || '[]');
    historial.unshift({
      fecha: this.resultado.fecha,
      correctas: this.resultado.correctas,
      incorrectas: this.resultado.incorrectas,
      blanco: this.resultado.blancos,
      puntaje: parseFloat(this.resultado.puntajeBruto),
      area: this.area
    });
    localStorage.setItem('kchimbo_historial', JSON.stringify(historial));

    return this.resultado;
  }

  // ── Formatear tiempo ──
  static formatTime(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  // ── Análisis por curso ──
  analisisPorCurso() {
    if (!this.resultado) return {};
    const cursos = {};
    this.resultado.detalle.forEach(({ pregunta, estado }) => {
      const c = pregunta.curso;
      if (!cursos[c]) cursos[c] = { total: 0, correctas: 0, incorrectas: 0, blancos: 0 };
      cursos[c].total++;
      cursos[c][estado === 'correcta' ? 'correctas' : estado === 'incorrecta' ? 'incorrectas' : 'blancos']++;
    });
    return cursos;
  }
}
