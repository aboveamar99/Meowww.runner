// game-engine/ui/UISystem.js
export class UISystem {
  constructor() {
    this.elements = new Map();
    this.animations = new Map();
    this.themes = new Map();
    this.currentTheme = 'default';
    this.fonts = new Map();
    this.layouts = new Map();
  }

  init() {
    this.loadDefaultTheme();
    this.loadFonts();
  }

  loadDefaultTheme() {
    this.themes.set('default', {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFE66D',
      background: '#1A1A2E',
      text: '#FFFFFF',
      button: '#16213E',
      buttonHover: '#1A1A2E',
      shadow: 'rgba(0, 0, 0, 0.5)'
    });
  }

  loadFonts() {
    this.fonts.set('title', 'bold 48px "Press Start 2P", cursive');
    this.fonts.set('subtitle', '24px "Press Start 2P", cursive');
    this.fonts.set('body', '16px "Roboto", sans-serif');
    this.fonts.set('score', 'bold 32px "Press Start 2P", cursive');
  }

  createElement(id, type, options = {}) {
    const element = {
      id,
      type,
      ...options,
      visible: options.visible !== undefined ? options.visible : true,
      enabled: options.enabled !== undefined ? options.enabled : true,
      animations: []
    };
    
    this.elements.set(id, element);
    return element;
  }

  createButton(id, text, x, y, width, height, onClick) {
    return this.createElement(id, 'button', {
      text,
      x, y, width, height,
      onClick,
      hover: false,
      pressed: false,
      backgroundColor: this.themes.get(this.currentTheme).button,
      hoverColor: this.themes.get(this.currentTheme).buttonHover,
      textColor: this.themes.get(this.currentTheme).text
    });
  }

  createText(id, text, x, y, options = {}) {
    return this.createElement(id, 'text', {
      text,
      x, y,
      fontSize: options.fontSize || 16,
      color: options.color || this.themes.get(this.currentTheme).text,
      align: options.align || 'left',
      font: options.font || 'body'
    });
  }

  createPanel(id, x, y, width, height, options = {}) {
    return this.createElement(id, 'panel', {
      x, y, width, height,
      backgroundColor: options.backgroundColor || this.themes.get(this.currentTheme).background,
      borderColor: options.borderColor || this.themes.get(this.currentTheme).primary,
      borderWidth: options.borderWidth || 2,
      borderRadius: options.borderRadius || 10,
      padding: options.padding || 10
    });
  }

  createProgressBar(id, x, y, width, height, options = {}) {
    return this.createElement(id, 'progressBar', {
      x, y, width, height,
      value: options.value || 0,
      maxValue: options.maxValue || 100,
      backgroundColor: options.backgroundColor || '#333',
      fillColor: options.fillColor || this.themes.get(this.currentTheme).primary,
      borderRadius: options.borderRadius || 5
    });
  }

  animate(id, property, from, to, duration, easing = 'linear') {
    const animation = {
      id: Date.now() + Math.random(),
      elementId: id,
      property,
      from,
      to,
      duration,
      easing,
      progress: 0,
      startTime: performance.now()
    };
    
    if (!this.animations.has(id)) {
      this.animations.set(id, []);
    }
    this.animations.get(id).push(animation);
  }

  updateAnimations() {
    const currentTime = performance.now();
    
    this.animations.forEach((animations, elementId) => {
      const element = this.elements.get(elementId);
      if (!element) return;
      
      const remainingAnimations = animations.filter(anim => {
        const elapsed = currentTime - anim.startTime;
        anim.progress = Math.min(elapsed / anim.duration, 1);
        
        let easedProgress = anim.progress;
        if (anim.easing === 'easeInOut') {
          easedProgress = anim.progress < 0.5 
            ? 2 * anim.progress * anim.progress 
            : 1 - Math.pow(-2 * anim.progress + 2, 2) / 2;
        } else if (anim.easing === 'easeOut') {
          easedProgress = 1 - Math.pow(1 - anim.progress, 3);
        } else if (anim.easing === 'easeIn') {
          easedProgress = anim.progress * anim.progress * anim.progress;
        }
        
        element[anim.property] = anim.from + (anim.to - anim.from) * easedProgress;
        
        return anim.progress < 1;
      });
      
      if (remainingAnimations.length > 0) {
        this.animations.set(elementId, remainingAnimations);
      } else {
        this.animations.delete(elementId);
      }
    });
  }

  render(ctx) {
    this.updateAnimations();
    
    const sortedElements = Array.from(this.elements.values())
      .filter(el => el.visible)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    sortedElements.forEach(element => {
      if (!element.enabled) return;
      
      switch (element.type) {
        case 'button':
          this.renderButton(ctx, element);
          break;
        case 'text':
          this.renderText(ctx, element);
          break;
        case 'panel':
          this.renderPanel(ctx, element);
          break;
        case 'progressBar':
          this.renderProgressBar(ctx, element);
          break;
      }
    });
  }

  renderButton(ctx, element) {
    ctx.save();
    
    const color = element.hover ? element.hoverColor : element.backgroundColor;
    ctx.fillStyle = color;
    ctx.shadowColor = this.themes.get(this.currentTheme).shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    
    this.roundRect(ctx, element.x, element.y, element.width, element.height, 8);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.font = this.fonts.get('body');
    ctx.fillStyle = element.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      element.text,
      element.x + element.width / 2,
      element.y + element.height / 2
    );
    
    ctx.restore();
  }

  renderText(ctx, element) {
    ctx.save();
    ctx.font = this.fonts.get(element.font) || `${element.fontSize}px Arial`;
    ctx.fillStyle = element.color;
    ctx.textAlign = element.align;
    ctx.textBaseline = 'top';
    ctx.fillText(element.text, element.x, element.y);
    ctx.restore();
  }

  renderPanel(ctx, element) {
    ctx.save();
    ctx.fillStyle = element.backgroundColor;
    ctx.strokeStyle = element.borderColor;
    ctx.lineWidth = element.borderWidth;
    
    this.roundRect(ctx, element.x, element.y, element.width, element.height, element.borderRadius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderProgressBar(ctx, element) {
    ctx.save();
    
    ctx.fillStyle = element.backgroundColor;
    this.roundRect(ctx, element.x, element.y, element.width, element.height, element.borderRadius);
    ctx.fill();
    
    const fillWidth = (element.value / element.maxValue) * element.width;
    ctx.fillStyle = element.fillColor;
    this.roundRect(ctx, element.x, element.y, fillWidth, element.height, element.borderRadius);
    ctx.fill();
    
    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  handleClick(x, y) {
    let handled = false;
    
    this.elements.forEach(element => {
      if (!element.visible || !element.enabled) return;
      if (element.type !== 'button') return;
      
      if (x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height) {
        if (element.onClick) {
          element.onClick();
          handled = true;
        }
      }
    });
    
    return handled;
  }

  handleMouseMove(x, y) {
    this.elements.forEach(element => {
      if (!element.visible || !element.enabled) return;
      if (element.type !== 'button') return;
      
      element.hover = x >= element.x && x <= element.x + element.width &&
                      y >= element.y && y <= element.y + element.height;
    });
  }
    }
