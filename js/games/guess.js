// ===== games/guess.js - بازی حدس عدد (نسخهٔ جدید) =====

var GUESS = {
  gameId: 'guess',
  target: null,
  lastLow: null,
  lastHigh: null,
  usedNumbers: [],
  timeLeft: 60,
  totalTime: 60,
  timerInterval: null,
  isPlaying: false,
  wins: 0,
  losses: 0,
  bestTime: null,
  lastPickedNum: null,

  // ========== شروع بازی ==========
  start: function() {
    this.target = Math.floor(Math.random() * 60) + 1;
    this.lastLow = null;
    this.lastHigh = null;
    this.usedNumbers = [];
    this.timeLeft = 60;
    this.isPlaying = true;
    this.lastPickedNum = null;

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
      self._updateTimerUI();
    }, 1000);
  },

  _updateTimerUI: function() {
    var t = document.getElementById('guessTimer');
    if (!t) return;
    var m = Math.floor(this.timeLeft / 60);
    var s = this.timeLeft % 60;
    if (s < 10) s = '0' + s;
    var fa = (typeof toFa === 'function');
    t.textContent = (fa ? toFa(m) : m) + ':' + (fa ? toFa(s) : s);

    t.classList.remove('warn', 'danger');
    if (this.timeLeft <= 10) t.classList.add('danger');
    else if (this.timeLeft <= 20) t.classList.add('warn');
  },

  // ========== حدس زدن ==========
  guess: function(num) {
    if (!this.isPlaying) return;
    if (this.usedNumbers.indexOf(num) >= 0) return;

    this.usedNumbers.push(num);
    this.lastPickedNum = num;
    if (typeof playSnd === 'function') playSnd('tap');

    if (num === this.target) {
      this._win();
      return;
    }

    // راهنما
    if (num < this.target) {
      this.lastLow = num;
    } else {
      this.lastHigh = num;
    }

    this._updatePickedCell(num);
    this._updateHintsUI();
    this._updateHintText();
  },

  // ========== بروزرسانی فقط یه خونه ==========
  _updatePickedCell: function(num) {
    var cell = document.getElementById('guessCell' + num);
    if (!cell) return;

    cell.classList.add('used');
    if (num < this.target) cell.classList.add('low');
    else cell.classList.add('high');

    cell.classList.add('new-pick');
    setTimeout(function() {
      cell.classList.remove('new-pick');
    }, 500);
  },

  // ========== بروزرسانی خونه‌های بالا ==========
  _updateHintsUI: function() {
    var lowEl = document.getElementById('guessHintLow');
    var midEl = document.getElementById('guessHintMid');
    var highEl = document.getElementById('guessHintHigh');

    if (lowEl) lowEl.textContent = this.lastLow !== null ? (typeof toFa === 'function' ? toFa(this.lastLow) : this.lastLow) : '?';
    if (highEl) highEl.textContent = this.lastHigh !== null ? (typeof toFa === 'function' ? toFa(this.lastHigh) : this.lastHigh) : '?';

    if (midEl) {
      midEl.textContent = '?';
      midEl.className = 'guess-hint-box mid';
    }
  },

  // ========== بروزرسانی متن راهنما ==========
  _updateHintText: function() {
    var el = document.getElementById('guessHintText');
    if (!el) return;
    var last = this.usedNumbers[this.usedNumbers.length - 1];
    var cls = 'guess-hint-text';
    var text = '';

    if (last === this.target) {
      text = '🎉 بردی! عدد ' + (typeof toFa === 'function' ? toFa(this.target) : this.target) + ' بود';
      cls += ' win';
    } else if (last < this.target) {
      text = '⬆️ برو بالاتر!';
      cls += ' up';
    } else {
      text = '⬇️ بیا پایین‌تر!';
      cls += ' down';
    }

    el.textContent = text;
    el.className = cls;
  },

  // ========== برد ==========
  _win: function() {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.wins++;

    var timeTaken = this.totalTime - this.timeLeft;
    if (this.bestTime === null || timeTaken < this.bestTime) {
      this.bestTime = timeTaken;
    }

    // بروزرسانی خونه‌های بالا
    var lowEl = document.getElementById('guessHintLow');
    var midEl = document.getElementById('guessHintMid');
    var highEl = document.getElementById('guessHintHigh');
    var hintEl = document.getElementById('guessHintText');

    if (midEl) {
      midEl.textContent = (typeof toFa === 'function' ? toFa(this.target) : this.target);
      midEl.className = 'guess-hint-box win';
    }
    if (hintEl) {
      hintEl.textContent = '🎉 بردی! عدد ' + (typeof toFa === 'function' ? toFa(this.target) : this.target) + ' بود';
      hintEl.className = 'guess-hint-text win';
    }

    // بروزرسانی خونهٔ برنده
    var winCell = document.getElementById('guessCell' + this.target);
    if (winCell) {
      winCell.classList.remove('used', 'low', 'high');
      winCell.classList.add('used', 'win');
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

    var self = this;
    setTimeout(function() {
      self._showModal('win', { time: timeTaken, coins: coins, gems: gems, bonus: bonus });
    }, 600);
  },

  // ========== باخت ==========
  _lose: function(reason) {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.losses++;

    if (typeof playSnd === 'function') playSnd('error');

    var hintEl = document.getElementById('guessHintText');
    var midEl = document.getElementById('guessHintMid');
    if (midEl) {
      midEl.textContent = (typeof toFa === 'function' ? toFa(this.target) : this.target);
      midEl.className = 'guess-hint-box win';
    }
    if (hintEl) {
      hintEl.textContent = '⏰ زمان تموم شد!';
      hintEl.className = 'guess-hint-text';
    }

    var self = this;
    setTimeout(function() {
      self._showModal('lose', { target: self.target });
    }, 600);
  },

  // ========== مودال ==========
  _showModal: function(type, data) {
    var modal = document.getElementById('guessModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'guessModal';
      modal.className = 'guess-modal';
      document.body.appendChild(modal);
    }

    var html = '<div class="guess-modal-box">';

    if (type === 'win') {
      html += '<div class="guess-modal-icon">🏆</div>';
      html += '<div class="guess-modal-title">🎉 بردی!</div>';
      html += '<div class="guess-modal-desc">' +
        '⏱ زمان: ' + fmtNum(data.time) + ' ثانیه<br>' +
        '🎯 عدد ' + fmtNum(this.target) + ' بود' +
        '</div>';
      html += '<div class="guess-modal-reward">🪙 ' + fmtNum(data.coins) + '  💎 ' + fmtNum(data.gems) + '</div>';
      if (data.bonus > 0) {
        html += '<div style="font-size:12px;color:#E17055;font-weight:800;margin-bottom:10px">🚀 بونوس سرعت: +' + fmtNum(data.bonus) + ' سکه</div>';
      }
      html += '<button class="guess-modal-btn" onclick="GUESS.closeModal();GUESS.start()">بازی جدید</button>';
    } else {
      html += '<div class="guess-modal-icon">⏰</div>';
      html += '<div class="guess-modal-title lose">زمان تموم شد!</div>';
      html += '<div class="guess-modal-desc">عدد ' + fmtNum(data.target) + ' بود<br>بیشتر تلاش کن!</div>';
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
    var timerCls = 'guess-timer';
    if (this.timeLeft <= 10) timerCls += ' danger';
    else if (this.timeLeft <= 20) timerCls += ' warn';

    var m = Math.floor(this.timeLeft / 60);
    var s = this.timeLeft % 60;
    if (s < 10) s = '0' + s;
    var fa = (typeof toFa === 'function');
    var timerTxt = (fa ? toFa(m) : m) + ':' + (fa ? toFa(s) : s);

    html += '<div class="guess-topbar">';
    html += '<button class="guess-back" onclick="GUESS.back()">›</button>';
    html += '<div class="guess-title">🔢 حدس عدد</div>';
    html += '<div class="' + timerCls + '" id="guessTimer">' + timerTxt + '</div>';
    html += '</div>';

    // نمایشگر
    html += '<div class="guess-display">';
    html += '<div class="guess-display-info">';
    html += '<div class="guess-display-label">عدد بین</div>';
    html += '<div class="guess-display-range">۱ - ۶۰</div>';
    html += '</div>';
    html += '<div class="guess-display-attempts">';
    html += '<div class="num">' + fmtNum(this.usedNumbers.length) + '</div>';
    html += '<div class="lbl">تلاش</div>';
    html += '</div>';
    html += '</div>';

    // خونه‌های بالا
    var lowVal = this.lastLow !== null ? (typeof toFa === 'function' ? toFa(this.lastLow) : this.lastLow) : '?';
    var highVal = this.lastHigh !== null ? (typeof toFa === 'function' ? toFa(this.lastHigh) : this.lastHigh) : '?';
    var midVal = '?';
    var midCls = 'guess-hint-box mid';

    if (this.usedNumbers.indexOf(this.target) >= 0) {
      midVal = (typeof toFa === 'function' ? toFa(this.target) : this.target);
      midCls += ' win';
    }

    html += '<div class="guess-hints">';
    html += '<div class="guess-hint-box high" id="guessHintHigh">' + highVal + '</div>';
    html += '<div class="guess-hint-arrow">›</div>';
    html += '<div class="' + midCls + '" id="guessHintMid">' + midVal + '</div>';
    html += '<div class="guess-hint-arrow">‹</div>';
    html += '<div class="guess-hint-box low" id="guessHintLow">' + lowVal + '</div>';
    html += '</div>';

    // شبکه
    html += '<div class="guess-grid" id="guessGrid">';
    for (var i = 1; i <= 60; i++) {
      var used = this.usedNumbers.indexOf(i) >= 0;
      var cls = 'guess-cell';
      var txt = (typeof toFa === 'function') ? toFa(i) : i;

      if (used) {
        if (i === this.target) cls += ' used win';
        else if (i < this.target) cls += ' used low';
        else cls += ' used high';
      }
      if (!this.isPlaying && !used) cls += ' disabled';

      var onclick = used ? '' : 'onclick="GUESS.guess(' + i + ')"';
      html += '<button class="' + cls + '" id="guessCell' + i + '" ' + onclick + '>' + txt + '</button>';
    }
    html += '</div>';

    // راهنما
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

    html += '<div class="' + hintCls + '" id="guessHintText">' + hintText + '</div>';

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

  // ========== بروزرسانی کامل ==========
  refresh: function() {
    var c = document.getElementById('gamesContent');
    if (c) c.innerHTML = this.render();
  }
};

// تابع سراسری
function startGame_guess() {
  GUESS.start();
}

window.GUESS = GUESS;
