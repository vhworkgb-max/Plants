/* Стан кошика, каталог товарів і підрахунки */

// Кошик: { id товару: кількість }. let, а не const — при оформленні кошик обнуляється
let cart = {};

// Каталог товарів: { id: { name, price } } — формується з карток HTML
const catalog = {};

function getElement(id) { return document.getElementById(id); }

/* ---------- 1. Каталог ---------- */
function buildCatalog() {
    const cards = document.querySelectorAll('#productsGrid .product-card');

    for (const card of cards) {
        const addButton = card.querySelector('.add-to-cart');
        const title = card.querySelector('.card-title');
        const priceElement = card.querySelector('.card-text');

        if (!addButton || !title || !priceElement) continue;

        const id = addButton.getAttribute('data-id');
        const name = title.textContent.trim();
        const price = parseInt(priceElement.textContent, 10);

        if (id && name && price) {
            catalog[id] = { name: name, price: price };
        }
    }
}

/* ---------- 2. Підрахунки ---------- */
function countItems() {
    let total = 0;
    for (const id in cart) {
        total += cart[id];
    }
    return total;
}

function sumCart() {
    let total = 0;
    for (const id in cart) {
        const product = catalog[id];
        if (!product) continue;
        total += product.price * cart[id];
    }
    return total;
}

function formatPrice(value) { return value + ' ₴'; }

/* Українське відмінювання: 1 товар, 2 товари, 5 товарів */
function pluralForm(count) {
    const last = count % 10;
    const lastTwo = count % 100;
    if (last === 1 && lastTwo !== 11) return 'товар';
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'товари';
    return 'товарів';
}