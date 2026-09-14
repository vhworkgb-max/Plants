/* Кошик: лічильник у шапці, модальне вікно, зміна кількості */

/* ---------- 3. Лічильник кошика в шапці ---------- */
function updateBadge() {
    const badge = getElement('cartCount');
    const status = getElement('cartStatus');
    const cartButton = getElement('cartBtn');
    if (!badge || !cartButton) return;

    const count = countItems();
    badge.textContent = count;
    badge.style.display = (count > 0) ? 'inline-block' : 'none';

    if (status) {
        status.textContent = `У кошику ${count} ${pluralForm(count)}`;
    }

    // Перезапуск анімації «підстрибування» кнопки кошика
    cartButton.classList.remove('cart-bump');
    void cartButton.offsetWidth;
    cartButton.classList.add('cart-bump');
}

/* ---------- 4. Кошик у модальному вікні ---------- */
function renderCart() {
    const body = getElement('cartBody');
    const sum = getElement('cartSum');
    if (!body || !sum) return;

    let html = '';

    for (const id in cart) {
        const product = catalog[id];
        if (!product) continue;

        const quantity = cart[id];
        const lineSum = product.price * quantity;

        html += `<div class="d-flex align-items-center justify-content-between border-bottom py-2 cart-row" data-id="${id}">`;
        html += `<div class="flex-grow-1"><div class="fw-semibold">${product.name}</div>`;
        html += `<small class="text-muted">${formatPrice(product.price)} × ${quantity} = <span class="fw-semibold">${formatPrice(lineSum)}</span></small></div>`;
        html += '<div class="btn-group ms-2">';
        html += `<button class="btn btn-outline-secondary qty-minus" type="button" aria-label="Зменшити кількість ${product.name}">−</button>`;
        html += `<span class="btn btn-light disabled" aria-label="Кількість ${quantity}">${quantity}</span>`;
        html += `<button class="btn btn-outline-secondary qty-plus" type="button" aria-label="Збільшити кількість ${product.name}">+</button>`;
        html += '</div>';
        html += `<button class="btn btn-outline-danger ms-2 qty-remove" type="button" aria-label="Видалити ${product.name} з кошика">✕</button>`;
        html += '</div>';
    }

    if (html !== '') {
        body.innerHTML = html;
        const rows = body.querySelectorAll('.cart-row');
        for (const row of rows) {
            setupRow(row);
        }
    } else {
        body.innerHTML = '<p class="text-muted text-center mb-0">Кошик порожній.</p>';
    }

    sum.textContent = formatPrice(sumCart());
}

/* Кнопки +, −, ✕ у кожному рядку кошика */
function setupRow(row) {
    const id = row.getAttribute('data-id');

    row.querySelector('.qty-plus').addEventListener('click', function () {
        changeQuantity(id, 1);
    });
    row.querySelector('.qty-minus').addEventListener('click', function () {
        changeQuantity(id, -1);
    });
    row.querySelector('.qty-remove').addEventListener('click', function () {
        delete cart[id];
        refreshCart();
    });
}

/* ---------- 5. Зміна кількості та видалення ---------- */
function changeQuantity(id, delta) {
    const next = (cart[id] || 0) + delta;
    if (next <= 0) {
        delete cart[id];
    } else {
        cart[id] = next;
    }
    refreshCart();
}

/* Оновлює кошик, лічильник і модалку після зміни кількості */
function refreshCart() {
    updateBadge();
    renderCart();
}

/* Підсвітка кнопки «Додати в кошик» */
function flashAdded(button) {
    if (!button) return;

    const originalText = button.textContent;
    button.textContent = '✓ Додано';
    button.disabled = true;

    setTimeout(function restoreButton() {
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}