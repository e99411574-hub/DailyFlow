// ===== tick.js - تیک‌های چرخان و نمادها =====
var TICKS = {
  // تیک‌های ساده (رایگان + خریدنی)
  simple: [
    { id: 'star_black',  icon: '★',  name: 'ستاره سیاه',  color: '#000',    price: 0,   animated: false },
    { id: 'star_gold',   icon: '★',  name: 'ستاره طلایی', color: '#FDCB6E', price: 50,  animated: false },
    { id: 'heart_red',   icon: '♥',  name: 'قلب سرخ',     color: '#E74C3C', price: 60,  animated: false },
    { id: 'heart_pink',  icon: '♥',  name: 'قلب صورتی',   color: '#E84393', price: 60,  animated: false },
    { id: 'diamond_blue',icon: '◆',  name: 'الماس آبی',   color: '#0984E3', price: 80,  animated: false },
    { id: 'moon',        icon: '☾',  name: 'ماه',          color: '#A29BFE', price: 70,  animated: false },
    { id: 'sun',         icon: '☀',  name: 'خورشید',      color: '#F39C12', price: 70,  animated: false },
    { id: 'bolt',        icon: '⚡',  name: 'صاعقه',        color: '#F1C40F', price: 80,  animated: false },
    { id: 'fire',        icon: '🔥', name: 'آتش',          color: '#E67E22', price: 90,  animated: false },
    { id: 'leaf',        icon: '🍃', name: 'برگ',          color: '#27AE60', price: 60,  animated: false },
    { id: 'drop',        icon: '💧', name: 'قطره',         color: '#3498DB', price: 50,  animated: false },
    { id: 'note',        icon: '♪',  name: 'نت موسیقی',   color: '#9B59B6', price: 80,  animated: false }
  ],
  
  // تیک‌های متحرک
  animated: [
    { id: 'spin',    icon: '✦', name: 'چرخان',      color: '#6C5CE7', price: 300, animated: true, anim: 'spin' },
    { id: 'pulse',   icon: '●', name: 'نبضی',       color: '#E84393', price: 300, animated: true, anim: 'pulse' },
    { id: 'flame',   icon: '🔥', name: 'آتشین',      color: '#E74C3C', price: 350, animated: true, anim: 'flame' },
    { id: 'galaxy',  icon: '✧', name: 'کهکشانی',    color: '#A29BFE', price: 400, animated: true, anim: 'galaxy' },
    { id: 'neon',    icon: '✓', name: 'نئونی',       color: '#00FFF0', price: 400, animated: true, anim: 'neon' },
    { id: 'rainbow', icon: '★', name: 'رنگین‌کمانی', color: 'rainbow', price: 500, animated: true, anim: 'rainbow' },
    { id: 'orbit',   icon: '◉', name: 'مداری',       color: '#0984E3', price: 350, animated: true, anim: 'orbit' },
    { id: 'shine',   icon: '✩', name: 'درخشان',      color: '#FDCB6E', price: 450, animated: true, anim: 'shine' }
  ],
  
  // نمادهای ویژه
  special: [
    { id: 'crown',    icon: '👑', name: 'تاج',      color: '#FDCB6E', price: 800, animated: false },
    { id: 'skull',    icon: '💀', name: 'جمجمه',    color: '#2D3436', price: 800, animated: false },
    { id: 'dragon',   icon: '🐉', name: 'اژدها',    color: '#E74C3C', price: 800, animated: false },
    { id: 'angel',    icon: '👼', name: 'فرشته',    color: '#DFE6E9', price: 800, animated: false },
    { id: 'devil',    icon: '😈', name: 'شیطان',    color: '#8E44AD', price: 800, animated: false }
  ]
};

// پیدا کردن تیک با شناسه
function getTickById(id) {
  var all = [].concat(TICKS.simple, TICKS.animated, TICKS.special);
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) return all[i];
  }
  return TICKS.simple[0];
}

// تولید SVG تیک با دایره چرخان و برآمدگی
function makeTickSVG(tick, size) {
  size = size || 60;
  var color = tick.color === 'rainbow' ? '#6C5CE7' : tick.color;
  var gradId = 'tg_' + tick.id + '_' + Math.random().toString(36).slice(2, 7);
  var isRainbow = tick.color === 'rainbow';
  
  var defs = '';
  if (isRainbow) {
    defs = '<defs>' +
      '<linearGradient id="' + gradId + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#FF6B6B"/>' +
      '<stop offset="25%" stop-color="#FDCB6E"/>' +
      '<stop offset="50%" stop-color="#00B894"/>' +
      '<stop offset="75%" stop-color="#0984E3"/>' +
      '<stop offset="100%" stop-color="#A29BFE"/>' +
      '</linearGradient>' +
      '</defs>';
    color = 'url(#' + gradId + ')';
  }
  
  var animClass = '';
  if (tick.animated) {
    animClass = ' tick-anim-' + tick.anim;
  }
  
  // دایره چرخان با برآمدگی + تیک مرکزی ثابت
  return '' +
  '<svg class="tick-svg' + animClass + '" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
    defs +
    '<g class="tick-rotor" transform-origin="50 50">' +
      '<circle cx="50" cy="50" r="42" fill="none" stroke="' + color + '" stroke-width="3" opacity="0.7"/>' +
      '<circle cx="50" cy="8" r="6" fill="' + color + '"/>' +
    '</g>' +
    '<text x="50" y="62" font-size="40" font-weight="bold" text-anchor="middle" fill="' + color + '" font-family="Tahoma">' + tick.icon + '</text>' +
  '</svg>';
}

