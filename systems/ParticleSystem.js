// systems/ParticleSystem.js
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.pool = [];
    this.maxParticles = 500;
  }

  createExplosion(x, y, count = 20, color = '#FF6B6B') {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      particle.x = x;
      particle.y = y;
      particle.vx = (Math.random() - 0.5) * 200;
      particle.vy = (Math.random() - 0.5) * 200;
      particle.life = 1;
      particle.maxLife = 1;
      particle.size = Math.random() * 5 + 2;
      particle.color = color;
      particle.gravity = 100;
      this.particles.push(particle);
    }
  }

  createTrail(x, y, color = '#4ECDC4') {
    const particle = this.getParticle();
    particle.x = x;
    particle.y = y;
    particle.vx = (Math.random() - 0.5) * 50 - 50;
    particle.vy = (Math.random() - 0.5) * 20;
    particle.life = 0.5;
    particle.maxLife = 0.5;
    particle.size = Math.random() * 3 + 1;
    particle.color = color;
    particle.gravity = 0;
    this.particles.push(particle);
  }

  createCoinEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      const particle = this.getParticle();
      particle.x = x;
      particle.y = y;
      particle.vx = (Math.random() - 0.5) * 100;
      particle.vy = -Math.random() * 100 - 50;
      particle.life = 0.8;
      particle.maxLife = 0.8;
      particle.size = Math.random() * 4 + 2;
      particle.color = '#FFD700';
      particle.gravity = 200;
      this.particles.push(particle);
    }
  }

  getParticle() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {};
  }

  update(deltaTime) {
    this.particles = this.particles.filter(particle => {
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.vy += (particle.gravity || 0) * deltaTime;
      
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      particle.life -= deltaTime / particle.maxLife;
      
      if (particle.life <= 0) {
        this.pool.push(particle);
        return false;
      }
      
      return true;
    });
  }

  render(ctx) {
    this.particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  clear() {
    this.pool.push(...this.particles);
    this.particles = [];
  }
}
