// ========== ماجراجویی بز — نسخه ۳.۰ ==========
var cvs=document.getElementById('c'),ctx=cvs.getContext('2d');
var W,H,gy;

// ===== تنظیمات دنیاها =====
var WORLDS=[
{id:1,name:'🌾 دشت سرسبز',len:300,color1:'#87ceeb',color2:'#c8e6f5',gnd:'#4a9c5c',gnd2:'#3d8550',sky:'sun',obs:['grass','rock','bush'],diff:1},
{id:2,name:'🌲 جنگل انبوه',len:600,color1:'#4a7c59',color2:'#8fb996',gnd:'#3d6b47',gnd2:'#2c5035',sky:'clouds',obs:['log','branch','butterfly'],diff:1.2},
{id:3,name:'🏜️ بیابان داغ',len:900,color1:'#f4a460',color2:'#ffe4b5',gnd:'#d2b48c',gnd2:'#a0845c',sky:'sun',obs:['cactus','skull','sandstorm'],diff:1.4},
{id:4,name:'🏙️ شهر شلوغ',len:1200,color1:'#ff9a56',color2:'#ffc3a0',gnd:'#3a3a42',gnd2:'#5a5a62',sky:'city',obs:['car','cone','hydrant'],diff:1.6},
{id:5,name:'🌊 ساحل آرام',len:1500,color1:'#4fc3f7',color2:'#b3e5fc',gnd:'#e8d5a0',gnd2:'#c9b177',sky:'sun',obs:['rock','crab','boat'],diff:1.8},
{id:6,name:'❄️ قطب یخی',len:1800,color1:'#b3e5fc',color2:'#e1f5fe',gnd:'#e0f2f7',gnd2:'#a4d3e0',sky:'snow',obs:['ice','penguin','snowman'],diff:2},
{id:7,name:'🌋 آتشفشان',len:2100,color1:'#4a1c1c',color2:'#8b3a3a',gnd:'#3a2020',gnd2:'#5a3030',sky:'lava',obs:['lava','rock','smoke'],diff:2.3},
{id:8,name:'🌌 فضا',len:2400,color1:'#0a0a1a',color2:'#1a0a2a',gnd:'#1a0a2a',gnd2:'#2a1040',sky:'stars',obs:['asteroid','star','ufo'],diff:2.6},
{id:9,name:'👻 دنیای ارواح',len:2700,color1:'#1a0a1a',color2:'#2a1a2a',gnd:'#2a1a2a',gnd2:'#1a0a1a',sky:'ghost',obs:['grave','ghost','skull'],diff:3},
{id:10,name:'🍭 دنیای شیرینی',len:3000,color1:'#ffb3d9',color2:'#ffe0f0',gnd:'#ff99cc',gnd2:'#cc6699',sky:'candy',obs:['candy','cake','cookie'],diff:3.5}
];

// ===== تنظیمات قدرت‌ها =====
var POWERS=[
{id:'shield',ic:'⭐',nm:'ستاره محافظ',pr:50,desc:'۵ ثانیه بی‌آسیب'},
{id:'extra',ic:'💚',nm:'جان اضافه',pr:100,desc:'یک ❤️ اضافه'},
{id:'magnet',ic:'🧲',nm:'مغناطیس',pr:150,desc:'سکه‌ها جذب می‌شن'},
{id:'jet',ic:'🚀',nm:'جت‌پک',pr:200,desc:'۱۰ ثانیه پرواز'},
{id:'slow',ic:'❄️',nm:'زمان کند',pr:180,desc:'۵ ثانیه آرام'}
];

// ===== تنظیمات رنگ بز =====
var GOAT_COLORS=[
{id:'gray',nm:'خاکستری',pr:0,c1:'#b0b0b0',c2:'#909090',c3:'#c0c0c0'},
{id:'white',nm:'سفید',pr:30,c1:'#ffffff',c2:'#d0d0d0',c3:'#f0f0f0'},
{id:'brown',nm:'قهوه‌ای',pr:50,c1:'#a67c52',c2:'#7c5a3a',c3:'#c99e6e'},
{id:'black',nm:'سیاه',pr:80,c1:'#3a3a3a',c2:'#1a1a1a',c3:'#5a5a5a'},
{id:'gold',nm:'طلایی',pr:150,c1:'#ffd700',c2:'#d4a800',c3:'#ffe93b'},
{id:'rainbow',nm:'رنگین‌کمان',pr:300,c1:'rainbow',c2:'rainbow',c3:'rainbow'}
];

