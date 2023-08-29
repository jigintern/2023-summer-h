import * as push from './push/push.js';
import * as viewer from './viewer/viewer.js';

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
