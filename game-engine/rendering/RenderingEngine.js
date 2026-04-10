// game-engine/rendering/RenderingEngine.js
export class RenderingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.layers = new Map();
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.effects = new Set();
    this.parallaxLayers = [];
    this.particles = [];
    this.glowEnabled = true;
    this.motionBlurEnabled = false;
    this.previousFrame = null;
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.previousFrame = this.ctx.getImageData(0, 0, this.width, this.height);
  }

  resize() {
    const container = this.canvas.parentElement;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.previousFrame = this.ctx.getImageData(0, 0, this.width, this.height);
  }

  addLayer(name, zIndex = 0) {
    const layer = {
      name,
      zIndex,
      objects: new Set(),
      visible: true
    };
    this.layers.set(name, layer);
    return layer;
  }

  addParallaxLayer(image, speed, yOffset = 0) {
    this.parallaxLayers.push({
      image,
      speed,
      yOffset,
      offset: 0
    });
  }

  addParticle(particle) {
    this.particles.push(particle);
  }

  render(deltaTime) {
    if (this.motionBlurEnabled && this.previousFrame) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.putImageData(this.previousFrame, 0, 0);
      this.ctx.globalAlpha = 1;
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    this.renderParallax(deltaTime);
    this.renderLayers();
    this.renderParticles(deltaTime);
    this.renderEffects();

    if (this.motionBlurEnabled) {
      this.previousFrame = this.ctx.getImageData(0, 0, this.width, this.height);
    }
  }

  renderParallax(deltaTime) {
    this.parallaxLayers.sort((a, b) => a.speed - b.speed);
    
    this.parallaxLayers.forEach(layer => {
      layer.offset += layer.speed * deltaTime * 100;
      if (layer.offset >= this.width) layer.offset = 0;

      const img = layer.image;
      if (!img) return;

      const scale = this.height / img.height;
      const scaledWidth = img.width * scale;

      this.ctx.drawImage(
        img,
        -layer.offset,
        layer.yOffset,
        scaledWidth,
        this.height
      );
      this.ctx.drawImage(
        img,
        -layer.offset + scaledWidth,
        layer.yOffset,
        scaledWidth,
        this.height
      );
    });
  }

  renderLayers() {
    const sortedLayers = Array.from(this.layers.values())
      .filter(l => l.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    sortedLayers.forEach(layer => {
      layer.objects.forEach(obj => {
        if (obj.render) {
          obj.render(this.ctx, this.camera);
        }
      });
    });
  }

  renderParticles(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.update(deltaTime);
      p.render(this.ctx);
      return p.life > 0;
    });
  }

  renderEffects() {
    this.effects.forEach(effect => {
      effect.render(this.ctx);
    });
  }

  applyGlow(ctx, color, blur = 10) {
    if (!this.glowEnabled) return;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  resetGlow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  }
