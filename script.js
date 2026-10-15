(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* Theme */
const themeBtn=$('#theme');
function setTheme(t){root.dataset.theme=t;themeBtn.setAttribute('aria-pressed',t==='light');themeBtn.setAttribute('aria-label',t==='light'?'Switch to dark mode':'Switch to light mode');$('meta[name=theme-color]').content=t==='light'?'#F1EBDD':'#0B0B0C'}
setTheme(store.get('theme')||'dark');
themeBtn.onclick=()=>{const t=root.dataset.theme==='dark'?'light':'dark';setTheme(t);store.set('theme',t)};

/* Mobile menu */
const nav=$('#nav'),burger=$('#burger');
burger.onclick=()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o);burger.textContent=o?'Close':'Menu'};
nav.addEventListener('click',e=>{if(e.target.tagName==='A'){nav.classList.remove('open');burger.setAttribute('aria-expanded',false);burger.textContent='Menu'}});

/* Tabs (arrow-key accessible) */
const tabs=$$('[role=tab]');
function pick(i){tabs.forEach((t,j)=>{t.setAttribute('aria-selected',i===j);t.tabIndex=i===j?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=i!==j});tabs[i].focus()}
tabs.forEach((t,i)=>{t.onclick=()=>pick(i);t.onkeydown=e=>{if(e.key==='ArrowRight')pick((i+1)%3);if(e.key==='ArrowLeft')pick((i+2)%3)}});

/* Scroll-driven: smoke intensity + chest doors */
const shift=$('#shift'),chest=$('#chest');let tick=false;
function onScroll(){tick=false;const vh=innerHeight;
 let r=shift.getBoundingClientRect();shift.style.setProperty('--s',Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height*.5))).toFixed(3));
 r=chest.getBoundingClientRect();const p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));chest.style.setProperty('--p',(reduce?1:Math.min(1,p*1.6)).toFixed(3))}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();

/* X-Ray chamber: press and hold */
const xray=$('#xray'),stage=$('#stage');
const on=v=>{stage.classList.toggle('on',v);xray.setAttribute('aria-pressed',v)};
['pointerdown'].forEach(ev=>xray.addEventListener(ev,()=>on(true)));
['pointerup','pointerleave','pointercancel','blur'].forEach(ev=>xray.addEventListener(ev,()=>on(false)));
xray.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();on(true)}});
xray.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')on(false)});

/* Sillage simulator */
const cv=$('#sim'),ctx=cv.getContext('2d'),state=$('#simState');
let W,H,parts=[],mx=-1,my=-1,lx=0,ly=0,speed=0,dwell=0,live=false,raf;
function size(){const d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',size);size();
function emit(){const thunder=speed>14||dwell>40,n=thunder?4:1;
 for(let i=0;i<n&&parts.length<450;i++){const a=Math.random()*6.283,v=thunder?Math.random()*1.6+.3:Math.random()*.4+.1;
  parts.push({x:mx,y:my,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(thunder?.5:.15),r:thunder?18+Math.random()*30:5+Math.random()*7,life:1,d:thunder?.005:.014,t:thunder})}}
function frame(){ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(0,0,W,H);
 if(mx>=0){speed*=.9;dwell=speed<3?dwell+1:0;emit()}
 ctx.globalCompositeOperation='lighter';
 for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.r+=p.t?.35:.05;p.life-=p.d;
  if(p.life<=0){parts.splice(i,1);continue}
  const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r),a=p.life*(p.t?.16:.22);
  g.addColorStop(0,p.t?`rgba(230,150,40,${a})`:`rgba(245,245,240,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill()}
 ctx.globalCompositeOperation='source-over';raf=requestAnimationFrame(frame)}
cv.addEventListener('pointermove',e=>{const b=cv.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top;speed=Math.max(speed,Math.hypot(mx-lx,my-ly));lx=mx;ly=my;state.textContent=speed>14||dwell>40?'The Thunder.':'The Whisper.'});
cv.addEventListener('pointerleave',()=>{mx=-1});
new IntersectionObserver(([e])=>{if(e.isIntersecting&&!reduce){if(!live){live=true;raf=requestAnimationFrame(frame)}}else{live=false;cancelAnimationFrame(raf)}}).observe(cv);

/* Cart */
const drawer=$('#drawer'),scrim=$('#scrim'),body=$('#cartBody'),count=$('#count'),co=$('#checkout');let qty=0,opener=null;
const PRICE=2400;
function render(){count.textContent=qty;$('#cartBtn').setAttribute('aria-label',`Open cart, ${qty} item${qty===1?'':'s'}`);co.disabled=!qty;
 body.innerHTML=qty?`<div class="line"><span>AL-SADA, Extrait de Parfum<br><small>AED ${(qty*PRICE).toLocaleString()}</small></span><span><button aria-label="Remove one" data-d="-1">−</button> ${qty} <button aria-label="Add one" data-d="1">+</button></span></div>`:'<p class="empty">Your cart is empty. Add AL-SADA to begin.</p>'}
function open(v){drawer.hidden=scrim.hidden=!v;if(v){opener=document.activeElement;$('#closeCart').focus()}else if(opener)opener.focus()}
$('#cartBtn').onclick=()=>open(true);$('#closeCart').onclick=$('#scrim').onclick=()=>open(false);
$('#add').onclick=()=>{qty++;render();open(true)};
body.addEventListener('click',e=>{const d=e.target.dataset.d;if(d){qty=Math.max(0,qty+ +d);render()}});
co.onclick=()=>{open(false);$('#reserve').scrollIntoView();$('#reserve input').focus()};
addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden)open(false)});
render();

/* Form validation (client-side mock) */
const form=$('#reserve'),rules={
 name:v=>v.trim().length>=2||'Enter your full name.',
 email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)||'Enter a valid email, like name@example.com.',
 phone:v=>/^\+?[\d\s-]{8,15}$/.test(v)||'Enter a phone number with country code, like +971 50 000 0000.'};
function check(i){const r=rules[i.name](i.value),ok=r===true;i.setAttribute('aria-invalid',!ok);form.querySelector(`[data-for=${i.name}]`).textContent=ok?'':r;return ok}
form.querySelectorAll('input').forEach(i=>i.addEventListener('blur',()=>check(i)));
form.addEventListener('submit',e=>{e.preventDefault();const bad=[...form.querySelectorAll('input')].filter(i=>!check(i));
 const ok=$('#ok');if(bad.length){bad[0].focus();ok.hidden=true;return}
 ok.hidden=false;ok.textContent=`Reserved. We will write to ${form.email.value} to confirm.`;form.reset()});
})();
