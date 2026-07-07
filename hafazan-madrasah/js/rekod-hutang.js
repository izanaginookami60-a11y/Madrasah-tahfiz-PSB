// ============================================
// ===== REKOD HUTANG MODULE ==================
// ============================================

function initHutangSystem() {
    appData = loadData();
    if (!appData.hutangList) appData.hutangList = [];
    renderHutangDashboard();
}

// ===== RENDER DASHBOARD =====
function renderHutangDashboard() {
    var container = document.getElementById('hutangContent');
    if (!container) return;
    
    appData = loadData();
    if (!appData.hutangList) appData.hutangList = [];
    
    var hutangList = appData.hutangList;
    
    // Calculate totals
    var totalHutang = 0;
    var totalBayar = 0;
    var totalBaki = 0;
    var aktifCount = 0;
    var selesaiCount = 0;
    
    for (var i = 0; i < hutangList.length; i++) {
        var h = hutangList[i];
        totalHutang += h.totalDenganProfit || 0;
        
        var bayar = 0;
        if (h.bayaranLog) {
            for (var j = 0; j < h.bayaranLog.length; j++) {
                bayar += h.bayaranLog[j].amount || 0;
            }
        }
        totalBayar += bayar;
        
        var baki = (h.totalDenganProfit || 0) - bayar;
        totalBaki += baki;
        
        if (baki <= 0) selesaiCount++;
        else aktifCount++;
    }
    
    var html = '';
    
    // Header
    html += '<div style="background:linear-gradient(135deg,#dc2626,#991b1b);color:white;padding:25px;border-radius:16px;margin-bottom:20px;">';
    html += '<h1 style="margin:0;font-size:1.8rem;">💰 Rekod Hutang</h1>';
    html += '<p style="margin:5px 0 0;opacity:0.9;">Pengurusan hutang madrasah & peribadi</p>';
    html += '</div>';
    
    // Stats
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">';
    
    html += '<div style="background:white;border-left:4px solid #dc2626;border-radius:10px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">';
    html += '<div style="font-size:0.85rem;color:#64748b;">💰 Jumlah Hutang</div>';
    html += '<div style="font-size:1.5rem;font-weight:800;color:#dc2626;">RM ' + totalHutang.toFixed(2) + '</div>';
    html += '</div>';
    
    html += '<div style="background:white;border-left:4px solid #a78bfa;border-radius:10px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">';
    html += '<div style="font-size:0.85rem;color:#64748b;">✅ Sudah Bayar</div>';
    html += '<div style="font-size:1.5rem;font-weight:800;color:#a78bfa;">RM ' + totalBayar.toFixed(2) + '</div>';
    html += '</div>';
    
    html += '<div style="background:white;border-left:4px solid #f59e0b;border-radius:10px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">';
    html += '<div style="font-size:0.85rem;color:#64748b;">⚠️ Baki Tertunggak</div>';
    html += '<div style="font-size:1.5rem;font-weight:800;color:#f59e0b;">RM ' + totalBaki.toFixed(2) + '</div>';
    html += '</div>';
    
    html += '<div style="background:white;border-left:4px solid #3b82f6;border-radius:10px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">';
    html += '<div style="font-size:0.85rem;color:#64748b;">📊 Aktif / Selesai</div>';
    html += '<div style="font-size:1.5rem;font-weight:800;color:#3b82f6;">' + aktifCount + ' / ' + selesaiCount + '</div>';
    html += '</div>';
    
    html += '</div>';

    html += renderQuickPaymentCard(hutangList);
    
    // Add Button
    html += '<div style="margin-bottom:20px;">';
    html += '<button onclick="showTambahHutang()" style="padding:12px 24px;background:linear-gradient(135deg,#dc2626,#991b1b);color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.95rem;">➕ Tambah Hutang Baru</button>';
    html += '</div>';
    
    // Hutang List
    if (hutangList.length === 0) {
        html += '<div style="background:white;border-radius:12px;padding:40px;text-align:center;color:#94a3b8;box-shadow:0 2px 10px rgba(0,0,0,0.05);">';
        html += '<div style="font-size:4rem;margin-bottom:15px;">📭</div>';
        html += '<p style="font-weight:700;">Tiada rekod hutang</p>';
        html += '<small>Klik "Tambah Hutang Baru" untuk mula</small>';
        html += '</div>';
    } else {
        for (var i = 0; i < hutangList.length; i++) {
            html += renderHutangCard(hutangList[i], i);
        }
    }
    
    container.innerHTML = html;
}

