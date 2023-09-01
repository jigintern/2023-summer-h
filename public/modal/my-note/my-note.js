import { createStampCard } from '../../components/card.js';

function delay(n) {
  return new Promise(function (resolve) {
    setTimeout(resolve, n * 1000);
  });
}

export const init = async function (title, note_id) {
  const myNote = document.querySelector('div.my-note');
  myNote.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });
  await delay(0.01);
  myNote.classList.add('active');

  const overlay = document.querySelector('div.overlay');
  const stampScrollBox = document.querySelector('div.stamp-scroll-box');
  document.querySelector('div.title').innerHTML = '<h3>' + title + '</h3>';

  const response = await fetch('/getstamps?note_id=' + note_id);
  const stampsJson = await response.json();

  // スタンプが存在しないとき
  if (stampsJson.length === 0) {
    document.querySelector('div.not-exist-stamp-text').innerHTML =
      '<p>' + 'このスタンプ帳にはスタンプがありません。下のボタンから始めましょう！' + '</p>';
    document.querySelector('div.not-exist-stamp-button').innerHTML =
      '<a id="push" href="#/push">' + 'スタンプを押す' + '</a>';
    document.querySelector('#push').addEventListener('click', async () => {
      overlay.style.display = null;
      overlay.innerHTML = '';
    });
  }

  stampsJson.forEach((stamp) => {
    const D=new Date(stamp.created_at);
    const date=(D.getMonth()+1)+'/'+D.getDate()+' '+D.getHours()+':'+('0'+D.getMinutes()).slice(-2);

    const stampCard = createStampCard(stamp.url, stamp.title, date);
    stampScrollBox.appendChild(stampCard);
  });
};
