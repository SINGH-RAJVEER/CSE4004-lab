let inventoryData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();

    document.getElementById('addBtn').addEventListener('click', addProduct);
    document.getElementById('editBtn').addEventListener('click', updateProduct);
    document.getElementById('deleteBtn').addEventListener('click', deleteProduct);

    document.getElementById('searchBtn').addEventListener('click', searchByCategory);
    document.getElementById('resetBtn').addEventListener('click', resetSearch);
});

async function loadInventory() {
    try {
        const response = await fetch('inventory.json?t=' + Date.now());
        if (!response.ok) throw new Error("Failed to load inventory");
        inventoryData = await response.json();
        renderTable(inventoryData);
        updateTotalValue();
        showStatus("Inventory loaded", "success");
    } catch (e) {
        showStatus("Error loading inventory: " + e.message, "error");
    }
}

function renderTable(data) {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found</td></tr>';
        return;
    }

    data.forEach(product => {
        const tr = document.createElement('tr');
        const stockVal = parseFloat(product.price) * parseInt(product.stock);

        // Conditional formatting: Low stock < 10
        if (product.stock < 10) {
            tr.className = 'low-stock';
        }

        tr.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>$${stockVal.toFixed(2)}</td>
        `;

        tr.addEventListener('click', () => {
            document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');

            document.getElementById('prodId').value = product.id;
            document.getElementById('prodName').value = product.name;
            document.getElementById('prodCategory').value = product.category;
            document.getElementById('prodPrice').value = product.price;
            document.getElementById('prodStock').value = product.stock;
        });

        tbody.appendChild(tr);
    });
}

function updateTotalValue() {
    const total = inventoryData.reduce((sum, p) => sum + (p.price * p.stock), 0);
    document.getElementById('totalValue').textContent = '$' + total.toFixed(2);
}

function addProduct() {
    if (!validateForm()) return;

    const id = document.getElementById('prodId').value;

    if (inventoryData.some(p => p.id === id)) {
        showStatus("Product ID already exists", "error");
        return;
    }

    const newProduct = {
        id: id,
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        stock: parseInt(document.getElementById('prodStock').value)
    };

    inventoryData.push(newProduct);
    refreshUI();
    showStatus("Product added", "success");
    clearForm();
}

function updateProduct() {
    const id = document.getElementById('prodId').value;
    const index = inventoryData.findIndex(p => p.id === id);

    if (index === -1) {
        showStatus("Product ID not found for update", "error");
        return;
    }

    // "Edit product price/stock" per requirements, but usually can edit name too.
    inventoryData[index].name = document.getElementById('prodName').value;
    inventoryData[index].category = document.getElementById('prodCategory').value;
    inventoryData[index].price = parseFloat(document.getElementById('prodPrice').value);
    inventoryData[index].stock = parseInt(document.getElementById('prodStock').value);

    refreshUI();
    showStatus("Product updated", "success");
    clearForm();
}

function deleteProduct() {
    const id = document.getElementById('prodId').value;
    const initialLen = inventoryData.length;

    inventoryData = inventoryData.filter(p => p.id !== id);

    if (inventoryData.length < initialLen) {
        refreshUI();
        showStatus("Product deleted", "success");
        clearForm();
    } else {
        showStatus("Product ID not found", "error");
    }
}

function searchByCategory() {
    const query = document.getElementById('categorySearch').value.toLowerCase();
    const filtered = inventoryData.filter(p => p.category.toLowerCase().includes(query));
    renderTable(filtered);
}

function resetSearch() {
    document.getElementById('categorySearch').value = '';
    renderTable(inventoryData);
}

function refreshUI() {
    renderTable(inventoryData); // Render updated full list
    updateTotalValue();
}

function validateForm() {
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value;
    const price = document.getElementById('prodPrice').value;

    if (!id || !name || !price) {
        showStatus("ID, Name and Price are required", "error");
        return false;
    }
    return true;
}

function showStatus(msg, type) {
    const el = document.getElementById('statusMessage');
    el.textContent = msg;
    el.className = 'status ' + type;
    setTimeout(() => {
        el.textContent = '';
        el.className = 'status';
    }, 3000);
}

function clearForm() {
    document.getElementById('productForm').reset();
    document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
}
