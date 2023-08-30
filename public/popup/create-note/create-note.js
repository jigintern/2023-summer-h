export const init = function () {
  const createNotePop = document.querySelector('div.create-note');
  createNotePop.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });

  //作成ボタン
  const createNoteButton = document.querySelector('div.create-note a');
  createNoteButton.addEventListener('click', async (ev)=>{

    //スタンプ帳API叩く
    const title=document.querySelector('div.create-note input').value;
    const user_id=JSON.parse(window.sessionStorage.getItem("session")).user.id;
    const data={
      user_id:user_id, 
      title:title
    };
    const params={
      method:'POST', 
      body: JSON.stringify(data)
    };
    const response=await fetch('/newnote', params);
    const note_id=await response.text();
    console.log(note_id);
    //overlay削除
    const overlay = document.querySelector('div.overlay');
    overlay.style.display = null;
    overlay.innerHTML = '';
  });
};
