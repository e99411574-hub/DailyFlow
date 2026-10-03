// ===== wheel.js - گردونهٔ شانس روزانه =====

var WHEEL = {
  spinning: false,
  lastSpinTime: 0,
  cooldownMs: 12 * 60 * 60 * 1000, // ۱۲ ساعت
  currentRotation: 0,
  timerInterval: null,

  // بخش‌های گردونه (۸ بخش)
  segments: [
    { id: 0, label: '۱۰ سکه',  icon: '🪙', type: 'coin',  amount: 10,  color: '#8b5cf6' },
    { id: 1, label: 'پوچ',      icon: '😢', type: 'none',  amount: 0,   color: '#b8b8d0' },
    { id: 2, label: '۲ جم',     icon: '💎', type: 'gem',   amount: 2,   color: '#E84393' },
    { id: 3, label: '۵ سکه',   icon: '🪙', type: 'coin',  amount: 5,   color: '#FDCB6E' },
    { id: 4, label: 'پوچ',      icon: '😢', type: 'none',  amount: 0,   color: '#b8b8d0' },
    { id: 5, label: '۵ جم',     icon: '💎', type: 'gem',   amount: 5,   color: '#00B894' },
    { id: 6, label: '۲۰ سکه',  icon: '🪙', type: 'coin',  amount: 20,  color: '#0984E3' },
    { id: 7, label: '۱ جم',     icon: '💎', type: 'gem',   amount: 1,   color: '#E17055' }
  ],

  // ========== شروع ==========
  init: function() {
    this._loadState();
    this.currentRotation = 0;
    this._startTimer();
  },

  _loadState: function() {
    try {
      var t = localStorage.getItem('setareh_wheel_last');
      this.lastSpinTime = t ? parseInt(t) : 0;
    } catch (e) { this.lastSpinTime = 0; }
  },

  _saveState: function() {
    try {
      localStorage.setItem('setareh_wheel_last', String(this.lastSpinTime));
    } catch (e) {}
  },

  // ========== بررسی قفل ==========
  isLocked: function() {
    if (!this.lastSpinTime) return false;
    var elapsed = Date.now() - this.lastSpinTime;
    return elapsed < this.cooldownMs;
  },

  getRemainingMs: function() {
    if (!this.lastSpinTime) return 0;
    var elapsed = Date.now() - this.lastSpinTime;
    var remaining = this.cooldownMs - elapsed;
    return remaining > 0 ? remaining : 0;
  },

  _formatRemaining: function(ms) {
    if (ms <= 0) return '۰۰:۰۰:۰۰';
    var totalSec = Math.floor(ms / 1000);
    var hrs = Math.floor(totalSec / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
    var str = pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
    return (typeof toFa === 'function') ? toFa(str) : str;
  },

  _startTimer: function() {
    var self = this;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(function() {
      var el = document.getElementById('wheelLockTime');
      if (!el) return;
      if (self.isLocked()) {
        el.textContent = self._formatRemaining(self.getRemainingMs());
      } else {
        // قفل باز شد — رفرش کن
        if (typeof APP !== 'undefined' && APP.renderHome) APP.renderHome();
      }
    }, 1000);
  },

  // ========== چرخوندن ==========
  spin: function() {
    if (this.spinning) return;
    if (this.isLocked()) {
      if (typeof showToast === 'function') showToast('⏳ هنوز آماده نیست!');
      return;
    }

    this.spinning = true;
    if (typeof playSnd === 'function') playSnd('tap');

    // انتخاب یه بخش تصادفی
    var winnerIndex = Math.floor(Math.random() * this.segments.length);

    // محاسبهٔ زاویه‌ای که باید بچرخه
    // هر بخش = 360/8 = 45 درجه
    var segmentAngle = 360 / this.segments.length;

    // اشاره‌گر بالا قرار داره (زاویه 0 = بالا)
    // بخش شماره n در بازه [n*45, (n+1)*45] قرار داره
    // می‌خوایم بخش winnerIndex زیر اشاره‌گر بیاد
    // مرکز بخش winnerIndex = winnerIndex*45 + 22.5
    // برای اینکه این مرکز زیر اشاره‌گر بیاد (زاویه 0):
    // rotation = 360 - centerAngle + randomOffsetWithinSegment
    var centerAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    var randomOffset = (Math.random() - 0.5) * (segmentAngle - 10);
    var targetRotation = 360 * 8 + (360 - centerAngle + randomOffset); // ۸ دور کامل + زاویه

    // اضافه به چرخش فعلی
    var newRotation = this.currentRotation + targetRotation;

    var svg = document.getElementById('wheelSvg');
    if (svg) {
      svg.classList.add('spinning');
      svg.style.transform = 'rotate(' + newRotation + 'deg)';
    }

    this.currentRotation = newRotation % 360;

    var self = this;
    setTimeout(function() {
      self.spinning = false;
      if (svg) svg.classList.remove('spinning');
      self._showResult(winnerIndex);
    }, 5100);
  },

  // ========== نمایش نتیجه ==========
  _showResult: function(idx) {
    var seg = this.segments[idx];
    var isNone = seg.type === 'none';

    // ذخیره زمان
    this.lastSpinTime = Date.now();
    this._saveState();

    // اگه جایزه داشت، اضافه کن
    if (!isNone) {
      if (seg.type === 'coin' && typeof SHOP !== 'undefined') {
        SHOP.addCoins(seg.amount);
      } else if (seg.type === 'gem' && typeof SHOP !== 'undefined') {
        SHOP.addGems(seg.amount);
      }
      if (typeof playSnd === 'function') playSnd('success');

      // به‌روزرسانی هدر
      if (typeof APP !== 'undefined' && APP.updateHeader) APP.updateHeader();
    } else {
      if (typeof playSnd === 'function') playSnd('error');
    }

    // مودال
    var modal = document.getElementById('wheelModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wheelModal';
      modal.className = 'wheel-modal';
      document.body.appendChild(modal);
    }

    var html = '<div class="wheel-modal-box">';

    if (isNone) {
      html += '<div class="wheel-modal-icon">😢</div>';
      html += '<div class="wheel-modal-title lose">پوچ!</div>';
      html += '<div class="wheel-modal-desc">این بار شانس یارت نبود<br>۱۲ ساعت دیگه دوباره امتحان کن</div>';
    } else {
      html += '<div class="wheel-modal-icon">🎉</div>';
      html += '<div class="wheel-modal-title">تبریک!</div>';
      html += '<div class="wheel-modal-desc">این جایزه رو بردی:</div>';
      html += '<div class="wheel-modal-reward">' + seg.icon + ' ' + (typeof toFa === 'function' ? toFa(seg.amount) : seg.amount) + '</div>';
    }

    html += '<button class="wheel-modal-btn" onclick="WHEEL.closeModal()">باشه</button>';
    html += '</div>';

    modal.innerHTML = html;
    modal.classList.add('show');
  },

  closeModal: function() {
    var modal = document.getElementById('wheelModal');
    if (modal) modal.classList.remove('show');

    // رفرش کن که گردونه قفل بشه
    if (typeof APP !== 'undefined' && APP.renderHome) APP.renderHome();
  },

  // ========== ساخت SVG گردونه ==========
  buildSVG: function() {
    var size = 300;
    var cx = size / 2;
    var cy = size / 2;
    var r = size / 2 - 4;
    var n = this.segments.length;
    var anglePerSeg = 360 / n;

    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg" id="wheelSvg" class="wheel-svg">';

    // دایرهٔ بیرونی
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#ffffff" stroke="#FDCB6E" stroke-width="4"/>';

    // بخش‌ها
    for (var i = 0; i < n; i++) {
      var startAngle = i * anglePerSeg - 90; // شروع از بالا
      var endAngle = (i + 1) * anglePerSeg - 90;
      var startRad = startAngle * Math.PI / 180;
      var endRad = endAngle * Math.PI / 180;

      var x1 = cx + r * Math.cos(startRad);
      var y1 = cy + r * Math.sin(startRad);
      var x2 = cx + r * Math.cos(endRad);
      var y2 = cy + r * Math.sin(endRad);

      var largeArc = anglePerSeg > 180 ? 1 : 0;
      var path = 'M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2 + ' Z';

      svg += '<path d="' + path + '" fill="' + this.segments[i].color + '" stroke="#ffffff" stroke-width="2"/>';

      // متن/ایموجی روی بخش
      var midAngle = (startAngle + endAngle) / 2;
      var midRad = midAngle * Math.PI / 180;
      var textR = r * 0.68;
      var tx = cx + textR * Math.cos(midRad);
      var ty = cy + textR * Math.sin(midRad);

      svg += '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" dominant-baseline="middle" font-size="26" fill="#ffffff" style="user-select:none">' + this.segments[i].icon + '</text>';

      // متن جایزه کوچیک
      var textR2 = r * 0.85;
      var tx2 = cx + textR2 * Math.cos(midRad);
      var ty2 = cy + textR2 * Math.sin(midRad);
      svg += '<text x="' + tx2 + '" y="' + ty2 + '" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="800" fill="#ffffff" style="user-select:none">' + this.segments[i].label + '</text>';
    }

    svg += '</svg>';
    return svg;
  },

  // ========== رندر بخش گردونه برای صفحهٔ خانه ==========
  renderSection: function() {
    var locked = this.isLocked();
    var html = '<div class="wheel-section">';

    html += '<div class="wheel-title">🎡 گردونهٔ شانس</div>';

    html += '<div class="wheel-container">';
    html += '<div class="wheel-bg">' + this.buildSVG() + '</div>';
    html += '<div class="wheel-pointer"></div>';
    html += '<div class="wheel-center' + (locked ? ' disabled' : '') + '" onclick="WHEEL.spin()">🎁</div>';
    html += '</div>';

    if (locked) {
      html += '<div class="wheel-lock">';
      html += '<span class="icon">⏳</span>';
      html += '<span>تا چرخش بعدی:</span>';
      html += '<span class="time" id="wheelLockTime">' + this._formatRemaining(this.getRemainingMs()) + '</span>';
      html += '</div>';
    } else {
      html += '<button class="wheel-spin-btn" onclick="WHEEL.spin()">🎯 بچرخون!</button>';
    }

    html += '</div>';
    return html;
  }
};

window.WHEEL = WHEEL;
