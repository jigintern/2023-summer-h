let image = undefined;

export const init = function () {
  const titleInput = document.querySelector('div.push input[name="title"]');
  const landmarkInput = document.querySelector(
    'div.push input[name="landmark"]'
  );
  const categoryInput = document.querySelector(
    'div.push input[name="category"]'
  );
  document.querySelector('#picker').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      document.querySelector('#img').src = event.target.result;
      image = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document
    .querySelector('button#push-stamp')
    .addEventListener('click', async () => {
      const decoder = new TextDecoder();
      console.log(titleInput.value, landmarkInput.value, categoryInput.value);
      if (
        !image ||
        !titleInput.value ||
        !landmarkInput.value ||
        !categoryInput.value
      ) {
        return;
      }
      console.log(titleInput.value);
      // スタンプ画像のアップロード
      const imagePostRes = await fetch('/stamp-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: image }),
      });

      const imagePostReader = imagePostRes.body.getReader();
      let buf = '';
      while (true) {
        const tmp = await imagePostReader.read();
        buf += decoder.decode(tmp?.value);
        if (tmp.done) break;
      }
      if (imagePostRes.status === 400) {
        return;
      }
      const imageUrl = JSON.parse(buf).signedUrl;
      console.log(imageUrl);

      // スタンプの登録
      const stampPostRes = await fetch('/newstamp', {
        method: 'POST',
        body: JSON.stringify({
          note_id: 1,
          title: titleInput.value,
          landmark: landmarkInput.value,
          category: categoryInput.value,
          url: imageUrl,
        }),
      });

      const stampPostReader = stampPostRes.body.getReader();
      while (true) {
        const tmp = await stampPostReader.read();
        buf += decoder.decode(tmp?.value);
        if (tmp.done) break;
      }
      if (stampPostRes.status === 400) {
        return;
      }
    });
};
