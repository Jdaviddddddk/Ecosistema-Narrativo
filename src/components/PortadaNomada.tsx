import { useEffect, useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

interface PortadaNomadaProps {
  onComenzar: () => void;
}

type Fase = 'oscuridad' | 'titulo' | 'argumento' | 'personaje' | 'funcion' | 'invitacion';

const FASES: { fase: Fase; delay: number }[] = [
  { fase: 'oscuridad',  delay: 0     },
  { fase: 'titulo',     delay: 800   },
  { fase: 'argumento',  delay: 3200  },
  { fase: 'personaje',  delay: 6200  },
  { fase: 'funcion',    delay: 8800  },
  { fase: 'invitacion', delay: 11500 },
];

const TOTAL_MS = 14000;

export default function PortadaNomada({ onComenzar }: PortadaNomadaProps) {
  const [fase, setFase] = useState<Fase>('oscuridad');
  const [progreso, setProgreso] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ─── Secuencia de fases ───────────────────────────────────────────────────
  useEffect(() => {
    FASES.forEach(({ fase, delay }) => {
      const t = setTimeout(() => setFase(fase), delay);
      timersRef.current.push(t);
    });

    // Progreso continuo
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgreso(Math.min(elapsed / TOTAL_MS, 1));
      if (elapsed >= TOTAL_MS) clearInterval(tick);
    }, 50);

    return () => {
      timersRef.current.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, []);

  // ─── Salir ────────────────────────────────────────────────────────────────
  const salir = useCallback(() => {
    if (saliendo) return;
    setSaliendo(true);
    timersRef.current.forEach(clearTimeout);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: onComenzar,
      });
    } else {
      onComenzar();
    }
  }, [saliendo, onComenzar]);

  // ─── Helpers de visibilidad ───────────────────────────────────────────────
  const fasesOrden: Fase[] = ['oscuridad','titulo','argumento','personaje','funcion','invitacion'];
  const faseIdx = fasesOrden.indexOf(fase);
  const after = (f: Fase) => faseIdx >= fasesOrden.indexOf(f);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex overflow-hidden select-none"
      style={{ background: '#080c14' }}
    >

      {/* ── Partículas de fondo ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${5 + (i * 5.3) % 92}%`,
              top: `${8 + (i * 7.1) % 85}%`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
              background: i % 4 === 0 ? '#5df3f0' : '#3b7de8',
              opacity: 0.15 + (i % 5) * 0.06,
              animation: `particula-float ${9 + (i % 6)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.7) % 8}s`,
            }}
          />
        ))}
        {/* Glow de fondo */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,79,205,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93,243,240,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      {/* ── Label top-left ──────────────────────────────────────────────── */}
      <div
        className="absolute top-8 left-8 z-20"
        style={{
          opacity: after('titulo') ? 1 : 0,
          transform: after('titulo') ? 'translateX(0)' : 'translateX(-20px)',
          transition: 'all 0.8s ease',
        }}
      >
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '10px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        }}>
          Ecosistema Narrativo · DDM
        </p>
      </div>

      {/* ── Botón saltar ────────────────────────────────────────────────── */}
      <button
        onClick={salir}
        style={{
          position: 'absolute', top: '28px', right: '32px', zIndex: 20,
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '100px', padding: '8px 18px',
          cursor: 'pointer', backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          opacity: after('titulo') ? 1 : 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
      >
        Saltar →
      </button>

      {/* ── Layout principal: texto izquierda / Nómada derecha ─────────── */}
      <div className="relative z-10 w-full flex items-center justify-between px-12 md:px-24">

        {/* COLUMNA IZQUIERDA — texto */}
        <div style={{ maxWidth: '560px', flex: '1' }}>

          {/* Punto inicial */}
          {fase === 'oscuridad' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#3b7de8',
                animation: 'parpadeo 1.5s ease-in-out infinite',
              }} />
            </div>
          )}

          {/* TÍTULO */}
          <div style={{
            opacity: after('titulo') ? 1 : 0,
            transform: after('titulo') ? 'translateX(0)' : 'translateX(-40px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <h1 style={{
              fontFamily: "'Sono', sans-serif",
              fontSize: 'clamp(28px, 4.5vw, 52px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              La universidad no tiene
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #3b7de8, #5df3f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                amnesia académica
              </span>
            </h1>
          </div>

          {/* ARGUMENTO */}
          <div style={{
            opacity: after('argumento') ? 1 : 0,
            transform: after('argumento') ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            marginTop: after('argumento') ? '20px' : '0',
          }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(13px, 1.4vw, 16px)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.6)',
            }}>
              Tiene <span style={{ color: '#fff' }}>amnesia emocional</span>.
              {' '}No olvida los proyectos, olvida los procesos.
              <br />
              Este ecosistema es un{' '}
              <span style={{ color: '#5df3f0' }}>sistema de memoria viva</span>
              {' '}donde los proyectos incompletos tienen derecho a existir.
            </p>
          </div>

          {/* PERSONAJE — línea de Nómada */}
          <div style={{
            opacity: after('personaje') ? 1 : 0,
            transform: after('personaje') ? 'translateX(0)' : 'translateX(-24px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            marginTop: after('personaje') ? '28px' : '0',
            paddingLeft: '16px',
            borderLeft: '2px solid rgba(59,125,232,0.4)',
          }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '11px', fontWeight: 600,
              color: '#3b7de8', textTransform: 'uppercase',
              letterSpacing: '0.12em', marginBottom: '6px',
            }}>Nómada · Guardián de Nexo</p>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '14px', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.6,
            }}>
              "Soy el espacio entre empezar y abandonar.
              <br />Recojo lo que casi se pierde."
            </p>
          </div>

          {/* ROLES */}
          <div style={{
            display: 'flex', gap: '10px', marginTop: '24px',
            opacity: after('funcion') ? 1 : 0,
            transform: after('funcion') ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {[
              { rol: 'Testigo',    desc: 'Ve lo invisible',        color: '#3b7de8' },
              { rol: 'Guardián',   desc: 'Preserva lo olvidado',   color: '#5df3f0' },
              { rol: 'Conexión',   desc: 'Une creadores',          color: '#004FCD' },
            ].map(({ rol, desc, color }, i) => (
              <div
                key={rol}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${color}30`,
                  background: `${color}0a`,
                  backdropFilter: 'blur(10px)',
                  opacity: after('funcion') ? 1 : 0,
                  transform: after('funcion') ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`,
                  flex: 1,
                }}
              >
                <p style={{ fontFamily: "'Sono', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>
                  {rol}
                </p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* INVITACIÓN */}
          <div style={{
            marginTop: '32px',
            opacity: after('invitacion') ? 1 : 0,
            transform: after('invitacion') ? 'translateX(0)' : 'translateX(-16px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <button
              onClick={salir}
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#fff',
                background: 'linear-gradient(135deg, #004FCD, #3b7de8)',
                border: 'none', borderRadius: '100px',
                padding: '14px 36px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,79,205,0.4)',
                transition: 'all 0.3s ease',
                marginRight: '12px',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,79,205,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,79,205,0.4)'; }}
            >
              Entrar al ecosistema
            </button>
            <p style={{
              display: 'inline',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '11px', color: 'rgba(255,255,255,0.3)',
            }}>
              No necesitas subir nada. Solo estar.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA — Nómada SVG */}
        <div
          className="hidden md:block"
          style={{
            width: '280px', flexShrink: 0,
            opacity: after('personaje') ? 1 : 0,
            transform: after('personaje') ? 'translateX(0)' : 'translateX(60px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <img
            src="/images/nomada/nomada-waving.svg"
            alt="Nómada"
            style={{
              width: '100%', height: 'auto',
              filter: 'drop-shadow(0 0 40px rgba(0,79,205,0.3)) drop-shadow(0 0 80px rgba(93,243,240,0.15))',
              animation: 'nomada-float 4s ease-in-out infinite',
            }}
          />
          {/* Línea de bienvenida debajo */}
          {after('funcion') && (
            <div style={{
              marginTop: '16px', textAlign: 'center',
              opacity: after('funcion') ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontFamily: "'Sono', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>
                  guardián del ecosistema
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Barra de progreso ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '2px', background: 'rgba(255,255,255,0.05)',
      }}>
        <div style={{
          height: '100%',
          width: `${progreso * 100}%`,
          background: 'linear-gradient(90deg, #004FCD, #5df3f0)',
          transition: 'width 0.1s linear',
        }} />
      </div>

      {/* ── Indicadores de fase ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '8px',
      }}>
        {FASES.map((f, i) => (
          <div
            key={f.fase}
            style={{
              width: faseIdx === i ? '24px' : '6px',
              height: '3px', borderRadius: '2px',
              background: faseIdx >= i ? 'rgba(59,125,232,0.8)' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.4s ease',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes particula-float {
          0%, 100% { transform: translate(0, 0); opacity: 0.1; }
          33%       { transform: translate(18px, -24px); opacity: 0.3; }
          66%       { transform: translate(-10px, 12px); opacity: 0.15; }
        }
        @keyframes parpadeo {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.8); }
        }
      `}</style>
    </div>
  );
}
