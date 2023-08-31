import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as dotenv from 'https://deno.land/std@0.167.0/dotenv/mod.ts';
import { serve } from 'https://deno.land/std@0.151.0/http/server.ts';
import { serveDir } from 'https://deno.land/std@0.151.0/http/file_server.ts';
import { Base256B } from 'https://code4fukui.github.io/Base256B/Base256B.js';

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

    const result = await supabase
      .from('stamps')
      .insert({
        note_id: note_id,
        title: title,
        landmark: landmark,
        category: category,
        latitude: latitude,
        longitude: longitude,
      })
      .select();
    return new Response();
  }

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

  //サジェスト取得
  if (req.method === 'POST' && pathname === '/suggest') {
    const json=await req.json();
    const latitude=json.latitude;
    const longitude=json.longitude;
    const res=await supabase.from('stamps').select();

    const arr=[];

    res.data.forEach((e) => {
      if(e.longitude==null||e.latitude==null)
        return;

      //緯度差経度差計算、メートル変換
      const la=Math.abs(e.latitude-latitude)/0.0000090138;
      const lo=Math.abs(e.longitude-longitude)/0.0000109544;
      //直線距離計算、小数三桁のキロメートルに
      const distance=Math.round(Math.sqrt(la*la+lo*lo))/1000;
      //100m内は無視
      // if(distance<0.1) return;
      //20km外は無視
      // if(distance>20) return;

      //返却用配列作成
      const obj=new Object();
      obj.title=e.title;
      obj.landmark=e.landmark;
      obj.category=e.category;
      obj.distance=distance;
      arr.push(obj);
    });
    arr.sort((a,b)=>a.distance-b.distance);
    console.log(arr);
    
    return new Response(JSON.stringify(arr));
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
