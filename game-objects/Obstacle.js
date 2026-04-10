// game-objects/Obstacle.js
export class Obstacle {
  constructor(x, y, type) {
    this.id = 'obstacle_' + Date.now() + Math.random();
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 40;
    this.height = type === 'barrier' ? 60 : 30;
    this.speed = 5;
    this.active = true;
    
    this.collider = {
      type: 'aabb',
      offsetX: 0,
      offsetY: 0,
      width: this.width,
      height: this.height
    };
  }

  update(deltaTime, gameSpeed) {
    this.x -= (this.speed + gameSpeed) * deltaTime * 60;
    
    if (this.x + this.width < 0) {
      this.active = false;
    }
  }

  render(ctx) {
    ctx.save();
    
    ctx.fillStyle = this.type === 'barrier' ? '#E74C3C' : '#E67E22';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    ctx.restore();
  }
}
