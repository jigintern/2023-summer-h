import { createStampCard } from '../../components/card.js';

function delay(n) {
  return new Promise(function (resolve) {
    setTimeout(resolve, n * 1000);
  });
}

export const init = async function () {
  const myNote = document.querySelector('div.my-note');
  myNote.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });
  await delay(0.01);
  myNote.classList.add('active');

  const stampScrollBox = document.querySelector('div.stamp-scroll-box');
  document.querySelector('div.title').innerHTML = '<h3>奈良旅行1日目</h3>';

  const dummyStamps = [
    {
      note_id: 0,
      title: '東大寺',
      url: null,
      createdAt: '17:25',
    },
    {
      note_id: 0,
      title: '西大寺',
      url: null,
      createdAt: '17:55',
    },
    {
      note_id: 0,
      title: '南大寺',
      url: null,
      createdAt: '18:25',
    },
    {
      note_id: 0,
      title: '北大寺',
      url: null,
      createdAt: '18:55',
    },
  ];

  dummyStamps.forEach((item) => {
    console.log(item);
    const stampCard = createStampCard(item.url, item.title, item.createdAt);
    stampScrollBox.appendChild(stampCard);
  });
};
