// ===== tools/planner.js - برنامه روزانه و هفتگی =====

var PLANNER = {
  activeTab: 'daily',      // 'daily' یا 'weekly'
  daily: [],               // کارهای امروز
  weekly: {},              // { shanbe: [...], yekshanbe: [...] }
  editingId: null,         // id کار در حال ویرایش
  addingTo: null,          // 'daily' یا 'shanbe', ...
  formData: { time: '', title: '' },

  days: [
    { id: 'shanbe',    name: 'شنبه',    icon: '📌' },
    { id: 'yekshanbe', name: 'یکشنبه',  icon: '📌' },
    { id: 'doshanbe',  name: 'دوشنبه',  icon: '📌' },
    { id: 'seshanbe',  name: 'سه‌شنبه', icon: '📌' },
    { id: 'chaharshanbe', name: 'چهارشنبه', icon: '📌' },
    { id: 'panjshanbe', name: 'پنجشنبه', icon: '📌' },
    { id: 'jome',      name: 'جمعه',    icon: '📌' }
  ],

  // ========== شروع ==========
  start: function() {
    this._load();
    this.activeTab = 'daily';
    this.refresh();
    if (typeof playSnd === 'function') playSnd('tap');
  },

  // ========== بارگذاری از localStorage ==========
  _load: function() {
    try {
      var d = localStorage.getItem('setareh_planner_daily');
      this.daily = d ? JSON.parse(d) : [];

      var w = localStorage.getItem('setareh_planner_weekly');
      this.weekly = w ? JSON.parse(w) : {};
      // مطمئن شو همهٔ روزها وجود دارن
      for (var i = 0; i < this.days.length; i++) {
        if (!this.weekly[this.days[i].id]) this.weekly[this.days[i].id] = [];
      }
    } catch (e) {
      this.daily = [];
      this.weekly = {};
      for (var j = 0; j < this.days.length; j++) {
        this.weekly[this.days[j].id] = [];
      }
    }
  },

  _saveDaily: function() {
    try {
      localStorage.setItem('setareh_planner_daily', JSON.stringify(this.daily));
    } catch (e) {}
  },

  _saveWeekly: function() {
    try {
      localStorage.setItem('setareh_planner_weekly', JSON.stringify(this.weekly));
    } catch (e) {}
  },

  // ========== تب ==========
  setTab: function(tab) {
    this.activeTab = tab;
    this.addingTo = null;
    this.editingId = null;
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  // ========== تاریخ امروز (شمسی ساده) ==========
  _getTodayName: function() {
    var d = new Date();
    var day = d.getDay(); // 0=Sun, 6=Sat
    // نگاشت به روزهای هفته ایرانی
    var map = ['yekshanbe', 'doshanbe', 'seshanbe', 'chaharshanbe', 'panjshanbe', 'jome', 'shanbe'];
    return map[day];
  },

  _getTodayLabel: function() {
    var d = new Date();
    var dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    var months = ['ژانویه', 'فوریه', 'مارس', 'آپریل', 'می', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'];
    return dayNames[d.getDay()] + ' — ' + (typeof toFa === 'function' ? toFa(d.getDate()) : d.getDate()) + ' ' + months[d.getMonth()];
  },

  // ========== افزودن ==========
  startAdd: function(target) {
    this.addingTo = target;
    this.editingId = null;
    this.formData = { time: '', title: '' };
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
    setTimeout(function() {
      var inp = document.getElementById('plannerTitleInput');
      if (inp) inp.focus();
    }, 100);
  },

  cancelAdd: function() {
    this.addingTo = null;
    this.editingId = null;
    this.formData = { time: '', title: '' };
    this.refresh();
  },

  updateFormData: function(field, value) {
    this.formData[field] = value;
  },

  saveAdd: function() {
    var title = this.formData.title.trim();
    var time = this.formData.time.trim();
    if (!title) {
      if (typeof playSnd === 'function') playSnd('error');
      if (typeof showToast === 'function') showToast('❌ عنوان را وارد کن');
      return;
    }

    var item = {
      id: Date.now() + Math.random(),
      time: time,
      title: title,
      done: false,
      createdAt: Date.now()
    };

    if (this.addingTo === 'daily') {
      this.daily.push(item);
      this._saveDaily();
    } else {
      if (!this.weekly[this.addingTo]) this.weekly[this.addingTo] = [];
      this.weekly[this.addingTo].push(item);
      this._saveWeekly();
    }

    this.addingTo = null;
    this.formData = { time: '', title: '' };
    if (typeof playSnd === 'function') playSnd('success');
    if (typeof showToast === 'function') showToast('✅ اضافه شد');
    this.refresh();
  },

  // ========== ویرایش ==========
  startEdit: function(itemId, dayId) {
    var item = this._findItem(itemId, dayId);
    if (!item) return;
    this.editingId = itemId;
    this.addingTo = dayId || 'daily';
    this.formData = { time: item.time || '', title: item.title || '' };
    if (typeof playSnd === 'function') playSnd('tap');
    this.refresh();
  },

  saveEdit: function() {
    var title = this.formData.title.trim();
    var time = this.formData.time.trim();
    if (!title) {
      if (typeof playSnd === 'function') playSnd('error');
      if (typeof showToast === 'function') showToast('❌ عنوان را وارد کن');
      return;
    }

    var list = (this.addingTo === 'daily') ? this.daily : (this.weekly[this.addingTo] || []);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === this.editingId) {
        list[i].title = title;
        list[i].time = time;
        break;
      }
    }

    if (this.addingTo === 'daily') this._saveDaily();
    else this._saveWeekly();

    this.editingId = null;
    this.addingTo = null;
    this.formData = { time: '', title: '' };
    if (typeof playSnd === 'function') playSnd('success');
    if (typeof showToast === 'function') showToast('✅ ویرایش شد');
    this.refresh();
  },

  // ========== حذف ==========
  deleteItem: function(itemId, dayId) {
    var target = dayId || 'daily';
    if (target === 'daily') {
      this.daily = this.daily.filter(function(x) { return x.id !== itemId; });
      this._saveDaily();
    } else {
      this.weekly[target] = (this.weekly[target] || []).filter(function(x) { return x.id !== itemId; });
      this._saveWeekly();
    }
    if (typeof playSnd === 'function') playSnd('tap');
    if (typeof showToast === 'function') showToast('🗑️ حذف شد');
    this.refresh();
  },

  // ========== تیک ==========
  toggleDone: function(itemId, dayId) {
    var target = dayId || 'daily';
    var list = (target === 'daily') ? this.daily : (this.weekly[target] || []);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === itemId) {
        list[i].done = !list[i].done;
        break;
      }
    }
    if (target === 'daily') this._saveDaily();
    else this._saveWeekly();

    if (typeof playSnd === 'function') playSnd('success');
    this.refresh();
  },

  _findItem: function(itemId, dayId) {
    var target = dayId || 'daily';
    var list = (target === 'daily') ? this.daily : (this.weekly[target] || []);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === itemId) return list[i];
    }
    return null;
  },

  // ========== مرتب‌سازی بر اساس ساعت ==========
  _sortList: function(list) {
    return list.slice().sort(function(a, b) {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  },

  // ========== رندر ==========
  render: function() {
    var html = '<div class="planner-page">';

    // نوار بالا
    html += '<div class="planner-topbar">';
    html += '<button class="planner-back" onclick="PLANNER.back()">›</button>';
    html += '<div class="planner-title">📅 برنامه‌ریزی</div>';
    html += '</div>';

    // تب‌ها
    html += '<div class="planner-tabs">';
    html += '<button class="planner-tab ' + (this.activeTab === 'daily' ? 'active' : '') + '" onclick="PLANNER.setTab(\'daily\')">📅 روزانه</button>';
    html += '<button class="planner-tab ' + (this.activeTab === 'weekly' ? 'active' : '') + '" onclick="PLANNER.setTab(\'weekly\')">📆 هفتگی</button>';
    html += '</div>';

    // محتوا
    if (this.activeTab === 'daily') {
      html += this._renderDaily();
    } else {
      html += this._renderWeekly();
    }

    html += '</div>';
    return html;
  },

  // ========== روزانه ==========
  _renderDaily: function() {
    var html = '';
    var todayLabel = this._getTodayLabel();
    var sorted = this._sortList(this.daily);
    var total = this.daily.length;
    var done = this.daily.filter(function(x) { return x.done; }).length;
    var percent = total > 0 ? Math.round((done / total) * 100) : 0;

    html += '<div class="planner-day-card">';
    html += '<div class="planner-day-header">';
    html += '<div>';
    html += '<div class="planner-day-name"><span class="icon">📅</span>امروز</div>';
    html += '<div class="planner-day-date">' + todayLabel + '</div>';
    html += '</div>';
    html += '<div class="planner-day-badge">' + (typeof toFa === 'function' ? toFa(done) : done) + ' / ' + (typeof toFa === 'function' ? toFa(total) : total) + '</div>';
    html += '</div>';

    // نوار پیشرفت
    if (total > 0) {
      html += '<div class="planner-progress">';
      html += '<div class="planner-progress-bar"><div class="planner-progress-fill" style="width:' + percent + '%"></div></div>';
      html += '<div class="planner-progress-text"><span>پیشرفت</span><span>' + (typeof toFa === 'function' ? toFa(percent) : percent) + '٪</span></div>';
      html += '</div>';
    }

    // کارها
    if (sorted.length === 0 && this.addingTo !== 'daily') {
      html += '<div class="planner-empty">';
      html += '<div class="planner-empty-icon">📝</div>';
      html += '<div class="planner-empty-text">هنوز کاری نداری — یه کار اضافه کن!</div>';
      html += '</div>';
    } else {
      for (var i = 0; i < sorted.length; i++) {
        if (this.editingId === sorted[i].id) {
          html += this._renderEditForm();
        } else {
          html += this._renderItem(sorted[i], 'daily');
        }
      }
    }

    // فرم افزودن
    if (this.addingTo === 'daily' && this.editingId === null) {
      html += this._renderAddForm();
    } else if (this.addingTo !== 'daily') {
      html += '<button class="planner-add-btn" onclick="PLANNER.startAdd(\'daily\')">➕ افزودن کار</button>';
    }

    html += '</div>';

    // آمار روزانه
    html += this._renderDailyStats();
    return html;
  },

  // ========== هفتگی ==========
  _renderWeekly: function() {
    var html = '';

    for (var d = 0; d < this.days.length; d++) {
      var day = this.days[d];
      var list = this.weekly[day.id] || [];
      var sorted = this._sortList(list);
      var done = list.filter(function(x) { return x.done; }).length;
      var total = list.length;

      html += '<div class="planner-day-card" style="animation-delay:' + (d * 0.05) + 's">';
      html += '<div class="planner-day-header">';
      html += '<div class="planner-day-name"><span class="icon">' + day.icon + '</span>' + day.name + '</div>';
      if (total > 0) {
        html += '<div class="planner-day-badge">' + (typeof toFa === 'function' ? toFa(done) : done) + ' / ' + (typeof toFa === 'function' ? toFa(total) : total) + '</div>';
      }
      html += '</div>';

      // کارهای این روز
      if (sorted.length === 0 && this.addingTo !== day.id) {
        // خالی
      } else {
        for (var i = 0; i < sorted.length; i++) {
          if (this.editingId === sorted[i].id) {
            html += this._renderEditForm();
          } else {
            html += this._renderItem(sorted[i], day.id);
          }
        }
      }

      // فرم افزودن
      if (this.addingTo === day.id && this.editingId === null) {
        html += this._renderAddForm();
      } else if (this.addingTo !== day.id) {
        html += '<button class="planner-add-btn" onclick="PLANNER.startAdd(\'' + day.id + '\')">➕ افزودن</button>';
      }

      html += '</div>';
    }

    // آمار هفتگی
    html += this._renderWeeklyStats();
    return html;
  },

  // ========== آیتم ==========
  _renderItem: function(item, dayId) {
    var html = '<div class="planner-item ' + (item.done ? 'done' : '') + '">';
    html += '<div class="planner-check ' + (item.done ? 'checked' : '') + '" onclick="PLANNER.toggleDone(' + item.id + ', \'' + dayId + '\')">✓</div>';
    html += '<div class="planner-item-info">';
    if (item.time) {
      html += '<div class="planner-item-time">🕐 ' + (typeof toFa === 'function' ? toFa(item.time) : item.time) + '</div>';
    }
    html += '<div class="planner-item-title">' + this._escape(item.title) + '</div>';
    html += '</div>';
    html += '<div class="planner-item-actions">';
    html += '<button class="planner-icon-btn" onclick="PLANNER.startEdit(' + item.id + ', \'' + dayId + '\')">✏️</button>';
    html += '<button class="planner-icon-btn" onclick="PLANNER.deleteItem(' + item.id + ', \'' + dayId + '\')">🗑️</button>';
    html += '</div>';
    html += '</div>';
    return html;
  },

  // ========== فرم افزودن ==========
  _renderAddForm: function() {
    var html = '<div class="planner-form">';
    html += '<div class="planner-form-row">';
    html += '<input class="planner-input-time" type="text" maxlength="5" placeholder="۸:۰۰" value="' + (this.formData.time || '') + '" oninput="PLANNER.updateFormData(\'time\', this.value)" id="plannerTimeInput">';
    html += '<input class="planner-input" type="text" maxlength="60" placeholder="عنوان کار..." value="' + (this.formData.title || '') + '" oninput="PLANNER.updateFormData(\'title\', this.value)" id="plannerTitleInput">';
    html += '</div>';
    html += '<div class="planner-form-row">';
    html += '<button class="planner-form-btn cancel" onclick="PLANNER.cancelAdd()">لغو</button>';
    html += '<button class="planner-form-btn save" onclick="PLANNER.saveAdd()">✓ ذخیره</button>';
    html += '</div>';
    html += '</div>';
    return html;
  },

  // ========== فرم ویرایش ==========
  _renderEditForm: function() {
    var html = '<div class="planner-form">';
    html += '<div class="planner-form-row">';
    html += '<input class="planner-input-time" type="text" maxlength="5" placeholder="۸:۰۰" value="' + (this.formData.time || '') + '" oninput="PLANNER.updateFormData(\'time\', this.value)">';
    html += '<input class="planner-input" type="text" maxlength="60" placeholder="عنوان..." value="' + (this.formData.title || '') + '" oninput="PLANNER.updateFormData(\'title\', this.value)">';
    html += '</div>';
    html += '<div class="planner-form-row">';
    html += '<button class="planner-form-btn cancel" onclick="PLANNER.cancelAdd()">لغو</button>';
    html += '<button class="planner-form-btn save" onclick="PLANNER.saveEdit()">✓ ذخیره</button>';
    html += '</div>';
    html += '</div>';
    return html;
  },

  // ========== آمار روزانه ==========
  _renderDailyStats: function() {
    var total = this.daily.length;
    var done = this.daily.filter(function(x) { return x.done; }).length;
    var percent = total > 0 ? Math.round((done / total) * 100) : 0;

    var html = '<div class="planner-stats">';
    html += '<div class="planner-stats-title">📊 آمار امروز</div>';
    html += '<div class="planner-stats-grid">';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">✅</div><div class="planner-stat-num">' + (typeof toFa === 'function' ? toFa(done) : done) + '</div><div class="planner-stat-lbl">انجام‌شده</div></div>';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">📋</div><div class="planner-stat-num">' + (typeof toFa === 'function' ? toFa(total) : total) + '</div><div class="planner-stat-lbl">کل کارها</div></div>';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">🎯</div><div class="planner-stat-num">' + (typeof toFa === 'function' ? toFa(percent) : percent) + '٪</div><div class="planner-stat-lbl">موفقیت</div></div>';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">⏳</div><div class="planner-stat-num">' + (typeof toFa === 'function' ? toFa(total - done) : (total - done)) + '</div><div class="planner-stat-lbl">باقی‌مونده</div></div>';
    html += '</div></div>';
    return html;
  },

  // ========== آمار هفتگی ==========
  _renderWeeklyStats: function() {
    var totalAll = 0, doneAll = 0;
    var dayStats = [];

    for (var i = 0; i < this.days.length; i++) {
      var list = this.weekly[this.days[i].id] || [];
      var t = list.length;
      var d = list.filter(function(x) { return x.done; }).length;
      totalAll += t;
      doneAll += d;
      dayStats.push({ name: this.days[i].name, total: t, done: d });
    }

    var percent = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

    // بهترین روز
    var best = null;
    for (var j = 0; j < dayStats.length; j++) {
      if (dayStats[j].done > 0 && (!best || dayStats[j].done > best.done)) {
        best = dayStats[j];
      }
    }

    var html = '<div class="planner-stats">';
    html += '<div class="planner-stats-title">📊 آمار هفتگی</div>';
    html += '<div class="planner-stats-grid">';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">✅</div><div class="planner-stat-num">' + (typeof toFa === 'function' ? toFa(doneAll) : doneAll) + '</div><div class="planner-stat-lbl">انجام‌شده</div></div>';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">📋</div><div class="planner-stat-num">' + (typeof toFa === 'function' ? toFa(totalAll) : totalAll) + '</div><div class="planner-stat-lbl">کل کارها</div></div>';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">🎯</div><div class="planner-stat-num">' + (typeof toFa === 'function' ? toFa(percent) : percent) + '٪</div><div class="planner-stat-lbl">موفقیت</div></div>';
    html += '<div class="planner-stat-box"><div class="planner-stat-icon">🏆</div><div class="planner-stat-num" style="font-size:14px">' + (best ? best.name : '—') + '</div><div class="planner-stat-lbl">موفق‌ترین روز</div></div>';
    html += '</div></div>';
    return html;
  },

  // ========== امن‌سازی متن ==========
  _escape: function(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
  }
};

// تابع سراسری برای ابزار
function openTool_planner() {
  PLANNER.start();
}

window.PLANNER = PLANNER;
