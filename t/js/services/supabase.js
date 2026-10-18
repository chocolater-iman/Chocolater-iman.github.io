import {SB_URL,SB_KEY} from '../config.js';
export const sb=window.supabase.createClient(SB_URL,SB_KEY);
