import { useState, useEffect, useCallback } from 'react';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type NomadaEscena =
  | 'bienvenida'
  | 'primer-proyecto'
  | 'interaccion'
  | 'explorar'
  | 'perfil';

interface Paso {
  texto: string;
  accion?: string;
}

interface GuiaConfig {
  titulo: string;
  pasos: Paso[];
  svgSrc: string;
  posicion: 'left' | 'right' | 'center';
  storageKey: string;
}

// ─── Contenido por escena ────────────────────────────────────────────────────

const GUIAS: Record<NomadaEscena, GuiaConfig> = {
  bienvenida: {
    titulo: 'Hola. Soy Nómada.',
    pasos: [
      {
        texto: 'Soy el guardián de este ecosistema. Los trabajos que ves flotando ahí... los rescaté del olvido. Cada uno tiene una historia que casi se pierde.',
      },
      {
        texto: 'Puedes hacer clic en cualquier imagen para ver de qué trata. O simplemente observar. Los proyectos no desaparecen si no los tocas — esa es la idea.',
      },
      {
        texto: 'Si eres estudiante de DDM, puedes subir tu propio trabajo. Yo me encargo de que no se pierda.',
        accion: 'Explorar proyectos →',
      },
    ],
    svgSrc: '/images/nomada/nomada-waving.svg',
    posicion: 'right',
    storageKey: 'nomada_bienvenida_vista',
  },
  'primer-proyecto': {
    titulo: '¿Tu primera vez aquí?',
    pasos: [
      {
        texto: 'Subir un proyecto es decirle al tiempo que exististe. Que pensaste algo, lo construiste, y vale la pena que otros lo vean.',
      },
      {
        texto: 'Ponle un título que lo identifique. Sube al menos una imagen — sin eso, nadie puede ver de qué se trata. Cuéntanos la historia de origen: ¿por qué lo hiciste?',
      },
      {
        texto: 'El link de prototipo es obligatorio. Si tienes algo en Figma, YouTube o cualquier otro lugar, ponlo. Que se pueda experimentar, no solo ver.',
        accion: 'Entendido, continuar',
      },
    ],
    svgSrc: '/images/nomada/nomada-scroll.svg',
    posicion: 'left',
    storageKey: 'nomada_upload_visto',
  },
  interaccion: {
    titulo: 'Las reacciones importan.',
    pasos: [
      {
        texto: '¿Ves los botones 💡📚⭐🚧 debajo del título? Son formas de decirle al autor que su trabajo llegó a alguien.',
      },
      {
        texto: '"Me inspira" no es solo un clic. Es registrar que algo te movió. Eso queda en el perfil del creador — un conteo real de cuántas personas conectaron con su trabajo.',
      },
      {
        texto: 'Puedes reaccionar más de una vez a diferentes proyectos. Yo llevo el registro.',
        accion: 'Reaccionar ahora',
      },
    ],
    svgSrc: '/images/nomada/nomada-sitting.svg',
    posicion: 'right',
    storageKey: 'nomada_interaccion_vista',
  },
  explorar: {
    titulo: 'Todo está aquí.',
    pasos: [
      {
        texto: 'Puedes filtrar por categoría — diseño de marca, fotografía, cortometraje, lo que sea. Cada área tiene su propia forma de contar.',
      },
      {
        texto: 'El buscador encuentra proyectos por título o por autor. Si sabes que alguien de tu semestre subió algo, encuéntralo.',
      },
      {
        texto: 'No hay un orden correcto para explorar. Solo hay proyectos esperando a que alguien los vea.',
        accion: 'Explorar todo',
      },
    ],
    svgSrc: '/images/nomada/nomada-standing.svg',
    posicion: 'left',
    storageKey: 'nomada_explorar_visto',
  },
  perfil: {
    titulo: 'Tu espacio.',
    pasos: [
      {
        texto: 'Aquí viven todos tus proyectos. El contador de reacciones muestra cuántas veces tu trabajo conectó con alguien — eso es real, no decorativo.',
      },
      {
        texto: 'Puedes editar tu bio, agregar tu ubicación, y registrar tus áreas de interés. No es un formulario burocrático — es cómo te presentas ante el ecosistema.',
      },
      {
        texto: 'Sube más proyectos. Cada uno es un fragmento de tu historia académica que yo me encargo de no dejar perder.',
        accion: 'Subir proyecto',
      },
    ],
    svgSrc: '/images/nomada/nomada-waving.svg',
    posicion: 'right',
    storageKey: 'nomada_perfil_visto',
  },
};

// ─── Componente ──────────────────────────────────────────────────────────────

interface NomadaGuiaProps {
  escena: NomadaEscena;
  onAccion?: () => void;
  forzar?: boolean; // para preview/testing
}

