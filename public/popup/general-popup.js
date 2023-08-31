export const createGeneralPopup = function (message) {
  const popupElement = document.createElement('div');
  popupElement.style.width = '80vw';
  popupElement.style.maxWidth = '300px';
  popupElement.style.padding = '16px';
  popupElement.style.borderRadius = '16px';
  popupElement.style.backgroundColor = 'var(--color-background)';

  popupElement.innerText = message;

  return popupElement;
};
