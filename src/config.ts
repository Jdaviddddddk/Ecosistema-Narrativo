export interface SiteConfig {
  language: string;
  brandName: string;
  copyright: string;
}

export interface NavigationConfig {
  infoLinkLabel: string;
}

export interface ContactEntry {
  label: string;
  value: string;
  href?: string;
}

export interface InfoPageConfig {
  backLinkLabel: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  contactLabel: string;
  contactEntries: ContactEntry[];
}

export interface OverlayConfig {
  frameDetailLabel: string;
  fileLabel: string;
  seriesLabel: string;
  closeLabel: string;
}

export interface ImageItem {
  src: string;
  category: string;
  title: string;
  description: string;
}

export interface GalleryConfig {
  images: ImageItem[];
}

export const siteConfig: SiteConfig = {
  language: "es-CO",
  brandName: "VÓRTEX",
  copyright: "© 2026 Universidad Colegio Mayor de Cundinamarca — Diseño Digital y Multimedia",
};

export const navigationConfig: NavigationConfig = {
  infoLinkLabel: "Ecosistema",
};

export const infoPageConfig: InfoPageConfig = {
  backLinkLabel: "Volver",
  eyebrow: "Sobre el Proyecto — Universidad Colegio Mayor de Cundinamarca",
  title: "Un ecosistema digital que da visibilidad a los proyectos académicos del programa de Diseño Digital y Multimedia.",
  paragraphs: [
    "El programa de Diseño Digital y Multimedia carecía de espacios digitales estructurados que permitieran la divulgación, organización y preservación de proyectos académicos estudiantiles. Esto generaba baja circulación de trabajos, limitación del reconocimiento académico, pérdida progresiva de proyectos y dificultad para construir memoria colectiva.",
    "Vórtex nace como respuesta: una plataforma donde los estudiantes actúan como prosumidores — productores y consumidores de contenido — validando su talento, recibiendo retroalimentación y construyendo una identidad visual colectiva. Profesores curadores, egresados que dejan su legado y una comunidad que apoya el crecimiento creativo.",
    "La metodología incluyó investigación con encuestas y entrevistas, análisis de benchmarking, talleres de co-creación con estudiantes, y prototipado iterativo. Los resultados evidencian la necesidad de una interfaz intuitiva, bien organizada por categorías, donde los proyectos sean los protagonistas.",
    "Este es un prototipo funcional destinado a testeo con usuarios. El acceso está restringido a correos institucionales @universidadmayor.edu.co para garantizar que el espacio pertenezca a la comunidad académica."
  ],
  contactLabel: "Contacto",
  contactEntries: [
    {
      label: "Programa",
      value: "Diseño Digital y Multimedia",
    },
    {
      label: "Institución",
      value: "Universidad Colegio Mayor de Cundinamarca",
    },
    {
      label: "Ciudad",
      value: "Bogotá, Colombia",
    },
    {
      label: "Repositorio",
      value: "GitHub /vortex-ecosistema",
      href: "#",
    },
  ],
};

export const overlayConfig: OverlayConfig = {
  frameDetailLabel: "Proyecto",
  fileLabel: "Archivo",
  seriesLabel: "Categoría",
  closeLabel: "Cerrar",
};

