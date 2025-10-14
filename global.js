console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume' },
    { url: 'contact/', title: 'Contact' },
    { url: 'https://github.com/Keanuventura', title: 'GitHub', external: true }
];
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/"
    : "/portfolio/";
let nav = document.createElement('nav');
document.body.prepend(nav);
for (let p of pages) {
    let url = p.url;
    url = !url.startsWith('http') ? BASE_PATH + url : url;
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host !== location.host) {
        a.target = "_blank";
    }
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    nav.append(a);
}
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="color-scheme-select">
        <option value="light dark" selected>Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>`
);
const themeSelect = document.getElementById('color-scheme-select');
if ("colorScheme" in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    themeSelect.value = savedScheme;
}
themeSelect.addEventListener('input', (event) => {
    const value = event.target.value;
    document.documentElement.style.setProperty('color-scheme', value);
    localStorage.colorScheme = value; // Save user preference
    console.log('Color scheme changed to', value);
});
const form = document.querySelector('form');
form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    let params = [];
    for (let [name, value] of data) {
        params.push(`${name}=${encodeURIComponent(value)}`);
    }
    const url = `${form.action}?${params.join('&')}`;
    location.href = url;
});