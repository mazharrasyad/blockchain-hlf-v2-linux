// Contoh fetch data election dari backend
fetch('http://localhost:3001/api/elections')
  .then(res => res.json())
  .then(data => {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>Daftar Election</h2>' +
      '<ul>' + data.map(e => `<li>${e.title} (${e.id})</li>`).join('') + '</ul>';
  })
  .catch(err => {
    document.getElementById('app').innerHTML = 'Gagal mengambil data: ' + err;
  });
