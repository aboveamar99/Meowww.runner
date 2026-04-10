// states/GameState.js
export class GameState {
  constructor(game) {
    this.game = game;
    this.engine = game.engine;
    this.renderer = game.renderingEngine;
    this.physics = game.physicsEngine;
    this.input = game.inputManager;
    this.ui = game.uiSystem;
    this.audio = game.audioSystem;
    this.data = game.dataManager;
    
    this.player = null;
    this.obstacles = new Set();
    this.coins = new Set();
    this.powerUps = new Set();
    
    this.obstaclePool = null;
    this.coinPool = null;
    this.powerUpPool = null;
    
    this.obstacleSpawner = null;
    this.collectibleSpawner = null;
    this.particleSystem = new ParticleSystem();
    this.difficultySystem = new AdaptiveDifficulty();
    
    this.gameSpeed = 0;
    this.baseGameSpeed = 5;
    this.maxGameSpeed = 15;
    
    this.score = 0;
    this.distance = 0;
    this.survivalTime = 0;
    this.collisions = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    
    this.paused = false;
    this.gameOver = false;
  }

  enter() {
    this.audio.playMusic('game');
    this.initializePools();
    this.initializePlayer();
    this.initializeSpawners();
    this.setupInput();
    this.createGameUI();
    
    this.engine.addUpdateCallback((dt) => this.update(dt));
    this.engine.addFixedUpdateCallback((dt) => this.fixedUpdate(dt));
    this.engine.addRenderCallback(() => this.render());
  }

  initializePools() {
    const Obstacle = (await import('../game-objects/Obstacle.js')).Obstacle;
    const Coin = (await import('../game-objects/Coin.js')).Coin;
    const PowerUp = (await import('../game-objects/PowerUp.js')).PowerUp;
    
    this.obstaclePool = new ObjectPool(() => new Obstacle(0, 0, 'barrier'), 20);
    this.coinPool = new ObjectPool(() => new Coin(0, 0), 30);
    this.powerUpPool = new ObjectPool(() => new PowerUp(0, 0, 'magnet'), 10);
  }

  initializePlayer() {
    const Player = (await import('../game-objects/Player.js')).Player;
    
    const startX = this.renderer.width / 3;
    const startY = this.renderer.height - 100;
    
    this.player = new Player(startX, startY);
    this.player.lanes = 3;
    this.player.laneWidth = this.renderer.width / 3;
    this.player.targetX = startX;
    
    const selectedSkin = this.data.getSelectedSkin();
    this.player.setSkin(selectedSkin);
    
    this.physics.addCollider(this.player);
  }

  initializeSpawners() {
    this.obstacleSpawner = new ObstacleSpawner(
      this.renderer.width,
      this.renderer.height,
      3
    );
    
    this.collectibleSpawner = new CollectibleSpawner(
      this.renderer.width,
      this.renderer.height,
      3
    );
  }

  setupInput() {
    this.input.bindKey('Space', (pressed) => {
      if (pressed && this.player.isGrounded) {
        this.player.jump();
        this.audio.playSound('jump');
      }
    });
    
    this.input.bindKey('KeyR', (pressed) => {
      if (pressed && this.gameOver) {
        this.restart();
      }
    });
    
    this.input.bindKey('Escape', (pressed) => {
      if (pressed) {
        this.togglePause();
      }
    });
    
    this.input.registerGesture('swipeUp', () => {
      if (this.player.isGrounded) {
        this.player.jump();
        this.audio.playSound('jump');
      }
    });
    
    this.input.registerGesture('swipeDown', () => {
      this.player.slide();
    });
    
    this.input.registerGesture('swipeLeft', () => {
      if (this.player.lane > 0) {
        this.player.lane--;
        this.player.targetX = this.player.lane * this.player.laneWidth + 
          this.player.laneWidth / 2 - this.player.width / 2;
      }
    });
    
    this.input.registerGesture('swipeRight', () => {
      if (this.player.lane < this.player.lanes - 1) {
        this.player.lane++;
        this.player.targetX = this.player.lane * this.player.laneWidth + 
          this.player.laneWidth / 2 - this.player.width / 2;
      }
    });
  }

  createGameUI() {
    this.ui.elements.clear();
    
    this.ui.createText('scoreLabel', 'SCORE', 20, 30, { fontSize: 16 });
    this.ui.createText('scoreValue', '0', 20, 55, { fontSize: 24, font: 'score' });
    
    this.ui.createText('coinsLabel', 'COINS', this.renderer.width - 120, 30, 
      { fontSize: 16, align: 'right' });
    this.ui.createText('coinsValue', '0', this.renderer.width - 20, 55, 
      { fontSize: 24, font: 'score', align: 'right' });
    
    this.ui.createText('comboLabel', 'COMBO', this.renderer.width / 2, 30, 
      { fontSize: 16, align: 'center' });
    this.ui.createText('comboValue', '', this.renderer.width / 2, 55, 
      { fontSize: 24, font: 'score', align: 'center', color: '#FFD700' });
    
    this.ui.createProgressBar('powerupBar', 20, 80, 200, 15, 
      { value: 0, maxValue: 5 });
  }

