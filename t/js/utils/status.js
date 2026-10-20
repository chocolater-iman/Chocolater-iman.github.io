export const LOW=0.9,HIGH=1.1; // green zone = target ±10%
/** [key,label,color]: blue = below need, green = within range, red = over. */
export const calStatus=(v,t)=>v<t*LOW?['low','پایین‌تر از نیاز','#4da3ff']:v<=t*HIGH?['ok','در محدوده مجاز','var(--ok)']:['high','بیش از حد مجاز','var(--danger)'];
