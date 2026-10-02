// ===== shop.js - فروشگاه سکه و تیک =====
var SHOP = {
  // تم‌های رنگی
  themes: [
    { id: 'theme_purple', name: 'بنفش سلطنتی', color1: '#6C5CE7', color2: '#0984E3', price: 200 },
    { id: 'theme_sunset', name: 'غروب طلایی',  color1: '#F39C12', color2: '#E74C3C', price: 200 },
    { id: 'theme_ocean',  name: 'اقیانوس',      color1: '#0984E3', color2: '#00B894', price: 200 },
    { id: 'theme_pink',   name: 'صورتی رویایی', color1: '#E84393', color2: '#A29BFE', price: 200 }
  ],
  
  // صداهای افکت
  sounds: [
    { id: 'snd_click',  name: 'کلیک نرم',      price: 150 },
    { id: 'snd_pop',    name: 'پاپ شاد',       price: 150 },
    { id: 'snd_chime',  name: 'زنگ دلنشین',   price: 150 },
    { id: 'snd_bubble', name: 'حباب',          price: 150 },
    { id: 'snd_wood',   name: 'چوب',           price: 150 }
  ],
  
  // داده‌های کاربر
  getUser: function() {
    try {
      var u = JSON.parse(localStorage.getItem('setareh_user') || '{}');
      return {
        name: u.name || '',
        bio: u.bio || '',
        avatar: u.avatar || 'male',
        avatarImage: u.avatarImage || '',
        selectedTick: u.selectedTick || 'star_black',
        ownedTicks: u.ownedTicks || ['star_black'],
        ownedThemes: u.ownedThemes || [],
        ownedSounds: u.ownedSounds || [],
        coins: u.coins || 0,
        streak: u.streak || 0,
        xp: u.xp || 0,
        level: u.level || 1,
        lastLogin: u.lastLogin || '',
        joinedAt: u.joinedAt || new Date().toISOString()
      };
    } catch(e) {
      return {
        name: '', bio: '', avatar: 'male', avatarImage: '',
        selectedTick: 'star_black',
        ownedTicks: ['star_black'],
        ownedThemes: [], ownedSounds: [],
        coins: 0, streak: 0, xp: 0, level: 1,
        lastLogin: '', joinedAt: new Date().toISOString()
      };
    }
  },
  
  // ذخیره کاربر
  saveUser: function(u) {
    try {
      localStorage.setItem('setareh_user', JSON.stringify(u));
    } catch(e) {}
  },
  
  // افزودن سکه
  addCoins: function(amount) {
    var u = this.getUser();
    u.coins += amount;
    this.saveUser(u);
    playSnd('coin');
    showToast('🪙 +' + fmtNum(amount) + ' ' + t('coins'));
    return u.coins;
  },
  
  // کسر سکه
  spendCoins: function(amount) {
    var u = this.getUser();
    if (u.coins < amount) {
      playSnd('error');
      showToast('❌ ' + t('notEnoughCoins'));
      return false;
    }
    u.coins -= amount;
    this.saveUser(u);
    return true;
  },
  
  // خرید تیک
  buyTick: function(tickId) {
    var u = this.getUser();
    if (u.ownedTicks.indexOf(tickId) >= 0) {
      showToast('✓ ' + t('owned'));
      return false;
    }
    var tick = getTickById(tickId);
    if (!tick) return false;
    if (!this.spendCoins(tick.price)) return false;
    u = this.getUser();
    u.ownedTicks.push(tickId);
    this.saveUser(u);
    playSnd('purchase');
    showToast('✅ ' + t('purchased'));
    return true;
  },
  
  // انتخاب تیک فعال
  equipTick: function(tickId) {
    var u = this.getUser();
    if (u.ownedTicks.indexOf(tickId) < 0) {
      playSnd('error');
      showToast('❌ ' + t('notEnoughCoins'));
      return false;
    }
    u.selectedTick = tickId;
    this.saveUser(u);
    playSnd('success');
    showToast('⭐ ' + t('equipped'));
    return true;
  },
  
  // خرید تم
  buyTheme: function(themeId) {
    var u = this.getUser();
    if (u.ownedThemes.indexOf(themeId) >= 0) return false;
    var th = this.themes.find(function(x) { return x.id === themeId; });
    if (!th) return false;
    if (!this.spendCoins(th.price)) return false;
    u = this.getUser();
    u.ownedThemes.push(themeId);
    this.saveUser(u);
    playSnd('purchase');
    showToast('✅ ' + t('purchased'));
    return true;
  },
  
  // اعمال تم
  applyTheme: function(themeId) {
    var u = this.getUser();
    if (u.ownedThemes.indexOf(themeId) < 0) return false;
    var th = this.themes.find(function(x) { return x.id === themeId; });
    if (!th) return false;
    document.documentElement.style.setProperty('--pr', th.color1);
    document.documentElement.style.setProperty('--pr2', th.color2);
    localStorage.setItem('setareh_theme', themeId);
    playSnd('success');
    showToast('🎨 ' + t('equipped'));
    return true;
  },
  
  // خرید صدا
  buySound: function(soundId) {
    var u = this.getUser();
    if (u.ownedSounds.indexOf(soundId) >= 0) return false;
    var s = this.sounds.find(function(x) { return x.id === soundId; });
    if (!s) return false;
    if (!this.spendCoins(s.price)) return false;
    u = this.getUser();
    u.ownedSounds.push(soundId);
    this.saveUser(u);
    playSnd('purchase');
    showToast('🔊 ' + t('purchased'));
    return true;
  },
  
  // رندر صفحه فروشگاه (HTML)
  render: function() {
    var u = this.getUser();
    var html = '';
    
    // نوار بالای فروشگاه
    html += '<div class="shop-topbar">';
    html += '<button class="back-btn" onclick="showView(\'vh\');playSnd(\'click\')">←</button>';
    html += '<div class="shop-title">🛒 ' + t('shop') + '</div>';
    html += '<div class="shop-coins">🪙 ' + fmtNum(u.coins) + '</div>';
    html += '</div>';
    
    // تیک‌های ساده
    html += '<div class="shop-section">';
    html += '<div class="shop-section-title">✓ ' + t('simpleTicks') + '</div>';
    html += '<div class="shop-grid">';
    TICKS.simple.forEach(function(tick) {
      var owned = u.ownedTicks.indexOf(tick.id) >= 0;
      var active = u.selectedTick === tick.id;
      html += this.renderTickCard(tick, owned, active, u.coins);
    }.bind(this));
    html += '</div></div>';
    
    // تیک‌های متحرک
    html += '<div class="shop-section">';
    html += '<div class="shop-section-title">✨ ' + t('animatedTicks') + '</div>';
    html += '<div class="shop-grid">';
    TICKS.animated.forEach(function(tick) {
      var owned = u.ownedTicks.indexOf(tick.id) >= 0;
      var active = u.selectedTick === tick.id;
      html += this.renderTickCard(tick, owned, active, u.coins);
    }.bind(this));
    html += '</div></div>';
    
    // نمادهای ویژه
    html += '<div class="shop-section">';
    html += '<div class="shop-section-title">👑 ' + t('specialSymbols') + '</div>';
    html += '<div class="shop-grid">';
    TICKS.special.forEach(function(tick) {
      var owned = u.ownedTicks.indexOf(tick.id) >= 0;
      var active = u.selectedTick === tick.id;
      html += this.renderTickCard(tick, owned, active, u.coins);
    }.bind(this));
    html += '</div></div>';
    
    return html;
  },
  
  // رندر کارت تیک
  renderTickCard: function(tick, owned, active, coins) {
    var canBuy = coins >= tick.price;
    var cls = 'shop-card' + (owned ? ' owned' : '') + (active ? ' active' : '') + (!owned && !canBuy ? ' locked' : '');
    var btnText = active ? '✓ ' + t('active') : (owned ? '▶ ' + t('equipped') : (canBuy ? t('buy') : '🔒'));
    var priceText = owned ? '' : ('🪙 ' + fmtNum(tick.price));
    
    var html = '<div class="' + cls + '" onclick="SHOP.handleCardClick(\'' + tick.id + '\', ' + owned + ', ' + active + ', ' + canBuy + ')">';
    html += '<div class="shop-card-icon">' + renderTick(tick, 44) + '</div>';
    html += '<div class="shop-card-name">' + tick.name + '</div>';
    if (priceText) html += '<div class="shop-card-price">' + priceText + '</div>';
    html += '<div class="shop-card-btn">' + btnText + '</div>';
    html += '</div>';
    return html;
  },
  
  // مدیریت کلیک روی کارت
  handleCardClick: function(id, owned, active, canBuy) {
    if (active) {
      playSnd('tap');
      return;
    }
    if (owned) {
      if (this.equipTick(id)) {
        this.refresh();
      }
    } else {
      if (!canBuy) {
        playSnd('error');
        showToast('❌ ' + t('notEnoughCoins'));
        return;
      }
      if (this.buyTick(id)) {
        this.equipTick(id);
        this.refresh();
      }
    }
  },
  
  // رفرش صفحه فروشگاه
  refresh: function() {
    var container = document.getElementById('shopContent');
    if (container) {
      container.innerHTML = this.render();
    }
    // آپدیت سکه در نوار بالا
    var u = this.getUser();
    var coinEl = document.getElementById('hCoins');
    if (coinEl) coinEl.textContent = fmtNum(u.coins);
  }
};

// تابع نمایش Toast (ساده)
function showToast(msg) {
  var el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(function() {
    el.classList.remove('on');
  }, 2200);
        }
