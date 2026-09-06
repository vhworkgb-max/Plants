/* Кошик, пошук і фільтр */

// Кошик: { id товару: кількість }
var cart = {};

// Каталог товарів: { id: { name, price } } — формується з карток HTML
var catalog = {};

function getElement(id) { return document.getElementById(id); }

/* ---------- 1. Каталог ---------- */
function buildCatalog() {
    var cards = document.querySelectorAll('#productsGrid .product-card');
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var addButton = card.querySelector('.add-to-cart');
        var title = card.querySelector('.card-title');
        var priceElement = card.querySelector('.card-text');

        if (!addButton || !title || !priceElement) continue;

        var id = addButton.getAttribute('data-id');
        var name = title.textContent.trim();
        var price = parseInt(priceElement.textContent, 10);

        if (id && name && price) {
            catalog[id] = { name: name, price: price };
        }
    }
}

/* ---------- 2. Підрахунки ---------- */
function countItems() {
    var total = 0;
    for (var id in cart) {
        total += cart[id];
    }
    return total;
}

function sumCart() {
    var total = 0;
    for (var id in cart) {
        total += catalog[id].price * cart[id];
    }
    return total;
}

function formatPrice(value) { return value + ' ₴'; }

/* ---------- 3. Лічильник кошика в шапці ---------- */
function updateBadge() {
    var badge = getElement('cartCount');
    var status = getElement('cartStatus');
    var cartButton = getElement('cartBtn');
    if (!badge || !cartButton) return;

    var count = countItems();
    badge.textContent = count;
    badge.style.display = (count > 0) ? 'inline-block' : 'none';

    if (status) {
        var word;
        if (count === 1) {
            word = 'товар';
        } else if (count < 5) {
            word = 'товари';
        } else {
            word = 'товарів';
        }
        status.textContent = 'У кошику ' + count + ' ' + word;
    }

    // Перезапуск анімації «підстрибування» кнопки кошика
    cartButton.classList.remove('cart-bump');
    void cartButton.offsetWidth;
    cartButton.classList.add('cart-bump');
}

/* ---------- 4. Кошик у модальному вікні ---------- */
function renderCart() {
    var body = getElement('cartBody');
    var sum = getElement('cartSum');
    if (!body || !sum) return;

    var html = '';
    var hasItems = false;

    for (var id in cart) {
        hasItems = true;
        var product = catalog[id];
        var quantity = cart[id];
        var lineSum = product.price * quantity;

        html += '<div class="d-flex align-items-center justify-content-between border-bottom py-2 cart-row" data-id="' + id + '">';
        html += '<div class="flex-grow-1"><div class="fw-semibold">' + product.name + '</div>';
        html += '<small class="text-muted">' + formatPrice(product.price) + ' × ' + quantity + ' = <span class="fw-semibold">' + formatPrice(lineSum) + '</span></small></div>';
        html += '<div class="btn-group ms-2">';
        html += '<button class="btn btn-outline-secondary qty-minus" type="button" aria-label="Зменшити кількість ' + product.name + '">−</button>';
        html += '<span class="btn btn-light disabled" aria-label="Кількість ' + quantity + '">' + quantity + '</span>';
        html += '<button class="btn btn-outline-secondary qty-plus" type="button" aria-label="Збільшити кількість ' + product.name + '">+</button>';
        html += '</div>';
        html += '<button class="btn btn-outline-danger ms-2 qty-remove" type="button" aria-label="Видалити ' + product.name + ' з кошика">✕</button>';
        html += '</div>';
    }

    if (hasItems) {
        body.innerHTML = html;
        var rows = body.querySelectorAll('.cart-row');
        for (var i = 0; i < rows.length; i++) {
            setupRow(rows[i]);
        }
    } else {
        body.innerHTML = '<p class="text-muted text-center mb-0">Кошик порожній.</p>';
    }

    sum.textContent = formatPrice(sumCart());
}

