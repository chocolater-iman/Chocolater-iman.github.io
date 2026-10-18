import {h} from '../utils/dom.js';
import * as D from '../services/data.js';
import {dayKey,fa,fdate,sum,avg} from '../utils/format.js';
import {a1c} from '../utils/calc.js';
import {exportXlsx,reportSheets} from '../services/export.js';
import {toast} from '../components/toast.js';
const P={day:['روزانه',1],week:['هفتگی',7],month:['ماهانه',30]};
export default async root=>{const out=h('div');let cur='week',snap=null;const exp=()=>{try{if(!snap?.rows.length)return toast('داده‌ای برای خروجی نیست',true);exportXlsx(`report-${cur}-${dayKey(new Date())}`,reportSheets(snap.rows,snap.est,snap.label));toast('فایل اکسل ساخته شد')}catch(e){toast(e.message,true)}};const bar=h('div',{class:'tabs'});
async function go(k){cur=k;bar.replaceChildren(...Object.entries(P).map(([x,[n]])=>h('button',{class:'btn'+(x===cur?' on':''),onclick:()=>go(x)},n)),h('button',{class:'btn',onclick:exp},'⬇ اکسل'));
const days=P[k][1],from=new Date();from.setHours(0,0,0,0);from.setDate(from.getDate()-days+1);
const [rows,g90]=await Promise.all([D.list(null,from.toISOString(),new Date().toISOString()),D.list('glucose',new Date(Date.now()-90*864e5).toISOString(),new Date().toISOString())]);
const by={};rows.forEach(r=>(by[dayKey(r.ts)]??=[]).push(r));const keys=Object.keys(by).sort();
const of=(a,kd)=>a.filter(r=>r.kind===kd),cal=d=>sum(of(by[d],'food'),r=>r.data.cal),mx=Math.max(1,...keys.map(cal));
const gl=of(rows,'glucose'),ws=of(rows,'weight').reverse(),sl=of(rows,'sleep');
const est=a1c(avg(g90,r=>r.data.mgdl));snap={rows,est,label:P[k][0]};
out.replaceChildren(h('div',{class:'grid'},
...[['میانگین کالری روزانه',fa(sum(of(rows,'food'),r=>r.data.cal)/Math.max(1,keys.length))],['مجموع قدم',fa(sum(of(rows,'activity'),r=>r.data.steps))],['میانگین قند',fa(avg(gl,r=>r.data.mgdl))+' mg/dL'],['میانگین خواب',fa(avg(sl,r=>r.data.hours))+' ساعت'],
['تغییر وزن',ws.length>1?fa(ws.at(-1).data.kg-ws[0].data.kg)+' kg':'—'],['HbA1c تخمینی (۹۰ روز)',est?fa(est)+'٪':'—']].map(([t,v])=>h('div',{class:'card stat'},h('span',{class:'muted'},t),h('b',{},v)))),
h('div',{class:'card'},h('h2',{},'کالری دریافتی به تفکیک روز'),h('div',{class:'bars'},keys.map(d=>h('i',{title:`${fdate(d)}: ${fa(cal(d))}`,style:`height:${cal(d)/mx*100}%`})))),
h('div',{class:'card',style:'margin-top:16px;overflow:auto'},h('table',{},h('tr',{},['تاریخ','کالری','قدم','میانگین قند','خواب'].map(x=>h('th',{},x))),
keys.map(d=>h('tr',{},h('td',{},fdate(d)),h('td',{},fa(cal(d))),h('td',{},fa(sum(of(by[d],'activity'),r=>r.data.steps))),h('td',{},fa(avg(of(by[d],'glucose'),r=>r.data.mgdl))),h('td',{},fa(avg(of(by[d],'sleep'),r=>r.data.hours))))))),
h('p',{class:'muted'},'HbA1c تخمینی با فرمول ADAG و تنها برای اطلاع است و جایگزین آزمایش نیست.'))}
root.replaceChildren(h('h2',{},'گزارش‌ها'),bar,out);await go(cur)};
