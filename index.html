import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD5mdeDHBTqMgTH7ra8JuLqrpAtjfbQrMI",
    authDomain: "emmaflo-invoice-builder.firebaseapp.com",
    projectId: "emmaflo-invoice-builder",
    storageBucket: "emmaflo-invoice-builder.firebasestorage.app",
    messagingSenderId: "681857224402",
    appId: "1:681857224402:web:97332a7db483becaee670b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentInvoiceNum = "";
let customerMemory = [];

// IMMEDIATELY generate a number so the field is never empty
function generateInvoiceNumber() {
    const d = new Date();
    currentInvoiceNum = `${d.getDate().toString().padStart(2,'0')}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getFullYear().toString().slice(-2)}-${Math.floor(Math.random()*90+10)}`;
    const display = document.getElementById('invoiceNumberDisplay');
    if (display) display.innerText = `#${currentInvoiceNum}`;
}
generateInvoiceNumber();

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('auth-overlay').classList.add('hidden');
        loadInvoices();
        loadCustomerMemory();
    } else {
        document.getElementById('auth-overlay').classList.remove('hidden');
    }
});

window.handleLogin = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Login failed."); }
};

window.addItem = (dateStart = '', dateEnd = '', desc = '', qty = 0, price = 0) => {
    const tbody = document.getElementById('lineItems');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="Start" class="col-date"><input type="date" value="${dateStart}" class="w-full bg-transparent border-none text-sm font-bold date-start-input"></td>
        <td data-label="End" class="col-date"><input type="date" value="${dateEnd}" class="w-full bg-transparent border-none text-sm font-bold date-end-input"></td>
        <td data-label="Description" class="col-desc"><input type="text" value="${desc}" class="w-full bg-transparent border-none font-semibold desc-input"></td>
        <td data-label="Hrs" class="col-small"><input type="number" value="${qty}" class="w-full text-right bg-transparent border-none qty-input font-black" oninput="calculateTotal()"></td>
        <td data-label="Rate" class="col-small"><input type="number" value="${price}" class="w-full text-right bg-transparent border-none price-input font-black" oninput="calculateTotal()"></td>
        <td data-label="Total" class="col-total text-right font-black row-total">£${(qty * price).toFixed(2)}</td>
        <td class="no-print"><button onclick="this.parentElement.parentElement.remove(); calculateTotal()"><i data-lucide="trash-2" class="w-4 h-4 text-gray-300"></i></button></td>
    `;
    tbody.appendChild(row);
    if(window.lucide) lucide.createIcons();
    calculateTotal();
};

window.calculateTotal = () => {
    let subtotal = 0;
    document.querySelectorAll('#lineItems tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const amount = qty * price;
        row.querySelector('.row-total').innerText = `£${amount.toFixed(2)}`;
        subtotal += amount;
    });
    const vat = document.getElementById('vatCheckbox').checked ? subtotal * 0.20 : 0;
    document.getElementById('vatRow').classList.toggle('hidden', vat === 0);
    document.getElementById('subtotalDisplay').innerText = `£${subtotal.toFixed(2)}`;
    document.getElementById('vatDisplay').innerText = `£${vat.toFixed(2)}`;
    document.getElementById('totalAmount').innerText = `£${(subtotal + vat).toFixed(2)}`;
};

window.saveInvoice = async () => {
    if (!currentUser) return;
    const name = document.getElementById('customerName').value.trim();
    const addr = document.getElementById('customerAddress').value.trim();

    if (name && !customerMemory.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        try { await addDoc(collection(db, "customers"), { name, addr }); loadCustomerMemory(); } catch(e) {}
    }

    const items = Array.from(document.querySelectorAll('#lineItems tr')).map(row => ({
        dateStart: row.querySelector('.date-start-input').value,
        dateEnd: row.querySelector('.date-end-input').value,
        desc: row.querySelector('.desc-input').value,
        qty: row.querySelector('.qty-input').value,
        price: row.querySelector('.price-input').value
    }));

    try {
        await addDoc(collection(db, "documents"), {
            userId: currentUser.uid,
            invoiceNumber: currentInvoiceNum,
            invoiceDate: document.getElementById('invoiceDate').value,
            customerName: name,
            customerAddress: addr,
            notes: document.getElementById('notes').value,
            vatActive: document.getElementById('vatCheckbox').checked,
            lineItems: items,
            total: document.getElementById('totalAmount').innerText,
            createdAt: serverTimestamp()
        });
        alert("Saved!");
        loadInvoices();
    } catch (e) { alert("Save error."); }
};

window.loadInvoices = async () => {
    const list = document.getElementById('saved-list');
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    list.innerHTML = '';
    snap.forEach((d) => {
        const data = d.data();
        const div = document.createElement('div');
        div.className = "p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-blue-500 transition flex justify-between items-center";
        div.innerHTML = `<div><p class="font-black text-[10px] text-blue-600">${data.invoiceNumber}</p><p class="text-xs font-bold truncate w-32">${data.customerName}</p></div>`;
        div.onclick = () => {
            currentInvoiceNum = data.invoiceNumber;
            document.getElementById('invoiceNumberDisplay').innerText = `#${currentInvoiceNum}`;
            document.getElementById('invoiceDate').value = data.invoiceDate;
            document.getElementById('customerName').value = data.customerName;
            document.getElementById('customerAddress').value = data.customerAddress;
            document.getElementById('notes').value = data.notes;
            document.getElementById('vatCheckbox').checked = data.vatActive;
            document.getElementById('lineItems').innerHTML = '';
            data.lineItems.forEach(i => addItem(i.dateStart, i.dateEnd, i.desc, i.qty, i.price));
            calculateTotal();
        };
        list.appendChild(div);
    });
};

