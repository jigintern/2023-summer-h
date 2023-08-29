export const init = function () {
  console.log('push init');

  document.querySelector('#picker').addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      document.querySelector('#img').src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
};
