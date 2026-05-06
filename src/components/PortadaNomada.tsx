import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

interface PortadaNomadaProps {
  onComenzar: () => void;
}

export default function PortadaNomada({ onComenzar }: PortadaNomadaProps) {
  const [fase, setFase] = useState<'oscuridad' | 'titulo' | 'argumento' | 'personaje' | 'funcion' | 'invitacion'>('oscuridad');
  const containerRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const textoRef = useRef<HTMLParagraphElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const secuencia = [
      { fase: 'oscuridad', delay: 0 },
      { fase: 'titulo', delay: 1500 },
      { fase: 'argumento', delay: 4000 },
      { fase: 'personaje', delay: 9000 },
      { fase: 'funcion', delay: 14000 },
      { fase: 'invitacion', delay: 19000 },
    ];

    secuencia.forEach(({ fase, delay }) => {
      setTimeout(() => setFase(fase as any), delay);
    });
  }, []);

  useEffect(() => {
    if (fase === 'titulo' && tituloRef.current) {
      gsap.fromTo(
        tituloRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power2.out' }
      );
    }

    if (fase === 'argumento' && textoRef.current) {
      gsap.fromTo(
        textoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
    }

    if (fase === 'invitacion' && botonRef.current) {
      gsap.fromTo(
        botonRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, [fase]);

  const handleComenzar = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: onComenzar,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--nexo-dark)' }}
    >
      {/* Partículas */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'var(--nexo-primary-light)',
              opacity: 0.3,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* FASE OSCURIDAD */}
      {fase === 'oscuridad' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full animate-pulse-slow"
            style={{ background: 'var(--nexo-primary-light)' }}
          />
        </div>
      )}

      {/* Label */}
      {fase !== 'oscuridad' && (
        <div className="absolute top-8 left-8">
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase">
            Ecosistema Narrativo
          </p>
        </div>
      )}

      <div className="relative z-10 max-w-2xl px-8 text-center">

        {/* TÍTULO */}
        {fase === 'titulo' && (
          <h1
            ref={tituloRef}
            className="text-4xl md:text-6xl leading-tight opacity-0 font-['Sono']"
            style={{ color: 'white' }}
          >
            La universidad no tiene
            <br />
            <span style={{ color: 'var(--nexo-primary-light)' }}>
              amnesia académica
            </span>
          </h1>
        )}

        {/* ARGUMENTO */}
        {fase !== 'oscuridad' && fase !== 'titulo' && (
          <div>
            <h1 className="text-3xl md:text-5xl mb-8 font-['Sono']" style={{ color: 'white' }}>
              La universidad no tiene
              <br />
              <span style={{ color: 'var(--nexo-primary-light)' }}>
                amnesia académica
              </span>
            </h1>

            <p
              ref={textoRef}
              className="text-lg md:text-xl leading-relaxed opacity-0"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Tiene <span style={{ color: 'white' }}>amnesia emocional</span>.
              No olvida los proyectos, olvida los procesos.
              No pierde los archivos, pierde los testigos.
              Este ecosistema no es una plataforma de exhibición.
              Es un{' '}
              <span style={{ color: 'var(--nexo-primary-light)' }}>
                sistema de memoria viva
              </span>{' '}
              donde los proyectos incompletos tienen derecho a existir antes de ser perfectos.
            </p>
          </div>
        )}

        {/* PERSONAJE */}
        {(fase === 'personaje' || fase === 'funcion' || fase === 'invitacion') && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--nexo-primary-light)' }}>
              Nómada
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Soy el espacio entre empezar y abandonar.
            </p>
          </div>
        )}

        {/* FUNCIÓN */}
        {(fase === 'funcion' || fase === 'invitacion') && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {['Testigo', 'Sembrador', 'Habitante'].map((rol, i) => (
              <div
                key={i}
                className="nexo-card p-4"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="mb-2" style={{ color: 'white' }}>{rol}</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {rol === 'Testigo' && 'Ver procesos invisibles.'}
                  {rol === 'Sembrador' && 'Dejar algo real, aunque incompleto.'}
                  {rol === 'Habitante' && 'Encontrar eco en lo ajeno.'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* INVITACIÓN */}
        {fase === 'invitacion' && (
          <div className="mt-12">
            <button
              ref={botonRef}
              onClick={handleComenzar}
              className="nexo-btn nexo-btn-outline opacity-0 animate-pulse-glow"
            >
              Entrar al ecosistema
            </button>

            <p className="mt-6 text-xs text-white/40">
              No necesitas subir nada. Solo estar.
            </p>
          </div>
        )}
      </div>

      {/* PROGRESO */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {['oscuridad', 'titulo', 'argumento', 'personaje', 'funcion', 'invitacion'].map((f, i) => {
          const fasesIndex = ['oscuridad', 'titulo', 'argumento', 'personaje', 'funcion', 'invitacion'];
          const activo = fasesIndex.indexOf(fase) >= i;

          return (
            <div
              key={f}
              className="w-8 h-0.5 rounded-full transition-all duration-700"
              style={{
                background: activo
                  ? 'var(--nexo-primary-light)'
                  : 'rgba(255,255,255,0.1)',
                opacity: activo ? 0.6 : 1,
              }}
            />
          );
        })}
      </div>

      {/* Animaciones */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.5); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          33% { transform: translate(20px, -30px); opacity: 0.5; }
          66% { transform: translate(-10px, 15px); opacity: 0.3; }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}