// ===== دستاوردها =====
var ACHV=[
{id:'first100',ic:'🥉',tt:'اولین قدم',sb:'۱۰۰ متر بدون آسیب',check:function(s){return s.maxDist>=100}},
{id:'first500',ic:'🥈',tt:'دونده',sb:'۵۰۰ متر در یک دور',check:function(s){return s.maxDist>=500}},
{id:'first1000',ic:'🥇',tt:'قهرمان',sb:'۱۰۰۰ متر در یک دور',check:function(s){return s.maxDist>=1000}},
{id:'coin50',ic:'💰',tt:'ثروتمند',sb:'۵۰ سکه جمع کن',check:function(s){return s.totalCoin>=50}},
{id:'coin200',ic:'💎',tt:'میلیونر',sb:'۲۰۰ سکه جمع کن',check:function(s){return s.totalCoin>=200}},
{id:'world3',ic:'🌲',tt:'ماجراجو',sb:'به دنیای ۳ برو',check:function(s){return s.maxWorld>=3}},
{id:'world5',ic:'🌊',tt:'مسافر',sb:'به دنیای ۵ برو',check:function(s){return s.maxWorld>=5}},
{id:'world8',ic:'🌌',tt:'جهانگرد',sb:'به دنیای ۸ برو',check:function(s){return s.maxWorld>=8}},
{id:'world10',ic:'👑',tt:'افسانه',sb:'به دنیای ۱۰ برو',check:function(s){return s.maxWorld>=10}},
{id:'game10',ic:'🎮',tt:'بازیگر',sb:'۱۰ بار بازی کن',check:function(s){return s.games>=10}},
{id:'game50',ic:'🕹️',tt:'حرفه‌ای',sb:'۵۰ بار بازی کن',check:function(s){return s.games>=50}},
{id:'power5',ic:'⚡',tt:'قدرتمند',sb:'۵ قدرت استفاده کن',check:function(s){return s.powersUsed>=5}}
];

// ===== ذخیره‌سازی =====
var SAVE_KEY='goatSaveV3';
var save={coins:0,owned:['gray'],ownedPowers:[],achievements:[],maxDist:0,maxWorld:1,totalCoin:0,games:0,powersUsed:0,bestScore:0};
function loadSave(){try{var d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(d)for(var k in d)if(save.hasOwnProperty(k))save[k]=d[k];}catch(e){}}
function writeSave(){localStorage.setItem(SAVE_KEY,JSON.stringify(save));}
loadSave();

// ===== حالت بازی =====
var run=false,paused=false,state={};

function initState(){
state={t:0,dist:0,sp:4,goat:{y:gy-30,vy:0,onG:true,j:0,flash:0},obs:[],coins:[],powers:[],parts:[],lives:2,inv:0,world:0,worldStart:0,coinCnt:0,shield:0,magnet:0,jet:0,slow:0,night:0,weather:'clear',weatherT:0,spawnT:0,wolf:{x:-60,speed:3.2},wolves:[],jump:0,crouch:0};
state.wolves.push({x:-60,speed:3.2,wobble:0});
}

