import {h} from '../utils/dom.js';
import {logPage} from '../components/logpage.js';
import {modal} from '../components/modal.js';
import {toast} from '../components/toast.js';
import {norm} from '../components/autocomplete.js';
import * as D from '../services/data.js';
import {calorieTarget} from '../services/target.js';
import {state} from '../state.js';
import {MEALS} from '../config.js';
import {LOW,HIGH,calStatus} from '../utils/status.js';
import {fa,sum,dayKey,dayRange} from '../utils/format.js';
const SPLIT={pro:20,fat:25,carb:55}; // target share of energy (%)
let foods=null,tgt={target:2000},rows0=[],lastRows=null,days7=null,topBox,footBox;
const load=async()=>foods||(foods=await fetch('data/foods.json').then(r=>r.json()));
const wd=k=>new Date(k+'T12:00').toLocaleDateString('fa-IR',{weekday:'narrow'});
function paintTop(){
const t=tgt.target,s=k=>sum(rows0,r=>r.data[k]),cal=s('cal'),en={pro:s('pro')*4,fat:s('fat')*9,carb:s('carb')*4},kc=en.pro+en.fat+en.carb;
const [,label,col]=calStatus(cal,t),w=Math.min(100,cal/(t*1.3)*100);
const note=cal<t*LOW?`${fa(t-cal)} kcal تا هدف`:cal<=t*HIGH?`محدوده مجاز: ${fa(t*LOW)} تا ${fa(t*HIGH)}`:`${fa(cal-t*HIGH)} kcal بالاتر از حد مجاز`;
const M=(name,key,g)=>{const goal=SPLIT[key],pct=kc&&key?en[key]/kc*100:null,low=pct!=null&&pct<goal,red=low?'color:var(--danger)':null;
return h('div',{class:'card stat',style:low?'--c:var(--danger)':null},h('span',{class:'muted'},name),h('b',{style:red},fa(g)+' g'),pct!=null&&h('span',{class:'muted',style:red},`${fa(pct)}٪ از کالری · هدف ${fa(goal)}٪`))};
topBox.replaceChildren(
h('div',{class:'card'},h('div',{class:'calhead'},h('div',{},h('b',{style:`color:${col}`},fa(cal)),` / ${fa(t)} kcal`,h('div',{class:'muted'},tgt.custom?'هدف دستی':'هدف پیشنهادی')),h('button',{class:'btn',onclick:setTarget},'🎯 تنظیم هدف کالری')),
h('div',{class:'calbar'},h('i',{style:`width:${w}%;background:${col}`}),h('span',{class:'zone',style:`inset-inline-start:${LOW/1.3*100}%;width:${(HIGH-LOW)/1.3*100}%`})),
h('div',{class:'calfoot'},h('b',{style:`color:${col}`},label),h('span',{class:'muted'},note))),
h('div',{class:'grid'},M('پروتئین','pro',s('pro')),M('چربی','fat',s('fat')),M('کربوهیدرات','carb',s('carb')),M('فیبر',null,s('fib')),M('شکر',null,s('sug'))))}
function paintFoot(){if(!days7||!footBox)return;
const t=tgt.target,mx=Math.max(t*1.3,...days7.map(d=>d.v))*1.05,logged=days7.filter(d=>d.v>0),avg=logged.length?sum(logged,d=>d.v)/logged.length:0,okN=logged.filter(d=>calStatus(d.v,t)[0]==='ok').length;
footBox.replaceChildren(h('div',{class:'card'},h('h2',{},'کالری دریافتی ۷ روز گذشته'),
h('div',{class:'wk'},h('span',{class:'zone',style:`bottom:${t*LOW/mx*100}%;height:${t*(HIGH-LOW)/mx*100}%`}),days7.map(d=>h('i',{title:fa(d.v),style:`height:${d.v/mx*100}%;background:${d.v?calStatus(d.v,t)[2]:'var(--border)'}`}))),
h('div',{class:'barl'},days7.map(d=>h('small',{},wd(d.k),h('br'),d.v?fa(d.v):'—'))),
h('p',{class:'muted'},`میانگین روزهای ثبت‌شده: ${fa(avg)} kcal · ${fa(okN)} از ${fa(logged.length)} روز در محدوده مجاز (هدف ${fa(t)})`)))}
async function week(){try{const from=new Date();from.setHours(0,0,0,0);from.setDate(from.getDate()-6);
const r=await D.list('food',from.toISOString(),dayRange(dayKey(new Date()))[1]);
days7=[...Array(7)].map((_,i)=>{const d=new Date(from);d.setDate(from.getDate()+i);const k=dayKey(d);return{k,v:sum(r.filter(x=>dayKey(x.ts)===k),x=>x.data.cal)}});paintFoot()}catch(e){toast(e.message,true)}}
function setTarget(){let close;const inp=h('input',{class:'inp',inputmode:'numeric',value:String(tgt.target)});
const save=async v=>{try{await D.saveProfile({id:state.user.id,kcal_target:v});v?state.profile.kcal_target=v:delete state.profile.kcal_target;tgt={rec:tgt.rec,target:v||tgt.rec||2000,custom:!!v};paintTop();paintFoot();close();toast('هدف کالری ذخیره شد')}catch(e){toast(e.message,true)}};
close=modal('تنظیم هدف کالری',h('div',{class:'form'},
h('p',{class:'muted'},tgt.rec?`مقدار پیشنهادی بر اساس هدف، فعالیت، BMI و BMR شما: ${fa(tgt.rec)} kcal`:'برای پیشنهاد خودکار، وزن و قد را در «سلامت ← وزن» ثبت کنید.'),
h('label',{},'هدف کالری روزانه (kcal)',inp),
h('button',{class:'btn primary',onclick:()=>{const v=+inp.value.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));v>=500&&v<=10000?save(Math.round(v)):toast('عددی بین ۵۰۰ تا ۱۰۰۰۰ وارد کنید',true)}},'ذخیره'),
tgt.custom&&h('button',{class:'btn',onclick:()=>save(null)},'بازگشت به مقدار پیشنهادی')))}
export default logPage({title:'تغذیه (مقادیر غذاها به‌ازای ۱۰۰ گرم)',kind:'food',
before:async()=>{topBox=h('div',{class:'stack'});footBox=h('div');days7=null;lastRows=null;[tgt]=await Promise.all([calorieTarget().catch(()=>tgt),load()]);return footBox},
top:rows=>{rows0=rows;paintTop();if(rows!==lastRows){lastRows=rows;week()}return topBox},
fields:[{k:'meal',label:'وعده',options:MEALS},{k:'name',label:'نام غذا',req:1,ac:{items:()=>foods||[],get:x=>x.Persian_Name,hay:x=>x.Persian_Name+' '+(x.Name_En||''),sub:x=>fa(x.Calories)+' kcal',placeholder:'تایپ کنید؛ پیشنهادها می‌آید…',required:1}},{k:'g',label:'مقدار (گرم)',type:'number',def:'100',req:1}],
prep:async d=>{const f=(await load()).find(x=>norm(x.Persian_Name)===norm(d.name));if(!f)throw new Error('غذا را از پیشنهادها انتخاب کنید');const k=d.g/100,n=v=>(v||0)*k;
return {...d,cal:n(f.Calories),fat:n(f.Fat),pro:n(f.Protein),carb:n(f.Carbs),fib:n(f.Fiber),sug:n(f.Sugar)}},
line:d=>`${d.meal} · ${d.name} · ${fa(d.g)}گرم · ${fa(d.cal)} کالری`});
