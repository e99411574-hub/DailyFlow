var cvs=document.getElementById('c'),ctx=cvs.getContext('2d');
var W,H,gy,run=false,paused=false,st={};
var W1=[
{n:'🌾 دشت',c1:'#87ceeb',c2:'#c8e6f5',g:'#4a9c5c',o:['grass','rock','bush'],l:300},
{n:'🌲 جنگل',c1:'#4a7c59',c2:'#8fb996',g:'#3d6b47',o:['log','bush','butterfly'],l:600},
{n:'🏜️ بیابان',c1:'#f4a460',c2:'#ffe4b5',g:'#d2b48c',o:['cactus','rock','skull'],l:900},
{n:'🏙️ شهر',c1:'#ff9a56',c2:'#ffc3a0',g:'#3a3a42',o:['car','cone','hydrant'],l:1200},
{n:'🌌 فضا',c1:'#0a0a1a',c2:'#1a0a2a',g:'#1a0a2a',o:['asteroid','star','ufo'],l:1500}
];
function init(){st={t:0,d:0,sp:4,goat:{y:0,vy:0,onG:true,j:0,fl:0},obs:[],coins:[],parts:[],lives:2,inv:0,w:0,ws:0,cn:0,spT:0};st.goat.y=gy-30;}
var tY=0,tT=0;
function dn(e){if(!run||paused)return;e.preventDefault();var t=e.touches?e.touches[0]:e;tY=t.clientY;tT=Date.now();}
function up(e){if(!run||paused)return;var t=e.changedTouches?e.changedTouches[0]:e;if(Date.now()-tT<300&&t.clientY-tY>-30)jp();}
function jp(){if(!run||paused)return;if(st.goat.onG){st.goat.vy=-13;st.goat.onG=false;st.goat.j=1;}else if(st.goat.j===1){st.goat.vy=-11;st.goat.j=2;}}
cvs.addEventListener('touchstart',dn,{passive:false});cvs.addEventListener('touchend',up);
cvs.addEventListener('mousedown',dn);cvs.addEventListener('mouseup',up);
function gs(){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on');});['hud','world','pw','hint','pause'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display=id==='hud'?'flex':'block';});setTimeout(function(){var h=document.getElementById('hint');if(h)h.style.display='none';},3000);W=cvs.width=innerWidth;H=cvs.height=innerHeight;gy=H*0.78;init();run=true;paused=false;lp();}
function ge(){run=false;document.getElementById('oSc').textContent=Math.floor(st.d).toLocaleString('fa-IR');document.getElementById('oCn').textContent=st.cn.toLocaleString('fa-IR');document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on');});document.getElementById('over').classList.add('on');['hud','world','pw','pause'].forEach(function(k){var e=document.getElementById(k);if(e)e.style.display='none';});}
function gp(){if(!run)return;paused=true;document.getElementById('pauseScr').classList.add('on');}
function gr(){paused=false;document.getElementById('pauseScr').classList.remove('on');}
function ss(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on');});document.getElementById(id).classList.add('on');['hud','world','pw','pause'].forEach(function(k){var e=document.getElementById(k);if(e)e.style.display='none';});}
function lp(){if(!run||paused)return;u2();dr();requestAnimationFrame(lp);}
function u2(){st.t++;var w=W1[st.w];if(st.d-st.ws>=w.l&&st.w<W1.length-1){st.w++;st.ws=st.d;}st.sp=4+st.w*0.8+Math.min(st.t/3000,3);st.d+=st.sp*0.12;
if(st.inv>0)st.inv--;if(st.goat.fl>0)st.goat.fl--;
st.goat.vy+=0.7;st.goat.y+=st.goat.vy;if(st.goat.y>=gy-30){st.goat.y=gy-30;st.goat.vy=0;st.goat.onG=true;st.goat.j=0;}
st.spT--;if(st.spT<=0){st.spT=Math.max(60-st.t/100,25)+Math.random()*20;var t=w.o[Math.floor(Math.random()*w.o.length)];var sz={grass:[28,32],rock:[36,26],bush:[44,30],log:[60,24],butterfly:[30,26],cactus:[32,44],skull:[30,30],car:[70,34],cone:[24,28],hydrant:[20,34],asteroid:[36,36],star:[30,30],ufo:[50,30]}[t]||[30,30];var air=['asteroid','star','ufo'].indexOf(t)>=0;var y=air?gy-50-Math.random()*80:gy-sz[1];st.obs.push({x:W+40,y:y,w:sz[0],h:sz[1],t:t,rt:0});}
if(Math.random()<0.04)st.coins.push({x:W+30,y:gy-70-Math.random()*40,rt:0,got:false});
st.obs.forEach(function(o){o.x-=st.sp;if(o.t==='asteroid'||o.t==='star')o.rt+=0.03;});st.coins.forEach(function(c){c.x-=st.sp;c.rt+=0.1;});
st.obs=st.obs.filter(function(o){return o.x+o.w>-80;});st.coins=st.coins.filter(function(c){return c.x>-40&&!c.got;});
var bx=70,by=st.goat.y,bw=40,bh=30;
if(st.inv<=0)for(var i=0;i<st.obs.length;i++){var o=st.obs[i];if(bx+bw>o.x+6&&bx<o.x+o.w-6&&by+bh>o.y+6&&by<o.y+o.h-6){st.lives--;st.inv=90;st.goat.fl=30;for(var k=0;k<15;k++)st.parts.push({x:bx+bw/2,y:by+bh/2,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10,life:30});if(st.lives<=0){ge();return;}break;}}
st.coins.forEach(function(c){var dx=bx+bw/2-c.x,dy=by+bh/2-c.y;if(Math.sqrt(dx*dx+dy*dy)<30&&!c.got){c.got=true;st.cn++;}});
st.parts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=0.3;p.life--;});st.parts=st.parts.filter(function(p){return p.life>0;});
var e;e=document.getElementById('hCoin');if(e)e.textContent=st.cn.toLocaleString('fa-IR');
e=document.getElementById('hLife');if(e)e.textContent=st.lives>=2?'❤️❤️':st.lives===1?'❤️🖤':'🖤🖤';
e=document.getElementById('hSc');if(e)e.textContent=Math.floor(st.d).toLocaleString('fa-IR');
e=document.getElementById('world');if(e)e.textContent=W1[st.w].n;}ذ
function hx(h){h=h.replace('#','');return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function dr(){var w=W1[st.w],c1=hx(w.c1),c2=hx(w.c2);
var g=ctx.createLinearGradient(0,0,0,gy);g.addColorStop(0,'rgb('+c1.join(',')+')');g.addColorStop(1,'rgb('+c2.join(',')+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,gy);
if(w.c1!=='#0a0a1a'){ctx.fillStyle='#ffd93b';ctx.shadowColor='#ffd93b';ctx.shadowBlur=40;ctx.beginPath();ctx.arc(W*0.78,90,36,0,7);ctx.fill();ctx.shadowBlur=0;}
if(w.c1==='#0a0a1a')for(var i=0;i<100;i++){var sx=(i*53.7+st.t*0.1)%W,sy=(i*37.3)%gy;ctx.fillStyle='rgba(255,255,255,'+(0.4+(i%5)*0.12)+')';ctx.beginPath();ctx.arc(sx,sy,1+(i%3)*0.6,0,7);ctx.fill();}
var gc=hx(w.g);ctx.fillStyle='rgb('+gc.join(',')+')';ctx.fillRect(0,gy,W,H-gy);
st.obs.forEach(function(o){ctx.save();if(o.rt){ctx.translate(o.x+o.w/2,o.y+o.h/2);ctx.rotate(o.rt);ctx.translate(-(o.x+o.w/2),-(o.y+o.h/2));}
if(o.t==='grass'||o.t==='bush'){ctx.fillStyle='#2d7a3d';ctx.beginPath();ctx.arc(o.x+o.w*0.3,o.y+o.h-12,12,0,7);ctx.arc(o.x+o.w*0.7,o.y+o.h-12,12,0,7);ctx.arc(o.x+o.w/2,o.y+8,14,0,7);ctx.fill();ctx.fillStyle='#3d9a4d';ctx.beginPath();ctx.arc(o.x+o.w/2-4,o.y+12,8,0,7);ctx.fill();}
else if(o.t==='rock'||o.t==='asteroid'){ctx.fillStyle=o.t==='asteroid'?'#8a7a6a':'#7a7a8a';ctx.beginPath();ctx.moveTo(o.x,o.y+o.h);ctx.lineTo(o.x+o.w*0.3,o.y+4);ctx.lineTo(o.x+o.w*0.7,o.y);ctx.lineTo(o.x+o.w,o.y+o.h);ctx.fill();}
else if(o.t==='log'){ctx.fillStyle='#8b6f47';ctx.fillRect(o.x,o.y+o.h*0.3,o.w,o.h*0.7);}
else if(o.t==='butterfly'){var wg=Math.sin(st.t*0.5)*5;ctx.fillStyle='#ff69b4';ctx.beginPath();ctx.ellipse(o.x+o.w/2-6,o.y+o.h/2,6,wg+4,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(o.x+o.w/2+6,o.y+o.h/2,6,wg+4,0,0,7);ctx.fill();}
else if(o.t==='cactus'){ctx.fillStyle='#2d7a3d';ctx.fillRect(o.x+o.w/2-6,o.y,12,o.h);ctx.fillRect(o.x+o.w/2-16,o.y+o.h*0.3,10,5);ctx.fillRect(o.x+o.w/2+6,o.y+o.h*0.5,10,5);}
else if(o.t==='skull'){ctx.fillStyle='#e8e0d0';ctx.beginPath();ctx.arc(o.x+o.w/2,o.y+o.h*0.4,o.w*0.4,0,7);ctx.fill();ctx.fillRect(o.x+o.w*0.3,o.y+o.h*0.6,o.w*0.4,o.h*0.3);ctx.fillStyle='#333';ctx.beginPath();ctx.arc(o.x+o.w*0.35,o.y+o.h*0.4,3,0,7);ctx.arc(o.x+o.w*0.65,o.y+o.h*0.4,3,0,7);ctx.fill();}
else if(o.t==='car'){var col=['#e74c3c','#3498db','#f39c12','#9b59b6'][Math.floor(o.x/100)%4];ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(o.x+6,o.y+o.h);ctx.lineTo(o.x+6,o.y+14);ctx.lineTo(o.x+18,o.y+8);ctx.lineTo(o.x+o.w-18,o.y+8);ctx.lineTo(o.x+o.w-6,o.y+14);ctx.lineTo(o.x+o.w-6,o.y+o.h);ctx.fill();ctx.fillStyle='#87ceeb';ctx.fillRect(o.x+20,o.y+10,o.w-40,8);ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(o.x+18,o.y+o.h-4,7,0,7);ctx.arc(o.x+o.w-18,o.y+o.h-4,7,0,7);ctx.fill();}
else if(o.t==='cone'){ctx.fillStyle='#ff6b35';ctx.beginPath();ctx.moveTo(o.x+o.w/2,o.y);ctx.lineTo(o.x+o.w,o.y+o.h);ctx.lineTo(o.x,o.y+o.h);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(o.x+3,o.y+o.h*0.55,o.w-6,5);}
else if(o.t==='hydrant'){ctx.fillStyle='#e74c3c';ctx.fillRect(o.x+4,o.y+6,o.w-8,o.h-6);ctx.fillRect(o.x,o.y,o.w,10);}
else if(o.t==='star'){ctx.shadowColor='#ffe66d';ctx.shadowBlur=20;ctx.fillStyle='#ffe66d';ctx.beginPath();for(var i2=0;i2<10;i2++){var ang=(i2*Math.PI/5)-Math.PI/2;var r=i2%2===0?o.w/2:o.w/4;var px=o.x+o.w/2+Math.cos(ang)*r,py=o.y+o.h/2+Math.sin(ang)*r;if(i2===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();ctx.shadowBlur=0;}
else if(o.t==='ufo'){ctx.fillStyle='#a0a0c0';ctx.beginPath();ctx.ellipse(o.x+o.w/2,o.y+o.h*0.7,o.w/2,o.h*0.4,0,0,7);ctx.fill();ctx.fillStyle='rgba(100,255,200,.7)';ctx.beginPath();ctx.arc(o.x+o.w/2,o.y+o.h*0.5,o.w*0.3,Math.PI,0);ctx.fill();}
ctx.restore();});
st.coins.forEach(function(c){if(c.got)return;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rt);ctx.fillStyle='#ffd700';ctx.strokeStyle='#b8860b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#b8860b';ctx.font='bold 12px Tahoma';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',0,1);ctx.restore();});
st.parts.forEach(function(p){ctx.fillStyle='#e74c3c';ctx.globalAlpha=p.life/30;ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();ctx.globalAlpha=1;});
if(!(st.goat.fl>0&&Math.floor(st.goat.fl/5)%2===0)){var x=70,y=st.goat.y;ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(x+20,gy+3,22,3,0,0,7);ctx.fill();ctx.save();ctx.translate(x,y);ctx.fillStyle='#b0b0b0';ctx.beginPath();ctx.ellipse(20,16,18,11,0,0,7);ctx.fill();ctx.fillStyle='#909090';var lo=st.goat.onG?Math.sin(st.t*0.4)*3:0;ctx.fillRect(8,24,4,12+lo);ctx.fillRect(16,24,4,12-lo);ctx.fillRect(26,24,4,12-lo);ctx.fillRect(34,24,4,12+lo);ctx.fillStyle='#c0c0c0';ctx.beginPath();ctx.ellipse(40,12,8,7,0,0,7);ctx.fill();ctx.fillStyle='#666';ctx.beginPath();ctx.moveTo(37,6);ctx.lineTo(38,0);ctx.lineTo(40,6);ctx.fill();ctx.beginPath();ctx.moveTo(43,6);ctx.lineTo(44,0);ctx.lineTo(46,6);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(42,11,2,0,7);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(42.5,11,1.2,0,7);ctx.fill();ctx.strokeStyle='#b0b0b0';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(4,14);ctx.quadraticCurveTo(-3,10,0,18);ctx.stroke();ctx.restore();}
if(st.inv>0&&Math.floor(st.inv/5)%2===0){ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+20,y+16,35,0,7);ctx.stroke();}}
W=cvs.width=innerWidth;H=cvs.height=innerHeight;gy=H*0.78;init();
addEventListener('resize',function(){W=cvs.width=innerWidth;H=cvs.height=innerHeight;gy=H*0.78;});