// ===== کنترل‌ها =====
var touchStartY=0,touchStartX=0,touchTime=0;
function onTouchStart(e){
if(!run||paused)return;
e.preventDefault();
var t=e.touches?e.touches[0]:e;
touchStartY=t.clientY;touchStartX=t.clientX;touchTime=Date.now();
}
function onTouchEnd(e){
if(!run||paused)return;
var t=e.changedTouches?e.changedTouches[0]:e;
var dy=t.clientY-touchStartY;var dx=t.clientX-touchStartX;
var dt=Date.now()-touchTime;
if(dy>50&&Math.abs(dy)>Math.abs(dx)){state.crouch=30;playSound('crouch');}
else if(dt<300){doJump();}
}
function doJump(){
if(!run||paused)return;
if(state.goat.onG){state.goat.vy=-13;state.goat.onG=false;state.goat.j=1;playSound('jump');}
else if(state.goat.j===1){state.goat.vy=-11;state.goat.j=2;playSound('jump');}
}
cvs.addEventListener('touchstart',onTouchStart,{passive:false});
cvs.addEventListener('touchend',onTouchEnd,{passive:false});
cvs.addEventListener('mousedown',onTouchStart);
cvs.addEventListener('mouseup',onTouchEnd);

// ===== صدا (Web Audio) =====
var audioCtx=null;
function initAudio(){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function playSound(type){
if(!audioCtx)return;
var o=audioCtx.createOscillator(),g=audioCtx.createGain();
o.connect(g);g.connect(audioCtx.destination);
var now=audioCtx.currentTime;
if(type==='jump'){o.frequency.setValueAtTime(400,now);o.frequency.exponentialRampToValueAtTime(800,now+0.1);g.gain.setValueAtTime(0.15,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.15);o.start(now);o.stop(now+0.15);}
else if(type==='coin'){o.frequency.setValueAtTime(900,now);o.frequency.setValueAtTime(1300,now+0.05);g.gain.setValueAtTime(0.12,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.15);o.start(now);o.stop(now+0.15);}
else if(type==='power'){o.frequency.setValueAtTime(600,now);o.frequency.exponentialRampToValueAtTime(1400,now+0.2);g.gain.setValueAtTime(0.15,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.3);o.start(now);o.stop(now+0.3);}
else if(type==='hit'){o.type='sawtooth';o.frequency.setValueAtTime(200,now);o.frequency.exponentialRampToValueAtTime(80,now+0.2);g.gain.setValueAtTime(0.2,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.25);o.start(now);o.stop(now+0.25);}
else if(type==='crouch'){o.frequency.setValueAtTime(300,now);o.frequency.exponentialRampToValueAtTime(150,now+0.1);g.gain.setValueAtTime(0.08,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.12);o.start(now);o.stop(now+0.12);}
}

// ===== رابط کاربری =====
function setHUD(){
var c=document.getElementById('hCoin');if(c)c.textContent=state.coinCnt.toLocaleString('fa-IR');
var l=document.getElementById('hLife');if(l)l.textContent=state.lives>=2?'❤️❤️':state.lives===1?'❤️🖤':'🖤🖤';
var s=document.getElementById('hSc');if(s)s.textContent=Math.floor(state.dist).toLocaleString('fa-IR');
var w=document.getElementById('world');if(w)w.textContent=WORLDS[state.world].name;
var p=document.getElementById('pw');
if(p){
var arr=[];
if(state.shield>0)arr.push('⭐'+Math.ceil(state.shield/60));
if(state.magnet>0)arr.push('🧲'+Math.ceil(state.magnet/60));
if(state.jet>0)arr.push('🚀'+Math.ceil(state.jet/60));
if(state.slow>0)arr.push('❄️'+Math.ceil(state.slow/60));
p.textContent=arr.join(' ');
}
}

// ===== شروع/پایان =====
function gameStart(){
initAudio();
document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on');});
document.getElementById('hud').style.display='flex';
document.getElementById('world').style.display='block';
document.getElementById('pw').style.display='block';
document.getElementById('hint').style.display='block';
document.getElementById('pause').style.display='block';
setTimeout(function(){document.getElementById('hint').style.display='none';},3000);
W=cvs.width=innerWidth;H=cvs.height=innerHeight;gy=H*0.78;
initState();run=true;paused=false;
state.games=save.games+1;save.games=state.games;writeSave();
loop();
}
function gameEnd(){
run=false;paused=false;
save.maxDist=Math.max(save.maxDist,Math.floor(state.dist));
save.maxWorld=Math.max(save.maxWorld,state.world+1);
save.totalCoin+=state.coinCnt;
writeSave();
var isNew=state.dist>save.bestScore;
if(isNew)save.bestScore=Math.floor(state.dist);
writeSave();
document.getElementById('oSc').textContent=Math.floor(state.dist).toLocaleString('fa-IR');
document.getElementById('oCn').textContent=state.coinCnt.toLocaleString('fa-IR');
document.getElementById('oNew').textContent=isNew?'🎉 رکورد جدید!':'';
document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on');});
document.getElementById('over').classList.add('on');
document.getElementById('hud').style.display='none';
document.getElementById('world').style.display='none';
document.getElementById('pw').style.display='none';
document.getElementById('pause').style.display='none';
checkAchievements();
}
function gamePause(){
if(!run)return;paused=true;
document.getElementById('pauseScr').classList.add('on');
}
function gameResume(){
paused=false;
document.getElementById('pauseScr').classList.remove('on');
}
function showScreen(id){
document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on');});
if(id==='shop')renderShop();
if(id==='achv')renderAchv();
if(id==='menu')updateMenu();
document.getElementById(id).classList.add('on');
document.getElementById('hud').style.display='none';
document.getElementById('world').style.display='none';
document.getElementById('pw').style.display='none';
document.getElementById('pause').style.display='none';
}
function updateMenu(){
document.getElementById('mRec').textContent=save.bestScore.toLocaleString('fa-IR')+' m';
document.getElementById('mCoin').textContent=save.coins.toLocaleString('fa-IR');
document.getElementById('mWorld').textContent=save.maxWorld.toLocaleString('fa-IR');
}

// ===== حلقه بازی =====
function loop(){
if(!run||paused)return;
update();
draw();
requestAnimationFrame(loop);
}

function update(){
state.t++;
var wr=WORLDS[state.world];
var relDist=state.dist-state.worldStart;
// تعیین دنیا
if(relDist>=wr.len&&state.world<WORLDS.length-1){
state.world++;state.worldStart=state.dist;
playSound('power');
}
// سرعت
var baseSp=4+state.world*0.8;
var diffFactor=wr.diff;
state.sp=baseSp+Math.min(state.t/3000,3)*diffFactor;
if(state.slow>0)state.sp*=0.4;
state.dist+=state.sp*0.12;
// شب/روز
state.night=(Math.sin(state.t/500)+1)/2;
// آب‌وهوا
state.weatherT--;
if(state.weatherT<=0){state.weatherT=300+Math.random()*300;
var ws=['clear','clear','clear','rain','snow','wind'];
state.weather=ws[Math.floor(Math.random()*ws.length)];
if(state.world===5)state.weather=Math.random()<0.5?'snow':'clear';
if(state.world===2)state.weather=Math.random()<0.5?'rain':'clear';
}
// قدرت‌ها
if(state.shield>0)state.shield--;
if(state.magnet>0)state.magnet--;
if(state.jet>0)state.jet--;
if(state.slow>0)state.slow--;
if(state.inv>0)state.inv--;
if(state.goat.flash>0)state.goat.flash--;
if(state.crouch>0)state.crouch--;
// فیزیک بز
if(state.jet>0){state.goat.vy=Math.max(state.goat.vy-0.4,-6);}
else{state.goat.vy+=0.7;}
state.goat.y+=state.goat.vy;
if(state.goat.y>=gy-30){state.goat.y=gy-30;state.goat.vy=0;state.goat.onG=true;state.goat.j=0;}
// گرگ‌ها — تعداد بر اساس دنیا
var wantWolves=Math.min(1+Math.floor(state.world/2),5);
while(state.wolves.length<wantWolves){
state.wolves.push({x:-80-Math.random()*100,speed:3+Math.random()*1.5+state.world*0.3,wobble:Math.random()*10});
}
var gX=80;
state.wolves.forEach(function(w){
w.wobble+=0.3;
var target=gX-40-Math.random()*10;
if(w.x<target)w.x+=w.speed*(state.slow>0?0.4:1);
if(w.x>gX-42)w.x=gX-42;
});
// تولید موانع
state.spawnT--;
if(state.spawnT<=0){
state.spawnT=Math.max(60-state.t/100,25)+Math.random()*20;
var obsList=wr.obs;
var type=obsList[Math.floor(Math.random()*obsList.length)];
spawnObstacle(type);
}
// تولید سکه و قدرت
if(Math.random()<0.03)spawnCoin();
if(Math.random()<0.008)spawnPowerPickup();
// حرکت اشیاء
state.obs.forEach(function(o){o.x-=state.sp;if(o.rot!==undefined)o.rot+=0.03;});
state.coins.forEach(function(c){c.x-=state.sp;c.rot+=0.1;});
state.powers.forEach(function(p){p.x-=state.sp;p.y=gy-60+Math.sin(state.t*0.1+p.seed)*15;});
state.obs=state.obs.filter(function(o){return o.x+o.w>-80;});
state.coins=state.coins.filter(function(c){return c.x>-40&&!c.got;});
state.powers=state.powers.filter(function(p){return p.x>-40&&!p.got;});
// برخورد با موانع
var bx=gX-10,by=state.goat.y,bw=40,bh=30;
if(state.crouch>0){bh=20;}
if(state.inv<=0&&state.shield<=0){
for(var i=0;i<state.obs.length;i++){
var o=state.obs[i];
if(bx+bw>o.x+6&&bx<o.x+o.w-6&&by+bh>o.y+6&&by<o.y+o.h-6){
state.lives--;state.inv=90;state.goat.flash=30;
playSound('hit');
for(var k=0;k<15;k++){state.parts.push({x:bx+bw/2,y:by+bh/2,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10,life:30,c:'#e74c3c'});}
if(state.lives<=0){gameEnd();return;}
break;
}
}
}
// جذب سکه‌ها
state.coins.forEach(function(c){
var dx=bx+bw/2-c.x,dy=by+bh/2-c.y;var d=Math.sqrt(dx*dx+dy*dy);
if(state.magnet>0&&d<150){c.x+=dx*0.15;c.y+=dy*0.15;}
if(d<30&&!c.got){c.got=true;state.coinCnt++;playSound('coin');}
});
// برداشتن قدرت
state.powers.forEach(function(p){
var dx=bx+bw/2-p.x,dy=by+bh/2-p.y;var d=Math.sqrt(dx*dx+dy*dy);
if(d<35&&!p.got){p.got=true;activatePower(p.type);}
});
// ذرات
state.parts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=0.3;p.life--;});
state.parts=state.parts.filter(function(p){return p.life>0;});
setHUD();
}

