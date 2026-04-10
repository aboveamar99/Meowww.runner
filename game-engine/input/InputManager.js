// game-engine/input/InputManager.js
export class InputManager {
  constructor() {
    this.keys = new Map();
    this.touches = new Map();
    this.mousePosition = { x: 0, y: 0 };
    this.gestures = new Map();
    this.swipeThreshold = 50;
    this.tapThreshold = 200;
    this.longPressThreshold = 500;
    this.bindings = new Map();
    this.enabled = true;
    
    this.touchStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.isLongPress = false;
  }

  init() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    
    this.registerGesture('swipeUp', () => {});
    this.registerGesture('swipeDown', () => {});
    this.registerGesture('swipeLeft', () => {});
    this.registerGesture('swipeRight', () => {});
    this.registerGesture('tap', () => {});
    this.registerGesture('longPress', () => {});
  }

  registerGesture(name, callback) {
    this.gestures.set(name, callback);
  }

  bindKey(key, action) {
    if (!this.bindings.has(key)) {
      this.bindings.set(key, new Set());
    }
    this.bindings.get(key).add(action);
  }

  handleKeyDown(e) {
    if (!this.enabled) return;
    this.keys.set(e.code, true);
    
    const actions = this.bindings.get(e.code);
    if (actions) {
      actions.forEach(action => action(true));
    }
  }

  handleKeyUp(e) {
    if (!this.enabled) return;
    this.keys.set(e.code, false);
    
    const actions = this.bindings.get(e.code);
    if (actions) {
      actions.forEach(action => action(false));
    }
  }

  handleTouchStart(e) {
    if (!this.enabled) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    
    this.touches.set(touch.identifier, {
      x: touch.clientX,
      y: touch.clientY,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    });

    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.gestures.get('longPress')();
    }, this.longPressThreshold);
  }

  handleTouchMove(e) {
    if (!this.enabled) return;
    e.preventDefault();
    
    Array.from(e.touches).forEach(touch => {
      this.touches.set(touch.identifier, {
        ...this.touches.get(touch.identifier),
        x: touch.clientX,
        y: touch.clientY
      });
    });
  }

  handleTouchEnd(e) {
    if (!this.enabled) return;
    e.preventDefault();
    
    clearTimeout(this.longPressTimer);
    
    const touch = e.changedTouches[0];
    const touchData = this.touches.get(touch.identifier);
    
    if (touchData) {
      const deltaX = touch.clientX - touchData.startX;
      const deltaY = touch.clientY - touchData.startY;
      const deltaTime = Date.now() - touchData.startTime;
      
      if (Math.abs(deltaX) > this.swipeThreshold) {
        if (deltaX > 0) {
          this.gestures.get('swipeRight')();
        } else {
          this.gestures.get('swipeLeft')();
        }
      } else if (Math.abs(deltaY) > this.swipeThreshold) {
        if (deltaY > 0) {
          this.gestures.get('swipeDown')();
        } else {
          this.gestures.get('swipeUp')();
        }
      } else if (!this.isLongPress && deltaTime < this.tapThreshold) {
        this.gestures.get('tap')();
      }
      
      this.touches.delete(touch.identifier);
    }
    
    this.isLongPress = false;
  }

  handleMouseMove(e) {
    if (!this.enabled) return;
    this.mousePosition = { x: e.clientX, y: e.clientY };
  }

  handleMouseDown(e) {
    if (!this.enabled) return;
    this.keys.set('Mouse' + e.button, true);
  }

  handleMouseUp(e) {
    if (!this.enabled) return;
    this.keys.set('Mouse' + e.button, false);
  }

  isKeyPressed(key) {
    return this.keys.get(key) || false;
  }

  getAxis(name) {
    let value = 0;
    if (name === 'Horizontal') {
      if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) value += 1;
      if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) value -= 1;
    } else if (name === 'Vertical') {
      if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) value -= 1;
      if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) value += 1;
    }
    return value;
  }
                                       }
