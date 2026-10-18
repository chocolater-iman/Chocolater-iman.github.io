import {h} from '../utils/dom.js';
import * as D from '../services/data.js';
import {dayKey,dayRange,fa,sum} from '../utils/format.js';
import {bmr,bmi} from '../utils/calc.js';
import {state} from '../state.js';
const card=(t,v,s='')=>h('div',{class:'card stat'},h('span',{class:'muted'},t),h('b',{},v),h('span',{class:'muted'},s));
export default async root=>{const[a,b]=dayRange(dayKey(new Date()));const rows=await D.list(null,a,b);
const of=k=>rows.filter(r=>r.kind===k),last=k=>of(k)[0]?.data;
const intake=sum(of('food'),r=>r.data.cal),out=sum(of('activity'),r=>r.data.kcal),w=last('weight')?.kg,p=state.profile;
root.replaceChildren(h('h2',{},'داشبورد امروز'),h('div',{class:'grid'},
card('کالری دریافتی',fa(intake)+' kcal',w?`BMR ≈ ${fa(bmr(w,p.height,p.age,p.sex))}`:'وزن ثبت کنید تا BMR محاسبه شود'),
card('کالری فعالیت',fa(out)+' kcal'),card('قدم‌ها',fa(sum(of('activity'),r=>r.data.steps))),
card('آخرین قند خون',last('glucose')?fa(last('glucose').mgdl)+' mg/dL':'—',last('glucose')?.when),
card('فشار خون',last('bp')?`${last('bp').sys}/${last('bp').dia}`:'—'),
card('وزن',w?fa(w)+' kg':'—',w?`BMI ${fa(bmi(w,p.height))}`:''),
card('خواب',last('sleep')?fa(last('sleep').hours)+' ساعت':'—'),
card('انسولین امروز',fa(sum(of('insulin'),r=>r.data.dose))+' واحد')))};