function activatePower(type){
playSound('power');
save.powersUsed++;writeSave();
if(type==='shield')state.shield=300;
else if(type==='extra'){state.lives=Math.min(state.lives+1,3);}
else if(type==='magnet')state.magnet=300;
else if(type==='jet')state.jet=600;
else if(type==='slow')state.slow=300;
}

function spawnObstacle(type){
var o={x:W+40,type:type,rot:0};
var sizes={
grass:{w:28,h:32},rock:{w:36,h:26},bush:{w:44,h:30},
log:{w:60,h:24},branch:{w:44,h:30},butterfly:{w:30,h:26},
cactus:{w:32,h:44},skull:{w:30,h:30},sandstorm:{w:50,h:40},
car:{w:70,h:34},cone:{w:24,h:28},hydrant:{w:20,h:34},
crab:{w:36,h:22},boat:{w:60,h:30},
ice:{w:40,h:30},penguin:{w:30,h:36},snowman:{w:36,h:44},
lava:{w:44,h:26},smoke:{w:50,h:50},
asteroid:{w:36,h:36},star:{w:30,h:30},ufo:{w:50,h:30},
grave:{w:34,h:40},ghost:{w:34,h:36},
candy:{w:30,h:36},cake:{w:40,h:34},cookie:{w:32,h:32}
};
var s=sizes[type]||{w:30,h:30};
o.w=s.w;o.h=s.h;
if(['asteroid','star','ufo','smoke','sandstorm'].indexOf(type)>=0){
o.y=gy-50-Math.random()*80;
}else{
o.y=gy-o.h;
}
state.obs.push(o);
}
function spawnCoin(){
state.coins.push({x:W+30,y:gy-70-Math.random()*40,rot:0,got:false});
}
function spawnPowerPickup(){
var p=POWERS[Math.floor(Math.random()*POWERS.length)];
state.powers.push({x:W+40,type:p.id,seed:Math.random()*10,got:false});
}

