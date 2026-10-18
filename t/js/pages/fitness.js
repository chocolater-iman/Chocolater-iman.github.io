import {h} from '../utils/dom.js';
import * as D from '../services/data.js';
import {state} from '../state.js';
import {toast} from '../components/toast.js';
import {GOALS,LEVELS,plan,stepsKcal} from '../utils/fitness.js';
import {bmiCat,stepsToKm} from '../utils/calc.js';
import {dayKey,dayRange,fa,sum} from '../utils/format.js';
const S=(t,v,s,c)=>h('div',{class:'card stat',style:c?`--c:${c}`:null},h('span',{class:'muted'},t),h('b',{},v),s&&h('span',{class:'muted'},s));
const meter=(v,t)=>h('div',{class:'meter'},h('i',{style:`width:${Math.min(100,v/t*100)}%`+(v>t?';background:var(--danger)':'')}));
const R=n=>Math.round(n/10)*10,P=(...a)=>h('p',{class:'muted'},...a);
export default async root=>{
const now=new Date(),from=new Date(),end=dayRange(dayKey(now))[1];from.setHours(0,0,0,0);from.setDate(from.getDate()-6);
const [w,act,food]=await Promise.all([D.list('weight',new Date(Date.now()-730*864e5).toISOString(),end),D.list('activity',from.toISOString(),end),D.list('food',...dayRange(dayKey(now)))]);
const lw=w[0]?.data;
if(!lw)return root.replaceChildren(h('h2',{},'تناسب اندام'),h('div',{class:'card'},h('p',{},'برای محاسبه، ابتدا وزن، قد و جنسیت خود را در «سلامت ← وزن» ثبت کنید.'),h('a',{class:'btn primary',href:'#health'},'رفتن به سلامت')));
const days=[...Array(7)].map((_,i)=>{const d=new Date(from);d.setDate(from.getDate()+i);return dayKey(d)}),steps=Object.fromEntries(days.map(k=>[k,0]));
act.forEach(r=>{const k=dayKey(r.ts);if(k in steps)steps[k]+=+r.data.steps||0});
const logged=days.filter(k=>steps[k]>0),avg=logged.length?sum(logged,k=>steps[k])/logged.length:0,today=steps[dayKey(now)],mx=Math.max(1,...days.map(k=>steps[k]));
const p=state.profile,out=h('div',{class:'stack'});
const pick=(k,map,fmt,def)=>h('select',{class:'inp',onchange:async e=>{try{await D.saveProfile({id:state.user.id,[k]:e.target.value});p[k]=e.target.value;toast('ذخیره شد');draw()}catch(x){toast(x.message,true)}}},Object.entries(map).map(([v,m])=>h('option',{value:v,selected:(p[k]||def)===v?'':null},fmt(m))));
function draw(){const goal=p.goal||'maintain',level=p.activity||'sedentary',sex=p.sex||'male',cm=lw.cm||p.height;
const r=plan({kg:lw.kg,cm,age:p.age,sex,bmrIn:lw.bmr,goal,level,avgSteps:avg}),[cat]=bmiCat(r.bmi),pr=r.protein,t=R(r.target);
const sk=s=>stepsKcal(s,cm,sex,r.bmr),cal=sum(food,x=>x.data.cal),pro=sum(food,x=>x.data.pro),f2=r.factor.toLocaleString('fa-IR');
out.replaceChildren(
h('div',{class:'chips'},[sex==='female'?'زن':'مرد',`${fa(p.age)} سال`,`${fa(cm)} cm`,`${fa(lw.kg)} kg`,`BMI ${fa(r.bmi)} · ${cat}`,`BMR ${fa(r.bmr)} (${r.src})`].map(x=>h('span',{},x))),
h('div',{class:'grid'},
S('قدم‌های امروز',fa(today),`≈ ${fa(sk(today))} kcal · ${fa(stepsToKm(today,cm,sex))} km`,'var(--accent2)'),
S('میانگین ۷ روز اخیر',fa(avg),logged.length?`از ${fa(logged.length)} روز ثبت‌شده · ≈ ${fa(r.extraSteps)} kcal در روز`:'قدمی ثبت نشده؛ از بخش فعالیت ثبت کنید','var(--warn)'),
h('div',{class:'card'},h('div',{class:'bars'},days.map(k=>h('i',{style:`height:${steps[k]/mx*100}%`}))),h('div',{class:'barl'},days.map(k=>h('small',{},new Date(k+'T12:00').toLocaleDateString('fa-IR',{weekday:'narrow'}),h('br'),fa(steps[k])))))),
h('div',{class:'grid'},
S('کالری مجاز روزانه',`${fa(t)} kcal`,`${GOALS[goal][0]} · ${r.weekly>0?'+':''}${fa(r.weekly)} kg در هفته`),
S('پروتئین روزانه',`${fa(pr.g)} گرم`,`محدوده ${fa(pr.lo)} تا ${fa(pr.hi)} · ${fa(pr.gkg)} g/kg · ${fa(pr.pct)}٪ کالری`,'var(--ok)')),
h('div',{class:'card'},h('h2',{},'امروز تا اینجا'),P(`کالری: ${fa(cal)} از ${fa(t)} kcal`),meter(cal,t),P(`پروتئین: ${fa(pro)} از ${fa(pr.g)} گرم`),meter(pro,pr.g)),
...r.notes.map(n=>h('div',{class:'card warn'},'⚠ '+n)),
h('details',{},h('summary',{},'نحوه محاسبه'),
P(`BMR = ${fa(r.bmr)} (${r.userBmr?'مقدار واردشده توسط شما':'فرمول Mifflin–St Jeor بر پایه جنسیت، وزن، قد و سن'})`),
P(`پایه = BMR × ۱٫۲ = ${fa(r.bmr*1.2)}`),
P(`انرژی فعالیت = بزرگ‌تر از دو مقدار: سطح «${LEVELS[level][0]}» (BMR × (${f2} − ۱٫۲) = ${fa(r.extraLevel)}) و کالری قدم‌ها (${fa(r.extraSteps)}) تا دوبار شمرده نشود`),
P(`کالری نگهدارنده = ${fa(r.tdee)}؛ تعدیل هدف ${fa(r.adj)} (هر ۷٬۷۰۰ kcal ≈ ۱ کیلوگرم)`),
P(`پروتئین = ${fa(pr.gkg)} گرم به‌ازای هر کیلوگرم`+(pr.refW!==lw.kg?` از وزن مرجع ${fa(pr.refW)} kg`:'')),
P('کالری قدم‌ها: ۳٫۵ MET با سرعت ۵ km/h؛ طول گام = قد × ۰٫۴۱۵ (مرد) یا ۰٫۴۱۳ (زن)؛ متناسب با BMR فرد')),
P('این اعداد تخمینی‌اند؛ در صورت بیماری یا مصرف دارو (مثل انسولین) پیش از تغییر رژیم با پزشک مشورت کنید.'))}
root.replaceChildren(h('h2',{},'تناسب اندام'),h('div',{class:'card'},h('div',{class:'grid'},h('label',{class:'muted'},'هدف',pick('goal',GOALS,m=>m[0],'maintain')),h('label',{class:'muted'},'سطح فعالیت',pick('activity',LEVELS,m=>`${m[0]} — ${m[1]}`,'sedentary')))),out);
draw()};
