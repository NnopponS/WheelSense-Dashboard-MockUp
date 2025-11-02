import React from 'react';
import { useStore } from '../../lib/store';

interface BilingualProps {
  en: string;
  th: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Bilingual({ en, th, align = 'left', className, size = 'sm' }: BilingualProps) {
  const { language } = useStore();
  const text = language === 'en' ? en : th;
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : '';
  
  return (
    <span className={className ? `${alignClass} ${className}` : alignClass}>
      {text}
    </span>
  );
}


