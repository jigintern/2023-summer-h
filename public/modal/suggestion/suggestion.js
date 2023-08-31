import { createNoteCard, createStampCard } from '../../components/card.js';

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

  const noteCard = createNoteCard(null, '京都旅行1日目', 'ゆうしん', () => {
    suggestion.classList.add('open');
    document.querySelector('div.title').innerHTML = '<h3>京都旅行1日目</h3>';
    const stampCard = createStampCard(null, '東大寺', '17:25');
    stampScrollBox.appendChild(stampCard);
  });
  noteScrollBox.appendChild(noteCard);
};
