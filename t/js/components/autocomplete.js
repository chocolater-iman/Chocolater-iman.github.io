import {h} from '../utils/dom.js';
const DG='۰۱۲۳۴۵۶۷۸۹';
/** Normalise Persian text so ي/ی, ك/ک, آ/ا, ZWNJ, digits and spacing never block a match. */
export const norm=s=>String(s??'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[آأإٱ]/g,'ا').replace(/ة/g,'ه').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[۰-۹]/g,d=>DG.indexOf(d)).replace(/[\u200c_\-]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
/** Live-suggestion combobox. opts:{items:()=>[],get,hay,sub,max,placeholder,required} -> {wrap,input,find} */
export function autocomplete({items,get,hay=get,sub,max=20,placeholder,required}){
let idx=[],len=-1,res=[],act=0;
const input=h('input',{class:'inp',autocomplete:'off',autocapitalize:'off',spellcheck:'false',enterkeyhint:'next',role:'combobox','aria-expanded':'false',placeholder,required:required?'':null});
const list=h('div',{class:'ac-list',role:'listbox',hidden:''}),wrap=h('div',{class:'ac'},input,list);
const index=()=>{const a=items()||[];if(a.length!==len){len=a.length;idx=a.map(x=>({x,n:norm(get(x)),h:norm(hay(x))}))}return idx};
const find=q=>{const t=norm(q).split(' ').filter(Boolean);if(!t.length)return[];const all=t.join(' ');
const sc=e=>e.n===all?0:e.n.startsWith(t[0])?1:e.n.split(' ').some(w=>w.startsWith(t[0]))?2:e.n.includes(t[0])?3:4;
return index().filter(e=>t.every(k=>e.h.includes(k))).map(e=>[sc(e),e]).sort((a,b)=>a[0]-b[0]||a[1].n.length-b[1].n.length).slice(0,max).map(p=>p[1])};
const hl=(name,k)=>{const n=norm(name),i=n.length===name.length?n.indexOf(k):-1;return i<0?[name]:[name.slice(0,i),h('mark',{},name.slice(i,i+k.length)),name.slice(i+k.length)]};
const pick=e=>{input.value=get(e.x);list.hidden=true;const f=[...input.form.elements].filter(x=>/^(INPUT|SELECT)$/.test(x.tagName)),n=f[f.indexOf(input)+1];n?.focus();n?.select?.()};
const mark=()=>[...list.children].forEach((c,i)=>{c.classList.toggle('on',i===act);i===act&&c.scrollIntoView({block:'nearest'})});
function draw(){const q=input.value.trim();res=q?find(q):[];act=0;const k=norm(q).split(' ')[0]||'';
list.replaceChildren(...(res.length?res.map((e,i)=>h('div',{class:'ac-item'+(i?'':' on'),role:'option',onmousedown:ev=>ev.preventDefault(),onclick:()=>pick(e)},h('span',{},hl(get(e.x),k)),sub&&h('small',{},sub(e.x)))):q?[h('div',{class:'ac-empty'},'موردی پیدا نشد')]:[]));
list.hidden=!q;input.setAttribute('aria-expanded',String(!!q))}
input.addEventListener('input',draw);
input.addEventListener('focus',()=>{draw();matchMedia('(max-width:640px)').matches&&setTimeout(()=>wrap.scrollIntoView({block:'start',behavior:'smooth'}),250)});
input.addEventListener('blur',()=>setTimeout(()=>{list.hidden=true},150));
input.addEventListener('keydown',e=>{if(list.hidden||!res.length)return;const k=e.key;
if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();act=(act+(k==='ArrowDown'?1:-1)+res.length)%res.length;mark()}
else if(k==='Enter'){e.preventDefault();pick(res[act])}else if(k==='Escape')list.hidden=true});
return {wrap,input,find}}
