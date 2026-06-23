import { Paper, type PaperProps } from '@mantine/core';
import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import { useSettings } from '@entities/settings/settings.store';

interface GlassCardProps extends PaperProps {
  children: ReactNode;
  glow?: 'ghost' | 'spectre' | 'none';
  interactive?: boolean;
  delay?: number;
  onClick?: () => void;
}

const MAX_TILT = 5;

/**
 * Frosted glass surface with the Ghost OS treatment: blur-in entrance,
 * 3D cursor tilt, a top sheen line and a radial cursor spotlight on hover.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { children, glow = 'none', interactive = false, delay = 0, onClick, className, style, ...rest },
  ref,
) {
  const animations = useSettings((s) => s.animations);
  const glowOn = useSettings((s) => s.glow);
  const glowClass =
    glowOn && glow === 'ghost' ? 'gs-glow-ghost' : glowOn && glow === 'spectre' ? 'gs-glow-spectre' : '';

  const tilt = interactive && animations;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-(py - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
  };

  const handleLeave = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <Paper
      ref={ref}
      p="lg"
      onClick={onClick}
      onMouseMove={tilt ? handleMove : undefined}
      onMouseLeave={tilt ? handleLeave : undefined}
      className={['gs-glass', glowClass, interactive ? 'gs-card-interactive' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        cursor: interactive || onClick ? 'pointer' : undefined,
        animation: animations ? 'gs-rise 0.5s var(--gs-ease-premium) both' : undefined,
        animationDelay: animations ? `${delay}s` : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
});
