// ============================================================
// KCHIMBO+ — MOTOR REPASOS POR CURSO Y TEMA
// ============================================================

class ModoRepaso {
  constructor(preguntas, curso, tema = null) {
    this.todasPreguntas = preguntas;
    this.curso = curso;
    this.tema = tema;
    this.preguntasFiltradas = [];
    this.idx = 0;
    this.correctas = 0;
    this.incorrectas = 0;
    this.respondidas = 0;
    this.respondidaActual = false;
  }

  // ── Filtrar y mezclar preguntas ──
  preparar() {
    let filtradas = this.todasPreguntas.filter(p => p.curso === this.curso);
    if (this.tema) filtradas = filtradas.filter(p => p.tema === this.tema);

    // Mezclar aleatoriamente
    this.preguntasFiltradas = this.shuffle([...filtradas]);
    return this.preguntasFiltradas.length;
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  get total() { return this.preguntasFiltradas.length; }
  get actual() { return this.preguntasFiltradas[this.idx]; }
  get terminado() { return this.idx >= this.total; }
  get porcentaje() {
    if (this.respondidas === 0) return 0;
    return Math.round((this.correctas / this.respondidas) * 100);
  }

  // ── Responder ──
  responder(opcion) {
    if (this.respondidaActual) return null;
    this.respondidaActual = true;
    const correcta = this.actual.respuesta === opcion;
    this.respondidas++;
    if (correcta) this.correctas++;
    else this.incorrectas++;
    return { correcta, respuestaCorrecta: this.actual.respuesta };
  }

  // ── Siguiente pregunta ──
  siguiente() {
    this.idx++;
    this.respondidaActual = false;
  }

  // ── Estadísticas ──
  getStats() {
    return {
      total: this.total,
      respondidas: this.respondidas,
      correctas: this.correctas,
      incorrectas: this.incorrectas,
      pendientes: this.total - this.respondidas,
      porcentaje: this.porcentaje
    };
  }
}
