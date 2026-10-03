// ===== games/guess.js - بازی حدس عدد =====

var GUESS = {
  gameId: 'guess',
  target: null,        // عدد سیستم (۱-۶۰)
  lastLow: null,       // آخرین حدس کوچیک‌تر
  lastHigh: null,      // آخرین حدس بزرگ‌تر
  usedNumbers: [],     // اعداد حدس‌زده
  timeLeft: 60,        // ثانیه
  timerInterval: null,
  isPlaying: false,
  wins: 0,
  losses: 0,
  bestTime: null,

  // ========== شروع بازی ==========
  start: function() {
    this.target = Math.floor(Math.random() * 60) + 1;
    this.lastLow = null;
    this.lastHigh = null;
    this.usedNumbers = [];
    this.timeLeft = 60;
    this.isPlaying = true;

    this._startTimer();
    this.refresh();

    if (typeof playSnd === 'function') playSnd('tap');
  },

  // ========== تایمر ==========
  _startTimer: function() {
    var self = this;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(function() {
      if (!self.isPlaying) return;
      self.timeLeft--;
      if (self.timeLeft <= 0) {
        self.timeLeft = 0;
        self._lose('timeout');
        return;
      }
      // آپدیت نمایش تایمر
      var t = document.getElementById('guessTimer');
      if (t) {
        t.textContent = self._formatTime(self.timeLeft);
        t.classList.remove('warn', 'danger');
        if (self.timeLeft <= 10) t.classList.add('danger');
        else if (self.timeLeft <= 20) t.classList.add('warn');
      }
    }, 1000);
  },

  _formatTime: function(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (s < 10) s = '0' + s;
    return '⏱ ' + (typeof toFa === 'function' ? toFa(m) : m) + ':' + (typeof toFa === 'function' ? toFa(s) : s);
  },

  // ========== حدس زدن ==========
  guess: function(num) {
    if (!this.isPlaying) return;
    if (this.usedNumbers.indexOf(num) >= 0) return;

    this.usedNumbers.push(num);
    if (typeof playSnd === 'function') playSnd('tap');

    if (num === this.target) {
      // برد!
      this._win();
      return;
    }

    // راهنما
    if (num < this.target) {
      this.lastLow = num;
      if (typeof playSnd === 'function') playSnd('click');
    } else {
      this.lastHigh = num;
      if (typeof playSnd === 'function') playSnd('click');
    }

    this.refresh();
  },

  // ========== برد ==========
  _win: function() {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.wins++;

    // بهترین زمان
    var timeTaken = 60 - this.timeLeft;
    if (this.bestTime === null || timeTaken < this.bestTime) {
      this.bestTime = timeTaken;
    }

    // جایزه
    var coins = 10;
    var gems = 1;
    var bonus = 0;

    if (timeTaken < 30) {
      bonus = 5;
      coins += bonus;
    }

    if (typeof SHOP !== 'undefined') {
      SHOP.addCoins(coins);
      SHOP.addGems(gems);
    }

    if (typeof playSnd === 'function') playSnd('success');

    // ذخیره در State
    if (typeof STATE !== 'undefined') {
      var games = STATE.get('games') || {};
      if (!games.guess) games.guess = { wins: 0, best: 0 };
      games.guess.wins = (games.guess.wins || 0) + 1;
      if (games.guess.best === 0 || timeTaken < games.guess.best) {
        games.guess.best = timeTaken;
      }
      STATE.set('games.guess', games.guess);
      STATE.save('games');
    }

    // آپدیت UI
    this.refresh();

    // نمایش مودال برد
    var self = this;
    setTimeout(function() {
      self._showModal('win', { time: timeTaken, coins: coins, gems: gems, bonus: bonus });
    }, 400);
  },

  // ========== باخت ==========
  _lose: function(reason) {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.losses++;

    if (typeof playSnd === 'function') playSnd('error');

    // ذخیره در State
    if (typeof STATE !== 'undefined') {
      var games = STATE.get('games') || {};
      if (!games.guess) games.guess = { wins: 0, best: 0 };
      STATE.set('games.guess', games.guess);
      STATE.save('games');
    }

    this.refresh();
    this._showModal('lose', { target: this.target, reason: reason });
  },

  // ========== مودال نتیجه ==========
  _showModal: function(type, data) {
    var modal = document.getElementById('guessModal');
    if (!modal) {
      // ساخت مودال اگه نبود
      modal = document.createElement('div');
      modal.id = 'guessModal';
      modal.className = 'guess-modal';
      document.body.appendChild(modal);
    }

    var html = '<div class="guess-modal-box">';

    if (type === 'win') {
      html += '<div class="guess-modal-stars">⭐⭐⭐</div>';
      html += '<div class="guess-modal-title win">🎉 بردی!</div>';
      html += '<div class="guess-modal-desc">عدد ' + (typeof toFa === 'function' ? toFa(this.target) : this.target) + ' بود — توی ' + (typeof toFa === 'function' ? toFa(data.time) : data.time) + ' ثانیه پیدا کردی!</div>';
      html += '<div class="guess-modal-reward">🪙 ' + (typeof toFa === 'function' ? toFa(data.coins) : data.coins) + '  💎 ' + (typeof toFa === 'function' ? toFa(data.gems) : data.gems) + '</div>';
      if (data.bonus > 0) {
        html += '<div style="font-size:12px;color:#E17055;font-weight:800;margin-bottom:12px">🚀 بونوس سرعت: +' + (typeof toFa === 'function' ? toFa(data.bonus) : data.bonus) + ' سکه</div>';
      }
      html += '<button class="guess-modal-btn green" onclick="GUESS.closeModal();GUESS.start()">بازی جدید</button>';
    } else {
      html += '<div class="guess-modal-stars">⭐</div>';
      html += '<div class="guess-modal-title">بازنده شدی!</div>';
      html += '<div class="guess-modal-desc">عدد ' + (typeof toFa === 'function' ? toFa(data.target) : data.target) + ' بود<br>بیشتر تلاش کن!</div>';
      html += '<button class="guess-modal-btn" onclick="GUESS.closeModal();GUESS.start()">تلاش دوباره</button>';
    }

    html += '</div>';
    modal.innerHTML = html;
    modal.classList.add('show');
  },

  closeModal: function() {
    var modal = document.getElementById('guessModal');
    if (modal) modal.classList.remove('show');
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="guess-page">';

    // نوار بالا
    html += '<div class="guess-topbar">';
    html += '<button class="guess-back" onclick="GUESS.back()">›</button>';
    html += '<div class="guess-title">🔢 حدس عدد</div>';
    var timerCls = 'guess-timer';
    if (this.timeLeft <= 10) timerCls += ' danger';
    else if (this.timeLeft <= 20) timerCls += ' warn';
    html += '<div class="' + timerCls + '" id="guessTimer">' + this._formatTime(this.timeLeft) + '</div>';
    html += '</div>';

    // خونه‌های بالا
    var lowVal = (this.lastLow !== null) ? (typeof toFa === 'function' ? toFa(this.lastLow) : this.lastLow) : '?';
    var highVal = (this.lastHigh !== null) ? (typeof toFa === 'function' ? toFa(this.lastHigh) : this.lastHigh) : '?';
    var midVal = '?';
    var midCls = 'guess-hint middle';

    // اگه برنده شد
    if (this.usedNumbers.indexOf(this.target) >= 0) {
      midVal = (typeof toFa === 'function' ? toFa(this.target) : this.target);
      midCls += ' win';
    }

    html += '<div class="guess-hints">';
    html += '<div class="guess-hint right">' + highVal + '</div>';
    html += '<div class="guess-arrow">›</div>';
    html += '<div class="' + midCls + '">' + midVal + '</div>';
    html += '<div class="guess-arrow">‹</div>';
    html += '<div class="guess-hint left">' + lowVal + '</div>';
    html += '</div>';

    // شبکه
    html += '<div class="guess-grid">';
    for (var i = 1; i <= 60; i++) {
      var used = this.usedNumbers.indexOf(i) >= 0;
      var cls = 'guess-cell';
      var txt = (typeof toFa === 'function') ? toFa(i) : i;

      if (used) {
        if (i === this.target) {
          cls += ' win';
        } else if (i < this.target) {
          cls += ' low';
        } else {
          cls += ' high';
        }
      }
      if (!this.isPlaying) cls += ' disabled';

      var onclick = used ? '' : 'onclick="GUESS.guess(' + i + ')"';
      html += '<button class="' + cls + '" ' + onclick + '>' + txt + '</button>';
    }
    html += '</div>';

    // راهنمای پایین
    var hintText = '🎯 حدست رو به هدف نزدیک کن!';
    var hintCls = 'guess-hint-text';
    if (this.usedNumbers.length > 0) {
      var last = this.usedNumbers[this.usedNumbers.length - 1];
      if (last === this.target) {
        hintText = '🎉 بردی! عدد ' + (typeof toFa === 'function' ? toFa(this.target) : this.target) + ' بود';
        hintCls += ' win';
      } else if (last < this.target) {
        hintText = '⬆️ برو بالاتر!';
        hintCls += ' up';
      } else {
        hintText = '⬇️ بیا پایین‌تر!';
        hintCls += ' down';
      }
    }

    html += '<div class="' + hintCls + '">' + hintText + '</div>';

    html += '</div>';
    return html;
  },

  // ========== بازگشت ==========
  back: function() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isPlaying = false;
    if (typeof playSnd === 'function') playSnd('tap');
    if (typeof ROUTER !== 'undefined') ROUTER.go('games');
  },

  // ========== بروزرسانی ==========
  refresh: function() {
    var c = document.getElementById('gamesContent');
    if (c) {
      c.innerHTML = this.render();
    }
  }
};

// تابع سراسری برای شروع
function startGame_guess() {
  GUESS.start();
}

window.GUESS = GUESS;
