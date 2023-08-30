export const init = function () {
  const createNotePop = document.querySelector('div.create-note');
  createNotePop.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });
};
