import { Paper, type PaperProps } from '@mantine/core';
import { forwardRef, type ReactNode } from 'react';
import { useSettings } from '@entities/settings/settings.store';

interface GlassCardProps extends PaperProps {
  children: ReactNode;
  glow?: 'ghost' | 'spectre' | 'none';
  interactive?: boolean;
  delay?: number;
  onClick?: () => void;
}

/** Frosted glass surface with optional spectral glow and CSS entrance/hover. */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { children, glow = 'none', interactive = false, delay = 0, onClick, className, style, ...rest },
  ref,
) {
  const animations = useSettings((s) => s.animations);
  const glowOn = useSettings((s) => s.glow);
  const glowClass =
    glowOn && glow === 'ghost' ? 'gs-glow-ghost' : glowOn && glow === 'spectre' ? 'gs-glow-spectre' : '';

  return (
    <Paper
      ref={ref}
      p="lg"
      onClick={onClick}
      className={['gs-glass', glowClass, interactive ? 'gs-card-interactive' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        cursor: interactive || onClick ? 'pointer' : undefined,
        animation: animations ? 'gs-rise 0.45s cubic-bezier(0.22,1,0.36,1) both' : undefined,
        animationDelay: animations ? `${delay}s` : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
});
