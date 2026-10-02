// ===== router.js - مسیریابی بین صفحات ستاره =====

var ROUTER = {

  // صفحات ثبت‌شده
  routes: {},

  // صفحهٔ فعلی
  current: null,

  // تاریخچه برای دکمهٔ بازگشت
  history: [],

  // ---------- ثبت مسیر ----------
  register: function(name, config) {
    this.routes[name] = config || {};
    return this;
  },

  // ---------- رفتن به صفحه ----------
  go: function(name, params) {
    // اگه مسیر وجود نداره، خطا
    if (!this.routes[name]) {
      console.warn('ROUTER: route not found →', name);
      return false;
    }

    // اگه صفحهٔ قبلی بود، برو ازش بیرون
    if (this.current && this.current !== name) {
      this.hide(this.current);
      this.history.push(this.current);
      if (this.history.length > 20) this.history.shift();
    }

    // صفحهٔ جدید رو نشون بده
    this.current = name;
    this.show(name);

    // اگه تابع onEnter داشت، صدا بزن
    var cfg = this.routes[name];
    if (typeof cfg.onEnter === 'function') {
      try { cfg.onEnter(params || {}); } catch (e) { console.warn(e); }
    }

    // State رو آپدیت کن
    if (typeof STATE !== 'undefined') {
      STATE.set('currentView', name);
    }

    // آدرس URL رو آپدیت کن (hash routing)
    if (window.location.hash !== '#' + name) {
      history.replaceState(null, '', '#' + name);
    }

    // اسکرول به بالا
    try { window.scrollTo(0, 0); } catch (e) {}

    // صدا
    if (typeof playSnd === 'function') playSnd('tap');

    return true;
  },

  // ---------- برگشت به صفحهٔ قبلی ----------
  back: function() {
    var prev = this.history.pop();
    if (prev) {
      this.current = null; // جلوگیری از دوباره پوش شدن
      this.go(prev);
    } else {
      this.go('home');
    }
  },

  // ---------- نشون دادن صفحه ----------
  show: function(name) {
    var el = document.getElementById('view-' + name);
    if (el) {
      el.classList.add('active');
      el.style.display = 'block';
      // انیمیشن ورود
      el.classList.remove('anim-slide-up');
      void el.offsetWidth;
      el.classList.add('anim-slide-up');
    }

    // دکمهٔ منو
    var navs = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < navs.length; i++) {
      navs[i].classList.remove('active');
      if (navs[i].getAttribute('data-view') === name) {
        navs[i].classList.add('active');
      }
    }
  },

  // ---------- مخفی کردن صفحه ----------
  hide: function(name) {
    var el = document.getElementById('view-' + name);
    if (el) {
      el.classList.remove('active');
      el.style.display = 'none';
    }
  },

  // ---------- مخفی کردن همه ----------
  hideAll: function() {
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) {
      views[i].classList.remove('active');
      views[i].style.display = 'none';
    }
  },

  // ---------- راه‌اندازی ----------
  init: function() {
    // ثبت مسیرهای پیش‌فرض
    this.register('home',     { onEnter: this._enterHome.bind(this) });
    this.register('games',    { onEnter: this._enterGames.bind(this) });
    this.register('tools',    { onEnter: this._enterTools.bind(this) });
    this.register('shop',     { onEnter: this._enterShop.bind(this) });
    this.register('profile',  { onEnter: this._enterProfile.bind(this) });
    this.register('settings', { onEnter: this._enterSettings.bind(this) });

    // گوش دادن به دکمهٔ back مرورگر
    window.addEventListener('hashchange', this._onHashChange.bind(this));
    window.addEventListener('popstate', this._onHashChange.bind(this));

    // رفتن به صفحهٔ اولیه (از hash یا خانه)
    var hash = (window.location.hash || '').replace('#', '');
    var start = (hash && this.routes[hash]) ? hash : 'home';
    this.current = start;
    this.show(start);

    var cfg = this.routes[start];
    if (cfg && typeof cfg.onEnter === 'function') {
      try { cfg.onEnter({}); } catch (e) {}
    }
  },

  // ---------- تغییر hash ----------
  _onHashChange: function() {
    var hash = (window.location.hash || '').replace('#', '');
    if (hash && this.routes[hash] && hash !== this.current) {
      this.hideAll();
      this.current = hash;
      this.show(hash);
      var cfg = this.routes[hash];
      if (cfg && typeof cfg.onEnter === 'function') {
        try { cfg.onEnter({}); } catch (e) {}
      }
    }
  },

  // ---------- ورود به صفحات ----------
  _enterHome: function() {
    if (typeof renderHome === 'function') renderHome();
  },

  _enterGames: function() {
    if (typeof renderGamesMenu === 'function') renderGamesMenu();
  },

  _enterTools: function() {
    if (typeof renderToolsMenu === 'function') renderToolsMenu();
  },

  _enterShop: function() {
    var c = document.getElementById('shopContent');
    if (c && typeof SHOP !== 'undefined' && SHOP.render) {
      c.innerHTML = SHOP.render();
      if (typeof SHOP.bindEvents === 'function') SHOP.bindEvents(c);
    }
  },

  _enterProfile: function() {
    var c = document.getElementById('profileContent');
    if (c && typeof PROFILE !== 'undefined' && PROFILE.render) {
      c.innerHTML = PROFILE.render();
    }
  },

  _enterSettings: function() {
    if (typeof renderSettings === 'function') renderSettings();
  }
};

// اتصال به window
window.ROUTER = ROUTER;
