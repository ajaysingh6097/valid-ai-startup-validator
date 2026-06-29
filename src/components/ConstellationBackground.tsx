import React, { useEffect, useRef } from "react";

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Mouse coordinates tracking
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 200, // Interaction radius
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Calculate coordinates relative to canvas
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Listen to mouse movements within the viewport
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Particle class definition
    class Particle {
      x: number;
      y: number;
      baseVx: number;
      baseVy: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      glowIntensity: number;
      pulseSpeed: number;
      pulseDir: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Slightly faster, dynamic organic movement
        this.baseVx = (Math.random() - 0.5) * 0.75;
        this.baseVy = (Math.random() - 0.5) * 0.75;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.radius = Math.random() * 2.5 + 1.2; // Slightly larger, more visible nodes
        
        // Brighter Indigo / Cyan / Emerald glow colors
        const colors = [
          "rgba(129, 140, 248, ", // Bright Indigo
          "rgba(34, 211, 238, ",  // Bright Cyan
          "rgba(168, 85, 247, ",  // Bright Violet
          "rgba(52, 211, 153, ",  // Bright Emerald/Teal
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.glowIntensity = Math.random() * 0.6 + 0.4;
        this.pulseSpeed = Math.random() * 0.015 + 0.008;
        this.pulseDir = Math.random() > 0.5 ? 1 : -1;
      }

      update(w: number, h: number) {
        // Simple attraction/gravity towards mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            // Pull factor increases as they get closer, but bounded
            const force = (mouse.radius - dist) / mouse.radius;
            this.vx += (dx / dist) * force * 0.15;
            this.vy += (dy / dist) * force * 0.15;
          } else {
            // Return to base speed gently
            this.vx += (this.baseVx - this.vx) * 0.03;
            this.vy += (this.baseVy - this.vy) * 0.03;
          }
        } else {
          // Normal speed dampening/recovery
          this.vx += (this.baseVx - this.vx) * 0.05;
          this.vy += (this.baseVy - this.vy) * 0.05;
        }

        // Apply drag limit to avoid crazy acceleration
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = 2.5;
        if (speed > maxSpeed) {
          this.vx = (this.vx / speed) * maxSpeed;
          this.vy = (this.vy / speed) * maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0) {
          this.x = 0;
          this.vx *= -1;
          this.baseVx *= -1;
        } else if (this.x > w) {
          this.x = w;
          this.vx *= -1;
          this.baseVx *= -1;
        }

        if (this.y < 0) {
          this.y = 0;
          this.vy *= -1;
          this.baseVy *= -1;
        } else if (this.y > h) {
          this.y = h;
          this.vy *= -1;
          this.baseVy *= -1;
        }

        // Pulse alpha glow organically
        this.glowIntensity += this.pulseSpeed * this.pulseDir;
        if (this.glowIntensity > 0.95 || this.glowIntensity < 0.35) {
          this.pulseDir *= -1;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = `${this.color}${this.glowIntensity})`;
        
        // Add a beautiful stellar glow shadow around each node
        context.shadowBlur = this.radius * 3;
        context.shadowColor = this.color.includes("129") 
          ? "rgba(129, 140, 248, 0.6)" 
          : "rgba(34, 211, 238, 0.6)";
        
        context.fill();
        context.shadowBlur = 0; // reset shadow immediately
      }
    }

    // Set particle density based on screen dimensions
    const particleCount = Math.min(Math.floor((width * height) / 14000), 100);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(width, height));
    }

    // Resize observer to scale perfectly with dynamic document heights
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (canvas) {
          width = canvas.width = canvas.offsetWidth;
          height = canvas.height = canvas.offsetHeight;
        }
      }
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connections first (so nodes sit on top)
      const maxDistance = 160; // Increased max connection distance
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Dynamic alpha based on distance
            const alpha = (1 - dist / maxDistance) * 0.35; // Brighter lines (0.35 max)
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Draw lines with a vibrant subtle gradient colored link
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = (1 - dist / maxDistance) * 1.2; // Variable width lines
            ctx.stroke();
          }
        }
      }

      // 2. Draw connections directly to mouse if active
      if (mouse.x !== null && mouse.y !== null) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.45; // Interactive links are brighter
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            
            // Indigo gradient line
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      // 3. Update and draw nodes
      for (const p of particles) {
        p.update(width, height);
        p.draw(ctx);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-75 select-none"
      style={{ mixBlendMode: "screen" }}
      id="constellation-background-canvas"
    />
  );
}
