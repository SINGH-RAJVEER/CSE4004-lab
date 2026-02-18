let studentsData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadStudents();

    document.getElementById('addBtn').addEventListener('click', addStudent);
    document.getElementById('updateBtn').addEventListener('click', updateStudent);
    document.getElementById('deleteBtn').addEventListener('click', removeStudent);
});

async function loadStudents() {
    try {
        // Cache bust
        const response = await fetch('students.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        studentsData = await response.json();
        renderTable();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('studentTable').style.display = 'table';
        showStatus("Class register loaded successfully", "success");
    } catch (e) {
        showStatus("Error loading student records: " + e.message, "error");
        document.getElementById('loading').textContent = "Failed to load data.";
    }
}

function renderTable() {
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';

    studentsData.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>${student.marks}</td>
        `;

        tr.addEventListener('click', () => {
            document.getElementById('stdId').value = student.id;
            document.getElementById('stdName').value = student.name;
            document.getElementById('stdCourse').value = student.course;
            document.getElementById('stdMarks').value = student.marks;
        });

        tbody.appendChild(tr);
    });
}

function addStudent() {
    if (!validateForm()) return;

    const id = document.getElementById('stdId').value;
    const name = document.getElementById('stdName').value;
    const course = document.getElementById('stdCourse').value;
    const marks = parseInt(document.getElementById('stdMarks').value);

    if (studentsData.some(s => s.id === id)) {
        showStatus("Student ID already exists", "error");
        return;
    }

    const newStudent = { id, name, course, marks };
    studentsData.push(newStudent);

    renderTable();
    showStatus("Student added successfully (Local)", "success");
    clearForm();
}

function updateStudent() {
    const id = document.getElementById('stdId').value;
    const name = document.getElementById('stdName').value;
    const course = document.getElementById('stdCourse').value;
    const marks = document.getElementById('stdMarks').value;

    if (!id) {
        showStatus("Please verify Student ID", "error");
        return;
    }

    const index = studentsData.findIndex(s => s.id === id);
    if (index !== -1) {
        // Only update provided fields, though form forces all usually.
        // Update -> Modify marks or course per requirement, but let's do all.
        if (name) studentsData[index].name = name;
        if (course) studentsData[index].course = course;
        if (marks) studentsData[index].marks = parseInt(marks);

        renderTable();
        showStatus("Record updated successfully", "success");
        clearForm();
    } else {
        showStatus("Student ID not found in current register", "error");
    }
}

function removeStudent() {
    const id = document.getElementById('stdId').value;

    if (!id) {
        showStatus("Enter ID to remove", "error");
        return;
    }

    const initialLength = studentsData.length;
    studentsData = studentsData.filter(s => s.id !== id);

    if (studentsData.length < initialLength) {
        renderTable();
        showStatus("Student removed", "success");
        clearForm();
    } else {
        showStatus("Student ID not found", "error");
    }
}

function validateForm() {
    const id = document.getElementById('stdId').value;
    const name = document.getElementById('stdName').value;
    const marks = document.getElementById('stdMarks').value;

    if (!id || !name || !marks) {
        showStatus("Please fill required fields", "error");
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
    document.getElementById('studentForm').reset();
}
