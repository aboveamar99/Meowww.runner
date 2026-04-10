// systems/AdaptiveDifficulty.js
export class AdaptiveDifficulty {
  constructor() {
    this.playerPerformance = [];
    this.difficultyLevel = 1;
    this.maxDifficulty = 3;
    this.adaptationRate = 0.1;
    this.scoreHistory = [];
    this.survivalTimeHistory = [];
    this.collisionHistory = [];
  }

  update(playerScore, survivalTime, collisions, deltaTime) {
    this.scoreHistory.push(playerScore);
    this.survivalTimeHistory.push(survivalTime);
    this.collisionHistory.push(collisions);
    
    if (this.scoreHistory.length > 10) {
      this.scoreHistory.shift();
      this.survivalTimeHistory.shift();
      this.collisionHistory.shift();
    }
    
    const avgScore = this.getAverage(this.scoreHistory);
    const avgSurvival = this.getAverage(this.survivalTimeHistory);
    const avgCollisions = this.getAverage(this.collisionHistory);
    
    let targetDifficulty = 1;
    
    if (avgScore > 1000 && avgSurvival > 30 && avgCollisions < 2) {
      targetDifficulty = 3;
    } else if (avgScore > 500 && avgSurvival > 15 && avgCollisions < 5) {
      targetDifficulty = 2;
    } else if (avgScore > 200 && avgSurvival > 5) {
      targetDifficulty = 1.5;
    }
    
    this.difficultyLevel += (targetDifficulty - this.difficultyLevel) * this.adaptationRate;
    this.difficultyLevel = Math.max(1, Math.min(this.maxDifficulty, this.difficultyLevel));
    
    return this.difficultyLevel;
  }

  getAverage(array) {
    if (array.length === 0) return 0;
    return array.reduce((a, b) => a + b, 0) / array.length;
  }

  getDifficultyMultiplier() {
    return this.difficultyLevel;
  }

  reset() {
    this.difficultyLevel = 1;
    this.scoreHistory = [];
    this.survivalTimeHistory = [];
    this.collisionHistory = [];
  }
}
