import confetti from 'canvas-confetti';

export class ParticleEffects {
  private static instance: ParticleEffects;
  
  static getInstance(): ParticleEffects {
    if (!ParticleEffects.instance) {
      ParticleEffects.instance = new ParticleEffects();
    }
    return ParticleEffects.instance;
  }

  // Rarity-based particle effects
  createRarityExplosion(rarity: string, element?: HTMLElement) {
    const colors = this.getRarityColors(rarity);
    const intensity = this.getRarityIntensity(rarity);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      this.fireConfetti(colors, intensity, { x, y });
    } else {
      this.fireConfetti(colors, intensity);
    }
  }

  private getRarityColors(rarity: string): string[] {
    switch (rarity.toLowerCase()) {
      case 'mythical':
        return ['#ef4444', '#dc2626', '#b91c1c', '#fbbf24'];
      case 'legendary':
        return ['#f97316', '#ea580c', '#dc2626', '#fbbf24'];
      case 'epic':
        return ['#8b5cf6', '#7c3aed', '#6d28d9', '#a855f7'];
      case 'rare':
        return ['#10b981', '#059669', '#047857', '#34d399'];
      case 'common':
      default:
        return ['#6b7280', '#4b5563', '#374151', '#9ca3af'];
    }
  }

  private getRarityIntensity(rarity: string): number {
    switch (rarity.toLowerCase()) {
      case 'mythical':
        return 1.0;
      case 'legendary':
        return 0.8;
      case 'epic':
        return 0.6;
      case 'rare':
        return 0.4;
      case 'common':
      default:
        return 0.2;
    }
  }

  private fireConfetti(colors: string[], intensity: number, origin = { x: 0.5, y: 0.5 }) {
    const particleCount = Math.floor(100 * intensity);
    
    confetti({
      particleCount,
      spread: 70,
      origin,
      colors,
      gravity: 0.9,
      drift: 0,
      ticks: 200,
      scalar: 1.2
    });

    // Additional burst for higher rarities
    if (intensity > 0.6) {
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(50 * intensity),
          spread: 120,
          origin,
          colors,
          gravity: 0.6,
          drift: 0.2,
          ticks: 300,
          scalar: 0.8
        });
      }, 200);
    }
  }

  // Special effects for legendary and mythical items
  createLegendaryEffect(element?: HTMLElement) {
    let origin = { x: 0.5, y: 0.5 };
    
    if (element) {
      const rect = element.getBoundingClientRect();
      origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      };
    }

    // Golden shower effect
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }

  createMythicalEffect(element?: HTMLElement) {
    let origin = { x: 0.5, y: 0.5 };
    
    if (element) {
      const rect = element.getBoundingClientRect();
      origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      };
    }

    // Epic explosion with multiple bursts
    const colors = ['#ef4444', '#dc2626', '#b91c1c', '#fbbf24', '#f59e0b'];
    
    // Initial massive burst
    confetti({
      particleCount: 150,
      spread: 70,
      origin,
      colors,
      gravity: 0.9,
      scalar: 1.5,
      ticks: 300
    });

    // Secondary bursts
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: origin.x - 0.2, y: origin.y },
        colors,
        gravity: 0.7,
        scalar: 1.2
      });
    }, 300);

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: origin.x + 0.2, y: origin.y },
        colors,
        gravity: 0.7,
        scalar: 1.2
      });
    }, 600);
  }

  // Ambient background effects for case opening
  createAmbientSparkles(container: HTMLElement, duration = 5000) {
    const sparkles: HTMLElement[] = [];
    const startTime = Date.now();

    const createSparkle = () => {
      if (Date.now() - startTime > duration) return;

      const sparkle = document.createElement('div');
      sparkle.className = 'absolute w-1 h-1 bg-white rounded-full animate-pulse pointer-events-none';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDuration = (Math.random() * 2 + 1) + 's';
      sparkle.style.opacity = Math.random().toString();
      
      container.appendChild(sparkle);
      sparkles.push(sparkle);

      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
        const index = sparkles.indexOf(sparkle);
        if (index > -1) sparkles.splice(index, 1);
      }, 3000);

      setTimeout(createSparkle, Math.random() * 500 + 200);
    };

    createSparkle();

    // Cleanup function
    return () => {
      sparkles.forEach(sparkle => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      });
    };
  }

  // Screen shake effect for dramatic moments
  screenShake(intensity = 1, duration = 500) {
    const body = document.body;
    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: `translateX(${-10 * intensity}px)` },
      { transform: `translateX(${5 * intensity}px)` },
      { transform: `translateX(${-5 * intensity}px)` },
      { transform: `translateX(${2 * intensity}px)` },
      { transform: 'translateX(0)' }
    ];

    body.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    });
  }

  // Floating particles for premium case previews
  createFloatingParticles(container: HTMLElement, rarity: string) {
    const colors = this.getRarityColors(rarity);
    const particleCount = 8;
    const particles: HTMLElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 rounded-full pointer-events-none';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      const animation = particle.animate([
        { 
          transform: 'translateY(0px) scale(0)',
          opacity: 0
        },
        { 
          transform: 'translateY(-20px) scale(1)',
          opacity: 1,
          offset: 0.5
        },
        { 
          transform: 'translateY(-40px) scale(0)',
          opacity: 0
        }
      ], {
        duration: 3000 + Math.random() * 2000,
        iterations: Infinity,
        delay: Math.random() * 2000
      });

      container.appendChild(particle);
      particles.push(particle);
    }

    // Cleanup function
    return () => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }

  // General celebrate method for box opening rewards
  celebrate(rarity?: string, element?: HTMLElement) {
    if (rarity) {
      this.createRarityExplosion(rarity, element);
      
      // Add special effects for higher rarities
      if (rarity.toLowerCase() === 'mythical') {
        this.createMythicalEffect(element);
      } else if (rarity.toLowerCase() === 'legendary') {
        this.createLegendaryEffect(element);
      }
    } else {
      this.createConfettiExplosion(element);
    }
  }

  // Confetti explosion for spinning wheel wins
  createConfettiExplosion(element?: HTMLElement) {
    let origin = { x: 0.5, y: 0.5 };
    
    if (element) {
      const rect = element.getBoundingClientRect();
      origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      };
    }

    // Multiple colorful bursts
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin,
      colors,
      gravity: 0.8,
      scalar: 1.2,
      ticks: 250
    });

    // Second burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: origin.x - 0.15, y: origin.y },
        colors,
        gravity: 0.6,
        scalar: 0.9
      });
    }, 200);

    // Third burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: origin.x + 0.15, y: origin.y },
        colors,
        gravity: 0.6,
        scalar: 0.9
      });
    }, 400);
  }
}

export const particleEffects = ParticleEffects.getInstance();