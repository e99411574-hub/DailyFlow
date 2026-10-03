// ===== shop.js - فروشگاه ستاره =====

var SHOP = {

  // ---------- اطلاعات کاربر ----------
  getUser: function() {
    try {
      var raw = localStorage.getItem('setareh_user');
      var u = raw ? JSON.parse(raw) : {};
      return {
        name: u.name || '',
        bio: u.bio || '',
        avatar: u.avatar || 'male',
        avatarImage: u.avatarImage || '',
        selectedTick: u.selectedTick || 'star_black',
        ownedTicks: u.ownedTicks || ['star_black'],
        ownedSymbols: u.ownedSymbols || ['sym_moon'],
        ownedThemes: u.ownedThemes || ['theme_purple'],
        activeSymbol: u.activeSymbol || 'sym_moon',
        activeTheme: u.activeTheme || 'theme_purple',
        activeTick: u.activeTick || 'star_black',
        coins: (u.coins === undefined) ? 100 : u.coins,
        gems: (u.gems === undefined) ? 0 : u.gems,
        xp: u.xp || 0,
        level: u.level || 1,
        streak: u.streak || 0,
        joinedAt: u.joinedAt || new Date().toISOString()
      };
    } catch (e) {
      return {
        name: '', bio: '', avatar: 'male', avatarImage: '',
        selectedTick: 'star_black',
        ownedTicks: ['star_black'],
        ownedSymbols: ['sym_moon'],
        ownedThemes: ['theme_purple'],
        activeSymbol: 'sym_moon',
        activeTheme: 'theme_purple',
        activeTick: 'star_black',
        coins: 100, gems: 0, xp: 0, level: 1, streak: 0,
        joinedAt: new Date().toISOString()
      };
    }
  },

  saveUser: function(u) {
    try {
      localStorage.setItem('setareh_user', JSON.stringify(u));
      if (typeof STATE !== 'undefined' && STATE._data) {
        STATE._data.user = u;
      }
    } catch (e) {}
  },

  // ---------- کسر/افزودن ----------
  spendCoins: function(amount) {
    var u = this.getUser();
    if ((u.coins || 0) < amount) return false;
    u.coins -= amount;
    this.saveUser(u);
    return true;
  },
  addCoins: function(amount) {
    var u = this.getUser();
    u.coins = (u.coins || 0) + amount;
    this.saveUser(u);
    return u.coins;
  },
  spendGems: function(amount) {
    var u = this.getUser();
    if ((u.gems || 0) < amount) return false;
    u.gems -= amount;
    this.saveUser(u);
    return true;
  },
  addGems: function(amount) {
    var u = this.getUser();
    u.gems = (u.gems || 0) + amount;
    this.saveUser(u);
    return u.gems;
  },

  // ---------- آیتم‌ها ----------
  items: {
    ticks: [
      { id: 'star_black',   name: 'ستاره سیاه',    price: 0,   currency: 'coin' },
      { id: 'star_gold',    name: 'ستاره طلایی',   price: 50,  currency: 'coin' },
      { id: 'heart_red',    name: 'قلب سرخ',       price: 60,  currency: 'coin' },
      { id: 'heart_pink',   name: 'قلب صورتی',     price: 60,  currency: 'coin' },
      { id: 'diamond_blue', name: 'الماس آبی',     price: 80,  currency: 'coin' },
      { id: 'crown_gold',   name: 'تاج طلایی',     price: 5,   currency: 'gem'  },
      { id: 'star_rainbow', name: 'ستاره رنگین',   price: 8,   currency: 'gem'  }
    ],
    symbols: [
      { id: 'sym_moon',    name: 'ماه',        price: 0,   currency: 'coin', icon: '🌙' },
      { id: 'sym_sun',     name: 'خورشید',     price: 60,  currency: 'coin', icon: '☀️' },
      { id: 'sym_rocket',  name: 'موشک',       price: 80,  currency: 'coin', icon: '🚀' },
      { id: 'sym_galaxy',  name: 'کهکشان',     price: 120, currency: 'coin', icon: '🌌' },
      { id: 'sym_rainbow', name: 'رنگین‌کمان', price: 5,   currency: 'gem',  icon: '🌈' }
    ],
    themes: [
      { id: 'theme_purple', name: 'بنفش',    price: 0,   currency: 'coin', c1: '#b8a0e8', c2: '#8b5cf6' },
      { id: 'theme_pink',   name: 'صورتی',   price: 100, currency: 'coin', c1: '#f0a0c8', c2: '#E84393' },
      { id: 'theme_ocean',  name: 'اقیانوس', price: 120, currency: 'coin', c1: '#7dd8e8', c2: '#0984E3' },
      { id: 'theme_mint',   name: 'نعنا',    price: 120, currency: 'coin', c1: '#90e0c0', c2: '#00B894' },
      { id: 'theme_gold',   name: 'طلایی',   price: 10,  currency: 'gem',  c1: '#f0c878', c2: '#E17055' },
      { id: 'theme_sunset', name: 'غروب',    price: 15,  currency: 'gem',  c1: '#f0a0b8', c2: '#E84393' }
    ]
  },

  activeCategory: 'ticks',

  // ---------- بررسی مالکیت ----------
  isOwned: function(itemId) {
    var u = this.getUser();
    if (u.ownedTicks && u.ownedTicks.indexOf(itemId) >= 0) return true;
    if (u.ownedSymbols && u.ownedSymbols.indexOf(itemId) >= 0) return true;
    if (u.ownedThemes && u.ownedThemes.indexOf(itemId) >= 0) return true;
    return false;
  },

  isEquipped: function(itemId) {
    var u = this.getUser();
    return u.selectedTick === itemId || u.activeSymbol === itemId || u.activeTheme === itemId;
  },

  _findItem: function(itemId) {
    var cats = ['ticks', 'symbols', 'themes'];
    for (var c = 0; c < cats.length; c++) {
      var list = this.items[cats[c]];
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === itemId) return { item: list[i], cat: cats[c] };
      }
    }
    return null;
  },

  // ---------- خرید ----------
  buy: function(itemId) {
    var found = this._findItem(itemId);
    if (!found) return { ok: false, msg: 'not_found' };
    var item = found.item;
    var cat = found.cat;

    if (this.isOwned(itemId)) return { ok: false, msg: 'already' };

    var u = this.getUser();
    if (item.currency === 'gem') {
      if ((u.gems || 0) < item.price) {
        if (typeof playSnd === 'function') playSnd('error');
        return { ok: false, msg: 'not_enough_gem' };
      }
      u.gems -= item.price;
    } else {
      if ((u.coins || 0) < item.price) {
        if (typeof playSnd === 'function') playSnd('error');
        return { ok: false, msg: 'not_enough' };
      }
      u.coins -= item.price;
    }

    if (cat === 'ticks') {
      if (!u.ownedTicks) u.ownedTicks = [];
      u.ownedTicks.push(itemId);
    } else if (cat === 'symbols') {
      if (!u.ownedSymbols) u.ownedSymbols = [];
      u.ownedSymbols.push(itemId);
    } else if (cat === 'themes') {
      if (!u.ownedThemes) u.ownedThemes = [];
      u.ownedThemes.push(itemId);
    }

    this.saveUser(u);
    if (typeof playSnd === 'function') playSnd('success');
    if (typeof showToast === 'function') showToast('✅ خریداری شد!');
    if (typeof APP !== 'undefined' && APP.updateHeader) APP.updateHeader();
    return { ok: true, item: item };
  },

  // ---------- فعال‌سازی ----------
  equip: function(itemId) {
    var found = this._findItem(itemId);
    if (!found) return false;
    var item = found.item;
    var cat = found.cat;

    if (!this.isOwned(itemId) && item.price > 0) {
      if (typeof playSnd === 'function') playSnd('error');
      return false;
    }

    var u = this.getUser();
    if (cat === 'ticks') {
      u.selectedTick = itemId;
      u.activeTick = itemId;
    } else if (cat === 'symbols') {
      u.activeSymbol = itemId;
    } else if (cat === 'themes') {
      u.activeTheme = itemId;
      if (typeof STATE !== 'undefined') {
        STATE.set('settings.theme', itemId);
        STATE.save('settings');
      }
      document.body.setAttribute('data-theme', itemId);
    }

    this.saveUser(u);
    if (typeof playSnd === 'function') playSnd('click');
    if (typeof showToast === 'function') showToast('✅ فعال شد!');
    return true;
  },

  // ---------- رندر ----------
  render: function() {
    var u = this.getUser();
    var html = '';

    // کارت موجودی
    html += '<div class="banner anim-slide-up" style="margin-bottom:16px">';
    html += '<div style="display:flex;gap:16px;align-items:center;justify-content:space-around;width:100%">';
    html += '<div style="text-align:center">';
    html += '<div style="font-size:28px">🪙</div>';
    html += '<div style="font-size:20px;font-weight:900;color:var(--pr)">' + fmtNum(u.coins) + '</div>';
    html += '<div style="font-size:11px;color:var(--text3)">سکه</div>';
    html += '</div>';
    html += '<div style="text-align:center">';
    html += '<div style="font-size:28px">💎</div>';
    html += '<div style="font-size:20px;font-weight:900;color:var(--pr)">' + fmtNum(u.gems) + '</div>';
    html += '<div style="font-size:11px;color:var(--text3)">جم</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // تب‌ها
    html += '<div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;padding:4px 0" class="section-scroll">';
    html += this._tab('ticks', '✓', 'تیک‌ها');
    html += this._tab('symbols', '✨', 'نمادها');
    html += this._tab('themes', '🎨', 'تم‌ها');
    html += '</div>';

    // آیتم‌ها
    html += '<div class="anim-fade-in">';
    var items = this.items[this.activeCategory] || [];
    for (var i = 0; i < items.length; i++) {
      html += this._renderItem(items[i]);
    }
    html += '</div>';

    return html;
  },

  _tab: function(id, icon, label) {
    var active = (this.activeCategory === id);
    var bg = active ? 'linear-gradient(135deg, var(--pr), var(--pr2))' : 'var(--card)';
    var color = active ? 'white' : 'var(--text)';
    return '<div class="press" style="flex-shrink:0;padding:10px 18px;border-radius:14px;background:' + bg + ';color:' + color + ';font-weight:800;font-size:14px;cursor:pointer;box-shadow:var(--sd2);display:flex;align-items:center;gap:6px" onclick="SHOP.setCat(\'' + id + '\')"><span>' + icon + '</span>' + label + '</div>';
  },

  _renderItem: function(item) {
    var owned = this.isOwned(item.id) || item.price === 0;
    var equipped = this.isEquipped(item.id);
    var user = this.getUser();
    var canAfford = (item.currency === 'gem')
      ? (user.gems || 0) >= item.price
      : (user.coins || 0) >= item.price;

    // آیکن
    var iconHtml = '';
    if (this.activeCategory === 'ticks') {
      iconHtml = (typeof renderTick === 'function') ? renderTick(item.id, 48) : '<span style="font-size:32px">★</span>';
    } else if (this.activeCategory === 'symbols') {
      iconHtml = '<span style="font-size:38px">' + (item.icon || '✨') + '</span>';
    } else {
      iconHtml = '<div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,' + item.c1 + ',' + item.c2 + ');box-shadow:0 4px 12px rgba(0,0,0,0.15)"></div>';
    }

    // دکمه
    var btn = '';
    if (equipped) {
      btn = '<div style="padding:8px 16px;border-radius:12px;background:var(--pr-soft);color:var(--pr);font-weight:800;font-size:12px">✓ فعال</div>';
    } else if (owned || item.price === 0) {
      btn = '<div class="press" onclick="SHOP.equipClick(\'' + item.id + '\')" style="padding:8px 16px;border-radius:12px;background:linear-gradient(135deg,var(--pr),var(--pr2));color:white;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 4px 12px var(--pr-soft)">فعال کن</div>';
    } else {
      var curIcon = item.currency === 'gem' ? '💎' : '🪙';
      var opacity = canAfford ? '1' : '0.4';
      btn = '<div class="press" onclick="SHOP.buyClick(\'' + item.id + '\')" style="padding:8px 14px;border-radius:12px;background:linear-gradient(135deg,var(--gold),#E17055);color:white;font-weight:800;font-size:12px;cursor:pointer;opacity:' + opacity + ';display:flex;align-items:center;gap:4px">' + curIcon + ' ' + fmtNum(item.price) + '</div>';
    }

    return '<div class="card" style="display:flex;align-items:center;gap:14px;margin-bottom:10px">' +
      '<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:var(--card2);border-radius:16px;flex-shrink:0">' + iconHtml + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-weight:800;font-size:15px;color:var(--text);margin-bottom:4px">' + item.name + '</div>' +
      '<div style="font-size:12px;color:var(--text3)">' + (owned ? '✓ خریداری شده' : 'قیمت: ' + fmtNum(item.price) + ' ' + (item.currency === 'gem' ? '💎' : '🪙')) + '</div>' +
      '</div>' +
      btn +
      '</div>';
  },

  setCat: function(cat) {
    this.activeCategory = cat;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  buyClick: function(id) {
    var res = this.buy(id);
    if (!res.ok) {
      var msgs = {
        not_enough: '❌ سکه کافی نداری!',
        not_enough_gem: '❌ جم کافی نداری!',
        already: 'این رو قبلاً خریدی',
        not_found: 'خطا'
      };
      if (typeof showToast === 'function') showToast(msgs[res.msg] || 'خطا');
    } else {
      this.refresh();
    }
  },

  equipClick: function(id) {
    this.equip(id);
    this.refresh();
  },

  refresh: function() {
    var c = document.getElementById('shopContent');
    if (c) {
      c.innerHTML = this.render();
      c.classList.remove('anim-fade-in');
      void c.offsetWidth;
      c.classList.add('anim-fade-in');
    }
  },

  init: function() {
    var u = this.getUser();
    if (!u.ownedTicks || !u.ownedTicks.length) u.ownedTicks = ['star_black'];
    if (!u.ownedSymbols || !u.ownedSymbols.length) u.ownedSymbols = ['sym_moon'];
    if (!u.ownedThemes || !u.ownedThemes.length) u.ownedThemes = ['theme_purple'];
    if (u.coins === undefined) u.coins = 100;
    if (u.gems === undefined) u.gems = 0;
    this.saveUser(u);
  }
};

window.SHOP = SHOP;
