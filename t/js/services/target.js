import * as D from './data.js';
import {state} from '../state.js';
import {plan} from '../utils/fitness.js';
import {dayKey,dayRange} from '../utils/format.js';
/** Daily calorie target: the user's own value (profile.kcal_target) or the fitness-plan recommendation (fallback 2000). */
export async function calorieTarget(){
const p=state.profile,end=dayRange(dayKey(new Date()))[1],from=new Date();from.setHours(0,0,0,0);from.setDate(from.getDate()-6);
const [w,act]=await Promise.all([D.list('weight',new Date(Date.now()-730*864e5).toISOString(),end),D.list('activity',from.toISOString(),end)]);
const lw=w[0]?.data,by={};act.forEach(r=>{const k=dayKey(r.ts);by[k]=(by[k]||0)+(+r.data.steps||0)});
const d=Object.values(by).filter(s=>s>0),avgSteps=d.length?d.reduce((a,b)=>a+b)/d.length:0;
const rec=lw?Math.round(plan({kg:lw.kg,cm:lw.cm||p.height,age:p.age,sex:p.sex||'male',bmrIn:lw.bmr,goal:p.goal||'maintain',level:p.activity||'sedentary',avgSteps}).target/10)*10:null;
return {rec,target:p.kcal_target||rec||2000,custom:!!p.kcal_target}}
