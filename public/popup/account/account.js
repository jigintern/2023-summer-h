export const init = function () {
  const accountPop = document.querySelector('div.account');
  accountPop.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });
};
