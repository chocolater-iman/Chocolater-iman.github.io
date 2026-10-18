import {h} from '../utils/dom.js';
export const toast=(msg,err=false)=>{const t=h('div',{class:'toast'+(err?' err':'')},msg);document.getElementById('toasts').append(t);setTimeout(()=>t.remove(),3200)};
