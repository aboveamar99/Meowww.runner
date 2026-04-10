// states/SettingsState.js
export class SettingsState {
  constructor(game) {
    this.game = game;
    this.ui = game.uiSystem;
    this.data = game.dataManager;
    this.audio = game.audioSystem;
    this.settings = this.data.getSettings();
  }

  enter() {
    this.createUI();
  }

  createUI() {
    this.ui.elements.clear();
    
    const centerX = this.game.canvas.width / 2;
    let currentY = 100;
    
    this.ui.createText('title', 'SETTINGS', centerX, currentY, 
      { fontSize: 36, font: 'title', align: 'center' });
    
    currentY += 80;
    
    this.ui.createText('musicLabel', 'MUSIC VOLUME', centerX - 200, currentY, 
      { fontSize: 18 });
    
    this.ui.createProgressBar('musicVolume', centerX + 50, currentY - 10, 200, 20, 
      { value: this.settings.musicVolume * 100, maxValue: 100 });
    
    this.createVolumeButtons(centerX + 270, currentY - 10, 'music');
    
    currentY += 60;
    
    this.ui.createText('sfxLabel', 'SFX VOLUME', centerX - 200, currentY, 
      { fontSize: 18 });
    
    this.ui.createProgressBar('sfxVolume', centerX + 50, currentY - 10, 200, 20, 
      { value: this.settings.sfxVolume * 100, maxValue: 100 });
    
    this.createVolumeButtons(centerX + 270, currentY - 10, 'sfx');
    
    currentY += 60;
    
    this.ui.createText('graphicsLabel', 'GRAPHICS', centerX - 200, currentY, 
      { fontSize: 18 });
    
    const graphicsOptions = ['low', 'medium', 'high'];
    graphicsOptions.forEach((option, index) => {
      const x = centerX + 50 + index * 80;
      this.ui.createButton(`graphics_${option}`, option.toUpperCase(), x, currentY - 10, 70, 30, 
        () => this.setGraphics(option));
    });
    
    currentY += 80;
    
    this.ui.createButton('backBtn', 'BACK', centerX - 100, currentY, 200, 50, 
      () => this.game.stateManager.popState());
  }

  createVolumeButtons(x, y, type) {
    this.ui.createButton(`${type}_down`, '-', x, y, 30, 20, 
      () => this.adjustVolume(type, -0.1));
    
    this.ui.createButton(`${type}_up`, '+', x + 40, y, 30, 20, 
      () => this.adjustVolume(type, 0.1));
  }

  adjustVolume(type, delta) {
    const newVolume = Math.max(0, Math.min(1, this.settings[`${type}Volume`] + delta));
    this.settings[`${type}Volume`] = newVolume;
    
    if (type === 'music') {
      this.audio.setMusicVolume(newVolume);
      this.ui.elements.get('musicVolume').value = newVolume * 100;
    } else {
      this.audio.setSfxVolume(newVolume);
      this.ui.elements.get('sfxVolume').value = newVolume * 100;
    }
    
    this.data.updateSettings(this.settings);
  }

  setGraphics(quality) {
    this.settings.graphics = quality;
    this.data.updateSettings(this.settings);
    
    this.game.renderingEngine.glowEnabled = quality !== 'low';
    this.game.renderingEngine.motionBlurEnabled = quality === 'high';
  }

  update(deltaTime) {
    this.ui.handleMouseMove(
      this.game.inputManager.mousePosition.x,
      this.game.inputManager.mousePosition.y
    );
  }

  render() {
    this.ui.render(this.game.renderingEngine.ctx);
  }

  exit() {
    this.ui.elements.clear();
  }
}
