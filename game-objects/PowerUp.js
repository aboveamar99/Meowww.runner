// game-objects/PowerUp.js
export class PowerUp {
  constructor(x, y, type) {
    this.id = 'powerup_' + Date.now() + Math.random();
    this.x = x;
    this.y = y;
    this.type = 'powerup';
    this.powerUpType = type;
    this.width = 25;
    this.height = 25;
    this.speed = 5;
    this.active = true;
    this.collected = false;
    this.floatOffset = 0;
    this.floatSpeed = 2;
    
    this.collider = {
      type: 'circle',
      offsetX: this.width / 2,
      offsetY: this.height / 2,
      radius: this.width / 2
    };
    
    this.colors = {
      magnet: '#FFD700',
      shield: '#4ECDC4',
      doubleScore: '#FF6B6B',
      speedBoost: '#E74C3C'
    };
    
    this.icons = {
      magnet: '🧲',
      shield: '🛡️',
      doubleScore: '2x',
      speedBoost: '⚡'
    };
  }

  update(deltaTime, gameSpeed) {
    this.x -= (this.speed + gameSpeed) * deltaTime * 60;
    this.floatOffset = Math.sin(Date.now() * 0.005) * 5;
    
    if (this.x + this.width < 0) {
      this.active = false;
    }
  }

  render(ctx) {
    if (this.collected) return;
    
    ctx.save();
    
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + this.floatOffset);
    
    const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, this.width);
    gradient.addColorStop(0, this.colors[this.powerUpType]);
    gradient.addColorStop(1, this.colors[this.powerUpType] + 'CC');
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = this.colors[this.powerUpType];
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icons[this.powerUpType], 0, 0);
    
    ctx.restore();
  }

  onCollisionEnter(other) {
    if (other.id.startsWith('player') && !this.collected) {
      this.collected = true;
      this.active = false;
    }
  }
}
