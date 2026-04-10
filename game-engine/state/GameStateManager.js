// game-engine/state/GameStateManager.js
export class GameStateManager {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.stateStack = [];
  }

  registerState(name, state) {
    this.states.set(name, state);
    if (state.init) state.init();
  }

  changeState(name, data = {}) {
    if (this.currentState) {
      if (this.states.get(this.currentState).exit) {
        this.states.get(this.currentState).exit();
      }
      this.previousState = this.currentState;
    }
    
    this.currentState = name;
    const state = this.states.get(name);
    
    if (state.enter) state.enter(data);
  }

  pushState(name, data = {}) {
    if (this.currentState) {
      this.stateStack.push(this.currentState);
    }
    this.changeState(name, data);
  }

  popState() {
    if (this.stateStack.length > 0) {
      const previousState = this.stateStack.pop();
      this.changeState(previousState);
    }
  }

  update(deltaTime) {
    if (this.currentState) {
      const state = this.states.get(this.currentState);
      if (state.update) state.update(deltaTime);
    }
  }

  render(ctx) {
    if (this.currentState) {
      const state = this.states.get(this.currentState);
      if (state.render) state.render(ctx);
    }
  }
}
