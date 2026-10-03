// ===== missions.js - ماموریت‌های روزانه =====

var MISSIONS = {
  data: {
    gamesPlayed: 0,      // تعداد بازی‌های انجام‌شده
    winsCount: 0,        // تعداد بردها
    shopOpened: 0,       // فروشگاه باز شده
    aiAsked: 0,          // سؤال از AI پرسیده شده
    lastReset: 0         // زمان آخرین ریست
  },

  // تعریف ماموریت‌ها
  list: [
    {
      id: 'gamesPlayed',
      icon: '🎮',
      label: '۳ بازی انجام بده',
      target: 3,
      reward: 5,
      rewardType: 'gem'
    },
    {
      id: 'winsCount',
      icon: '🏆',
      label: '۱ برد بگیر',
      target: 1,
      reward: 2,
      rewardType: 'gem'
    },
    {
      id: 'shopOpened',
      icon: '🛒',
      label: 'فروشگاه رو باز کن',
      target: 1,
      reward: 1,
      rewardType: 'gem'
    },
    {
      id: 'aiAsked',
      icon: '❓',
      label: 'یه سؤال از هوش مصنوعی بپرس',
      target: 1,
      reward: 2,
      rewardType: 'gem'
    }
  ],

  rewarded: {},   // { missionId: true }  نشون می‌ده کدوم‌ها جایزه گرفتن

  // ========== راه‌اندازی ==========
  init: function() {
    this._load();
    this._checkReset();
  },

  // ========== بارگذاری ==========
  _load: function() {
    try {
      var raw = localStorage.getItem('setareh_missions');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.data) this.data = parsed.data;
        if (parsed.rewarded) this.rewarded = parsed.rewarded;
      }
    } catch (e) {
      console.warn('Missions load error:', e);
    }
  },

  _save: function() {
    try {
      localStorage.setItem('setareh_missions', JSON.stringify({
        data: this.data,
        rewarded: this.rewarded
      }));
    } catch (e) {
      console.warn('Missions save error:', e);
    }
  },

  // ========== ریست روزانه ==========
  _checkReset: function() {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (this.data.lastReset !== today) {
      // ریست
      this.data.gamesPlayed = 0;
      this.data.winsCount = 0;
      this.data.shopOpened = 0;
      this.data.aiAsked = 0;
      this.data.lastReset = today;
      this.rewarded = {};
      this._save();
      console.log('🎯 ماموریت‌های روزانه ریست شدن');
    }
  },

  // ========== ثبت رویدادها ==========
  trackGame: function() {
    this._checkReset();
    this.data.gamesPlayed++;
    this._save();
    this._checkAll();
  },

  trackWin: function() {
    this._checkReset();
    this.data.winsCount++;
    this._save();
    this._checkAll();
  },

  trackShop: function() {
    this._checkReset();
    if (this.data.shopOpened === 0) {
      this.data.shopOpened = 1;
      this._save();
      this._checkAll();
    }
  },

  trackAI: function() {
    this._checkReset();
    if (this.data.aiAsked === 0) {
      this.data.aiAsked = 1;
      this._save();
      this._checkAll();
    }
  },

  // ========== بررسی همه ماموریت‌ها ==========
  _checkAll: function() {
    for (var i = 0; i < this.list.length; i++) {
      var m = this.list[i];
      var current = this.data[m.id] || 0;
      if (current >= m.target && !this.rewarded[m.id]) {
        this._giveReward(m);
      }
    }
    // اگه توی صفحهٔ خانه هستیم، رندر کن
    if (typeof APP !== 'undefined' && APP.renderHome && document.getElementById('homeContent')) {
      // فقط اگه کاربر توی صفحهٔ خانه‌ست
      if (document.getElementById('homeContent').innerHTML.indexOf('missions-section') >= 0) {
        this._refreshHomeMissions();
      }
    }
  },

  // ========== دادن جایزه ==========
  _giveReward: function(mission) {
    this.rewarded[mission.id] = true;
    this._save();

    // اضافه کردن جم
    if (mission.rewardType === 'gem' && typeof SHOP !== 'undefined') {
      SHOP.addGems(mission.reward);
    } else if (mission.rewardType === 'coin' && typeof SHOP !== 'undefined') {
      SHOP.addCoins(mission.reward);
    }

    // صدا
    if (typeof playSnd === 'function') playSnd('success');

    // پیام
    this._showToast(mission);

    // بروزرسانی هدر
    if (typeof APP !== 'undefined' && APP.updateHeader) APP.updateHeader();
  },

  // ========== پیام ماموریت ==========
  _showToast: function(mission) {
    var el = document.getElementById('missionToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'missionToast';
      el.className = 'mission-toast';
      document.body.appendChild(el);
    }

    el.innerHTML = '<span class="icon">🎉</span>' +
      '<span>ماموریت تکمیل شد! +' + (typeof toFa === 'function' ? toFa(mission.reward) : mission.reward) + ' 💎</span>';

    setTimeout(function() {
      el.classList.add('show');
    }, 50);

    setTimeout(function() {
      el.classList.remove('show');
    }, 3000);
  },

  // ========== بررسی تکمیل بودن ==========
  isCompleted: function(missionId) {
    return this.rewarded[missionId] === true;
  },

  getProgress: function(missionId) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id === missionId) {
        return {
          current: this.data[missionId] || 0,
          target: this.list[i].target
        };
      }
    }
    return { current: 0, target: 1 };
  },

  // ========== بروزرسانی صفحهٔ خانه ==========
  _refreshHomeMissions: function() {
    var container = document.getElementById('missionsContainer');
    if (container) {
      container.innerHTML = this.render();
    }
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="missions-section">';
    html += '<div class="missions-title"><span class="icon">🏆</span><span>ماموریت‌های روزانه</span></div>';

    for (var i = 0; i < this.list.length; i++) {
      var m = this.list[i];
      var current = this.data[m.id] || 0;
      if (current > m.target) current = m.target;
      var completed = this.rewarded[m.id] === true;
      var percent = Math.round((current / m.target) * 100);

      html += '<div class="mission-card' + (completed ? ' completed' : '') + '" style="animation-delay:' + (i * 0.05) + 's">';

      // ردیف بالا
      html += '<div class="mission-top">';
      html += '<div class="mission-icon">' + (completed ? '✅' : m.icon) + '</div>';
      html += '<div class="mission-info">';
      html += '<div class="mission-label">' + m.label + '</div>';
      html += '</div>';
      html += '<div class="mission-reward">' + (completed ? '✓ دریافت شد' : '🎁 ' + toFa(m.reward) + ' 💎') + '</div>';
      html += '</div>';

      // نوار پیشرفت
      html += '<div class="mission-progress-wrap">';
      html += '<div class="mission-progress">';
      html += '<div class="mission-progress-fill" style="width:' + percent + '%"></div>';
      html += '</div>';
      html += '<div class="mission-progress-text">' + toFa(current) + '/' + toFa(m.target) + '</div>';
      html += '</div>';

      html += '</div>';
    }

    html += '</div>';
    return html;
  }
};

window.MISSIONS = MISSIONS;
