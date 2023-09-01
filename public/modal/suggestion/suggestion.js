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

  const body=new Object();
  navigator.geolocation.getCurrentPosition(async (position) => {
    body.latitude=position.coords.latitude;
    body.longitude=position.coords.longitude;
  });

  const params={
    method:'POST',
    body:JSON.stringify(body)
  };
  const response=await fetch('/near', params);
  const notesJson=await response.json();

  notesJson.forEach(async (note) => {
    const name=note.users.raw_user_meta_data.username;
    const noteCard = createNoteCard(null, note.title, name, async () => {
      stampScrollBox.innerHTML='';
      suggestion.classList.add('open');
      document.querySelector('div.title').innerHTML = '<h3>'+note.title+'</h3>';

      const note_id=note.id;
      const response=await fetch('/getstamps?note_id='+note_id);
      const stampsJson=await response.json();
      stampsJson.forEach((stamp)=>{
        const D=new Date(stamp.created_at);
        const time=D.getHours()+":"+('0'+D.getMinutes()).slice(-2);
        const stampCard = createStampCard(stamp.url, stamp.landmark, time);
        stampScrollBox.appendChild(stampCard);
      });
    });
    noteScrollBox.appendChild(noteCard);
  });
};
