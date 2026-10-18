import {h} from '../utils/dom.js';
export function modal(title,body){const close=()=>{o.remove();document.removeEventListener('keydown',esc)};const esc=e=>e.key==='Escape'&&close();
const o=h('div',{class:'overlay',onmousedown:e=>e.target===o&&close()},h('div',{class:'card modal'},h('div',{class:'modal-head'},h('h2',{},title),h('button',{class:'btn',onclick:close},'✕')),body));
document.body.append(o);document.addEventListener('keydown',esc);return close}
