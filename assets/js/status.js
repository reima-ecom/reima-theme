/* eslint-disable camelcase */
const btn = document.getElementById('publish');
btn.addEventListener('click', async (e) => {
  /** @type {HTMLButtonElement} */(e.target).disabled = true;
  const response = await fetch(
    'https://us.reima.com/api/publish',
    { method: 'POST' },
  );
  if (response.ok) alert('Publishing site!');
  else alert('Something went wrong :(');
});

(async () => {
  let status = 'n/a';
  let conclusion = 'n/a';
  let created_at = 'n/a';
  const statusResponse = await fetch('https://us.reima.com/api/publish');
  if (statusResponse.ok) {
    ({ status, conclusion, created_at } = await statusResponse.json());
  }
  document.getElementById('status').innerText = status;
  document.getElementById('conclusion').innerText = conclusion;
  document.getElementById('created_at').innerText = created_at;
})();