// ===== RENDER HUTANG CARD =====
function renderHutangCard(h, index) {
    var totalBayar = 0;
    if (h.bayaranLog) {
        for (var j = 0; j < h.bayaranLog.length; j++) {
            totalBayar += h.bayaranLog[j].amount || 0;
        }
    }
    
    var baki = (h.totalDenganProfit || 0) - totalBayar;
    var percent = h.totalDenganProfit > 0 ? Math.round((totalBayar / h.totalDenganProfit) * 100) : 0;
    var isSelesai = baki <= 0;
    
    var borderColor = isSelesai ? '#a78bfa' : '#dc2626';
    var statusBadge = isSelesai ? 
        '<span style="background:#e9d5ff;color:#5b21b6;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">✅ SELESAI</span>' :
        '<span style="background:#fee2e2;color:#991b1b;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">⚠️ AKTIF</span>';
    
    var typeBadge = h.jenis === 'peribadi' ?
        '<span style="background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">👤 Peribadi</span>' :
        '<span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">🕌 Madrasah</span>';
    
    var bayaranBulanan = h.bayaranBulanan || 0;
    var bulanBayar = h.bayaranLog ? h.bayaranLog.length : 0;
    var totalBulan = h.bilanganBulan || 1;
    
    var html = '';
    html += '<div style="background:white;border-left:5px solid ' + borderColor + ';border-radius:12px;padding:20px;margin-bottom:15px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">';
    
    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:15px;">';
    html += '<div>';
    html += '<h3 style="margin:0;font-size:1.1rem;color:#1f2937;">' + h.nama + '</h3>';
    html += '<div style="display:flex;gap:8px;margin-top:5px;">' + typeBadge + statusBadge + '</div>';
    html += '</div>';
    html += '<div style="text-align:right;">';
    html += '<div style="font-size:1.3rem;font-weight:900;color:#dc2626;">RM ' + (h.totalDenganProfit || 0).toFixed(2) + '</div>';
    html += '<div style="font-size:0.78rem;color:#64748b;">Jumlah + Profit</div>';
    html += '</div>';
    html += '</div>';
    
    // Info Grid
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:15px;">';
    
    html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
    html += '<div style="font-size:0.72rem;color:#64748b;">💰 Harga Asal</div>';
    html += '<div style="font-weight:700;">RM ' + (h.jumlahAsal || 0).toFixed(2) + '</div>';
    html += '</div>';
    
        html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
    html += '<div style="font-size:0.72rem;color:#64748b;">📊 Profit (' + (h.profitRate || 0) + '%)</div>';
    html += '<div style="font-weight:700;color:#f59e0b;">RM ' + (h.profitBersih || (h.totalDenganProfit || 0) - (h.jumlahAsal || 0)).toFixed(2) + '</div>';
        if (h.diskaunAmount > 0) {
        var diskaunLabel = '';
        if (h.diskaunJenis === 'peratus') {
            diskaunLabel = '🏷️ Diskaun: ' + h.diskaunValue + '% (RM ' + h.diskaunAmount.toFixed(2) + ')';
        } else {
            diskaunLabel = '🏷️ Diskaun: RM ' + h.diskaunAmount.toFixed(2);
        }
        html += '<div style="font-size:0.68rem;color:#a78bfa;">' + diskaunLabel + '</div>';
    }
    html += '</div>';
    
    html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
    html += '<div style="font-size:0.72rem;color:#64748b;">📅 Bayaran Bulanan</div>';
    html += '<div style="font-weight:700;color:#3b82f6;">RM ' + bayaranBulanan.toFixed(2) + '</div>';
    html += '</div>';
    
    html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
    html += '<div style="font-size:0.72rem;color:#64748b;">📆 Tempoh</div>';
    html += '<div style="font-weight:700;">' + bulanBayar + ' / ' + totalBulan + ' bulan</div>';
    html += '</div>';

        // Deadline info
    var deadlineDay = h.deadline || 10;
    var now = new Date();
    var thisMonth = now.getMonth();
    var thisYear = now.getFullYear();
    var deadlineDate = new Date(thisYear, thisMonth, deadlineDay);
    var daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    // Check kalau dah lepas deadline bulan ni
    if (daysLeft < 0) {
        // Deadline dah lepas bulan ni, tunjuk bulan depan
        deadlineDate = new Date(thisYear, thisMonth + 1, deadlineDay);
        daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    }
    
    // Check kalau bulan ni dah bayar
    var currentMonthKey = thisYear + '-' + String(thisMonth + 1).padStart(2, '0');
    var bulanNiBayar = false;
    if (h.bayaranLog) {
        for (var k = 0; k < h.bayaranLog.length; k++) {
            if (h.bayaranLog[k].bulan === currentMonthKey) {
                bulanNiBayar = true;
                break;
            }
        }
    }
    
    var deadlineBg = '#f8fafc';
    var deadlineColor = '#64748b';
    var deadlineIcon = '📅';
    var deadlineText = 'Sebelum ' + deadlineDay + 'hb';
    
    if (!isSelesai && !bulanNiBayar) {
        if (daysLeft <= 0) {
            deadlineBg = '#fee2e2';
            deadlineColor = '#dc2626';
            deadlineIcon = '🔴';
            deadlineText = 'OVERDUE!';
        } else if (daysLeft <= 3) {
            deadlineBg = '#fef3c7';
            deadlineColor = '#92400e';
            deadlineIcon = '⚠️';
            deadlineText = daysLeft + ' hari lagi!';
        } else if (daysLeft <= 7) {
            deadlineBg = '#fef3c7';
            deadlineColor = '#78350f';
            deadlineIcon = '⏰';
            deadlineText = daysLeft + ' hari lagi';
        } else {
            deadlineText = daysLeft + ' hari lagi';
        }
    } else if (bulanNiBayar) {
        deadlineBg = '#e9d5ff';
        deadlineColor = '#5b21b6';
        deadlineIcon = '✅';
        deadlineText = 'Bulan ini OK';
    }
    
    html += '<div style="background:' + deadlineBg + ';padding:10px;border-radius:8px;">';
    html += '<div style="font-size:0.72rem;color:#64748b;">' + deadlineIcon + ' Deadline</div>';
    html += '<div style="font-weight:700;color:' + deadlineColor + ';">' + deadlineDay + 'hb</div>';
    html += '<div style="font-size:0.68rem;color:' + deadlineColor + ';">' + deadlineText + '</div>';
    html += '</div>';
    
    html += '</div>';
    
    // Progress Bar
    html += '<div style="margin-bottom:15px;">';
    html += '<div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:5px;">';
    html += '<span style="color:#a78bfa;font-weight:700;">Bayar: RM ' + totalBayar.toFixed(2) + '</span>';
    html += '<span style="color:#dc2626;font-weight:700;">Baki: RM ' + Math.max(0, baki).toFixed(2) + '</span>';
    html += '</div>';
    html += '<div style="background:#e2e8f0;border-radius:10px;height:12px;overflow:hidden;">';
    html += '<div style="background:linear-gradient(90deg,#a78bfa,#7c3aed);height:100%;width:' + Math.min(100, percent) + '%;border-radius:10px;transition:width 0.5s;"></div>';
    html += '</div>';
    html += '<div style="text-align:center;font-size:0.78rem;color:#64748b;margin-top:3px;">' + percent + '% Selesai</div>';
    html += '</div>';
    
    // Actions
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    if (!isSelesai) {
        html += '<button onclick="showBayarHutang(' + index + ')" style="padding:8px 16px;background:#a78bfa;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.85rem;">💵 Bayar</button>';
    }
    html += '<button onclick="showJadualHutang(' + index + ')" style="padding:8px 16px;background:#3b82f6;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.85rem;">📅 Jadual</button>';
    html += '<button onclick="deleteHutang(' + index + ')" style="padding:8px 16px;background:#ef4444;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.85rem;">🗑</button>';
    html += '</div>';
    
    html += '</div>';
    
    return html;
}

