const today = new Intl.DateTimeFormat('fi-FI', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
document.querySelector('#dateLabel').textContent = `TÄNÄÄN · ${today.toLocaleUpperCase('fi-FI')}`;

const defaults = [
  { id: 1, name: 'Ravintola Kaskis', type: 'Pohjoismainen', open: true, hours: '11.00–14.00', price: '14,50 €', url: 'https://www.kaskis.fi', menu: ['Paahdettu sellerikeitto & yrttiöljy', 'Nieriää, perunaa ja tillikastiketta', 'Marjainen rahka'] },
  { id: 2, name: 'Boon Nam', type: 'Thaimaalainen', open: true, hours: '10.30–15.00', price: '13,90 €', url: 'https://boonnam.fi', menu: ['Panang curry · kana tai tofu', 'Paistettua nuudelia & kasviksia', 'Mango sticky rice'] },
  { id: 3, name: 'Nerå', type: 'Välimerellinen', open: true, hours: '11.00–15.00', price: '12,80 €', url: 'https://nera.fi', menu: ['Sitruunainen orzo & halloumi', 'Päivän focaccia', 'Panna cotta & sitrus'] },
  { id: 4, name: 'Mamma Rosa', type: 'Italialainen', open: false, hours: 'Avaa 16.00', price: '15,00 €', url: 'https://mammarosa.fi', menu: ['Lounaslista julkaistaan myöhemmin', 'Katso päivän annokset ravintolan sivulta'] }
];
let restaurants = JSON.parse(localStorage.getItem('lounaslista-restaurants') || 'null') || defaults;
let favorites = new Set(JSON.parse(localStorage.getItem('lounaslista-favorites') || '[1,2,3]'));
let filter = 'all';
const grid = document.querySelector('#restaurantGrid');
const tpl = document.querySelector('#cardTemplate');

function persist() { localStorage.setItem('lounaslista-restaurants', JSON.stringify(restaurants)); localStorage.setItem('lounaslista-favorites', JSON.stringify([...favorites])); }
function render() {
  const shown = restaurants.filter(r => filter === 'all' || filter === 'open' && r.open || filter === 'favorite' && favorites.has(r.id));
  grid.innerHTML = '';
  shown.forEach(r => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.restaurant-type').textContent = r.type;
    node.querySelector('h2').textContent = r.name;
    const heart = node.querySelector('.heart'); heart.textContent = favorites.has(r.id) ? '♥' : '♡'; heart.classList.toggle('active', favorites.has(r.id));
    heart.onclick = () => { favorites.has(r.id) ? favorites.delete(r.id) : favorites.add(r.id); persist(); render(); };
    node.querySelector('.status-text').textContent = r.open ? 'Avoinna nyt' : 'Suljettu';
    node.querySelector('.status-row').classList.toggle('closed', !r.open);
    node.querySelector('.hours').textContent = r.hours;
    node.querySelector('.price').textContent = r.price;
    const link = node.querySelector('a'); link.href = r.url;
    r.menu.forEach((meal, i) => { const el = document.createElement('div'); el.className = 'meal'; el.innerHTML = `<b>0${i + 1}</b><span>${meal}</span>`; node.querySelector('.menu').append(el); });
    grid.append(node);
  });
  document.querySelector('#emptyState').hidden = shown.length > 0;
  document.querySelector('#allCount').textContent = restaurants.length;
  document.querySelector('#openCount').textContent = restaurants.filter(r => r.open).length;
  document.querySelector('#favCount').textContent = favorites.size;
}
document.querySelectorAll('[data-filter]').forEach(btn => btn.onclick = () => { filter = btn.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === btn)); render(); });
const dialog = document.querySelector('#restaurantDialog');
document.querySelector('#openDialog').onclick = () => dialog.showModal(); document.querySelector('#closeDialog').onclick = () => dialog.close();
document.querySelector('#restaurantForm').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); const id = Date.now(); restaurants.unshift({ id, name: f.get('name'), type: 'Oma suosikki', open: true, hours: f.get('hours') || 'Tarkista sivuilta', price: '—', url: f.get('url'), menu: ['Ruokalista haetaan ravintolan omalta sivulta', 'Avaa linkki nähdäksesi päivän annokset'] }); favorites.add(id); persist(); render(); e.target.reset(); dialog.close(); };
document.querySelector('#themeButton').onclick = () => { document.body.classList.toggle('dark'); };
render();
