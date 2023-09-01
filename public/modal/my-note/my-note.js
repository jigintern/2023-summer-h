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

  const stampScrollBox = document.querySelector('div.stamp-scroll-box');
  document.querySelector('div.title').innerHTML = '<h3>'+title+'</h3>';

  const response=await fetch('/getstamps?note_id='+note_id);
  const stampsJson=await response.json();

  stampsJson.forEach((stamp) => {
    const D=new Date(stamp.created_at);
    const date=(D.getMonth()+1)+'/'+D.getDate()+' '+D.getHours()+':'+('0'+D.getMinutes()).slice(-2);

    const stampCard = createStampCard(stamp.url, stamp.title, date);
    stampScrollBox.appendChild(stampCard);
  });
};
