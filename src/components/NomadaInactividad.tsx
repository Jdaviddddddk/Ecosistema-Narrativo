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
          absolute nomada-card
          animate-nomada-entra
          ${mensajeActivo.posicion}
        `}
      >
        <p className="nomada-text">
          {mensajeActivo.texto}
        </p>

        <div className="nomada-signature">
          <div className="nomada-avatar" />
          <span className="nomada-name">— Nómada</span>
        </div>

        {/* Progreso */}
        <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full overflow-hidden">
          <div
            className="h-full animate-nomada-progreso rounded-full"
            style={{
              animationDuration: `${mensajeActivo.duracion}ms`,
              background: 'linear-gradient(90deg, var(--nexo-primary), var(--nexo-primary-light))',
            }}
          />
        </div>
      </div>
    </div>
  );
}