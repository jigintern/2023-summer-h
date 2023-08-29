import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as dotenv from 'https://deno.land/std@0.167.0/dotenv/mod.ts';
import { serve } from 'https://deno.land/std@0.151.0/http/server.ts';
import { serveDir } from 'https://deno.land/std@0.151.0/http/file_server.ts';

await dotenv.config({
  export: true,
  safe: true,
  example: '.env.example',
  path: '.env',
});

const config = Deno.env.toObject();

const supabase = createClient(config['SUPABASE_URL'], config['SUPABASE_KEY']);

serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === 'GET' && pathname === '/welcome-message') {
    return new Response('jigインターンへようこそ！');
  }

  if (req.method === 'GET' && pathname === '/hc') {
    const res = await supabase.from('hc').select().limit(1);
    return new Response(JSON.stringify(res.data[0].message));
  }

  //スタンプ帳登録
  if (req.method === 'POST' && pathname === '/newnote') {
    const json=await req.json();
    const user_id=json.user_id;
    const title=json.title;
    const result=await supabase.from('notes').insert({user_id:user_id, title:title}).select();
    return new Response(result.data[0].id);
  }

  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  });
});
