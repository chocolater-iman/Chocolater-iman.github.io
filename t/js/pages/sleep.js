import {logPage} from '../components/logpage.js';
import {fa,TIME_RE} from '../utils/format.js';
const mins=t=>{const[a,b]=t.split(':');return +a*60+ +b};
export default logPage({title:'خواب',kind:'sleep',
fields:[{k:'sleep',label:'ساعت خواب (HH:MM)',ph:'23:30',req:1},{k:'wake',label:'ساعت بیدار شدن (HH:MM)',ph:'07:00',req:1}],
prep:async d=>{const re=new RegExp('^'+TIME_RE+'$');if(!re.test(d.sleep)||!re.test(d.wake))throw new Error('ساعت را به‌صورت ۲۴ ساعته وارد کنید');let m=mins(d.wake)-mins(d.sleep);if(m<=0)m+=1440;return {...d,hours:m/60}},
line:d=>`${d.sleep} تا ${d.wake} · ${fa(d.hours)} ساعت`});
