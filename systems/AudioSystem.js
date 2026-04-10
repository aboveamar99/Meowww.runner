// systems/AudioSystem.js
export class AudioSystem {
  constructor() {
    this.sounds = new Map();
    this.music = new Map();
    this.currentMusic = null;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.muted = false;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    
    this.musicGain.gain.value = this.musicVolume;
    this.sfxGain.gain.value = this.sfxVolume;
    
    await this.createProceduralSounds();
    
    this.initialized = true;
  }

  async createProceduralSounds() {
    this.createJumpSound();
    this.createCoinSound();
    this.createHitSound();
    this.createPowerUpSound();
    this.createMenuMusic();
    this.createGameMusic();
  }

  createJumpSound() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.1, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.context.sampleRate;
      const freq = 400 + 400 * Math.exp(-t * 20);
      data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 10);
    }
    
    this.sounds.set('jump', buffer);
  }

  createCoinSound() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.1, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.context.sampleRate;
      const freq = 800 + 200 * Math.sin(t * 20);
      data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 15);
    }
    
    this.sounds.set('coin', buffer);
  }

  createHitSound() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.15, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.context.sampleRate;
      const freq = 200 - 100 * t;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15);
    }
    
    this.sounds.set('hit', buffer);
  }

  createPowerUpSound() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.2, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.context.sampleRate;
      const freq = 600 + 400 * Math.sin(t * 10);
      data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 8);
    }
    
    this.sounds.set('powerup', buffer);
  }

  createMenuMusic() {
    this.music.set('menu', this.createMusicBuffer(120, 'C4'));
  }

  createGameMusic() {
    this.music.set('game', this.createMusicBuffer(140, 'E4'));
  }

  createMusicBuffer(bpm, baseNote) {
    const duration = 4;
    const buffer = this.context.createBuffer(2, this.context.sampleRate * duration, this.context.sampleRate);
    
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    const beatDuration = 60 / bpm;
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / this.context.sampleRate;
        const beat = Math.floor(t / beatDuration) % 8;
        const noteIndex = (beat + channel * 2) % notes.length;
        const freq = this.getFrequency(notes[noteIndex]);
        
        data[i] = Math.sin(2 * Math.PI * freq * t) * 0.1 * Math.sin(Math.PI * t / duration);
        
        if (beat % 4 === 0) {
          data[i] += Math.sin(2 * Math.PI * freq * 2 * t) * 0.05;
        }
      }
    }
    
    return buffer;
  }

  getFrequency(note) {
    const notes = { 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88 };
    return notes[note] || 440;
  }

  playSound(name) {
    if (!this.initialized || this.muted) return;
    
    const buffer = this.sounds.get(name);
    if (!buffer) return;
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.sfxGain);
    source.start();
  }

  playMusic(name, loop = true) {
    if (!this.initialized || this.muted) return;
    
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    
    const buffer = this.music.get(name);
    if (!buffer) return;
    
    this.currentMusic = this.context.createBufferSource();
    this.currentMusic.buffer = buffer;
    this.currentMusic.connect(this.musicGain);
    this.currentMusic.loop = loop;
    this.currentMusic.start();
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.masterGain.gain.value = this.muted ? 0 : 1;
    return this.muted;
  }

  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
          }
