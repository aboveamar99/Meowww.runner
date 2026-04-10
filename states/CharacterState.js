// states/CharacterState.js
export class CharacterState {
  constructor(game) {
    this.game = game;
    this.ui = game.uiSystem;
    this.data = game.dataManager;
    this.skins = [
      { id: 'default', name: 'Runner', cost: 0, color: '#FF6B6B' },
      { id: 'speedster', name: 'Speedster', cost: 500, color: '#4ECDC4' },
      { id: 'tank', name: 'Tank', cost: 1000, color: '#E74C3C' },
      { id: 'ghost', name: 'Ghost', cost: 1500, color: '#9B59B6' },
      { id: 'gold', name: 'Gold', cost: 2000, color: '#FFD700' }
    ];
    this.selectedIndex = 0;
  }

  enter() {
    this.createUI();
    this.updateSkinDisplay();
  }

  createUI() {
    this.ui.elements.clear();
    
    const centerX = this.game.canvas.width / 2;
    
    this.ui.createText('title', 'CHARACTERS', centerX, 50, 
      { fontSize: 36, font: 'title', align: 'center' });
    
    this.ui.createText('coins', `💰 ${this.data.getTotalCoins()}`, 
      centerX, 100, { fontSize: 24, align: 'center' });
    
    this.ui.createButton('prevBtn', '<', 50, 300, 50, 50, 
      () => this.previousSkin());
    
    this.ui.createButton('nextBtn', '>', this.game.canvas.width - 100, 300, 50, 50, 
      () => this.nextSkin());
    
    this.ui.createButton('selectBtn', 'SELECT', centerX - 100, 450, 200, 50, 
      () => this.selectSkin());
    
    this.ui.createButton('unlockBtn', 'UNLOCK', centerX - 100, 450, 200, 50, 
      () => this.unlockSkin());
    
    this.ui.createButton('backBtn', 'BACK', centerX - 100, 520, 200, 50, 
      () => this.game.stateManager.popState());
    
    this.ui.createPanel('skinPreview', centerX - 75, 200, 150, 150);
  }

  updateSkinDisplay() {
    const skin = this.skins[this.selectedIndex];
    const unlocked = this.data.getUnlockedSkins().includes(skin.id);
    const selected = this.data.getSelectedSkin() === skin.id;
    
    this.ui.elements.get('selectBtn').visible = unlocked && !selected;
    this.ui.elements.get('unlockBtn').visible = !unlocked;
    
    if (this.ui.elements.has('skinName')) {
      this.ui.elements.delete('skinName');
      this.ui.elements.delete('skinStatus');
      this.ui.elements.delete('skinCost');
    }
    
    const centerX = this.game.canvas.width / 2;
    
    this.ui.createText('skinName', skin.name, centerX, 170, 
      { fontSize: 24, align: 'center' });
    
    if (unlocked) {
      const status = selected ? 'SELECTED' : 'UNLOCKED';
      this.ui.createText('skinStatus', status, centerX, 370, 
        { fontSize: 18, align: 'center', color: selected ? '#4ECDC4' : '#FFFFFF' });
    } else {
      this.ui.createText('skinCost', `COST: ${skin.cost}`, centerX, 370, 
        { fontSize: 18, align: 'center', color: '#FFD700' });
    }
  }

  previousSkin() {
    this.selectedIndex = (this.selectedIndex - 1 + this.skins.length) % this.skins.length;
    this.updateSkinDisplay();
  }

  nextSkin() {
    this.selectedIndex = (this.selectedIndex + 1) % this.skins.length;
    this.updateSkinDisplay();
  }

  selectSkin() {
    const skin = this.skins[this.selectedIndex];
    if (this.data.selectSkin(skin.id)) {
      this.updateSkinDisplay();
    }
  }

  unlockSkin() {
    const skin = this.skins[this.selectedIndex];
    if (this.data.unlockSkin(skin.id, skin.cost)) {
      this.updateSkinDisplay();
      this.ui.elements.get('coins').text = `💰 ${this.data.getTotalCoins()}`;
    } else {
      this.showMessage('Not enough coins!');
    }
  }

  showMessage(text) {
    const centerX = this.game.canvas.width / 2;
    
    this.ui.createText('message', text, centerX, 400, 
      { fontSize: 18, align: 'center', color: '#FF6B6B' });
    
    setTimeout(() => {
      this.ui.elements.delete('message');
    }, 2000);
  }

  update(deltaTime) {
    this.ui.handleMouseMove(
      this.game.inputManager.mousePosition.x,
      this.game.inputManager.mousePosition.y
    );
  }

  render() {
    this.ui.render(this.game.renderingEngine.ctx);
    
    const centerX = this.game.canvas.width / 2;
    const ctx = this.game.renderingEngine.ctx;
    const skin = this.skins[this.selectedIndex];
    
    ctx.save();
    ctx.fillStyle = skin.color;
    ctx.fillRect(centerX - 50, 225, 100, 100);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 50, 225, 100, 100);
    ctx.restore();
  }

  exit() {
    this.ui.elements.clear();
  }
  }
