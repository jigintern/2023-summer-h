import { Base256B } from 'https://code4fukui.github.io/Base256B/Base256B.js';

export const init = function () {
  const overlay = document.querySelector('div.overlay');
  const errorSpan = document.querySelector('span.error');
  const accountPop = document.querySelector('div.account');
  accountPop.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });

  const iconImageSelectButton = document.querySelector(
    'button#iconImageSelect'
  );
  iconImageSelectButton.addEventListener('click', () => {
    document.querySelector('input#icon').click();
  });

  document.querySelector('input#icon').addEventListener('change', (ev) => {
    const [iconFile] = ev.target.files;

    if (iconFile) {
      iconImageSelectButton.style.backgroundImage = `url(${URL.createObjectURL(
        iconFile
      )})`;
    }
  });

  document
    .querySelector('button#register')
    .addEventListener('click', async (ev) => {
      ev.target.setAttribute('disabled', 'true');
      const username = document.querySelector('input#username').value;
      const email = document.querySelector('input#email').value;
      let password = document.querySelector('input#password').value;

      if (!username || !email || !password) {
        errorSpan.style.display = 'block';
        errorSpan.textContent = '未入力の項目があります';
        return;
      } else {
        errorSpan.style.display = 'none';
        errorSpan.textContent = '';
      }

      for (let i = 0; i < 10000; i++) {
        password = await digest(password);
      }

      // ユーザー登録
      const body = {
        username: username,
        email: email,
        password: password,
      };

      let res;
      const decoder = new TextDecoder();
      res = await fetch('/users/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const reader = res.body.getReader();
      let buf = '';
      while (true) {
        const tmp = await reader.read();
        buf += decoder.decode(tmp?.value);
        if (tmp.done) break;
      }
      if (res.status === 400) {
        errorSpan.style.display = 'block';
        errorSpan.textContent = buf;
        return;
      }
      const data = JSON.parse(buf);
      window.sessionStorage.setItem('session', JSON.stringify(data.session));
      ev.target.removeAttribute('disabled');
      overlay.style.display = null;
      overlay.innerHTML = '';

      // console.log(data);

      // TODO: 実装
      // // アイコン画像を登録
      // res = await fetch(
      //   `/users/icon?iconUrl=${data.user.user_metadata.iconurl}`,
      //   {
      //     method: 'POST',
      //     body: document.querySelector('input#icon').files[0],
      //   }
      // );
    });
};

// https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/digest#%E3%83%80%E3%82%A4%E3%82%B8%E3%82%A7%E3%82%B9%E3%83%88%E5%80%A4%E3%82%92_16_%E9%80%B2%E6%96%87%E5%AD%97%E5%88%97%E3%81%AB%E5%A4%89%E6%8F%9B%E3%81%99%E3%82%8B
const digest = async function (data) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
};
