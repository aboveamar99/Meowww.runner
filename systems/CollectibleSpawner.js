// systems/CollectibleSpawner.js
export class CollectibleSpawner {
  constructor(gameWidth, gameHeight, lanes) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.lanes = lanes;
    this.laneWidth = gameWidth / lanes;
    
    this.coinSpawnTimer = 0;
    this.coinSpawnInterval = 0.5;
    
    this.powerUpSpawnTimer = 0;
    this.powerUpSpawnInterval = 5;
    
    this.powerUpTypes = ['magnet', 'shield', 'doubleScore', 'speedBoost'];
  }

  update(deltaTime, gameSpeed) {
    const collectibles = [];
    
    this.coinSpawnTimer += deltaTime;
    if (this.coinSpawnTimer >= this.coinSpawnInterval) {
      this.coinSpawnTimer = 0;
      
      if (Math.random() < 0.7) {
        collectibles.push(...this.spawnCoins());
      }
    }
    
    this.powerUpSpawnTimer += deltaTime;
    if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
      this.powerUpSpawnTimer = 0;
      
      if (Math.random() < 0.3) {
        collectibles.push(this.spawnPowerUp());
      }
    }
    
    return collectibles;
  }

  spawnCoins() {
    const coins = [];
    const pattern = Math.floor(Math.random() * 3);
    
    switch (pattern) {
      case 0:
        coins.push({
          type: 'coin',
          x: this.gameWidth,
          y: this.gameHeight - 100 - 40,
          lane: 1
        });
        break;
      case 1:
        for (let i = 0; i < this.lanes; i++) {
          coins.push({
            type: 'coin',
            x: this.gameWidth + i * 30,
            y: this.gameHeight - 100 - 40,
            lane: i
          });
        }
        break;
      case 2:
        coins.push({
          type: 'coin',
          x: this.gameWidth,
          y: this.gameHeight - 100 - 60,
          lane: 1
        });
        coins.push({
          type: 'coin',
          x: this.gameWidth + 20,
          y: this.gameHeight - 100 - 20,
          lane: 1
        });
        break;
    }
    
    return coins;
  }

  spawnPowerUp() {
    const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
    const lane = Math.floor(Math.random() * this.lanes);
    
    return {
      type: 'powerup',
      powerUpType: type,
      x: this.gameWidth,
      y: this.gameHeight - 100 - 40,
      lane: lane
    };
  }

  reset() {
    this.coinSpawnTimer = 0;
    this.powerUpSpawnTimer = 0;
  }
}
