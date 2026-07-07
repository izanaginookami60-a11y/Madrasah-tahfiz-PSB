// ============================================
// INFAQ MAKANAN - PUBLIC PAGE
// ============================================

// ===== FIREBASE CONFIG =====
// TUKAR dengan config anda dari Firebase Console
var firebaseConfig = {
    apiKey: "AIzaSyD-78HpBX9BYUjGEXZsyDsY7GqKZkzbv7Y",
    authDomain: "hafazan-madrasah.firebaseapp.com",
    databaseURL: "https://hafazan-madrasah-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hafazan-madrasah",
    storageBucket: "hafazan-madrasah.firebasestorage.app",
    messagingSenderId: "707178356175",
    appId: "1:707178356175:web:f93f9807c3d1645e5246ba"
};

// ⚠️ PENTING: Ganti firebaseConfig di atas dengan config dari js/data.js anda

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// WhatsApp Admin
const ADMIN_WA = "601161000542";

// State
let currentView = 'thisMonth'; // 'thisMonth' or 'nextMonth'
let infaqData = {};
let selectedSlot = null;

const SLOTS = [
    { key: 'sarapan', label: 'Sarapan', icon: '🌅', time: '7:00 pagi' },
    { key: 'tengahari', label: 'Tengah Hari', icon: '☀️', time: '12:30 tgh' },
    { key: 'minumpetang', label: 'Minum Petang', icon: '🍵', time: '4:30 ptg' },
    { key: 'malam', label: 'Malam', icon: '🌙', time: '7:30 malam' }
];

const MONTH_NAMES = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const DAY_NAMES = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];

// Init
document.addEventListener('DOMContentLoaded', function() {
    loadInfaqData();
    document.getElementById('prevMonthBtn').addEventListener('click', () => switchView('thisMonth'));
    document.getElementById('nextMonthBtn').addEventListener('click', () => switchView('nextMonth'));
    document.getElementById('infaqForm').addEventListener('submit', handleSubmit);
});

function loadInfaqData() {
    db.ref('infaq').on('value', (snapshot) => {
        infaqData = snapshot.val() || {};
        renderCalendar();
    });
}

function switchView(view) {
    currentView = view;
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('infaqCalendar');
    const today = new Date();
    today.setHours(0,0,0,0);

    let year, month;
    if (currentView === 'thisMonth') {
        year = today.getFullYear();
        month = today.getMonth();
    } else {
        const next = new Date(today.getFullYear(), today.getMonth()+1, 1);
        year = next.getFullYear();
        month = next.getMonth();
    }

    document.getElementById('currentMonthLabel').textContent = `${MONTH_NAMES[month]} ${year}`;
    document.getElementById('prevMonthBtn').classList.toggle('active', currentView === 'thisMonth');
    document.getElementById('nextMonthBtn').classList.toggle('active', currentView === 'nextMonth');

    const daysInMonth = new Date(year, month+1, 0).getDate();
    let html = '';

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateKey = formatDateKey(dateObj);
        const isPast = dateObj < today;
        const isToday = dateObj.getTime() === today.getTime();
        const dayName = DAY_NAMES[dateObj.getDay()];

        html += `<div class="infaq-day ${isPast ? 'day-past' : ''} ${isToday ? 'day-today' : ''}">`;
        html += `<div class="day-header">
            <span class="day-num">${d}</span>
            <span class="day-name">${dayName}</span>
            ${isToday ? '<span class="today-badge">HARI INI</span>' : ''}
        </div>`;
        html += `<div class="slot-grid">`;

        SLOTS.forEach(slot => {
            const slotKey = `${dateKey}_${slot.key}`;
            const record = infaqData[slotKey];
            let status = 'kosong';
            let label = 'Boleh Ditaja';
            let sponsor = '';
            
            if (isPast && !record) {
                status = 'lepas';
                label = 'Terlepas';
            } else if (record) {
                if (record.status === 'confirmed') {
                    status = 'confirmed';
                    label = 'Sudah Ditaja';
                    sponsor = record.dedah ? record.nama : 'Anonymous';
                } else {
                    status = 'pending';
                    label = 'Pending';
                    sponsor = record.dedah ? record.nama : 'Anonymous';
                }
            }

            const clickable = (status === 'kosong' && !isPast);
            html += `<div class="slot slot-${status}" ${clickable ? `onclick="openInfaqModal('${dateKey}','${slot.key}','${slot.label}',${d},${month},${year})"` : ''}>
                <div class="slot-icon">${slot.icon}</div>
                <div class="slot-label">${slot.label}</div>
                <div class="slot-status">${label}</div>
                ${sponsor ? `<div class="slot-sponsor">👤 ${sponsor}</div>` : ''}
            </div>`;
        });

        html += `</div></div>`;
    }

    container.innerHTML = html;
}

