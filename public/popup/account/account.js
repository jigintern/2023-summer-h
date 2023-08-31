import { isUserLoggedIn } from '../../main.js';

let iconImage = undefined;

export const init = function () {
  const accountButton = document.querySelector('header>button.account');
  const overlay = document.querySelector('div.overlay');
  const signinErrorSpan = document.querySelector('div.inner-signin>span.error');
  const signupErrorSpan = document.querySelector('div.inner-signup>span.error');
  const accountPop = document.querySelector('div.account');
  accountPop.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });

  if (isUserLoggedIn()) {
    document.querySelector('details.signin').style.display = 'none';
    document.querySelector('details.signup').style.display = 'none';
    document.querySelector('div.signout').style.display = 'flex';
  }

  document
    .querySelector('button#signin')
    .addEventListener('click', async (ev) => {
      ev.target.setAttribute('disabled', 'true');

      const email = document.querySelector('input#signin-email').value;
      let password = document.querySelector('input#signin-password').value;

      if (!email || !password) {
        signinErrorSpan.style.display = 'block';
        signinErrorSpan.textContent = '未入力の項目があります';
        ev.target.removeAttribute('disabled');
        return;
      } else {
        signinErrorSpan.style.display = 'none';
        signinErrorSpan.textContent = '';
      }

      for (let i = 0; i < 10000; i++) {
        password = await digest(password);
      }

      const body = {
        email: email,
        password: password,
      };

      const decoder = new TextDecoder();
      const res = await fetch('/users/signin', {
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
        signinErrorSpan.style.display = 'block';
        signinErrorSpan.textContent = buf;
        ev.target.removeAttribute('disabled');
        return;
      }
      const data = JSON.parse(buf);
      window.sessionStorage.setItem('session', JSON.stringify(data.session));
      accountButton.style.backgroundImage = `url(${data.user.user_metadata.iconurl}`;

      ev.target.removeAttribute('disabled');
      overlay.style.display = null;
      overlay.innerHTML = '';

      const todaysNoteIdRes = await fetch(
        `/noteid/today?user_id=${data.user.id}`
      );
      const todaysNoteId = await todaysNoteIdRes.text();
      if (!todaysNoteId) {
        document
          .querySelector('header>button.create-note')
          .dispatchEvent(new Event('click'));
        return;
      }
      window.localStorage.setItem('note_id', todaysNoteId);
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
      const reader = new FileReader();
      iconImageSelectButton.style.backgroundImage = `url(${URL.createObjectURL(
        iconFile
      )})`;
      reader.onload = (event) => {
        iconImage = event.target.result;
      };
      reader.readAsDataURL(iconFile);
    }
  });

  document
    .querySelector('button#register')
    .addEventListener('click', async (ev) => {
      ev.target.setAttribute('disabled', 'true');
      const username = document.querySelector('input#username').value;
      const email = document.querySelector('input#signup-email').value;
      let password = document.querySelector('input#signup-password').value;

      if (!username || !email || !password) {
        signupErrorSpan.style.display = 'block';
        signupErrorSpan.textContent = '未入力の項目があります';
        ev.target.removeAttribute('disabled');
        return;
      } else {
        signupErrorSpan.style.display = 'none';
        signupErrorSpan.textContent = '';
      }

      for (let i = 0; i < 10000; i++) {
        password = await digest(password);
      }

      // ユーザーアイコンのアップロード
      const iconPostRes = await fetch('/users/icon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: iconImage }),
      });

      const imageUrl = JSON.parse(await iconPostRes.text()).publicUrl;

      // ユーザー登録
      const body = {
        username: username,
        email: email,
        password: password,
        iconUrl: imageUrl,
      };
      console.log(body);

      const decoder = new TextDecoder();
      const res = await fetch('/users/register', {
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
        signupErrorSpan.style.display = 'block';
        signupErrorSpan.textContent = buf;
        ev.target.removeAttribute('disabled');
        return;
      }
      const data = JSON.parse(buf);
      window.sessionStorage.setItem('session', JSON.stringify(data.session));
      accountButton.style.backgroundImage = `url(${data.user.user_metadata.iconurl}`;

      ev.target.removeAttribute('disabled');
      overlay.style.display = null;
      overlay.innerHTML = '';
    });

  document
    .querySelector('button.signout-button')
    .addEventListener('click', () => {
      window.sessionStorage.removeItem('session');
      window.localStorage.removeItem('note_id');
      location.href = '/';
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