// ===== TAMBAH HUTANG FORM =====
function showTambahHutang() {
    var container = document.getElementById('hutangContent');
    if (!container) return;
    
    var html = '';
    
    html += '<div style="background:white;border-radius:12px;padding:25px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
    html += '<h2 style="margin:0;color:#dc2626;">➕ Tambah Hutang Baru</h2>';
    html += '<button onclick="renderHutangDashboard()" style="background:#64748b;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700;">✕ Batal</button>';
    html += '</div>';
    
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Nama Hutang *</label>';
    html += '<input type="text" id="hutangNama" placeholder="cth: SFinancing-i Kereta" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '</div>';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Jenis *</label>';
    html += '<select id="hutangJenis" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '<option value="madrasah">🕌 Hutang Madrasah</option>';
    html += '<option value="peribadi">👤 Hutang Peribadi</option>';
    html += '</select>';
    html += '</div>';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Kategori</label>';
    html += '<select id="hutangKategori" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '<option value="SFinancing-i">🏦 SFinancing-i</option>';
    html += '<option value="Shopee">🛒 Shopee PayLater</option>';
    html += '<option value="Lazada">📦 Lazada PayLater</option>';
    html += '<option value="Kenderaan">🚗 Kenderaan</option>';
    html += '<option value="Peralatan">🔧 Peralatan</option>';
    html += '<option value="Pinjaman">💵 Pinjaman Peribadi</option>';
    html += '<option value="Lain-lain">📋 Lain-lain</option>';
    html += '</select>';
    html += '</div>';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Tarikh Mula *</label>';
    html += '<input type="month" id="hutangTarikhMula" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '</div>';

        html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">📅 Deadline Bayaran (Setiap Bulan)</label>';
    html += '<select id="hutangDeadline" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '<option value="1">1hb setiap bulan</option>';
    html += '<option value="5">5hb setiap bulan</option>';
    html += '<option value="7">7hb setiap bulan</option>';
    html += '<option value="10" selected>10hb setiap bulan</option>';
    html += '<option value="14">14hb setiap bulan</option>';
    html += '<option value="15">15hb setiap bulan</option>';
    html += '<option value="20">20hb setiap bulan</option>';
    html += '<option value="25">25hb setiap bulan</option>';
    html += '<option value="28">28hb setiap bulan</option>';
    html += '<option value="30">30hb setiap bulan (akhir bulan)</option>';
    html += '</select>';
    html += '</div>';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Jumlah Asal (RM) *</label>';
    html += '<input type="number" id="hutangJumlah" min="0" step="0.01" placeholder="0.00" oninput="calculateHutangPreview()" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '</div>';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Profit Rate (% per bulan)</label>';
    html += '<input type="number" id="hutangProfit" min="0" max="100" step="0.01" value="0" oninput="calculateHutangPreview()" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '</div>';

        html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">🏷️ Jenis Diskaun</label>';
    html += '<div style="display:flex;gap:8px;">';
    html += '<select id="hutangDiskaunJenis" onchange="calculateHutangPreview()" style="width:120px;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '<option value="tiada">Tiada</option>';
    html += '<option value="peratus">% Peratus</option>';
    html += '<option value="tetap">RM Tetap</option>';
    html += '</select>';
    html += '<input type="number" id="hutangDiskaun" min="0" step="0.01" value="0" oninput="calculateHutangPreview()" placeholder="0" style="flex:1;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '</div>';
    html += '<small id="diskaunHint" style="color:#64748b;display:block;margin-top:3px;">💡 Pilih jenis diskaun dahulu</small>';
    html += '</div>';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Bilangan Bulan *</label>';
    html += '<input type="number" id="hutangBilanganBulan" min="1" max="360" value="12" oninput="calculateHutangPreview()" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '</div>';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:700;font-size:0.88rem;">Catatan</label>';
    html += '<input type="text" id="hutangCatatan" placeholder="Sebarang catatan..." style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
    html += '</div>';
    
    html += '</div>';
    
    // Preview Box
        html += '<div id="hutangPreview" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:12px;padding:20px;margin-top:20px;">';
    html += '<h3 style="margin:0 0 10px;color:#92400e;">📊 Pengiraan</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">';
    html += '<div><strong>Profit Asal:</strong> <span id="previewProfit" style="color:#f59e0b;">RM 0.00</span></div>';
    html += '<div><strong>🏷️ Diskaun:</strong> <span id="previewDiskaun" style="color:#a78bfa;">- RM 0.00</span></div>';
    html += '<div><strong>Profit Bersih:</strong> <span id="previewProfitBersih" style="color:#dc2626;">RM 0.00</span></div>';
    html += '<div style="background:rgba(255,255,255,0.5);padding:10px;border-radius:8px;"><strong>💰 Total Bayar:</strong> <span id="previewTotal" style="font-size:1.2rem;font-weight:900;color:#991b1b;">RM 0.00</span></div>';
    html += '<div style="background:rgba(255,255,255,0.5);padding:10px;border-radius:8px;"><strong>📅 Bulanan:</strong> <span id="previewBulanan" style="font-size:1.2rem;font-weight:900;color:#dc2626;">RM 0.00</span></div>';
    html += '</div>';
    html += '</div>';
    
    html += '<button onclick="simpanHutang()" style="margin-top:20px;padding:14px 30px;background:linear-gradient(135deg,#dc2626,#991b1b);color:white;border:none;border-radius:10px;font-weight:800;cursor:pointer;font-size:1rem;width:100%;">💾 Simpan Hutang</button>';
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Set default tarikh
    var now = new Date();
    var monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('hutangTarikhMula').value = monthStr;
    
    calculateHutangPreview();
}

