import React, { useRef, useEffect } from 'react';

interface DottedGlowBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number;
  radius?: number;
  opacity?: number;
  glowOpacity?: number;
  colorLightVar?: string;
  glowColorLightVar?: string;
  colorDarkVar?: string;
  glowColorDarkVar?: string;
  backgroundOpacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
}

const DottedGlowBackground: React.FC<DottedGlowBackgroundProps> = ({
  className,
  gap = 20,
  radius = 1,
  opacity = 0.4,
  glowOpacity = 0.4,
  colorLightVar = '#ffffff',
  glowColorLightVar = '#ffffff',
  colorDarkVar = '#ffffff',
  glowColorDarkVar = '#ffffff',
  backgroundOpacity = 0,
  speedMin = 0.1,
  speedMax = 0.6,
  speedScale = 1,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // FIX: The `useRef` hook requires an initial value when the provided type does not include `undefined`.
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dots: Dot[] = [];
    const color = colorLightVar;
    const glowColor = glowColorLightVar;

    class Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;

      constructor(x: number, y: number, vx: number, vy: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(${hexToRgb(color)}, ${opacity})`;
        // FIX: Explicitly provide the default fill-rule to prevent potential arity errors in strict environments.
        ctx.fill('nonzero');

        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${hexToRgb(glowColor)}, ${glowOpacity})`;
        ctx.globalCompositeOperation = 'lighter';
        ctx.arc(this.x, this.y, radius + 2, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(${hexToRgb(glowColor)}, ${glowOpacity})`;
        // FIX: Explicitly provide the default fill-rule to prevent potential arity errors in strict environments.
        ctx.fill('nonzero');
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
    }

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
            result[3],
            16
          )}`
        : '255, 255, 255';
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      dots = [];
      const dotsCount = Math.floor((canvas.width * canvas.height) / (gap * gap));

      for (let i = 0; i < dotsCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speed = Math.random() * (speedMax - speedMin) + speedMin;
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed * speedScale;
        const vy = Math.sin(angle) * speed * speedScale;
        dots.push(new Dot(x, y, vx, vy));
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (backgroundOpacity > 0) {
        ctx.fillStyle = `rgba(${hexToRgb(
          color
        )}, ${backgroundOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      dots.forEach((dot) => dot.update());
      dots.forEach((dot) => dot.draw());
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      observer.disconnect();
    };
  }, [gap, radius, opacity, glowOpacity, colorLightVar, glowColorLightVar, colorDarkVar, glowColorDarkVar, backgroundOpacity, speedMin, speedMax, speedScale]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 -z-10 ${className ?? ''}`}
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default DottedGlowBackground;