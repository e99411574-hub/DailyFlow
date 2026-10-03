// ===== tools/qa.js - پرسش و پاسخ + هوشمند (AI) =====
// دو تب: 📚 سؤالات | 🤖 هوشمند
// هوشمند: چت + تولید عکس + آپلود عکس + کپی پیام

var QA = {
  activeTab: 'questions',
  activeCat: 'all',
  searchQuery: '',
  currentQuestion: null,

  // ===== وضعیت AI =====
  aiChats: [],
  aiCurrentChatId: null,
  aiView: 'list',
  aiLoading: false,
  aiPuterLoaded: false,
  aiMenuOpen: false,
  aiSelectedImage: null,
  aiCopiedMsgId: null,

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
    this._aiLoadChats();
    this.aiView = 'list';
    this.aiCurrentChatId = null;
    this.aiLoading = false;
    this.aiSelectedImage = null;
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

  // ============ بخش AI ============

  _aiLoadChats: function() {
    try {
      var raw = localStorage.getItem('setareh_ai_chats_v2');
      this.aiChats = raw ? JSON.parse(raw) : [];
    } catch (e) { this.aiChats = []; }
  },

  _aiSaveChats: function() {
    try {
      var toSave = this.aiChats.map(function(c) {
        return {
          id: c.id,
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messages: c.messages.slice(-50).map(function(m) {
            var copy = { role: m.role, text: m.text || '', type: m.type || 'text' };
            if (m.imageUrl) copy.imageUrl = m.imageUrl;
            return copy;
          })
        };
      });
      localStorage.setItem('setareh_ai_chats_v2', JSON.stringify(toSave));
    } catch (e) { console.warn('localStorage full:', e); }
  },

  _aiGetCurrentChat: function() {
    for (var i = 0; i < this.aiChats.length; i++) {
      if (this.aiChats[i].id === this.aiCurrentChatId) return this.aiChats[i];
    }
    return null;
  },

  aiNewChat: function() {
    var chat = {
      id: Date.now() + Math.random(),
      title: 'چت جدید',
      messages: [{
        role: 'ai',
        text: 'سلام! 👋 من دستیار هوشمند ستاره هستم.\n\nمی‌تونم:\n💬 به سؤالاتت جواب بدم\n🎨 برات عکس بسازم (بگو «یه عکس از...»)\n📷 عکس‌هات رو ببینم و تحلیل کنم\n\nچطور می‌تونم کمکت کنم؟',
        type: 'text'
      }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.aiChats.unshift(chat);
    this._aiSaveChats();
    this.aiCurrentChatId = chat.id;
    this.aiView = 'chat';
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  aiOpenChat: function(chatId) {
    this.aiCurrentChatId = chatId;
    this.aiView = 'chat';
    this.aiMenuOpen = false;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
    this._aiScrollToBottom();
  },

  aiBackToList: function() {
    this.aiView = 'list';
    this.aiCurrentChatId = null;
    this.aiMenuOpen = false;
    this.aiSelectedImage = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  aiPickImage: function() {
    var inp = document.getElementById('aiImageInput');
    if (inp) inp.click();
  },

  aiHandleImage: function(evt) {
    var file = evt.target.files[0];
    if (!file) return;
    if (file.size > 5000000) {
      if (typeof showToast === 'function') showToast('❌ عکس خیلی بزرگه (حداکثر ۵MB)');
      return;
    }
    var reader = new FileReader();
    var self = this;
    reader.onload = function(e) {
      self.aiSelectedImage = e.target.result;
      if (typeof playSnd === 'function') playSnd('success');
      self.refresh();
    };
    reader.readAsDataURL(file);
  },

  aiRemoveSelectedImage: function() {
    this.aiSelectedImage = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  aiSendMessage: function() {
    if (this.aiLoading) return;
    var input = document.getElementById('aiInput');
    if (!input) return;
    var text = input.value.trim();
    var hasImage = !!this.aiSelectedImage;

    if (!text && !hasImage) return;

    var chat = this._aiGetCurrentChat();
    if (!chat) return;

    var userMsg = {
      role: 'user',
      text: text || '📷 [عکس]',
      type: hasImage ? 'image' : 'text'
    };
    if (hasImage) userMsg.uploadedImage = this.aiSelectedImage;
    chat.messages.push(userMsg);
    chat.updatedAt = Date.now();

    if (chat.title === 'چت جدید' && text) {
      chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    } else if (chat.title === 'چت جدید' && hasImage) {
      chat.title = '📷 تحلیل عکس';
    }

    var imageData = this.aiSelectedImage;
    input.value = '';
    this.aiSelectedImage = null;
    this._aiSaveChats();
    this.refresh();
    this._aiScrollToBottom();

    this.aiLoading = true;
    this.refresh();
    this._aiScrollToBottom();

    var self = this;
    this._aiAsk(text, imageData).then(function(answer) {
      if (answer.type === 'image') {
        chat.messages.push({
          role: 'ai',
          text: answer.caption || '🎨 عکس ساخته شد:',
          type: 'image',
          imageUrl: answer.imageUrl
        });
      } else {
        chat.messages.push({
          role: 'ai',
          text: answer.text,
          type: 'text'
        });
      }
      chat.updatedAt = Date.now();
      self.aiLoading = false;
      self._aiSaveChats();
      self.refresh();
      self._aiScrollToBottom();
      if (typeof playSnd === 'function') playSnd('success');
    }).catch(function(err) {
      console.error('AI error:', err);
      var errMsg = '❌ خطا در ارتباط با هوش مصنوعی.';
      if (err.message) errMsg += '\n' + err.message;
      else errMsg += '\nدوباره تلاش کن.';
      chat.messages.push({ role: 'ai', text: errMsg, type: 'text' });
      self.aiLoading = false;
      self._aiSaveChats();
      self.refresh();
      self._aiScrollToBottom();
    });
  },

  _aiAsk: function(text, imageData) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self._aiLoadPuter().then(function() {
        if (imageData) {
          self._aiCallVision(text, imageData).then(resolve).catch(reject);
          return;
        }
        if (self._aiIsImageRequest(text)) {
          self._aiGenerateImage(text).then(resolve).catch(reject);
          return;
        }
        self._aiCallChat(text).then(resolve).catch(reject);
      }).catch(reject);
    });
  },

  _aiIsImageRequest: function(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var keys = [
      'عکس بساز', 'عکس بکش', 'تصویر بساز', 'تصویر بکش',
      'نقاشی بکش', 'یه عکس از', 'یک عکس از',
      'generate image', 'create image', 'draw '
    ];
    for (var i = 0; i < keys.length; i++) {
      if (lower.indexOf(keys[i]) >= 0) return true;
    }
    return false;
  },

  _aiLoadPuter: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (self.aiPuterLoaded || typeof puter !== 'undefined') {
        self.aiPuterLoaded = true;
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = function() {
        self.aiPuterLoaded = true;
        resolve();
      };
      script.onerror = function() { reject(new Error('اتصال به AI برقرار نشد')); };
      document.head.appendChild(script);
    });
  },

  _aiCallChat: function(prompt) {
    var self = this;
    return new Promise(function(resolve, reject) {
      try {
        var chat = self._aiGetCurrentChat();
        var messages = [];
        if (chat) {
          for (var i = 0; i < chat.messages.length; i++) {
            var m = chat.messages[i];
            if (m.type === 'image') continue;
            if (m.text && m.text.indexOf('❌') === 0) continue;
            if (m.text && m.text.length > 0) {
              messages.push({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.text
              });
            }
          }
        }

        puter.ai.chat(messages, { model: 'gpt-4o-mini' })
          .then(function(response) {
            var text = self._aiExtractText(response);
            resolve({ type: 'text', text: text || 'متأسفانه جوابی دریافت نشد.' });
          })
          .catch(reject);
      } catch (e) { reject(e); }
    });
  },

  _aiCallVision: function(prompt, imageData) {
    var self = this;
    return new Promise(function(resolve, reject) {
      try {
        var finalPrompt = prompt || 'این عکس چیه؟ توضیح بده.';
        var askText = 'لطفاً این عکس رو تحلیل کن. اگه متن یا سؤالی توش هست، متن رو بخون و به سؤال جواب بده. به فارسی جواب بده.\n\nپیام کاربر: ' + finalPrompt;

        puter.ai.chat(askText, imageData, { model: 'gpt-4o-mini' })
          .then(function(response) {
            var text = self._aiExtractText(response);
            resolve({ type: 'text', text: text || 'نتونستم عکس رو تحلیل کنم.' });
          })
          .catch(function(err) {
            reject(new Error('تحلیل عکس: ' + (err.message || 'خطا')));
          });
      } catch (e) { reject(e); }
    });
  },

  _aiGenerateImage: function(prompt) {
    var self = this;
    return new Promise(function(resolve, reject) {
      try {
        var cleanPrompt = prompt
          .replace(/عکس بساز/g, '').replace(/عکس بکش/g, '')
          .replace(/تصویر بساز/g, '').replace(/تصویر بکش/g, '')
          .replace(/نقاشی بکش/g, '')
          .replace(/یه عکس از/g, '').replace(/یک عکس از/g, '')
          .replace(/generate image/gi, '').replace(/create image/gi, '')
          .replace(/draw/gi, '').trim();

        if (!cleanPrompt) cleanPrompt = prompt;

        var tempId = 'temp-' + Date.now();
        var chat = self._aiGetCurrentChat();
        if (chat) {
          chat.messages.push({
            role: 'ai',
            text: '🎨 دارم عکس رو می‌سازم... (۱۰ تا ۳۰ ثانیه)',
            type: 'text',
            tempId: tempId
          });
          self.refresh();
          self._aiScrollToBottom();
        }

        puter.ai.txt2img(cleanPrompt)
          .then(function(result) {
            var imgUrl = '';
            if (typeof result === 'string') imgUrl = result;
            else if (result && result.src) imgUrl = result.src;
            else if (result && result.tagName === 'IMG') imgUrl = result.src;
            else imgUrl = String(result);

            if (chat) {
              chat.messages = chat.messages.filter(function(m) {
                return m.tempId !== tempId;
              });
            }

            resolve({
              type: 'image',
              imageUrl: imgUrl,
              caption: '🎨 این عکس رو برات ساختم:'
            });
          })
          .catch(function(err) {
            if (chat) {
              chat.messages = chat.messages.filter(function(m) {
                return m.tempId !== tempId;
              });
            }
            reject(new Error('تولید عکس: ' + (err.message || 'خطا')));
          });
      } catch (e) { reject(e); }
    });
  },

  _aiExtractText: function(response) {
    if (typeof response === 'string') return response;
    if (response && response.message && response.message.content) {
      return this._aiCleanText(response.message.content);
    }
    if (response && response.text) return this._aiCleanText(response.text);
    if (response && response.content) return this._aiCleanText(response.content);
    return this._aiCleanText(String(response));
  },

  _aiCleanText: function(text) {
    if (!text) return '';
    return String(text).replace(/\*\*/g, '').replace(/##/g, '').replace(/^#+\s/gm, '').trim();
  },

  aiCopyMessage: function(msgIndex) {
    var chat = this._aiGetCurrentChat();
    if (!chat || !chat.messages[msgIndex]) return;
    var text = chat.messages[msgIndex].text || '';
    var self = this;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (typeof showToast === 'function') showToast('📋 کپی شد!');
        if (typeof playSnd === 'function') playSnd('success');
        self.aiCopiedMsgId = msgIndex;
        self.refresh();
        setTimeout(function() {
          self.aiCopiedMsgId = null;
          self.refresh();
        }, 1500);
      }).catch(function() { self._aiFallbackCopy(text); });
    } else {
      this._aiFallbackCopy(text);
    }
  },

  _aiFallbackCopy: function(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (typeof showToast === 'function') showToast('📋 کپی شد!');
    } catch (e) {
      if (typeof showToast === 'function') showToast('❌ کپی نشد');
    }
  },

  _aiStartLongPress: function(msgIndex) {
    var self = this;
    this._aiLongPressTimer = setTimeout(function() {
      self.aiCopyMessage(msgIndex);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 600);
  },

  _aiCancelLongPress: function() {
    if (this._aiLongPressTimer) {
      clearTimeout(this._aiLongPressTimer);
      this._aiLongPressTimer = null;
    }
  },

  aiDownloadImage: function(msgIndex) {
    var chat = this._aiGetCurrentChat();
    if (!chat || !chat.messages[msgIndex]) return;
    var msg = chat.messages[msgIndex];
    if (!msg.imageUrl) return;

    var url = msg.imageUrl;
    if (url.indexOf('data:') === 0) {
      var a = document.createElement('a');
      a.href = url;
      a.download = 'setareh-' + Date.now() + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      fetch(url).then(function(r) { return r.blob(); }).then(function(blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'setareh-' + Date.now() + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }).catch(function() {
        window.open(url, '_blank');
      });
    }
    if (typeof playSnd === 'function') playSnd('success');
    if (typeof showToast === 'function') showToast('📥 دانلود شد');
  },

  aiDeleteChat: function(chatId) {
    if (!confirm('این چت حذف بشه؟')) return;
    this.aiChats = this.aiChats.filter(function(c) { return c.id !== chatId; });
    this._aiSaveChats();
    if (this.aiCurrentChatId === chatId) {
      this.aiCurrentChatId = null;
      this.aiView = 'list';
    }
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  aiRenameChat: function(chatId) {
    var chat = null;
    for (var i = 0; i < this.aiChats.length; i++) {
      if (this.aiChats[i].id === chatId) chat = this.aiChats[i];
    }
    if (!chat) return;
    var newName = prompt('نام جدید:', chat.title);
    if (!newName || !newName.trim()) return;
    chat.title = newName.trim();
    this._aiSaveChats();
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  aiToggleMenu: function() {
    this.aiMenuOpen = !this.aiMenuOpen;
    this.refresh();
  },

  _aiScrollToBottom: function() {
    setTimeout(function() {
      var el = document.getElementById('aiMessages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 150);
  },

  _aiFormatDate: function(ts) {
    var d = new Date(ts);
    var now = new Date();
    var diff = now - d;
    var day = 24 * 60 * 60 * 1000;
    if (diff < 60 * 1000) return 'همین الان';
    if (diff < 60 * 60 * 1000) {
      var mins = Math.floor(diff / 60000);
      return (typeof toFa === 'function' ? toFa(mins) : mins) + ' دقیقه پیش';
    }
    if (diff < day) {
      var hrs = Math.floor(diff / 3600000);
      return (typeof toFa === 'function' ? toFa(hrs) : hrs) + ' ساعت پیش';
    }
    if (diff < 2 * day) return 'دیروز';
    if (diff < 7 * day) {
      var days = Math.floor(diff / day);
      return (typeof toFa === 'function' ? toFa(days) : days) + ' روز پیش';
    }
    var m = d.getMonth() + 1;
    var dd = d.getDate();
    return (typeof toFa === 'function' ? toFa(dd) : dd) + '/' + (typeof toFa === 'function' ? toFa(m) : m);
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="qa-page">';

    html += '<div class="qa-topbar">';
    html += '<button class="qa-back" onclick="QA.back()">›</button>';
    html += '<div class="qa-title">❓ پرسش</div>';
    html += '</div>';

    html += '<div class="qa-tabs">';
    html += '<button class="qa-tab ' + (this.activeTab === 'questions' ? 'active' : '') + '" onclick="QA.setTab(\'questions\')">📚 سؤالات</button>';
    html += '<button class="qa-tab ' + (this.activeTab === 'ai' ? 'active' : '') + '" onclick="QA.setTab(\'ai\')">🤖 هوشمند</button>';
    html += '</div>';

    if (this.activeTab === 'questions') {
      html += this._renderQuestions();
    } else {
            html += this._renderAI();
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
      return '<div class="qa-empty"><div class="qa-empty-icon">🔍</div><div class="qa-empty-text">سؤالی پیدا نشد<br>یه عبارت دیگه امتحان کن</div></div>';
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
      html += '<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px;font-weight:700">و ' + (typeof toFa === 'function' ? toFa(filtered.length - maxShow) : (filtered.length - maxShow)) + ' سؤال دیگه</div>';
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

  // ========== رندر AI ==========
  _renderAI: function() {
    if (this.aiView === 'chat') return this._renderAIChat();
    return this._renderAIList();
  },

  _renderAIList: function() {
    var html = '';

    if (this.aiChats.length === 0) {
      html += '<div class="ai-empty">';
      html += '<div class="ai-empty-icon">🤖</div>';
      html += '<div class="ai-empty-text">هنوز چتی نداری<br>یه سؤال بپرس تا شروع کنیم!</div>';
      html += '<button class="ai-new-btn" style="margin:0 auto;padding:14px 28px;font-size:15px" onclick="QA.aiNewChat()">➕ چت جدید</button>';
      html += '</div>';
      return html;
    }

    html += '<div class="ai-chats-header">';
    html += '<div class="ai-chats-title">💬 چت‌های من (' + (typeof toFa === 'function' ? toFa(this.aiChats.length) : this.aiChats.length) + ')</div>';
    html += '<button class="ai-new-btn" onclick="QA.aiNewChat()">➕ چت جدید</button>';
    html += '</div>';

    html += '<div>';
    for (var i = 0; i < this.aiChats.length; i++) {
      var chat = this.aiChats[i];
      var lastMsg = '...';
      for (var j = chat.messages.length - 1; j >= 0; j--) {
        var m = chat.messages[j];
        if (m.text) { lastMsg = m.text; break; }
      }
      if (lastMsg.length > 50) lastMsg = lastMsg.substring(0, 50) + '...';

      html += '<div class="ai-chat-item" onclick="QA.aiOpenChat(' + chat.id + ')" style="animation-delay:' + (Math.min(i * 0.04, 0.3)) + 's">';
      html += '<div class="ai-chat-item-icon">🤖</div>';
      html += '<div class="ai-chat-item-info">';
      html += '<div class="ai-chat-item-title">' + this._escape(chat.title) + '</div>';
      html += '<div class="ai-chat-item-preview">' + this._escape(lastMsg) + ' • ' + this._aiFormatDate(chat.updatedAt) + '</div>';
      html += '</div>';
      html += '<div class="ai-chat-item-arrow">‹</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  },

  _renderAIChat: function() {
    var chat = this._aiGetCurrentChat();
    if (!chat) { this.aiView = 'list'; return this._renderAIList(); }

    var html = '<div class="ai-chat-page">';

    html += '<div class="ai-chat-topbar" style="position:relative">';
    html += '<button class="ai-chat-back" onclick="QA.aiBackToList()">›</button>';
    html += '<div class="ai-chat-title">' + this._escape(chat.title) + '</div>';
    html += '<button class="ai-chat-menu" onclick="QA.aiToggleMenu()">⋯</button>';
    if (this.aiMenuOpen) {
      html += '<div class="ai-menu-popup">';
      html += '<div class="ai-menu-item" onclick="QA.aiRenameChat(' + chat.id + ')">✏️ تغییر نام</div>';
      html += '<div class="ai-menu-item danger" onclick="QA.aiDeleteChat(' + chat.id + ')">🗑️ حذف چت</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="ai-messages" id="aiMessages">';
    for (var i = 0; i < chat.messages.length; i++) {
      var m = chat.messages[i];
      var cls = m.role === 'user' ? 'user' : 'ai';

      html += '<div class="ai-msg ' + cls + '"';
      html += ' ontouchstart="QA._aiStartLongPress(' + i + ')" ontouchend="QA._aiCancelLongPress()" ontouchmove="QA._aiCancelLongPress()"';
      html += ' onmousedown="QA._aiStartLongPress(' + i + ')" onmouseup="QA._aiCancelLongPress()" onmouseleave="QA._aiCancelLongPress()"';
      html += '>';

      if (m.uploadedImage) {
        html += '<img src="' + m.uploadedImage + '" style="max-width:100%;border-radius:12px;margin-bottom:8px;display:block" alt="uploaded">';
      }

      if (m.text) {
        html += '<div>' + this._escape(m.text) + '</div>';
      }

      if (m.imageUrl) {
        html += '<img src="' + m.imageUrl + '" style="max-width:100%;border-radius:12px;margin-top:8px;display:block" alt="generated">';
        html += '<button class="ai-download-btn" onclick="QA.aiDownloadImage(' + i + ')">📥 دانلود عکس</button>';
      }

      if (m.role === 'ai' && m.text && !m.imageUrl) {
        var isCopied = (this.aiCopiedMsgId === i);
        html += '<button class="ai-copy-btn" onclick="QA.aiCopyMessage(' + i + ')">' + (isCopied ? '✅ کپی شد' : '📋 کپی') + '</button>';
      }

      html += '</div>';
    }
    if (this.aiLoading) {
      html += '<div class="ai-msg ai typing">در حال فکر کردن...</div>';
    }
    html += '</div>';

    if (this.aiSelectedImage) {
      html += '<div class="ai-selected-image-preview">';
      html += '<img src="' + this.aiSelectedImage + '" alt="preview">';
      html += '<button class="ai-selected-image-remove" onclick="QA.aiRemoveSelectedImage()">✕</button>';
      html += '</div>';
    }

    html += '<div class="ai-input-box">';
    html += '<button class="ai-image-btn" onclick="QA.aiPickImage()" ' + (this.aiLoading ? 'disabled' : '') + '>📷</button>';
    html += '<textarea class="ai-input" id="aiInput" rows="1" placeholder="سؤالت رو بنویس..." ' + (this.aiLoading ? 'disabled' : '') + ' onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();QA.aiSendMessage();}"></textarea>';
    html += '<button class="ai-send-btn ' + (this.aiLoading ? 'loading' : '') + '" onclick="QA.aiSendMessage()" ' + (this.aiLoading ? 'disabled' : '') + '>📤</button>';
    html += '<input type="file" accept="image/*" id="aiImageInput" style="display:none" onchange="QA.aiHandleImage(event)">';
    html += '</div>';

    html += '</div>';
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
