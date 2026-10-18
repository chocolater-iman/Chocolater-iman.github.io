export const a1c=g=>g==null?null:(g+46.7)/28.7; // ADAG: A1c = (eAG + 46.7) / 28.7
export const burned=(met,kg,min)=>met*kg*min/60;
export const stepsToKm=(steps,cm,sex)=>steps*cm*(sex==='female'?0.413:0.415)/100000;
export const bmr=(kg,cm,age,sex)=>10*kg+6.25*cm-5*age+(sex==='female'?-161:5);
export const bmi=(kg,cm)=>kg/((cm/100)**2);
// WHO adult BMI classes
export const bmiCat=b=>b<18.5?['کم‌وزن','#4da3ff']:b<25?['نرمال','#3ddc97']:b<30?['اضافه‌وزن','#ffb84d']:b<35?['چاقی درجه ۱','#ff8a4d']:b<40?['چاقی درجه ۲','#ff5d73']:['چاقی درجه ۳','#e0364f'];
export const idealRange=cm=>{const m=(cm/100)**2;return[18.5*m,24.9*m]};