// ===== CALCULATE PREVIEW =====
function calculateHutangPreview() {
    var jumlah = parseFloat(document.getElementById('hutangJumlah').value) || 0;
    var profit = parseFloat(document.getElementById('hutangProfit').value) || 0;
    var bulan = parseInt(document.getElementById('hutangBilanganBulan').value) || 1;
    var diskaunJenis = document.getElementById('hutangDiskaunJenis').value;
    var diskaunValue = parseFloat(document.getElementById('hutangDiskaun').value) || 0;
    
    // Kira profit asal
    var totalProfit = jumlah * (profit / 100) * bulan;
    
    // Kira diskaun
    var diskaunAmount = 0;
    if (diskaunJenis === 'peratus') {
        diskaunAmount = totalProfit * (diskaunValue / 100);
    } else if (diskaunJenis === 'tetap') {
        diskaunAmount = diskaunValue;
    }
    
    var profitSelepasDiskaun = Math.max(0, totalProfit - diskaunAmount);
    var totalDenganProfit = jumlah + profitSelepasDiskaun;
    var bayaranBulanan = bulan > 0 ? totalDenganProfit / bulan : 0;
    
    // Update preview
    var el = function(id) { return document.getElementById(id); };
    if (el('previewTotal')) el('previewTotal').textContent = 'RM ' + totalDenganProfit.toFixed(2);
    if (el('previewProfit')) el('previewProfit').textContent = 'RM ' + totalProfit.toFixed(2);
    
    // Update diskaun display
    if (el('previewDiskaun')) {
        if (diskaunJenis === 'peratus') {
            el('previewDiskaun').textContent = '- RM ' + diskaunAmount.toFixed(2) + ' (' + diskaunValue + '%)';
        } else if (diskaunJenis === 'tetap') {
            el('previewDiskaun').textContent = '- RM ' + diskaunAmount.toFixed(2);
        } else {
            el('previewDiskaun').textContent = 'Tiada';
        }
    }
    
    if (el('previewProfitBersih')) el('previewProfitBersih').textContent = 'RM ' + profitSelepasDiskaun.toFixed(2);
    if (el('previewBulanan')) el('previewBulanan').textContent = 'RM ' + bayaranBulanan.toFixed(2);
    
    // Update hint
    if (el('diskaunHint')) {
        if (diskaunJenis === 'peratus') {
            el('diskaunHint').textContent = '💡 ' + diskaunValue + '% dari profit RM ' + totalProfit.toFixed(2) + ' = Diskaun RM ' + diskaunAmount.toFixed(2);
        } else if (diskaunJenis === 'tetap') {
            el('diskaunHint').textContent = '💡 Tolak terus RM ' + diskaunAmount.toFixed(2) + ' dari profit';
        } else {
            el('diskaunHint').textContent = '💡 Pilih jenis diskaun dahulu';
        }
    }
}

