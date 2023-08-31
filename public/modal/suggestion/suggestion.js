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

  const note = document.getElementsByTagName('li');
  for (const stamp of note) {
    stamp.addEventListener('click', () => {
      suggestion.classList.add('open');
      document.querySelector('div.title').innerHTML =
        '<h3>京都旅行1日目</h3>';
    });
      <ul class="scroll-box"></ul>

  }
};
