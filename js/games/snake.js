// ===== games/snake.js - بازی مارپله (نسخهٔ جدید) =====

var SNAKE = {
  gameId: 'snake',
  playerPos: 1,
  aiPos: 1,
  turn: 'player',
  isPlaying: false,
  isRolling: false,
  isMoving: false,
  wins: 0,
  losses: 0,
  boardSize: 49,

  // مارها: از خونهٔ بالا (نیش) به خونهٔ پایین (دم)
  snakes: {
    47: 26,
    42: 21,
    33: 12,
    25: 7,
    17: 4
  },

  // نردبون‌ها: از پایین به بالا
  ladders: {
    3: 22,
    8: 26,
    20: 29,
    28: 44,
    36: 45
  },

  // سرعت‌ها
  stepDelay: 250,      // تاخیر بین هر پله (میلی‌ثانیه)
  diceRollDuration: 800, // مدت چرخش تاس

  // ========== شروع ==========
  start: function() {
    this.playerPos = 1;
    this.aiPos = 1;
    this.turn = 'player';
    this.isPlaying = true;
    this.isRolling = false;
    this.isMoving = false;
    this.refresh();
    if (typeof playSnd === 'function') playSnd('tap');
  },

  // ========== کلیک روی تاس ==========
  rollDice: function() {
    if (!this.isPlaying) return;
    if (this.isRolling || this.isMoving) return;
    if (this.turn !== 'player') return;

    this.isRolling = true;
    this.refresh();

    // انیمیشن تاس
    var dice = document.getElementById('snakeDice');
    if (dice) dice.classList.add('rolling');
    if (typeof playSnd === 'function') playSnd('click');

    // ۶ عدد تصادفی سریع برای انیمیشن
    var self = this;
    var fakeInterval = setInterval(function() {
      var tempDice = document.getElementById('snakeDiceFace');
      if (tempDice) {
        tempDice.innerHTML = self._diceSVG(Math.floor(Math.random() * 6) + 1);
      }
    }, 80);

    // بعد از انیمیشن، عدد نهایی
    setTimeout(function() {
      clearInterval(fakeInterval);
      var finalNum = Math.floor(Math.random() * 6) + 1;
      var face = document.getElementById('snakeDiceFace');
      if (face) face.innerHTML = self._diceSVG(finalNum);
      if (dice) dice.classList.remove('rolling');

      self.isRolling = false;
      self._movePlayer(finalNum);
    }, this.diceRollDuration);
  },

  // ========== حرکت بازیکن ==========
  _movePlayer: function(roll) {
    var self = this;
    var target = this.playerPos + roll;
    if (target > this.boardSize) target = this.boardSize;

    this.isMoving = true;
    if (typeof playSnd === 'function') playSnd('tap');

    // حرکت پله‌پله
    var current = this.playerPos;
    var stepInterval = setInterval(function() {
      current++;
      self.playerPos = current;
      self._updateBoardOnly();
      if (typeof playSnd === 'function') playSnd('click');

      if (current >= target) {
        clearInterval(stepInterval);
        self.isMoving = false;
        // بررسی مار و نردبون
        setTimeout(function() {
          self._checkSpecial('player');
        }, 400);
      }
    }, this.stepDelay);
  },

  // ========== بررسی مار/نردبون ==========
  _checkSpecial: function(who) {
    var self = this;
    var pos = (who === 'player') ? this.playerPos : this.aiPos;

    // نردبون
    if (this.ladders[pos]) {
      var topPos = this.ladders[pos];
      if (typeof playSnd === 'function') playSnd('success');
      if (typeof showToast === 'function') showToast('🪜 نردبون! از ' + toFa(pos) + ' به ' + toFa(topPos));

      setTimeout(function() {
        if (who === 'player') self.playerPos = topPos;
        else self.aiPos = topPos;
        self._updateBoardOnly();
        setTimeout(function() {
          self._checkWin(who);
        }, 500);
      }, 400);
      return;
    }

    // مار
    if (this.snakes[pos]) {
      var bottomPos = this.snakes[pos];
      if (typeof playSnd === 'function') playSnd('error');
      if (typeof showToast === 'function') showToast('🐍 مار! از ' + toFa(pos) + ' به ' + toFa(bottomPos));

      setTimeout(function() {
        if (who === 'player') self.playerPos = bottomPos;
        else self.aiPos = bottomPos;
        self._updateBoardOnly();
        setTimeout(function() {
          self._checkWin(who);
        }, 500);
      }, 400);
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

    this.isRolling = true;
    var dice = document.getElementById('snakeDice');
    if (dice) dice.classList.add('rolling');

    var fakeInterval = setInterval(function() {
      var tempDice = document.getElementById('snakeDiceFace');
      if (tempDice) {
        tempDice.innerHTML = self._diceSVG(Math.floor(Math.random() * 6) + 1);
      }
    }, 80);

    setTimeout(function() {
      clearInterval(fakeInterval);
      var roll = Math.floor(Math.random() * 6) + 1;
      var face = document.getElementById('snakeDiceFace');
      if (face) face.innerHTML = self._diceSVG(roll);
      if (dice) dice.classList.remove('rolling');

      self.isRolling = false;
      self._moveAI(roll);
    }, this.diceRollDuration);
  },

  _moveAI: function(roll) {
    var self = this;
    var target = this.aiPos + roll;
    if (target > this.boardSize) target = this.boardSize;

    this.isMoving = true;

    var current = this.aiPos;
    var stepInterval = setInterval(function() {
      current++;
      self.aiPos = current;
      self._updateBoardOnly();
      if (typeof playSnd === 'function') playSnd('click');

      if (current >= target) {
        clearInterval(stepInterval);
        self.isMoving = false;
        setTimeout(function() {
          self._checkSpecial('ai');
        }, 400);
      }
    }, this.stepDelay);
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
      html += '<div class="snake-modal-reward">🪙 ' + fmtNum(data.coins) + '  💎 ' + fmtNum(data.gems) + '</div>';
      html += '<button class="snake-modal-btn" onclick="SNAKE.closeModal();SNAKE.start()">بازی جدید</button>';
    } else {
      html += '<div class="snake-modal-icon">😢</div>';
      html += '<div class="snake-modal-title lose">باختی!</div>';
      html += '<div class="snake-modal-desc">حریف اول رسید</div>';
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

  // ========== تاس SVG ==========
  _diceSVG: function(num) {
    var dots = {
      1: [[50, 50]],
      2: [[30, 30], [70, 70]],
      3: [[30, 30], [50, 50], [70, 70]],
      4: [[30, 30], [70, 30], [30, 70], [70, 70]],
      5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
      6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]]
    };
    var svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';
    svg += '<rect x="5" y="5" width="90" height="90" rx="18" fill="white" stroke="#8b5cf6" stroke-width="3"/>';
    var arr = dots[num] || dots[1];
    for (var i = 0; i < arr.length; i++) {
      svg += '<circle cx="' + arr[i][0] + '" cy="' + arr[i][1] + '" r="7" fill="#8b5cf6"/>';
    }
    svg += '</svg>';
    return svg;
  },

  // ========== رندر تخته (اعداد از چپ شروع) ==========
  _renderBoard: function() {
    var html = '';

    // از ردیف آخر (بالا) تا ردیف اول (پایین)
    // توی هر ردیف: اگه ردیف زوج باشه (از پایین) چپ به راست، اگه فرد باشه راست به چپ
    for (var row = 6; row >= 0; row--) {
      // ردیف 0 = پایین (1-7) از چپ به راست
      // ردیف 1 = (8-14) از راست به چپ
      // ...
      var isReverse = (row % 2 === 1);

      for (var col = 0; col < 7; col++) {
        var realCol = isReverse ? (6 - col) : col;
        var num = (row * 7) + realCol + 1;

        var cls = 'snake-cell';
        cls += (num % 2 === 0) ? ' even' : ' odd';
        if (num === 1) cls += ' start';
        if (num === 49) cls += ' end';

        // خونهٔ برنده
        if ((this.playerPos >= 49 && num === 49) || (this.aiPos >= 49 && num === 49)) {
          cls += ' win-cell';
        }

        html += '<div class="' + cls + '" id="snakeCell' + num + '" data-num="' + num + '">';
        html += '<span>' + (typeof toFa === 'function' ? toFa(num) : num) + '</span>';

        // مهره‌های بازیکن
        if (this.playerPos === num) {
          html += '<div class="snake-piece player-piece" id="playerPiece">🔵</div>';
        }
        if (this.aiPos === num) {
          html += '<div class="snake-piece ai-piece" id="aiPiece">🔴</div>';
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
    html += '<div class="info"><div class="name">تو</div><div class="pos">خونه ' + toFa(this.playerPos) + '</div></div>';
    html += '</div>';
    html += '<div class="snake-player ai-side ' + (this.turn === 'ai' ? 'active' : '') + '">';
    html += '<div class="avatar">🔴</div>';
    html += '<div class="info"><div class="name">حریف</div><div class="pos">خونه ' + toFa(this.aiPos) + '</div></div>';
    html += '</div>';
    html += '</div>';

    // تخته
    html += '<div class="snake-board-wrap">';
    html += '<div class="snake-board" id="snakeBoard">' + this._renderBoard() + '</div>';
    html += '</div>';

    // تاس (بدون دکمه)
    var canRoll = this.isPlaying && this.turn === 'player' && !this.isRolling && !this.isMoving;
    var diceCls = 'snake-dice' + (canRoll ? '' : ' disabled');
    var hintCls = 'snake-dice-hint' + (canRoll ? ' active' : '');
    var hintTxt = '';
    if (this.turn === 'player' && !this.isRolling && !this.isMoving) hintTxt = '👆 روی تاس بزن!';
    else if (this.turn === 'ai') hintTxt = '🤖 حریف داره بازی می‌کنه...';
    else hintTxt = '...';

    html += '<div class="snake-dice-wrap">';
    html += '<div class="' + diceCls + '" id="snakeDice" onclick="SNAKE.rollDice()">';
    html += '<div id="snakeDiceFace">' + this._diceSVG(1) + '</div>';
    html += '</div>';
    html += '<div class="' + hintCls + '">' + hintTxt + '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  },

  // ========== آپدیت فقط تخته (برای حرکت پله‌پله) ==========
  _updateBoardOnly: function() {
    var board = document.getElementById('snakeBoard');
    if (board) {
      board.innerHTML = this._renderBoard();
    }
    // آپدیت موقعیت بازیکن‌ها
    var posEls = document.querySelectorAll('.snake-player .pos');
    if (posEls[0]) posEls[0].textContent = 'خونه ' + toFa(this.playerPos);
    if (posEls[1]) posEls[1].textContent = 'خونه ' + toFa(this.aiPos);
  },

  // ========== بازگشت ==========
  back: function() {
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
function startGame_snake() {
  SNAKE.start();
}

window.SNAKE = SNAKE;