// ===== رسم =====
function draw(){
drawWorld();
drawObjects();
drawGoat(gX=80,state.goat.y);
state.parts.forEach(function(p){ctx.fillStyle=p.c;ctx.globalAlpha=p.life/30;ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();ctx.globalAlpha=1;});
drawGoatWolves();
}

function drawWorld(){
var w=WORLDS[state.world];
var nf=state.night;
var c1=hexToRgb(w.color1),c2=hexToRgb(w.color2);
var night1=[10,15,40],night2=[30,40,70];
var nf2=nf*0.7;
var r1=lerp(c1[0],night1[0],nf2),g1=lerp(c1[1],night1[1],nf2),b1=lerp(c1[2],night1[2],nf2);
var r2=lerp(c2[0],night2[0],nf2),g2=lerp(c2[1],night2[1],nf2),b2=lerp(c2[2],night2[2],nf2);
var g=ctx.createLinearGradient(0,0,0,gy);
g.addColorStop(0,'rgb('+r1+','+g1+','+b1+')');
g.addColorStop(1,'rgb('+r2+','+g2+','+b2+')');
ctx.fillStyle=g;ctx.fillRect(0,0,W,gy);
// پس‌زمینه خاص هر دنیا
if(w.sky==='sun')drawSun(nf);
else if(w.sky==='clouds')drawClouds(nf);
else if(w.sky==='city')drawCityBg(nf);
else if(w.sky==='snow')drawSnowBg();
else if(w.sky==='lava')drawLavaBg(nf);
else if(w.sky==='stars')drawStarsBg();
else if(w.sky==='ghost')drawGhostBg();
else if(w.sky==='candy')drawCandyBg();
// آب‌وهوا
drawWeather();
// زمین
var gndc=hexToRgb(w.gnd),gnd2c=hexToRgb(w.gnd2);
var nr=lerp(gndc[0],gnd2c[0],0.3)*0.6,gng=lerp(gndc[1],gnd2c[1],0.3)*0.6,nb=lerp(gndc[2],gnd2c[2],0.3)*0.6;
ctx.fillStyle='rgb('+nr+','+gng+','+nb+')';
ctx.fillRect(0,gy,W,H-gy);
ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=2;
for(var i=0;i<40;i++){
var gx2=(i*37+state.t*-state.sp)%(W+40)-20;
ctx.beginPath();ctx.moveTo(gx2,gy+12);ctx.lineTo(gx2+2,gy+4);ctx.stroke();
}
}

