/**
 * AsciiPlaceholder.ts
 * Canvas 2D puro com partículas de caracteres flutuantes
 */

interface Particle {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
  opacityDir: number;
  size: number;
}

export class AsciiPlaceholder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private chars = ['<', '/', '>', '*', '#', '@', '{', '}', '=', '+', '~', '$', '%', '&'];

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.resize();
    this.initParticles(30);
    this.animate();
  }

  private resize(): void {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  private initParticles(count: number): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        char: this.chars[Math.floor(Math.random() * this.chars.length)],
        speed: 0.3 + Math.random() * 0.7,
        opacity: Math.random(),
        opacityDir: (Math.random() > 0.5 ? 1 : -1) * (0.005 + Math.random() * 0.01),
        size: 12 + Math.random() * 8,
      });
    }
  }

  private animate = (): void => {
    const { ctx, canvas, particles } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.classList.contains('dark');
    const color = isDark ? '255, 140, 58' : '204, 85, 0';

    ctx.font = '14px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (const p of particles) {
      p.y -= p.speed;
      p.opacity += p.opacityDir;
      if (p.opacity <= 0.1 || p.opacity >= 0.9) p.opacityDir *= -1;
      if (p.y < -20) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
        p.char = this.chars[Math.floor(Math.random() * this.chars.length)];
      }

      ctx.font = `${p.size}px monospace`;
      ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
      ctx.fillText(p.char, p.x, p.y);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  public destroy(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.canvas.remove();
  }
}
