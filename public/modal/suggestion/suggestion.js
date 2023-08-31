import {
  createNoteCard,
  createStampCard,
} from '../../images/components/card.js';

function delay(n) {
  return new Promise(function (resolve) {
    setTimeout(resolve, n * 1000);
  });
}

export const show = async function () {
  const suggestion = document.querySelector('div.suggestion');
  suggestion.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });
  await delay(0.01);
  suggestion.classList.add('active');

  const noteScrollBox = document.querySelector('div.note-scroll-box');
  const stampScrollBox = document.querySelector('div.stamp-scroll-box');

  const dummyNotes = [
    {
      note_id: 0,
      title: '奈良旅行１日目',
      url: null,
      createdBy: 'ゆうしん',
    },
    {
      note_id: 1,
      title: '奈良旅行2日目',
      url: null,
      createdBy: 'ゆうしん',
    },
    {
      note_id: 2,
      title: '奈良旅行3日目',
      url: null,
      createdBy: 'ゆうしん',
    },
    {
      note_id: 3,
      title: '奈良旅行4日目',
      url: null,
      createdBy: 'ゆうしん',
    },
  ];

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

  dummyNotes.forEach((note) => {
    const noteCard = createNoteCard(
      note.url,
      note.title,
      note.createdBy,
      () => {
        suggestion.classList.add('open');
        document.querySelector(
          'div.title'
        ).innerHTML = `<h3>${note.title}</h3>`;
        stampScrollBox.innerHTML = '';
        dummyStamps.forEach((stamp) => {
          const stampCard = createStampCard(
            stamp.url,
            stamp.title,
            stamp.createdAt
          );
          stampScrollBox.appendChild(stampCard);
        });
      }
    );
    console.log(note);
    noteScrollBox.appendChild(noteCard);
  });
};