// نمایش تیک به صورت HTML با دایره چرخان
function renderTick(tick, size) {
  if (!tick) tick = TICKS.simple[0];
  var color = tick.color === 'rainbow' ? 'rainbow' : tick.color;
  var animClass = tick.animated ? ' tick-anim-' + tick.anim : '';
  var spin = tick.animated ? ' tick-spin' : '';
  
  return '<div class="tick-wrap' + animClass + '" style="width:' + size + 'px;height:' + size + 'px;position:relative;display:inline-block">' +
    '<div class="tick-ring' + spin + '" style="position:absolute;inset:0;border:2px solid ' + color + ';border-radius:50%;opacity:.7"></div>' +
    '<div class="tick-notch' + spin + '" style="position:absolute;top:-3px;left:50%;margin-left:-3px;width:6px;height:6px;border-radius:50%;background:' + color + '"></div>' +
    '<div class="tick-icon" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:' + (size * 0.55) + 'px;color:' + color + ';font-weight:800">' + tick.icon + '</div>' +
  '</div>';
}

// چرخش دایره دور تیک (CSS)
var tickStyle = document.createElement('style');
tickStyle.textContent = '' +
  '@keyframes tickSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}' +
  '.tick-ring{animation:tickSpin 4s linear infinite}' +
  '.tick-notch{animation:tickSpin 4s linear infinite;transform-origin:50% ' + 'calc(50% + ' + 0 + 'px)' + '}' +
  '.tick-ring,.tick-notch{transform-origin:center center}' +
  '@keyframes tickPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}' +
  '.tick-anim-pulse .tick-icon{animation:tickPulse 1.5s ease-in-out infinite}' +
  '@keyframes tickFlame{0%{filter:brightness(1)}50%{filter:brightness(1.5) hue-rotate(-15deg)}100%{filter:brightness(1)}}' +
  '.tick-anim-flame .tick-icon{animation:tickFlame 1.2s ease-in-out infinite}' +
  '@keyframes tickNeon{0%,100%{text-shadow:0 0 4px currentColor,0 0 8px currentColor}50%{text-shadow:0 0 12px currentColor,0 0 20px currentColor,0 0 30px currentColor}}' +
  '.tick-anim-neon .tick-icon{animation:tickNeon 1.8s ease-in-out infinite}' +
  '@keyframes tickRainbow{from{filter:hue-rotate(0)}to{filter:hue-rotate(360deg)}}' +
  '.tick-anim-rainbow .tick-icon,.tick-anim-rainbow .tick-ring,.tick-anim-rainbow .tick-notch{animation:tickRainbow 4s linear infinite}' +
  '@keyframes tickGalaxy{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.15)}100%{transform:rotate(360deg) scale(1)}}' +
  '.tick-anim-galaxy .tick-icon{animation:tickGalaxy 3s ease-in-out infinite}' +
  '@keyframes tickShine{0%{filter:brightness(1)}50%{filter:brightness(1.6) drop-shadow(0 0 8px gold)}100%{filter:brightness(1)}}' +
  '.tick-anim-shine .tick-icon{animation:tickShine 2s ease-in-out infinite}' +
  '.tick-anim-spin .tick-icon{animation:tickSpin 3s linear infinite}' +
  '@keyframes tickOrbit{0%{transform:rotate(0) translateX(0)}50%{transform:rotate(180deg) translateX(3px)}100%{transform:rotate(360deg) translateX(0)}}' +
  '.tick-anim-orbit .tick-icon{animation:tickOrbit 3s linear infinite}' +
  '.tick-spin{animation:tickSpin 4s linear infinite;transform-origin:center}' +
  '.tick-ring,.tick-notch{animation:tickSpin 4s linear infinite;transform-origin:center}' +
  '.tick-notch{transform-origin:50% calc(50% - 50% + 3px)}';
document.head.appendChild(tickStyle);

// اگر خواستی دایره بچرخه ولی تیک ثابت بمونه
// دایره+برآمدگی می‌چرخن، تیک وسط ثابت می‌مونه
// این دقیقاً چیزی هست که کاربر خواسته
