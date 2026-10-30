import { useEffect, useState } from 'react';
import React from 'react';

interface ScannedTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ScannedTitle({ children, className = '' }: ScannedTitleProps) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, []);

  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      {children}
      <span key={animKey} className="scan-once" />
    </div>
  );
}
