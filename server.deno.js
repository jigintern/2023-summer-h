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
  const url = new URL(req.url);
  console.log(pathname);

  if (req.method === 'GET' && pathname === '/welcome-message') {
    return new Response('jigインターンへようこそ！');
  }

  if (req.method === 'GET' && pathname === '/hc') {
    const res = await supabase.from('hc').select().limit(1);
    return new Response(JSON.stringify(res.data[0].message));
  }

  // スタンプのカテゴリを取得
  if (pathname === '/categories') {
    if (req.method === 'GET') {
      const res = await supabase.from('category').select();
      if (res.error)
        return new Response(JSON.stringify(res.error), { status: 500 });
      return new Response(JSON.stringify(res.data));
    }
    return new Response('Method not allowed', { status: 405 });
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
    if (result.error)
      return new Response(JSON.stringify(result.error), { status: 400 });
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
        .getPublicUrl(upload.data.path);
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

    const res = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          username: body.username,
          iconurl: body.iconUrl,
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

  //スタンプ帳リスト取得 w/user_id
  if (pathname === '/getnotes') {
    if (req.method === 'GET') {
      const user_id = url.searchParams.get('user_id');
      const notesRes = await supabase
        .from('notes')
        .select()
        .eq('user_id', user_id);
      if (notesRes.error)
        return new Response(JSON.stringify(notesRes.error), { status: 500 });

      // 各スタンプ帳の最初のスタンプの画像urlを取得
      const noteList = [];
      for (let i = 0; i < notesRes.data.length; i++) {
        const stampRes = await supabase
          .from('stamps')
          .select('url')
          .eq('note_id', notesRes.data[i].id)
          .order('created_at', { ascending: true })
          .limit(1);
        if (stampRes.error || !stampRes.data[0]?.url) {
          noteList.push({ ...notesRes.data[i], thumbnailUrl: 'not found' });
          continue;
        }
        noteList.push({
          ...notesRes.data[i],
          thumbnailUrl: stampRes.data[0].url,
        });
      }
      return new Response(JSON.stringify({ data: noteList }));
    }
  }

  // 今日のスタンプ帳idを取得 w/user_id
  if (pathname === '/noteid/today') {
    if (req.method === 'GET') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log(today.toISOString());
      const user_id = url.searchParams.get('user_id');
      const res = await supabase
        .from('notes')
        .select()
        .eq('user_id', user_id)
        .gte('created_at', today.toUTCString())
        .order('created_at', { ascending: false })
        .limit(1);
      if (res.error) return new Response(JSON.stringify(res.error));
      return new Response(JSON.stringify(res.data[0]?.id));
    }
    return new Response('Method not allowed', { status: 405 });
  }

  //スタンプ帳取得 w/note_id
  if (req.method === 'GET' && pathname === '/getnote') {
    const note_id = url.searchParams.get('note_id');
    const res = await supabase.from('notes').select().eq('id', note_id);
    console.log(res.data);
    return new Response(JSON.stringify(res.data));
  }

  //近場のシート取得
  if (pathname === '/near') {
    if (req.method === 'GET') {
      const latitude = url.searchParams.get('latitude');
      const longitude = url.searchParams.get('longitude');
      const res = await supabase.from('stamps').select('note_id');
      // .gt('latitude', latitude - 0.0045069)
      // .lt('latitude', latitude + 0.0045069)
      // .gt('longitude', longitude - 0.0054772)
      // .lt('longitude', longitude + 0.0054772);
      if (res.error)
        return new Response(JSON.stringify(res.error), { status: 400 });

      const tmp = [];
      res.data.forEach((em) => {
        tmp.push(em.note_id);
      });
      tmp.sort((a, b) => b - a);
      const arr = [...new Set(tmp)];

      const noteRes = await supabase
        .from('notes')
        .select('id, title, created_at, user_id, users(raw_user_meta_data)')
        .in('id', arr);
      if (noteRes.error)
        return new Response(JSON.stringify(noteRes.error), { status: 400 });

      // 各スタンプ帳の最初のスタンプの画像urlを取得
      const noteList = [];
      for (let i = 0; i < noteRes.data.length; i++) {
        const stampRes = await supabase
          .from('stamps')
          .select('url')
          .eq('note_id', noteRes.data[i].id)
          .order('created_at', { ascending: true })
          .limit(1);
        if (stampRes.error || !stampRes.data[0]?.url) {
          noteList.push({ ...noteRes.data[i], thumbnailUrl: 'not found' });
          continue;
        }
        noteList.push({
          ...noteRes.data[i],
          thumbnailUrl: stampRes.data[0].url,
        });
      }
      return new Response(JSON.stringify(noteList));
    }
    return new Response('Method not allowed', { status: 405 });
  }

  //スタンプ取得
  if (req.method === 'GET' && pathname === '/getstamps') {
    const note_id = url.searchParams.get('note_id');
    const res = await supabase
      .from('stamps')
      .select()
      .eq('note_id', note_id)
      .order('created_at', { ascending: true });
    return new Response(JSON.stringify(res.data));
  }

  // ユーザーアイコン画像の登録
  if (pathname === '/users/icon') {
    if (req.method === 'POST') {
      const json = await req.json();

      const tmp = json.file.split(';')[0];
      const extension = tmp.split('/')[1];
      const buffer = decode(json.file.replace(/^.*,/, ''));
      const fileName = crypto.randomUUID() + '.' + extension;

      const file = new File([buffer], fileName, { type: 'image/' + extension });
      const upload = await supabase.storage
        .from('icons')
        .upload(fileName, file, { contentType: 'image/' + extension });
      if (upload.error)
        return new Response(JSON.stringify(upload.error, { status: 400 }));

      const createUrl = await supabase.storage
        .from('icons')
        .getPublicUrl(upload.data.path);
      if (createUrl.error)
        return new Response(JSON.stringify(createUrl.error, { status: 400 }));

      return new Response(JSON.stringify(createUrl.data));
    }
    return new Response('Method not allowed', { status: 405 });
  }

  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  });
});
