import {h} from './utils/dom.js';
import {PAGES} from './config.js';
import {state} from './state.js';
import * as auth from './services/auth.js';
import * as D from './services/data.js';
import {sb} from './services/supabase.js';
import {modal} from './components/modal.js';
import {showMenu} from './components/contextmenu.js';
import {toast} from './components/toast.js';
const load={dashboard:()=>import('./pages/dashboard.js'),food:()=>import('./pages/food.js'),health:()=>import('./pages/health.js'),sleep:()=>import('./pages/sleep.js'),activity:()=>import('./pages/activity.js'),reports:()=>import('./pages/reports.js')};
const app=document.getElementById('app'),nav=k=>location.hash='#'+k;
document.documentElement.dataset.theme=localStorage.theme||'dark';
const toggleTheme=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=localStorage.theme=t};
function authView(){const e=h('input',{class:'inp',type:'email',required:'',dir:'ltr'}),p=h('input',{class:'inp',type:'password',minlength:8,required:'',dir:'ltr'});let mode='in';
const btn=h('button',{class:'btn primary'},'ورود'),sw=h('a',{href:'#',class:'muted',onclick:ev=>{ev.preventDefault();mode=mode==='in'?'up':'in';btn.textContent=mode==='in'?'ورود':'ثبت‌نام'}},'ورود / ثبت‌نام');
app.replaceChildren(h('form',{class:'card auth form',onsubmit:async ev=>{ev.preventDefault();const r=await(mode==='in'?auth.signIn:auth.signUp)(e.value,p.value);if(r.error)return toast(r.error.message,true);mode==='up'&&!r.data.session?toast('ایمیل تأیید را بررسی کنید'):start()}},h('h2',{},'ورود به ردیاب سلامت'),h('label',{},'ایمیل',e),h('label',{},'گذرواژه',p),btn,sw))}
function settings(){const f={age:h('input',{class:'inp',type:'number',value:state.profile.age}),height:h('input',{class:'inp',type:'number',value:state.profile.height}),sex:h('select',{class:'inp'},h('option',{value:'male'},'مرد'),h('option',{value:'female'},'زن'))};f.sex.value=state.profile.sex;
modal('تنظیمات',h('form',{class:'form',onsubmit:async ev=>{ev.preventDefault();const p={id:state.user.id,age:+f.age.value,height:+f.height.value,sex:f.sex.value};try{await D.saveProfile(p);Object.assign(state.profile,p);toast('ذخیره شد')}catch(x){toast(x.message,true)}}},h('label',{},'سن',f.age),h('label',{},'قد (cm)',f.height),h('label',{},'جنسیت',f.sex),h('button',{class:'btn primary'},'ذخیره')))}
function subjects(){const c=modal('انتخاب بخش',h('div',{class:'subjects'},PAGES.map(([k,n,i])=>h('button',{class:'btn',onclick:()=>{c();nav(k)}},i+' '+n))))}
const navItems=()=>[...PAGES.map(([k,n,i])=>({label:n,icon:i,onClick:()=>nav(k)})),'-',{label:'تغییر تم',icon:'◐',onClick:toggleTheme},{label:'تنظیمات',icon:'⚙',onClick:settings}];
function shell(){const main=h('main',{class:'main'});
const prof=h('button',{class:'btn',onclick:ev=>{ev.stopPropagation();const r=prof.getBoundingClientRect();showMenu(r.left,r.bottom+6,[{label:state.user.email,icon:'👤',disabled:true},{label:'تنظیمات',icon:'⚙',onClick:settings},'-',{label:'خروج',icon:'⎋',danger:true,onClick:async()=>{await auth.signOut();authView()}}])}},'👤',h('span',{class:'lbl'},' پروفایل'));
app.replaceChildren(h('header',{class:'topbar'},h('span',{class:'brand'},'ردیاب سلامت'),h('button',{class:'btn',onclick:subjects},'☰',h('span',{class:'lbl'},' بخش‌ها')),h('button',{class:'btn',onclick:toggleTheme},'◐'),h('button',{class:'btn',onclick:settings},'⚙'),prof),main);
document.oncontextmenu=ev=>{ev.preventDefault();showMenu(ev.clientX,ev.clientY,navItems())};
const route=async()=>{const k=location.hash.slice(1);const key=load[k]?k:'dashboard';try{main.replaceChildren();await(await load[key]()).default(main)}catch(x){toast(x.message,true)}};
addEventListener('hashchange',route);route()}
async function start(){const s=await auth.session();if(!s)return authView();state.user=s.user;try{Object.assign(state.profile,(await D.getProfile())||{})}catch{}shell()}
sb.auth.onAuthStateChange((ev)=>{if(ev==='SIGNED_OUT')authView()});
start();
