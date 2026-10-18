import {bmi,idealRange,bmr as mifflin,stepsToKm} from './calc.js';
export const GOALS={lose:['کاهش وزن',-500],maintain:['حفظ وزن',0],gain:['افزایش وزن',400]}; // [label, kcal/day adjustment]
// [label, description, TDEE factor, base protein g/kg]
export const LEVELS={sedentary:['کم‌تحرک','کار پشت میز، ورزش کم یا هیچ',1.2,0.8],active:['فعال','ورزش یا تحرک ۳ تا ۵ روز در هفته',1.55,1.2],athlete:['ورزشکار','تمرین شدید ۶ تا ۷ روز در هفته',1.725,1.6]};
/** Net kcal above resting for walking `steps` at ~5 km/h (3.5 MET), scaled by the person's own BMR (sex, age, weight). */
export const stepsKcal=(steps,cm,sex,bmr)=>2.5*bmr/24*(stepsToKm(steps,cm,sex)/5);
export function plan({kg,cm,age,sex,bmrIn,goal='maintain',level='sedentary',avgSteps=0}){
const bmr=bmrIn||mifflin(kg,cm,age,sex),b=bmi(kg,cm),[,,f,pk]=LEVELS[level],notes=[];
const extraLevel=bmr*(f-1.2),extraSteps=stepsKcal(avgSteps,cm,sex,bmr),tdee=bmr*1.2+Math.max(extraLevel,extraSteps);
let adj=GOALS[goal][1];
if(goal==='lose'&&b<18.5){adj=0;notes.push('BMI شما کمتر از ۱۸٫۵ است؛ کاهش وزن توصیه نمی‌شود و کالری نگهدارنده پیشنهاد شد.')}
if(goal==='gain'&&b>=30)notes.push('BMI شما ۳۰ یا بیشتر است؛ افزایش وزن معمولاً توصیه نمی‌شود. با پزشک یا متخصص تغذیه مشورت کنید.');
if(goal==='maintain'&&b>=25)notes.push('BMI شما بالاتر از محدوده‌ی نرمال است؛ کاهش تدریجی وزن را هم در نظر بگیرید.');
if(goal==='maintain'&&b<18.5)notes.push('BMI شما پایین‌تر از محدوده‌ی نرمال است؛ افزایش وزن می‌تواند مناسب‌تر باشد.');
const floor=sex==='female'?1200:1500;let target=tdee+adj;
if(target<floor){target=floor;notes.push(`کمتر از ${floor} کیلوکالری در روز توصیه نمی‌شود؛ مقدار پیشنهادی به این حد رسید.`)}
const refW=b>=30?idealRange(cm)[1]:kg,gkg=Math.min(2.2,pk+(goal==='lose'?0.4:goal==='gain'?0.2:0)),g=gkg*refW;
return {bmr,userBmr:!!bmrIn,src:bmrIn?'ثبت‌شده':'تخمینی',bmi:b,factor:f,extraLevel,extraSteps,tdee,adj:target-tdee,target,weekly:(target-tdee)*7/7700,
protein:{g,lo:Math.max(0.8,gkg-0.2)*refW,hi:Math.min(2.2,gkg+0.2)*refW,gkg,refW,pct:g*4/target*100},notes}}
