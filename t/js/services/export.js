import {KINDS} from '../kinds.js';
import {dayKey,fdate,hm,sum,avg} from '../utils/format.js';
const r1=v=>typeof v==='number'?Math.round(v*10)/10:v;
const day=d=>fdate(d+'T12:00');
/** entries -> [[sheetName, rows[]]]: summary, per-day totals, and one sheet per record kind. */
export function reportSheets(rows,est,label=''){
const asc=[...rows].sort((a,b)=>a.ts<b.ts?-1:1),of=(a,k)=>a.filter(r=>r.kind===k),by={};
asc.forEach(r=>(by[dayKey(r.ts)]??=[]).push(r));const keys=Object.keys(by);
const S=(x,k,f)=>r1(sum(of(x,k),r=>r.data[f])),A=(x,k,f)=>r1(avg(of(x,k),r=>r.data[f])),ws=of(asc,'weight');
const summary=[['بازه گزارش',label],['تعداد ثبت‌ها',rows.length],['میانگین کالری روزانه',r1(sum(of(asc,'food'),r=>r.data.cal)/Math.max(1,keys.length))],['مجموع قدم',S(asc,'activity','steps')],['میانگین قند خون (mg/dL)',A(asc,'glucose','mgdl')],['میانگین خواب (ساعت)',A(asc,'sleep','hours')],['تغییر وزن (kg)',ws.length>1?r1(ws.at(-1).data.kg-ws[0].data.kg):null],['HbA1c تخمینی (٪)',est==null?null:r1(est)]].map(([a,b])=>({'شاخص':a,'مقدار':b}));
const daily=keys.map(d=>{const x=by[d];return{'تاریخ':day(d),'تاریخ میلادی':d,'کالری دریافتی':S(x,'food','cal'),'پروتئین (g)':S(x,'food','pro'),'کربوهیدرات (g)':S(x,'food','carb'),'چربی (g)':S(x,'food','fat'),'قدم':S(x,'activity','steps'),'کالری فعالیت':S(x,'activity','kcal'),'میانگین قند':A(x,'glucose','mgdl'),'انسولین (واحد)':S(x,'insulin','dose'),'خواب (ساعت)':A(x,'sleep','hours'),'وزن (kg)':of(x,'weight').at(-1)?.data.kg??null}});
const kinds=Object.entries(KINDS).map(([k,m])=>[m.label,of(asc,k).map(r=>({'تاریخ':day(dayKey(r.ts)),'تاریخ میلادی':dayKey(r.ts),'ساعت':hm(r.ts),...Object.fromEntries(Object.entries(m.cols).map(([c,f])=>[c,r1(r.data[f]??null)]))}))]).filter(([,a])=>a.length);
return [['خلاصه',summary],['روزانه',daily],...kinds]}
/** Needs SheetJS (global XLSX, loaded in index.html). Sheets open right-to-left. */
export function exportXlsx(name,sheets){
if(!window.XLSX)throw new Error('کتابخانه اکسل بارگذاری نشد؛ اینترنت را بررسی کنید');
const wb=XLSX.utils.book_new();wb.Workbook={Views:[{RTL:true}]};
sheets.forEach(([n,rows])=>{const ws=XLSX.utils.json_to_sheet(rows);
if(rows.length)ws['!cols']=Object.keys(rows[0]).map(k=>({wch:Math.min(40,Math.max(k.length,...rows.map(r=>String(r[k]??'').length))+3)}));
XLSX.utils.book_append_sheet(wb,ws,n.slice(0,31))});
XLSX.writeFile(wb,name+'.xlsx')}
