export const a1c=g=>g==null?null:(g+46.7)/28.7; // ADAG: A1c = (eAG + 46.7) / 28.7
export const burned=(met,kg,min)=>met*kg*min/60;
export const stepsToKm=(steps,cm)=>steps*cm*0.415/100000;
export const bmr=(kg,cm,age,sex)=>10*kg+6.25*cm-5*age+(sex==='female'?-161:5);
export const bmi=(kg,cm)=>kg/((cm/100)**2);
