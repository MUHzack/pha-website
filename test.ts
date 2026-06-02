import { supabase } from './lib/supabase'; async function test() { const { data } = await supabase.from('photobox_session_files').select('*'); console.log(data); }; test();
