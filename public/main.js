import * as push from './push/push.js';
import * as viewer from './viewer/viewer.js';
import * as account from './popup/account/account.js';

const main = document.querySelector('main#main');

const router = async function () {
  const hash = location.hash.replace('#/', '');
  console.log(hash);

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

// ユーザー関連の処理
const isUserLoggedIn = function () {
  const session = JSON.parse(window.sessionStorage.getItem('session'));
  if (!session) return false;
  const now = new Date().getTime() / 1000;
  console.log(now, session?.expires_at);
  return session?.expires_at > now;
};
const getUsername = function () {
  const session = JSON.parse(window.sessionStorage.getItem('session'));
  return session.user.user_metadata.username;
};

// ヘッダーのボタンの処理

/**
 * @type {HTMLDivElement}
 */
const overlay = document.querySelector('div.overlay');
overlay.addEventListener('click', () => {
  overlay.style.display = null;
  overlay.innerHTML = '';
});

const accountButton = document.querySelector('header>button.account');
console.log(isUserLoggedIn());
if (isUserLoggedIn()) {
  accountButton.textContent = getUsername();
}
accountButton.addEventListener('click', async () => {
  overlay.style.display = 'grid';
  overlay.innerHTML = await (
    await fetch('./popup/account/account.html')
  ).text();
  account.init();
});