function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}

function openInfaqModal(dateKey, slotKey, slotLabel, day, month, year) {
    selectedSlot = { dateKey, slotKey, slotLabel };
    document.getElementById('slotDate').textContent = `${day} ${MONTH_NAMES[month]} ${year}`;
    document.getElementById('slotTime').textContent = slotLabel;
    document.getElementById('infaqForm').reset();
    document.getElementById('duitField').style.display = 'none';
    document.getElementById('makananField').style.display = 'none';
    document.getElementById('doaFields').style.display = 'none';
    
    // Reset nama doa container to just 1 row
    document.getElementById('namaDoaContainer').innerHTML = `
        <div class="nama-doa-row">
            <input type="text" class="nama-doa-input" placeholder="Contoh: Almarhum Ahmad bin Ali">
            <button type="button" class="btn-remove-nama" onclick="removeNamaDoa(this)" style="display:none;">✕</button>
        </div>
    `;
    
    document.getElementById('infaqModal').style.display = 'flex';
}

function closeInfaqModal() {
    document.getElementById('infaqModal').style.display = 'none';
    selectedSlot = null;
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

function toggleJenisFields() {
    const jenis = document.getElementById('infaqJenis').value;
    document.getElementById('duitField').style.display = jenis === 'Duit' ? 'block' : 'none';
    document.getElementById('makananField').style.display = jenis === 'Makanan' ? 'block' : 'none';
    document.getElementById('infaqJumlah').required = (jenis === 'Duit');
    document.getElementById('infaqMenu').required = (jenis === 'Makanan');
}

function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) return;

    const nama = document.getElementById('infaqNama').value.trim();
    const whatsapp = document.getElementById('infaqWhatsapp').value.trim();
    const jenis = document.getElementById('infaqJenis').value;
    const jumlah = document.getElementById('infaqJumlah').value;
    const menu = document.getElementById('infaqMenu').value.trim();
    const catatan = document.getElementById('infaqCatatan').value.trim();
    const dedah = document.getElementById('infaqDedah').checked;

    // ===== DOA DATA =====
    const sertakanDoa = document.getElementById('infaqSertakanDoa').checked;
    let doaData = null;
    
    if (sertakanDoa) {
        const jenisDoa = document.getElementById('infaqJenisDoa').value;
        const doaCustom = document.getElementById('infaqDoaCustom').value.trim();
        
        // Collect all names
        const namaInputs = document.querySelectorAll('.nama-doa-input');
        const namaList = [];
        namaInputs.forEach(input => {
            const val = input.value.trim();
            if (val) namaList.push(val);
        });

        if (!jenisDoa) {
            alert('❌ Sila pilih jenis doa.');
            return;
        }
        if (namaList.length === 0 && !doaCustom) {
            alert('❌ Sila masukkan sekurang-kurangnya satu nama atau doa khas.');
            return;
        }

        doaData = {
            jenisDoa: jenisDoa,
            namaList: namaList,
            doaCustom: doaCustom
        };
    }

    const slotKey = `${selectedSlot.dateKey}_${selectedSlot.slotKey}`;

    // Check dulu
    if (infaqData[slotKey]) {
        alert('❌ Maaf, slot ini baru sahaja ditaja oleh orang lain. Sila pilih slot lain.');
        closeInfaqModal();
        return;
    }

    const record = {
        nama, whatsapp, jenis,
        jumlah: jenis === 'Duit' ? jumlah : '',
        menu: jenis === 'Makanan' ? menu : '',
        catatan, dedah,
        dateKey: selectedSlot.dateKey,
        slot: selectedSlot.slotKey,
        slotLabel: selectedSlot.slotLabel,
        status: 'pending',
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        sertakanDoa: sertakanDoa,
        doaData: doaData || null
    };

    db.ref('infaq/' + slotKey).set(record).then(() => {
        closeInfaqModal();
        document.getElementById('successModal').style.display = 'flex';

        // Prepare WhatsApp message
        const [y,m,d] = selectedSlot.dateKey.split('-');
        const dateStr = `${d} ${MONTH_NAMES[parseInt(m)-1]} ${y}`;
        let msg = `Assalamualaikum, saya nak infaq:\n\n`;
        msg += `📅 Tarikh: ${dateStr}\n`;
        msg += `🕐 Waktu: ${selectedSlot.slotLabel}\n`;
        msg += `${jenis === 'Duit' ? '💰' : '🍱'} Jenis: ${jenis}\n`;
        if (jenis === 'Duit') msg += `💵 Jumlah: RM${jumlah}\n`;
        if (jenis === 'Makanan') msg += `📝 Menu: ${menu}\n`;
        msg += `👤 Nama: ${nama}\n`;
        msg += `📞 No: ${whatsapp}\n`;
        if (catatan) msg += `📌 Catatan: ${catatan}\n`;

        // ===== INCLUDE DOA IN MESSAGE =====
        if (doaData) {
            msg += `\n🤲 *NIAT DOA / TAHLIL:*\n`;
            msg += `Jenis: ${doaData.jenisDoa}\n`;
            if (doaData.namaList.length > 0) {
                msg += `Nama:\n`;
                doaData.namaList.forEach((n, i) => {
                    msg += `  ${i+1}. ${n}\n`;
                });
            }
            if (doaData.doaCustom) {
                msg += `Doa Khas: ${doaData.doaCustom}\n`;
            }
        }

        msg += `\n- Dari Sistem Infaq Madrasah PSB`;

        const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;
        setTimeout(() => {
            window.open(waUrl, '_blank');
        }, 1500);
    }).catch(err => {
        alert('❌ Ralat: ' + err.message);
    });
}

