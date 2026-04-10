// states/MenuState.js
export class MenuState {
  constructor(game) {
    this.game = game;
    this.ui = game.uiSystem;
    this.selectedOption = 0;
    this.options = ['Start Game', 'Characters', 'Settings', 'Daily Reward'];
  }

  enter() {
    this.createMenuUI();
    this.game.audioSystem.playMusic('menu');
  }

  createMenuUI() {
    this.ui.elements.clear();
    
    const centerX = this.game.canvas.width / 2;
    const centerY = this.game.canvas.height / 2;
    
    this.ui.createText('title', 'ENDLESS RUNNER', centerX, 100, {
      fontSize: 48,
      font: 'title',
      align: 'center'
    });
    
    this.ui.createText('highscore', `HIGH SCORE: ${this.game.dataManager.getHighScore()}`, 
      centerX, 180, { fontSize: 20, align: 'center' });
    
    const buttonWidth = 250;
    const buttonHeight = 50;
    const startY = 280;
    const spacing = 70;
    
    this.options.forEach((option, index) => {
      this.ui.createButton(
        `btn_${index}`,
        option,
        centerX - buttonWidth / 2,
        startY + index * spacing,
        buttonWidth,
        buttonHeight,
        () => this.handleOption(index)
      );
    });
    
    this.ui.createText('coins', `💰 ${this.game.dataManager.getTotalCoins()}`, 
      20, 30, { fontSize: 18, font: 'body' });
  }

  handleOption(index) {
    switch (index) {
      case 0:
        this.game.stateManager.changeState('game');
        break;
      case 1:
        this.game.stateManager.pushState('characters');
        break;
      case 2:
        this.game.stateManager.pushState('settings');
        break;
      case 3:
        this.claimDailyReward();
        break;
    }
  }

  claimDailyReward() {
    const result = this.game.dataManager.claimDailyReward();
    
    if (result.claimed) {
      this.showRewardPopup(result.reward, result.streak);
      this.createMenuUI();
    } else {
      this.showMessage('Already claimed today!');
    }
  }

  showRewardPopup(reward, streak) {
    const centerX = this.game.canvas.width / 2;
    const centerY = this.game.canvas.height / 2;
    
    this.ui.createPanel('rewardPopup', centerX - 150, centerY - 100, 300, 200);
    this.ui.createText('rewardTitle', 'DAILY REWARD!', centerX, centerY - 40, 
      { fontSize: 24, align: 'center' });
    this.ui.createText('rewardAmount', `+${reward} COINS`, centerX, centerY, 
      { fontSize: 32, align: 'center', color: '#FFD700' });
    this.ui.createText('rewardStreak', `STREAK: ${streak} DAYS`, centerX, centerY + 40, 
      { fontSize: 16, align: 'center' });
    
    setTimeout(() => {
      this.ui.elements.delete('rewardPopup');
      this.ui.elements.delete('rewardTitle');
      this.ui.elements.delete('rewardAmount');
      this.ui.elements.delete('rewardStreak');
    }, 3000);
  }

  showMessage(text) {
    const centerX = this.game.canvas.width / 2;
    const centerY = this.game.canvas.height / 2;
    
    this.ui.createText('message', text, centerX, centerY + 100, 
      { fontSize: 18, align: 'center', color: '#FF6B6B' });
    
    setTimeout(() => {
      this.ui.elements.delete('message');
    }, 2000);
  }

  update(deltaTime) {
    this.ui.handleMouseMove(this.game.inputManager.mousePosition.x, 
      this.game.inputManager.mousePosition.y);
  }

  render() {
    this.ui.render(this.game.renderingEngine.ctx);
  }

  exit() {
    this.ui.elements.clear();
  }
}
