// ===== state.js - State مرکزی ستاره با Observer pattern =====

var STATE = {

  // داده‌های مرکزی
  _data: {
    user: null,
    settings: {
      lang: 'fa',
      sound: true,
      theme: 'theme_purple',
      soundPack: 'sound_basic'
    },
    currentView: 'home',
    games: {
      rps:    { wins: 0, losses: 0, draws: 0, level: 1 },
      guess:  { wins: 0, best: 0, level: 1 },
      ttt:    { wins: 0, losses: 0, draws: 0, level: 1 },
      memory: { wins: 0, best: 0, level: 1 }
    },
    stats: {
      totalGames: 0,
      totalCoins: 0,
      streak: 0,
      lastPlay: null
    }
  },

  // شنوندگان تغییرات (callbacks)
  _listeners: {},

  // ---------- راه‌اندازی ----------
  init: function() {
    // اگر کاربر قبلاً ذخیره شده، بازیابی کن
    var savedUser = STORAGE.get('user', null);
    if (savedUser) {
      this._data.user = savedUser;
    } else {
      // کاربر جدید
      this._data.user = this._defaultUser();
      STORAGE.set('user', this._data.user);
    }

    // تنظیمات
    var savedSettings = STORAGE.get('settings', null);
    if (savedSettings) {
      this._data.settings = Object.assign(this._data.settings, savedSettings);
    }

    // آمار بازی‌ها
    var savedGames = STORAGE.get('games', null);
    if (savedGames) {
      this._data.games = Object.assign(this._data.games, savedGames);
    }

    // آمار کلی
    var savedStats = STORAGE.get('stats', null);
    if (savedStats) {
      this._data.stats = Object.assign(this._data.stats, savedStats);
    }
  },

  // ---------- کاربر پیش‌فرض ----------
  _defaultUser: function() {
    return {
      name: '',
      bio: '',
      avatar: 'male',
      avatarImage: '',
      selectedTick: 'star_black',
      ownedTicks: ['star_black'],
      ownedThemes: ['theme_purple'],
      ownedSounds: ['sound_basic'],
      ownedSymbols: ['sym_moon'],
      activeSymbol: 'sym_moon',
      activeTheme: 'theme_purple',
      activeSound: 'sound_basic',
      activeTick: 'star_black',
      coins: 100,
      xp: 0,
      level: 1,
      streak: 0,
      joinedAt: new Date().toISOString()
    };
  },

  // ---------- خواندن ----------
  get: function(path) {
    if (!path) return this._data;
    var parts = path.split('.');
    var curr = this._data;
    for (var i = 0; i < parts.length; i++) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[parts[i]];
    }
    return curr;
  },

  // ---------- نوشتن ----------
  set: function(path, value) {
    var parts = path.split('.');
    var curr = this._data;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = value;
    this._emit(path, value);
  },

  // ---------- ذخیره در localStorage ----------
  save: function(path) {
    if (!path) {
      // ذخیره همه
      STORAGE.set('user', this._data.user);
      STORAGE.set('settings', this._data.settings);
      STORAGE.set('games', this._data.games);
      STORAGE.set('stats', this._data.stats);
      return;
    }

    var root = path.split('.')[0];
    var value = this.get(root);
    STORAGE.set(root, value);
  },

  // ---------- به‌روزرسانی با آبجکت ----------
  update: function(path, updates) {
    var current = this.get(path) || {};
    var merged = Object.assign({}, current, updates);
    this.set(path, merged);
  },

  // ---------- افزودن به مقدار (برای سکه، امتیاز و...) ----------
  add: function(path, amount) {
    var curr = this.get(path) || 0;
    this.set(path, curr + amount);
    return curr + amount;
  },

  // ---------- کاهش از مقدار ----------
  subtract: function(path, amount) {
    var curr = this.get(path) || 0;
    var result = curr - amount;
    if (result < 0) result = 0;
    this.set(path, result);
    return result;
  },

  // ---------- ثبت رویداد ----------
  on: function(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },

  // ---------- حذف رویداد ----------
  off: function(event, callback) {
    if (!this._listeners[event]) return;
    if (!callback) {
      delete this._listeners[event];
      return;
    }
    this._listeners[event] = this._listeners[event].filter(function(cb) {
      return cb !== callback;
    });
  },

  // ---------- اطلاع‌رسانی ----------
  _emit: function(event, data) {
    if (!this._listeners[event]) return;
    for (var i = 0; i < this._listeners[event].length; i++) {
      try {
        this._listeners[event][i](data);
      } catch (e) {
        console.warn('STATE listener error:', e);
      }
    }
  },

  // ---------- ریست کلی ----------
  reset: function() {
    STORAGE.clear();
    this._data = {
      user: this._defaultUser(),
      settings: {
        lang: 'fa', sound: true,
        theme: 'theme_purple', soundPack: 'sound_basic'
      },
      currentView: 'home',
      games: {
        rps:    { wins: 0, losses: 0, draws: 0, level: 1 },
        guess:  { wins: 0, best: 0, level: 1 },
        ttt:    { wins: 0, losses: 0, draws: 0, level: 1 },
        memory: { wins: 0, best: 0, level: 1 }
      },
      stats: {
        totalGames: 0, totalCoins: 0,
        streak: 0, lastPlay: null
      }
    };
    this.save();
    this._emit('reset', true);
  },

  // ---------- پاسخ به کاربر ----------
  getUser: function() {
    return this.get('user');
  },

  setUser: function(user) {
    this.set('user', user);
    this.save('user');
  },

  // ---------- افزودن سکه ----------
  addCoins: function(amount) {
    var user = this.getUser();
    if (!user) return 0;
    user.coins = (user.coins || 0) + amount;
    this.setUser(user);
    this._emit('coins', user.coins);
    return user.coins;
  },

  // ---------- مصرف سکه ----------
  spendCoins: function(amount) {
    var user = this.getUser();
    if (!user) return false;
    if ((user.coins || 0) < amount) return false;
    user.coins -= amount;
    this.setUser(user);
    this._emit('coins', user.coins);
    return true;
  },

  // ---------- امتیاز تجربه ----------
  addXP: function(amount) {
    var user = this.getUser();
    if (!user) return;
    user.xp = (user.xp || 0) + amount;
    // سطح‌بندی: هر ۱۰۰ XP = ۱ سطح
    var newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > (user.level || 1)) {
      user.level = newLevel;
      this._emit('levelup', newLevel);
    }
    this.setUser(user);
  }
};

// اتصال به window
window.STATE = STATE;
