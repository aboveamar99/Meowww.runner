// systems/DataManager.js
export class DataManager {
  constructor() {
    this.storageKey = 'endless_runner_data';
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      highScore: 0,
      totalCoins: 0,
      unlockedSkins: ['default'],
      selectedSkin: 'default',
      settings: {
        musicVolume: 0.5,
        sfxVolume: 0.7,
        graphics: 'high',
        controls: {
          up: 'ArrowUp',
          down: 'ArrowDown',
          left: 'ArrowLeft',
          right: 'ArrowRight'
        }
      },
      stats: {
        totalGames: 0,
        totalDistance: 0,
        totalCoinsCollected: 0,
        totalObstaclesAvoided: 0
      },
      missions: [],
      dailyRewards: {
        lastClaim: null,
        streak: 0
      }
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  setHighScore(score) {
    if (score > this.data.highScore) {
      this.data.highScore = score;
      this.saveData();
      return true;
    }
    return false;
  }

  addCoins(amount) {
    this.data.totalCoins += amount;
    this.data.stats.totalCoinsCollected += amount;
    this.saveData();
  }

  spendCoins(amount) {
    if (this.data.totalCoins >= amount) {
      this.data.totalCoins -= amount;
      this.saveData();
      return true;
    }
    return false;
  }

  unlockSkin(skinName, cost) {
    if (!this.data.unlockedSkins.includes(skinName)) {
      if (this.spendCoins(cost)) {
        this.data.unlockedSkins.push(skinName);
        this.saveData();
        return true;
      }
    }
    return false;
  }

  selectSkin(skinName) {
    if (this.data.unlockedSkins.includes(skinName)) {
      this.data.selectedSkin = skinName;
      this.saveData();
      return true;
    }
    return false;
  }

  updateStats(stats) {
    Object.assign(this.data.stats, stats);
    this.saveData();
  }

  claimDailyReward() {
    const today = new Date().toDateString();
    const lastClaim = this.data.dailyRewards.lastClaim;
    
    if (lastClaim !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastClaim === yesterday) {
        this.data.dailyRewards.streak++;
      } else {
        this.data.dailyRewards.streak = 1;
      }
      
      this.data.dailyRewards.lastClaim = today;
      
      const reward = this.calculateDailyReward(this.data.dailyRewards.streak);
      this.addCoins(reward);
      this.saveData();
      
      return { claimed: true, reward, streak: this.data.dailyRewards.streak };
    }
    
    return { claimed: false };
  }

  calculateDailyReward(streak) {
    return Math.min(100 + streak * 25, 500);
  }

  updateSettings(settings) {
    Object.assign(this.data.settings, settings);
    this.saveData();
  }

  getSettings() {
    return this.data.settings;
  }

  getHighScore() {
    return this.data.highScore;
  }

  getTotalCoins() {
    return this.data.totalCoins;
  }

  getUnlockedSkins() {
    return this.data.unlockedSkins;
  }

  getSelectedSkin() {
    return this.data.selectedSkin;
  }
      }
