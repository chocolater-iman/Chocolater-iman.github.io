import {sb} from './supabase.js';
export const session=async()=>(await sb.auth.getSession()).data.session;
export const signIn=(email,password)=>sb.auth.signInWithPassword({email,password});
export const signUp=(email,password)=>sb.auth.signUp({email,password});
export const signOut=()=>sb.auth.signOut();
