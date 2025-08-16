const loggedInUser = localStorage.getItem("loggedInUser");
const role = localStorage.getItem("role");

if (!loggedInUser) {
  window.location.href = "login.html";
}

let data = [];

const idInput = document.getElementById("idInput");
const typeInput = document.getElementById("typeInput");
const brandInput = document.getElementById("brandInput");
const qtyInput = document.getElementById("qtyInput");
const personInput = document.getElementById("personInput");
const addBtn = document.getElementById("addBtn");
const totalQtySpan = document.getElementById("totalQty");
const maxDateSpan = document.getElementById("maxDate");
const tbody = document.querySelector("#dataTable tbody");

// show Owner column for admin
if (role === "admin") {
  document.getElementById("ownerCol").style.display = "table-cell";
}

async function loadData() {
  const res = await fetch(`load.php?user=${loggedInUser}&role=${role}`);
  data = await res.json();
  updateTable();
}

function updateTable() {
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.record_id}</td>
      <td>${row.type}</td>
      <td>${row.brand}</td>
      <td>${row.qty}</td>
      <td>${row.date}</td>
      <td>${row.person}</td>
      ${role === "admin" ? `<td>${row.owner}</td>` : ""}
      <td><button onclick="editRecord(${row.id})">Edit</button></td>
      <td><button onclick="deleteRecord(${row.id})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  const totalQty = data.reduce((sum, r) => sum + parseInt(r.qty), 0);
  totalQtySpan.textContent = totalQty;

  let dateMap = {};
  data.forEach(r => {
    if (!dateMap[r.date]) dateMap[r.date] = 0;
    dateMap[r.date] += parseInt(r.qty);
  });
  let maxDate = Object.keys(dateMap).reduce((a, b) => dateMap[a] > dateMap[b] ? a : b, "");
  maxDateSpan.textContent = maxDate || "N/A";
}

async function saveData() {
  const record = {
    id: idInput.value.trim(),
    type: typeInput.value.trim(),
    brand: brandInput.value.trim(),
    qty: parseInt(qtyInput.value.trim()),
    date: new Date().toISOString().split("T")[0],
    person: personInput.value.trim(),
    owner: loggedInUser
  };

  await fetch("save.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });

  loadData();
  resetInputs();
}

function resetInputs() {
  idInput.value = "";
  typeInput.value = "";
  brandInput.value = "";
  qtyInput.value = "";
  personInput.value = "";
}

async function deleteRecord(id) {
  await fetch(`delete.php?id=${id}`);
  loadData();
}

function editRecord(id) {
  const record = data.find(r => r.id == id);
  if (!record) return;

  idInput.value = record.record_id;
  typeInput.value = record.type;
  brandInput.value = record.brand;
  qtyInput.value = record.qty;
  personInput.value = record.person;

  addBtn.textContent = "Save Changes";
  addBtn.onclick = async () => {
    await fetch("update.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        type: typeInput.value,
        brand: brandInput.value,
        qty: parseInt(qtyInput.value),
        person: personInput.value
      })
    });
    addBtn.textContent = "Add";
    addBtn.onclick = saveData;
    resetInputs();
    loadData();
  };
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

addBtn.addEventListener("click", saveData);

loadData();