  update(deltaTime) {
    if (this.paused || this.gameOver) return;
    
    this.survivalTime += deltaTime;
    this.distance += this.gameSpeed * deltaTime * 10;
    
    this.gameSpeed = Math.min(
      this.maxGameSpeed,
      this.baseGameSpeed + this.survivalTime * 0.05
    );
    
    this.player.update(deltaTime, this.input);
    this.updateObjects(deltaTime);
    this.updateSpawners(deltaTime);
    this.updateCombo(deltaTime);
    this.updateDifficulty(deltaTime);
    this.updateUI();
    
    this.particleSystem.update(deltaTime);
    
    if (this.player.y > this.renderer.height) {
      this.endGame();
    }
  }

  fixedUpdate(deltaTime) {
    if (this.paused || this.gameOver) return;
    
    this.physics.applyGravity(this.player, deltaTime);
    this.physics.update(deltaTime);
  }

  updateObjects(deltaTime) {
    this.obstacles.forEach(obs => {
      obs.update(deltaTime, this.gameSpeed);
      if (!obs.active) {
        this.physics.removeCollider(obs);
        this.obstaclePool.release(obs);
        this.obstacles.delete(obs);
      }
    });
    
    this.coins.forEach(coin => {
      coin.update(deltaTime, this.gameSpeed);
      if (!coin.active) {
        this.physics.removeCollider(coin);
        this.coinPool.release(coin);
        this.coins.delete(coin);
        
        if (coin.collected) {
          this.addScore(10);
          this.player.addCoins(1);
          this.particleSystem.createCoinEffect(coin.x, coin.y);
          this.audio.playSound('coin');
          this.incrementCombo();
        }
      }
    });
    
    this.powerUps.forEach(powerUp => {
      powerUp.update(deltaTime, this.gameSpeed);
      if (!powerUp.active) {
        this.physics.removeCollider(powerUp);
        this.powerUpPool.release(powerUp);
        this.powerUps.delete(powerUp);
        
        if (powerUp.collected) {
          this.player.activatePowerUp(powerUp.powerUpType);
          this.particleSystem.createExplosion(powerUp.x, powerUp.y, 15, '#4ECDC4');
          this.audio.playSound('powerup');
          this.addScore(50);
        }
      }
    });
  }

  updateSpawners(deltaTime) {
    const obstacles = this.obstacleSpawner.update(deltaTime, this.gameSpeed);
    obstacles.forEach(obsData => {
      setTimeout(() => {
        if (!this.gameOver && !this.paused) {
          const obs = this.obstaclePool.get(obsData.x, obsData.y, obsData.obstacleType);
          this.obstacles.add(obs);
          this.physics.addCollider(obs);
        }
      }, (obsData.delay || 0) * 1000);
    });
    
    const collectibles = this.collectibleSpawner.update(deltaTime, this.gameSpeed);
    collectibles.forEach(data => {
      if (data.type === 'coin') {
        const coin = this.coinPool.get(data.x, data.y);
        this.coins.add(coin);
        this.physics.addCollider(coin);
      } else if (data.type === 'powerup') {
        const powerUp = this.powerUpPool.get(data.x, data.y, data.powerUpType);
        this.powerUps.add(powerUp);
        this.physics.addCollider(powerUp);
      }
    });
  }

  updateCombo(deltaTime) {
    if (this.combo > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }
  }

  incrementCombo() {
    this.combo++;
    this.comboTimer = 2;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
  }

  updateDifficulty(deltaTime) {
    const difficulty = this.difficultySystem.update(
      this.score,
      this.survivalTime,
      this.collisions,
      deltaTime
    );
    
    this.obstacleSpawner.difficulty = difficulty;
  }

  updateUI() {
    this.ui.elements.get('scoreValue').text = Math.floor(this.score);
    this.ui.elements.get('coinsValue').text = this.player.coins;
    
    if (this.combo > 1) {
      this.ui.elements.get('comboValue').text = `${this.combo}x`;
    } else {
      this.ui.elements.get('comboValue').text = '';
    }
    
    const activePowerUp = Object.entries(this.player.powerUps).find(([_, p]) => p.active);
    if (activePowerUp) {
      const [type, powerUp] = activePowerUp;
      const bar = this.ui.elements.get('powerupBar');
      bar.visible = true;
      bar.value = powerUp.timer;
      bar.maxValue = powerUp.duration;
      bar.fillColor = this.getPowerUpColor(type);
    } else {
      this.ui.elements.get('powerupBar').visible = false;
    }
  }

