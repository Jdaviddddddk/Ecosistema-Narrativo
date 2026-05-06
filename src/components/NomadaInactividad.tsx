import { useEffect, useState, useRef } from 'react';

interface MensajeNomada {
  id: string;
  texto: string;
  posicion: string;
  duracion: number;
}

const MENSAJES_INACTIVIDAD: MensajeNomada[] = [
  {
    id: 'inactividad-paralisis',
    texto: "Puedes tocar cualquiera. No muerden. Yo ya los conozco. Llevan años flotando sin que nadie los toque.",
    posicion: 'top-6 left-6',
    duracion: 6000,
  },
  {
    id: 'inactividad-noche',
    texto: "Ese que ves ahí... lo hice a las 3 AM. O lo hizo alguien que ahora tiene tu edad. En esa hora, todo parece importante. Después ya no.",
    posicion: 'bottom-6 left-6',
    duracion: 7000,
  },
  {
    id: 'inactividad-verguenza',
    texto: "No pasa nada si no sabes qué hacer. La mayoría de los que hicieron esto tampoco sabían. Solo seguían. Hasta que dejaron de seguir.",
    posicion: 'top-6 right-6',
    duracion: 6000,
  },
  {
    id: 'inactividad-memoria',
    texto: "¿Estás viendo algo que te recuerda a ti? No tiene que ser igual. Solo tiene que haber un eco.",
    posicion: 'bottom-6 right-6',
    duracion: 7000,
  },
];

export default function NomadaInactividad() {
  const [mensajeActivo, setMensajeActivo] = useState<MensajeNomada | null>(null);
  const [mensajesVistos, setMensajesVistos] = useState<Set<string>>(new Set());
  const ultimaActividadRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const actualizarActividad = () => {
      ultimaActividadRef.current = Date.now();

      if (mensajeActivo) {
        setMensajeActivo(null);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        mostrarMensajeInactividad();
      }, 8000);
    };

    window.addEventListener('mousemove', actualizarActividad);
    window.addEventListener('keydown', actualizarActividad);
    window.addEventListener('click', actualizarActividad);
    window.addEventListener('scroll', actualizarActividad);
    window.addEventListener('touchstart', actualizarActividad);

    timeoutRef.current = setTimeout(() => {
      mostrarMensajeInactividad();
    }, 8000);

    return () => {
      window.removeEventListener('mousemove', actualizarActividad);
      window.removeEventListener('keydown', actualizarActividad);
      window.removeEventListener('click', actualizarActividad);
      window.removeEventListener('scroll', actualizarActividad);
      window.removeEventListener('touchstart', actualizarActividad);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mensajeActivo]);

  const mostrarMensajeInactividad = () => {
    const disponibles = MENSAJES_INACTIVIDAD.filter(m => !mensajesVistos.has(m.id));

    if (disponibles.length === 0) {
      setMensajesVistos(new Set());
      const random = MENSAJES_INACTIVIDAD[Math.floor(Math.random() * MENSAJES_INACTIVIDAD.length)];
      activarMensaje(random);
      return;
    }

    const random = disponibles[Math.floor(Math.random() * disponibles.length)];
    activarMensaje(random);
  };

  const activarMensaje = (mensaje: MensajeNomada) => {
    setMensajeActivo(mensaje);
    setMensajesVistos(prev => new Set(prev).add(mensaje.id));

    setTimeout(() => {
      setMensajeActivo(null);
    }, mensaje.duracion);
  };

  if (!mensajeActivo) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className={`
          absolute max-w-xs md:max-w-sm
          rounded-xl px-4 py-3
          shadow-2xl
          pointer-events-auto
          animate-nomada-entra
          ${mensajeActivo.posicion}
        `}
        style={{
          margin: '0 1rem',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(0,79,205,0.15)',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Indicador lateral */}
          <div
            className="w-1 min-h-[2rem] rounded-full shrink-0"
            style={{
              background: 'linear-gradient(to bottom, var(--nexo-primary-light), transparent)',
            }}
          />

          <div className="flex-1">
            <p
              className="text-sm leading-relaxed"
              style={{
                color: 'var(--nexo-dark)',
                fontFamily: 'Montserrat',
              }}
            >
              {mensajeActivo.texto}
            </p>

            {/* Firma */}
            <div className="mt-2 pt-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(0,79,205,0.1)' }}>
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, var(--nexo-primary-light), transparent)',
                  border: '1px solid rgba(0,79,205,0.2)',
                }}
              />
              <span
                className="text-xs uppercase tracking-wider"
                style={{
                  color: 'var(--nexo-primary)',
                  fontFamily: 'Montserrat',
                  fontWeight: 500,
                }}
              >
                — Nómada
              </span>
            </div>
          </div>
        </div>

        {/* Progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
          <div
            className="h-full animate-nomada-progreso"
            style={{
              animationDuration: `${mensajeActivo.duracion}ms`,
              background: 'var(--nexo-primary-light)',
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    </div>
  );
}