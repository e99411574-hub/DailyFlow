// ===== tools/qa.js - پرسش و پاسخ + پرسش هوشمند + OCR =====

var QA = {
  activeTab: 'questions',
  activeCat: 'all',
  searchQuery: '',
  currentQuestion: null,
  ocrImage: null,
  ocrText: '',
  ocrStatus: 'idle',
  ocrProgress: 0,
  ocrError: '',
  tesseractLoaded: false,

  categories: [
    { id: 'all',           name: 'همه',      icon: '📚' },
    { id: 'history',       name: 'تاریخ',    icon: '📖' },
    { id: 'geo',           name: 'جغرافیا', icon: '🌍' },
    { id: 'science',       name: 'علمی',     icon: '🔬' },
    { id: 'literature',    name: 'ادبیات',   icon: '📚' },
    { id: 'religion',      name: 'مذهبی',    icon: '🕌' },
    { id: 'sport',         name: 'ورزشی',    icon: '⚽' },
    { id: 'entertainment', name: 'سرگرمی',   icon: '🎬' },
    { id: 'general',       name: 'عمومی',    icon: '🧠' }
  ],

  // ========== شروع ==========
  start: function() {
    this.activeTab = 'questions';
    this.activeCat = 'all';
    this.searchQuery = '';
    this.currentQuestion = null;
    this.ocrImage = null;
    this.ocrText = '';
    this.ocrStatus = 'idle';

    // اگه QA_AI هست، شروعش کن
    try {
      if (typeof QA_AI !== 'undefined' && QA_AI && typeof QA_AI.start === 'function') {
        QA_AI.start();
      }
    } catch (e) {
      console.warn('QA_AI start error:', e);
    }

    this.refresh();
    if (typeof playSnd === 'function') playSnd('tap');
  },

  // ========== تب ==========
  setTab: function(tab) {
    this.activeTab = tab;
    this.currentQuestion = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== دسته ==========
  setCat: function(catId) {
    this.activeCat = catId;
    this.currentQuestion = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== جستجو ==========
  setSearch: function(q) {
    this.searchQuery = q;
    this._updateQuestionList();
  },

  // ========== گرفتن سؤالات ==========
  _getAllQuestions: function() {
    var all = [];
    var sources = {
      history:       window.QA_HISTORY || [],
      geo:           window.QA_GEO || [],
      science:       window.QA_SCIENCE || [],
      literature:    window.QA_LITERATURE || [],
      religion:      window.QA_RELIGION || [],
      sport:         window.QA_SPORT || [],
      entertainment: window.QA_ENTERTAINMENT || [],
      general:       window.QA_GENERAL || []
    };
    for (var key in sources) {
      for (var i = 0; i < sources[key].length; i++) {
        all.push({ cat: key, q: sources[key][i].q, a: sources[key][i].a });
      }
    }
    return all;
  },

  _getQuestionsByCat: function(catId) {
    if (catId === 'all') return this._getAllQuestions();
    var map = {
      history:       window.QA_HISTORY,
      geo:           window.QA_GEO,
      science:       window.QA_SCIENCE,
      literature:    window.QA_LITERATURE,
      religion:      window.QA_RELIGION,
      sport:         window.QA_SPORT,
      entertainment: window.QA_ENTERTAINMENT,
      general:       window.QA_GENERAL
    };
    var arr = map[catId] || [];
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      result.push({ cat: catId, q: arr[i].q, a: arr[i].a });
    }
    return result;
  },

  _getFiltered: function() {
    var list = this._getQuestionsByCat(this.activeCat);
    var q = this.searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(function(item) {
      return item.q.toLowerCase().indexOf(q) >= 0;
    });
  },

  openQuestion: function(idx) {
    var filtered = this._getFiltered();
    if (filtered[idx]) {
      this.currentQuestion = filtered[idx];
      if (typeof playSnd === 'function') playSnd('tap');
      this.refresh();
      window.scrollTo(0, 0);
    }
  },

  closeQuestion: function() {
    this.currentQuestion = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== OCR ==========
  handleImage: function(evt) {
    var file = evt.target.files[0];
    if (!file) return;
    if (file.size > 5000000) {
      if (typeof showToast === 'function') showToast('❌ عکس خیلی بزرگه (حداکثر ۵MB)');
      return;
    }
    var reader = new FileReader();
    var self = this;
    reader.onload = function(e) {
      self.ocrImage = e.target.result;
      self.ocrText = '';
      self.ocrStatus = 'idle';
      self.refresh();
    };
    reader.readAsDataURL(file);
  },

  removeImage: function() {
    this.ocrImage = null;
    this.ocrText = '';
    this.ocrStatus = 'idle';
    this.ocrProgress = 0;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  startOCR: function() {
    if (!this.ocrImage) return;
    var self = this;
    this.ocrStatus = 'downloading';
    this.ocrProgress = 0;
    this.ocrText = '';
    this.refresh();

    if (typeof Tesseract !== 'undefined') {
      self._runTesseract();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = function() {
      self.tesseractLoaded = true;
      self._runTesseract();
    };
    script.onerror = function() {
      self.ocrStatus = 'error';
      self.ocrError = 'اتصال به اینترنت برقرار نشد';
      self.refresh();
    };
    document.head.appendChild(script);
  },

  _runTesseract: function() {
    var self = this;
    this.ocrStatus = 'processing';
    this.ocrProgress = 0;
    this.refresh();

    try {
      Tesseract.recognize(
        this.ocrImage,
        'fas+eng',
        {
          logger: function(m) {
            if (m.status === 'recognizing text') {
              self.ocrProgress = Math.round(m.progress * 100);
              var bar = document.getElementById('ocrProgressFill');
              if (bar) bar.style.width = self.ocrProgress + '%';
              var pct = document.getElementById('ocrPercent');
              if (pct) pct.textContent = (typeof toFa === 'function' ? toFa(self.ocrProgress) : self.ocrProgress) + '٪';
            } else if (m.status && m.status.indexOf('loading') >= 0) {
              var st = document.getElementById('ocrStatusText');
              if (st) st.textContent = '📦 دانلود مدل زبان...';
            }
          }
        }
      ).then(function(result) {
        self.ocrText = (result.data.text || '').trim();
        self.ocrStatus = 'done';
        self.ocrProgress = 100;
        if (typeof playSnd === 'function') playSnd('success');
        self.refresh();
      }).catch(function(err) {
        console.error('OCR error:', err);
        self.ocrStatus = 'error';
        self.ocrError = 'خطا در استخراج متن';
        self.refresh();
      });
    } catch (e) {
      console.error(e);
      this.ocrStatus = 'error';
      this.ocrError = 'خطای نامشخص';
      this.refresh();
    }
  },

  copyText: function() {
    if (!this.ocrText) return;
    var self = this;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.ocrText).then(function() {
        if (typeof showToast === 'function') showToast('📋 متن کپی شد');
        if (typeof playSnd === 'function') playSnd('success');
      }).catch(function() { self._fallbackCopy(); });
    } else {
      this._fallbackCopy();
    }
  },

  _fallbackCopy: function() {
    try {
      var ta = document.createElement('textarea');
      ta.value = this.ocrText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (typeof showToast === 'function') showToast('📋 متن کپی شد');
    } catch (e) {
      if (typeof showToast === 'function') showToast('❌ کپی نشد');
    }
  },

  clearOCR: function() {
    this.ocrImage = null;
    this.ocrText = '';
    this.ocrStatus = 'idle';
    this.ocrProgress = 0;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="qa-page">';

    html += '<div class="qa-topbar">';
    html += '<button class="qa-back" onclick="QA.back()">›</button>';
    html += '<div class="qa-title">❓ پرسش</div>';
    html += '</div>';

    // سه تب
    html += '<div class="qa-tabs" style="overflow-x:auto">';
    html += '<button class="qa-tab ' + (this.activeTab === 'questions' ? 'active' : '') + '" onclick="QA.setTab(\'questions\')">📚 سؤالات</button>';
    html += '<button class="qa-tab ' + (this.activeTab === 'ai' ? 'active' : '') + '" onclick="QA.setTab(\'ai\')">🤖 هوشمند</button>';
    html += '<button class="qa-tab ' + (this.activeTab === 'ocr' ? 'active' : '') + '" onclick="QA.setTab(\'ocr\')">📷 عکس</button>';
    html += '</div>';

    if (this.activeTab === 'questions') {
      html += this._renderQuestions();
    } else if (this.activeTab === 'ai') {
      html += '<div id="qaAiContent"></div>';
      // رندر بعد از لود شدن QA_AI
      setTimeout(function() {
        var c = document.getElementById('qaAiContent');
        if (!c) return;
        try {
          if (typeof QA_AI !== 'undefined' && QA_AI && typeof QA_AI.render === 'function') {
            c.innerHTML = QA_AI.render();
            if (QA_AI.view === 'chat') {
              setTimeout(function() { QA_AI._scrollToBottom(); }, 100);
            }
          } else {
            c.innerHTML = '<div style="text-align:center;padding:40px;color:#E84393;font-weight:700">' +
              '⚠️ ماژول هوشمند لود نشد<br><br>' +
              '<small style="opacity:0.7;font-size:11px">لطفاً صفحه رو رفرش کن</small>' +
              '</div>';
          }
        } catch (e) {
          console.error('QA_AI render error:', e);
          c.innerHTML = '<div style="text-align:center;padding:40px;color:#E84393;font-weight:700">' +
            '❌ خطا<br>' +
            '<small style="opacity:0.7;font-size:11px">' + (e.message || '') + '</small>' +
            '</div>';
        }
      }, 50);
    } else {
      html += this._renderOCR();
    }

    html += '</div>';
    return html;
  },

  _renderQuestions: function() {
    if (this.currentQuestion) return this._renderQuestionView();

    var html = '';
    html += '<div class="qa-search">';
    html += '<input class="qa-search-input" type="text" placeholder="جستجو در سؤالات..." value="' + this._escape(this.searchQuery) + '" oninput="QA.setSearch(this.value)" id="qaSearchInput">';
    html += '<span class="qa-search-icon">🔍</span>';
    html += '</div>';

    html += '<div class="qa-cats">';
    for (var c = 0; c < this.categories.length; c++) {
      var cat = this.categories[c];
      var cls = 'qa-cat' + (this.activeCat === cat.id ? ' active' : '');
      html += '<button class="' + cls + '" onclick="QA.setCat(\'' + cat.id + '\')">' + cat.icon + ' ' + cat.name + '</button>';
    }
    html += '</div>';

    html += '<div class="qa-list" id="qaList">' + this._renderQuestionList() + '</div>';
    return html;
  },

  _renderQuestionList: function() {
    var filtered = this._getFiltered();
    if (filtered.length === 0) {
      return '<div class="qa-empty">' +
        '<div class="qa-empty-icon">🔍</div>' +
        '<div class="qa-empty-text">سؤالی پیدا نشد<br>یه عبارت دیگه امتحان کن</div>' +
        '</div>';
    }
    var html = '';
    var maxShow = 100;
    var count = Math.min(filtered.length, maxShow);
    for (var i = 0; i < count; i++) {
      var item = filtered[i];
      var catInfo = this._getCatInfo(item.cat);
      html += '<div class="qa-item" onclick="QA.openQuestion(' + i + ')" style="animation-delay:' + (Math.min(i * 0.02, 0.4)) + 's">';
      html += '<div class="qa-item-icon">' + catInfo.icon + '</div>';
      html += '<div class="qa-item-text">' + this._escape(item.q) + '</div>';
      html += '<div class="qa-item-arrow">‹</div>';
      html += '</div>';
    }
    if (filtered.length > maxShow) {
      html += '<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px;font-weight:700">';
      html += 'و ' + (typeof toFa === 'function' ? toFa(filtered.length - maxShow) : (filtered.length - maxShow)) + ' سؤال دیگه';
      html += '</div>';
    }
    return html;
  },

  _updateQuestionList: function() {
    var list = document.getElementById('qaList');
    if (list) list.innerHTML = this._renderQuestionList();
  },

  _renderQuestionView: function() {
    var item = this.currentQuestion;
    var catInfo = this._getCatInfo(item.cat);
    var html = '';
    html += '<div class="qa-question">';
    html += '<div class="qa-question-card">';
    html += '<div class="qa-question-label">' + catInfo.icon + ' ' + catInfo.name + '</div>';
    html += '<div class="qa-question-text">' + this._escape(item.q) + '</div>';
    html += '</div>';
    html += '<div class="qa-answer-card">';
    html += '<div class="qa-answer-label">📖 پاسخ</div>';
    html += '<div class="qa-answer-text">' + this._escape(item.a) + '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  },

  _getCatInfo: function(catId) {
    for (var i = 0; i < this.categories.length; i++) {
      if (this.categories[i].id === catId) return this.categories[i];
    }
    return { icon: '📚', name: 'عمومی' };
  },

  _renderOCR: function() {
    var html = '';

    if (!this.ocrImage) {
      html += '<div class="ocr-upload-box" onclick="document.getElementById(\'ocrFileInput\').click()">';
      html += '<div class="ocr-upload-icon">📷</div>';
      html += '<div class="ocr-upload-title">آپلود عکس</div>';
      html += '<div class="ocr-upload-hint">عکس رو انتخاب کن تا متنش استخراج بشه</div>';
      html += '<input type="file" accept="image/*" id="ocrFileInput" style="display:none" onchange="QA.handleImage(event)">';
      html += '</div>';
      html += '<div class="ocr-download-notice">';
      html += '<span class="icon">💡</span>';
      html += '<span>بار اول که عکس آپلود می‌کنی، مدل تشخیص متن (فارسی + انگلیسی) حدود ۱۵ مگابایت دانلود می‌شه. بعدش آفلاین کار می‌کنه.</span>';
      html += '</div>';
      return html;
    }

    html += '<div class="ocr-preview">';
    html += '<img src="' + this.ocrImage + '" alt="preview">';
    if (this.ocrStatus === 'idle' || this.ocrStatus === 'error') {
      html += '<button class="ocr-preview-remove" onclick="QA.removeImage()">✕</button>';
    }
    html += '</div>';

    if (this.ocrStatus === 'idle') {
      html += '<button class="ocr-btn copy" style="width:100%;padding:16px;font-size:15px" onclick="QA.startOCR()">🔍 استخراج متن</button>';
    }

    if (this.ocrStatus === 'downloading' || this.ocrStatus === 'processing') {
      html += '<div class="ocr-status">';
      html += '<div class="ocr-status-icon">⏳</div>';
      html += '<div class="ocr-status-text" id="ocrStatusText">' +
        (this.ocrStatus === 'downloading' ? '📦 دانلود کتابخانه...' : '🔍 در حال استخراج متن...') +
        '</div>';
      html += '<div class="ocr-status-sub">لطفاً صبر کن</div>';
      html += '<div class="ocr-progress"><div class="ocr-progress-fill" id="ocrProgressFill" style="width:' + this.ocrProgress + '%"></div></div>';
      html += '<div style="text-align:center;margin-top:8px;font-size:12px;color:var(--text3);font-weight:800" id="ocrPercent">' + (typeof toFa === 'function' ? toFa(this.ocrProgress) : this.ocrProgress) + '٪</div>';
      html += '</div>';
    }

    if (this.ocrStatus === 'error') {
      html += '<div class="ocr-status">';
      html += '<div class="ocr-status-icon done">❌</div>';
      html += '<div class="ocr-status-text">خطا</div>';
      html += '<div class="ocr-status-sub">' + this._escape(this.ocrError) + '</div>';
      html += '</div>';
      html += '<button class="ocr-btn copy" style="width:100%;padding:14px;margin-top:10px" onclick="QA.startOCR()">🔄 دوباره تلاش کن</button>';
    }

    if (this.ocrStatus === 'done') {
      html += '<div class="ocr-result">';
      html += '<div class="ocr-result-label">📝 متن استخراج‌شده</div>';
      html += '<div class="ocr-result-text">' + (this.ocrText ? this._escape(this.ocrText) : '<em style="opacity:.6">متنی تشخیص داده نشد</em>') + '</div>';
      if (this.ocrText) {
        html += '<div class="ocr-actions">';
        html += '<button class="ocr-btn copy" onclick="QA.copyText()">📋 کپی متن</button>';
        html += '<button class="ocr-btn clear" onclick="QA.clearOCR()">🗑️ پاک کردن</button>';
        html += '</div>';
      } else {
        html += '<button class="ocr-btn clear" style="width:100%;margin-top:10px" onclick="QA.clearOCR()">🔄 عکس جدید</button>';
      }
      html += '</div>';
    }

    return html;
  },

  _escape: function(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  back: function() {
    if (typeof playSnd === 'function') playSnd('tap');
    if (typeof ROUTER !== 'undefined') ROUTER.go('tools');
  },

  refresh: function() {
    var c = document.getElementById('toolsContent');
    if (c) c.innerHTML = this.render();
  }
};

// تابع سراسری
function openTool_qa() {
  QA.start();
}

window.QA = QA;
