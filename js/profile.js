// ===== profile.js - پروفایل و حریم خصوصی =====

var PROFILE = {

  // ---------- ویرایش نام ----------
  editName: function() {
    var u = SHOP.getUser();
    var input = document.getElementById('pNameInput');
    var wrap = document.getElementById('pNameWrap');
    if (input) input.value = u.name || '';
    if (wrap) wrap.style.display = 'flex';
    if (input) input.focus();
  },

  saveName: function() {
    var input = document.getElementById('pNameInput');
    if (!input) return;
    var name = input.value.trim();
    if (!name) {
      playSnd('error');
      showToast('❌ ' + t('nameEmpty'));
      return;
    }
    var u = SHOP.getUser();
    u.name = name;
    SHOP.saveUser(u);
    this.refresh();
    playSnd('success');
    showToast('✅ ' + t('nameSaved'));
  },

  cancelName: function() {
    var wrap = document.getElementById('pNameWrap');
    if (wrap) wrap.style.display = 'none';
  },

  // ---------- ویرایش بیو ----------
  editBio: function() {
    var u = SHOP.getUser();
    var input = document.getElementById('pBioInput');
    var wrap = document.getElementById('pBioWrap');
    if (input) input.value = u.bio || '';
    if (wrap) wrap.style.display = 'flex';
    if (input) input.focus();
  },

  saveBio: function() {
    var input = document.getElementById('pBioInput');
    if (!input) return;
    var bio = input.value.trim();
    if (bio.length > 150) bio = bio.substring(0, 150);
    var u = SHOP.getUser();
    u.bio = bio;
    SHOP.saveUser(u);
    this.refresh();
    playSnd('success');
    showToast('✅ ' + t('bioSaved'));
  },

  cancelBio: function() {
    var wrap = document.getElementById('pBioWrap');
    if (wrap) wrap.style.display = 'none';
  },

  // ---------- تغییر آواتار ----------
  setAvatar: function(type) {
    var u = SHOP.getUser();
    if (type === 'male' || type === 'female') {
      u.avatar = type;
      u.avatarImage = '';
      SHOP.saveUser(u);
      this.refresh();
      playSnd('click');
    }
  },

  // ---------- آپلود تصویر ----------
  uploadImage: function(evt) {
    var file = evt.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
      playSnd('error');
      showToast('❌ ' + t('imgTooBig'));
      return;
    }
    var reader = new FileReader();
    var self = this;
    reader.onload = function(e) {
      var u = SHOP.getUser();
      u.avatarImage = e.target.result;
      u.avatar = 'custom';
      SHOP.saveUser(u);
      self.refresh();
      playSnd('success');
      showToast('✅ ' + t('imgSaved'));
    };
    reader.readAsDataURL(file);
  },

  // ---------- انتخاب تیک ----------
  setTick: function(tickId) {
    var u = SHOP.getUser();
    if ((u.ownedTicks || []).indexOf(tickId) < 0) {
      playSnd('error');
      showToast('❌ ' + t('tickNotOwned'));
      return;
    }
    u.selectedTick = tickId;
    SHOP.saveUser(u);
    this.refresh();
    playSnd('click');
  },

  // ---------- رندر پروفایل ----------
  render: function() {
    var u = SHOP.getUser();
    var html = '';

    html += '<div class="profile-header">';
    html += '<div class="profile-avatar">' + this.renderAvatar(u) + '</div>';
    html += '<div class="profile-info">';
    html += '<div class="profile-name">' + (u.name || t('noName')) + '</div>';
    html += '<div class="profile-bio">' + (u.bio || t('noBio')) + '</div>';
    html += '</div></div>';

    html += '<div class="profile-section">';
    html += '<button class="profile-btn" onclick="PROFILE.editName()">✏️ ' + t('editName') + '</button>';
    html += '<div id="pNameWrap" class="profile-input-wrap" style="display:none">';
    html += '<input id="pNameInput" class="profile-input" type="text" maxlength="20" placeholder="' + t('namePlaceholder') + '">';
    html += '<button class="profile-save" onclick="PROFILE.saveName()">✓</button>';
    html += '<button class="profile-cancel" onclick="PROFILE.cancelName()">✕</button>';
    html += '</div></div>';

    html += '<div class="profile-section">';
    html += '<button class="profile-btn" onclick="PROFILE.editBio()">📝 ' + t('editBio') + '</button>';
    html += '<div id="pBioWrap" class="profile-input-wrap" style="display:none">';
    html += '<textarea id="pBioInput" class="profile-input" maxlength="150" rows="2" placeholder="' + t('bioPlaceholder') + '"></textarea>';
    html += '<button class="profile-save" onclick="PROFILE.saveBio()">✓</button>';
    html += '<button class="profile-cancel" onclick="PROFILE.cancelBio()">✕</button>';
    html += '</div></div>';

    html += '<div class="profile-section">';
    html += '<div class="profile-label">👤 ' + t('chooseAvatar') + '</div>';
    html += '<div class="avatar-grid">';
    html += this.avatarOption('male', '👨', u);
    html += this.avatarOption('female', '👩', u);
    html += '<label class="avatar-option ' + (u.avatar === 'custom' ? 'active' : '') + '">';
    html += '<span class="avatar-icon">🖼️</span>';
    html += '<span class="avatar-lbl">' + t('gallery') + '</span>';
    html += '<input type="file" accept="image/*" style="display:none" onchange="PROFILE.uploadImage(event)">';
    html += '</label>';
    html += '</div></div>';

    html += '<div class="profile-section">';
    html += '<div class="profile-label">✓ ' + t('chooseTick') + '</div>';
    html += '<div class="tick-grid">';
    var ticks = (u.ownedTicks || ['star_black']);
    for (var i = 0; i < ticks.length; i++) {
      var tid = ticks[i];
      var active = (u.selectedTick === tid) ? 'active' : '';
      html += '<div class="tick-option ' + active + '" onclick="PROFILE.setTick(\'' + tid + '\')">';
      html += renderTick(tid, 40);
      html += '</div>';
    }
    html += '</div></div>';

    html += '<div class="profile-section">';
    html += '<div class="profile-stats">';
    html += '<div class="stat-box"><div class="stat-num">' + fmtNum(u.coins || 0) + '</div><div class="stat-lbl">🪙 ' + t('coins') + '</div></div>';
    html += '<div class="stat-box"><div class="stat-num">' + fmtNum(u.streak || 0) + '</div><div class="stat-lbl">🔥 ' + t('streak') + '</div></div>';
    html += '<div class="stat-box"><div class="stat-num">' + fmtNum(u.level || 1) + '</div><div class="stat-lbl">⭐ ' + t('level') + '</div></div>';
    html += '</div></div>';

    return html;
  },

  avatarOption: function(type, emoji, u) {
    var active = (u.avatar === type) ? 'active' : '';
    var lbl = (type === 'male') ? t('male') : t('female');
    return '<div class="avatar-option ' + active + '" onclick="PROFILE.setAvatar(\'' + type + '\')">' +
      '<span class="avatar-icon">' + emoji + '</span>' +
      '<span class="avatar-lbl">' + lbl + '</span>' +
      '</div>';
  },

  renderAvatar: function(u) {
    if (u.avatar === 'custom' && u.avatarImage) {
      return '<img src="' + u.avatarImage + '" alt="avatar">';
    }
    if (u.avatar === 'female') return '👩';
    return '👨';
  },

  refresh: function() {
    var c = document.getElementById('profileContent');
    if (c) c.innerHTML = this.render();
    if (typeof updateUserHdr === 'function') updateUserHdr();
  },

  init: function() {
    var u = SHOP.getUser();
    if (!u.ownedTicks) u.ownedTicks = ['star_black'];
    if (!u.selectedTick) u.selectedTick = 'star_black';
    if (!u.avatar) u.avatar = 'male';
    SHOP.saveUser(u);
  }
};

window.PROFILE = PROFILE;
