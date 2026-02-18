let xmlDoc = null;

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();

    document.getElementById('createBtn').addEventListener('click', createEmployee);
    document.getElementById('updateBtn').addEventListener('click', updateEmployee);
    document.getElementById('deleteBtn').addEventListener('click', deleteEmployee);
});

function loadEmployees() {
    const xhr = new XMLHttpRequest();
    // Using a timestamp to prevent caching during dev
    xhr.open("GET", "employees.xml?t=" + new Date().getTime(), true);
    xhr.responseType = "document";

    xhr.onload = function () {
        if (this.status === 200) {
            xmlDoc = this.responseXML;
            if (!xmlDoc) {
                showStatus("Error: Could not parse XML", "error");
                return;
            }
            renderTable();
            showStatus("Employees loaded successfully.", "success");
        } else {
            showStatus("Error loading employees.xml", "error");
        }
    };

    xhr.onerror = function () {
        showStatus("Request failed", "error");
    };

    xhr.send();
}

function renderTable() {
    const tableBody = document.querySelector('#employeeTable tbody');
    tableBody.innerHTML = '';

    if (!xmlDoc) return;

    const employees = xmlDoc.getElementsByTagName('employee');

    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        const id = emp.getElementsByTagName('id')[0].textContent;
        const name = emp.getElementsByTagName('name')[0].textContent;
        const dept = emp.getElementsByTagName('department')[0].textContent;
        const salary = emp.getElementsByTagName('salary')[0].textContent;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>${dept}</td>
            <td>$${salary}</td>
        `;

        // Add click event to populate form
        row.addEventListener('click', () => {
            document.getElementById('empId').value = id;
            document.getElementById('empName').value = name;
            document.getElementById('empDept').value = dept;
            document.getElementById('empSalary').value = salary;
        });

        tableBody.appendChild(row);
    }
}

function createEmployee() {
    if (!xmlDoc) return;

    const id = document.getElementById('empId').value;
    const name = document.getElementById('empName').value;
    const dept = document.getElementById('empDept').value;
    const salary = document.getElementById('empSalary').value;

    if (!id || !name || !dept || !salary) {
        showStatus("Please fill all fields", "error");
        return;
    }

    // Check if ID exists
    if (findEmployeeNode(id)) {
        showStatus("Employee ID already exists", "error");
        return;
    }

    const newEmp = xmlDoc.createElement("employee");

    const idNode = xmlDoc.createElement("id");
    idNode.textContent = id;
    newEmp.appendChild(idNode);

    const nameNode = xmlDoc.createElement("name");
    nameNode.textContent = name;
    newEmp.appendChild(nameNode);

    const deptNode = xmlDoc.createElement("department");
    deptNode.textContent = dept;
    newEmp.appendChild(deptNode);

    const salaryNode = xmlDoc.createElement("salary");
    salaryNode.textContent = salary;
    newEmp.appendChild(salaryNode);

    xmlDoc.documentElement.appendChild(newEmp);

    renderTable();
    showStatus("Employee added successfully (Changes are local to session)", "success");
    clearForm();
}

function updateEmployee() {
    if (!xmlDoc) return;

    const id = document.getElementById('empId').value;
    const name = document.getElementById('empName').value;
    const dept = document.getElementById('empDept').value;
    const salary = document.getElementById('empSalary').value;

    if (!id) {
        showStatus("Please enter Employee ID to update", "error");
        return;
    }

    const empNode = findEmployeeNode(id);
    if (empNode) {
        empNode.getElementsByTagName("name")[0].textContent = name;
        empNode.getElementsByTagName("department")[0].textContent = dept;
        empNode.getElementsByTagName("salary")[0].textContent = salary;

        renderTable();
        showStatus("Employee updated successfully", "success");
        clearForm();
    } else {
        showStatus("Employee ID not found", "error");
    }
}

function deleteEmployee() {
    if (!xmlDoc) return;

    const id = document.getElementById('empId').value;

    if (!id) {
        showStatus("Please enter Employee ID to delete", "error");
        return;
    }

    const empNode = findEmployeeNode(id);
    if (empNode) {
        empNode.parentNode.removeChild(empNode);
        renderTable();
        showStatus("Employee deleted successfully", "success");
        clearForm();
    } else {
        showStatus("Employee ID not found", "error");
    }
}

function findEmployeeNode(id) {
    const employees = xmlDoc.getElementsByTagName("employee");
    for (let i = 0; i < employees.length; i++) {
        const empId = employees[i].getElementsByTagName("id")[0].textContent;
        if (empId === id) return employees[i];
    }
    return null;
}

function showStatus(msg, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = msg;
    statusEl.className = 'status ' + type;
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'status';
    }, 3000);
}

function clearForm() {
    document.getElementById('employeeForm').reset();
}
