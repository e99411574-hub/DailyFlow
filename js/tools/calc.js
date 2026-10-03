// ===== tools/calc.js - ماشین‌حساب =====

var CALC = {
  // وضعیت
  display: '0',
  expression: '',
  firstOperand: null,
  operator: null,
  waitingForOperand: false,
  memory: 0,
  history: [],
  historyOpen: false,

  // ========== شروع ==========
  start: function() {
    this.display = '0';
    this.expression = '';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForOperand = false;
    this._loadMemory();
    this._loadHistory();
    this.refresh();
    if (typeof playSnd === 'function') playSnd('tap');
  },

  // ========== اعداد ==========
  inputDigit: function(digit) {
    if (typeof playSnd === 'function') playSnd('click');

    if (this.waitingForOperand) {
      this.display = String(digit);
      this.waitingForOperand = false;
    } else {
      if (this.display === '0') {
        this.display = String(digit);
      } else if (this.display.length < 12) {
        this.display += String(digit);
      }
    }
    this.refresh();
  },

  // ========== ممیز ==========
  inputDot: function() {
    if (typeof playSnd === 'function') playSnd('click');

    if (this.waitingForOperand) {
      this.display = '0.';
      this.waitingForOperand = false;
    } else if (this.display.indexOf('.') < 0) {
      this.display += '.';
    }
    this.refresh();
  },

  // ========== عملگر ==========
  inputOperator: function(op) {
    if (typeof playSnd === 'function') playSnd('click');

    var current = parseFloat(this.display);

    if (this.operator && !this.waitingForOperand) {
      var result = this._calculate(this.firstOperand, current, this.operator);
      this.display = this._format(result);
      this.firstOperand = result;
    } else {
      this.firstOperand = current;
    }

    this.operator = op;
    this.waitingForOperand = true;

    var symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    this.expression = this._format(this.firstOperand) + ' ' + (symbolMap[op] || op);
    this.refresh();
  },

  // ========== مساوی ==========
  inputEquals: function() {
    if (typeof playSnd === 'function') playSnd('success');

    if (!this.operator || this.firstOperand === null) return;

    var current = parseFloat(this.display);
    var result = this._calculate(this.firstOperand, current, this.operator);

    var symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    var exprText = this._format(this.firstOperand) + ' ' + (symbolMap[this.operator] || this.operator) + ' ' + this._format(current);

    this._addHistory(exprText, result);

    this.display = this._format(result);
    this.expression = exprText + ' =';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForOperand = true;

    this.refresh();
  },

  // ========== محاسبه ==========
  _calculate: function(a, b, op) {
    var result;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = (b === 0) ? 0 : a / b; break;
      default: result = b;
    }
    return Math.round(result * 1e10) / 1e10;
  },

  _format: function(num) {
    if (typeof num !== 'number') num = parseFloat(num);
    if (isNaN(num)) return '0';
    if (!isFinite(num)) return 'خطا';
    if (Math.abs(num) > 1e12) return num.toExponential(4);
    var str = String(num);
    if (str.length > 14) str = num.toPrecision(10);
    return str;
  },

  // ========== پاک کردن ==========
  clear: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    this.display = '0';
    this.expression = '';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForOperand = false;
    this.refresh();
  },

  clearEntry: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    this.display = '0';
    this.refresh();
  },

  // ========== علامت ==========
  toggleSign: function() {
    if (typeof playSnd === 'function') playSnd('click');
    if (this.display === '0') return;
    if (this.display.charAt(0) === '-') {
      this.display = this.display.substring(1);
    } else {
      this.display = '-' + this.display;
    }
    this.refresh();
  },

  // ========== درصد ==========
  percent: function() {
    if (typeof playSnd === 'function') playSnd('click');
    var current = parseFloat(this.display);
    var result = current / 100;
    this.display = this._format(result);
    this.refresh();
  },

  // ========== backspace ==========
  backspace: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    if (this.waitingForOperand) return;
    if (this.display.length <= 1 || (this.display.length === 2 && this.display.charAt(0) === '-')) {
      this.display = '0';
    } else {
      this.display = this.display.substring(0, this.display.length - 1);
    }
    this.refresh();
  },

  // ========== حافظه ==========
  memoryAdd: function() {
    if (typeof playSnd === 'function') playSnd('click');
    this.memory += parseFloat(this.display);
    this._saveMemory();
    this.refresh();
    if (typeof showToast === 'function') showToast('💾 ذخیره شد در حافظه');
  },

  memorySub: function() {
    if (typeof playSnd === 'function') playSnd('click');
    this.memory -= parseFloat(this.display);
    this._saveMemory();
    this.refresh();
    if (typeof showToast === 'function') showToast('💾 حافظه آپدیت شد');
  },

  memoryRecall: function() {
    if (typeof playSnd === 'function') playSnd('click');
    this.display = this._format(this.memory);
    this.waitingForOperand = false;
    this.refresh();
  },

  memoryClear: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    this.memory = 0;
    this._saveMemory();
    this.refresh();
    if (typeof showToast === 'function') showToast('🗑️ حافظه پاک شد');
  },

  _saveMemory: function() {
    try {
      localStorage.setItem('setareh_calc_memory', String(this.memory));
    } catch (e) {}
  },

  _loadMemory: function() {
    try {
      var v = localStorage.getItem('setareh_calc_memory');
      if (v !== null) this.memory = parseFloat(v) || 0;
    } catch (e) { this.memory = 0; }
  },

  // ========== تاریخچه ==========
  _addHistory: function(expr, result) {
    this.history.unshift({
      expr: expr,
      result: this._format(result),
      time: Date.now()
    });
    if (this.history.length > 20) this.history = this.history.slice(0, 20);
    this._saveHistory();
  },

  _saveHistory: function() {
    try {
      localStorage.setItem('setareh_calc_history', JSON.stringify(this.history));
    } catch (e) {}
  },

  _loadHistory: function() {
    try {
      var raw = localStorage.getItem('setareh_calc_history');
      this.history = raw ? JSON.parse(raw) : [];
    } catch (e) { this.history = []; }
  },

  toggleHistory: function() {
    this.historyOpen = !this.historyOpen;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
    if (this.historyOpen) {
      setTimeout(function() {
        var el = document.getElementById('calcHistory');
        if (el) el.classList.add('show');
      }, 10);
    }
  },

  closeHistory: function() {
    var el = document.getElementById('calcHistory');
    if (el) el.classList.remove('show');
    this.historyOpen = false;
    setTimeout(this.refresh.bind(this), 300);
  },

  clearHistory: function() {
    this.history = [];
    this._saveHistory();
    this.refresh();
    if (typeof playSnd === 'function') playSnd('tap');
  },

  useHistoryItem: function(idx) {
    var item = this.history[idx];
    if (!item) return;
    this.display = item.result;
    this.waitingForOperand = false;
    this.closeHistory();
    if (typeof playSnd === 'function') playSnd('click');
  },

  // ========== نمایشگر ==========
  _formatDisplay: function() {
    var txt = this.display;
    var neg = false;
    if (txt.charAt(0) === '-') { neg = true; txt = txt.substring(1); }
    var parts = txt.split('.');
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var result = intPart;
    if (parts[1] !== undefined) result += '.' + parts[1];
    if (neg) result = '-' + result;
    return result;
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="calc-page">';

    html += '<div class="calc-topbar">';
    html += '<button class="calc-back" onclick="CALC.back()">›</button>';
    html += '<div class="calc-title">🧮 ماشین‌حساب</div>';
    html += '<button class="calc-hist-btn" onclick="CALC.toggleHistory()">📜</button>';
    html += '</div>';

    html += '<div class="calc-display">';
    html += '<div class="calc-expr">' + (this.expression || '') + '</div>';
    html += '<div class="calc-result" id="calcResult">' + this._formatDisplay() + '</div>';
    html += '</div>';

    if (this.memory !== 0) {
      html += '<div class="calc-memory">';
      html += '<span class="calc-memory-label">💾 حافظه:</span>';
      html += '<span class="calc-memory-value">' + this._format(this.memory) + '</span>';
      html += '<button class="calc-memory-clear" onclick="CALC.memoryClear()">MC</button>';
      html += '</div>';
    }

    html += '<div class="calc-keypad">';

    html += '<button class="calc-btn mem" onclick="CALC.memoryAdd()">M+</button>';
    html += '<button class="calc-btn mem" onclick="CALC.memorySub()">M−</button>';
    html += '<button class="calc-btn mem" onclick="CALC.memoryRecall()">MR</button>';
    html += '<button class="calc-btn clear" onclick="CALC.clear()">C</button>';

    html += '<button class="calc-btn num" onclick="CALC.inputDigit(7)">7</button>';
    html += '<button class="calc-btn num" onclick="CALC.inputDigit(8)">8</button>';
    html += '<button class="calc-btn num" onclick="CALC.inputDigit(9)">9</button>';
    html += '<button class="calc-btn op" onclick="CALC.inputOperator(\'/\')">÷</button>';

    html += '<button class="calc-btn num" onclick="CALC.inputDigit(4)">4</button>';
    html += '<button class="calc-btn num" onclick="CALC.inputDigit(5)">5</button>';
    html += '<button class="calc-btn num" onclick="CALC.inputDigit(6)">6</button>';
    html += '<button class="calc-btn op" onclick="CALC.inputOperator(\'*\')">×</button>';

    html += '<button class="calc-btn num" onclick="CALC.inputDigit(1)">1</button>';
    html += '<button class="calc-btn num" onclick="CALC.inputDigit(2)">2</button>';
    html += '<button class="calc-btn num" onclick="CALC.inputDigit(3)">3</button>';
    html += '<button class="calc-btn op" onclick="CALC.inputOperator(\'-\')">−</button>';

    html += '<button class="calc-btn num" onclick="CALC.inputDigit(0)">0</button>';
    html += '<button class="calc-btn num" onclick="CALC.inputDot()">.</button>';
    html += '<button class="calc-btn fn" onclick="CALC.percent()">%</button>';
    html += '<button class="calc-btn op" onclick="CALC.inputOperator(\'+\')">+</button>';

    html += '<button class="calc-btn fn" onclick="CALC.toggleSign()">±</button>';
    html += '<button class="calc-btn fn" onclick="CALC.backspace()">⌫</button>';
    html += '<button class="calc-btn equal" style="grid-column: span 2" onclick="CALC.inputEquals()">=</button>';

    html += '</div>';

    html += this._renderHistory();

    html += '</div>';
    return html;
  },

  _renderHistory: function() {
    var html = '<div class="calc-history" id="calcHistory" onclick="if(event.target===this)CALC.closeHistory()">';
    html += '<div class="calc-history-box">';

    html += '<div class="calc-history-header">';
    html += '<div class="calc-history-title">📜 تاریخچه</div>';
    if (this.history.length > 0) {
      html += '<button class="calc-history-clear" onclick="CALC.clearHistory()">پاک کردن</button>';
    }
    html += '</div>';

    if (this.history.length === 0) {
      html += '<div class="calc-history-empty">هنوز محاسبه‌ای انجام ندادی</div>';
    } else {
      for (var i = 0; i < this.history.length; i++) {
        var h = this.history[i];
        html += '<div class="calc-history-item" onclick="CALC.useHistoryItem(' + i + ')">';
        html += '<div class="calc-history-expr">' + h.expr + '</div>';
        html += '<div class="calc-history-res">= ' + h.result + '</div>';
        html += '</div>';
      }
    }

    html += '</div>';
    html += '</div>';
    return html;
  },

  // ========== بازگشت ==========
  back: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    if (typeof ROUTER !== 'undefined') ROUTER.go('tools');
  },

  // ========== بروزرسانی ==========
  refresh: function() {
    var c = document.getElementById('toolsContent');
    if (c) c.innerHTML = this.render();

    setTimeout(function() {
      var r = document.getElementById('calcResult');
      if (r) {
        r.classList.add('pop');
        setTimeout(function() { r.classList.remove('pop'); }, 400);
      }
    }, 20);
  }
};

// تابع سراسری
function openTool_calc() {
  CALC.start();
}

window.CALC = CALC;
