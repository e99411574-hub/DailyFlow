// ===== games/rps.js - بازی سنگ کاغذ قیچی (نسخهٔ جدید) =====

var RPS = {
  gameId: 'rps',
  userChoice: null,
  aiChoice: null,
  level: 'medium',
  wins: 0,
  losses: 0,
  draws: 0,
  isPlaying: false,
  showResult: false,

  choices: [
    { id: 'rock',     icon: '🪨' },
    { id: 'paper',    icon: '📄' },
    { id: 'scissors', icon: '✂️' }
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
      return c[Math.floor(Math.random() * 3)];
    }

    if (this.level === 'medium') {
      if (r < 0.5 && this.userChoice) {
        return this._getBeater(this.userChoice.id);
      }
      return c[Math.floor(Math.random() * 3)];
    }

    // hard
    if (r < 0.8 && this.userChoice) {
      return this._getBeater(this.userChoice.id);
    }
    return c[Math.floor(Math.random() * 3)];
  },

  _getBeater: function(id) {
    var map = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
    var target = map[id];
    for (var i = 0; i < this.choices.length; i++) {
      if (this.choices[i].id === target) return this.choices[i];
    }
    return this.choices[0];
  },

  // ========== بازی کردن ==========
  play: function(choiceId) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.showResult = false;

    var self = this;
    this.userChoice = null;
    for (var i = 0; i < this.choices.length; i++) {
      if (this.choices[i].id === choiceId) this.userChoice = this.choices[i];
    }

    if (typeof playSnd === 'function') playSnd('tap');

    // مرحله ۱: نمایش انتخاب کاربر
    this.refresh();
    var pAvatar = document.getElementById('rpsPlayerAvatar');
    if (pAvatar) {
      pAvatar.classList.add('reveal');
      setTimeout(function() { pAvatar.classList.remove('reveal'); }, 700);
    }

    // مرحله ۲: AI در حال فکر کردن
    setTimeout(function() {
      var aAvatar = document.getElementById('rpsAiAvatar');
      if (aAvatar) aAvatar.classList.add('thinking');
    }, 700);

    // مرحله ۳: AI انتخاب می‌کنه
    setTimeout(function() {
      self.aiChoice = self._aiPick();
      var aAvatar = document.getElementById('rpsAiAvatar');
      if (aAvatar) {
        aAvatar.classList.remove('thinking');
        aAvatar.classList.add('reveal');
        setTimeout(function() { aAvatar.classList.remove('reveal'); }, 700);
      }
      if (typeof playSnd === 'function') playSnd('click');
      self.refresh();
    }, 1400);

    // مرحله ۴: انیمیشن حمله (بعد از انتخاب AI)
    setTimeout(function() {
      var pA = document.getElementById('rpsPlayerAvatar');
      var aA = document.getElementById('rpsAiAvatar');
      if (pA) pA.classList.add('attack-left');
      if (aA) aA.classList.add('attack-right');
      setTimeout(function() {
        if (pA) pA.classList.remove('attack-left');
        if (aA) aA.classList.remove('attack-right');
      }, 1000);
      if (typeof playSnd === 'function') playSnd('click');
    }, 2200);

    // مرحله ۵: نتیجه
    setTimeout(function() {
      var result = self._checkResult(self.userChoice, self.aiChoice);

      if (result === 'win')  { self.wins++;  }
      if (result === 'lose') { self.losses++; }
      if (result === 'draw') { self.draws++; }

      self._giveReward(result);
      self.showResult = true;
      self.isPlaying = false;
      self.refresh();

      if (typeof playSnd === 'function') {
        if (result === 'win') playSnd('success');
        else if (result === 'lose') playSnd('error');
      }
    }, 3300);
  },

  _checkResult: function(u, a) {
    if (!u || !a) return 'draw';
    if (u.id === a.id) return 'draw';
    if (u.id === 'rock' && a.id === 'scissors') return 'win';
    if (u.id === 'paper' && a.id === 'rock') return 'win';
    if (u.id === 'scissors' && a.id === 'paper') return 'win';
    return 'lose';
  },

  _giveReward: function(result) {
    if (result === 'win') {
      var coins = (this.level === 'easy') ? 5 : (this.level === 'medium') ? 10 : 20;
      var gems = 0;
      if ((this.wins % 3) === 0 && this.wins > 0) gems = 1;

      if (typeof SHOP !== 'undefined') {
        SHOP.addCoins(coins);
        if (gems) SHOP.addGems(gems);
      }

      if (typeof STATE !== 'undefined') {
        var games = STATE.get('games') || {};
        if (!games.rps) games.rps = { wins: 0, losses: 0, draws: 0 };
        games.rps.wins = (games.rps.wins || 0) + 1;
        STATE.set('games.rps', games.rps);
        STATE.save('games');
      }

      this._lastReward = { coins: coins, gems: gems };
    } else {
      this._lastReward = null;
    }
  },

  // ========== بازی جدید ==========
  reset: function() {
    this.userChoice = null;
    this.aiChoice = null;
    this.isPlaying = false;
    this.showResult = false;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
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

    // نتیجه
    if (this.showResult && this.userChoice && this.aiChoice) {
      var res = this._checkResult(this.userChoice, this.aiChoice);
      var icon = res === 'win' ? '🏆' : (res === 'lose' ? '💔' : '🤝');
      var txt = res === 'win' ? '🎉 بردی!' : (res === 'lose' ? '😢 باختی' : '🤝 مساوی');
      var cls = res === 'win' ? 'win' : (res === 'lose' ? 'lose' : 'draw');

      html += '<div class="rps-result">';
      html += '<div class="rps-result-icon">' + icon + '</div>';
      html += '<div class="rps-result-text ' + cls + '">' + txt + '</div>';
      if (res === 'win' && this._lastReward) {
        html += '<div class="rps-result-reward">🪙 ' + fmtNum(this._lastReward.coins);
        if (this._lastReward.gems) html += '  💎 ' + fmtNum(this._lastReward.gems);
        html += '</div>';
      }
      html += '<button class="rps-choice" style="margin-top:12px;width:100%;aspect-ratio:auto;padding:14px;background:linear-gradient(135deg,var(--pr),var(--pr2));color:white;font-size:15px;font-weight:800;border-radius:16px" onclick="RPS.reset()">🔄 بازی جدید</button>';
      html += '</div>';
    }

    // دکمه‌های انتخاب (فقط وقتی نتیجه نشون داده نشده)
    if (!this.showResult) {
      html += '<div class="rps-choices">';
      for (var i = 0; i < this.choices.length; i++) {
        var c = this.choices[i];
        var selected = (this.userChoice && this.userChoice.id === c.id) ? 'selected' : '';
        var dis = this.isPlaying ? 'disabled' : '';
        html += '<button class="rps-choice ' + c.id + ' ' + selected + '" ' + dis + ' onclick="RPS.play(\'' + c.id + '\')">';
        html += '<span class="rps-choice-icon">' + c.icon + '</span>';
        html += '</button>';
      }
      html += '</div>';
    }

    // آمار
    html += '<div class="rps-stats">';
    html += '<div class="rps-stat"><div class="rps-stat-num">' + fmtNum(this.wins) + '</div><div class="rps-stat-lbl">🏆 برد</div></div>';
    html += '<div class="rps-stat"><div class="rps-stat-num">' + fmtNum(this.draws) + '</div><div class="rps-stat-lbl">🤝 مساوی</div></div>';
    html += '<div class="rps-stat"><div class="rps-stat-num">' + fmtNum(this.losses) + '</div><div class="rps-stat-lbl">💔 باخت</div></div>';
    html += '</div>';

    html += '</div>';
    return html;
  },

  // ========== بازگشت ==========
  back: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    if (typeof ROUTER !== 'undefined') ROUTER.go('games');
  },

  // ========== بروزرسانی ==========
  refresh: function() {
    var c = document.getElementById('gamesContent');
    if (c) c.innerHTML = this.render();
  }
};

// تابع سراسری
function startGame_rps() {
  RPS.reset();
}

window.RPS = RPS;