  getPowerUpColor(type) {
    const colors = {
      magnet: '#FFD700',
      shield: '#4ECDC4',
      doubleScore: '#FF6B6B',
      speedBoost: '#E74C3C'
    };
    return colors[type] || '#FFFFFF';
  }

  addScore(amount) {
    const comboMultiplier = 1 + (this.combo * 0.1);
    this.score += amount * comboMultiplier;
  }

  takeDamage() {
    this.collisions++;
    this.combo = 0;
    this.particleSystem.createExplosion(this.player.x, this.player.y, 20, '#FF6B6B');
    this.audio.playSound('hit');
    
    if (this.collisions >= 3) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    this.audio.stopMusic();
    this.audio.playSound('hit');
    
    const isNewHighScore = this.data.setHighScore(Math.floor(this.score));
    this.data.addCoins(this.player.coins);
    
    this.data.updateStats({
      totalGames: this.data.data.stats.totalGames + 1,
      totalDistance: this.data.data.stats.totalDistance + Math.floor(this.distance)
    });
    
    this.showGameOverScreen(isNewHighScore);
  }

  showGameOverScreen(isNewHighScore) {
    const centerX = this.renderer.width / 2;
    const centerY = this.renderer.height / 2;
    
    this.ui.createPanel('gameOverPanel', centerX - 200, centerY - 150, 400, 300);
    
    this.ui.createText('gameOverTitle', 'GAME OVER', centerX, centerY - 100, 
      { fontSize: 32, font: 'title', align: 'center', color: '#FF6B6B' });
    
    if (isNewHighScore) {
      this.ui.createText('newHighScore', 'NEW HIGH SCORE!', centerX, centerY - 60, 
        { fontSize: 20, align: 'center', color: '#FFD700' });
    }
    
    this.ui.createText('finalScore', `SCORE: ${Math.floor(this.score)}`, centerX, centerY - 20, 
      { fontSize: 24, align: 'center' });
    
    this.ui.createText('finalCoins', `COINS: ${this.player.coins}`, centerX, centerY + 20, 
      { fontSize: 20, align: 'center' });
    
    this.ui.createButton('restartBtn', 'PLAY AGAIN', centerX - 100, centerY + 60, 200, 50, 
      () => this.restart());
    
    this.ui.createButton('menuBtn', 'MAIN MENU', centerX - 100, centerY + 130, 200, 50, 
      () => this.game.stateManager.changeState('menu'));
  }

  togglePause() {
    this.paused = !this.paused;
    
    if (this.paused) {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
  }

  showPauseMenu() {
    const centerX = this.renderer.width / 2;
    const centerY = this.renderer.height / 2;
    
    this.ui.createPanel('pausePanel', centerX - 150, centerY - 100, 300, 200);
    this.ui.createText('pauseTitle', 'PAUSED', centerX, centerY - 60, 
      { fontSize: 32, font: 'title', align: 'center' });
    
    this.ui.createButton('resumeBtn', 'RESUME', centerX - 100, centerY, 200, 50, 
      () => this.togglePause());
    
    this.ui.createButton('quitBtn', 'QUIT', centerX - 100, centerY + 70, 200, 50, 
      () => this.game.stateManager.changeState('menu'));
  }

  hidePauseMenu() {
    this.ui.elements.delete('pausePanel');
    this.ui.elements.delete('pauseTitle');
    this.ui.elements.delete('resumeBtn');
    this.ui.elements.delete('quitBtn');
  }

  restart() {
    this.game.stateManager.changeState('game');
  }

  render() {
    this.renderer.render(this.engine.deltaTime);
    this.renderer.renderParticles(this.engine.deltaTime);
    
    this.player.render(this.renderer.ctx);
    this.obstacles.forEach(obs => obs.render(this.renderer.ctx));
    this.coins.forEach(coin => coin.render(this.renderer.ctx));
    this.powerUps.forEach(powerUp => powerUp.render(this.renderer.ctx));
    
    this.particleSystem.render(this.renderer.ctx);
    this.ui.render(this.renderer.ctx);
  }

  exit() {
    this.engine.updateCallbacks.clear();
    this.engine.fixedUpdateCallbacks.clear();
    this.engine.renderCallbacks.clear();
    
    this.physics.colliders.clear();
    this.physics.collisionPairs.clear();
    
    this.obstaclePool?.releaseAll();
    this.coinPool?.releaseAll();
    this.powerUpPool?.releaseAll();
    
    this.ui.elements.clear();
    this.audio.stopMusic();
  }
      }
