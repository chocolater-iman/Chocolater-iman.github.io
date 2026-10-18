import {h} from '../utils/dom.js';
let open=null;
export const hideMenu=()=>{open?.remove();open=null};
function build(items,close){return h('div',{class:'ctx'},items.map(i=>i==='-'?h('div',{class:'ctx-sep'}):h('div',{class:'ctx-item'+(i.disabled?' dis':'')+(i.danger?' danger':''),onclick:e=>{if(i.children){e.stopPropagation();e.currentTarget.classList.toggle('open');return}close();i.onClick?.()}},h('span',{},i.icon||''),i.label,i.shortcut&&h('kbd',{},i.shortcut),i.children&&h('kbd',{},'◂'),i.children&&build(i.children,close))))}
export function showMenu(x,y,items){hideMenu();const m=build(items,hideMenu);document.body.append(m);open=m;
const r=m.getBoundingClientRect();m.style.left=Math.max(4,Math.min(x,innerWidth-r.width-4))+'px';m.style.top=Math.max(4,Math.min(y,innerHeight-r.height-4))+'px'}
export function bindMenu(el,getItems){let t;
el.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();showMenu(e.clientX,e.clientY,getItems())});
el.addEventListener('touchstart',e=>{const p=e.touches[0];t=setTimeout(()=>showMenu(p.clientX,p.clientY,getItems()),550)},{passive:true});
['touchend','touchmove','touchcancel'].forEach(n=>el.addEventListener(n,()=>clearTimeout(t),{passive:true}))}
document.addEventListener('click',hideMenu);document.addEventListener('keydown',e=>e.key==='Escape'&&hideMenu());
