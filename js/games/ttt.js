// ===== games/ttt.js - بازی دوز (نسخهٔ جدید) =====

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
  aiThinking: false,

  levelLabels: {
    easy:   '😊 آسون',
    medium: '😎 متوسط',
    hard:   '🔥 سخت'
  },

  winPatterns: [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ],

  // ========== شروع ==========
  start: function() {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.turn = 'player';
    this.isPlaying = true;
    this.winLine = null;
    this.aiThinking = false;
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
    if (this.aiThinking) return;
    if (this.board[idx] !== '') return;

    this.board[idx] = this.playerSymbol;
    if (typeof playSnd === 'function') playSnd('click');

    // آپدیت فقط خونهٔ کلیک‌شده
    this._updateCellUI(idx);
    this._updateTurnUI();

    // چک برد
    var win = this._checkWin(this.playerSymbol);
    if (win) {
      this.winLine = win;
      setTimeout(this._highlightWin.bind(this, win), 300);
      setTimeout(this._win.bind(this, 'player'), 800);
      return;
    }

    // مساوی
    if (this._isFull()) {
      setTimeout(this._draw.bind(this), 500);
      return;
    }

    // نوبت AI
    this.turn = 'ai';
    this.aiThinking = true;
    this._updateTurnUI();

    var self = this;
    setTimeout(function() {
      self._aiTurn();
    }, 800);
  },

  // ========== نوبت AI ==========
  _aiTurn: function() {
    if (!this.isPlaying) return;

    var move;
    if (this.level === 'easy') {
      move = this._randomMove();
    } else if (this.level === 'medium') {
      if (Math.random() < 0.5) move = this._smartMove();
      else move = this._randomMove();
    } else {
      move = this._bestMove();
    }

    if (move === -1) {
      this.aiThinking = false;
      if (this._isFull()) this._draw();
      return;
    }

    this.board[move] = this.aiSymbol;
    if (typeof playSnd === 'function') playSnd('click');

    // آپدیت فقط خونهٔ AI
    this._updateCellUI(move);
    this.aiThinking = false;

    // چک برد
    var win = this._checkWin(this.aiSymbol);
    if (win) {
      this.winLine = win;
      setTimeout(this._highlightWin.bind(this, win), 300);
      setTimeout(this._win.bind(this, 'ai'), 800);
      return;
    }

    if (this._isFull()) {
      setTimeout(this._draw.bind(this), 500);
      return;
    }

    this.turn = 'player';
    this._updateTurnUI();
  },

  // ========== آپدیت فقط یه خونه ==========
  _updateCellUI: function(idx) {
    var cell = document.getElementById('tttCell' + idx);
    if (!cell) return;

    var val = this.board[idx];
    if (val === 'X') {
      cell.classList.add('x', 'filled');
      cell.innerHTML = '<span class="symbol">❌</span>';
    } else if (val === 'O') {
      cell.classList.add('o', 'filled');
      cell.innerHTML = '<span class="symbol">⭕</span>';
    }
  },

  // ========== آپدیت نوار نوبت ==========
  _updateTurnUI: function() {
    var el = document.getElementById('tttTurn');
    if (!el) return;

    if (this.turn === 'player') {
      el.className = 'ttt-turn player';
      el.innerHTML = '<span class="emoji">❌</span> نوبت تو';
    } else {
      el.className = 'ttt-turn ai';
      el.innerHTML = '<span class="emoji">⭕</span> حریف داره فکر می‌کنه...';
    }
  },

  // ========== هایلایت خط برنده ==========
  _highlightWin: function(line) {
    if (!line) return;
    for (var i = 0; i < line.length; i++) {
      var cell = document.getElementById('tttCell' + line[i]);
      if (!cell) continue;
      var val = this.board[line[i]];
      if (val === this.playerSymbol) cell.classList.add('win');
      else cell.classList.add('lose');
    }
    if (typeof playSnd === 'function') playSnd('success');
  },

  // ========== حرکت‌های AI ==========
  _randomMove: function() {
    var empty = [];
    for (var i = 0; i < 9; i++) if (this.board[i] === '') empty.push(i);
    if (empty.length === 0) return -1;
    return empty[Math.floor(Math.random() * empty.length)];
  },

  _smartMove: function() {
    // ۱. ببر
    for (var i = 0; i < 9; i++) {
      if (this.board[i] === '') {
        var test = this.board.slice();
        test[i] = this.aiSymbol;
        if (this._checkWinOn(test, this.aiSymbol)) return i;
      }
    }
    // ۲. جلوگیری
    for (var j = 0; j < 9; j++) {
      if (this.board[j] === '') {
        var test2 = this.board.slice();
        test2[j] = this.playerSymbol;
        if (this._checkWinOn(test2, this.playerSymbol)) return j;
      }
    }
    if (this.board[4] === '') return 4;
    return this._randomMove();
  },

  _bestMove: function() {
    var bestScore = -Infinity;
    var bestMove = -1;
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
      if (board[p[0]] === symbol && board[p[1]] === symbol && board[p[2]] === symbol) return true;
    }
    return false;
  },

  _isFull: function() { return this._isFullOn(this.board); },
  _isFullOn: function(board) {
    for (var i = 0; i < 9; i++) if (board[i] === '') return false;
    return true;
  },

  // ========== برد ==========
  _win: function(who) {
    this.isPlaying = false;

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

      this._lastReward = { coins: coins, gems: gems };
      var self = this;
      setTimeout(function() {
        self._showModal('win', { coins: coins, gems: gems });
      }, 400);
    } else {
      this.losses++;
      if (typeof playSnd === 'function') playSnd('error');
      this._lastReward = null;
      var self2 = this;
      setTimeout(function() {
        self2._showModal('lose', {});
      }, 400);
    }
  },

  _draw: function() {
    this.isPlaying = false;
    this.draws++;
    if (typeof playSnd === 'function') playSnd('click');
    var self = this;
    setTimeout(function() {
      self._showModal('draw', {});
    }, 400);
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
    var turnTxt = (this.turn === 'player') ? '<span class="emoji">❌</span> نوبت تو' : '<span class="emoji">⭕</span> حریف داره فکر می‌کنه...';
    html += '<div class="' + turnCls + '" id="tttTurn">' + turnTxt + '</div>';

    // تخته
    html += '<div class="ttt-board" id="tttBoard">';
    for (var i = 0; i < 9; i++) {
      var val = this.board[i];
      var cls = 'ttt-cell';
      if (val === 'X') cls += ' x filled';
      if (val === 'O') cls += ' o filled';

      if (this.winLine && this.winLine.indexOf(i) >= 0) {
        cls += (val === this.playerSymbol) ? ' win' : ' lose';
      }

      var sym = '';
      if (val === 'X') sym = '<span class="symbol">❌</span>';
      else if (val === 'O') sym = '<span class="symbol">⭕</span>';

      html += '<button class="' + cls + '" id="tttCell' + i + '" onclick="TTT.clickCell(' + i + ')">' + sym + '</button>';
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

  // ========== بروزرسانی کامل ==========
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
