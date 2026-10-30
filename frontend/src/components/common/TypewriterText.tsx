import { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  variance?: number;
  cursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 28,
  variance = 15,
  cursor = true,
  className,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion) {
      setDisplayed(text);
      setDone(true);
      onComplete?.();
      return;
    }

    setDisplayed('');
    setDone(false);
    let index = 0;

    const type = () => {
      if (index >= text.length) {
        setDone(true);
        onComplete?.();
        return;
      }
      index++;
      setDisplayed(text.slice(0, index));
      const delay = speed + Math.random() * variance;
      timeoutRef.current = setTimeout(type, delay);
    };

    timeoutRef.current = setTimeout(type, speed);

    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && (
        <span className="cursor-blink ml-0.5 text-[#c8ff2e]">█</span>
      )}
    </span>
  );
}
