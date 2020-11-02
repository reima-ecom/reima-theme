/* eslint-disable camelcase */
const btn = document.getElementById('publish');
btn.addEventListener('click', async (e) => {
  (e.target as HTMLButtonElement).disabled = true;
  const response = await fetch(
    'https://us.reima.com/api/publish',
    { method: 'POST' },
  );
  if (response.ok) alert('Publishing site!');
  else alert('Something went wrong :(');
});

const updatePublish = async () => {
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
};

const updateLog = async () => {
  const resp = await fetch('/hugo-log.txt');
  let status = 'n/a';
  let log = 'Could not load log';
  if (resp.ok) {
    log = await resp.text();
    if (log.includes('ERROR')) status = 'Failed';
    else if (log.includes('WARN')) status = 'Succeeded with warnings';
    else status = 'Succeeded';
  }
  document.getElementById('build-log').innerText = log;
  document.getElementById('build-status').innerText = status;
};

updatePublish();
updateLog();
