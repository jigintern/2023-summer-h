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

export const createLoading = function () {
  const loadingElement = document.createElement('div');
  loadingElement.style.width = '40px';
  loadingElement.style.height = '40px';
  loadingElement.style.borderRadius = '40px';
  loadingElement.style.border = '8px solid var(--color-accent)';
  loadingElement.style.borderTopColor = 'transparent';
  loadingElement.style.animation = 'circle 1s linear infinite';
  loadingElement.style.webkitAnimation = 'circle 1s linear infinite';
  return loadingElement;
};
