// game-engine/physics/PhysicsEngine.js
export class PhysicsEngine {
  constructor() {
    this.gravity = 15;
    this.colliders = new Set();
    this.collisionPairs = new Map();
    this.spatialGrid = new Map();
    this.gridCellSize = 50;
  }

  addCollider(obj) {
    this.colliders.add(obj);
    this.updateSpatialGrid(obj);
  }

  removeCollider(obj) {
    this.colliders.delete(obj);
    this.removeFromSpatialGrid(obj);
  }

  updateSpatialGrid(obj) {
    const key = this.getGridKey(obj.x, obj.y);
    if (!this.spatialGrid.has(key)) {
      this.spatialGrid.set(key, new Set());
    }
    this.spatialGrid.get(key).add(obj);
  }

  removeFromSpatialGrid(obj) {
    const key = this.getGridKey(obj.x, obj.y);
    if (this.spatialGrid.has(key)) {
      this.spatialGrid.get(key).delete(obj);
    }
  }

  getGridKey(x, y) {
    const gridX = Math.floor(x / this.gridCellSize);
    const gridY = Math.floor(y / this.gridCellSize);
    return `${gridX},${gridY}`;
  }

  getNearbyObjects(obj, radius = 1) {
    const nearby = new Set();
    const centerKey = this.getGridKey(obj.x, obj.y);
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const key = this.getGridKey(
          obj.x + dx * this.gridCellSize,
          obj.y + dy * this.gridCellSize
        );
        if (this.spatialGrid.has(key)) {
          this.spatialGrid.get(key).forEach(o => nearby.add(o));
        }
      }
    }
    
    return nearby;
  }

  checkCollision(obj1, obj2) {
    if (!obj1.collider || !obj2.collider) return false;
    if (obj1 === obj2) return false;

    const c1 = obj1.collider;
    const c2 = obj2.collider;

    if (c1.type === 'aabb' && c2.type === 'aabb') {
      return this.aabbCollision(
        obj1.x + c1.offsetX, obj1.y + c1.offsetY, c1.width, c1.height,
        obj2.x + c2.offsetX, obj2.y + c2.offsetY, c2.width, c2.height
      );
    }

    if (c1.type === 'circle' && c2.type === 'circle') {
      return this.circleCollision(
        obj1.x + c1.offsetX, obj1.y + c1.offsetY, c1.radius,
        obj2.x + c2.offsetX, obj2.y + c2.offsetY, c2.radius
      );
    }

    return false;
  }

  aabbCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < r1 + r2;
  }

  update(deltaTime) {
    this.spatialGrid.clear();
    this.colliders.forEach(obj => this.updateSpatialGrid(obj));

    this.colliders.forEach(obj1 => {
      const nearby = this.getNearbyObjects(obj1);
      nearby.forEach(obj2 => {
        if (obj1 === obj2) return;
        
        const pairKey = this.getPairKey(obj1, obj2);
        const wasColliding = this.collisionPairs.has(pairKey);
        const isColliding = this.checkCollision(obj1, obj2);

        if (isColliding && !wasColliding) {
          this.collisionPairs.set(pairKey, { obj1, obj2 });
          if (obj1.onCollisionEnter) obj1.onCollisionEnter(obj2);
          if (obj2.onCollisionEnter) obj2.onCollisionEnter(obj1);
        } else if (isColliding && wasColliding) {
          if (obj1.onCollisionStay) obj1.onCollisionStay(obj2);
          if (obj2.onCollisionStay) obj2.onCollisionStay(obj1);
        } else if (!isColliding && wasColliding) {
          this.collisionPairs.delete(pairKey);
          if (obj1.onCollisionExit) obj1.onCollisionExit(obj2);
          if (obj2.onCollisionExit) obj2.onCollisionExit(obj1);
        }
      });
    });
  }

  getPairKey(obj1, obj2) {
    return obj1.id < obj2.id ? `${obj1.id}-${obj2.id}` : `${obj2.id}-${obj1.id}`;
  }

  applyGravity(obj, deltaTime) {
    if (obj.useGravity) {
      obj.velocityY += this.gravity * deltaTime;
      obj.y += obj.velocityY * deltaTime;
      
      if (obj.y >= obj.groundY) {
        obj.y = obj.groundY;
        obj.velocityY = 0;
        obj.isGrounded = true;
      } else {
        obj.isGrounded = false;
      }
    }
  }
        }
