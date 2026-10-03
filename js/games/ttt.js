// ===== games/ttt.js - بازی دوز =====

var TTT = {
  gameId: 'ttt',
  board: ['', '', '', '', '', '', '', '', ''],
  playerSymbol: 'X',
  aiSymbol: 'O',
  turn: 'player',
  level: 'medium',
  isPlaying: false,
  wins: 0,
  losses: 0,
  draws: 0,
  winLine: null,

  levelLabels: {
    easy:   '😊 آسون',
    medium: '😎 متوسط',
    hard:   '🔥 سخت'
  },

  // ترکیب‌های برنده
  winPatterns: [
    [0,1,2], [3,4,5], [6,7,8],  // ردیف‌ها
    [0,3,6], [1,4,7], [2,5,8],  // ستون‌ها
    [0,4,8], [2,4,6]            // قطرها
  ],

  // ========== شروع ==========
  start: function() {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.turn = 'player';
    this.isPlaying = true;
    this.winLine = null;
    this.refresh();
    if (typeof playSnd === 'function') playSnd('tap');
  },

  // ========== انتخاب سطح ==========
  setLevel: function(level) {
    this.level = level;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== کلیک کاربر ==========
  clickCell: function(idx) {
    if (!this.isPlaying) return;
    if (this.turn !== 'player') return;
    if (this.board[idx] !== '') return;

    this.board[idx] = this.playerSymbol;
    if (typeof playSnd === 'function') playSnd('click');
    this.refresh();

    // چک برد
    var win = this._checkWin(this.playerSymbol);
    if (win) {
      this._win('player', win);
      return;
    }

    // چک مساوی
    if (this._isFull()) {
      this._draw();
      return;
    }

    // نوبت AI
    this.turn = 'ai';
    this.refresh();
    var self = this;
    setTimeout(function() { self._aiTurn(); }, 500);
  },

  // ========== نوبت AI ==========
  _aiTurn: function() {
    if (!this.isPlaying) return;

    var move;
    if (this.level === 'easy') {
      move = this._randomMove();
    } else if (this.level === 'medium') {
      // ۵۰٪ هوشمند
      if (Math.random() < 0.5) move = this._smartMove();
      else move = this._randomMove();
    } else {
      // hard - همیشه بهترین
      move = this._bestMove();
    }

    if (move === -1) {
      // پر
      if (this._isFull()) this._draw();
      return;
    }

    this.board[move] = this.aiSymbol;
    if (typeof playSnd === 'function') playSnd('click');
    this.refresh();

    var win = this._checkWin(this.aiSymbol);
    if (win) {
      this._win('ai', win);
      return;
    }

    if (this._isFull()) {
      this._draw();
      return;
    }

    this.turn = 'player';
    this.refresh();
  },

  // ========== حرکت تصادفی ==========
  _randomMove: function() {
    var empty = [];
    for (var i = 0; i < 9; i++) {
      if (this.board[i] === '') empty.push(i);
    }
    if (empty.length === 0) return -1;
    return empty[Math.floor(Math.random() * empty.length)];
  },

  // ========== حرکت هوشمند ==========
  _smartMove: function() {
    // ۱. ببر (اگه می‌تونی)
    for (var i = 0; i < 9; i++) {
      if (this.board[i] === '') {
        var test = this.board.slice();
        test[i] = this.aiSymbol;
        if (this._checkWinOn(test, this.aiSymbol)) return i;
      }
    }
    // ۲. جلوگیری از برد کاربر
    for (var j = 0; j < 9; j++) {
      if (this.board[j] === '') {
        var test2 = this.board.slice();
        test2[j] = this.playerSymbol;
        if (this._checkWinOn(test2, this.playerSymbol)) return j;
      }
    }
    // ۳. وسط
    if (this.board[4] === '') return 4;
    // ۴. تصادفی
    return this._randomMove();
  },

  // ========== بهترین حرکت (Minimax) ==========
  _bestMove: function() {
    var bestScore = -Infinity;
    var bestMove = -1;
    var self = this;
    for (var i = 0; i < 9; i++) {
      if (this.board[i] === '') {
        this.board[i] = this.aiSymbol;
        var score = this._minimax(this.board, 0, false);
        this.board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove === -1 ? this._randomMove() : bestMove;
  },

  _minimax: function(board, depth, isMax) {
    var winner = this._getWinner(board);
    if (winner === this.aiSymbol) return 10 - depth;
    if (winner === this.playerSymbol) return depth - 10;
    if (this._isFullOn(board)) return 0;

    if (isMax) {
      var best = -Infinity;
      for (var i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = this.aiSymbol;
          best = Math.max(best, this._minimax(board, depth + 1, false));
          board[i] = '';
        }
      }
      return best;
    } else {
      var best2 = Infinity;
      for (var j = 0; j < 9; j++) {
        if (board[j] === '') {
          board[j] = this.playerSymbol;
          best2 = Math.min(best2, this._minimax(board, depth + 1, true));
          board[j] = '';
        }
      }
      return best2;
    }
  },

  _getWinner: function(board) {
    for (var i = 0; i < this.winPatterns.length; i++) {
      var p = this.winPatterns[i];
      if (board[p[0]] && board[p[0]] === board[p[1]] && board[p[1]] === board[p[2]]) {
        return board[p[0]];
      }
    }
    return null;
  },

  // ========== چک‌ها ==========
  _checkWin: function(symbol) {
    for (var i = 0; i < this.winPatterns.length; i++) {
      var p = this.winPatterns[i];
      if (this.board[p[0]] === symbol && this.board[p[1]] === symbol && this.board[p[2]] === symbol) {
        return p;
      }
    }
    return null;
  },

  _checkWinOn: function(board, symbol) {
    for (var i = 0; i < this.winPatterns.length; i++) {
      var p = this.winPatterns[i];
      if (board[p[0]] === symbol && board[p[1]] === symbol && board[p[2]] === symbol) {
        return true;
      }
    }
    return false;
  },

  _isFull: function() { return this._isFullOn(this.board); },
  _isFullOn: function(board) {
    for (var i = 0; i < 9; i++) if (board[i] === '') return false;
    return true;
  },

  // ========== برد ==========
  _win: function(who, line) {
    this.isPlaying = false;
    this.winLine = line;

    if (who === 'player') {
      this.wins++;
      if (typeof playSnd === 'function') playSnd('success');

      var coins = (this.level === 'easy') ? 8 : (this.level === 'medium') ? 15 : 25;
      var gems = (this.level === 'hard') ? 2 : 1;

      if (typeof SHOP !== 'undefined') {
        SHOP.addCoins(coins);
        SHOP.addGems(gems);
      }

      if (typeof STATE !== 'undefined') {
        var games = STATE.get('games') || {};
        if (!games.ttt) games.ttt = { wins: 0, losses: 0, draws: 0 };
        games.ttt.wins = (games.ttt.wins || 0) + 1;
        STATE.set('games.ttt', games.ttt);
        STATE.save('games');
      }

      this.refresh();
      var self = this;
      setTimeout(function() {
        self._showModal('win', { coins: coins, gems: gems });
      }, 700);
    } else {
      this.losses++;
      if (typeof playSnd === 'function') playSnd('error');
      this.refresh();
      var self2 = this;
      setTimeout(function() {
        self2._showModal('lose', {});
      }, 700);
    }
  },

  _draw: function() {
    this.isPlaying = false;
    this.draws++;
    if (typeof playSnd === 'function') playSnd('click');
    this.refresh();
    var self = this;
    setTimeout(function() {
      self._showModal('draw', {});
    }, 500);
  },

  // ========== مودال ==========
  _showModal: function(type, data) {
    var modal = document.getElementById('tttModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tttModal';
      modal.className = 'ttt-modal';
      document.body.appendChild(modal);
    }

    var html = '<div class="ttt-modal-box">';

    if (type === 'win') {
      html += '<div class="ttt-modal-icon">🏆</div>';
      html += '<div class="ttt-modal-title">🎉 بردی!</div>';
      html += '<div class="ttt-modal-desc">حریف رو شکست دادی!</div>';
      html += '<div class="ttt-modal-reward">🪙 ' + fmtNum(data.coins) + '  💎 ' + fmtNum(data.gems) + '</div>';
      html += '<button class="ttt-modal-btn" onclick="TTT.closeModal();TTT.start()">بازی جدید</button>';
    } else if (type === 'lose') {
      html += '<div class="ttt-modal-icon">😢</div>';
      html += '<div class="ttt-modal-title lose">باختی!</div>';
      html += '<div class="ttt-modal-desc">حریف برنده شد</div>';
      html += '<button class="ttt-modal-btn pink" onclick="TTT.closeModal();TTT.start()">تلاش دوباره</button>';
    } else {
      html += '<div class="ttt-modal-icon">🤝</div>';
      html += '<div class="ttt-modal-title draw">مساوی!</div>';
      html += '<div class="ttt-modal-desc">هیچ‌کس نبرد</div>';
      html += '<button class="ttt-modal-btn gray" onclick="TTT.closeModal();TTT.start()">بازی جدید</button>';
    }

    html += '</div>';
    modal.innerHTML = html;
    modal.classList.add('show');
  },

  closeModal: function() {
    var modal = document.getElementById('tttModal');
    if (modal) modal.classList.remove('show');
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="ttt-page">';

    // نوار بالا
    html += '<div class="ttt-topbar">';
    html += '<button class="ttt-back" onclick="TTT.back()">›</button>';
    html += '<div class="ttt-title">❌ دوز</div>';
    html += '<div class="ttt-score">';
    html += '<span class="x">❌ ' + fmtNum(this.wins) + '</span>';
    html += '<span class="o">⭕ ' + fmtNum(this.losses) + '</span>';
    html += '</div>';
    html += '</div>';

    // سطوح
    html += '<div class="ttt-levels">';
    html += '<div class="ttt-level ' + (this.level === 'easy' ? 'active' : '') + '" onclick="TTT.setLevel(\'easy\')">' + this.levelLabels.easy + '</div>';
    html += '<div class="ttt-level ' + (this.level === 'medium' ? 'active' : '') + '" onclick="TTT.setLevel(\'medium\')">' + this.levelLabels.medium + '</div>';
    html += '<div class="ttt-level ' + (this.level === 'hard' ? 'active' : '') + '" onclick="TTT.setLevel(\'hard\')">' + this.levelLabels.hard + '</div>';
    html += '</div>';

    // نوار نوبت
    var turnCls = 'ttt-turn ' + (this.turn === 'player' ? 'player' : 'ai');
    var turnTxt = (this.turn === 'player') ? '🎯 نوبت تو (❌)' : '🤖 نوبت حریف (⭕)';
    var turnEmoji = (this.turn === 'player') ? '❌' : '⭕';
    html += '<div class="' + turnCls + '"><span class="emoji">' + turnEmoji + '</span>' + turnTxt + '</div>';

    // تخته
    html += '<div class="ttt-board">';
    for (var i = 0; i < 9; i++) {
      var val = this.board[i];
      var cls = 'ttt-cell';
      if (val === 'X') cls += ' x filled';
      if (val === 'O') cls += ' o filled';

      // اگه خط برنده داریم
      if (this.winLine && this.winLine.indexOf(i) >= 0) {
        cls += (val === this.playerSymbol) ? ' win' : ' lose';
      }

      var sym = '';
      if (val === 'X') sym = '❌';
      else if (val === 'O') sym = '⭕';

      html += '<button class="' + cls + '" onclick="TTT.clickCell(' + i + ')">';
      if (sym) html += '<span class="symbol">' + sym + '</span>';
      html += '</button>';
    }
    html += '</div>';

    // دکمهٔ بازی جدید
    html += '<button class="ttt-new-btn" onclick="TTT.start()">🔄 بازی جدید</button>';

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
    if (c) c.innerHTML = this.render();
  }
};

// تابع سراسری
function startGame_ttt() {
  TTT.start();
}

window.TTT = TTT;
