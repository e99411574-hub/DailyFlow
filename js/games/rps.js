// ===== games/rps.js - بازی سنگ کاغذ قیچی =====

var RPS = {
  gameId: 'rps',
  userChoice: null,
  aiChoice: null,
  level: 'medium',
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  isPlaying: false,

  choices: [
    { id: 'rock',     icon: '🪨', label: 'سنگ',  beats: 'scissors' },
    { id: 'paper',    icon: '📄', label: 'کاغذ', beats: 'rock' },
    { id: 'scissors', icon: '✂️', label: 'قیچی', beats: 'paper' }
  ],

  levelLabels: {
    easy:   '😊 آسون',
    medium: '😎 متوسط',
    hard:   '🔥 سخت'
  },

  // ========== انتخاب سطح ==========
  setLevel: function(level) {
    this.level = level;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== انتخاب AI بر اساس سطح ==========
  _aiPick: function() {
    var c = this.choices;
    var r = Math.random();

    if (this.level === 'easy') {
      // AI ساده: تصادفی
      return c[Math.floor(Math.random() * 3)];
    }

    if (this.level === 'medium') {
      // AI متوسط: ۵۰٪ هوشمند، ۵۰٪ تصادفی
      if (r < 0.5 && this.userChoice) {
        // ببرنده رو انتخاب کن
        return c.find(function(x) { return x.beats === RPS.userChoice.id; });
      }
      return c[Math.floor(Math.random() * 3)];
    }

    if (this.level === 'hard') {
      // AI سخت: ۸۰٪ هوشمند
      if (r < 0.8 && this.userChoice) {
        return c.find(function(x) { return x.beats === RPS.userChoice.id; });
      }
      return c[Math.floor(Math.random() * 3)];
    }

    return c[Math.floor(Math.random() * 3)];
  },

  // ========== بازی کردن ==========
  play: function(choiceId) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    var self = this;
    this.userChoice = this.choices.find(function(c) { return c.id === choiceId; });

    if (typeof playSnd === 'function') playSnd('tap');

    // ۱. نمایش انتخاب کاربر
    this.refresh();

    // ۲. مکث ۵۰۰ میلی‌ثانیه
    setTimeout(function() {
      // انیمیشن حمله
      var pa = document.getElementById('rpsPlayerAvatar');
      if (pa) {
        pa.classList.add('attack-left');
        setTimeout(function() { pa.classList.remove('attack-left'); }, 500);
      }
      if (typeof playSnd === 'function') playSnd('click');
    }, 300);

    // ۳. AI انتخاب می‌کنه + نتیجه
    setTimeout(function() {
      self.aiChoice = self._aiPick();
      var result = self._checkResult(self.userChoice, self.aiChoice);

      // آپدیت آمار
      if (result === 'win')  { self.wins++;  self.streak++; }
      if (result === 'lose') { self.losses++; self.streak = 0; }
      if (result === 'draw') { self.draws++; }

      // جایزه
      self._giveReward(result);

      // انیمیشن AI
      var aa = document.getElementById('rpsAiAvatar');
      if (aa) {
        aa.classList.add('attack-right');
        setTimeout(function() { aa.classList.remove('attack-right'); }, 500);
      }

      // نشون دادن نتیجه
      self._showResult(result);
      self.isPlaying = false;
      self.refresh();

      // بعد از ۲ ثانیه ریست
      setTimeout(function() {
        self.userChoice = null;
        self.aiChoice = null;
        self.refresh();
      }, 2200);
    }, 900);
  },

  _checkResult: function(u, a) {
    if (!u || !a) return 'draw';
    if (u.id === a.id) return 'draw';
    if (u.beats === a.id) return 'win';
    return 'lose';
  },

  _giveReward: function(result) {
    if (result === 'win') {
      var coins = (this.level === 'easy') ? 5 : (this.level === 'medium') ? 10 : 20;
      var gems = 0;
      // هر ۳ برد = ۱ جم
      if ((this.wins % 3) === 0 && this.wins > 0) gems = 1;

      if (typeof SHOP !== 'undefined') {
        SHOP.addCoins(coins);
        if (gems) SHOP.addGems(gems);
      }
      if (typeof playSnd === 'function') playSnd('success');
    } else if (result === 'lose') {
      if (typeof playSnd === 'function') playSnd('error');
    } else {
      if (typeof playSnd === 'function') playSnd('click');
    }
  },

  _showResult: function(result) {
    var box = document.getElementById('rpsResultBox');
    if (!box) return;

    var title, color, icon;
    if (result === 'win') {
      title = '🎉 بردی!'; color = 'win';
      icon = '<span style="font-size:48px">🏆</span>';
    } else if (result === 'lose') {
      title = '😢 باختی'; color = 'lose';
      icon = '<span style="font-size:48px">💔</span>';
    } else {
      title = '🤝 مساوی'; color = 'draw';
      icon = '<span style="font-size:48px">🤝</span>';
    }

    var reward = '';
    if (result === 'win') {
      var coins = (this.level === 'easy') ? 5 : (this.level === 'medium') ? 10 : 20;
      reward = '+' + coins + ' 🪙';
    }

    box.innerHTML =
      '<div class="rps-result">' +
      '<div style="font-size:40px;margin-bottom:8px">' + icon + '</div>' +
      '<div class="rps-result-text ' + color + '">' + title + '</div>' +
      (reward ? '<div class="rps-result-reward">' + reward + '</div>' : '') +
      '</div>';

    box.classList.remove('hidden');
    setTimeout(function() { box.classList.add('hidden'); }, 2000);
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="rps-page">';

    // نوار بالا
    html += '<div class="rps-topbar">';
    html += '<button class="rps-back" onclick="RPS.back()">›</button>';
    html += '<div class="rps-title">✊ سنگ کاغذ قیچی</div>';
    html += '<div class="rps-score-badge">' + fmtNum(this.wins) + ' / ' + fmtNum(this.losses) + '</div>';
    html += '</div>';

    // سطوح
    html += '<div class="rps-levels">';
    html += '<div class="rps-level ' + (this.level === 'easy' ? 'active' : '') + '" onclick="RPS.setLevel(\'easy\')">' + this.levelLabels.easy + '</div>';
    html += '<div class="rps-level ' + (this.level === 'medium' ? 'active' : '') + '" onclick="RPS.setLevel(\'medium\')">' + this.levelLabels.medium + '</div>';
    html += '<div class="rps-level ' + (this.level === 'hard' ? 'active' : '') + '" onclick="RPS.setLevel(\'hard\')">' + this.levelLabels.hard + '</div>';
    html += '</div>';

    // نبرد
    var pIcon = this.userChoice ? this.userChoice.icon : '❔';
    var aIcon = this.aiChoice ? this.aiChoice.icon : '❔';
    var pCls = 'rps-avatar player';
    var aCls = 'rps-avatar ai';

    if (this.userChoice && this.aiChoice) {
      var r = this._checkResult(this.userChoice, this.aiChoice);
      if (r === 'win')  { pCls += ' win'; aCls += ' lose'; }
      if (r === 'lose') { aCls += ' win'; pCls += ' lose'; }
    }

    html += '<div class="rps-battle">';
    html += '<div class="rps-side">';
    html += '<div class="' + pCls + '" id="rpsPlayerAvatar">' + pIcon + '</div>';
    html += '<div class="rps-label">تو</div>';
    html += '</div>';
    html += '<div class="rps-vs">VS</div>';
    html += '<div class="rps-side">';
    html += '<div class="' + aCls + '" id="rpsAiAvatar">' + aIcon + '</div>';
    html += '<div class="rps-label">حریف</div>';
    html += '</div>';
    html += '</div>';

    // جای نتیجه
    html += '<div id="rpsResultBox" class="hidden"></div>';

    // دکمه‌های انتخاب
    html += '<div class="rps-choices">';
    for (var i = 0; i < this.choices.length; i++) {
      var c = this.choices[i];
      var selected = (this.userChoice && this.userChoice.id === c.id) ? 'selected' : '';
      var dis = this.isPlaying ? 'disabled' : '';
      html += '<button class="rps-choice ' + c.id + ' ' + selected + '" ' + dis + ' onclick="RPS.play(\'' + c.id + '\')">';
      html += '<div class="rps-choice-icon">' + c.icon + '</div>';
      html += '<div class="rps-choice-label">' + c.label + '</div>';
      html += '</button>';
    }
    html += '</div>';

    // آمار
    html += '<div class="rps-stats">';
    html += '<div class="rps-stat"><div class="rps-stat-num">' + fmtNum(this.wins) + '</div><div class="rps-stat-lbl">🏆 برد</div></div>';
    html += '<div class="rps-stat"><div class="rps-stat-num">' + fmtNum(this.draws) + '</div><div class="rps-stat-lbl">🤝 مساوی</div></div>';
    html += '<div class="rps-stat"><div class="rps-stat-num">' + fmtNum(this.losses) + '</div><div class="rps-stat-lbl">💔 باخت</div></div>';
    html += '</div>';

    html += '</div>';
    return html;
  },

  // ========== بازگشت ===========
  back: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    if (typeof ROUTER !== 'undefined') ROUTER.go('games');
  },

  // ========== بروزرسانی ==========
  refresh: function() {
    var c = document.getElementById('gamesContent');
    if (c) {
      c.innerHTML = this.render();
    }
  },

  // ========== شروع ==========
  start: function() {
    this.userChoice = null;
    this.aiChoice = null;
    this.isPlaying = false;
    this.refresh();
  }
};

// تابع سراسری برای شروع
function startGame_rps() {
  RPS.start();
}

window.RPS = RPS;
