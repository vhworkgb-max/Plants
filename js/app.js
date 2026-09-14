/* ---------- 7. Запуск після завантаження DOM ---------- */
document.addEventListener('DOMContentLoaded', function () {
    buildCatalog();

    const badge = getElement('cartCount');
    if (badge) badge.style.display = 'none';

    // Живий пошук за назвою
    const searchInput = getElement('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            applySearch();
            const productsSection = getElement('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Фільтр категорій
    const filterRadios = document.querySelectorAll('input[name="filter"]');
    for (const radio of filterRadios) {
        radio.addEventListener('change', applySearch);
    }

    // Кнопки «Додати в кошик» у каталозі
    const addButtons = document.querySelectorAll('.add-to-cart');
    for (const button of addButtons) {
        button.addEventListener('click', function () {
            changeQuantity(this.getAttribute('data-id'), 1);
            flashAdded(this);
        });
    }

    // Відкриття модалки кошика
    const cartButton = getElement('cartBtn');
    if (cartButton) {
        cartButton.addEventListener('click', function () {
            renderCart();
            bootstrap.Modal.getOrCreateInstance(getElement('cartModal')).show();
        });
    }

    // Оформлення замовлення
    const checkoutButton = getElement('checkoutBtn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            if (countItems() === 0) return;

            const total = sumCart();

            cart = {};
            refreshCart();

            bootstrap.Modal.getOrCreateInstance(getElement('cartModal')).hide();
            alert(`✅ Замовлення оформлено! Сума: ${formatPrice(total)}. Дякуємо!`);
        });
    }
});