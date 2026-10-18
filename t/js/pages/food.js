import {h} from '../utils/dom.js';
import {logPage} from '../components/logpage.js';
import {MEALS} from '../config.js';
import {fa,sum} from '../utils/format.js';
let foods=null;
const load=async()=>foods||(foods=await fetch('data/foods.json').then(r=>r.json()));
const stat=(t,v,u)=>h('div',{class:'card stat'},h('span',{class:'muted'},t),h('b',{},fa(v)+' '+u));
export default logPage({title:'تغذیه (مقادیر غذاها به‌ازای ۱۰۰ گرم)',kind:'food',
before:async()=>{const f=await load();return h('datalist',{id:'foodlist'},f.map(x=>h('option',{value:x.Persian_Name})))},
fields:[{k:'meal',label:'وعده',options:MEALS},{k:'name',label:'نام غذا',list:'foodlist',req:1},{k:'g',label:'مقدار (گرم)',type:'number',def:'100',req:1}],
prep:async d=>{const f=(await load()).find(x=>x.Persian_Name===d.name);if(!f)throw new Error('غذا در پایگاه داده نیست');const k=d.g/100,n=v=>(v||0)*k;
return {...d,cal:n(f.Calories),fat:n(f.Fat),pro:n(f.Protein),carb:n(f.Carbs),fib:n(f.Fiber),sug:n(f.Sugar)}},
line:d=>`${d.meal} · ${d.name} · ${fa(d.g)}گرم · ${fa(d.cal)} کالری`,
top:rows=>h('div',{class:'grid'},stat('کالری امروز',sum(rows,r=>r.data.cal),'kcal'),stat('پروتئین',sum(rows,r=>r.data.pro),'g'),stat('کربوهیدرات',sum(rows,r=>r.data.carb),'g'),stat('چربی',sum(rows,r=>r.data.fat),'g'),stat('فیبر',sum(rows,r=>r.data.fib),'g'),stat('قند',sum(rows,r=>r.data.sug),'g'))});
