export const init = function () {
  const createNotePop = document.querySelector('div.create-note');
  createNotePop.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });

  //作成ボタン
  const createNoteErrorSpan = document.querySelector('div.create-note span.error');
  const createNoteButton = document.querySelector('div.create-note a');
  createNoteButton.addEventListener('click', async (ev)=>{
    ev.target.setAttribute('disabled', 'true');
    const title=document.querySelector('div.create-note input').value;
    const user_id=JSON.parse(window.sessionStorage.getItem("session"))?.user.id;
    //データないとき    
    if (!user_id){
      createNoteErrorSpan.style.display = 'block';
      createNoteErrorSpan.textContent = 'ログインしてください';
      ev.target.removeAttribute('disabled');
      return;
    } else if (!title) {
      createNoteErrorSpan.style.display = 'block';
      createNoteErrorSpan.textContent = '未入力の項目があります';
      ev.target.removeAttribute('disabled');
      return;
    } else {
      createNoteErrorSpan.style.display = 'none';
      createNoteErrorSpan.textContent = '';
    }
    
    //スタンプ帳API叩く
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