// ===== SIMPAN HUTANG =====
function simpanHutang() {
    var nama = document.getElementById('hutangNama').value.trim();
    var jenis = document.getElementById('hutangJenis').value;
    var kategori = document.getElementById('hutangKategori').value;
    var tarikhMula = document.getElementById('hutangTarikhMula').value;
    var jumlah = parseFloat(document.getElementById('hutangJumlah').value) || 0;
    var profit = parseFloat(document.getElementById('hutangProfit').value) || 0;
    var bulan = parseInt(document.getElementById('hutangBilanganBulan').value) || 1;
    var catatan = document.getElementById('hutangCatatan').value.trim();
    
    if (!nama || !tarikhMula || jumlah <= 0) {
        if (typeof showToast === 'function') showToast('❌ Sila isi nama, tarikh & jumlah');
        else alert('❌ Sila isi nama, tarikh & jumlah');
        return;
    }
    
    var diskaunJenis = document.getElementById('hutangDiskaunJenis').value;
    var diskaunValue = parseFloat(document.getElementById('hutangDiskaun').value) || 0;
    
    var totalProfit = jumlah * (profit / 100) * bulan;
    
    var diskaunAmount = 0;
    if (diskaunJenis === 'peratus') {
        diskaunAmount = totalProfit * (diskaunValue / 100);
    } else if (diskaunJenis === 'tetap') {
        diskaunAmount = diskaunValue;
    }
    
    var profitSelepasDiskaun = Math.max(0, totalProfit - diskaunAmount);
    var totalDenganProfit = jumlah + profitSelepasDiskaun;
    var bayaranBulanan = bulan > 0 ? totalDenganProfit / bulan : 0;
    
    appData = loadData();
    if (!appData.hutangList) appData.hutangList = [];
    
    var deadline = parseInt(document.getElementById('hutangDeadline').value) || 10;
    
    appData.hutangList.push({
        id: 'HTG' + Date.now(),
        nama: nama,
        jenis: jenis,
        kategori: kategori,
        tarikhMula: tarikhMula,
        deadline: deadline,
        jumlahAsal: jumlah,
        profitRate: profit,
        diskaunJenis: diskaunJenis,
        diskaunValue: diskaunValue,
        diskaunAmount: diskaunAmount,
        profitAsal: totalProfit,
        profitBersih: profitSelepasDiskaun,
        bilanganBulan: bulan,
        totalDenganProfit: totalDenganProfit,
        bayaranBulanan: Math.round(bayaranBulanan * 100) / 100,
        catatan: catatan,
        bayaranLog: [],
        createdAt: new Date().toISOString()
    });
    
    saveData(appData);
    
    if (typeof showToast === 'function') showToast('✅ Hutang berjaya ditambah!');
    renderHutangDashboard();
}

// ===== BAYAR HUTANG =====
function showBayarHutang(index) {
    appData = loadData();
    var h = appData.hutangList[index];
    if (!h) return;
    
    var amount = prompt('Masukkan jumlah bayaran (RM):\n\nBayaran bulanan: RM ' + h.bayaranBulanan.toFixed(2));
    if (!amount) return;
    
    var bayarAmount = parseFloat(amount);
    if (isNaN(bayarAmount) || bayarAmount <= 0) {
        alert('❌ Jumlah tidak sah');
        return;
    }
    
    var bulan = prompt('Bulan bayaran (format: 2025-01):');
    if (!bulan) bulan = new Date().toISOString().substring(0, 7);
    
    if (!h.bayaranLog) h.bayaranLog = [];
    
    h.bayaranLog.push({
        date: new Date().toISOString().split('T')[0],
        bulan: bulan,
        amount: bayarAmount,
        catatan: ''
    });
    
    saveData(appData);
    if (typeof showToast === 'function') showToast('✅ Bayaran RM ' + bayarAmount.toFixed(2) + ' direkodkan!');
    renderHutangDashboard();
}

