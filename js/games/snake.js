// ===== games/snake.js - بازی مارپله =====

var SNAKE = {
  gameId: 'snake',
  playerPos: 1,
  aiPos: 1,
  turn: 'player',       // 'player' یا 'ai'
  isPlaying: false,
  isRolling: false,
  wins: 0,
  losses: 0,
  boardSize: 49,        // ۷×۷

  // مارها و نردبون‌ها (از → به)
  ladders: {
    3: 22,
    8: 26,
    20: 29,
    28: 44,
    36: 45
  },
  snakes: {
    47: 26,
    42: 21,
    33: 12,
    25: 7,
    17: 4
  },

  // ========== شروع بازی ==========
  start: function() {
    this.playerPos = 1;
    this.aiPos = 1;
    this.turn = 'player';
    this.isPlaying = true;
    this.isRolling = false;
    this.refresh();
    if (typeof playSnd === 'function') playSnd('tap');
  },

  // ========== پرتاب تاس ==========
  rollDice: function() {
    if (!this.isPlaying || this.isRolling) return;
    if (this.turn !== 'player') return;

    this.isRolling = true;
    this.refresh();

    var dice = document.getElementById('snakeDice');
    if (dice) dice.classList.add('rolling');

    if (typeof playSnd === 'function') playSnd('click');

    var self = this;
    // نمایش انیمیشن تاس
    var fakeRolls = 0;
    var fakeInterval = setInterval(function() {
      fakeRolls++;
      var tempDice = document.getElementById('snakeDice');
      if (tempDice) {
        tempDice.textContent = (typeof toFa === 'function') ? toFa(Math.floor(Math.random() * 6) + 1) : (Math.floor(Math.random() * 6) + 1);
      }
      if (fakeRolls >= 8) {
        clearInterval(fakeInterval);
        var realRoll = Math.floor(Math.random() * 6) + 1;
        if (dice) {
          dice.classList.remove('rolling');
          dice.textContent = (typeof toFa === 'function') ? toFa(realRoll) : realRoll;
        }
        self._movePlayer(realRoll);
      }
    }, 70);
  },

  // ========== حرکت بازیکن ==========
  _movePlayer: function(roll) {
    var self = this;
    var newPos = this.playerPos + roll;
    if (newPos > this.boardSize) newPos = this.boardSize;

    // انیمیشن حرکت پله‌پله
    var step = this.playerPos;
    var stepInterval = setInterval(function() {
      step++;
      if (step >= newPos) {
        step = newPos;
        clearInterval(stepInterval);
        self.playerPos = step;

        // چک مار و نردبون
        setTimeout(function() {
          self._checkSpecial('player');
        }, 300);
        return;
      }
      self.playerPos = step;
      self.refresh();
    }, 120);
  },

  // ========== بررسی مار/نردبون ==========
  _checkSpecial: function(who) {
    var self = this;
    var pos = (who === 'player') ? this.playerPos : this.aiPos;

    if (this.ladders[pos]) {
      if (typeof playSnd === 'function') playSnd('success');
      if (typeof showToast === 'function') showToast('🪜 نردبون! ' + (typeof toFa === 'function' ? toFa(pos) : pos) + ' → ' + (typeof toFa === 'function' ? toFa(this.ladders[pos]) : this.ladders[pos]));
      var target = this.ladders[pos];
      setTimeout(function() {
        if (who === 'player') self.playerPos = target;
        else self.aiPos = target;
        self.refresh();
        self._checkWin(who);
      }, 600);
      return;
    }

    if (this.snakes[pos]) {
      if (typeof playSnd === 'function') playSnd('error');
      if (typeof showToast === 'function') showToast('🐍 مار! ' + (typeof toFa === 'function' ? toFa(pos) : pos) + ' → ' + (typeof toFa === 'function' ? toFa(this.snakes[pos]) : this.snakes[pos]));
      var target2 = this.snakes[pos];
      setTimeout(function() {
        if (who === 'player') self.playerPos = target2;
        else self.aiPos = target2;
        self.refresh();
        self._checkWin(who);
      }, 600);
      return;
    }

    this._checkWin(who);
  },

  // ========== بررسی برد ==========
  _checkWin: function(who) {
    if (who === 'player' && this.playerPos >= this.boardSize) {
      this._win('player');
      return;
    }
    if (who === 'ai' && this.aiPos >= this.boardSize) {
      this._win('ai');
      return;
    }

    // نوبت بعدی
    this.isRolling = false;
    if (who === 'player') {
      this.turn = 'ai';
      this.refresh();
      var self = this;
      setTimeout(function() { self._aiTurn(); }, 900);
    } else {
      this.turn = 'player';
      this.refresh();
    }
  },

  // ========== نوبت AI ==========
  _aiTurn: function() {
    if (!this.isPlaying) return;
    var self = this;
    var roll = Math.floor(Math.random() * 6) + 1;

    // نمایش تاس AI
    var dice = document.getElementById('snakeDice');
    if (dice) {
      dice.classList.add('rolling');
      setTimeout(function() {
        dice.classList.remove('rolling');
        dice.textContent = (typeof toFa === 'function') ? toFa(roll) : roll;
      }, 500);
    }

    if (typeof playSnd === 'function') playSnd('click');

    setTimeout(function() {
      var newPos = self.aiPos + roll;
      if (newPos > self.boardSize) newPos = self.boardSize;
      self.aiPos = newPos;
      self.refresh();
      setTimeout(function() {
        self._checkSpecial('ai');
      }, 300);
    }, 700);
  },

  // ========== برد ==========
  _win: function(who) {
    this.isPlaying = false;

    if (who === 'player') {
      this.wins++;
      if (typeof playSnd === 'function') playSnd('success');

      var coins = 15;
      var gems = 2;
      if (typeof SHOP !== 'undefined') {
        SHOP.addCoins(coins);
        SHOP.addGems(gems);
      }

      if (typeof STATE !== 'undefined') {
        var games = STATE.get('games') || {};
        if (!games.snake) games.snake = { wins: 0 };
        games.snake.wins = (games.snake.wins || 0) + 1;
        STATE.set('games.snake', games.snake);
        STATE.save('games');
      }

      this.refresh();
      var self = this;
      setTimeout(function() {
        self._showModal('win', { coins: coins, gems: gems });
      }, 500);
    } else {
      this.losses++;
      if (typeof playSnd === 'function') playSnd('error');
      this.refresh();
      var self2 = this;
      setTimeout(function() {
        self2._showModal('lose', {});
      }, 500);
    }
  },

  // ========== مودال ==========
  _showModal: function(type, data) {
    var modal = document.getElementById('snakeModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'snakeModal';
      modal.className = 'snake-modal';
      document.body.appendChild(modal);
    }

    var html = '<div class="snake-modal-box">';

    if (type === 'win') {
      html += '<div class="snake-modal-icon">🏆</div>';
      html += '<div class="snake-modal-title">🎉 بردی!</div>';
      html += '<div class="snake-modal-desc">به خونهٔ پایان رسیدی!</div>';
      html += '<div class="snake-modal-reward">🪙 ' + (typeof toFa === 'function' ? toFa(data.coins) : data.coins) + '  💎 ' + (typeof toFa === 'function' ? toFa(data.gems) : data.gems) + '</div>';
      html += '<button class="snake-modal-btn" onclick="SNAKE.closeModal();SNAKE.start()">بازی جدید</button>';
    } else {
      html += '<div class="snake-modal-icon">😢</div>';
      html += '<div class="snake-modal-title lose">باختی!</div>';
      html += '<div class="snake-modal-desc">کامپیوتر اول رسید</div>';
      html += '<button class="snake-modal-btn pink" onclick="SNAKE.closeModal();SNAKE.start()">تلاش دوباره</button>';
    }

    html += '</div>';
    modal.innerHTML = html;
    modal.classList.add('show');
  },

  closeModal: function() {
    var modal = document.getElementById('snakeModal');
    if (modal) modal.classList.remove('show');
  },

  // ========== رندر تخته ==========
  _renderBoard: function() {
    var html = '';
    // تخته از ۴۹ (بالا چپ) تا ۱ (پایین راست) — مثل مارپله واقعی
    for (var row = 6; row >= 0; row--) {
      // اگه ردیف زوج باشه، از راست به چپ، اگه فرد باشه از چپ به راست
      var isReverse = (row % 2 === 1);
      for (var col = 0; col < 7; col++) {
        var realCol = isReverse ? (6 - col) : col;
        var num = (row * 7) + realCol + 1;
        var cls = 'snake-cell';
        cls += (num % 2 === 0) ? ' even' : ' odd';
        if (num === 1) cls += ' start';
        if (num === 49) cls += ' end';

        html += '<div class="' + cls + '">';
        html += '<span class="cell-num">' + (typeof toFa === 'function' ? toFa(num) : num) + '</span>';

        // مار یا نردبون
        if (this.ladders[num]) {
          html += '<span style="position:absolute;font-size:18px;opacity:0.7">🪜</span>';
        }
        if (this.snakes[num]) {
          html += '<span style="position:absolute;font-size:18px;opacity:0.7">🐍</span>';
        }

        // مهره‌ها
        if (this.playerPos === num && this.aiPos === num) {
          html += '<span class="mover" style="right:2px">🔵</span>';
          html += '<span class="mover" style="left:2px">🔴</span>';
        } else if (this.playerPos === num) {
          html += '<span class="mover">🔵</span>';
        } else if (this.aiPos === num) {
          html += '<span class="mover">🔴</span>';
        }

        html += '</div>';
      }
    }
    return html;
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="snake-page">';

    // نوار بالا
    html += '<div class="snake-topbar">';
    html += '<button class="snake-back" onclick="SNAKE.back()">›</button>';
    html += '<div class="snake-title">🐍 مارپله</div>';
    var turnCls = 'snake-turn-badge ' + (this.turn === 'player' ? 'player' : 'ai');
    var turnTxt = (this.turn === 'player') ? '🎯 نوبت تو' : '🤖 نوبت حریف';
    html += '<div class="' + turnCls + '">' + turnTxt + '</div>';
    html += '</div>';

    // بازیکن‌ها
    html += '<div class="snake-players">';
    html += '<div class="snake-player player-side ' + (this.turn === 'player' ? 'active' : '') + '">';
    html += '<div class="avatar">🔵</div>';
    html += '<div class="info"><div class="name">تو</div><div class="pos">خونه ' + (typeof toFa === 'function' ? toFa(this.playerPos) : this.playerPos) + '</div></div>';
    html += '</div>';
    html += '<div class="snake-player ai-side ' + (this.turn === 'ai' ? 'active' : '') + '">';
    html += '<div class="avatar">🔴</div>';
    html += '<div class="info"><div class="name">حریف</div><div class="pos">خونه ' + (typeof toFa === 'function' ? toFa(this.aiPos) : this.aiPos) + '</div></div>';
    html += '</div>';
    html += '</div>';

    // تخته
    html += '<div class="snake-board">' + this._renderBoard() + '</div>';

    // تاس + دکمه
    html += '<div class="snake-dice-box">';
    html += '<div class="snake-dice" id="snakeDice">🎲</div>';
    html += '</div>';

    var rollDisabled = (!this.isPlaying || this.turn !== 'player' || this.isRolling) ? 'disabled' : '';
    html += '<button class="snake-roll-btn" id="snakeRollBtn" onclick="SNAKE.rollDice()" ' + rollDisabled + '>🎲 پرتاب تاس</button>';

    html += '</div>';
    return html;
  },

  // ========== بازگشت ==========
  back: function() {
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

// تابع سراسری
function startGame_snake() {
  SNAKE.start();
}

window.SNAKE = SNAKE;
