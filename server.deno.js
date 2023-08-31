import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as dotenv from 'https://deno.land/std@0.167.0/dotenv/mod.ts';
import { serve } from 'https://deno.land/std@0.151.0/http/server.ts';
import { serveDir } from 'https://deno.land/std@0.151.0/http/file_server.ts';
import { decode } from 'https://deno.land/std@0.200.0/encoding/base64.ts';

await dotenv.config({
  export: true,
  safe: true,
  example: '.env.example',
  path: '.env',
});

const config = Deno.env.toObject();

const supabase = createClient(config['SUPABASE_URL'], config['SUPABASE_KEY']);

const decoder = new TextDecoder();

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
    const json = await req.json();
    const user_id = json.user_id;
    const title = json.title;
    const result = await supabase
      .from('notes')
      .insert({ user_id: user_id, title: title })
      .select();
    return new Response(result.data[0].id);
  }

  //スタンプ登録
  if (req.method === 'POST' && pathname === '/newstamp') {
    const json = await req.json();
    const note_id = json.note_id;
    const title = json.title;
    const landmark = json.landmark;
    const category = json.category;
    const latitude = json.latitude;
    const longitude = json.longitude;
    const url = json.url;

    const result = await supabase
      .from('stamps')
      .insert({
        note_id: note_id,
        title: title,
        landmark: landmark,
        category: category,
        latitude: latitude,
        longitude: longitude,
        url: url,
      })
      .select();
    if (result.error)
      return new Response(JSON.stringify(result.error), { status: 400 });
    return new Response(JSON.stringify(result.data), { status: 201 });
  }

  // スタンプ画像の登録
  if (pathname === '/stamp-image') {
    if (req.method === 'POST') {
      const json = await req.json();

      const tmp = json.file.split(';')[0];
      const extension = tmp.split('/')[1];
      const buffer = decode(json.file.replace(/^.*,/, ''));
      const fileName = crypto.randomUUID() + '.' + extension;

      const file = new File([buffer], fileName, { type: 'image/' + extension });
      const upload = await supabase.storage
        .from('pictures')
        .upload(fileName, file, { contentType: 'image/' + extension });
      if (upload.error)
        return new Response(JSON.stringify(upload.error, { status: 400 }));

      const createUrl = await supabase.storage
        .from('pictures')
        .createSignedUrl(upload.data.path, 60);
      if (createUrl.error)
        return new Response(JSON.stringify(createUrl.error, { status: 400 }));

      return new Response(JSON.stringify(createUrl.data));
    }
    return new Response('Method not allowed', { status: 405 });
  }

  // ユーザー新規登録
  if (req.method === 'POST' && pathname === '/users/register') {
    const reader = req.body?.getReader();
    let buf = '';
    while (true) {
      const tmp = await reader.read();
      buf += decoder.decode(tmp?.value);
      if (tmp.done) break;
    }
    const body = JSON.parse(buf);

    const iconUrl = `${crypto.randomUUID()}.png`;

    const res = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          username: body.username,
          iconurl: iconUrl,
        },
      },
    });

    if (res.error) return new Response(res.error, { status: 400 });
    return new Response(JSON.stringify(res.data), { status: 201 });
  }

  // ユーザーログイン
  if (req.method === 'POST' && pathname === '/users/signin') {
    const reader = req.body?.getReader();
    let buf = '';
    while (true) {
      const tmp = await reader.read();
      buf += decoder.decode(tmp?.value);
      if (tmp.done) break;
    }
    const body = JSON.parse(buf);

    const res = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (res.error) return new Response(res.error, { status: 400 });
    return new Response(JSON.stringify(res.data), { status: 200 });
  }

  //スタンプ帳取得
  if (req.method === 'POST' && pathname === '/getnote') {
    const json=await req.json();
    const user_id=json.user_id;
    const res=await supabase.from('notes').select().eq('user_id', user_id);
    console.log(res);
    return new Response(JSON.stringify(res));
  }

  //近場のシート取得
  if (req.method === 'POST' && pathname === '/near') {
    const json=await req.json();
    const latitude=json.latitude;
    const longitude=json.longitude;
    const res=await supabase.from('stamps').select('note_id')
      .gt('latitude', latitude-0.0045069).lt('latitude', latitude+0.0045069)
      .gt('longitude', longitude-0.0054772).lt('longitude', longitude+0.0054772);

    const tmp=[];
    res.data.forEach((em)=>{
        tmp.push(em.note_id);
    });
    tmp.sort((a,b)=>b-a);
    const arr=[...new Set(tmp)];

    const noteRes=await supabase.from('notes').select().in('id', arr);
    console.log(noteRes.data);

    return new Response(JSON.stringify(noteRes.data));
  }

  //スタンプ取得
  if (req.method === 'POST' && pathname === '/getstamps') {
    const json=await req.json();
    const note_id=json.note_id;
    const res=await supabase.from('stamps').select().eq('note_id', note_id);
    console.log(res);
    return new Response(JSON.stringify(res.data));
  }

  // TODO: 実装
  // if (pathname === '/users/icon') {
  //   const iconUrl = new URL(req.url).searchParams.get('iconUrl');
  //   console.log(iconUrl);
  //   if (req.method === 'POST') {
  //     const reader = req.body?.getReader();
  //     /**
  //      * @type {Uint8Array}
  //      */
  //     const buf = new Uint8Array();
  //     while (true) {
  //       const tmp = await reader.read();
  //       buf.join(tmp?.value);
  //       if (tmp.done) break;
  //     }
  //     console.log(buf);
  //     // const body = JSON.parse(buf);
  //     const image = new Blob([buf.buffer], { type: 'image/png' } /* (1) */);
  //     const res = await supabase.storage.from('icons').upload(iconUrl, image);

  //     console.log(res);

  //     if (res.error) {
  //       return new Response(res.error, { status: 400 });
  //     } else {
  //       return new Response('success', { status: 201 });
  //     }
  //   }
  // }

  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  });
});
