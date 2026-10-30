import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import React from 'react';

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  initialDelay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

const containerVariants = (stagger: number, initialDelay: number): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: initialDelay,
    },
  },
});

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function StaggerGrid({
  children,
  className,
  stagger = 0.055,
  initialDelay = 0,
  as: Tag = 'div',
}: StaggerGridProps) {
  const MotionTag = motion(Tag as 'div');
  return (
    <MotionTag
      className={className}
      variants={containerVariants(stagger, initialDelay)}
      initial="hidden"
      animate="show"
    >
      {children}
    </MotionTag>
  );
}
