let xmlDoc = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBooks();

    document.getElementById('addBtn').addEventListener('click', addBook);
    document.getElementById('updateBtn').addEventListener('click', updateStatus);
    document.getElementById('deleteBtn').addEventListener('click', deleteBook);
});

function loadBooks() {
    const xhr = new XMLHttpRequest();
    // Cache bust
    xhr.open("GET", "books.xml?t=" + new Date().getTime(), true);
    xhr.responseType = "document";

    xhr.onload = function () {
        if (this.status === 200) {
            xmlDoc = this.responseXML;
            if (!xmlDoc) {
                showStatus("Error parsing XML", "error");
                return;
            }
            renderTable();
            showStatus("Books loaded successfully", "success");
        } else {
            showStatus("Failed to load books.xml", "error");
        }
    };

    xhr.onerror = function () {
        showStatus("Network Error", "error");
    };

    xhr.send();
}

function renderTable() {
    const tableBody = document.querySelector('#bookTable tbody');
    tableBody.innerHTML = '';

    if (!xmlDoc) return;

    const books = xmlDoc.getElementsByTagName('book');

    for (let i = 0; i < books.length; i++) {
        const book = books[i];

        // Helper to safely get content
        const getText = (tag) => book.getElementsByTagName(tag)[0]?.textContent || '';

        const id = getText('id');
        const title = getText('title');
        const author = getText('author');
        const status = getText('availability');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${title}</td>
            <td>${author}</td>
            <td>
                <span class="${getStatusClass(status)}">${status}</span>
            </td>
        `;

        row.addEventListener('click', () => {
            document.getElementById('bookId').value = id;
            document.getElementById('bookTitle').value = title;
            document.getElementById('bookAuthor').value = author;
            document.getElementById('bookAvailability').value = status;
        });

        tableBody.appendChild(row);
    }
}

function getStatusClass(status) {
    if (status === 'Available') return 'text-success'; // assuming class exists or styled inline
    if (status === 'Checked Out') return 'text-warning';
    if (status === 'Lost') return 'text-danger';
    return '';
}

function addBook() {
    if (!validateForm(true)) return;

    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const status = document.getElementById('bookAvailability').value;

    if (findBookNode(id)) {
        showStatus("Book ID already exists!", "error");
        return;
    }

    const newBook = xmlDoc.createElement("book");

    const createNode = (tag, val) => {
        const el = xmlDoc.createElement(tag);
        el.textContent = val;
        newBook.appendChild(el);
    };

    createNode("id", id);
    createNode("title", title);
    createNode("author", author);
    createNode("availability", status);

    xmlDoc.documentElement.appendChild(newBook);

    renderTable();
    showStatus("Book added to tracking list (Local Only)", "success");
    clearForm();
}

function updateStatus() {
    const id = document.getElementById('bookId').value;
    const status = document.getElementById('bookAvailability').value; // We only update status per requirements usually, but let's allow updating all just in case, though requirement says "Update availability status".
    // "Update -> Modify salary or department" was Ex1. Ex2 says "Update availability status". Let's stick to status primarily but updating all fields if ID matches is good UX. But strictly, let's update availability.

    if (!id) {
        showStatus("Please select a book or enter ID", "error");
        return;
    }

    const bookNode = findBookNode(id);
    if (bookNode) {
        // We only update status as per literal requirement "Update availability status" but updating other info if changed is nice.
        // Let's update all for completeness but focus on status.
        bookNode.getElementsByTagName("availability")[0].textContent = status;

        // Optional: Update others too if user edited them
        bookNode.getElementsByTagName("title")[0].textContent = document.getElementById('bookTitle').value;
        bookNode.getElementsByTagName("author")[0].textContent = document.getElementById('bookAuthor').value;

        renderTable();
        showStatus("Book status updated", "success");
        clearForm();
    } else {
        showStatus("Book ID not found", "error");
    }
}

function deleteBook() {
    const id = document.getElementById('bookId').value;

    if (!id) {
        showStatus("Enter ID to delete", "error");
        return;
    }

    const bookNode = findBookNode(id);
    if (bookNode) {
        bookNode.parentNode.removeChild(bookNode);
        renderTable();
        showStatus("Book removed from inventory", "success");
        clearForm();
    } else {
        showStatus("Book ID not found", "error");
    }
}

function findBookNode(id) {
    const books = xmlDoc.getElementsByTagName("book");
    for (let i = 0; i < books.length; i++) {
        const bId = books[i].getElementsByTagName("id")[0]?.textContent;
        if (bId === id) return books[i];
    }
    return null;
}

function validateForm(isAdd = false) {
    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;

    if (!id) {
        showStatus("ID is required", "error");
        return;
    }
    if (isAdd && (!title || !author)) {
        showStatus("Title and Author are required for new books", "error");
        return;
    }
    return true;
}

function showStatus(msg, type) {
    const el = document.getElementById('statusMessage');
    el.textContent = msg;
    el.className = 'status ' + type;
    setTimeout(() => el.textContent = '', 3000);
}

function clearForm() {
    document.getElementById('bookForm').reset();
}