export default function NomadaGuia({ escena, onAccion, forzar = false }: NomadaGuiaProps) {
  const config = GUIAS[escena];
  const [visible, setVisible] = useState(false);
  const [paso, setPaso] = useState(0);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const yaVisto = localStorage.getItem(config.storageKey);
    if (!yaVisto || forzar) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [config.storageKey, forzar]);

  const cerrar = useCallback(() => {
    setSaliendo(true);
    setTimeout(() => {
      setVisible(false);
      setSaliendo(false);
      localStorage.setItem(config.storageKey, 'true');
    }, 400);
  }, [config.storageKey]);

  const siguiente = useCallback(() => {
    if (paso < config.pasos.length - 1) {
      setPaso(p => p + 1);
    } else {
      if (onAccion) onAccion();
      cerrar();
    }
  }, [paso, config.pasos.length, onAccion, cerrar]);

  if (!visible) return null;

  const pasoActual = config.pasos[paso];
  const esUltimo = paso === config.pasos.length - 1;
  const isLeft = config.posicion === 'left';

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Fondo semi-transparente suave */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
          opacity: saliendo ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
        onClick={cerrar}
      />

      {/* Card de Nómada */}
      <div
        className="pointer-events-auto"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0px',
          flexDirection: 'row',
          maxWidth: '520px',
          margin: '0 auto',
          // En desktop: posicionar a la izquierda o derecha
          ...(typeof window !== 'undefined' && window.innerWidth >= 640
            ? {
                left: isLeft ? '40px' : 'auto',
                right: isLeft ? 'auto' : '40px',
                flexDirection: isLeft ? 'row' : 'row-reverse',
                maxWidth: '480px',
              }
            : {}),
          opacity: saliendo ? 0 : 1,
          transform: saliendo ? 'translateY(20px) scale(0.95)' : 'translateY(0) scale(1)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: saliendo ? 'none' : 'nomada-entra 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* SVG de Nómada */}
        <div style={{ width: '100px', flexShrink: 0, position: 'relative', zIndex: 1 }}
          className="sm:w-40"
        >
          <img
            src={config.svgSrc}
            alt="Nómada"
            style={{
              width: '100%',
              height: 'auto',
              filter: 'drop-shadow(0 8px 24px rgba(0,79,205,0.25))',
              animation: 'nomada-float 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Burbuja de diálogo */}
        <div
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(0,79,205,0.15)',
            boxShadow: '0 12px 40px rgba(0,79,205,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            padding: '16px 18px',
            flex: 1,
            minWidth: 0,
            maxWidth: '360px',
            marginBottom: '12px',
          }}
        >
          {/* Línea superior de color */}
          <div style={{
            position: 'absolute', top: 0, left: '20px', right: '20px', height: '3px',
            background: 'linear-gradient(90deg, #004FCD, #3b7de8)',
            borderRadius: '0 0 3px 3px', opacity: 0.7,
          }} />

          {/* Botón cerrar */}
          <button
            onClick={cerrar}
            style={{
              position: 'absolute', top: '12px', right: '14px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#aaa', fontSize: '18px', lineHeight: 1, padding: '4px',
            }}
          >×</button>

          {/* Título */}
          <p style={{
            fontFamily: "'Sono', sans-serif", fontSize: '16px', fontWeight: 700,
            color: '#004FCD', marginBottom: '10px',
          }}>
            {config.titulo}
          </p>

          {/* Texto del paso */}
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#333', marginBottom: '18px' }}>
            {pasoActual.texto}
          </p>

          {/* Indicador de pasos */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {config.pasos.map((_, i) => (
              <div
                key={i}
                style={{
                  height: '3px',
                  flex: 1,
                  borderRadius: '2px',
                  background: i <= paso ? 'linear-gradient(90deg, #004FCD, #3b7de8)' : 'rgba(0,0,0,0.1)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {paso > 0 && (
              <button
                onClick={() => setPaso(p => p - 1)}
                style={{
                  padding: '8px 14px', borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.1)', background: 'transparent',
                  fontSize: '12px', color: '#666', cursor: 'pointer',
                }}
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={siguiente}
              style={{
                flex: 1, padding: '10px 18px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #004FCD, #3b7de8)',
                border: 'none', color: '#fff', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,79,205,0.3)',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {esUltimo ? (pasoActual.accion || 'Entendido ✓') : 'Siguiente →'}
            </button>
          </div>

          {/* Firma */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginTop: '14px', paddingTop: '10px',
            borderTop: '1px solid rgba(0,79,205,0.08)',
          }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b7de8, #004FCD)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', color: '#fff', fontFamily: "'Sono', sans-serif", fontWeight: 700,
            }}>N</div>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#004FCD', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              — Nómada · Guardián de Nexo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
