import {logPage} from '../components/logpage.js';
import * as D from '../services/data.js';
import {state} from '../state.js';
import {burned,stepsToKm} from '../utils/calc.js';
import {fa} from '../utils/format.js';
export default logPage({title:'ورزش و پیاده‌روی',kind:'activity',
fields:[{k:'steps',label:'تعداد قدم',type:'number'},{k:'min',label:'مدت (دقیقه)',type:'number',req:1},{k:'km',label:'مسافت (km) — خالی = محاسبه از قدم‌ها',type:'number'}],
prep:async d=>{const w=(await D.list('weight',new Date(Date.now()-365*864e5).toISOString(),new Date().toISOString()))[0]?.data.kg||70;
const km=d.km??(d.steps?stepsToKm(d.steps,state.profile.height):null);
return {...d,km,kcal:burned(3.5,w,d.min)}}, // MET 3.5 = moderate walking
line:d=>`${fa(d.steps)} قدم · ${fa(d.min)} دقیقه · ${fa(d.km)} km · ${fa(d.kcal)} کالری`});
