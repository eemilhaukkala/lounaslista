const today = new Intl.DateTimeFormat('fi-FI', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
document.querySelector('#dateLabel').textContent = `TÄNÄÄN · ${today.toLocaleUpperCase('fi-FI')}`;

let restaurants = [];
let favorites = new Set(JSON.parse(localStorage.getItem('lounaslista-favorites') || '[]'));
let filter = 'all';
let userPosition = null;
const grid = document.querySelector('#restaurantGrid');
const template = document.querySelector('#cardTemplate');
const locationButton = document.querySelector('#locationButton');

function persistFavorites() { localStorage.setItem('lounaslista-favorites', JSON.stringify([...favorites])); }
function distanceKm(origin, destination) {
  const radius = 6371;
  const lat = (destination.lat - origin.lat) * Math.PI / 180;
  const lon = (destination.lon - origin.lon) * Math.PI / 180;
  const value = Math.sin(lat / 2) ** 2 + Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * Math.sin(lon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
function distanceLabel(km) { return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`; }
function websiteUrl(value, osmType, osmId) {
  try { const url = new URL(value); if (url.protocol === 'https:' || url.protocol === 'http:') return url.href; } catch (_) { /* Use the OSM page below. */ }
  return `https://www.openstreetmap.org/${osmType}/${osmId}`;
}
function normalizePlace(element) {
  const tags = element.tags || {};
  const coordinates = element.center || element;
  return {
    id: `osm-${element.type}-${element.id}`,
    name: tags.name || 'Nimetön ravintola',
    type: tags.cuisine ? tags.cuisine.replaceAll(';', ' · ') : tags.amenity === 'cafe' ? 'Kahvila' : 'Ravintola',
    open: tags.opening_hours ? true : null,
    hours: tags.opening_hours || 'Tarkista aukioloajat',
    price: tags['contact:phone'] || tags.phone || 'Lounastiedot ravintolalta',
    lat: coordinates.lat,
    lon: coordinates.lon,
    url: websiteUrl(tags.website || tags['contact:website'], element.type, element.id),
    menu: ['Päivän lounaslista löytyy ravintolan omalta sivulta.']
  };
}
function setEmptyMessage(message) { document.querySelector('#emptyState').textContent = message; }
function render() {
  const shown = restaurants.filter(place => filter === 'all' || (filter === 'open' && place.open) || (filter === 'favorite' && favorites.has(place.id)));
  grid.innerHTML = '';
  shown.forEach(place => {
    const node = template.content.cloneNode(true);
    node.querySelector('.restaurant-type').textContent = place.type;
    node.querySelector('h2').textContent = place.name;
    const heart = node.querySelector('.heart');
    heart.textContent = favorites.has(place.id) ? '♥' : '♡';
    heart.classList.toggle('active', favorites.has(place.id));
    heart.onclick = () => { favorites.has(place.id) ? favorites.delete(place.id) : favorites.add(place.id); persistFavorites(); render(); };
    node.querySelector('.status-text').textContent = place.open === null ? 'Aukioloajat sivulla' : place.open ? 'Aukioloajat saatavilla' : 'Aukioloajat puuttuvat';
    node.querySelector('.status-row').classList.toggle('closed', place.open === false);
    node.querySelector('.hours').textContent = place.hours;
    node.querySelector('.price').textContent = userPosition && Number.isFinite(place.lat) ? distanceLabel(distanceKm(userPosition, place)) : place.price;
    const link = node.querySelector('a'); link.href = place.url; link.textContent = 'Katso ravintolan sivu ↗';
    place.menu.forEach((meal, index) => { const row = document.createElement('div'); row.className = 'meal'; const number = document.createElement('b'); number.textContent = `0${index + 1}`; const content = document.createElement('span'); content.textContent = meal; row.append(number, content); node.querySelector('.menu').append(row); });
    grid.append(node);
  });
  const empty = document.querySelector('#emptyState');
  empty.hidden = shown.length > 0;
  document.querySelector('#allCount').textContent = restaurants.length;
  document.querySelector('#openCount').textContent = restaurants.filter(place => place.open).length;
  document.querySelector('#favCount').textContent = [...favorites].filter(id => restaurants.some(place => place.id === id)).length;
}
function showNearby() {
  const nearby = restaurants.slice(0, 3);
  const section = document.querySelector('#nearbySection');
  document.querySelector('#nearbyNote').textContent = 'Lähimmät OpenStreetMapista löytyneet ravintolat — etäisyys linnuntietä.';
  document.querySelector('#mapSearch').href = `https://www.openstreetmap.org/?mlat=${userPosition.lat}&mlon=${userPosition.lon}#map=14/${userPosition.lat}/${userPosition.lon}`;
  const list = document.querySelector('#nearbyList'); list.innerHTML = '';
  nearby.forEach(place => { const item = document.createElement('article'); item.className = 'nearby-place'; const title = document.createElement('strong'); title.textContent = place.name; const detail = document.createElement('span'); detail.textContent = `${place.type} · ${distanceLabel(distanceKm(userPosition, place))}`; const link = document.createElement('a'); link.href = place.url; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Katso ravintolan sivu ↗'; item.append(title, detail, link); list.append(item); });
  section.hidden = nearby.length === 0;
}
async function fetchNearbyPlaces() {
  const query = `[out:json][timeout:25];(nwr(around:3500,${userPosition.lat},${userPosition.lon})[amenity~"^(restaurant|cafe|fast_food)$"][name];);out center tags;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: `data=${encodeURIComponent(query)}` });
  if (!response.ok) throw new Error('Ravintolahaku ei vastannut.');
  const data = await response.json();
  restaurants = data.elements.map(normalizePlace).filter(place => Number.isFinite(place.lat) && Number.isFinite(place.lon)).map(place => ({ ...place, distance: distanceKm(userPosition, place) })).sort((a, b) => a.distance - b.distance).slice(0, 30);
  setEmptyMessage('Lähistöltä ei löytynyt ravintoloita. Kokeile karttahakua.');
}
document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => { filter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button)); render(); });
const dialog = document.querySelector('#restaurantDialog');
document.querySelector('#openDialog').onclick = () => dialog.showModal();
document.querySelector('#closeDialog').onclick = () => dialog.close();
document.querySelector('#restaurantForm').onsubmit = event => { event.preventDefault(); const form = new FormData(event.target); const id = `manual-${Date.now()}`; restaurants.unshift({ id, name: form.get('name'), type: 'Oma suosikki', open: null, hours: form.get('hours') || 'Tarkista ravintolan sivulta', price: 'Oma lisäys', url: form.get('url'), menu: ['Päivän lounaslista löytyy ravintolan omalta sivulta.'] }); favorites.add(id); persistFavorites(); setEmptyMessage('Käytä sijaintiasi hakeaksesi aitoja lounaspaikkoja lähistöltä.'); render(); event.target.reset(); dialog.close(); };
document.querySelector('#themeButton').onclick = () => document.body.classList.toggle('dark');
locationButton.onclick = () => {
  if (!navigator.geolocation) { locationButton.textContent = 'Sijainti ei ole käytettävissä'; return; }
  locationButton.disabled = true; locationButton.textContent = 'Haetaan sijaintia…';
  navigator.geolocation.getCurrentPosition(async position => {
    userPosition = { lat: position.coords.latitude, lon: position.coords.longitude };
    locationButton.textContent = 'Haetaan lounaspaikkoja…';
    try { await fetchNearbyPlaces(); showNearby(); render(); locationButton.textContent = '⌖ Päivitä lähialue'; }
    catch (_) { restaurants = []; setEmptyMessage('Lounaspaikkoja ei juuri nyt saatu haettua. Avaa karttahaku ja kokeile uudelleen.'); render(); document.querySelector('#nearbySection').hidden = true; locationButton.textContent = 'Yritä uudelleen'; }
    locationButton.disabled = false;
  }, () => { locationButton.textContent = 'Sijaintia ei saatu'; locationButton.disabled = false; }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
};
setEmptyMessage('Käytä sijaintiasi hakeaksesi aitoja lounaspaikkoja lähistöltä.');
render();
