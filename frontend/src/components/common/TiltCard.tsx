import { useSpring, motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import React, { useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxTilt?: number;
  variants?: Variants;
  isSelected?: boolean;
}

export function TiltCard({
  children,
  className = '',
  onClick,
  maxTilt = 5,
  variants,
  isSelected = false,
}: TiltCardProps) {
  const prefersReduced = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 240, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 240, damping: 25 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set mouse coordinates for CSS radial spotlight
    ref.current.style.setProperty('--mx', `${x}px`);
    ref.current.style.setProperty('--my', `${y}px`);

    if (!prefersReduced) {
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx; // -1 to 1
      const dy = (y - cy) / cy; // -1 to 1
      rotateX.set(-dy * maxTilt);
      rotateY.set(dx * maxTilt);
    }
  };

  const handleMouseLeave = () => {
    if (!prefersReduced) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      whileHover={prefersReduced ? undefined : { scale: isSelected ? 1.025 : 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 900,
            }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`card-bento ${className}`}
    >
      {children}
    </motion.div>
  );
}
