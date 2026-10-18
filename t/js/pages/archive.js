import {h} from '../utils/dom.js';
import * as D from '../services/data.js';
import {KINDS} from '../kinds.js';
import {dayKey,fdate,hm,fa,sum} from '../utils/format.js';
import {exportXlsx,reportSheets} from '../services/export.js';
import {toast} from '../components/toast.js';
/** Per-user archive: only the signed-in user's rows are ever returned (RLS user_id = auth.uid()). */
export default async root=>{let rows=[];
const f={from:h('input',{type:'date',class:'inp',value:dayKey(Date.now()-30*864e5),onchange:()=>load()}),to:h('input',{type:'date',class:'inp',value:dayKey(new Date()),onchange:()=>load()}),
kind:h('select',{class:'inp',onchange:()=>load()},h('option',{value:''},'همه'),Object.entries(KINDS).map(([k,m])=>h('option',{value:k},m.icon+' '+m.label))),q:h('input',{class:'inp',placeholder:'جستجو…',oninput:()=>draw()})};
const out=h('div',{class:'list'}),info=h('span',{class:'muted'});
function draw(){const q=f.q.value.trim(),by={};rows.filter(r=>!q||KINDS[r.kind].line(r.data).includes(q)).forEach(r=>(by[dayKey(r.ts)]??=[]).push(r));
const ds=Object.keys(by).sort().reverse();info.textContent=`${fa(rows.length)} ثبت در ${fa(ds.length)} روز`;
out.replaceChildren(...(ds.length?ds.map((d,i)=>{const x=by[d],cal=sum(x.filter(r=>r.kind==='food'),r=>r.data.cal);
return h('details',{open:i?null:''},h('summary',{},h('span',{},fdate(d+'T12:00')),h('span',{class:'muted'},`${fa(x.length)} ثبت`+(cal?` · ${fa(cal)} kcal`:''))),x.map(r=>h('div',{class:'row'},h('b',{},hm(r.ts)),h('span',{},KINDS[r.kind].icon+' '+KINDS[r.kind].line(r.data)))))}):[h('p',{class:'muted'},'موردی یافت نشد.')]))}
async function load(){try{rows=await D.list(f.kind.value||null,new Date(f.from.value+'T00:00').toISOString(),new Date(f.to.value+'T23:59:59').toISOString());draw()}catch(e){toast(e.message,true)}}
const exp=()=>{try{if(!rows.length)return toast('داده‌ای برای خروجی نیست',true);exportXlsx(`archive-${f.from.value}_${f.to.value}`,reportSheets(rows,null,'آرشیو'));toast('فایل اکسل ساخته شد')}catch(e){toast(e.message,true)}};
const L=(t,el)=>h('label',{class:'muted'},t,el);
root.replaceChildren(h('h2',{},'آرشیو سوابق من'),h('div',{class:'card'},h('div',{class:'grid'},L('از تاریخ',f.from),L('تا تاریخ',f.to),L('نوع',f.kind),L('جستجو',f.q)),h('div',{style:'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap'},info,h('button',{class:'btn',onclick:exp},'⬇ اکسل'))),out);
await load()};
