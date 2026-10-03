// ===== games/memory.js - بازی حافظه =====

var MEMORY = {
  gameId: 'memory',
  cards: [],           // [{id, symbol, flipped, matched}]
  firstCard: null,
  secondCard: null,
  lockBoard: false,
  isPlaying: false,
  moves: 0,
  matches: 0,
  totalPairs: 8,
  timeLeft: 120,
  timerInterval: null,
  wins: 0,
  bestTime: null,

  // ایموجی‌های کارت‌ها
  symbols: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🥝'],

  // ========== شروع ==========
  start: function() {
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.lockBoard = false;
    this.isPlaying = true;
    this.moves = 0;
    this.matches = 0;
    this.timeLeft = 120;

    // ساخت جفت‌ها
    var deck = [];
    for (var i = 0; i < this.symbols.length; i++) {
      deck.push({ id: i, symbol: this.symbols[i] });
      deck.push({ id: i, symbol: this.symbols[i] });
    }

    // شافل
    for (var j = deck.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = deck[j]; deck[j] = deck[k]; deck[k] = tmp;
    }

    // تبدیل به کارت
    for (var m = 0; m < deck.length; m++) {
      this.cards.push({
        id: deck[m].id,
        symbol: deck[m].symbol,
        flipped: false,
        matched: false
      });
    }

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
      var el = document.getElementById('memTimer');
      if (el) el.textContent = self._fmtTime(self.timeLeft);
      if (self.timeLeft <= 0) {
        self._lose('timeout');
      }
    }, 1000);
  },

  _fmtTime: function(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (s < 10) s = '0' + s;
    var fa = (typeof toFa === 'function');
    return (fa ? toFa(m) : m) + ':' + (fa ? toFa(s) : s);
  },

  // ========== کلیک کارت ==========
  flipCard: function(idx) {
    if (this.lockBoard) return;
    if (!this.isPlaying) return;
    var card = this.cards[idx];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    if (typeof playSnd === 'function') playSnd('click');
    this.refresh();

    if (!this.firstCard) {
      this.firstCard = idx;
      return;
    }

    // کارت دوم
    this.secondCard = idx;
    this.moves++;
    this._checkMatch();
  },

  _checkMatch: function() {
    var self = this;
    var c1 = this.cards[this.firstCard];
    var c2 = this.cards[this.secondCard];

    if (c1.id === c2.id) {
      // جفت پیدا شد
      setTimeout(function() {
        c1.matched = true;
        c2.matched = true;
        self.matches++;
        self.firstCard = null;
        self.secondCard = null;
        self.lockBoard = false;
        if (typeof playSnd === 'function') playSnd('success');
        self.refresh();

        if (self.matches === self.totalPairs) {
          self._win();
        }
      }, 400);
    } else {
      // غلط
      this.lockBoard = true;
      if (typeof playSnd === 'function') playSnd('error');
      setTimeout(function() {
        c1.flipped = false;
        c2.flipped = false;
        self.firstCard = null;
        self.secondCard = null;
        self.lockBoard = false;
        self.refresh();
      }, 900);
    }
  },

  // ========== برد ==========
  _win: function() {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.wins++;

    var timeTaken = 120 - this.timeLeft;
    if (this.bestTime === null || timeTaken < this.bestTime) {
      this.bestTime = timeTaken;
    }

    // محاسبهٔ ستاره‌ها
    var stars = 1;
    if (this.moves <= 16) stars = 3;
    else if (this.moves <= 22) stars = 2;

    // جایزه
    var coins = 20;
    var gems = 2;
    if (stars === 3) coins += 15;
    else if (stars === 2) coins += 5;

    if (typeof SHOP !== 'undefined') {
      SHOP.addCoins(coins);
      SHOP.addGems(gems);
    }

    if (typeof STATE !== 'undefined') {
      var games = STATE.get('games') || {};
      if (!games.memory) games.memory = { wins: 0, best: 0 };
      games.memory.wins = (games.memory.wins || 0) + 1;
      if (games.memory.best === 0 || timeTaken < games.memory.best) {
        games.memory.best = timeTaken;
      }
      STATE.set('games.memory', games.memory);
      STATE.save('games');
    }

    if (typeof playSnd === 'function') playSnd('success');
    this.refresh();

    var self = this;
    setTimeout(function() {
      self._showModal('win', {
        time: timeTaken, moves: self.moves,
        stars: stars, coins: coins, gems: gems
      });
    }, 600);
  },

  // ========== باخت ==========
  _lose: function(reason) {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (typeof playSnd === 'function') playSnd('error');
    this.refresh();
    this._showModal('lose', { matches: this.matches });
  },

  // ========== مودال ==========
  _showModal: function(type, data) {
    var modal = document.getElementById('memModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'memModal';
      modal.className = 'mem-modal';
      document.body.appendChild(modal);
    }

    var html = '<div class="mem-modal-box">';

    if (type === 'win') {
      var starsStr = '';
      for (var i = 0; i < 3; i++) {
        starsStr += (i < data.stars) ? '⭐' : '☆';
      }
      html += '<div class="mem-modal-icon">' + starsStr + '</div>';
      html += '<div class="mem-modal-title">🎉 بردی!</div>';
      html += '<div class="mem-modal-desc">' +
        '⏱ زمان: ' + fmtNum(data.time) + ' ثانیه<br>' +
        '🎯 حرکت: ' + fmtNum(data.moves) + '<br>' +
        '🏆 ' + data.stars + ' ستاره' +
        '</div>';
      html += '<div class="mem-modal-reward">🪙 ' + fmtNum(data.coins) + '  💎 ' + fmtNum(data.gems) + '</div>';
      html += '<button class="mem-modal-btn" onclick="MEMORY.closeModal();MEMORY.start()">بازی جدید</button>';
    } else {
      html += '<div class="mem-modal-icon">⏰</div>';
      html += '<div class="mem-modal-title" style="color:#E84393">زمان تموم شد!</div>';
      html += '<div class="mem-modal-desc">' + fmtNum(data.matches) + ' از ' + fmtNum(this.totalPairs) + ' جفت پیدا کردی</div>';
      html += '<button class="mem-modal-btn" style="background:linear-gradient(135deg,#E84393,#FD79A8)" onclick="MEMORY.closeModal();MEMORY.start()">تلاش دوباره</button>';
    }

    html += '</div>';
    modal.innerHTML = html;
    modal.classList.add('show');
  },

  closeModal: function() {
    var modal = document.getElementById('memModal');
    if (modal) modal.classList.remove('show');
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="mem-page">';

    // نوار بالا
    html += '<div class="mem-topbar">';
    html += '<button class="mem-back" onclick="MEMORY.back()">›</button>';
    html += '<div class="mem-title">🃏 حافظه</div>';
    html += '<div class="mem-info"><span class="pairs">✓ ' + fmtNum(this.matches) + '/' + fmtNum(this.totalPairs) + '</span></div>';
    html += '</div>';

    // آمار
    html += '<div class="mem-stats">';
    html += '<div class="mem-stat"><div class="mem-stat-num" id="memTimer">' + this._fmtTime(this.timeLeft) + '</div><div class="mem-stat-lbl">⏱ زمان</div></div>';
    html += '<div class="mem-stat"><div class="mem-stat-num">' + fmtNum(this.moves) + '</div><div class="mem-stat-lbl">🎯 حرکت</div></div>';
    html += '<div class="mem-stat"><div class="mem-stat-num">' + fmtNum(this.wins) + '</div><div class="mem-stat-lbl">🏆 برد</div></div>';
    html += '</div>';

    // تخته
    html += '<div class="mem-board">';
    for (var i = 0; i < this.cards.length; i++) {
      var c = this.cards[i];
      var cls = 'mem-card';
      if (c.flipped || c.matched) cls += ' flipped';
      if (c.matched) cls += ' matched';

      html += '<button class="' + cls + '" onclick="MEMORY.flipCard(' + i + ')">';
      html += '<div class="mem-card-inner">';
      html += '<div class="mem-card-back"></div>';
      html += '<div class="mem-card-front">' + c.symbol + '</div>';
      html += '</div>';
      html += '</button>';
    }
    html += '</div>';

    // دکمهٔ بازی جدید
    html += '<button class="mem-new-btn" onclick="MEMORY.start()">🔄 بازی جدید</button>';

    html += '</div>';
    return html;
  },

  // ========== بازگشت ==========
  back: function() {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
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
function startGame_memory() {
  MEMORY.start();
}

window.MEMORY = MEMORY;
