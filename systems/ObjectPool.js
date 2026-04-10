// systems/ObjectPool.js
export class ObjectPool {
  constructor(createFn, initialSize = 20) {
    this.createFn = createFn;
    this.pool = [];
    this.activeObjects = new Set();
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get(...args) {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
      if (obj.reset) {
        obj.reset(...args);
      }
    } else {
      obj = this.createFn(...args);
    }
    
    this.activeObjects.add(obj);
    return obj;
  }

  release(obj) {
    if (this.activeObjects.has(obj)) {
      this.activeObjects.delete(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    this.activeObjects.forEach(obj => {
      this.pool.push(obj);
    });
    this.activeObjects.clear();
  }

  forEach(callback) {
    this.activeObjects.forEach(callback);
  }

  filter(predicate) {
    return Array.from(this.activeObjects).filter(predicate);
  }

  get size() {
    return this.activeObjects.size;
  }

  get totalSize() {
    return this.pool.length + this.activeObjects.size;
  }
}
