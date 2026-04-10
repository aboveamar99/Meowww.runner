// game-objects/Player.js
export class Player {
  constructor(x, y) {
    this.id = 'player_' + Date.now() + Math.random();
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.lane = 1;
    this.lanes = 3;
    this.laneWidth = 100;
    this.targetX = x;
    this.groundY = y;
    
    this.velocityY = 0;
    this.useGravity = true;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    
    this.originalHeight = this.height;
    this.slideHeight = 30;
    
    this.collider = {
      type: 'aabb',
      offsetX: 0,
      offsetY: 0,
      width: this.width,
      height: this.height
    };
    
    this.powerUps = {
      magnet: { active: false, timer: 0, duration: 5 },
      shield: { active: false, timer: 0, duration: 5 },
      doubleScore: { active: false, timer: 0, duration: 5 },
      speedBoost: { active: false, timer: 0, duration: 3 }
    };
    
    this.skin = 'default';
    this.unlockedSkins = ['default'];
    this.coins = 0;
    this.score = 0;
  }

  update(deltaTime, input) {
    this.handleInput(input);
    this.updatePosition(deltaTime);
    this.updatePowerUps(deltaTime);
    this.updateInvulnerability(deltaTime);
    
    this.x += (this.targetX - this.x) * 10 * deltaTime;
    
    if (this.isSliding) {
      this.height = this.slideHeight;
      this.collider.height = this.slideHeight;
      this.collider.offsetY = this.originalHeight - this.slideHeight;
    } else {
      this.height = this.originalHeight;
      this.collider.height = this.originalHeight;
      this.collider.offsetY = 0;
    }
  }

  handleInput(input) {
    const horizontal = input.getAxis('Horizontal');
    
    if (horizontal !== 0 && !this.isSliding) {
      const newLane = this.lane + horizontal;
      if (newLane >= 0 && newLane < this.lanes) {
        this.lane = newLane;
        this.targetX = this.lane * this.laneWidth + this.laneWidth / 2 - this.width / 2;
      }
    }
    
    const vertical = input.getAxis('Vertical');
    
    if (vertical > 0 && this.isGrounded && !this.isSliding) {
      this.slide();
    } else if (vertical < 0 && this.isGrounded && !this.isSliding) {
      this.jump();
    } else if (vertical <= 0 && this.isSliding) {
      this.standUp();
    }
  }

  updatePosition(deltaTime) {
    if (this.useGravity) {
      this.velocityY += 15 * deltaTime;
      this.y += this.velocityY * deltaTime;
      
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isJumping = false;
      }
    }
  }

  updatePowerUps(deltaTime) {
    Object.keys(this.powerUps).forEach(key => {
      const powerUp = this.powerUps[key];
      if (powerUp.active) {
        powerUp.timer -= deltaTime;
        if (powerUp.timer <= 0) {
          powerUp.active = false;
          powerUp.timer = 0;
        }
      }
    });
  }

  updateInvulnerability(deltaTime) {
    if (this.isInvulnerable) {
      this.invulnerableTimer -= deltaTime;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }
  }

  jump() {
    this.velocityY = -8;
    this.isGrounded = false;
    this.isJumping = true;
  }

  slide() {
    this.isSliding = true;
    this.height = this.slideHeight;
  }

  standUp() {
    this.isSliding = false;
    this.height = this.originalHeight;
  }

  activatePowerUp(type) {
    if (this.powerUps[type]) {
      this.powerUps[type].active = true;
      this.powerUps[type].timer = this.powerUps[type].duration;
    }
  }

  takeDamage() {
    if (this.isInvulnerable || this.powerUps.shield.active) {
      return false;
    }
    
    this.isInvulnerable = true;
    this.invulnerableTimer = 1;
    return true;
  }

  addScore(amount) {
    const multiplier = this.powerUps.doubleScore.active ? 2 : 1;
    this.score += amount * multiplier;
  }

  addCoins(amount) {
    const magnetMultiplier = this.powerUps.magnet.active ? 1 : 1;
    this.coins += Math.floor(amount * magnetMultiplier);
  }

  unlockSkin(skinName) {
    if (!this.unlockedSkins.includes(skinName)) {
      this.unlockedSkins.push(skinName);
      return true;
    }
    return false;
  }

  setSkin(skinName) {
    if (this.unlockedSkins.includes(skinName)) {
      this.skin = skinName;
      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.save();
    
    if (this.isInvulnerable) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
    }
    
    ctx.fillStyle = this.skin === 'default' ? '#FF6B6B' : '#4ECDC4';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    if (this.powerUps.shield.active) {
      ctx.strokeStyle = '#4ECDC4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        Math.max(this.width, this.height) / 2 + 5,
        0, Math.PI * 2
      );
      ctx.stroke();
    }
    
    if (this.powerUps.magnet.active) {
      ctx.fillStyle = '#FFE66D';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  onCollisionEnter(other) {
    if (other.type === 'obstacle') {
      return this.takeDamage();
    } else if (other.type === 'coin') {
      this.addCoins(1);
      this.addScore(10);
    } else if (other.type === 'powerup') {
      this.activatePowerUp(other.powerUpType);
    }
    return false;
  }
    }
