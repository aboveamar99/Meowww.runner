// main.js
import { Engine } from './game-engine/core/Engine.js';
import { RenderingEngine } from './game-engine/rendering/RenderingEngine.js';
import { PhysicsEngine } from './game-engine/physics/PhysicsEngine.js';
import { InputManager } from './game-engine/input/InputManager.js';
import { GameStateManager } from './game-engine/state/GameStateManager.js';
import { UISystem } from './game-engine/ui/UISystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { DataManager } from './systems/DataManager.js';
import { MenuState } from './states/MenuState.js';
import { GameState } from './states/GameState.js';
import { SettingsState } from './states/SettingsState.js';
import { CharacterState } from './states/CharacterState.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.setupCanvas();
    
    this.engine = new Engine();
    this.renderingEngine = new RenderingEngine(this.canvas);
    this.physicsEngine = new PhysicsEngine();
    this.inputManager = new InputManager();
    this.stateManager = new GameStateManager();
    this.uiSystem = new UISystem();
    this.audioSystem = new AudioSystem();
    this.dataManager = new DataManager();
    
    this.init();
  }

  setupCanvas() {
    const resizeCanvas = () => {
      const container = this.canvas.parentElement;
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  async init() {
    this.renderingEngine.init();
    this.inputManager.init();
    this.uiSystem.init();
    await this.audioSystem.init();
    
    this.engine.registerSystem('rendering', this.renderingEngine);
    this.engine.registerSystem('physics', this.physicsEngine);
    this.engine.registerSystem('input', this.inputManager);
    this.engine.registerSystem('ui', this.uiSystem);
    this.engine.registerSystem('audio', this.audioSystem);
    this.engine.registerSystem('data', this.dataManager);
    
    this.stateManager.registerState('menu', new MenuState(this));
    this.stateManager.registerState('game', new GameState(this));
    this.stateManager.registerState('settings', new SettingsState(this));
    this.stateManager.registerState('characters', new CharacterState(this));
    
    this.setupEventListeners();
    this.setupBackground();
    
    this.stateManager.changeState('menu');
    this.engine.start();
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.uiSystem.handleClick(x, y);
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.uiSystem.handleMouseMove(x, y);
    });
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.audioSystem.setMusicVolume(0);
      } else {
        const settings = this.dataManager.getSettings();
        this.audioSystem.setMusicVolume(settings.musicVolume);
      }
    });
  }

  setupBackground() {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 100;
    bgCanvas.height = 100;
    const bgCtx = bgCanvas.getContext('2d');
    
    bgCtx.fillStyle = '#1A1A2E';
    bgCtx.fillRect(0, 0, 100, 100);
    
    for (let i = 0; i < 100; i++) {
      bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      bgCtx.fillRect(Math.random() * 100, Math.random() * 100, 1, 1);
    }
    
    const bgImage = new Image();
    bgImage.src = bgCanvas.toDataURL();
    
    this.renderingEngine.addParallaxLayer(bgImage, 0.1, 0);
  }
}

window.addEventListener('load', () => {
  new Game();
});
