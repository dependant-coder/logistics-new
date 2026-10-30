import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import React from 'react';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface MorphButtonProps {
  label: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  onClick?: () => Promise<void> | void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'volt-primary' | 'volt-ghost' | 'dark';
}

const labelVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export function MorphButton({
  label,
  loadingLabel = 'Processing...',
  successLabel = 'Done ✓',
  errorLabel = 'Failed ✗',
  onClick,
  type = 'button',
  className = '',
  icon,
  disabled = false,
  variant = 'volt-ghost',
}: MorphButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state !== 'idle') {
      e.preventDefault();
      return;
    }
    if (!onClick) return;

    setState('loading');
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const currentLabel =
    state === 'idle'
      ? label
      : state === 'loading'
      ? loadingLabel
      : state === 'success'
      ? successLabel
      : errorLabel;

  const getStyleClass = () => {
    if (state === 'success') {
      return 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e] font-bold shadow-[0_0_25px_rgba(200,255,46,0.5)]';
    }
    if (state === 'error') {
      return 'bg-red-500/20 border-red-500 text-red-400 font-bold';
    }
    if (state === 'loading') {
      return 'bg-[#c8ff2e]/20 border-[#c8ff2e]/50 text-[#c8ff2e]';
    }
    if (variant === 'volt-primary') {
      return 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e] font-extrabold hover:bg-[#d5ff4d] shadow-[0_0_20px_rgba(200,255,46,0.35)]';
    }
    if (variant === 'dark') {
      return 'bg-[#0d1114] text-[#eef2e6] border-white/10 hover:border-white/20 hover:text-white';
    }
    return 'bg-[#c8ff2e]/10 border-[#c8ff2e]/50 text-[#c8ff2e] hover:bg-[#c8ff2e]/20';
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      animate={
        state === 'error'
          ? { x: [0, -6, 6, -4, 4, 0] }
          : state === 'success'
          ? { scale: [1, 1.04, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.35 }}
      className={`relative btn-ripple min-w-[140px] px-5 py-2.5 rounded-xl border font-mono text-xs tracking-wider transition-colors overflow-hidden disabled:opacity-50 select-none ${getStyleClass()} ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          variants={labelVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="flex items-center justify-center gap-2"
        >
          {state === 'loading' && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
            />
          )}
          {state === 'idle' && icon}
          <span>{currentLabel}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
