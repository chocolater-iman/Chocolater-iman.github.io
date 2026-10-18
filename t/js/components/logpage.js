import {h} from '../utils/dom.js';
import * as D from '../services/data.js';
import {bindMenu} from './contextmenu.js';
import {toast} from './toast.js';
import {autocomplete} from './autocomplete.js';
import {dayKey,nowHM,hm,dayRange,TIME_RE} from '../utils/format.js';
const dig=s=>s.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٫،,]/g,'.');
const num=s=>{s=dig(s).trim();return s===''?null:Number(s)};
const tfmt=e=>{const v=dig(e.target.value).replace(/\D/g,'').slice(0,4);e.target.value=v.length>2?v.slice(0,2)+':'+v.slice(2):v};
/** Generic log page: form + day list + search + context menu. cfg: {title,kind,fields,line,prep,before,top} */
export const logPage=cfg=>async root=>{
let day=dayKey(new Date()),editing=null,rows=[];const inputs={};
const topEl=h('div'),listEl=h('div',{class:'list'});
const q=h('input',{class:'inp',placeholder:'جستجو…',oninput:()=>draw()});
const dayIn=h('input',{type:'date',class:'inp',value:day,onchange:e=>{day=e.target.value;load()}});
const timeIn=h('input',{class:'inp',pattern:TIME_RE,inputmode:'numeric',maxlength:5,placeholder:'HH:MM',value:nowHM(),required:'',oninput:tfmt});
const form=h('form',{class:'form',onsubmit:save},h('label',{},'تاریخ',dayIn),h('label',{},'ساعت (۲۴ ساعته)',timeIn),
...cfg.fields.map(f=>{const ac=f.ac&&autocomplete(f.ac);const el=ac?ac.input:f.options?h('select',{class:'inp'},f.options.map(o=>h('option',{value:o},o))):h('input',{class:'inp',type:'text',inputmode:f.time?'numeric':f.type==='number'?'decimal':null,maxlength:f.time?5:null,oninput:f.time?tfmt:null,placeholder:f.ph||'',required:f.req?'':null});if(f.def)el.value=f.def;inputs[f.k]=el;return h('label',{},f.label,ac?ac.wrap:el)}),
h('button',{class:'btn primary'},editing?'ذخیره':'ثبت'));
async function load(){const[a,b]=dayRange(day);try{rows=await D.list(cfg.kind,a,b)}catch(e){toast(e.message,true)}draw()}
function draw(){const f=rows.filter(r=>!q.value||JSON.stringify(r.data).includes(q.value));
listEl.replaceChildren(...(f.length?f.map(row):[h('p',{class:'muted'},'موردی ثبت نشده است.')]));
topEl.replaceChildren(cfg.top?cfg.top(rows):'')}
function row(r){const el=h('div',{class:'row'},h('b',{},hm(r.ts)),h('span',{},cfg.line(r.data)));
bindMenu(el,()=>[{label:'ویرایش',icon:'✎',shortcut:'E',onClick:()=>edit(r)},{label:'تکرار (اکنون)',icon:'⧉',onClick:()=>dup(r)},{label:'بیشتر',icon:'⋯',children:[{label:'کپی متن',icon:'⎘',onClick:()=>navigator.clipboard.writeText(cfg.line(r.data))}]},'-',{label:'حذف',icon:'🗑',danger:true,onClick:()=>del(r)}]);return el}
function edit(r){editing=r.id;timeIn.value=hm(r.ts);cfg.fields.forEach(f=>inputs[f.k].value=r.data[f.k]??'');scrollTo({top:0,behavior:'smooth'})}
async function dup(r){try{await D.add(cfg.kind,new Date().toISOString(),r.data);toast('تکرار شد');load()}catch(e){toast(e.message,true)}}
async function del(r){if(!confirm('حذف شود؟'))return;try{await D.remove(r.id);toast('حذف شد');load()}catch(e){toast(e.message,true)}}
async function save(e){e.preventDefault();try{let data={};cfg.fields.forEach(f=>{const v=f.type==='number'?num(inputs[f.k].value):inputs[f.k].value;if(typeof v==='number'&&isNaN(v))throw new Error('عدد نامعتبر است');data[f.k]=v});
if(cfg.prep)data=await cfg.prep(data);const ts=new Date(day+'T'+timeIn.value).toISOString();
editing?await D.update(editing,{ts,data}):await D.add(cfg.kind,ts,data);toast('ثبت شد');editing=null;form.reset();timeIn.value=nowHM();load()}catch(err){toast(err.message,true)}}
root.replaceChildren(h('h2',{},cfg.title),topEl,h('div',{class:'split'},h('div',{class:'card'},form),h('div',{class:'card'},q,listEl)),cfg.before?await cfg.before():'');
await load()};
