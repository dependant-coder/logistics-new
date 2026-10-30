import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      }

      // Spotlight effect on .card-bento or .kpi elements
      const target = e.target as HTMLElement | null;
      const card = target?.closest('.card-bento, .kpi') as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }

      // Magnetic hover enlargement
      const isHoverable = !!target?.closest('a, button, select, input, [data-mag]');
      if (containerRef.current) {
        containerRef.current.classList.toggle('h', isHoverable);
      }
    };

    const renderLag = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      }
      animId = requestAnimationFrame(renderLag);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(renderLag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="cur hidden md:block" aria-hidden="true">
      <i ref={dotRef} />
      <b ref={ringRef} />
    </div>
  );
}
