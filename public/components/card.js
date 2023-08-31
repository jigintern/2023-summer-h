export const createStampCard = function (url, title, createdAt) {
  const stampCardElement = document.createElement('div');
  stampCardElement.style.backgroundColor = 'white';
  stampCardElement.style.padding = '12px 16px';
  stampCardElement.style.margin = '0 12px 20px 0';
  stampCardElement.style.border = '0.5px solid var(--color-border)';
  stampCardElement.style.borderRadius = '12px';
  stampCardElement.style.textAlign = 'center';
  stampCardElement.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';

  const stampElement = document.createElement('div');
  stampElement.style.width = '100px';
  stampElement.style.height = '100px';
  stampElement.style.marginBottom = '12px';
  stampElement.style.borderRadius = '50%';
  stampElement.style.backgroundColor = 'lightgray';

  if (url) {
    const imgElement = document.createElement('img');
    imgElement.src = url;
    stampElement.appendChild(imgElement);
  }

  stampCardElement.appendChild(stampElement);

  const titleElement = document.createElement('p');
  titleElement.style.fontWeight = 'bold';
  titleElement.style.fontSize = 'small';
  titleElement.innerText = title;
  stampCardElement.appendChild(titleElement);

  const createdAtElement = document.createElement('p');
  createdAtElement.style.fontSize = 'x-small';
  createdAtElement.style.color = 'gray';
  createdAtElement.innerText = createdAt;
  stampCardElement.appendChild(createdAtElement);

  return stampCardElement;
};

export const createNoteCard = function (url, title, createdBy, onclick) {
  const noteCardElement = document.createElement('div');
  noteCardElement.style.backgroundColor = 'white';
  noteCardElement.style.padding = '12px 16px';
  noteCardElement.style.margin = '0 12px 20px 0';
  noteCardElement.style.border = '0.5px solid var(--color-border)';
  noteCardElement.style.borderRadius = '12px';
  noteCardElement.style.textAlign = 'center';
  noteCardElement.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';

  const stampElement = document.createElement('div');
  stampElement.style.width = '100px';
  stampElement.style.height = '100px';
  stampElement.style.marginBottom = '12px';
  stampElement.style.borderRadius = '50%';
  stampElement.style.backgroundColor = 'lightgray';

  if (url) {
    const imgElement = document.createElement('img');
    imgElement.src = url;
    stampElement.appendChild(imgElement);
  }

  noteCardElement.appendChild(stampElement);

  const titleElement = document.createElement('p');
  titleElement.style.fontWeight = 'bold';
  titleElement.style.fontSize = 'small';
  titleElement.innerText = title;
  noteCardElement.appendChild(titleElement);

  const createdByElement = document.createElement('p');
  createdByElement.style.fontSize = 'x-small';
  createdByElement.style.color = 'gray';
  createdByElement.innerText = createdBy;
  noteCardElement.appendChild(createdByElement);

  noteCardElement.addEventListener('click', onclick);

  return noteCardElement;
};
