// ===== audio.js - سیستم صدا =====
var Audio = {
  ctx: null,
  enabled: true,
  volume: 0.7,
  
  // راه‌اندازی
  init: function() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    } catch(e) { console.log('Audio not supported'); }
    
    var saved = localStorage.getItem('setareh_sound');
    if (saved === 'off') this.enabled = false;
    var vol = localStorage.getItem('setareh_volume');
    if (vol) this.volume = parseFloat(vol);
  },
  
  // پخش صدای ساده (بدون فایل خارجی)
  play: function(type) {
    if (!this.enabled || !this.ctx) return;
    
    try {
      var now = this.ctx.currentTime;
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      // تنظیمات هر صدا
      var config = this.getConfig(type);
      osc.type = config.wave || 'sine';
      osc.frequency.setValueAtTime(config.freq, now);
      if (config.sweep) {
        osc.frequency.exponentialRampToValueAtTime(config.sweep, now + config.dur);
      }
      
      gain.gain.setValueAtTime(this.volume * (config.vol || 0.1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + config.dur);
      
      osc.start(now);
      osc.stop(now + config.dur);
      
      // صدای دوم اگر لازم بود
      if (config.freq2) {
        var osc2 = this.ctx.createOscillator();
        var gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.type = config.wave || 'sine';
        osc2.frequency.setValueAtTime(config.freq2, now + (config.delay || 0.08));
        gain2.gain.setValueAtTime(this.volume * (config.vol || 0.1), now + (config.delay || 0.08));
        gain2.gain.exponentialRampToValueAtTime(0.001, now + (config.delay || 0.08) + config.dur);
        osc2.start(now + (config.delay || 0.08));
        osc2.stop(now + (config.delay || 0.08) + config.dur);
      }
    } catch(e) {}
  },
  
  // تنظیمات هر نوع صدا
  getConfig: function(type) {
    var configs = {
      click:      { freq: 800,  dur: 0.06, wave: 'sine',     vol: 0.08 },
      tap:        { freq: 600,  dur: 0.05, wave: 'sine',     vol: 0.06 },
      success:    { freq: 523,  dur: 0.15, wave: 'sine',     vol: 0.12, freq2: 784, sweep: 1046, delay: 0.1 },
      win:        { freq: 659,  dur: 0.2,  wave: 'triangle', vol: 0.13, freq2: 880, sweep: 1320, delay: 0.12 },
      lose:       { freq: 300,  dur: 0.3,  wave: 'sawtooth', vol: 0.1,  sweep: 150 },
      coin:       { freq: 1200, dur: 0.08, wave: 'sine',     vol: 0.1,  freq2: 1600, delay: 0.05 },
      purchase:   { freq: 880,  dur: 0.1,  wave: 'sine',     vol: 0.12, freq2: 1320, sweep: 1760, delay: 0.08 },
      notify:     { freq: 660,  dur: 0.15, wave: 'sine',     vol: 0.1,  freq2: 990, delay: 0.1 },
      error:      { freq: 200,  dur: 0.2,  wave: 'square',   vol: 0.08 },
      jump:       { freq: 500,  dur: 0.1,  wave: 'sine',     vol: 0.1,  sweep: 800 },
      flip:       { freq: 700,  dur: 0.08, wave: 'triangle', vol: 0.08 },
      match:      { freq: 900,  dur: 0.1,  wave: 'sine',     vol: 0.12, freq2: 1200, delay: 0.06 },
      countdown:  { freq: 440,  dur: 0.15, wave: 'sine',     vol: 0.1 },
      explosion:  { freq: 150,  dur: 0.4,  wave: 'sawtooth', vol: 0.15, sweep: 50 },
      levelup:    { freq: 523,  dur: 0.15, wave: 'triangle', vol: 0.12, freq2: 784, sweep: 1046, delay: 0.12 },
      swipe:      { freq: 400,  dur: 0.08, wave: 'sine',     vol: 0.06, sweep: 700 }
    };
    return configs[type] || configs.click;
  },
  
  // روشن/خاموش کردن
  toggle: function() {
    this.enabled = !this.enabled;
    localStorage.setItem('setareh_sound', this.enabled ? 'on' : 'off');
    return this.enabled;
  },
  
  // تغییر صدا
  setVolume: function(v) {
    this.volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('setareh_volume', this.volume);
  },
  
  // راه‌اندازی خودکار پس از اولین تعامل کاربر
  autoInit: function() {
    var self = this;
    var initOnce = function() {
      self.init();
      document.removeEventListener('click', initOnce);
      document.removeEventListener('touchstart', initOnce);
    };
    document.addEventListener('click', initOnce);
    document.addEventListener('touchstart', initOnce);
  }
};

// راه‌اندازی اولیه
Audio.init();
Audio.autoInit();

// تابع کمکی
function playSnd(type) {
  Audio.play(type);
      }
