import {h} from '../utils/dom.js';
import {logPage} from '../components/logpage.js';
import * as D from '../services/data.js';
import {state} from '../state.js';
import {KINDS} from '../kinds.js';
import {bmi,bmiCat,idealRange,bmr as mifflin} from '../utils/calc.js';
import {fa} from '../utils/format.js';
let last=null;
const r1=v=>Math.round(v*10)/10;
const card=d=>{const b=d&&(d.bmi||(d.cm&&bmi(d.kg,d.cm)));if(!b)return h('p',{class:'muted'},'با ثبت وزن و قد، BMI محاسبه می‌شود.');
const [lab,col]=bmiCat(b),[lo,hi]=idealRange(d.cm),pos=Math.max(0,Math.min(100,(b-15)/25*100));
return h('div',{class:'card stat',style:`--c:${col}`},h('span',{class:'muted'},'شاخص توده بدنی (BMI = وزن ÷ قد² به متر)'),h('b',{},fa(b)+' · '+lab),
h('div',{class:'bmi'},h('i',{style:`right:${pos}%`})),h('span',{class:'muted'},`وزن مطلوب برای قد شما (BMI ۱۸٫۵ تا ۲۴٫۹): ${fa(lo)} تا ${fa(hi)} کیلوگرم`))};
export default logPage({title:'وزن، قد و BMI',kind:'weight',
before:async()=>{const r=await D.list('weight',new Date(Date.now()-730*864e5).toISOString(),new Date().toISOString());last=r[0]?.data||null;return ''},
fields:[{k:'kg',label:'وزن (kg)',type:'number',req:1},{k:'cm',label:'قد (cm)',type:'number',req:1,def:()=>state.profile.height},{k:'age',label:'سن (برای تخمین BMR)',type:'number',def:()=>state.profile.age},
{k:'sex',label:'جنسیت',options:['مرد','زن'],def:()=>state.profile.sex==='female'?'زن':'مرد'},{k:'bmr',label:'BMR (kcal) — اختیاری، از ترازو یا Samsung Health',type:'number'}],
prep:async d=>{if(!(d.kg>0&&d.kg<500&&d.cm>=50&&d.cm<=250))throw new Error('وزن یا قد نامعتبر است');
const sex=d.sex==='زن'?'female':'male',age=d.age||state.profile.age,out={...d,bmi:r1(bmi(d.kg,d.cm)),bmr_est:Math.round(mifflin(d.kg,d.cm,age,sex))};
const p={height:d.cm,sex,...(d.age?{age:d.age}:{})};await D.saveProfile({id:state.user.id,...p});Object.assign(state.profile,p);last=out;return out},
line:KINDS.weight.line,top:rows=>card(rows[0]?.data||last)});
