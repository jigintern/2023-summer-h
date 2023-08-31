import { closeOverlay, showOverlay, suggestNote } from '../main.js';
import { createGeneralPopup, createLoading } from '../popup/general-popup.js';

let image = undefined;

export const init = async function () {
  const overlay = document.querySelector('div.overlay');

  const errorSpan = document.querySelector('div.push span.error');
  const titleInput = document.querySelector('div.push input[name="title"]');
  const landmarkInput = document.querySelector(
    'div.push input[name="landmark"]'
  );
  const categoryInput = document.querySelector(
    'div.push select[name="category"]'
  );

  const categories = JSON.parse(await (await fetch('/categories')).text());
  categories.forEach((item) => {
    const option = document.createElement('option');
    option.textContent = item.category;
    categoryInput.appendChild(option);
  });

  document.querySelector('#picker').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      document.querySelector('#img').src = event.target.result;
      image = reader.result;
    };
    reader.readAsDataURL(file);

    navigator.geolocation.getCurrentPosition(async (position) => {
      landmarkInput.value = await getPlaceName(
        position.coords.latitude,
        position.coords.longitude
      );
    });
  });
  const sharedImage = localStorage.getItem('shared-image');
  if (sharedImage) {
    image = sharedImage;
    document.querySelector('#img').src = sharedImage;
    localStorage.removeItem('shared-image');
  }

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
        errorSpan.style.display = 'block';
        errorSpan.textContent = '未入力の項目があります';
        closeOverlay(true);
        return;
      } else {
        errorSpan.style.display = 'none';
        errorSpan.textContent = '';
      }

      const user_id = JSON.parse(sessionStorage.getItem('session')).user.id;
      let note_id = localStorage.getItem('note_id');
      if (!note_id) {
        note_id = await (
          await fetch(`/noteid/today?user_id=${user_id}`)
        ).text();
        if (!note_id) {
          errorSpan.style.display = 'block';
          errorSpan.textContent = '本日のスタンプ帳が未作成です';
          closeOverlay(true);
          return;
        } else {
          window.localStorage.setItem('note_id', note_id);
        }
      }

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
        errorSpan.style.display = 'block';
        errorSpan.textContent = buf;
        closeOverlay(true);
        return;
      }
      const imageUrl = JSON.parse(buf).publicUrl;
      console.log(imageUrl);

      // 位置情報を取得
      navigator.geolocation.getCurrentPosition(async (position) => {
        // スタンプの登録
        const stampPostRes = await fetch('/newstamp', {
          method: 'POST',
          body: JSON.stringify({
            note_id: note_id,
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
          errorSpan.style.display = 'block';
          errorSpan.textContent = buf;
          closeOverlay(true);
          return;
        }

        overlay.addEventListener('click', suggestNote);

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

/**
 * OSMのAPIから場所情報を取得する関数
 * @param {number} latitude
 * @param {number} longitude
 */
const getPlaceName = async function (latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`;
  const res = await fetch(url);
  const data = JSON.parse(await res.text());
  const [suburb, city] = data.display_name.split(', ').slice(0, 2);
  return `${suburb}, ${city}`;
};
