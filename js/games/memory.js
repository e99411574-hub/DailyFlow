// ===== games/memory.js - بازی حافظه (نسخهٔ نهایی) =====

var MEMORY = {
  gameId: 'memory',
  cards: [],
  firstCard: null,
  secondCard: null,
  lockBoard: false,
  isPlaying: false,
  moves: 0,
  matches: 0,
  totalPairs: 8,
  timeLeft: 120,
  totalTime: 120,
  timerInterval: null,
  wins: 0,
  bestTime: null,

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

    var deck = [];
    for (var i = 0; i < this.symbols.length; i++) {
      deck.push({ id: i, symbol: this.symbols[i] });
      deck.push({ id: i, symbol: this.symbols[i] });
    }

    for (var j = deck.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = deck[j]; deck[j] = deck[k]; deck[k] = tmp;
    }

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
      self._updateTimerUI();
      if (self.timeLeft <= 0) {
        self._lose('timeout');
      }
    }, 1000);
  },

  _updateTimerUI: function() {
    var el = document.getElementById('memTimer');
    if (!el) return;
    var m = Math.floor(this.timeLeft / 60);
    var s = this.timeLeft % 60;
    if (s < 10) s = '0' + s;
    var fa = (typeof toFa === 'function');
    el.textContent = (fa ? toFa(m) : m) + ':' + (fa ? toFa(s) : s);

    var box = document.getElementById('memTimerBox');
    if (box) {
      box.classList.remove('warn', 'danger');
      if (this.timeLeft <= 15) box.classList.add('danger');
      else if (this.timeLeft <= 30) box.classList.add('warn');
    }
  },

  // ========== کلیک روی کارت ==========
  flipCard: function(idx) {
    if (this.lockBoard) return;
    if (!this.isPlaying) return;
    var card = this.cards[idx];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    if (typeof playSnd === 'function') playSnd('click');

    var el = document.getElementById('memCard' + idx);
    if (el) el.classList.add('flipped');

    if (this.firstCard === null) {
      this.firstCard = idx;
      return;
    }

    this.secondCard = idx;
    this.moves++;
    this._updateMovesUI();
    this._checkMatch();
  },

  _updateMovesUI: function() {
    var el = document.getElementById('memMoves');
    if (el) el.textContent = fmtNum(this.moves);
  },

  _updateMatchesUI: function() {
    var el = document.getElementById('memMatches');
    if (el) el.textContent = fmtNum(this.matches);
  },

  // ========== بررسی جفت ==========
  _checkMatch: function() {
    var self = this;
    var c1 = this.cards[this.firstCard];
    var c2 = this.cards[this.secondCard];
    var i1 = this.firstCard;
    var i2 = this.secondCard;

    if (c1.id === c2.id) {
      setTimeout(function() {
        c1.matched = true;
        c2.matched = true;

        var el1 = document.getElementById('memCard' + i1);
        var el2 = document.getElementById('memCard' + i2);
        if (el1) el1.classList.add('matched');
        if (el2) el2.classList.add('matched');

        self.matches++;
        self._updateMatchesUI();
        self.firstCard = null;
        self.secondCard = null;
        self.lockBoard = false;

        if (typeof playSnd === 'function') playSnd('success');

        if (self.matches === self.totalPairs) {
          self._win();
        }
      }, 500);
    } else {
      this.lockBoard = true;
      if (typeof playSnd === 'function') playSnd('error');

      setTimeout(function() {
        c1.flipped = false;
        c2.flipped = false;

        var el1 = document.getElementById('memCard' + i1);
        var el2 = document.getElementById('memCard' + i2);
        if (el1) el1.classList.remove('flipped');
        if (el2) el2.classList.remove('flipped');

        self.firstCard = null;
        self.secondCard = null;
        self.lockBoard = false;
      }, 1100);
    }
  },

  // ========== برد ==========
  _win: function() {
    this.isPlaying = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.wins++;

    // ثبت رویداد ماموریت‌ها
    if (typeof MISSIONS !== 'undefined') {
      MISSIONS.trackGame();
      MISSIONS.trackWin();
    }

    var timeTaken = this.totalTime - this.timeLeft;
    if (this.bestTime === null || timeTaken < this.bestTime) {
      this.bestTime = timeTaken;
    }

    var stars = 1;
    if (this.moves <= 16) stars = 3;
    else if (this.moves <= 22) stars = 2;

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

    // ثبت رویداد ماموریت (بازی انجام شد ولی نبرد)
    if (typeof MISSIONS !== 'undefined') {
      MISSIONS.trackGame();
    }

    if (typeof playSnd === 'function') playSnd('error');
    var self = this;
    setTimeout(function() {
      self._showModal('lose', { matches: self.matches });
    }, 400);
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
        '🏆 ' + fmtNum(data.stars) + ' ستاره' +
        '</div>';
      html += '<div class="mem-modal-reward">🪙 ' + fmtNum(data.coins) + '  💎 ' + fmtNum(data.gems) + '</div>';
      html += '<button class="mem-modal-btn" onclick="MEMORY.closeModal();MEMORY.start()">بازی جدید</button>';
    } else {
      html += '<div class="mem-modal-icon">⏰</div>';
      html += '<div class="mem-modal-title lose">زمان تموم شد!</div>';
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

    html += '<div class="mem-topbar">';
    html += '<button class="mem-back" onclick="MEMORY.back()">›</button>';
    html += '<div class="mem-title">🃏 حافظه</div>';
    html += '<div class="mem-info">✓ ' + fmtNum(this.matches) + '/' + fmtNum(this.totalPairs) + '</div>';
    html += '</div>';

    var m = Math.floor(this.timeLeft / 60);
    var s = this.timeLeft % 60;
    if (s < 10) s = '0' + s;
    var fa = (typeof toFa === 'function');
    var timerTxt = (fa ? toFa(m) : m) + ':' + (fa ? toFa(s) : s);

    var timerCls = 'mem-stat-box';
    if (this.timeLeft <= 15) timerCls += ' danger';
    else if (this.timeLeft <= 30) timerCls += ' warn';

    html += '<div class="mem-stats">';
    html += '<div class="' + timerCls + '" id="memTimerBox">';
    html += '<div class="icon">⏱</div>';
    html += '<div class="num" id="memTimer">' + timerTxt + '</div>';
    html += '<div class="lbl">زمان</div>';
    html += '</div>';
    html += '<div class="mem-stat-box">';
    html += '<div class="icon">🎯</div>';
    html += '<div class="num" id="memMoves">' + fmtNum(this.moves) + '</div>';
    html += '<div class="lbl">حرکت</div>';
    html += '</div>';
    html += '<div class="mem-stat-box">';
    html += '<div class="icon">🏆</div>';
    html += '<div class="num">' + fmtNum(this.wins) + '</div>';
    html += '<div class="lbl">برد</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="mem-board">';
    for (var i = 0; i < this.cards.length; i++) {
      var c = this.cards[i];
      var cls = 'mem-card';
      if (c.flipped || c.matched) cls += ' flipped';
      if (c.matched) cls += ' matched';

      html += '<button class="' + cls + '" id="memCard' + i + '" onclick="MEMORY.flipCard(' + i + ')">';
      html += '<div class="mem-card-inner">';
      html += '<div class="mem-card-back"></div>';
      html += '<div class="mem-card-front">' + c.symbol + '</div>';
      html += '</div>';
      html += '</button>';
    }
    html += '</div>';

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
