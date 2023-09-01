import { createNoteCard } from '../components/card.js';
import * as myNote from '../modal/my-note/my-note.js';

export const init = async function () {
  const overlay = document.querySelector('div.overlay');
  const grid = document.querySelector('div.grid');

  const user_id = JSON.parse(window.sessionStorage.getItem('session'))?.user.id;
  const response = await fetch(`/getnotes?user_id=${user_id}`);
  const notesJson = await response.json();
  console.log(notesJson);

  // スタンプ帳が存在しないとき
  if (notesJson.data.length === 0) {
    document.querySelector('div.not-exist-note-text').innerHTML =
      '<p>' +
      'スタンプ帳がありません。' +
      '</p>' +
      '<p>' +
      '左上のボタンから始めましょう！' +
      '</p>';
  }

  notesJson.data.forEach((note) => {
    const D = new Date(note.created_at);
    const date = D.getFullYear() + '/' + (D.getMonth() + 1) + '/' + D.getDate();
    const noteCard = createNoteCard(
      note.thumbnailUrl,
      note.title,
      date,
      async () => {
        overlay.style.display = 'grid';
        overlay.innerHTML = await (
          await fetch('./modal/my-note/my-note.html')
        ).text();
        myNote.init(note.title, note.id);
      }
    );
    grid.appendChild(noteCard);
  });
};
