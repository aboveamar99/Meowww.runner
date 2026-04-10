// game-engine/core/Engine.js
export class Engine {
  constructor() {
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fixedDeltaTime = 1 / 60;
    this.accumulator = 0;
    this.isRunning = false;
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.currentFps = 60;
    this.systems = new Map();
    this.updateCallbacks = new Set();
    this.fixedUpdateCallbacks = new Set();
    this.renderCallbacks = new Set();
  }

  registerSystem(name, system) {
    this.systems.set(name, system);
    if (system.init) system.init();
  }

  getSystem(name) {
    return this.systems.get(name);
  }

  addUpdateCallback(callback) {
    this.updateCallbacks.add(callback);
  }

  addFixedUpdateCallback(callback) {
    this.fixedUpdateCallbacks.add(callback);
  }

  addRenderCallback(callback) {
    this.renderCallbacks.add(callback);
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    requestAnimationFrame((time) => this.gameLoop(time));

    this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.033);
    this.lastTime = currentTime;

    this.accumulator += this.deltaTime;

    while (this.accumulator >= this.fixedDeltaTime) {
      this.fixedUpdateCallbacks.forEach(cb => cb(this.fixedDeltaTime));
      this.accumulator -= this.fixedDeltaTime;
    }

    this.updateCallbacks.forEach(cb => cb(this.deltaTime));
    this.renderCallbacks.forEach(cb => cb(this.deltaTime));

    this.frameCount++;
    this.fpsTimer += this.deltaTime;
    if (this.fpsTimer >= 1) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }
  }
}
