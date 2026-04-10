// game-objects/Coin.js
export class Coin {
  constructor(x, y) {
    this.id = 'coin_' + Date.now() + Math.random();
    this.x = x;
    this.y = y;
    this.type = 'coin';
    this.width = 20;
    this.height = 20;
    this.speed = 5;
    this.active = true;
    this.rotation = 0;
    this.collected = false;
    
    this.collider = {
      type: 'circle',
      offsetX: this.width / 2,
      offsetY: this.height / 2,
      radius: this.width / 2
    };
  }

  update(deltaTime, gameSpeed) {
    this.x -= (this.speed + gameSpeed) * deltaTime * 60;
    this.rotation += deltaTime * 5;
    
    if (this.x + this.width < 0) {
      this.active = false;
    }
  }

  render(ctx) {
    if (this.collected) return;
    
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    
    const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, this.width / 2);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, '#FFA500');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#FFF8DC';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    
    ctx.restore();
  }

  onCollisionEnter(other) {
    if (other.id.startsWith('player') && !this.collected) {
      this.collected = true;
      this.active = false;
    }
  }
}
