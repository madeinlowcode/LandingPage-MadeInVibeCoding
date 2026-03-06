import { useEffect, useRef, useState } from 'react';
import { AsciiPlaceholder } from './AsciiPlaceholder';

export function AsciiMascotCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<AsciiPlaceholder | null>(null);
  const mascotRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Start placeholder immediately
    placeholderRef.current = new AsciiPlaceholder(containerRef.current);

    const isMobile = window.innerWidth < 768;

    if (!isMobile) {
      // Load 3D mascot
      let cancelled = false;
      const timeout = setTimeout(() => {
        if (!cancelled) setReady(true);
      }, 2000);

      import('./asciiMascot').then(({ AsciiMascot }) => {
        if (cancelled || !containerRef.current) return;
        mascotRef.current = new AsciiMascot(containerRef.current);
        clearTimeout(timeout);
        // Small delay for smooth transition
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      }).catch(() => {
        if (!cancelled) setReady(true);
      });

      return () => {
        cancelled = true;
        clearTimeout(timeout);
        mascotRef.current?.destroy();
        placeholderRef.current?.destroy();
      };
    }

    // Mobile: just placeholder
    return () => {
      placeholderRef.current?.destroy();
    };
  }, []);

  const cards = [
    { label: 'Planejamento', idx: 0 },
    { label: 'Implementação', idx: 1 },
    { label: 'Revisão', idx: 2 },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full h-[200px] md:h-[400px] lg:h-[500px] relative overflow-visible"
    >
      {/* Placeholder fades out when 3D is ready */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? 'none' : 'auto' }}
      />

      {/* Orbiting cards */}
      {cards.map((card) => (
        <div
          key={card.label}
          className="absolute z-20 hidden md:block"
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.7s',
            animation: ready ? `orbit-card-${card.idx} 50s ease-in-out infinite` : 'none',
            animationDelay: `${card.idx * 0.3}s`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="border border-orange-500/50 rounded-lg px-4 py-2 bg-black/60 backdrop-blur-sm
                          text-orange-400 text-sm font-mono cursor-default
                          hover:border-orange-400 hover:bg-black/80 hover:scale-110 transition-all duration-300
                          shadow-[0_0_15px_rgba(255,107,0,0.15)]">
            {card.label}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes orbit-card-0 {
          0%   { left: 2%;  top: 35%; }
          25%  { left: 30%; top: 2%;  }
          50%  { left: 85%; top: 25%; }
          75%  { left: 50%; top: 92%; }
          100% { left: 2%;  top: 35%; }
        }
        @keyframes orbit-card-1 {
          0%   { left: 85%; top: 15%; }
          25%  { left: 55%; top: 92%; }
          50%  { left: 2%;  top: 55%; }
          75%  { left: 35%; top: 2%;  }
          100% { left: 85%; top: 15%; }
        }
        @keyframes orbit-card-2 {
          0%   { left: 45%; top: 92%; }
          25%  { left: 85%; top: 50%; }
          50%  { left: 40%; top: 2%;  }
          75%  { left: 2%;  top: 60%; }
          100% { left: 45%; top: 92%; }
        }
      `}</style>
    </div>
  );
}

export default AsciiMascotCanvas;