// ===== SHOW JADUAL =====
// ===== SHOW JADUAL =====
// ===== SHOW JADUAL =====
function showJadualHutang(index) {
    appData = loadData();
    var h = appData.hutangList[index];
    if (!h) return;
    
    var container = document.getElementById('hutangContent');
    if (!container) return;
    
    var monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    
    var html = '';
    
    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
    html += '<h2 style="margin:0;color:#1f2937;">📅 Jadual Bayaran: ' + h.nama + '</h2>';
    html += '<button onclick="renderHutangDashboard()" style="background:#64748b;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700;">← Kembali</button>';
    html += '</div>';
    
    // Info
    html += '<div style="background:#faf5ff;padding:15px;border-radius:10px;margin-bottom:20px;border-left:4px solid #a78bfa;">';
    html += '<strong>Jumlah Asal:</strong> RM ' + h.jumlahAsal.toFixed(2) + ' | ';
    html += '<strong>Profit:</strong> ' + h.profitRate + '% | ';
    html += '<strong>Total:</strong> RM ' + h.totalDenganProfit.toFixed(2) + ' | ';
    html += '<strong>Bulanan:</strong> RM ' + h.bayaranBulanan.toFixed(2) + ' | ';
    html += '<strong>📅 Deadline:</strong> Setiap ' + (h.deadline || 10) + 'hb';
    html += '</div>';
    
    // Table
    html += '<div style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);overflow-x:auto;">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;">';
    html += '<thead><tr style="background:linear-gradient(135deg,#dc2626,#991b1b);color:white;">';
    html += '<th style="padding:10px;">No</th>';
    html += '<th style="padding:10px;">Bulan</th>';
    html += '<th style="padding:10px;text-align:center;">Deadline</th>';
    html += '<th style="padding:10px;text-align:right;">Bayaran</th>';
    html += '<th style="padding:10px;text-align:center;">Tarikh Bayar</th>';
    html += '<th style="padding:10px;text-align:right;">Baki</th>';
    html += '<th style="padding:10px;text-align:center;">Status</th>';
    html += '</tr></thead><tbody>';
    
    // ===== LOGIC BARU: DISTRIBUTE BAYARAN KE BULAN-BULAN =====
    
    // 1. Sort bayaranLog by date (oldest first)
    var sortedBayaran = [];
    if (h.bayaranLog) {
        sortedBayaran = h.bayaranLog.slice().sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    }
    
    // 2. Generate semua bulan dalam jadual
    var parts = h.tarikhMula.split('-');
    var startYear = parseInt(parts[0]);
    var startMonth = parseInt(parts[1]);
    var bulananAmount = h.bayaranBulanan;
    
    var jadualBulan = [];
    
    for (var i = 0; i < h.bilanganBulan; i++) {
        var m = ((startMonth - 1 + i) % 12);
        var y = startYear + Math.floor((startMonth - 1 + i) / 12);
        var monthKey = y + '-' + String(m + 1).padStart(2, '0');
        var monthLabel = monthNames[m] + ' ' + y;
        
        jadualBulan.push({
            index: i,
            year: y,
            month: m,
            monthKey: monthKey,
            monthLabel: monthLabel,
            deadlineDay: h.deadline || 10,
            required: bulananAmount,
            paid: 0,
            payments: [] // Track which bayaran(s) cover this month
        });
    }
    
    // 3. Distribute bayaran ke bulan-bulan
    var remainingAmount = 0; // Lebihan dari bayaran sebelum
    var lastPayment = null;
    
    for (var b = 0; b < sortedBayaran.length; b++) {
        var bayaran = sortedBayaran[b];
        var availableAmount = bayaran.amount + remainingAmount;
        remainingAmount = 0;
        
        // Distribute ke bulan-bulan secara berturutan
        for (var j = 0; j < jadualBulan.length; j++) {
            var bulan = jadualBulan[j];
            
            // Skip kalau bulan ni dah lunas
            if (bulan.paid >= bulan.required) continue;
            
            var needed = bulan.required - bulan.paid;
            
            if (availableAmount >= needed) {
                // Bayar penuh bulan ni
                bulan.paid += needed;
                availableAmount -= needed;
                bulan.payments.push({
                    date: bayaran.date,
                    amount: needed,
                    full: true
                });
                
                // Kalau dah habis amount, break
                if (availableAmount <= 0) break;
            } else {
                // Bayar separuh sahaja (tak cukup)
                bulan.paid += availableAmount;
                bulan.payments.push({
                    date: bayaran.date,
                    amount: availableAmount,
                    full: false
                });
                availableAmount = 0;
                break;
            }
        }
        
        // Kalau ada lebihan selepas semua bulan, simpan untuk next bayaran
        remainingAmount = availableAmount;
    }
    
    // 4. Render jadual
    var runningBaki = h.totalDenganProfit;
    
    for (var i = 0; i < jadualBulan.length; i++) {
        var bulan = jadualBulan[i];
        runningBaki -= bulan.paid;
        if (runningBaki < 0) runningBaki = 0;
        
        var rowBg = i % 2 === 0 ? '#fff' : '#f8fafc';
        
        // Status icon & color
        var statusIcon = '';
        var statusColor = '';
        var statusText = '';
        
        if (bulan.paid >= bulan.required) {
            statusIcon = '✅';
            statusColor = '#a78bfa';
            statusText = 'Lunas';
        } else if (bulan.paid > 0) {
            statusIcon = '⚠️';
            statusColor = '#f59e0b';
            statusText = 'Separa';
        } else {
            statusIcon = '❌';
            statusColor = '#ef4444';
            statusText = 'Belum';
        }
        
        // Deadline
        var deadlineDay = bulan.deadlineDay;
        var deadlineStr = deadlineDay + '/' + (bulan.month + 1) + '/' + bulan.year;
        var deadlineDateObj = new Date(bulan.year, bulan.month, deadlineDay);
        var nowDate = new Date();
        var isOverdue = bulan.paid < bulan.required && deadlineDateObj < nowDate;
        
        var deadlineCellColor = '#64748b';
        if (bulan.paid >= bulan.required) deadlineCellColor = '#a78bfa';
        else if (isOverdue) deadlineCellColor = '#dc2626';
        
        // ===== TARIKH BAYAR =====
        var tarikhBayarHtml = '';
        if (bulan.payments.length > 0) {
            for (var p = 0; p < bulan.payments.length; p++) {
                var pay = bulan.payments[p];
                var bayarDateObj = new Date(pay.date);
                var bayarParts = pay.date.split('-');
                var formatted = bayarParts[2] + '/' + parseInt(bayarParts[1]) + '/' + bayarParts[0];
                
                var isAwal = bayarDateObj <= deadlineDateObj;
                var bayarColor = isAwal ? '#a78bfa' : '#f59e0b';
                var bayarIcon = isAwal ? '✅' : '⚠️';
                var bayarTitle = isAwal ? 'Bayar tepat/awal' : 'Bayar lewat';
                
                if (p > 0) tarikhBayarHtml += '<br>';
                tarikhBayarHtml += '<span style="display:inline-block;background:' + bayarColor + '20;color:' + bayarColor + ';padding:3px 8px;border-radius:8px;font-size:0.78rem;font-weight:700;" title="' + bayarTitle + '">';
                tarikhBayarHtml += bayarIcon + ' ' + formatted;
                if (!pay.full) {
                    tarikhBayarHtml += ' (RM ' + pay.amount.toFixed(2) + ')';
                }
                tarikhBayarHtml += '</span>';
            }
        } else {
            tarikhBayarHtml = '<span style="color:#94a3b8;">-</span>';
        }
        
        html += '<tr style="background:' + rowBg + ';border-bottom:1px solid #e2e8f0;">';
        
        // No
        html += '<td style="padding:10px;text-align:center;font-weight:700;">' + (i + 1) + '</td>';
        
        // Bulan
        html += '<td style="padding:10px;text-align:center;color:#1f2937;font-weight:600;">' + bulan.monthLabel + '</td>';
        
        // Deadline
        html += '<td style="padding:10px;text-align:center;color:' + deadlineCellColor + ';font-weight:600;">' + deadlineStr + '</td>';
        
        // Bayaran (jumlah yang dibayar)
        html += '<td style="padding:10px;text-align:right;font-weight:700;color:' + (bulan.paid > 0 ? '#a78bfa' : '#94a3b8') + ';">';
        html += (bulan.paid > 0 ? 'RM ' + bulan.paid.toFixed(2) : '-');
        html += '</td>';
        
        // Tarikh Bayar
        html += '<td style="padding:10px;text-align:center;">' + tarikhBayarHtml + '</td>';
        
        // Baki (running balance)
        html += '<td style="padding:10px;text-align:right;font-weight:700;color:#dc2626;">';
        html += 'RM ' + runningBaki.toFixed(2);
        html += '</td>';
        
        // Status
        html += '<td style="padding:10px;text-align:center;">';
        html += '<span style="display:inline-flex;align-items:center;gap:4px;background:' + statusColor + '20;color:' + statusColor + ';padding:4px 10px;border-radius:12px;font-size:0.78rem;font-weight:700;">';
        html += statusIcon + ' ' + statusText;
        html += '</span>';
        html += '</td>';
        
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    html += '</div>';
    
    // Legend
    html += '<div style="margin-top:15px;padding:12px 15px;background:#f8fafc;border-radius:10px;font-size:0.82rem;color:#64748b;">';
    html += '<strong>💡 Legend Tarikh Bayar:</strong> ';
    html += '<span style="background:#a78bfa20;color:#a78bfa;padding:2px 8px;border-radius:6px;margin:0 5px;font-weight:700;">✅ Awal/Tepat</span>';
    html += '<span style="background:#f59e0b20;color:#f59e0b;padding:2px 8px;border-radius:6px;margin:0 5px;font-weight:700;">⚠️ Lewat</span>';
    html += '</div>';
    
    // Info box untuk advance payment
    html += '<div style="margin-top:10px;padding:12px 15px;background:#dbeafe;border-radius:10px;font-size:0.82rem;color:#1e40af;">';
    html += '💡 <strong>Nota:</strong> Bayaran melebihi bulanan akan auto-pindah ke bulan seterusnya.';
    html += '</div>';
    
    container.innerHTML = html;
}

// ===== DELETE HUTANG =====
function deleteHutang(index) {
    if (!confirm('⚠️ Padam hutang ini?\n\nTindakan ini TIDAK boleh diundo!')) return;
    
    appData = loadData();
    appData.hutangList.splice(index, 1);
    saveData(appData);
    
    if (typeof showToast === 'function') showToast('🗑 Hutang dipadam');
    renderHutangDashboard();
}

console.log('✅ Rekod Hutang module loaded');

// ============================================
// ===== QUICK PAYMENT CARD ===================
// ============================================

function renderQuickPaymentCard(hutangList) {
    // Filter hanya hutang aktif (belum selesai)
    var aktifList = [];
    for (var i = 0; i < hutangList.length; i++) {
        var h = hutangList[i];
        var totalBayar = 0;
        if (h.bayaranLog) {
            for (var j = 0; j < h.bayaranLog.length; j++) {
                totalBayar += h.bayaranLog[j].amount || 0;
            }
        }
        var baki = (h.totalDenganProfit || 0) - totalBayar;
        if (baki > 0) {
            aktifList.push({
                index: i,
                data: h,
                baki: baki,
                totalBayar: totalBayar
            });
        }
    }

    var html = '';
    html += '<div style="background:linear-gradient(135deg,#a78bfa,#7c3aed);color:white;padding:25px;border-radius:16px;margin-bottom:20px;box-shadow:0 8px 25px rgba(16,185,129,0.3);">';
    
    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">';
    html += '<div>';
    html += '<h2 style="margin:0;font-size:1.4rem;display:flex;align-items:center;gap:10px;">⚡ Bayaran Pantas</h2>';
    html += '<p style="margin:5px 0 0;opacity:0.9;font-size:0.88rem;">Pilih hutang & terus bayar</p>';
    html += '</div>';
    html += '<div style="background:rgba(255,255,255,0.2);padding:8px 16px;border-radius:20px;font-size:0.85rem;font-weight:700;">';
    html += '📊 ' + aktifList.length + ' Hutang Aktif';
    html += '</div>';
    html += '</div>';

    if (aktifList.length === 0) {
        html += '<div style="background:rgba(255,255,255,0.15);padding:30px;border-radius:12px;text-align:center;">';
        html += '<div style="font-size:3rem;margin-bottom:10px;">🎉</div>';
        html += '<p style="margin:0;font-weight:700;">Tiada hutang aktif!</p>';
        html += '<small style="opacity:0.9;">Semua hutang sudah selesai</small>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    // Form container
    html += '<div style="background:white;border-radius:12px;padding:20px;">';
    
    html += '<div style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:12px;align-items:end;">';
    
    // Dropdown
    html += '<div>';
    html += '<label style="display:block;margin-bottom:6px;font-weight:700;color:#1f2937;font-size:0.85rem;">💰 Pilih Hutang</label>';
    html += '<select id="quickPayHutang" onchange="onQuickPayChange()" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:10px;font-size:0.9rem;font-weight:600;color:#1f2937;cursor:pointer;background:white;">';
    html += '<option value="">-- Pilih hutang untuk bayar --</option>';
    
    for (var i = 0; i < aktifList.length; i++) {
        var item = aktifList[i];
        var h = item.data;
        var icon = h.jenis === 'peribadi' ? '👤' : '🕌';
        html += '<option value="' + item.index + '" data-baki="' + item.baki + '" data-bulanan="' + (h.bayaranBulanan || 0) + '" data-nama="' + h.nama + '">';
        html += icon + ' ' + h.nama + ' - Baki: RM ' + item.baki.toFixed(2);
        html += '</option>';
    }
    html += '</select>';
    html += '</div>';

    // Bulan
    html += '<div>';
    html += '<label style="display:block;margin-bottom:6px;font-weight:700;color:#1f2937;font-size:0.85rem;">📅 Bulan</label>';
    html += '<input type="month" id="quickPayBulan" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:10px;font-size:0.9rem;font-weight:600;">';
    html += '</div>';

    // Jumlah
    html += '<div>';
    html += '<label style="display:block;margin-bottom:6px;font-weight:700;color:#1f2937;font-size:0.85rem;">💵 Jumlah (RM)</label>';
    html += '<input type="number" id="quickPayAmount" step="0.01" min="0.01" placeholder="0.00" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:10px;font-size:0.9rem;font-weight:700;color:#7c3aed;">';
    html += '</div>';

    // Button Bayar
    html += '<div>';
    html += '<button onclick="quickPayNow()" style="padding:12px 28px;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;border-radius:10px;font-weight:800;cursor:pointer;font-size:0.95rem;white-space:nowrap;box-shadow:0 4px 12px rgba(245,158,11,0.4);">';
    html += '💰 BAYAR';
    html += '</button>';
    html += '</div>';

    html += '</div>';

    // Info Box (auto-show when selected)
    html += '<div id="quickPayInfo" style="display:none;margin-top:15px;padding:12px 15px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;border-left:4px solid #f59e0b;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:0.85rem;">';
    html += '<div><strong>📋 Maklumat:</strong> <span id="quickPayInfoText">-</span></div>';
    html += '<button onclick="useFullBayaranBulanan()" style="background:#a78bfa;color:white;border:none;padding:6px 14px;border-radius:8px;font-size:0.78rem;font-weight:700;cursor:pointer;">✨ Guna Bayaran Bulanan</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    return html;
}

// ===== ON CHANGE - Show info bila pilih hutang =====
function onQuickPayChange() {
    var select = document.getElementById('quickPayHutang');
    var info = document.getElementById('quickPayInfo');
    var infoText = document.getElementById('quickPayInfoText');
    var amountInput = document.getElementById('quickPayAmount');
    var bulanInput = document.getElementById('quickPayBulan');
    
    if (!select.value) {
        info.style.display = 'none';
        amountInput.value = '';
        return;
    }

    var selected = select.options[select.selectedIndex];
    var baki = parseFloat(selected.dataset.baki) || 0;
    var bulanan = parseFloat(selected.dataset.bulanan) || 0;
    var nama = selected.dataset.nama;

    // Auto-fill bulanan
    amountInput.value = bulanan.toFixed(2);
    
    // Auto-fill bulan semasa
    var now = new Date();
    var monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    bulanInput.value = monthStr;

    // Show info
    info.style.display = 'block';
    infoText.innerHTML = '<strong>' + nama + '</strong> | Baki: <strong style="color:#dc2626;">RM ' + baki.toFixed(2) + '</strong> | Bayaran Bulanan: <strong style="color:#7c3aed;">RM ' + bulanan.toFixed(2) + '</strong>';
}

// ===== USE FULL BAYARAN BULANAN =====
function useFullBayaranBulanan() {
    var select = document.getElementById('quickPayHutang');
    if (!select.value) return;
    
    var selected = select.options[select.selectedIndex];
    var bulanan = parseFloat(selected.dataset.bulanan) || 0;
    document.getElementById('quickPayAmount').value = bulanan.toFixed(2);
}

// ===== QUICK PAY NOW - Proses bayaran =====
function quickPayNow() {
    var select = document.getElementById('quickPayHutang');
    var amountInput = document.getElementById('quickPayAmount');
    var bulanInput = document.getElementById('quickPayBulan');

    // Validation 1: Pilih hutang
    if (!select.value) {
        alert('❌ Sila pilih hutang dahulu');
        return;
    }

    // Validation 2: Jumlah valid
    var amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('❌ Sila masukkan jumlah yang sah');
        return;
    }

    // Validation 3: Pilih bulan
    var bulan = bulanInput.value;
    if (!bulan) {
        alert('❌ Sila pilih bulan');
        return;
    }

    // Load data
    var index = parseInt(select.value);
    appData = loadData();
    var h = appData.hutangList[index];
    if (!h) {
        alert('❌ Hutang tidak ditemui');
        return;
    }

    // Calculate baki semasa
    var totalBayar = 0;
    if (h.bayaranLog) {
        for (var j = 0; j < h.bayaranLog.length; j++) {
            totalBayar += h.bayaranLog[j].amount || 0;
        }
    }
    var bakiSemasa = (h.totalDenganProfit || 0) - totalBayar;

    // Warning kalau lebih baki
    if (amount > bakiSemasa) {
        if (!confirm('⚠️ Amaran!\n\nJumlah bayaran (RM ' + amount.toFixed(2) + ') melebihi baki (RM ' + bakiSemasa.toFixed(2) + ').\n\nTeruskan?')) {
            return;
        }
    }

    // Confirmation
    if (!confirm('💰 Sahkan Bayaran?\n\nHutang: ' + h.nama + '\nBulan: ' + bulan + '\nJumlah: RM ' + amount.toFixed(2) + '\n\nTeruskan?')) {
        return;
    }

    // Record payment
    if (!h.bayaranLog) h.bayaranLog = [];
    
    h.bayaranLog.push({
        date: new Date().toISOString().split('T')[0],
        bulan: bulan,
        amount: amount,
        catatan: 'Bayaran pantas via dashboard'
    });

    // Save
    saveData(appData);

    // Success message
    if (typeof showToast === 'function') {
        showToast('✅ Bayaran RM ' + amount.toFixed(2) + ' berjaya untuk ' + h.nama + '!');
    } else {
        alert('✅ Bayaran berjaya direkodkan!');
    }

    // Refresh dashboard
    renderHutangDashboard();
}