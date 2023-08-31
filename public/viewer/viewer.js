import { createNoteCard } from '../images/components/card.js';
import * as myNote from '../modal/my-note/my-note.js';

export const init = function () {
  const overlay = document.querySelector('div.overlay');
  const grid = document.querySelector('div.grid');

  const dummyNotes = [
    {
      note_id: 0,
      title: '奈良旅行１日目',
      url: null,
      createdAt: '2022/01/10',
    },
    {
      note_id: 1,
      title: '奈良旅行2日目',
      url: null,
      createdAt: '2022/01/11',
    },
    {
      note_id: 2,
      title: '奈良旅行3日目',
      url: null,
      createdAt: '2022/01/12',
    },
    {
      note_id: 3,
      title: '奈良旅行4日目',
      url: null,
      createdAt: '2022/01/13',
    },
  ];

  dummyNotes.forEach((item) => {
    const noteCard = createNoteCard(
      item.url,
      item.title,
      item.createdAt,
      async () => {
        overlay.style.display = 'grid';
        overlay.innerHTML = await (
          await fetch('./modal/my-note/my-note.html')
        ).text();
        myNote.init();
      }
    );
    grid.appendChild(noteCard);
  });
};
