export interface Tema {
  id_tema: string;
  id_curso: string;
  slug: string;
  orden: number;
  titulo: string;
  duracion: string;
  video_teoria_url: string;
  video_practica_url?: string;
  pdf_resumen_url?: string;
  pdf_teoria_url?: string;
  pdf_preguntas_url?: string;
  material_url?: string; // Mantener por compatibilidad de tipos antigua
}

export interface Curso {
  id_curso: string;
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  thumbnail_url: string;
  nivel: "Secundaria" | "Preuniversitario" | "Universitario";
  carrera?: string;
  temas?: Tema[];
}

export const MOCK_CURSOS: Curso[] = [
  // --------------------------------------------------
  // NIVEL SECUNDARIA (BÁSICO)
  // --------------------------------------------------
  {
    id_curso: "sec_1",
    slug: "biologia-secundaria",
    titulo: "Biología Escolar",
    descripcion: "Estudio básico de los seres vivos, reinos de la naturaleza y ecología para nivel secundaria.",
    categoria: "Ciencias",
    thumbnail_url: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&auto=format&fit=crop&q=60",
    nivel: "Secundaria",
    temas: [
      {
        id_tema: "sec_1_1",
        id_curso: "sec_1",
        slug: "introduccion-biologia",
        orden: 1,
        titulo: "Introducción a las Ciencias Biológicas",
        duracion: "10 min",
        video_teoria_url: "https://www.youtube.com/embed/cIEd-Uua3Y8",
        video_practica_url: "https://www.youtube.com/embed/cIEd-Uua3Y8",
        pdf_resumen_url: "https://drive.google.com/file/d/12l6Xl3k5k1zOcVPechK84Wwll9tgVQd_/view?usp=sharing",
        pdf_teoria_url: "https://drive.google.com/file/d/12l6Xl3k5k1zOcVPechK84Wwll9tgVQd_/view?usp=sharing",
        pdf_preguntas_url: "https://drive.google.com/file/d/12l6Xl3k5k1zOcVPechK84Wwll9tgVQd_/view?usp=sharing"
      },
      {
        id_tema: "sec_1_2",
        id_curso: "sec_1",
        slug: "los-reinos-vivos",
        orden: 2,
        titulo: "Los Cinco Reinos de la Naturaleza",
        duracion: "12 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        pdf_resumen_url: "https://drive.google.com/file/d/12s345_67890/preview"
      }
    ]
  },
  {
    id_curso: "sec_2",
    slug: "aritmetica-secundaria",
    titulo: "Aritmética Básica",
    descripcion: "Fundamentos de números racionales, operaciones básicas y razones y proporciones para secundaria.",
    categoria: "Matemáticas",
    thumbnail_url: "https://images.unsplash.com/photo-1453733190148-c44698c265f8?w=800&auto=format&fit=crop&q=60",
    nivel: "Secundaria",
    temas: [
      {
        id_tema: "sec_2_1",
        id_curso: "sec_2",
        slug: "teoria-conjuntos",
        orden: 1,
        titulo: "Teoría de Conjuntos y Números Naturales",
        duracion: "15 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        video_practica_url: "https://www.youtube.com/embed/V6W4eGZ-VpI"
      }
    ]
  },

  // --------------------------------------------------
  // NIVEL PREUNIVERSITARIO (INTERMEDIO)
  // --------------------------------------------------
  {
    id_curso: "pre_1",
    slug: "anatomia-preuniversitario",
    titulo: "Anatomía Humana Pre",
    descripcion: "Revisión completa de los sistemas anatómicos requeridos para los exámenes de admisión médica.",
    categoria: "Ciencias",
    thumbnail_url: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=800&auto=format&fit=crop&q=60",
    nivel: "Preuniversitario",
    temas: [
      {
        id_tema: "pre_1_1",
        id_curso: "pre_1",
        slug: "aparato-locomotor",
        orden: 1,
        titulo: "El Aparato Locomotor: Huesos y Músculos",
        duracion: "18 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        video_practica_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        pdf_resumen_url: "https://drive.google.com/file/d/12s345_67890/preview",
        pdf_teoria_url: "https://drive.google.com/file/d/12s345_67890/preview",
        pdf_preguntas_url: "https://drive.google.com/file/d/12s345_67890/preview"
      },
      {
        id_tema: "pre_1_2",
        id_curso: "pre_1",
        slug: "sistema-digestivo",
        orden: 2,
        titulo: "Fisiología y Morfología del Sistema Digestivo",
        duracion: "20 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        pdf_resumen_url: "https://drive.google.com/file/d/12s345_67890/preview"
      }
    ]
  },
  {
    id_curso: "pre_2",
    slug: "quimica-preuniversitaria",
    titulo: "Química Orgánica e Inorgánica",
    descripcion: "Estructura atómica, tabla periódica, enlaces químicos y nomenclatura para el examen de admisión.",
    categoria: "Ciencias",
    thumbnail_url: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?w=800&auto=format&fit=crop&q=60",
    nivel: "Preuniversitario",
    temas: [
      {
        id_tema: "pre_2_1",
        id_curso: "pre_2",
        slug: "materia-atomo",
        orden: 1,
        titulo: "Estructura Atómica y Modelos Atómicos",
        duracion: "15 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        video_practica_url: "https://www.youtube.com/embed/V6W4eGZ-VpI"
      }
    ]
  },

  // --------------------------------------------------
  // NIVEL UNIVERSITARIO (AVANZADO)
  // --------------------------------------------------
  {
    id_curso: "univ_1",
    slug: "anatomia-humana-universitaria",
    titulo: "Anatomía Clínica y Disección",
    descripcion: "Estudio exhaustivo de la anatomía regional y segmentaria del cuerpo humano con enfoque clínico quirúrgico.",
    categoria: "Anatomía",
    thumbnail_url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=60",
    nivel: "Universitario",
    carrera: "Medicina Humana",
    temas: [
      {
        id_tema: "univ_1_1",
        id_curso: "univ_1",
        slug: "neuroanatomia-base",
        orden: 1,
        titulo: "Neuroanatomía: Médula Espinal y Tronco Encefálico",
        duracion: "25 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        video_practica_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        pdf_resumen_url: "https://drive.google.com/file/d/12s345_67890/preview",
        pdf_teoria_url: "https://drive.google.com/file/d/12s345_67890/preview",
        pdf_preguntas_url: "https://drive.google.com/file/d/12s345_67890/preview"
      },
      {
        id_tema: "univ_1_2",
        id_curso: "univ_1",
        slug: "anatomia-mediastino",
        orden: 2,
        titulo: "Mediastino: Límites, Contenido y Anatomía Cardiaca",
        duracion: "30 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI"
      }
    ]
  },
  {
    id_curso: "univ_3",
    slug: "resistencia-materiales-civil",
    titulo: "Resistencia de Materiales I",
    descripcion: "Esfuerzos, deformaciones elementales, flexión y torsión en elementos estructurales e ingeniería estructural.",
    categoria: "Estructuras",
    thumbnail_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=800&auto=format&fit=crop&q=60",
    nivel: "Universitario",
    carrera: "Ingeniería Civil",
    temas: [
      {
        id_tema: "univ_3_1",
        id_curso: "univ_3",
        slug: "esfuerzo-axial",
        orden: 1,
        titulo: "Esfuerzo Axial y Deformación Lineal",
        duracion: "20 min",
        video_teoria_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        video_practica_url: "https://www.youtube.com/embed/V6W4eGZ-VpI",
        pdf_resumen_url: "https://drive.google.com/file/d/12s345_67890/preview",
        pdf_teoria_url: "https://drive.google.com/file/d/12s345_67890/preview",
        pdf_preguntas_url: "https://drive.google.com/file/d/12s345_67890/preview"
      }
    ]
  }
];
