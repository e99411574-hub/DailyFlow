// ===== app.js - راه‌اندازی اصلی اپ ستاره =====

var APP = {

  version: '1.0.0',

  // ---------- راه‌اندازی ----------
  init: function() {
    // ۱. Storage
    if (!STORAGE.isSupported()) {
      alert('مرورگر شما از ذخیره‌سازی پشتیبانی نمی‌کند');
    }

    // ۲. State
    STATE.init();

    // ۳. زبان
    var lang = STATE.get('settings.lang') || 'fa';
    if (typeof setLanguage === 'function') setLanguage(lang);

    // ۴. تم
    var theme = STATE.get('settings.theme') || 'theme_purple';
    document.body.setAttribute('data-theme', theme);

    // ۵. صدا
    if (typeof initAudio === 'function') {
      document.addEventListener('click', function once() {
        initAudio();
        document.removeEventListener('click', once);
      }, { once: true });
    }

    // ۶. Router
    ROUTER.init();

    // ۷. ناوبری پایین
    this.bindNav();

    // ۸. هدر (سکه و...)
    this.updateHeader();

    // ۹. سلام روز
    this.setGreeting();

    // ۱۰. لیسنر سکه
    STATE.on('coins', this.updateHeader.bind(this));

    // ۱۱. لیسنر سطح
    STATE.on('levelup', function(level) {
      if (typeof showToast === 'function')
        showToast('🎉 ' + (typeof t === 'function' ? t('levelup') : 'سطح جدید') + ' ' + level);
      if (typeof playSnd === 'function') playSnd('success');
    });

    console.log('⭐ ستاره آماده است - نسخه', this.version);
  },

  // ---------- ناوبری پایین ----------
  bindNav: function() {
    var btns = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        var view = this.getAttribute('data-view');
        if (view) ROUTER.go(view);
      });
    }
  },

  // ---------- هدر ----------
  updateHeader: function() {
    var user = STATE.getUser();
    if (!user) return;

    // سکه
    var coinEl = document.getElementById('hdrCoins');
    if (coinEl) {
      var coins = user.coins || 0;
      coinEl.textContent = (typeof toFa === 'function') ? toFa(coins) : coins;
    }

    // نام کاربر
    var nameEl = document.getElementById('hdrName');
    if (nameEl) {
      nameEl.textContent = user.name || (typeof t === 'function' ? t('guest') : 'مهمان');
    }
  },

  // ---------- سلام روز ----------
  setGreeting: function() {
    var h = new Date().getHours();
    var key = 'greet_evening';
    if (h < 5)       key = 'greet_night';
    else if (h < 12) key = 'greet_morning';
    else if (h < 17) key = 'greet_noon';
    else if (h < 20) key = 'greet_evening';

    var el = document.getElementById('greeting');
    if (el && typeof t === 'function') {
      el.textContent = t(key) || '';
    }
  },

  // ---------- رندر خانه ----------
  renderHome: function() {
    var container = document.getElementById('homeContent');
    if (!container) return;

    var user = STATE.getUser();
    var name = user.name || (typeof t === 'function' ? t('guest') : 'دوست');
    var coins = (typeof toFa === 'function') ? toFa(user.coins || 0) : (user.coins || 0);
    var level = (typeof toFa === 'function') ? toFa(user.level || 1) : (user.level || 1);

    var html = '';
    // کارت خوش‌آمد
    html += '<div class="card anim-slide-up">';
    html += '<h2>' + (typeof t === 'function' ? t('welcome') : 'خوش آمدی') + ' ' + name + ' 🌟</h2>';
    html += '<p>' + (typeof t === 'function' ? t('welcome_sub') : 'امروز چه کاری انجام بدیم؟') + '</p>';
    html += '</div>';

    // آمار سریع
    html += '<div class="grid-2">';
    html += '<div class="card anim-slide-up delay-1" style="text-align:center">';
    html += '<div style="font-size:32px">🪙</div>';
    html += '<div style="font-size:22px;font-weight:800;color:var(--gold)">' + coins + '</div>';
    html += '<div style="font-size:12px;opacity:.7">' + (typeof t === 'function' ? t('coins') : 'سکه') + '</div>';
    html += '</div>';
    html += '<div class="card anim-slide-up delay-2" style="text-align:center">';
    html += '<div style="font-size:32px">⭐</div>';
    html += '<div style="font-size:22px;font-weight:800;color:var(--gold)">' + level + '</div>';
    html += '<div style="font-size:12px;opacity:.7">' + (typeof t === 'function' ? t('level') : 'سطح') + '</div>';
    html += '</div>';
    html += '</div>';

    // میان‌برها
    html += '<div class="sec-title">🎯 ' + (typeof t === 'function' ? t('quick_access') : 'دسترسی سریع') + '</div>';
    html += '<div class="grid-2">';
    html += this._quickCard('games', '🎮', 'games', 'بازی‌ها', 1);
    html += this._quickCard('tools', '🧰', 'tools', 'ابزارها', 2);
    html += this._quickCard('shop', '🛒', 'shop', 'فروشگاه', 3);
    html += this._quickCard('profile', '👤', 'profile', 'پروفایل', 4);
    html += '</div>';

    container.innerHTML = html;
  },

  _quickCard: function(view, icon, titleKey, fallback, delay) {
    var title = (typeof t === 'function') ? (t(titleKey) || fallback) : fallback;
    return '<div class="card anim-slide-up delay-' + delay + ' press" ' +
      'onclick="ROUTER.go(\'' + view + '\')" ' +
      'style="text-align:center;cursor:pointer">' +
      '<div style="font-size:38px">' + icon + '</div>' +
      '<div style="font-weight:700;margin-top:6px">' + title + '</div>' +
      '</div>';
  },

  // ---------- رندر منوی بازی‌ها ----------
  renderGamesMenu: function() {
    var container = document.getElementById('gamesContent');
    if (!container) return;

    var games = [
      { id: 'rps',    icon: '✊', key: 'rps',    fallback: 'سنگ کاغذ قیچی' },
      { id: 'guess',  icon: '🔢', key: 'guess',  fallback: 'حدس عدد' },
      { id: 'ttt',    icon: '❌', key: 'ttt',    fallback: 'دوز' },
      { id: 'memory', icon: '🃏', key: 'memory', fallback: 'حافظه' }
    ];

    var html = '<div class="sec-title">🎮 ' + (typeof t === 'function' ? t('games') : 'بازی‌ها') + '</div>';
    html += '<div class="grid-2">';
    for (var i = 0; i < games.length; i++) {
      var g = games[i];
      var title = (typeof t === 'function') ? (t(g.key) || g.fallback) : g.fallback;
      html += '<div class="card anim-slide-up delay-' + (i + 1) + ' press" ' +
        'onclick="APP.startGame(\'' + g.id + '\')" ' +
        'style="text-align:center;cursor:pointer">' +
        '<div style="font-size:44px">' + g.icon + '</div>' +
        '<div style="font-weight:700;margin-top:6px">' + title + '</div>' +
        '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  },

  // ---------- شروع بازی ----------
  startGame: function(gameId) {
    if (typeof playSnd === 'function') playSnd('tap');
    var fn = window['startGame_' + gameId];
    if (typeof fn === 'function') {
      fn();
    } else {
      if (typeof showToast === 'function')
        showToast('🎮 ' + (typeof t === 'function' ? t('soon') : 'به‌زودی'));
    }
  },

  // ---------- رندر منوی ابزارها ----------
  renderToolsMenu: function() {
    var container = document.getElementById('toolsContent');
    if (!container) return;

    var tools = [
      { id: 'calc',      icon: '🧮', key: 'calc',      fallback: 'ماشین‌حساب' },
      { id: 'stopwatch', icon: '⏱️', key: 'stopwatch', fallback: 'کرنومتر' },
      { id: 'planner',   icon: '📅', key: 'planner',   fallback: 'برنامه روزانه' },
      { id: 'notes',     icon: '📝', key: 'notes',     fallback: 'یادداشت' },
      { id: 'todo',      icon: '✅', key: 'todo',      fallback: 'کارها' }
    ];

    var html = '<div class="sec-title">🧰 ' + (typeof t === 'function' ? t('tools') : 'ابزارها') + '</div>';
    html += '<div class="grid-2">';
    for (var i = 0; i < tools.length; i++) {
      var tItem = tools[i];
      var title = (typeof t === 'function') ? (t(tItem.key) || tItem.fallback) : tItem.fallback;
      html += '<div class="card anim-slide-up delay-' + (i + 1) + ' press" ' +
        'onclick="APP.openTool(\'' + tItem.id + '\')" ' +
        'style="text-align:center;cursor:pointer">' +
        '<div style="font-size:44px">' + tItem.icon + '</div>' +
        '<div style="font-weight:700;margin-top:6px">' + title + '</div>' +
        '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  },

  // ---------- باز کردن ابزار ----------
  openTool: function(toolId) {
    if (typeof playSnd === 'function') playSnd('tap');
    var fn = window['openTool_' + toolId];
    if (typeof fn === 'function') {
      fn();
    } else {
      if (typeof showToast === 'function')
        showToast('🧰 ' + (typeof t === 'function' ? t('soon') : 'به‌زودی'));
    }
  },

  // ---------- رندر تنظیمات ----------
  renderSettings: function() {
    var container = document.getElementById('settingsContent');
    if (!container) return;

    var user = STATE.getUser();
    var settings = STATE.get('settings');
    var lang = settings.lang || 'fa';
    var soundOn = settings.sound !== false;

    var html = '<div class="sec-title">⚙️ ' + (typeof t === 'function' ? t('settings') : 'تنظیمات') + '</div>';

    // زبان
    html += '<div class="card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<span>🌍 ' + (typeof t === 'function' ? t('language') : 'زبان') + '</span>';
    html += '<div>';
    html += '<button class="btn btn-ghost" onclick="APP.setLang(\'fa\')" style="padding:6px 12px;' + (lang === 'fa' ? 'border-color:var(--gold)' : '') + '">فارسی</button>';
    html += '<button class="btn btn-ghost" onclick="APP.setLang(\'en\')" style="padding:6px 12px;margin-inline-start:6px;' + (lang === 'en' ? 'border-color:var(--gold)' : '') + '">EN</button>';
    html += '</div>';
    html += '</div></div>';

    // صدا
    html += '<div class="card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<span>🔊 ' + (typeof t === 'function' ? t('sound') : 'صدا') + '</span>';
    html += '<button class="btn btn-ghost" onclick="APP.toggleSound()" style="padding:6px 12px">';
    html += soundOn ? '✅ روشن' : '❌ خاموش';
    html += '</button>';
    html += '</div></div>';

    // بازنشانی
    html += '<div class="card">';
    html += '<button class="btn btn-ghost btn-block" onclick="APP.confirmReset()" style="color:#FD79A8">';
    html += '🗑️ ' + (typeof t === 'function' ? t('reset_all') : 'پاک کردن همه داده‌ها');
    html += '</button></div>';

    // درباره
    html += '<div class="card" style="text-align:center;opacity:.7;font-size:12px">';
    html += '<div>⭐ ستاره - ' + (typeof t === 'function' ? t('version') : 'نسخه') + ' ' + this.version + '</div>';
    html += '<div style="margin-top:6px">بازی کن، بساز، بدرخش ✨</div>';
    html += '</div>';

    container.innerHTML = html;
  },

  // ---------- تغییر زبان ----------
  setLang: function(lang) {
    var settings = STATE.get('settings');
    settings.lang = lang;
    STATE.set('settings.lang', lang);
    STATE.save('settings');
    if (typeof setLanguage === 'function') setLanguage(lang);
    if (typeof playSnd === 'function') playSnd('tap');
    this.renderSettings();
    this.renderHome();
    this.renderGamesMenu();
    this.renderToolsMenu();
    this.updateHeader();
    this.setGreeting();
  },

  // ---------- روشن/خاموش صدا ----------
  toggleSound: function() {
    var settings = STATE.get('settings');
    settings.sound = settings.sound === false ? true : false;
    STATE.set('settings.sound', settings.sound);
    STATE.save('settings');
    if (settings.sound && typeof playSnd === 'function') playSnd('click');
    this.renderSettings();
  },

  // ---------- تایید بازنشانی ----------
  confirmReset: function() {
    var msg = (typeof t === 'function') ? t('confirm_reset') : 'همهٔ داده‌ها پاک شود؟';
    if (confirm(msg)) {
      STATE.reset();
      if (typeof playSnd === 'function') playSnd('success');
      if (typeof showToast === 'function') showToast('✅ پاک شد');
      location.reload();
    }
  }
};

// ---------- اجرای خودکار هنگام لود صفحه ----------
window.addEventListener('DOMContentLoaded', function() {
  try {
    APP.init();
  } catch (e) {
    console.error('APP init error:', e);
  }
});

window.APP = APP;