function drawSun(nf){
var cx=W*0.78,cy=90;
ctx.fillStyle='#ffd93b';ctx.shadowColor='#ffd93b';ctx.shadowBlur=40;
ctx.beginPath();ctx.arc(cx,cy,36,0,7);ctx.fill();ctx.shadowBlur=0;
}
function drawClouds(nf){
for(var i=0;i<4;i++){
var cx=((i*280+state.t*0.3)%(W+200))-100;var cy=80+i*40;
ctx.fillStyle='rgba(255,255,255,.7)';
ctx.beginPath();ctx.arc(cx,cy,26,0,7);ctx.arc(cx+30,cy-8,22,0,7);ctx.arc(cx-28,cy-4,20,0,7);ctx.arc(cx+8,cy-20,18,0,7);ctx.fill();
}
}
function drawCityBg(nf){
for(var i=0;i<8;i++){
var bx=((i*150-state.t*0.3)%(W+300))-150;
var bh=120+Math.sin(i*3)*60;
ctx.fillStyle='#5a6b7a';ctx.fillRect(bx,gy-bh,90,bh);
ctx.fillStyle='rgba(255,220,120,.85)';
for(var r=0;r<bh/25;r++)for(var c2=0;c2<3;c2++)if((r+c2+i)%3===0)ctx.fillRect(bx+12+c2*26,gy-bh+15+r*25,12,14);
}
for(var k=0;k<5;k++){
var bx2=((k*220-state.t*0.8)%(W+400))-200;
var bh2=100+Math.sin(k*5)*40;
ctx.fillStyle='#3a4a5a';ctx.fillRect(bx2,gy-bh2,130,bh2);
ctx.fillStyle='rgba(255,240,180,.9)';
for(var r2=0;r2<bh2/28;r2++)for(var c3=0;c3<4;c3++)if((r2*2+c3+k)%4!==0)ctx.fillRect(bx2+15+c3*28,gy-bh2+18+r2*28,14,16);
}
}
function drawSnowBg(){
for(var i=0;i<50;i++){
var sx=(i*43+state.t*0.5)%W;var sy=(i*67+state.t*1.5)%gy;
ctx.fillStyle='rgba(255,255,255,.7)';
ctx.beginPath();ctx.arc(sx,sy,1.5,0,7);ctx.fill();
}
}
function drawLavaBg(nf){
for(var i=0;i<5;i++){
var cx=((i*180+state.t*0.2)%(W+300))-100;
var cy=gy-100-Math.sin(state.t/100+i)*30;
ctx.fillStyle='rgba(255,80,30,.6)';
ctx.beginPath();ctx.arc(cx,cy,30,0,7);ctx.fill();
}
}
function drawStarsBg(){
for(var i=0;i<100;i++){
var sx=(i*53.7+state.t*0.1)%W;var sy=(i*37.3)%gy;
ctx.fillStyle='rgba(255,255,255,'+(0.4+(i%5)*0.12)+')';
ctx.beginPath();ctx.arc(sx,sy,1+(i%3)*0.6,0,7);ctx.fill();
}
var pls=[{cx:W*0.15+state.t*0.05,cy:100,r:50,c1:'#ff6b6b',c2:'#a83232'},{cx:W*0.55+state.t*0.03,cy:180,r:70,c1:'#4ecdc4',c2:'#2c8a80'},{cx:W*0.85+state.t*0.02,cy:70,r:40,c1:'#ffe66d',c2:'#b89947'}];
pls.forEach(function(p){
var px=(p.cx%(W+300))-100;
var gr=ctx.createRadialGradient(px-p.r*0.4,p.cy-p.r*0.4,p.r*0.1,px,p.cy,p.r);
gr.addColorStop(0,p.c1);gr.addColorStop(1,p.c2);
ctx.fillStyle=gr;ctx.beginPath();ctx.arc(px,p.cy,p.r,0,7);ctx.fill();
});
}
function drawGhostBg(){
for(var i=0;i<8;i++){
var gx=((i*180+state.t*0.3)%(W+300))-100;
var gy2=100+i*30+Math.sin(state.t/80+i)*20;
ctx.fillStyle='rgba(180,180,220,.15)';
ctx.beginPath();ctx.arc(gx,gy2,40,0,7);ctx.fill();
}
}
function drawCandyBg(){
for(var i=0;i<6;i++){
var cx=((i*200+state.t*0.2)%(W+300))-100;
var cy=100+Math.sin(i*2)*50;
var cols=['#ff99cc','#ffcc99','#99ccff','#cc99ff'];
ctx.fillStyle=cols[i%4];
ctx.beginPath();ctx.arc(cx,cy,25,0,7);ctx.fill();
}
}
function drawWeather(){
if(state.weather==='rain'){
for(var i=0;i<80;i++){
var rx=(i*23+state.t*8)%W;var ry=(i*47+state.t*12)%gy;
ctx.strokeStyle='rgba(180,200,255,.5)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-3,ry+10);ctx.stroke();
}
}else if(state.weather==='snow'||WORLDS[state.world].id===6){
for(var j=0;j<40;j++){
var sx2=(j*37+state.t*1)%W;var sy2=(j*53+state.t*2)%gy;
ctx.fillStyle='rgba(255,255,255,.8)';
ctx.beginPath();ctx.arc(sx2,sy2,2,0,7);ctx.fill();
}
}else if(state.weather
