// systems/ObstacleSpawner.js
export class ObstacleSpawner {
  constructor(gameWidth, gameHeight, lanes) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.lanes = lanes;
    this.laneWidth = gameWidth / lanes;
    
    this.spawnTimer = 0;
    this.spawnInterval = 1.5;
    this.patterns = [];
    this.currentPattern = null;
    this.patternIndex = 0;
    
    this.difficulty = 1;
    this.baseSpeed = 5;
    
    this.initPatterns();
  }

  initPatterns() {
    this.patterns = [
      {
        name: 'single',
        obstacles: [{ lane: 1, type: 'barrier', delay: 0 }]
      },
      {
        name: 'double',
        obstacles: [
          { lane: 0, type: 'barrier', delay: 0 },
          { lane: 2, type: 'barrier', delay: 0.5 }
        ]
      },
      {
        name: 'slide',
        obstacles: [{ lane: 1, type: 'low', delay: 0 }]
      },
      {
        name: 'mixed',
        obstacles: [
          { lane: 0, type: 'low', delay: 0 },
          { lane: 1, type: 'barrier', delay: 0.3 },
          { lane: 2, type: 'low', delay: 0.6 }
        ]
      },
      {
        name: 'wall',
        obstacles: [
          { lane: 0, type: 'barrier', delay: 0 },
          { lane: 1, type: 'barrier', delay: 0 },
          { lane: 2, type: 'barrier', delay: 0 }
        ]
      }
    ];
  }

  update(deltaTime, gameSpeed) {
    this.spawnTimer += deltaTime;
    
    const adjustedInterval = this.spawnInterval / (1 + gameSpeed * 0.1);
    
    if (this.spawnTimer >= adjustedInterval) {
      this.spawnTimer = 0;
      this.selectPattern();
      return this.spawnPattern();
    }
    
    return [];
  }

  selectPattern() {
    const availablePatterns = this.patterns.filter(p => {
      if (this.difficulty < 2 && p.name === 'wall') return false;
      if (this.difficulty < 1.5 && p.name === 'mixed') return false;
      return true;
    });
    
    this.currentPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    this.patternIndex = 0;
  }

  spawnPattern() {
    const obstacles = [];
    
    if (this.currentPattern) {
      this.currentPattern.obstacles.forEach(obs => {
        const x = this.gameWidth;
        const y = obs.type === 'barrier' 
          ? this.gameHeight - 100 - 60 
          : this.gameHeight - 100 - 30;
        
        obstacles.push({
          type: 'obstacle',
          obstacleType: obs.type,
          x: x + this.laneWidth * obs.lane,
          y: y,
          lane: obs.lane,
          delay: obs.delay
        });
      });
    }
    
    return obstacles;
  }

  increaseDifficulty() {
    this.difficulty += 0.1;
    this.spawnInterval = Math.max(0.8, this.spawnInterval - 0.05);
  }

  reset() {
    this.difficulty = 1;
    this.spawnInterval = 1.5;
    this.spawnTimer = 0;
  }
}
