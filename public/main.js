import * as push from './push/push.js';
import * as viewer from './viewer/viewer.js';
import * as createNote from './popup/create-note/create-note.js';
import * as suggestion from './modal/suggestion/suggestion.js';
import * as account from './popup/account/account.js';
import { createGeneralPopup } from './popup/general-popup.js';

let geolocation = undefined;
const main = document.querySelector('main#main');

const router = async function () {
  const hash = location.hash.replace('#/', '');

  switch (hash) {
    case 'viewer':
      main.innerHTML = await (await fetch('./viewer/viewer.html')).text();
      viewer.init();
      break;
    case 'push':
      main.innerHTML = await (await fetch('./push/push.html')).text();
      push.init();
      break;
    default:
      location.hash = '#/push';
      break;
  }
};

window.addEventListener('hashchange', router);

router();

// ヘッダーのボタンの処理

/**
 * @type {HTMLDivElement}
 */
const overlay = document.querySelector('div.overlay');
export const closeOverlay = function () {
  overlay.style.display = null;
  overlay.innerHTML = '';
};
export const showOverlay = function (child, preventOverlayClose) {
  overlay.style.display = 'grid';
  overlay.innerHTML = '';
  overlay.appendChild(child);
  if (preventOverlayClose) {
    overlay.removeEventListener('click', closeOverlay);
  }
};
overlay.addEventListener('click', closeOverlay);

const createNoteButton = document.querySelector('header>button.create-note');
createNoteButton.addEventListener('click', async () => {
  overlay.style.display = 'grid';
  overlay.innerHTML = await (
    await fetch('./popup/create-note/create-note.html')
  ).text();
  createNote.init();
});

const accountButton = document.querySelector('header>button.account');
accountButton.addEventListener('click', async () => {
  overlay.style.display = 'grid';
  overlay.innerHTML = await (
    await fetch('./popup/account/account.html')
  ).text();
  account.init();
});

// ユーザー関連の関数
export const isUserLoggedIn = function () {
  const session = JSON.parse(window.sessionStorage.getItem('session'));
  if (!session) return false;
  const now = new Date().getTime() / 1000;
  // console.log(now, session?.expires_at);
  return session?.expires_at > now;
};
export const getUsername = function () {
  const session = JSON.parse(window.sessionStorage.getItem('session'));
  return session.user.user_metadata.username;
};
export const getUserIconUrl = function () {
  const session = JSON.parse(window.sessionStorage.getItem('session'));
  return session.user.user_metadata.iconurl;
};

if (isUserLoggedIn()) {
  accountButton.style.backgroundImage = `url(${getUserIconUrl()}`;
  if (window.localStorage.getItem('geolocation-enabled') !== 'true') {
    if ('geolocation' in navigator) {
      overlay.style.display = 'grid';
      overlay.appendChild(
        createGeneralPopup('本アプリケーションでは位置情報を使用します。')
      );
      geolocation = navigator.geolocation;
      geolocation.getCurrentPosition((position) => {
        console.log(
          `latitude: ${position.coords.latitude}, longitude: ${position.coords.longitude}`
        );
        window.localStorage.setItem('geolocation-enabled', 'true');
      });
    } else {
      overlay.appendChild(
        createGeneralPopup(
          'お使いのブラウザでは本アプリケーションは動作しません'
        )
      );
    }
  } else {
    geolocation = navigator.geolocation;
  }
} else {
  window.sessionStorage.removeItem('session');
  accountButton.click();
}

const clearOldNoteId = async () => {
  const note_id = localStorage.getItem('note_id');
  if (!note_id) return;
  const response = await fetch('/getnote?note_id=' + note_id);
  const json = await response.json();

  if (json[0] == null) {
    localStorage.removeItem('note_id');
    return;
  }

  const targetDate = new Date(json[0].created_at);
  const nowDate = new Date();

  if (
    targetDate.getDate() != nowDate.getDate() ||
    targetDate.getMonth() != nowDate.getMonth() ||
    targetDate.getFullYear() != nowDate.getFullYear()
  )
    localStorage.removeItem('note_id');
};
clearOldNoteId();
