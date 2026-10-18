import {sb} from './supabase.js';
const ok=r=>{if(r.error)throw new Error(r.error.message);return r.data};
export const add=(kind,ts,data)=>sb.from('entries').insert({kind,ts,data}).then(ok);
export const update=(id,patch)=>sb.from('entries').update(patch).eq('id',id).then(ok);
export const remove=id=>sb.from('entries').delete().eq('id',id).then(ok);
export const list=(kind,from,to)=>{let q=sb.from('entries').select('*').gte('ts',from).lte('ts',to).order('ts',{ascending:false});if(kind)q=q.eq('kind',kind);return q.then(ok)};
export const getProfile=()=>sb.from('profiles').select('*').maybeSingle().then(ok);
export const saveProfile=p=>sb.from('profiles').upsert(p).then(ok);