function scrollToTerms(e) {
    e.preventDefault();
    closeInfaqModal();
    document.querySelector('.infaq-terms').scrollIntoView({ behavior: 'smooth' });
}

// ===== DOA FUNCTIONS =====

function toggleDoaSection() {
    const check = document.getElementById('infaqSertakanDoa').checked;
    document.getElementById('doaFields').style.display = check ? 'block' : 'none';
}

function tambahNamaDoa() {
    const container = document.getElementById('namaDoaContainer');
    const newRow = document.createElement('div');
    newRow.className = 'nama-doa-row';
    newRow.innerHTML = `
        <input type="text" class="nama-doa-input" placeholder="Contoh: Almarhum Ahmad bin Ali">
        <button type="button" class="btn-remove-nama" onclick="removeNamaDoa(this)">✕</button>
    `;
    container.appendChild(newRow);
    
    // Show remove button for first row too
    const firstRemove = container.querySelector('.btn-remove-nama');
    if (firstRemove) firstRemove.style.display = 'flex';
}

function removeNamaDoa(btn) {
    const rows = document.querySelectorAll('.nama-doa-row');
    if (rows.length <= 1) return; // Keep at least one
    btn.parentElement.remove();
    
    // Hide remove button if only 1 row left
    const remainingRows = document.querySelectorAll('.nama-doa-row');
    if (remainingRows.length === 1) {
        const btn = remainingRows[0].querySelector('.btn-remove-nama');
        if (btn) btn.style.display = 'none';
    }
}