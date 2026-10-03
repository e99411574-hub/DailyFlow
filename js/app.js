// ===== app.js - راه‌اندازی و صفحهٔ اصلی ستاره =====

var APP = {
  version: '2.0.0',

  // ============ راه‌اندازی ============
  init: function() {
    if (!STORAGE.isSupported()) {
      alert('مرورگر شما از ذخیره‌سازی پشتیبانی نمی‌کند');
    }

    STATE.init();

    var lang = STATE.get('settings.lang') || 'fa';
    if (typeof setLanguage === 'function') setLanguage(lang);

    var theme = STATE.get('settings.theme') || 'theme_purple';
    document.body.setAttribute('data-theme', theme);

    if (typeof SETTINGS !== 'undefined' && SETTINGS.init) SETTINGS.init();

    if (typeof initAudio === 'function') {
      document.addEventListener('click', function once() {
        initAudio();
        document.removeEventListener('click', once);
      }, { once: true });
    }

    ROUTER.init();
    this.bindNav();
    this.bindMenu();
    this.updateHeader();
    this.setGreeting();

    STATE.on('coins', this.updateHeader.bind(this));
    STATE.on('gems', this.updateHeader.bind(this));
    STATE.on('levelup', function(level) {
      if (typeof showToast === 'function')
        showToast('🎉 سطح جدید: ' + fmtNum(level));
      if (typeof playSnd === 'function') playSnd('success');
    });

    console.log('⭐ ستاره آماده است — نسخه', this.version);
  },

  // ============ ناوبری پایین ============
  bindNav: function() {
    var btns = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        var view = this.getAttribute('data-view');
        if (view) ROUTER.go(view);
      });
    }
  },

  // ============ منوی همبرگر ============
  bindMenu: function() {
    var btn = document.getElementById('menuBtn');
    var menu = document.getElementById('sideMenu');
    var overlay = document.getElementById('menuOverlay');
    if (!btn || !menu) return;

    btn.addEventListener('click', function() {
      menu.classList.add('open');
      if (overlay) overlay.classList.add('open');
      if (typeof playSnd === 'function') playSnd('tap');
    });

    if (overlay) {
      overlay.addEventListener('click', function() {
        menu.classList.remove('open');
        overlay.classList.remove('open');
      });
    }

    var items = menu.querySelectorAll('.menu-item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function() {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        var go = this.getAttribute('data-go');
        if (go) ROUTER.go(go);
      });
    }
  },

  // ============ هدر ============
  updateHeader: function() {
    var user = STATE.getUser();
    if (!user) return;

    var coinEl = document.getElementById('hdrCoins');
    if (coinEl) coinEl.textContent = fmtNum(user.coins || 0);

    var gemEl = document.getElementById('hdrGems');
    if (gemEl) gemEl.textContent = fmtNum(user.gems || 0);

    var nameEl = document.getElementById('hdrName');
    if (nameEl) nameEl.textContent = user.name || t('guest');
  },

  // ============ سلام روز ============
  setGreeting: function() {
    var h = new Date().getHours();
    var key = 'greet_evening';
    if (h < 5)       key = 'greet_night';
    else if (h < 12) key = 'greet_morning';
    else if (h < 17) key = 'greet_noon';
    else if (h < 20) key = 'greet_evening';
    var el = document.getElementById('greeting');
    if (el) el.textContent = t(key);
  },

  // ============ رندر صفحهٔ خانه ============
  renderHome: function() {
    var c = document.getElementById('homeContent');
    if (!c) return;

    var user = STATE.getUser();
    var html = '';

    // خوش‌آمد
    html += '<div class="banner anim-slide-up">';
    html += '<div style="font-size:42px">⭐</div>';
    html += '<div style="flex:1">';
    html += '<div style="font-weight:800;font-size:17px;margin-bottom:4px">' + t('welcome') + ' ' + (user.name || t('guest')) + '!</div>';
    html += '<div style="font-size:13px;color:var(--text2)">' + t('welcome_sub') + '</div>';
    html += '</div>';
    html += '</div>';

    // بخش ۱: شعر روز
    html += this._renderPoemSection();

    // بخش ۲: بازی‌های فکری
    html += this._renderGamesSection();

    // بخش ۳: ابزارها
    html += this._renderToolsSection();

    // بخش ۴: ماموریت‌ها
    html += this._renderMissionsSection();

    // بخش ۵: چیزهای من
    html += this._renderMyThingsSection();

    c.innerHTML = html;
  },

  // ============ بخش شعر روز ============
  _renderPoemSection: function() {
    var poem = this._getPoemOfDay();
    var html = '<div class="section anim-slide-up delay-1">';
    html += '<div class="section-header">';
    html += '<div class="section-title"><span class="icon">📜</span><span>شعر روز</span></div>';
    html += '</div>';
    html += '<div class="card" style="background:linear-gradient(135deg, var(--card), var(--card2));text-align:center;padding:20px">';
    html += '<div style="font-size:13px;color:var(--text3);margin-bottom:10px">' + (poem.poet || '') + '</div>';
    html += '<div style="font-size:15px;line-height:2;font-weight:700;color:var(--text);white-space:pre-line">' + (poem.text || '') + '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  },

  _getPoemOfDay: function() {
    // TODO: بعداً از assets/poems.json
    var poems = [
      { poet: 'حافظ', text: 'دوش دیدم که ملائک در میخانه زدند\nگل آدم بسرشتند و به پیمانه زدند' },
      { poet: 'سعدی', text: 'بنی آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند' },
      { poet: 'مولانا', text: 'بشنو این نی چون شکایت می‌کند\nاز جدایی‌ها حکایت می‌کند' },
      { poet: 'فردوسی', text: 'توانا بود هر که دانا بود\nز دانش دل پیر برنا بود' },
      { poet: 'خیام', text: 'این کوزه چو من عاشق زاری بوده است\nدر بند سر زلف نگاری بوده است' }
    ];
    var hours12 = Math.floor(Date.now() / (12 * 60 * 60 * 1000));
    var idx = hours12 % poems.length;
    return poems[idx];
  },

  // ============ بخش بازی‌ها ============
  _renderGamesSection: function() {
    var games = [
      { id: 'rps',    icon: '✊', label: 'سنگ کاغذ قیچی', color: 'purple' },
      { id: 'guess',  icon: '🔢', label: 'حدس عدد',      color: 'blue' },
      { id: 'ttt',    icon: '❌', label: 'دوز',          color: 'pink' },
      { id: 'memory', icon: '🃏', label: 'حافظه',        color: 'green' }
    ];
    var html = '<div class="section anim-slide-up delay-2">';
    html += '<div class="section-header">';
    html += '<div class="section-title"><span class="icon">🎮</span><span>' + t('games') + '</span></div>';
    html += '<a class="section-more" onclick="ROUTER.go(\'games\')">‹</a>';
    html += '</div>';
    html += '<div class="section-scroll">';
    for (var i = 0; i < games.length; i++) {
      var g = games[i];
      html += '<div class="tile color-' + g.color + ' press" onclick="APP.startGame(\'' + g.id + '\')">';
      html += '<div class="tile-icon">' + g.icon + '</div>';
      html += '<div class="tile-label">' + g.label + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  },

  // ============ بخش ابزارها ============
  _renderToolsSection: function() {
    var tools = [
      { id: 'calc',      icon: '🧮', label: 'ماشین‌حساب', color: 'yellow' },
      { id: 'stopwatch', icon: '⏱️', label: 'کرنومتر',   color: 'blue' },
      { id: 'planner',   icon: '📅', label: 'برنامه',     color: 'green' },
      { id: 'notes',     icon: '📝', label: 'یادداشت',   color: 'pink' },
      { id: 'todo',      icon: '✅', label: 'کارها',      color: 'orange' }
    ];
    var html = '<div class="section anim-slide-up delay-3">';
    html += '<div class="section-header">';
    html += '<div class="section-title"><span class="icon">🧰</span><span>' + t('tools') + '</span></div>';
    html += '<a class="section-more" onclick="ROUTER.go(\'tools\')">‹</a>';
    html += '</div>';
    html += '<div class="section-scroll">';
    for (var i = 0; i < tools.length; i++) {
      var tl = tools[i];
      html += '<div class="tile color-' + tl.color + ' press" onclick="APP.openTool(\'' + tl.id + '\')">';
      html += '<div class="tile-icon">' + tl.icon + '</div>';
      html += '<div class="tile-label">' + tl.label + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  },

  // ============ بخش ماموریت‌ها ============
  _renderMissionsSection: function() {
    var missions = [
      { icon: '🎮', label: '۳ بازی انجام بده', reward: '۵ 💎', color: 'purple' },
      { icon: '🏆', label: '۱ برد بگیر',      reward: '۲ 💎', color: 'yellow' },
      { icon: '🛒', label: 'فروشگاه رو باز کن', reward: '۱ 💎', color: 'green' },
      { icon: '📅', label: 'هر روز وارد شو',  reward: '۲ 💎', color: 'blue' }
    ];
    var html = '<div class="section anim-slide-up delay-4">';
    html += '<div class="section-header">';
    html += '<div class="section-title"><span class="icon">🏆</span><span>ماموریت‌های روزانه</span></div>';
    html += '</div>';
    html += '<div class="section-scroll">';
    for (var i = 0; i < missions.length; i++) {
      var m = missions[i];
      html += '<div class="tile color-' + m.color + ' press" style="width:110px;height:110px">';
      html += '<div class="tile-icon" style="font-size:30px">' + m.icon + '</div>';
      html += '<div class="tile-label" style="font-size:11px">' + m.label + '</div>';
      html += '<div style="font-size:11px;font-weight:800;color:var(--pr)">' + m.reward + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  },

  // ============ بخش چیزهای من ============
  _renderMyThingsSection: function() {
    var user = STATE.getUser();
    var things = [
      { icon: '⭐', label: 'تیک‌ها',  go: 'profile', color: 'purple' },
      { icon: '✨', label: 'نمادها',  go: 'shop',    color: 'yellow' },
      { icon: '🎨', label: 'تم‌ها',   go: 'settings', color: 'pink' },
      { icon: '🪙', label: 'سکه‌ها',  go: 'shop',    color: 'orange' }
    ];
    var html = '<div class="section anim-slide-up delay-5">';
    html += '<div class="section-header">';
    html += '<div class="section-title"><span class="icon">🎁</span><span>چیزهای من</span></div>';
    html += '</div>';
    html += '<div class="section-scroll">';
    for (var i = 0; i < things.length; i++) {
      var th = things[i];
      html += '<div class="tile color-' + th.color + ' press" onclick="ROUTER.go(\'' + th.go + '\')">';
      html += '<div class="tile-icon">' + th.icon + '</div>';
      html += '<div class="tile-label">' + th.label + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  },

  // ============ شروع بازی ============
  startGame: function(gameId) {
    if (typeof playSnd === 'function') playSnd('tap');
    var fn = window['startGame_' + gameId];
    if (typeof fn === 'function') fn();
    else if (typeof showToast === 'function') showToast('🎮 ' + t('soon'));
  },

  // ============ باز کردن ابزار ============
  openTool: function(toolId) {
    if (typeof playSnd === 'function') playSnd('tap');
    var fn = window['openTool_' + toolId];
    if (typeof fn === 'function') fn();
    else if (typeof showToast === 'function') showToast('🧰 ' + t('soon'));
  },

  // ============ رندر منوی بازی‌ها ============
  renderGamesMenu: function() {
    var c = document.getElementById('gamesContent');
    if (!c) return;
    var html = '<div class="section-title" style="margin:10px 0 16px"><span class="icon">🎮</span><span>' + t('games') + '</span></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    var games = [
      { id: 'rps',    icon: '✊', label: 'سنگ کاغذ قیچی', color: 'purple' },
      { id: 'guess',  icon: '🔢', label: 'حدس عدد',      color: 'blue' },
      { id: 'ttt',    icon: '❌', label: 'دوز',          color: 'pink' },
      { id: 'memory', icon: '🃏', label: 'حافظه',        color: 'green' }
    ];
    for (var i = 0; i < games.length; i++) {
      var g = games[i];
      html += '<div class="card press color-' + g.color + '" onclick="APP.startGame(\'' + g.id + '\')" style="text-align:center;padding:22px 12px">';
      html += '<div style="font-size:44px;margin-bottom:8px">' + g.icon + '</div>';
      html += '<div style="font-weight:800;font-size:14px">' + g.label + '</div>';
      html += '</div>';
    }
    html += '</div>';
    c.innerHTML = html;
  },

  // ============ رندر منوی ابزارها ============
  renderToolsMenu: function() {
    var c = document.getElementById('toolsContent');
    if (!c) return;
    var html = '<div class="section-title" style="margin:10px 0 16px"><span class="icon">🧰</span><span>' + t('tools') + '</span></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    var tools = [
      { id: 'calc',      icon: '🧮', label: 'ماشین‌حساب', color: 'yellow' },
      { id: 'stopwatch', icon: '⏱️', label: 'کرنومتر',   color: 'blue' },
      { id: 'planner',   icon: '📅', label: 'برنامه',     color: 'green' },
      { id: 'notes',     icon: '📝', label: 'یادداشت',   color: 'pink' },
      { id: 'todo',      icon: '✅', label: 'کارها',      color: 'orange' }
    ];
    for (var i = 0; i < tools.length; i++) {
      var tl = tools[i];
      html += '<div class="card press color-' + tl.color + '" onclick="APP.openTool(\'' + tl.id + '\')" style="text-align:center;padding:22px 12px">';
      html += '<div style="font-size:44px;margin-bottom:8px">' + tl.icon + '</div>';
      html += '<div style="font-weight:800;font-size:14px">' + tl.label + '</div>';
      html += '</div>';
    }
    html += '</div>';
    c.innerHTML = html;
  },

  // ============ رندر تنظیمات ============
  renderSettings: function() {
    if (typeof SETTINGS !== 'undefined' && SETTINGS.render) {
      var c = document.getElementById('settingsContent');
      if (c) {
        c.innerHTML = SETTINGS.render();
        if (SETTINGS._customMode) SETTINGS._updatePreview();
      }
    }
  }
};

// ============ اجرای خودکار ============
window.addEventListener('DOMContentLoaded', function() {
  try { APP.init(); } catch (e) { console.error('APP init error:', e); }
});

window.APP = APP;
