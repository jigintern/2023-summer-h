import * as push from './push/push.js';
import * as viewer from './viewer/viewer.js';
import * as createNote from './popup/create-note/create-note.js';
import * as suggestion from './modal/suggestion/suggestion.js';
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

// ヘッダーのボタンの処理

/**
 * @type {HTMLDivElement}
 */
const overlay = document.querySelector('div.overlay');
overlay.addEventListener('click', () => {
  overlay.style.display = null;
  overlay.innerHTML = '';
});

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
