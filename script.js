const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const filters = document.querySelectorAll('.filter');
const products = document.querySelectorAll('.product-card');

function setFilter(category) {
  filters.forEach(button => button.classList.toggle('active', button.dataset.filter === category));
  products.forEach(product => {
    const show = category === 'all' || product.dataset.category === category;
    product.classList.toggle('hidden', !show);
  });
}

filters.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));

document.querySelectorAll('[data-filter-link]').forEach(link => {
  link.addEventListener('click', () => setFilter(link.dataset.filterLink));
});

document.getElementById('year').textContent = new Date().getFullYear();