/* Кнопки +, −, ✕ у кожному рядку кошика */
function setupRow(row) {
    var id = row.getAttribute('data-id');

    row.querySelector('.qty-plus').addEventListener('click', function () {
        changeQuantity(id, 1);
    });
    row.querySelector('.qty-minus').addEventListener('click', function () {
        changeQuantity(id, -1);
    });
    row.querySelector('.qty-remove').addEventListener('click', function () {
        removeProduct(id);
    });
}

/* ---------- 5. Зміна кількості та видалення ---------- */
function changeQuantity(id, delta) {
    var current = cart[id] || 0;
    var next = current + delta;
    if (next <= 0) {
        delete cart[id];
    } else {
        cart[id] = next;
    }
    updateBadge();
    renderCart();
}

function removeProduct(id) {
    delete cart[id];
    updateBadge();
    renderCart();
}

/* Підсвітка кнопки «Додати в кошик» */
function flashAdded(button) {
    if (!button) return;

    var originalText = button.textContent;
    button.textContent = '✓ Додано';
    button.disabled = true;

    setTimeout(restoreButton, 1000);

    function restoreButton() {
        button.textContent = originalText;
        button.disabled = false;
    }
}

/* ---------- 6. Пошук + фільтр категорій ---------- */
function applySearch() {
    var input = getElement('searchInput');
    var grid = getElement('productsGrid');
    var notice = getElement('noResults');
    if (!input || !grid) return;

    var query = input.value.trim().toLowerCase();

    var checkedRadio = document.querySelector('input[name="filter"]:checked');
    var filterId = 'f-all';
    if (checkedRadio) {
        filterId = checkedRadio.id;
    }

    var columns = document.querySelectorAll('#productsGrid > [data-category]');
    var visible = 0;

    for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        var category = column.getAttribute('data-category');
        var productName = column.getAttribute('data-name');

        var categoryMatches = (filterId === 'f-all') || (category === 'all') || (category === filterId.slice(2));

        var nameMatches = true;
        if (query !== '') {
            nameMatches = ((productName || '').toLowerCase().indexOf(query) !== -1);
        }

        if (categoryMatches && nameMatches) {
            column.style.display = '';
            visible++;
        } else {
            column.style.display = 'none';
        }
    }

    if (notice) {
        notice.classList.toggle('d-none', visible > 0);
    }
}

/* ---------- 7. Запуск після завантаження DOM ---------- */
document.addEventListener('DOMContentLoaded', function () {
    buildCatalog();

    var badge = getElement('cartCount');
    if (badge) badge.style.display = 'none';

    // Живий пошук за назвою
    var searchInput = getElement('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            applySearch();
            var productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Фільтр категорій
    var filterRadios = document.querySelectorAll('input[name="filter"]');
    for (var i = 0; i < filterRadios.length; i++) {
        filterRadios[i].addEventListener('change', applySearch);
    }

    // Кнопки «Додати в кошик» у каталозі
    var addButtons = document.querySelectorAll('.add-to-cart');
    for (var j = 0; j < addButtons.length; j++) {
        addButtons[j].addEventListener('click', function () {
            var id = this.getAttribute('data-id');
            changeQuantity(id, 1);
            flashAdded(this);
        });
    }

    // Відкриття модалки кошика
    var cartButton = getElement('cartBtn');
    if (cartButton) {
        cartButton.addEventListener('click', function () {
            renderCart();
            bootstrap.Modal.getOrCreateInstance(getElement('cartModal')).show();
        });
    }

    // Оформлення замовлення
    var checkoutButton = getElement('checkoutBtn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            if (countItems() === 0) return;

            var total = sumCart();

            for (var id in cart) {
                delete cart[id];
            }
            updateBadge();
            renderCart();

            bootstrap.Modal.getOrCreateInstance(getElement('cartModal')).hide();
            alert('✅ Замовлення оформлено! Сума: ' + formatPrice(total) + '. Дякуємо!');
        });
    }
});