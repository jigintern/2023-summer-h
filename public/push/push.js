import { closeOverlay, showOverlay } from '../main.js';
import { createGeneralPopup, createLoading } from '../popup/general-popup.js';

let image = undefined;

export const init = function () {
  const overlay = document.querySelector('div.overlay');

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
      showOverlay(createLoading(), true);

      const decoder = new TextDecoder();
      console.log(titleInput.value, landmarkInput.value, categoryInput.value);
      if (
        !image ||
        !titleInput.value ||
        !landmarkInput.value ||
        !categoryInput.value
      ) {
        closeOverlay();
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
        closeOverlay();
        return;
      }
      const imageUrl = JSON.parse(buf).signedUrl;
      console.log(imageUrl);

      // 位置情報を取得
      navigator.geolocation.getCurrentPosition(async (position) => {
        // スタンプの登録
        const stampPostRes = await fetch('/newstamp', {
          method: 'POST',
          body: JSON.stringify({
            note_id: 1,
            title: titleInput.value,
            landmark: landmarkInput.value,
            category: categoryInput.value,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
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
          closeOverlay();
          return;
        }

        overlay.addEventListener('click', closeOverlay);

        showOverlay(
          createGeneralPopup(`スタンプを押しました！\n@${landmarkInput.value}`)
        );

        titleInput.value = '';
        landmarkInput.value = '';
        categoryInput.value = '';
        document.querySelector('#picker').value = '';
        document.querySelector('#img').removeAttribute('src');
      });
    });
};
