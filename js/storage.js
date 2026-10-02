// ===== storage.js - مدیریت localStorage ستاره =====
// ذخیره و بازیابی امن اطلاعات

var STORAGE = {

  // پیشوند کلیدها (برای جلوگیری از تداخل)
  PREFIX: 'setareh_',

  // ---------- ذخیره ----------
  set: function(key, value) {
    try {
      var fullKey = this.PREFIX + key;
      var data = JSON.stringify(value);
      localStorage.setItem(fullKey, data);
      return true;
    } catch (e) {
      console.warn('STORAGE.set error:', e);
      return false;
    }
  },

  // ---------- خواندن ----------
  get: function(key, fallback) {
    try {
      var fullKey = this.PREFIX + key;
      var raw = localStorage.getItem(fullKey);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('STORAGE.get error:', e);
      return fallback;
    }
  },

  // ---------- حذف ----------
  remove: function(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (e) {
      return false;
    }
  },

  // ---------- پاک کردن همه ----------
  clear: function() {
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(this.PREFIX) === 0) {
          localStorage.removeItem(keys[i]);
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  // ---------- بررسی وجود ----------
  has: function(key) {
    return localStorage.getItem(this.PREFIX + key) !== null;
  },

  // ---------- لیست همه کلیدها ----------
  keys: function() {
    var result = [];
    try {
      var all = Object.keys(localStorage);
      for (var i = 0; i < all.length; i++) {
        if (all[i].indexOf(this.PREFIX) === 0) {
          result.push(all[i].replace(this.PREFIX, ''));
        }
      }
    } catch (e) {}
    return result;
  },

  // ---------- اندازهٔ استفاده‌شده (بایت) ----------
  size: function() {
    var total = 0;
    try {
      var keys = this.keys();
      for (var i = 0; i < keys.length; i++) {
        var val = localStorage.getItem(this.PREFIX + keys[i]) || '';
        total += val.length + keys[i].length;
      }
    } catch (e) {}
    return total;
  },

  // ---------- اندازهٔ خوانا ----------
  sizeReadable: function() {
    var bytes = this.size();
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  },

  // ---------- پشتیبان‌گیری ----------
  backup: function() {
    var data = {};
    var keys = this.keys();
    for (var i = 0; i < keys.length; i++) {
      data[keys[i]] = this.get(keys[i]);
    }
    return data;
  },

  // ---------- بازیابی از پشتیبان ----------
  restore: function(data) {
    if (!data || typeof data !== 'object') return false;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        this.set(key, data[key]);
      }
    }
    return true;
  },

  // ---------- خروجی JSON ----------
  exportJSON: function() {
    try {
      return JSON.stringify(this.backup(), null, 2);
    } catch (e) {
      return '{}';
    }
  },

  // ---------- ورود از JSON ----------
  importJSON: function(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      return this.restore(data);
    } catch (e) {
      return false;
    }
  },

  // ---------- بررسی پشتیبانی ----------
  isSupported: function() {
    try {
      var test = '__setareh_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// ---------- تست خودکار ----------
if (!STORAGE.isSupported()) {
  console.warn('⚠️ localStorage پشتیبانی نمی‌شود!');
}

// اتصال به window
window.STORAGE = STORAGE;
