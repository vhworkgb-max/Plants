/* ---------- 6. Пошук + фільтр категорій ---------- */
function applySearch() {
    const input = getElement('searchInput');
    const grid = getElement('productsGrid');
    const notice = getElement('noResults');
    if (!input || !grid) return;

    const query = input.value.trim().toLowerCase();

    const checkedRadio = document.querySelector('input[name="filter"]:checked');
    let filterId = 'f-all';
    if (checkedRadio) {
        filterId = checkedRadio.id;
    }

    const columns = document.querySelectorAll('#productsGrid > [data-category]');
    let visible = 0;

    for (const column of columns) {
        const category = column.getAttribute('data-category');
        const productName = column.getAttribute('data-name');

        // Картки «all» показуються за будь-якої категорії — так було і до рефакторингу
        const categoryMatches = (filterId === 'f-all') || (category === 'all') || (category === filterId.slice(2));

        let nameMatches = true;
        if (query !== '') {
            nameMatches = (productName || '').toLowerCase().includes(query);
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