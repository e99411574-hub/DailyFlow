// ===== tools/qa-ai.js - پرسش هوشمند پیشرفته =====
// قابلیت‌ها: چت متنی + تولید عکس + تحلیل عکس + کپی پیام

var QA_AI = {
  chats: [],
  currentChatId: null,
  view: 'list',
  loading: false,
  puterLoaded: false,
  menuOpen: false,
  selectedImage: null,
  copiedMsgId: null,

  // ========== شروع ==========
  start: function() {
    this._loadChats();
    this.view = 'list';
    this.currentChatId = null;
    this.loading = false;
    this.selectedImage = null;
    this.refresh();
  },

  // ========== ذخیره/بارگذاری ==========
  _loadChats: function() {
    try {
      var raw = localStorage.getItem('setareh_ai_chats_v2');
      this.chats = raw ? JSON.parse(raw) : [];
    } catch (e) { this.chats = []; }
  },

  _saveChats: function() {
    try {
      // محدود کردن عکس‌های ذخیره‌شده برای جلوگیری از پر شدن
      var toSave = this.chats.map(function(c) {
        return {
          id: c.id,
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messages: c.messages.slice(-50).map(function(m) {
            var copy = { role: m.role, text: m.text || '', type: m.type || 'text' };
            // اگه عکس تولیدی بود، فقط URL رو نگه دار
            if (m.imageUrl) copy.imageUrl = m.imageUrl;
            // عکس آپلودی رو ذخیره نکن (حجم زیاد)
            if (m.uploadedImage) copy.uploadedImage = null;
            return copy;
          })
        };
      });
      localStorage.setItem('setareh_ai_chats_v2', JSON.stringify(toSave));
    } catch (e) {
      console.warn('localStorage full:', e);
    }
  },

  // ========== چت جدید ==========
  newChat: function() {
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
    this.chats.unshift(chat);
    this._saveChats();
    this.currentChatId = chat.id;
    this.view = 'chat';
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  openChat: function(chatId) {
    this.currentChatId = chatId;
    this.view = 'chat';
    this.menuOpen = false;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
    this._scrollToBottom();
  },

  backToList: function() {
    this.view = 'list';
    this.currentChatId = null;
    this.menuOpen = false;
    this.selectedImage = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  _getCurrentChat: function() {
    for (var i = 0; i < this.chats.length; i++) {
      if (this.chats[i].id === this.currentChatId) return this.chats[i];
    }
    return null;
  },

  // ========== انتخاب عکس ==========
  pickImage: function() {
    document.getElementById('aiImageInput').click();
  },

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
      self.selectedImage = e.target.result;
      if (typeof playSnd === 'function') playSnd('success');
      self.refresh();
    };
    reader.readAsDataURL(file);
  },

  removeSelectedImage: function() {
    this.selectedImage = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== ارسال پیام ==========
  sendMessage: function() {
    if (this.loading) return;
    var input = document.getElementById('aiInput');
    if (!input) return;
    var text = input.value.trim();
    var hasImage = !!this.selectedImage;

    if (!text && !hasImage) return;

    var chat = this._getCurrentChat();
    if (!chat) return;

    // اضافه کردن پیام کاربر
    var userMsg = {
      role: 'user',
      text: text || '📷 [عکس]',
      type: hasImage ? 'image' : 'text'
    };
    if (hasImage) userMsg.uploadedImage = this.selectedImage;
    chat.messages.push(userMsg);
    chat.updatedAt = Date.now();

    // عنوان چت
    if (chat.title === 'چت جدید' && text) {
      chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    } else if (chat.title === 'چت جدید' && hasImage) {
      chat.title = '📷 تحلیل عکس';
    }

    var imageData = this.selectedImage;
    input.value = '';
    this.selectedImage = null;
    this._saveChats();
    this.refresh();
    this._scrollToBottom();

    // لودینگ
    this.loading = true;
    this.refresh();
    this._scrollToBottom();

    // ارسال به AI
    var self = this;
    this._askAI(text, imageData).then(function(answer) {
      if (answer.type === 'image') {
        // جواب شامل عکس
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
      self.loading = false;
      self._saveChats();
      self.refresh();
      self._scrollToBottom();
      if (typeof playSnd === 'function') playSnd('success');
    }).catch(function(err) {
      console.error('AI error:', err);
      var errMsg = '❌ خطا در ارتباط با هوش مصنوعی.';
      if (err.message) {
        if (err.message.indexOf('auth') >= 0 || err.message.indexOf('sign') >= 0) {
          errMsg += '\nلطفاً دوباره امتحان کن (شاید لازم باشه وارد بشی).';
        } else {
          errMsg += '\n' + err.message;
        }
      } else {
        errMsg += '\nدوباره تلاش کن.';
      }
      chat.messages.push({ role: 'ai', text: errMsg, type: 'text' });
      self.loading = false;
      self._saveChats();
      self.refresh();
      self._scrollToBottom();
    });
  },

  // ========== ارتباط با AI ==========
  _askAI: function(text, imageData) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self._loadPuter().then(function() {
        // اگه عکس داشت
        if (imageData) {
          self._callPuterVision(text, imageData).then(resolve).catch(reject);
          return;
        }
        // اگه کاربر خواست عکس بسازه
        if (self._isImageRequest(text)) {
          self._generateImage(text).then(resolve).catch(reject);
          return;
        }
        // چت معمولی
        self._callPuterChat(text).then(resolve).catch(reject);
      }).catch(reject);
    });
  },

  // تشخیص درخواست عکس
  _isImageRequest: function(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var keys = [
      'عکس بساز', 'عکس بکش', 'تصویر بساز', 'تصویر بکش',
      'نقاشی بکش', 'یه عکس از', 'یک عکس از',
      'generate image', 'create image', 'draw'
    ];
    for (var i = 0; i < keys.length; i++) {
      if (lower.indexOf(keys[i]) >= 0) return true;
    }
    return false;
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
      script.onerror = function() { reject(new Error('خطا در اتصال به AI')); };
      document.head.appendChild(script);
    });
  },

  // ========== چت متنی ==========
  _callPuterChat: function(prompt) {
    var self = this;
    return new Promise(function(resolve, reject) {
      try {
        var chat = self._getCurrentChat();
        var messages = [];
        if (chat) {
          for (var i = 0; i < chat.messages.length; i++) {
            var m = chat.messages[i];
            if (m.type === 'image' || (m.text && m.text.indexOf('❌') === 0)) continue;
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
            var text = self._extractText(response);
            resolve({ type: 'text', text: text || 'متأسفانه جوابی دریافت نشد.' });
          })
          .catch(reject);
      } catch (e) { reject(e); }
    });
  },

  // ========== تحلیل عکس (Vision) ==========
  _callPuterVision: function(prompt, imageData) {
    var self = this;
    return new Promise(function(resolve, reject) {
      try {
        var finalPrompt = prompt || 'این عکس چیه؟ توضیح بده.';
        var askText = 'لطفاً این عکس رو تحلیل کن. اگه متن یا سؤالی توش هست، متن رو بخون و به سؤال جواب بده. به فارسی جواب بده.\n\nپیام کاربر: ' + finalPrompt;

        puter.ai.chat(askText, imageData, { model: 'gpt-4o-mini' })
          .then(function(response) {
            var text = self._extractText(response);
            resolve({ type: 'text', text: text || 'نتونستم عکس رو تحلیل کنم.' });
          })
          .catch(function(err) {
            // اگه مدل vision کار نکرد، سعی کن به عنوان متن عادی
            reject(new Error('تحلیل عکس: ' + (err.message || 'خطا')));
          });
      } catch (e) { reject(e); }
    });
  },

  // ========== تولید عکس ==========
  _generateImage: function(prompt) {
    var self = this;
    return new Promise(function(resolve, reject) {
      try {
        // تمیز کردن پرامپت
        var cleanPrompt = prompt
          .replace(/عکس بساز/g, '')
          .replace(/عکس بکش/g, '')
          .replace(/تصویر بساز/g, '')
          .replace(/تصویر بکش/g, '')
          .replace(/نقاشی بکش/g, '')
          .replace(/یه عکس از/g, '')
          .replace(/یک عکس از/g, '')
          .replace(/generate image/gi, '')
          .replace(/create image/gi, '')
          .replace(/draw/gi, '')
          .trim();

        if (!cleanPrompt) cleanPrompt = prompt;

        // نمایش پیام موقت
        var tempMsgId = 'temp-' + Date.now();
        var chat = self._getCurrentChat();
        if (chat) {
          chat.messages.push({
            role: 'ai',
            text: '🎨 دارم عکس رو می‌سازم... (ممکنه ۱۰ تا ۳۰ ثانیه طول بکشه)',
            type: 'text',
            tempId: tempMsgId
          });
          self.refresh();
          self._scrollToBottom();
        }

        puter.ai.txt2img(cleanPrompt)
          .then(function(imageElement) {
            // imageElement می‌تونه <img> یا URL باشه
            var imgUrl = '';
            if (typeof imageElement === 'string') {
              imgUrl = imageElement;
            } else if (imageElement && imageElement.src) {
              imgUrl = imageElement.src;
            } else if (imageElement && imageElement.tagName === 'IMG') {
              imgUrl = imageElement.src;
            } else {
              imgUrl = String(imageElement);
            }

            // حذف پیام موقت
            if (chat) {
              chat.messages = chat.messages.filter(function(m) {
                return m.tempId !== tempMsgId;
              });
            }

            resolve({
              type: 'image',
              imageUrl: imgUrl,
              caption: '🎨 این عکس رو برات ساختم:'
            });
          })
          .catch(function(err) {
            // حذف پیام موقت
            if (chat) {
              chat.messages = chat.messages.filter(function(m) {
                return m.tempId !== tempMsgId;
              });
            }
            reject(new Error('تولید عکس: ' + (err.message || 'خطا')));
          });
      } catch (e) { reject(e); }
    });
  },

  // ========== استخراج متن از پاسخ ==========
  _extractText: function(response) {
    if (typeof response === 'string') return response;
    if (response && response.message && response.message.content) {
      return this._cleanText(response.message.content);
    }
    if (response && response.text) return this._cleanText(response.text);
    if (response && response.content) return this._cleanText(response.content);
    return this._cleanText(String(response));
  },

  _cleanText: function(text) {
    if (!text) return '';
    return String(text)
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/^#+\s/gm, '')
      .trim();
  },

  // ========== کپی پیام ==========
  copyMessage: function(msgIndex) {
    var chat = this._getCurrentChat();
    if (!chat || !chat.messages[msgIndex]) return;
    var text = chat.messages[msgIndex].text || '';

    var self = this;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (typeof showToast === 'function') showToast('📋 کپی شد!');
        if (typeof playSnd === 'function') playSnd('success');
        self.copiedMsgId = msgIndex;
        self.refresh();
        setTimeout(function() {
          self.copiedMsgId = null;
          self.refresh();
        }, 1500);
      }).catch(function() { self._fallbackCopy(text); });
    } else {
      this._fallbackCopy(text);
    }
  },

  _fallbackCopy: function(text) {
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

  // ========== Long Press روی پیام ==========
  _startLongPress: function(msgIndex) {
    var self = this;
    this._longPressTimer = setTimeout(function() {
      self.copyMessage(msgIndex);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 600);
  },

  _cancelLongPress: function() {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  },

  // ========== دانلود عکس ==========
  downloadImage: function(msgIndex) {
    var chat = this._getCurrentChat();
    if (!chat || !chat.messages[msgIndex]) return;
    var msg = chat.messages[msgIndex];
    if (!msg.imageUrl) return;

    var url = msg.imageUrl;
    if (url.indexOf('data:') === 0) {
      // عکس base64 — از لینک دانلود مستقیم استفاده کن
      var a = document.createElement('a');
      a.href = url;
      a.download = 'setareh-' + Date.now() + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // عکس URL — از fetch استفاده کن
      fetch(url)
        .then(function(r) { return r.blob(); })
        .then(function(blob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'setareh-' + Date.now() + '.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
        })
        .catch(function() {
          // اگه fetch کار نکرد، لینک مستقیم
          window.open(url, '_blank');
        });
    }

    if (typeof playSnd === 'function') playSnd('success');
    if (typeof showToast === 'function') showToast('📥 دانلود شد');
  },

  // ========== حذف و تغییر نام ==========
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

  _toggleChatMenu: function() {
    this.menuOpen = !this.menuOpen;
    this.refresh();
  },

  closeMenu: function() {
    this.menuOpen = false;
    this.refresh();
  },

  // ========== اسکرول ==========
  _scrollToBottom: function() {
    setTimeout(function() {
      var el = document.getElementById('aiMessages');
      if (el) el.scrollTop = el.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    }, 150);
  },

  // ========== تاریخ ==========
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
      var lastMsg = '...';
      for (var j = chat.messages.length - 1; j >= 0; j--) {
        var m = chat.messages[j];
        if (m.role === 'ai' && m.text) { lastMsg = m.text; break; }
        if (m.role === 'user' && m.text) { lastMsg = m.text; break; }
      }
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

  _renderChat: function() {
    var chat = this._getCurrentChat();
    if (!chat) { this.view = 'list'; return this._renderList(); }

    var html = '<div class="ai-chat-page">';

    // نوار بالا
    html += '<div class="ai-chat-topbar" style="position:relative">';
    html += '<button class="ai-chat-back" onclick="QA_AI.backToList()">›</button>';
    html += '<div class="a
