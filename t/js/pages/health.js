import {h} from '../utils/dom.js';
import {logPage} from '../components/logpage.js';
import {GLUCOSE_WHEN} from '../config.js';
const T={
insulin:logPage({title:'انسولین',kind:'insulin',fields:[{k:'type',label:'نوع انسولین',ph:'مثلاً رگولار'},{k:'dose',label:'مقدار (واحد)',type:'number',req:1}],line:d=>`${d.type||''} ${d.dose} واحد`}),
glucose:logPage({title:'قند خون',kind:'glucose',fields:[{k:'when',label:'زمان اندازه‌گیری',options:GLUCOSE_WHEN},{k:'mgdl',label:'mg/dL',type:'number',req:1}],line:d=>`${d.when} · ${d.mgdl} mg/dL`}),
bp:logPage({title:'فشار خون',kind:'bp',fields:[{k:'sys',label:'سیستولیک',type:'number',req:1},{k:'dia',label:'دیاستولیک',type:'number',req:1},{k:'pulse',label:'نبض',type:'number'}],line:d=>`${d.sys}/${d.dia} mmHg${d.pulse?' · نبض '+d.pulse:''}`}),
weight:logPage({title:'وزن',kind:'weight',fields:[{k:'kg',label:'وزن (kg)',type:'number',req:1}],line:d=>`${d.kg} کیلوگرم`})};
const N={insulin:'انسولین',glucose:'قند خون',bp:'فشار خون',weight:'وزن'};
export default async root=>{const box=h('div');let cur='glucose';
const bar=h('div',{class:'tabs'});
const go=async k=>{cur=k;bar.replaceChildren(...Object.keys(T).map(x=>h('button',{class:'btn'+(x===cur?' on':''),onclick:()=>go(x)},N[x])));await T[k](box)};
root.replaceChildren(bar,box);await go(cur)};
