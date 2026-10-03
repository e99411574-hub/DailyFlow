// ===== tick.js - تیک‌های چرخان ستاره =====

var TICKS = {
  star_black:   { color: '#2d1b4e', bg: '#f0e8ff', type: 'star' },
  star_gold:    { color: '#FDCB6E', bg: '#fff8e7', type: 'star' },
  star_rainbow: { color: '#E84393', bg: '#fff0f8', type: 'star' },
  heart_red:    { color: '#E84393', bg: '#fff0f5', type: 'heart' },
  heart_pink:   { color: '#FD79A8', bg: '#fff0f8', type: 'heart' },
  diamond_blue: { color: '#0984E3', bg: '#e8f4fd', type: 'diamond' },
  crown_gold:   { color: '#FDCB6E', bg: '#fff8e7', type: 'crown' },
  tick_default: { color: '#8b5cf6', bg: '#f0e8ff', type: 'check' },
  tick_simple:  { color: '#8b5cf6', bg: '#f0e8ff', type: 'check' },
  tick_star:    { color: '#FDCB6E', bg: '#fff8e7', type: 'star' },
  tick_heart:   { color: '#E84393', bg: '#fff0f5', type: 'heart' },
  tick_diamond: { color: '#0984E3', bg: '#e8f4fd', type: 'diamond' }
};

// SVG شکل‌ها
var TICK_SHAPES = {
  star: 'M30 8 L36 22 L52 24 L40 34 L44 50 L30 41 L16 50 L20 34 L8 24 L24 22 Z',
  heart: 'M30 48 C 12 36 8 20 18 14 C 24 10 30 14 30 20 C 30 14 36 10 42 14 C 52 20 48 36 30 48 Z',
  diamond: 'M30 6 L52 26 L30 54 L8 26 Z',
  crown: 'M10 46 L10 22 L20 32 L30 16 L40 32 L50 22 L50 46 Z',
  check: 'M14 30 L24 42 L46 18'
};

// ---------- رندر تیک ----------
function renderTick(tickId, size) {
  size = size || 40;
  var t = TICKS[tickId];
  if (!t) {
    t = { color: '#8b5cf6', bg: '#f0e8ff', type: 'check' };
  }

  var shape = TICK_SHAPES[t.type] || TICK_SHAPES.check;
  var isCheck = (t.type === 'check');

  var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="display:block">';

  // دایرهٔ پس‌زمینه
  svg += '<circle cx="30" cy="30" r="26" fill="' + t.bg + '" stroke="' + t.color + '" stroke-width="2.5"/>';

  // شکل
  if (isCheck) {
    svg += '<path d="' + shape + '" fill="none" stroke="' + t.color + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
  } else {
    svg += '<path d="' + shape + '" fill="' + t.color + '" stroke="' + t.color + '" stroke-width="1.5" stroke-linejoin="round"/>';
  }

  // نقطهٔ چرخان روی دایره
  svg += '<circle cx="30" cy="4" r="3" fill="' + t.color + '">';
  svg += '<animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="4s" repeatCount="indefinite"/>';
  svg += '</circle>';

  svg += '</svg>';
  return svg;
}

// ---------- رندر تیک فعال کاربر ----------
function renderActiveTick(size) {
  size = size || 40;
  var user;
  try {
    user = JSON.parse(localStorage.getItem('setareh_user') || '{}');
  } catch (e) {
    user = {};
  }
  var tickId = user.selectedTick || 'star_black';
  return renderTick(tickId, size);
}

// اتصال به window
window.renderTick = renderTick;
window.renderActiveTick = renderActiveTick;
window.TICKS = TICKS;