async function loadCustomerMemory() {
    try { 
        const snap = await getDocs(collection(db, "customers")); 
        customerMemory = snap.docs.map(d => d.data()); 
    } catch(e) {}
}

window.showCustomerMemories = (val) => {
    const container = document.getElementById('customer-memories');
    if (val.length < 1) { container.classList.add('hidden'); return; }
    const matches = customerMemory.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
    if (matches.length > 0) {
        container.innerHTML = matches.map(c => `
            <div class="p-4 hover:bg-blue-50 cursor-pointer text-sm font-bold border-b border-gray-100" 
                 onclick="window.selectCustomer('${c.name.replace(/'/g, "\\'")}', '${c.addr.replace(/\n/g, "\\n").replace(/'/g, "\\'")}')">
                ${c.name}
            </div>
        `).join('');
        container.classList.remove('hidden');
    } else { container.classList.add('hidden'); }
};

window.selectCustomer = (name, addr) => {
    document.getElementById('customerName').value = name;
    document.getElementById('customerAddress').value = addr;
    document.getElementById('customer-memories').classList.add('hidden');
};

window.downloadPDF = () => {
    const element = document.getElementById('printable-area');
    const addrArea = document.getElementById('customerAddress');
    const container = document.getElementById('addr-container');
    const rows = document.querySelectorAll('#lineItems tr');

    rows.forEach(row => {
        if (row.querySelector('.desc-input').value.trim() === "") row.classList.add('pdf-hidden-row');
    });

    element.classList.add('force-pdf-layout');
    const pdfDiv = document.createElement('div');
    pdfDiv.className = 'pdf-text-fix font-bold text-gray-700';
    pdfDiv.innerText = addrArea.value;
    addrArea.style.display = 'none';
    container.appendChild(pdfDiv);

    const opt = {
        margin: 10,
        filename: `Invoice-${currentInvoiceNum}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const noPrint = document.querySelectorAll('.no-print');
    noPrint.forEach(el => el.style.display = 'none');

    html2pdf().set(opt).from(element).save().then(() => {
        noPrint.forEach(el => el.style.display = '');
        addrArea.style.display = 'block';
        pdfDiv.remove();
        element.classList.remove('force-pdf-layout');
        rows.forEach(row => row.classList.remove('pdf-hidden-row'));
    });
};

window.createNew = () => { location.reload(); };
document.getElementById('invoiceDate').valueAsDate = new Date();
addItem();
