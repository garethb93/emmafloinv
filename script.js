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

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('auth-overlay').classList.add('hidden');
        loadInvoices();
        loadCustomerMemory();
        generateInvoiceNumber();
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

window.downloadPDF = () => {
    const element = document.getElementById('printable-area');
    const addrArea = document.getElementById('customerAddress');
    const container = document.getElementById('addr-container');

    // FIX 1: Hide empty rows (where description is blank)
    const rows = document.querySelectorAll('#lineItems tr');
    rows.forEach(row => {
        const desc = row.querySelector('.desc-input').value.trim();
        if (desc === "") row.classList.add('pdf-hidden-row');
    });

    // FIX 2: Layout Force
    element.classList.add('force-pdf-layout');
    const pdfDiv = document.createElement('div');
    pdfDiv.className = 'pdf-text-fix';
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
        // Cleanup
        noPrint.forEach(el => el.style.display = '');
        addrArea.style.display = 'block';
        pdfDiv.remove();
        element.classList.remove('force-pdf-layout');
        rows.forEach(row => row.classList.remove('pdf-hidden-row'));
    });
};

// ... Rest of your Firebase Save/Load logic remains the same ...
window.createNew = () => { location.reload(); };
window.saveInvoice = async () => { /* Existing save logic */ alert("Saved!"); loadInvoices(); };
window.loadInvoices = async () => { /* Existing load logic */ };
function generateInvoiceNumber() {
    const d = new Date();
    currentInvoiceNum = `${d.getDate().toString().padStart(2,'0')}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getFullYear().toString().slice(-2)}-${Math.floor(Math.random()*90+10)}`;
    document.getElementById('invoiceNumberDisplay').innerText = `#${currentInvoiceNum}`;
}
window.showCustomerMemories = (val) => { /* Existing autocomplete logic */ };
document.getElementById('invoiceDate').valueAsDate = new Date();
addItem();
