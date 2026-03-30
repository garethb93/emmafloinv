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

window.createNew = () => {
    if(!confirm("Start a new invoice?")) return;
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('lineItems').innerHTML = '';
    document.getElementById('vatCheckbox').checked = false;
    document.getElementById('invoiceDate').valueAsDate = new Date();
    generateInvoiceNumber();
    addItem();
    calculateTotal();
};

window.addItem = (dateStart = '', dateEnd = '', desc = '', qty = 0, price = 0) => {
    const tbody = document.getElementById('lineItems');
    const row = document.createElement('tr');
    row.className = "border-b border-gray-100 hover:bg-gray-50 transition";
    row.innerHTML = `
        <td class="py-3 pr-1"><input type="date" value="${dateStart}" class="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-600 date-start-input"></td>
        <td class="py-3 pr-1"><input type="date" value="${dateEnd}" class="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-600 date-end-input"></td>
        <td class="py-3"><input type="text" value="${desc}" placeholder="Description" class="w-full bg-transparent border-none focus:ring-0 font-medium truncate desc-input"></td>
        <td class="py-3"><input type="number" value="${qty}" class="w-full text-right bg-transparent border-none focus:ring-0 qty-input font-bold" oninput="calculateTotal()"></td>
        <td class="py-3"><input type="number" value="${price}" class="w-full text-right bg-transparent border-none focus:ring-0 price-input font-bold" oninput="calculateTotal()"></td>
        <td class="py-3 text-right font-black text-gray-900 row-total">£${(qty * price).toFixed(2)}</td>
        <td class="py-3 text-right no-print">
            <button onclick="this.parentElement.parentElement.remove(); calculateTotal()" class="text-gray-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </td>
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
        const rowAmount = qty * price;
        row.querySelector('.row-total').innerText = `£${rowAmount.toFixed(2)}`;
        subtotal += rowAmount;
    });
    
    const isVat = document.getElementById('vatCheckbox').checked;
    const vat = isVat ? subtotal * 0.20 : 0;
    const total = subtotal + vat;

    document.getElementById('vatRow').classList.toggle('hidden', !isVat);
    
    document.getElementById('subtotalDisplay').innerText = `£${subtotal.toFixed(2)}`;
    document.getElementById('vatDisplay').innerText = `£${vat.toFixed(2)}`;
    document.getElementById('totalAmount').innerText = `£${total.toFixed(2)}`;
};

window.downloadPDF = () => {
    const element = document.getElementById('printable-area');
    const addrArea = document.getElementById('customerAddress');
    const container = document.getElementById('addr-container');

    const pdfDiv = document.createElement('div');
    pdfDiv.className = 'pdf-text-fix font-medium text-gray-700 leading-relaxed';
    pdfDiv.innerText = addrArea.value;
    
    addrArea.style.display = 'none';
    container.appendChild(pdfDiv);

    const opt = {
        margin:       10,
        filename:     `Invoice-${currentInvoiceNum}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const noPrintElements = document.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');

    html2pdf().set(opt).from(element).save().then(() => {
        noPrintElements.forEach(el => el.style.display = '');
        addrArea.style.display = 'block';
        pdfDiv.remove();
    });
};

window.saveInvoice = async () => {
    if (!currentUser) return;
    await saveToCustomerMemory();
    const items = [];
    document.querySelectorAll('#lineItems tr').forEach(row => {
        items.push({
            dateStart: row.querySelector('.date-start-input').value,
            dateEnd: row.querySelector('.date-end-input').value,
            desc: row.querySelector('.desc-input').value,
            qty: row.querySelector('.qty-input').value,
            price: row.querySelector('.price-input').value
        });
    });
    const docData = {
        userId: currentUser.uid,
        invoiceNumber: currentInvoiceNum,
        invoiceDate: document.getElementById('invoiceDate').value,
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        notes: document.getElementById('notes').value,
        vatActive: document.getElementById('vatCheckbox').checked,
        lineItems: items,
        total: document.getElementById('totalAmount').innerText,
        createdAt: serverTimestamp()
    };
    try {
        await addDoc(collection(db, "documents"), docData);
        alert("Invoice Saved!");
        loadInvoices();
    } catch (e) { alert("Error saving."); }
};

window.loadInvoices = async () => {
    const list = document.getElementById('saved-list');
    try {
        const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        snap.forEach((d) => {
            const data = d.data();
            const div = document.createElement('div');
            div.className = "p-3 bg-white border rounded cursor-pointer hover:border-blue-500 mb-2 group flex justify-between items-center";
            div.innerHTML = `<div class="flex-grow"><p class="font-bold text-xs">${data.invoiceNumber || 'NEW'}</p><p class="text-[10px] text-gray-500 truncate w-32">${data.customerName}</p></div><button onclick="event.stopPropagation(); window.deleteInvoice('${d.id}')" class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><i data-lucide="trash-2" class="w-3 h-3"></i></button>`;
            div.onclick = () => openInvoice(data);
            list.appendChild(div);
        });
        if(window.lucide) lucide.createIcons();
    } catch (e) {}
};

window.openInvoice = (data) => {
    currentInvoiceNum = data.invoiceNumber;
    document.getElementById('invoiceNumberDisplay').innerText = `#${currentInvoiceNum}`;
    document.getElementById('invoiceDate').value = data.invoiceDate;
    document.getElementById('customerName').value = data.customerName;
    document.getElementById('customerAddress').value = data.customerAddress;
    document.getElementById('notes').value = data.notes;
    document.getElementById('vatCheckbox').checked = data.vatActive || false;
    document.getElementById('lineItems').innerHTML = '';
    data.lineItems.forEach(i => addItem(i.dateStart, i.dateEnd, i.desc, i.qty, i.price));
    calculateTotal();
};

window.deleteInvoice = async (id) => {
    if(confirm("Delete this?")) { await deleteDoc(doc(db, "documents", id)); loadInvoices(); }
};

function generateInvoiceNumber() {
    const d = new Date();
    currentInvoiceNum = `${d.getDate().toString().padStart(2,'0')}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getFullYear().toString().slice(-2)}-${Math.floor(Math.random()*90+10)}`;
    document.getElementById('invoiceNumberDisplay').innerText = `#${currentInvoiceNum}`;
}

async function loadCustomerMemory() {
    try { const snap = await getDocs(collection(db, "customers")); customerMemory = snap.docs.map(d => d.data()); } catch(e) {}
}

async function saveToCustomerMemory() {
    const name = document.getElementById('customerName').value;
    const addr = document.getElementById('customerAddress').value;
    if (name.length < 2 || customerMemory.some(c => c.name === name)) return;
    try { await addDoc(collection(db, "customers"), { name, addr }); loadCustomerMemory(); } catch(e) {}
}

window.showCustomerMemories = (val) => {
    const container = document.getElementById('customer-memories');
    if (val.length < 2) { container.classList.add('hidden'); return; }
    const matches = customerMemory.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
    if (matches.length > 0) {
        container.innerHTML = matches.map(c => `<div class="p-3 hover:bg-gray-100 cursor-pointer text-xs font-bold border-b last:border-0" onclick="autoFill('${c.name.replace(/'/g, "\\'")}', '${c.addr.replace(/\n/g, "\\n").replace(/'/g, "\\'")}')">${c.name}</div>`).join('');
        container.classList.remove('hidden');
    } else { container.classList.add('hidden'); }
};

window.autoFill = (name, addr) => {
    document.getElementById('customerName').value = name;
    document.getElementById('customerAddress').value = addr;
    document.getElementById('customer-memories').classList.add('hidden');
};

document.getElementById('invoiceDate').valueAsDate = new Date();
addItem();