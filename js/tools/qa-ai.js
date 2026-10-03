// ===== tools/qa-ai.js - پرسش هوشمند با Puter.js =====

var QA_AI = {
  chats: [],              // لیست چت‌ها
  currentChatId: null,    // چت بازشده
  view: 'list',           // 'list' | 'chat'
  loading: false,         // در حال دریافت پاسخ
  puterLoaded: false,     // آیا puter.js لود شده
  puterReady: false,      // آیا کاربر sign in کرده

  // ========== شروع ==========
  start: function() {
    this._loadChats();
    this.view = 'list';
    this.currentChatId = null;
    this.loading = false;
    this.refresh();
  },

  // ========== بارگذاری چت‌ها ==========
  _loadChats: function() {
    try {
      var raw = localStorage.getItem('setareh_ai_chats');
      this.chats = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.chats = [];
    }
  },

  _saveChats: function() {
    try {
      localStorage.setItem('setareh_ai_chats', JSON.stringify(this.chats));
    } catch (e) {}
  },

  // ========== چت جدید ==========
  newChat: function() {
    var chat = {
      id: Date.now() + Math.random(),
      title: 'چت جدید',
      messages: [
        {
          role: 'ai',
          text: 'سلام! 👋 من دستیار هوشمند ستاره هستم. چطور می‌تونم کمکت کنم؟'
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.chats.unshift(chat);
    this._saveChats();
    this.currentChatId = chat.id;
    this.view = 'chat';
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== باز کردن چت ==========
  openChat: function(chatId) {
    this.currentChatId = chatId;
    this.view = 'chat';
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== بازگشت به لیست ==========
  backToList: function() {
    this.view = 'list';
    this.currentChatId = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== گرفتن چت فعلی ==========
  _getCurrentChat: function() {
    for (var i = 0; i < this.chats.length; i++) {
      if (this.chats[i].id === this.currentChatId) return this.chats[i];
    }
    return null;
  },

  // ========== ارسال پیام ==========
  sendMessage: function() {
    if (this.loading) return;
    var input = document.getElementById('aiInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    var chat = this._getCurrentChat();
    if (!chat) return;

    // اضافه کردن پیام کاربر
    chat.messages.push({ role: 'user', text: text });
    chat.updatedAt = Date.now();

    // اگه اولین پیام کاربره، عنوان رو تغییر بده
    if (chat.title === 'چت جدید') {
      chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    input.value = '';
    this._saveChats();
    this.refresh();
    this._scrollToBottom();

    // شروع لودینگ
    this.loading = true;
    this.refresh();
    this._scrollToBottom();

    // ارسال به AI
    var self = this;
    this._askAI(text).then(function(answer) {
      chat.messages.push({ role: 'ai', text: answer });
      chat.updatedAt = Date.now();
      self.loading = false;
      self._saveChats();
      self.refresh();
      self._scrollToBottom();
      if (typeof playSnd === 'function') playSnd('success');
    }).catch(function(err) {
      console.error('AI error:', err);
      var errMsg = '❌ خطا در ارتباط با هوش مصنوعی.\n';
      if (err.message && err.message.indexOf('auth') >= 0) {
        errMsg += 'لطفاً دوباره امتحان کن (شاید لازم باشه وارد بشی).';
      } else {
        errMsg += 'دوباره تلاش کن.';
      }
      chat.messages.push({ role: 'ai', text: errMsg });
      self.loading = false;
      self._saveChats();
      self.refresh();
      self._scrollToBottom();
    });
  },

  // ========== ارتباط با AI ==========
  _askAI: function(prompt) {
    var self = this;
    return new Promise(function(resolve, reject) {
      // لود کردن Puter.js اگه لود نشده
      if (typeof puter === 'undefined') {
        self._loadPuter().then(function() {
          self._callPuter(prompt).then(resolve).catch(reject);
        }).catch(reject);
      } else {
        self._callPuter(prompt).then(resolve).catch(reject);
      }
    });
  },

  _loadPuter: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (self.puterLoaded || typeof puter !== 'undefined') {
        self.puterLoaded = true;
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = function() {
        self.puterLoaded = true;
        resolve();
      };
      script.onerror = function() {
        reject(new Error('خطا در لود Puter.js'));
      };
      document.head.appendChild(script);
    });
  },

  _callPuter: function(prompt) {
    var self = this;
    return new Promise(function(resolve, reject) {
      try {
        // پیام‌های چت رو برای context به Puter بفرستیم
        var chat = self._getCurrentChat();
        var messages = [];
        if (chat) {
          for (var i = 0; i < chat.messages.length; i++) {
            var m = chat.messages[i];
            if (m.text && m.text.length > 0 && !m.text.startsWith('❌')) {
              messages.push({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.text
              });
            }
          }
        }

        // پرامپت سیستمی برای فارسی
        var systemMsg = {
          role: 'system',
          content: 'تو یک دستیار هوشمند فارسی‌زبان هستی به نام «ستاره». همیشه به فارسی روان و دوستانه جواب بده. جواب‌هات مختصر و مفید باشه.'
        };

        puter.ai.chat(messages, { model: 'gpt-4o-mini' })
          .then(function(response) {
            var text = '';
            if (typeof response === 'string') text = response;
            else if (response && response.message && response.message.content) {
              text = response.message.content;
            } else if (response && response.text) {
              text = response.text;
            } else if (response && response.content) {
              text = response.content;
            } else {
              text = String(response);
            }
            // تمیزکاری متن
            text = text.replace(/\*\*/g, '').replace(/##/g, '').trim();
            resolve(text || 'متأسفانه جوابی دریافت نشد.');
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  },

  // ========== حذف چت ==========
  deleteChat: function(chatId) {
    if (!confirm('این چت حذف بشه؟')) return;
    this.chats = this.chats.filter(function(c) { return c.id !== chatId; });
    this._saveChats();
    if (this.currentChatId === chatId) {
      this.currentChatId = null;
      this.view = 'list';
    }
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== تغییر نام چت ==========
  renameChat: function(chatId) {
    var chat = null;
    for (var i = 0; i < this.chats.length; i++) {
      if (this.chats[i].id === chatId) chat = this.chats[i];
    }
    if (!chat) return;
    var newName = prompt('نام جدید:', chat.title);
    if (!newName || !newName.trim()) return;
    chat.title = newName.trim();
    this._saveChats();
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== پاک کردن همه چت‌ها ==========
  clearAllChats: function() {
    if (!confirm('همهٔ چت‌ها حذف بشن؟')) return;
    this.chats = [];
    this._saveChats();
    this.view = 'list';
    this.currentChatId = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== اسکرول به پایین ==========
  _scrollToBottom: function() {
    setTimeout(function() {
      var el = document.getElementById('aiMessages');
      if (el) el.scrollTop = el.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  },

  // ========== فرمت تاریخ ==========
  _formatDate: function(ts) {
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
    if (this.view === 'chat') return this._renderChat();
    return this._renderList();
  },

  // ========== لیست چت‌ها ==========
  _renderList: function() {
    var html = '';

    if (this.chats.length === 0) {
      html += '<div class="ai-empty">';
      html += '<div class="ai-empty-icon">🤖</div>';
      html += '<div class="ai-empty-text">هنوز چتی نداری<br>یه سؤال بپرس تا شروع کنیم!</div>';
      html += '<button class="ai-new-btn" style="margin:0 auto;padding:14px 28px;font-size:15px" onclick="QA_AI.newChat()">➕ چت جدید</button>';
      html += '</div>';
      return html;
    }

    html += '<div class="ai-chats-header">';
    html += '<div class="ai-chats-title">💬 چت‌های من (' + (typeof toFa === 'function' ? toFa(this.chats.length) : this.chats.length) + ')</div>';
    html += '<button class="ai-new-btn" onclick="QA_AI.newChat()">➕ چت جدید</button>';
    html += '</div>';

    html += '<div>';
    for (var i = 0; i < this.chats.length; i++) {
      var chat = this.chats[i];
      var lastMsg = '';
      for (var j = chat.messages.length - 1; j >= 0; j--) {
        if (chat.messages[j].role === 'ai') {
          lastMsg = chat.messages[j].text;
          break;
        }
      }
      if (!lastMsg) lastMsg = '...';
      if (lastMsg.length > 50) lastMsg = lastMsg.substring(0, 50) + '...';

      html += '<div class="ai-chat-item" onclick="QA_AI.openChat(' + chat.id + ')" style="animation-delay:' + (Math.min(i * 0.04, 0.3)) + 's">';
      html += '<div class="ai-chat-item-icon">🤖</div>';
      html += '<div class="ai-chat-item-info">';
      html += '<div class="ai-chat-item-title">' + this._escape(chat.title) + '</div>';
      html += '<div class="ai-chat-item-preview">' + this._escape(lastMsg) + ' • ' + this._formatDate(chat.updatedAt) + '</div>';
      html += '</div>';
      html += '<div class="ai-chat-item-arrow">‹</div>';
      html += '</div>';
    }
    html += '</div>';

    return html;
  },

  // ========== صفحهٔ چت ==========
  _renderChat: function() {
    var chat = this._getCurrentChat();
    if (!chat) {
      this.view = 'list';
      return this._renderList();
    }

    var html = '<div class="ai-chat-page">';

    // نوار بالا
    html += '<div class="ai-chat-topbar" style="position:relative">';
    html += '<button class="ai-chat-back" onclick="QA_AI.backToList()">›</button>';
    html += '<div class="ai-chat-title">' + this._escape(chat.title) + '</div>';
    html += '<button class="ai-chat-menu" onclick="QA_AI._toggleChatMenu()">⋯</button>';
    html += '</div>';

    // منوی ⋯
    html += '<div id="aiChatMenu" style="display:none">';
    html += '<div class="ai-menu-popup">';
    html += '<div class="ai-menu-item" onclick="QA_AI.renameChat(' + chat.id + ')">✏️ تغییر نام</div>';
    html += '<div class="ai-menu-item danger" onclick="QA_AI.deleteChat(' + chat.id + ')">🗑️ حذف چت</div>';
    html += '</div>';
    html += '</div>';

    // پیام‌ها
    html += '<div class="ai-messages" id="aiMessages">';
    for (var i = 0; i < chat.messages.length; i++) {
      var m = chat.messages[i];
      var cls = m.role === 'user' ? 'user' : 'ai';
      html += '<div class="ai-msg ' + cls + '">' + this._escape(m.text) + '</div>';
    }
    if (this.loading) {
      html += '<div class="ai-msg ai typing">در حال فکر کردن...</div>';
    }
    html += '</div>';

    // input
    html += '<div class="ai-input-box">';
    html += '<textarea class="ai-input" id="aiInput" rows="1" placeholder="سؤالت رو بنویس..." ' + (this.loading ? 'disabled' : '') + ' onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();QA_AI.sendMessage();}"></textarea>';
    html += '<button class="ai-send-btn ' + (this.loading ? 'loading' : '') + '" onclick="QA_AI.sendMessage()" ' + (this.loading ? 'disabled' : '') + '>📤</button>';
    html += '</div>';

    html += '</div>';
    return html;
  },

  _toggleChatMenu: function() {
    var menu = document.getElementById('aiChatMenu');
    if (!menu) return;
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    // بستن با کلیک بیرون
    if (menu.style.display === 'block') {
      setTimeout(function() {
        document.addEventListener('click', QA_AI._closeMenuOutside, { once: true });
      }, 100);
    }
  },

  _closeMenuOutside: function(e) {
    var menu = document.getElementById('aiChatMenu');
    if (menu && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  },

  // ========== امن‌سازی ==========
  _escape: function(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  // ========== بروزرسانی ==========
  refresh: function() {
    // فقط محتوای تب AI رو آپدیت کن
    var container = document.getElementById('qaAiContent');
    if (container) {
      container.innerHTML = this.render();
    } else {
      // اگه container نبود، کل QA رو دوباره رندر کن
      if (typeof QA !== 'undefined' && QA.refresh) QA.refresh();
    }
  }
};

window.QA_AI = QA_AI;
