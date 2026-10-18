import {fa} from './utils/format.js';
import {bmiCat} from './utils/calc.js';
/** Single source for archive lines + Excel columns per record kind (header -> data key). */
export const KINDS={
food:{label:'تغذیه',icon:'🍽',line:d=>`${d.meal} · ${d.name} · ${fa(d.g)} گرم · ${fa(d.cal)} کالری`,cols:{'وعده':'meal','غذا':'name','گرم':'g','کالری':'cal','پروتئین':'pro','کربوهیدرات':'carb','چربی':'fat','فیبر':'fib','قند':'sug'}},
glucose:{label:'قند خون',icon:'🩸',line:d=>`${d.when} · ${d.mgdl} mg/dL`,cols:{'زمان اندازه‌گیری':'when','mg/dL':'mgdl'}},
insulin:{label:'انسولین',icon:'💉',line:d=>`${d.type||''} ${d.dose} واحد`,cols:{'نوع':'type','واحد':'dose'}},
bp:{label:'فشار خون',icon:'❤️',line:d=>`${d.sys}/${d.dia} mmHg${d.pulse?' · نبض '+d.pulse:''}`,cols:{'سیستولیک':'sys','دیاستولیک':'dia','نبض':'pulse'}},
weight:{label:'وزن',icon:'⚖️',line:d=>[`${fa(d.kg)} kg`,d.bmi&&`BMI ${fa(d.bmi)} (${bmiCat(d.bmi)[0]})`,d.bmr?`BMR ${fa(d.bmr)}`:d.bmr_est&&`BMR≈${fa(d.bmr_est)}`].filter(Boolean).join(' · '),cols:{'وزن (kg)':'kg','قد (cm)':'cm','سن':'age','جنسیت':'sex','BMI':'bmi','BMR ثبت‌شده':'bmr','BMR تخمینی':'bmr_est'}},
sleep:{label:'خواب',icon:'😴',line:d=>`${d.sleep} تا ${d.wake} · ${fa(d.hours)} ساعت`,cols:{'ساعت خواب':'sleep','ساعت بیداری':'wake','مدت (ساعت)':'hours'}},
activity:{label:'فعالیت',icon:'🏃',line:d=>`${fa(d.steps)} قدم · ${fa(d.min)} دقیقه · ${fa(d.km)} km · ${fa(d.kcal)} کالری`,cols:{'قدم':'steps','دقیقه':'min','کیلومتر':'km','کالری مصرفی':'kcal'}}};
