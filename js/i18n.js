// ===== i18n.js - ترجمه و زبان =====

var LANG = 'fa';

var TRANSLATIONS = {
  fa: {
    app_name: 'ستاره',
    welcome: 'خوش آمدی',
    welcome_sub: 'امروز چیکار کنیم؟',
    guest: 'دوست',
    coins: 'سکه',
    level: 'مرحله',
    streak: 'روز پیوسته',
    settings: 'تنظیمات',
    language: 'زبان',
    sound: 'صدا',
    version: 'نسخه',
    reset_all: 'پاک کردن همه داده‌ها',
    confirm_reset: 'همهٔ داده‌ها پاک شود؟',
    soon: 'به‌زودی',
    quick_access: 'دسترسی سریع',
    save: 'ذخیره', cancel: 'لغو', delete: 'حذف',
    edit: 'ویرایش', close: 'بستن', ok: 'باشه',
    greet_morning: 'صبح بخیر ☀️',
    greet_noon: 'ظهر بخیر 🌤️',
    greet_evening: 'عصر بخیر 🌆',
    greet_night: 'شب بخیر 🌙',
    home: 'خانه', games: 'بازی', tools: 'ابزار',
    shop: 'فروشگاه', profile: 'من',
    shop_title: '🛒 فروشگاه',
    shop_ticks: 'تیک', shop_symbols: 'نماد',
    shop_themes: 'تم', shop_sounds: 'صدا',
    shop_equip: 'فعال', shop_equipped_btn: '✓ فعال',
    shop_bought: 'خریداری شد!', shop_equipped: 'فعال شد!',
    shop_not_enough: 'سکه کافی نداری!',
    shop_already: 'قبلاً خریداری شده', shop_error: 'خطا!',
    notEnoughCoins: 'سکه کافی نداری!',
    specialSymbols: 'نمادهای خاص',
    tick_default: 'تیک ساده', tick_star: 'ستاره طلایی',
    tick_heart: 'قلب سرخ', tick_diamond: 'الماس آبی',
    'star_black': 'ستاره سیاه', 'star_gold': 'ستاره طلایی',
    'heart_red': 'قلب سرخ', 'heart_pink': 'قلب صورتی',
    'diamond_blue': 'الماس آبی', 'tick_simple': 'تیک ساده',
    sym_moon: 'ماه', sym_sun: 'خورشید', sym_rocket: 'موشک',
    sym_rainbow: 'رنگین‌کمان', sym_galaxy: 'کهکشان',
    theme_purple: 'بنفش', theme_gold: 'طلایی',
    theme_ocean: 'اقیانوس', theme_sunset: 'غروب', theme_dark: 'تیره',
    sound_basic: 'پایه', sound_chime: 'زنگ',
    sound_arcade: 'بازی', sound_nature: 'طبیعت',
    noName: 'بدون نام', noBio: 'بدون بیو',
    editName: 'ویرایش نام', editBio: 'ویرایش بیو',
    chooseAvatar: 'انتخاب آواتار',
    male: 'مرد', female: 'زن', gallery: 'گالری',
    chooseTick: 'انتخاب تیک',
    namePlaceholder: 'نامت را بنویس...',
    bioPlaceholder: 'درباره‌ات بنویس...',
    nameSaved: 'نام ذخیره شد', bioSaved: 'بیو ذخیره شد',
    nameEmpty: 'نام را وارد کن', imgSaved: 'تصویر ذخیره شد',
    imgTooBig: 'تصویر خیلی بزرگه', tickNotOwned: 'این تیک را نداری',
    rps: 'سنگ کاغذ قیچی', guess: 'حدس عدد',
    ttt: 'دوز', memory: 'حافظه',
    calc: 'ماشین‌حساب', stopwatch: 'کرنومتر',
    planner: 'برنامه روزانه', notes: 'یادداشت', todo: 'کارها',
    levelup: 'سطح جدید', loading: 'در حال بارگذاری...', error: 'خطا'
  },
  en: {
    app_name: 'Setareh',
    welcome: 'Welcome', welcome_sub: 'What shall we do today?',
    guest: 'friend', coins: 'Coins', level: 'Level', streak: 'Streak',
    settings: 'Settings', language: 'Language', sound: 'Sound',
    version: 'Version', reset_all: 'Reset all data',
    confirm_reset: 'Delete all data?', soon: 'Coming soon',
    quick_access: 'Quick access',
    save: 'Save', cancel: 'Cancel', delete: 'Delete',
    edit: 'Edit', close: 'Close', ok: 'OK',
    greet_morning: 'Good morning ☀️', greet_noon: 'Good afternoon 🌤️',
    greet_evening: 'Good evening 🌆', greet_night: 'Good night 🌙',
    home: 'Home', games: 'Games', tools: 'Tools',
    shop: 'Shop', profile: 'Me',
    shop_title: '🛒 Shop', shop_ticks: 'Ticks', shop_symbols: 'Symbols',
    shop_themes: 'Themes', shop_sounds: 'Sounds',
    shop_equip: 'Equip', shop_equipped_btn: '✓ Equipped',
    shop_bought: 'Purchased!', shop_equipped: 'Equipped!',
    shop_not_enough: 'Not enough coins!',
    shop_already: 'Already owned', shop_error: 'Error!',
    notEnoughCoins: 'Not enough coins!', specialSymbols: 'Special symbols',
    tick_default: 'Simple tick', tick_star: 'Gold star',
    tick_heart: 'Red heart', tick_diamond: 'Blue diamond',
    'star_black': 'Black star', 'star_gold': 'Gold star',
    'heart_red': 'Red heart', 'heart_pink': 'Pink heart',
    'diamond_blue': 'Blue diamond', 'tick_simple': 'Simple tick',
    sym_moon: 'Moon', sym_sun: 'Sun', sym_rocket: 'Rocket',
    sym_rainbow: 'Rainbow', sym_galaxy: 'Galaxy',
    theme_purple: 'Purple', theme_gold: 'Gold',
    theme_ocean: 'Ocean', theme_sunset: 'Sunset', theme_dark: 'Dark',
    sound_basic: 'Basic', sound_chime: 'Chime',
    sound_arcade: 'Arcade', sound_nature: 'Nature',
    noName: 'No name', noBio: 'No bio',
    editName: 'Edit name', editBio: 'Edit bio',
    chooseAvatar: 'Choose avatar',
    male: 'Male', female: 'Female', gallery: 'Gallery',
    chooseTick: 'Choose tick',
    namePlaceholder: 'Write your name...',
    bioPlaceholder: 'About you...',
    nameSaved: 'Name saved', bioSaved: 'Bio saved',
    nameEmpty: 'Enter a name', imgSaved: 'Image saved',
    imgTooBig: 'Image too large', tickNotOwned: 'You don\'t own this tick',
    rps: 'Rock Paper Scissors', guess: 'Guess the number',
    ttt: 'Tic Tac Toe', memory: 'Memory',
    calc: 'Calculator', stopwatch: 'Stopwatch',
    planner: 'Daily planner', notes: 'Notes', todo: 'To-Do',
    levelup: 'New level', loading: 'Loading...', error: 'Error'
  }
};

function t(key) {
  if (!key) return '';
  var dict = TRANSLATIONS[LANG] || TRANSLATIONS.fa;
  if (dict[key] !== undefined) return dict[key];
  if (TRANSLATIONS.fa[key] !== undefined) return TRANSLATIONS.fa[key];
  return key;
}

function toFa(input) {
  if (input === null || input === undefined) return '';
  var str = String(input);
  if (LANG !== 'fa') return str;
  return str.replace(/\d/g, function(d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; });
}

function fmtNum(input) { return toFa(input); }

function setLanguage(lang) {
  if (lang !== 'fa' && lang !== 'en') return;
  LANG = lang;
  window.LANG = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'fa') ? 'rtl' : 'ltr';
  document.body.setAttribute('dir', (lang === 'fa') ? 'rtl' : 'ltr');
  document.body.style.fontFamily = (lang === 'fa')
    ? "'Vazirmatn', Tahoma, sans-serif"
    : "'Nunito', Tahoma, sans-serif";
}

window.t = t;
window.toFa = toFa;
window.fmtNum = fmtNum;
window.setLanguage = setLanguage;
window.TRANSLATIONS = TRANSLATIONS;