export const galleryConfig: GalleryConfig = {
  images: [
    {
      src: "/images/proyecto_01.jpg",
      category: "Diseño Editorial",
      title: "Solstice — Revista Experimental",
      description: "Diseño editorial para una revista que explora la intersección entre creatividad y cosmos. El proyecto incluyó dirección de arte, maquetación tipográfica y selección curada de fotografía. Pieza de portafolio de noveno semestre que demuestra dominio de jerarquías visuales y sistemas de cuadrícula."
    },
    {
      src: "/images/proyecto_02.jpg",
      category: "Ilustración Digital",
      title: "Fragmentos — Retrato Abstracto",
      description: "Ilustración digital que fusiona retrato fotorealista con elementos geométricos abstractos. Inspirada en la identidad cultural colombiana, explora la descomposición y reconstrucción de la identidad a través de formas y colores vibrantes. Proyecto personal que busca construir comunidad a través del arte."
    },
    {
      src: "/images/proyecto_03.jpg",
      category: "Branding",
      title: "Café Andino — Identidad Visual",
      description: "Sistema de identidad visual completo para una marca de café de origen andino. Incluye diseño de logotipo, papelería corporativa, packaging y manual de marca. El proyecto resalta el valor del diseño estratégico aplicado al comercio local y la sostenibilidad."
    },
    {
      src: "/images/proyecto_04.jpg",
      category: "UX/UI",
      title: "Culturale — App de Eventos",
      description: "Diseño de experiencia e interfaz para una aplicación móvil de descubrimiento de eventos culturales. El proyecto abarca research, wireframes, prototipado en Figma y pruebas de usabilidad. Destaca por su enfoque en la accesibilidad y la navegación intuitiva."
    },
    {
      src: "/images/proyecto_05.jpg",
      category: "Concept Art",
      title: "Neo-Bogotá — Ciudad Futurista",
      description: "Pintura digital de concept art que imagina una Bogotá futurista donde la arquitectura colonial se fusiona con tecnología cyberpunk. Proyecto de séptimo semestre que demuestra habilidades en composición, iluminación dramática y worldbuilding visual para entretenimiento digital."
    },
    {
      src: "/images/proyecto_06.jpg",
      category: "Tipografía",
      title: "Deconstrucción Tipográfica",
      description: "Cartel experimental que explora la superposición y fragmentación de tipografías contrastantes. El proyecto investiga la legibilidad, la jerarquía y la expresión emocional a través de la forma tipográfica. Impreso en formato grande para exposición en galería universitaria."
    },
    {
      src: "/images/proyecto_07.jpg",
      category: "Modelado 3D",
      title: "Aurora — Render de Producto",
      description: "Visualización hiperrealista de un diseño de audífonos inalámbricos. Modelado 3D, texturizado PBR, iluminación de estudio y post-producción. El proyecto demuestra competencias en diseño industrial digital y comunicación visual de producto."
    },
    {
      src: "/images/proyecto_08.jpg",
      category: "Motion Graphics",
      title: "Flujo — Animación Experimental",
      description: "Pieza de motion graphics que explora la fluidez de formas líquidas y partículas en movimiento. Combinación de técnicas de animación 3D y composición digital. El proyecto busca expresar la continuidad del proceso creativo a través del movimiento."
    },
    {
      src: "/images/proyecto_09.jpg",
      category: "Fotografía",
      title: "Éter — Retrato en Movimiento",
      description: "Serie fotográfica que captura el movimiento de la danza mediante exposición larga. La técnica crea trazas de luz que envuelven al sujeto, transformando el movimiento corporal en pintura lumínica. Proyecto que une fotografía, performance y diseño."
    },
    {
      src: "/images/proyecto_10.jpg",
      category: "Diseño de Personajes",
      title: "Guerrera Andina — Character Design",
      description: "Diseño de personaje para videojuego que fusiona iconografía precolombina con elementos de ciencia ficción. Incluye diseño de vestuario, armadura, paleta de colores y hoja de turnaround. Proyecto de octavo semestre orientado a la industria del entretenimiento digital."
    },
    {
      src: "/images/proyecto_11.jpg",
      category: "Diseño Digital",
      title: "Raíces — Campaña Sostenible",
      description: "Campaña integral de diseño digital para una marca de moda sostenible. Incluye diseño de posts para redes sociales, stories animadas y piezas publicitarias digitales. El proyecto demuestra la aplicación del diseño en la comunicación responsable y consciente."
    },
    {
      src: "/images/proyecto_12.jpg",
      category: "Arte Digital",
      title: "Lumina — Instalación Interactiva",
      description: "Documentación de una instalación de arte digital interactiva que utiliza proyección mapeada y sensores de movimiento. Los visitantes generan patrones geométricos de luz con sus gestos. Proyecto de new media que explora la relación entre tecnología, espacio y participación."
    },
  ],
};
