// ============================================
// ===== PENGURUSAN GAJI (UPGRADED) ===========
// ============================================

function showPengurusanGaji() {
    // Hide other HR tabs
    var allTabs = document.querySelectorAll('.hr-tab-content');
    for (var i = 0; i < allTabs.length; i++) {
        allTabs[i].style.display = 'none';
    }
    
    // Update button styles
    var allBtns = document.querySelectorAll('.hr-tab-btn');
    for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].style.background = 'transparent';
        allBtns[i].style.color = '#64748b';
        allBtns[i].style.boxShadow = 'none';
        allBtns[i].classList.remove('active');
    }
    
    // Activate Pengurusan Gaji button
    var btnPG = document.getElementById('btnPengurusanGaji');
    if (btnPG) {
        btnPG.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
        btnPG.style.color = 'white';
        btnPG.style.boxShadow = '0 3px 10px rgba(245,158,11,0.3)';
        btnPG.classList.add('active');
    }
    
    // Get or create container
    var container = document.getElementById('pengurusanGajiContainer');
    
    if (!container) {
        // Create container if not exists
        var hrSection = document.querySelector('.hr-tab-content') ? 
                       document.querySelector('.hr-tab-content').parentElement : 
                       document.querySelector('#hrDashboard') ? 
                       document.querySelector('#hrDashboard').parentElement : null;
        
        if (!hrSection) {
            // Fallback: cari tab content area
            hrSection = document.querySelector('[id^="tab-hr"]') || document.body;
        }
        
        container = document.createElement('div');
        container.id = 'pengurusanGajiContainer';
        container.className = 'hr-tab-content';
        container.style.display = 'block';
        hrSection.appendChild(container);
    }
    
    container.style.display = 'block';
    
    renderPengurusanGajiContent(container);
}

function renderPengurusanGajiContent(container) {
    appData = loadData();
    
    if (!appData.workers) appData.workers = [];
    if (!appData.cashbook) appData.cashbook = [];
    
    // Filter values
    var yearEl = document.getElementById('pgYearFilter');
    var ustazFilter = document.getElementById('pgUstazFilter');
    
    var year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();
    var ustazSelected = ustazFilter ? ustazFilter.value : 'all';
    
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth() + 1;
    
    // Get all gaji transactions
    var gajiTransactions = getGajiTransactions(year);
    
    // Filter by ustaz
    if (ustazSelected !== 'all') {
        gajiTransactions = gajiTransactions.filter(function(t) {
            return t.ustaz === ustazSelected;
        });
    }
    
        // ===== Get unique ustaz - HANYA DARI SENARAI PEKERJA SAHAJA =====
    var ustazSet = {};
    for (var w = 0; w < appData.workers.length; w++) {
        if (appData.workers[w].name) {
            ustazSet[appData.workers[w].name] = appData.workers[w];
        }
    }
    
    // ===== FILTER transactions: hanya yang pekerja yang ada dalam senarai =====
    var filteredTransactions = [];
    for (var t = 0; t < gajiTransactions.length; t++) {
        var trans = gajiTransactions[t];
        // Hanya include kalau ustaz ada dalam senarai pekerja
        if (ustazSet[trans.ustaz]) {
            filteredTransactions.push(trans);
        }
    }
    
    // Replace gajiTransactions dengan filtered
    gajiTransactions = filteredTransactions;
    
    // Calculate stats per ustaz
    var ustazStats = calculateUstazStats(ustazSet, gajiTransactions);
    
    // Grand totals
    var grandTotal = 0;
    var grandElaun = 0;
    var grandAdvance = 0;
    var grandUpah = 0;
    var grandDuitRaya = 0;
    var grandHadiah = 0;
    
    for (var name in ustazStats) {
        grandTotal += ustazStats[name].total;
        grandElaun += ustazStats[name].totalElaun;
        grandAdvance += ustazStats[name].totalAdvance;
        grandUpah += ustazStats[name].totalUpah;
        grandDuitRaya += ustazStats[name].totalDuitRaya;
        grandHadiah += ustazStats[name].totalHadiah;
    }
    
    // ===== BUILD HTML =====
    var html = '';
    
    // Header
    html += '<div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:30px;border-radius:20px;margin-bottom:25px;box-shadow:0 10px 40px rgba(245,158,11,0.2);">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">';
    html += '<div style="display:flex;align-items:center;gap:15px;">';
    html += '<div style="background:rgba(255,255,255,0.2);width:60px;height:60px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:2rem;">💰</div>';
    html += '<div>';
    html += '<h1 style="margin:0;font-size:1.8rem;font-weight:900;">Gaji & Bayaran</h1>';
    html += '<p style="margin:5px 0 0;opacity:0.95;">Auto-sync dengan Buku Tunai</p>';
    html += '</div>';
    html += '</div>';
    html += '<div style="text-align:right;">';
    html += '<div style="font-size:0.85rem;opacity:0.9;">Tahun ' + year + '</div>';
    html += '<div style="font-size:2rem;font-weight:900;">RM ' + grandTotal.toLocaleString() + '</div>';
    html += '<div style="font-size:0.78rem;opacity:0.9;">Jumlah Keseluruhan</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    // Filter
    html += '<div style="background:white;padding:20px;border-radius:16px;margin-bottom:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">';
    html += '<div style="display:flex;gap:15px;align-items:end;flex-wrap:wrap;">';
    
    html += '<div>';
    html += '<label style="display:block;margin-bottom:6px;font-weight:700;color:#1f2937;font-size:0.85rem;">📅 Tahun</label>';
    html += '<select id="pgYearFilter" onchange="renderPengurusanGajiContent(document.getElementById(\'pengurusanGajiContainer\'))" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.9rem;font-weight:600;min-width:120px;">';
    for (var y = currentYear + 1; y >= currentYear - 5; y--) {
        html += '<option value="' + y + '"' + (y === year ? ' selected' : '') + '>' + y + '</option>';
    }
    html += '</select>';
    html += '</div>';
    
    html += '<div style="flex:1;">';
    html += '<label style="display:block;margin-bottom:6px;font-weight:700;color:#1f2937;font-size:0.85rem;">👤 Ustaz/Pekerja</label>';
    html += '<select id="pgUstazFilter" onchange="renderPengurusanGajiContent(document.getElementById(\'pengurusanGajiContainer\'))" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.9rem;font-weight:600;width:100%;">';
    html += '<option value="all">Semua Ustaz/Pekerja</option>';
    for (var name in ustazSet) {
        html += '<option value="' + name + '"' + (ustazSelected === name ? ' selected' : '') + '>' + name + '</option>';
    }
    html += '</select>';
    html += '</div>';
    
    html += '<button onclick="exportPengurusanGajiCSV()" style="padding:10px 18px;background:linear-gradient(135deg,#a78bfa,#7c3aed);color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem;">📥 Export CSV</button>';
    html += '<button onclick="printPengurusanGaji()" style="padding:10px 18px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem;">🖨 Cetak</button>';
    
    html += '</div>';
    html += '</div>';
    
    // Stats Cards
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px;margin-bottom:25px;">';
    
    var statsCards = [
        { icon: '💼', label: 'Elaun', value: grandElaun, color: '#3b82f6', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
        { icon: '💵', label: 'Advance', value: grandAdvance, color: '#8b5cf6', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' },
        { icon: '🔨', label: 'Upah', value: grandUpah, color: '#f59e0b', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
        { icon: '🪙', label: 'Duit Raya', value: grandDuitRaya, color: '#ec4899', bg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' },
        { icon: '🎁', label: 'Hadiah/Saguhati', value: grandHadiah, color: '#a78bfa', bg: 'linear-gradient(135deg,#e9d5ff,#d8b4fe)' }
    ];
    
    for (var sc = 0; sc < statsCards.length; sc++) {
        var card = statsCards[sc];
        html += '<div style="background:white;padding:18px;border-radius:14px;box-shadow:0 4px 15px rgba(0,0,0,0.06);border-left:4px solid ' + card.color + ';">';
        html += '<div style="display:flex;align-items:center;gap:12px;">';
        html += '<div style="background:' + card.bg + ';width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">' + card.icon + '</div>';
        html += '<div>';
        html += '<div style="font-size:0.75rem;color:#64748b;font-weight:600;">' + card.label + '</div>';
        html += '<div style="font-size:1.3rem;font-weight:900;color:' + card.color + ';">RM ' + card.value.toLocaleString() + '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    
    // Ringkasan Per Ustaz
    html += '<div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);margin-bottom:25px;">';
    html += '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:white;padding:18px 25px;display:flex;justify-content:space-between;align-items:center;">';
    html += '<h2 style="margin:0;font-size:1.2rem;font-weight:800;">👥 Ringkasan Per Ustaz</h2>';
    html += '<span style="background:rgba(255,255,255,0.2);padding:5px 12px;border-radius:20px;font-size:0.82rem;">' + Object.keys(ustazStats).length + ' orang</span>';
    html += '</div>';
    
    html += '<div style="overflow-x:auto;">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;">';
    html += '<thead>';
    html += '<tr style="background:#f8fafc;">';
    html += '<th style="padding:14px;text-align:left;font-weight:800;color:#1f2937;border-bottom:2px solid #e2e8f0;">Ustaz / Pekerja</th>';
    html += '<th style="padding:14px;text-align:right;font-weight:800;color:#3b82f6;border-bottom:2px solid #e2e8f0;">Elaun</th>';
    html += '<th style="padding:14px;text-align:right;font-weight:800;color:#8b5cf6;border-bottom:2px solid #e2e8f0;">Advance</th>';
    html += '<th style="padding:14px;text-align:right;font-weight:800;color:#f59e0b;border-bottom:2px solid #e2e8f0;">Upah</th>';
    html += '<th style="padding:14px;text-align:right;font-weight:800;color:#ec4899;border-bottom:2px solid #e2e8f0;">Duit Raya</th>';
    html += '<th style="padding:14px;text-align:right;font-weight:800;color:#a78bfa;border-bottom:2px solid #e2e8f0;">Hadiah</th>';
    html += '<th style="padding:14px;text-align:center;font-weight:800;color:#1f2937;border-bottom:2px solid #e2e8f0;">Transaksi</th>';
    html += '<th style="padding:14px;text-align:right;font-weight:800;color:#7c3aed;border-bottom:2px solid #e2e8f0;">TOTAL</th>';
    html += '<th style="padding:14px;text-align:center;font-weight:800;color:#1f2937;border-bottom:2px solid #e2e8f0;">Tindakan</th>';
    html += '</tr>';
    html += '</thead>';
    
    html += '<tbody>';
    
    var sortedUstaz = Object.keys(ustazStats).sort();
    
    if (sortedUstaz.length === 0) {
        html += '<tr><td colspan="9" style="padding:60px;text-align:center;color:#64748b;">';
        html += '<div style="font-size:4rem;margin-bottom:15px;">📭</div>';
        html += '<p>Tiada data ustaz/pekerja untuk tahun ' + year + '</p>';
        html += '</td></tr>';
    } else {
        for (var u = 0; u < sortedUstaz.length; u++) {
            var name = sortedUstaz[u];
            var stats = ustazStats[name];
            var rowBg = u % 2 === 0 ? '#ffffff' : '#fafbfc';
            
            var monthlySalary = (stats.worker && stats.worker.monthlySalary) ? stats.worker.monthlySalary : 0;
            
            html += '<tr style="background:' + rowBg + ';transition:all 0.2s;" onmouseover="this.style.background=\'#faf5ff\'" onmouseout="this.style.background=\'' + rowBg + '\'">';
            
            html += '<td style="padding:14px;">';
            html += '<div style="font-weight:700;color:#1f2937;">' + name + '</div>';
            if (stats.worker && stats.worker.role) {
                html += '<div style="font-size:0.78rem;color:#64748b;">' + stats.worker.role + '</div>';
            }
            if (monthlySalary > 0) {
                html += '<div style="font-size:0.72rem;color:#a78bfa;margin-top:3px;">📌 Gaji set: RM ' + monthlySalary.toLocaleString() + '/bulan</div>';
            }
            html += '</td>';
            
            html += '<td style="padding:14px;text-align:right;color:#3b82f6;font-weight:700;">' + (stats.totalElaun > 0 ? 'RM ' + stats.totalElaun.toLocaleString() : '-') + '</td>';
            html += '<td style="padding:14px;text-align:right;color:#8b5cf6;font-weight:700;">' + (stats.totalAdvance > 0 ? 'RM ' + stats.totalAdvance.toLocaleString() : '-') + '</td>';
            html += '<td style="padding:14px;text-align:right;color:#f59e0b;font-weight:700;">' + (stats.totalUpah > 0 ? 'RM ' + stats.totalUpah.toLocaleString() : '-') + '</td>';
            html += '<td style="padding:14px;text-align:right;color:#ec4899;font-weight:700;">' + (stats.totalDuitRaya > 0 ? 'RM ' + stats.totalDuitRaya.toLocaleString() : '-') + '</td>';
            html += '<td style="padding:14px;text-align:right;color:#a78bfa;font-weight:700;">' + (stats.totalHadiah > 0 ? 'RM ' + stats.totalHadiah.toLocaleString() : '-') + '</td>';
            html += '<td style="padding:14px;text-align:center;font-weight:700;color:#64748b;">' + stats.transactions.length + '</td>';
            html += '<td style="padding:14px;text-align:right;font-weight:900;color:#7c3aed;font-size:1.05rem;">RM ' + stats.total.toLocaleString() + '</td>';
            html += '<td style="padding:14px;text-align:center;">';
            html += '<button onclick="viewUstazDetail(\'' + name.replace(/'/g, "\\'") + '\', ' + year + ')" style="background:#3b82f6;color:white;border:none;padding:6px 12px;border-radius:6px;font-size:0.78rem;font-weight:700;cursor:pointer;">👁 Detail</button>';
            html += '</td>';
            
            html += '</tr>';
        }
        
        // Grand Total
        html += '<tr style="background:linear-gradient(135deg,#faf5ff,#dcfce7);border-top:3px solid #a78bfa;">';
        html += '<td style="padding:16px;font-weight:900;color:#7c3aed;font-size:1rem;">JUMLAH KESELURUHAN</td>';
        html += '<td style="padding:16px;text-align:right;font-weight:900;color:#3b82f6;">RM ' + grandElaun.toLocaleString() + '</td>';
        html += '<td style="padding:16px;text-align:right;font-weight:900;color:#8b5cf6;">RM ' + grandAdvance.toLocaleString() + '</td>';
        html += '<td style="padding:16px;text-align:right;font-weight:900;color:#f59e0b;">RM ' + grandUpah.toLocaleString() + '</td>';
        html += '<td style="padding:16px;text-align:right;font-weight:900;color:#ec4899;">RM ' + grandDuitRaya.toLocaleString() + '</td>';
        html += '<td style="padding:16px;text-align:right;font-weight:900;color:#a78bfa;">RM ' + grandHadiah.toLocaleString() + '</td>';
        html += '<td style="padding:16px;text-align:center;font-weight:900;color:#1f2937;">' + gajiTransactions.length + '</td>';
        html += '<td style="padding:16px;text-align:right;font-weight:900;color:#7c3aed;font-size:1.15rem;">RM ' + grandTotal.toLocaleString() + '</td>';
        html += '<td></td>';
        html += '</tr>';
    }
    
    html += '</tbody>';
    html += '</table>';
    html += '</div>';
    html += '</div>';
    
    // Senarai Transaksi
    html += '<div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">';
    html += '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:white;padding:18px 25px;">';
    html += '<h2 style="margin:0;font-size:1.2rem;font-weight:800;">📝 Senarai Transaksi (' + gajiTransactions.length + ')</h2>';
    html += '</div>';
    
    if (gajiTransactions.length === 0) {
        html += '<div style="padding:60px 20px;text-align:center;color:#64748b;">';
        html += '<div style="font-size:4rem;margin-bottom:15px;">📭</div>';
        html += '<p>Tiada transaksi gaji untuk tahun ' + year + '</p>';
        html += '</div>';
    } else {
        gajiTransactions.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        
        html += '<div style="overflow-x:auto;">';
        html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
        html += '<thead>';
        html += '<tr style="background:#f8fafc;">';
        html += '<th style="padding:12px;text-align:left;font-weight:700;color:#64748b;text-transform:uppercase;font-size:0.72rem;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Tarikh</th>';
        html += '<th style="padding:12px;text-align:left;font-weight:700;color:#64748b;text-transform:uppercase;font-size:0.72rem;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">No. Ruj</th>';
        html += '<th style="padding:12px;text-align:left;font-weight:700;color:#64748b;text-transform:uppercase;font-size:0.72rem;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Butiran</th>';
        html += '<th style="padding:12px;text-align:left;font-weight:700;color:#64748b;text-transform:uppercase;font-size:0.72rem;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Ustaz</th>';
        html += '<th style="padding:12px;text-align:center;font-weight:700;color:#64748b;text-transform:uppercase;font-size:0.72rem;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Jenis</th>';
        html += '<th style="padding:12px;text-align:right;font-weight:700;color:#64748b;text-transform:uppercase;font-size:0.72rem;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Jumlah</th>';
        html += '</tr>';
        html += '</thead>';
        
        html += '<tbody>';
        for (var t = 0; t < gajiTransactions.length; t++) {
            var trans = gajiTransactions[t];
            var rowBg = t % 2 === 0 ? '#ffffff' : '#fafbfc';
            
            var typeColors = {
                'Elaun': { bg: '#dbeafe', color: '#1e40af' },
                'Advance': { bg: '#ede9fe', color: '#5b21b6' },
                'Upah': { bg: '#fef3c7', color: '#78350f' },
                'Duit Raya': { bg: '#fce7f3', color: '#9d174d' },
                'Hadiah/Saguhati': { bg: '#e9d5ff', color: '#7c3aed' }
            };
            var typeColor = typeColors[trans.type] || { bg: '#f1f5f9', color: '#64748b' };
            
            html += '<tr style="background:' + rowBg + ';transition:all 0.2s;" onmouseover="this.style.background=\'#faf5ff\'" onmouseout="this.style.background=\'' + rowBg + '\'">';
            html += '<td style="padding:12px;color:#1f2937;font-weight:600;">' + formatDateShortPG(trans.date) + '</td>';
            html += '<td style="padding:12px;color:#3b82f6;font-weight:700;font-size:0.82rem;">' + (trans.ref || '-') + '</td>';
            html += '<td style="padding:12px;color:#475569;">' + trans.description + '</td>';
            html += '<td style="padding:12px;color:#1f2937;font-weight:600;">' + trans.ustaz + '</td>';
            html += '<td style="padding:12px;text-align:center;"><span style="background:' + typeColor.bg + ';color:' + typeColor.color + ';padding:4px 10px;border-radius:12px;font-size:0.72rem;font-weight:700;">' + trans.type + '</span></td>';
            html += '<td style="padding:12px;text-align:right;font-weight:800;color:#dc2626;">RM ' + trans.amount.toLocaleString() + '</td>';
            html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        html += '</div>';
    }
    
    html += '</div>';
    
    container.innerHTML = html;
}

// ===== GET GAJI TRANSACTIONS (FIXED - Detect Year from Description) =====
function getGajiTransactions(year) {
    var transactions = [];
    
    if (!appData.cashbook) return transactions;
    
    for (var i = 0; i < appData.cashbook.length; i++) {
        var entry = appData.cashbook[i];
        if (entry.type !== 'credit') continue;
        
        var desc = (entry.description || '').toUpperCase();
        var cat = (entry.category || '').toUpperCase();
        
        var isGaji = false;
        var gajiType = '';
        
        if (cat.indexOf('GAJI') > -1 || cat.indexOf('ELAUN') > -1) {
            isGaji = true;
            gajiType = 'Elaun';
        } else if (cat.indexOf('UPAH') > -1) {
            isGaji = true;
            gajiType = 'Upah';
        } else if (cat.indexOf('SAGUHATI') > -1) {
            isGaji = true;
            gajiType = 'Hadiah/Saguhati';
        } else if (cat.indexOf('DUIT RAYA') > -1) {
            isGaji = true;
            gajiType = 'Duit Raya';
        } else if (desc.indexOf('ADVANCE') > -1 || desc.indexOf('PENDAHULUAN') > -1) {
            isGaji = true;
            gajiType = 'Advance';
        } else if (desc.indexOf('GAJI') > -1 || desc.indexOf('ELAUN') > -1) {
            isGaji = true;
            gajiType = 'Elaun';
        }
        
        if (!isGaji) continue;
        
        // ===== FIX: Detect TAHUN dari description dulu =====
        var detectedInfo = detectMonthYearFromDescription(entry.description);

        // 🛡️ Elak crash kalau entry.date kosong/tak wujud
        var entryDateParts = (entry.date && typeof entry.date === 'string') ? entry.date.split('-') : [];
        var transactionYear = detectedInfo.year || (entryDateParts[0] ? parseInt(entryDateParts[0]) : null);
        var transactionMonth = detectedInfo.month || (entryDateParts[1] ? parseInt(entryDateParts[1]) : null);

        // Kalau tetap tak dapat tahun (data rosak/tak lengkap), skip transaksi ni
        if (!transactionYear) continue;

        // ===== FILTER ikut tahun yang dimaksudkan (bukan tarikh transaksi) =====
        if (transactionYear !== year) continue;
        
        var ustazName = detectUstazFromDescription(entry.description, appData.workers);
        if (!ustazName) ustazName = entry.person || 'Tidak Diketahui';
        
        transactions.push({
            id: entry.id,
            date: entry.date,
            month: transactionMonth,
            year: transactionYear,
            ref: entry.ref,
            description: entry.description,
            category: entry.category,
            amount: entry.amount,
            ustaz: ustazName,
            type: gajiType,
            payMethod: entry.payMethod,
            actualPaymentDate: entry.date  // Tarikh sebenar transaksi
        });
    }
    
    return transactions;
}

// ===== CALCULATE USTAZ STATS =====
function calculateUstazStats(ustazSet, transactions) {
    var ustazStats = {};
    
    for (var name in ustazSet) {
        ustazStats[name] = {
            name: name,
            worker: ustazSet[name],
            totalElaun: 0,
            totalAdvance: 0,
            totalUpah: 0,
            totalDuitRaya: 0,
            totalHadiah: 0,
            total: 0,
            transactions: []
        };
    }
    
    for (var t = 0; t < transactions.length; t++) {
        var trans = transactions[t];
        var stats = ustazStats[trans.ustaz];
        if (!stats) continue;
        
        stats.transactions.push(trans);
        stats.total += trans.amount;
        
        if (trans.type === 'Elaun') stats.totalElaun += trans.amount;
        else if (trans.type === 'Advance') stats.totalAdvance += trans.amount;
        else if (trans.type === 'Upah') stats.totalUpah += trans.amount;
        else if (trans.type === 'Duit Raya') stats.totalDuitRaya += trans.amount;
        else if (trans.type === 'Hadiah/Saguhati') stats.totalHadiah += trans.amount;
    }
    
    return ustazStats;
}

// ===== HELPER: Detect ustaz from description (FIXED - Anti Collision) =====
function detectUstazFromDescription(desc, workers) {
    if (!desc) return null;
    var descUpper = desc.toUpperCase();
    
    // Perkataan umum yang diabaikan semasa pengiraan skor padanan suku kata
    var ignoreWords = ['USTAZ', 'USTAZAH', 'USTADZ', 'BIN', 'BINTI', 'AL', 'IBNI', 'SITI'];
    
    // ===== METHOD 1: Extract dari pattern "Ustaz [Nama]" atau "Ustazah [Nama]" =====
    var patterns = [
        /USTAZ\s+([A-Z][A-Z]+(?:\s+BIN\s+[A-Z][A-Z]+)?)/i,
        /USTAZAH\s+([A-Z][A-Z]+(?:\s+BINTI\s+[A-Z][A-Z]+)?)/i,
        /USTADZ\s+([A-Z][A-Z]+)/i
    ];
    
    for (var p = 0; p < patterns.length; p++) {
        var match = desc.match(patterns[p]);
        if (match && match[1]) {
            var extractedName = match[1].trim();
            
            // Bersihkan nama (buang text selepas " - " atau "-")
            extractedName = extractedName.split(/\s*-/)[0].trim();
            extractedName = extractedName.split(/\s+\d/)[0].trim(); // buang nombor tahun
            
            var prefix = patterns[p].source.indexOf('USTAZAH') > -1 ? 'Ustazah ' : 'Ustaz ';
            
            // Format huruf besar di awal perkataan
            var properName = extractedName.split(/\s+/).map(function(word) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
            
            var fullExtractedName = prefix + properName;
            
            // Cuba cari direct match dengan senarai pekerja
            for (var w = 0; w < workers.length; w++) {
                var workerName = workers[w].name;
                if (!workerName) continue;
                
                if (workerName.toUpperCase() === fullExtractedName.toUpperCase()) {
                    return workerName;
                }
            }
        }
    }
    
    // ===== METHOD 2: Direct Substring Match (Nama Penuh Wujud) =====
    // Mencari jika nama penuh pekerja ada secara tepat di dalam deskripsi
    for (var w = 0; w < workers.length; w++) {
        var workerName = workers[w].name;
        if (!workerName) continue;
        var workerNameUpper = workerName.toUpperCase();
        
        if (descUpper.indexOf(workerNameUpper) > -1) {
            return workerName;
        }
        
        // Cuba buang gelaran "Ustaz / Ustazah" untuk semakan nama penuh sahaja
        var cleanWorkerName = workerNameUpper.replace(/^(USTAZ\s+|USTAZAH\s+|USTADZ\s+)/, '');
        if (cleanWorkerName && descUpper.indexOf(cleanWorkerName) > -1) {
            return workerName;
        }
    }
    
    // ===== METHOD 3: Scored Fallback (Penyelesaian Bug #4) =====
    // Mengira skor padanan perkataan penting untuk mengelakkan silap nama (Ahmad Faiz vs Ahmad Zaki)
    var bestWorker = null;
    var highestScore = 0;
    var isTie = false; // Flag jika berlaku keputusan seri antara 2 pekerja
    
    for (var w = 0; w < workers.length; w++) {
        var workerName = workers[w].name;
        if (!workerName) continue;
        
        var workerNameUpper = workerName.toUpperCase();
        var nameParts = workerNameUpper.split(/\s+/);
        
        var score = 0;
        
        for (var n = 0; n < nameParts.length; n++) {
            var part = nameParts[n];
            
            // Abaikan gelaran dan kata hubung umum
            if (ignoreWords.indexOf(part) > -1) continue;
            
            // Hanya semak perkataan yang bermakna (panjang >= 3 huruf)
            if (part.length < 3) continue;
            
            // Gunakan regex dengan sempadan kata (\b) supaya tidak tersalah padan separa teks
            var safePart = part.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape regex chars
            var regex = new RegExp('\\b' + safePart + '\\b', 'i');
            
            if (regex.test(descUpper)) {
                score++;
            }
        }
        
        if (score > 0) {
            if (score > highestScore) {
                highestScore = score;
                bestWorker = workerName;
                isTie = false; // Ada pendahulu baru yang jelas
            } else if (score === highestScore) {
                isTie = true; // Keputusan seri, ada pekerja lain yang mendapat skor sama
            }
        }
    }
    
    // Hanya pulangkan pekerja jika ada pemenang yang jelas tanpa konflik seri
    if (highestScore > 0 && !isTie) {
        return bestWorker;
    }
    
    return null;
}

// ===== HELPER: Detect MONTH + YEAR from description =====
// (Implementasi sebenar ada di bawah - guna window.detectMonthYearFromDescription)

// ===== HELPER: Format date =====
function formatDateShortPG(dateStr) {
    if (!dateStr) return '-';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
}

// ===== VIEW USTAZ DETAIL (UPGRADED - Breakdown HANYA Elaun) =====
function viewUstazDetail(ustazName, year) {
    appData = loadData();
    
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    
    var html = '<div style="background:white;border-radius:20px;padding:30px;max-width:800px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">';
    
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
    html += '<h2 style="margin:0;color:#7c3aed;">👤 ' + ustazName + ' - ' + year + '</h2>';
    html += '<button onclick="this.closest(\'[style*=fixed]\').remove()" style="background:#f1f5f9;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.1rem;">✕</button>';
    html += '</div>';
    
    // ===== COLLECT TRANSACTIONS =====
    var monthLabels = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sept', 'Okt', 'Nov', 'Dis'];
    
    // Breakdown bulanan - HANYA ELAUN
    var elaunMonthly = {};
    for (var m = 1; m <= 12; m++) elaunMonthly[m] = 0;
    
    var totalElaun = 0;
    var totalAdvance = 0;
    var totalUpah = 0;
    var totalDuitRaya = 0;
    var totalHadiah = 0;
    var totalLain = 0;
    var grandTotal = 0;
    
    var ustazTransactions = [];
    
    for (var i = 0; i < appData.cashbook.length; i++) {
        var entry = appData.cashbook[i];
        if (entry.type !== 'credit') continue;
        
        // Detect tahun & bulan dari description
        var detectedInfo = detectMonthYearFromDescription(entry.description);
        var entryYear = detectedInfo.year || parseInt(entry.date.split('-')[0]);
        
        if (entryYear !== year) continue;
        
        var detectedUstaz = detectUstazFromDescription(entry.description, appData.workers);
        if (detectedUstaz !== ustazName && entry.person !== ustazName) continue;
        
        var cat = (entry.category || '').toUpperCase();
        var desc = (entry.description || '').toUpperCase();
        
        // Detect jenis bayaran
        var transType = '';
        var isElaunOnly = false;
        
        if (cat.indexOf('GAJI') > -1 || cat.indexOf('ELAUN') > -1 || desc.indexOf('ELAUN') > -1) {
            transType = 'Elaun';
            isElaunOnly = true;
        } else if (cat.indexOf('UPAH') > -1) {
            transType = 'Upah';
        } else if (cat.indexOf('SAGUHATI') > -1 || desc.indexOf('SAGUHATI') > -1 || desc.indexOf('HADIAH') > -1) {
            transType = 'Hadiah/Saguhati';
        } else if (cat.indexOf('DUIT RAYA') > -1 || desc.indexOf('DUIT RAYA') > -1) {
            transType = 'Duit Raya';
        } else if (desc.indexOf('ADVANCE') > -1 || desc.indexOf('PENDAHULUAN') > -1) {
            transType = 'Advance';
        } else {
            transType = 'Lain-lain';
        }
        
        // Skip kalau bukan transaction gaji-related
        if (transType === 'Lain-lain' && !isGajiRelated(cat, desc)) continue;
        
        var month = detectedInfo.month || parseInt(entry.date.split('-')[1]);
        
        // ===== BREAKDOWN BULANAN - HANYA ELAUN =====
        if (isElaunOnly) {
            elaunMonthly[month] += entry.amount;
            totalElaun += entry.amount;
        }
        
        // Total per type
        if (transType === 'Elaun') {
            // dah dikira atas
        } else if (transType === 'Advance') {
            totalAdvance += entry.amount;
        } else if (transType === 'Upah') {
            totalUpah += entry.amount;
        } else if (transType === 'Duit Raya') {
            totalDuitRaya += entry.amount;
        } else if (transType === 'Hadiah/Saguhati') {
            totalHadiah += entry.amount;
        } else {
            totalLain += entry.amount;
        }
        
        grandTotal += entry.amount;
        
        ustazTransactions.push({
            date: entry.date,
            month: month,
            year: entryYear,
            ref: entry.ref,
            description: entry.description,
            amount: entry.amount,
            category: entry.category,
            type: transType,
            isElaun: isElaunOnly
        });
    }
    
    // ===== MONTHLY BREAKDOWN (HANYA ELAUN) =====
    html += '<div style="background:#f8fafc;padding:20px;border-radius:14px;margin-bottom:20px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">';
    html += '<h3 style="margin:0;color:#1f2937;">📊 Breakdown Bulanan (Elaun Sahaja)</h3>';
    html += '<span style="background:#dbeafe;color:#1e40af;padding:4px 10px;border-radius:12px;font-size:0.75rem;font-weight:700;">💼 Elaun Bulanan</span>';
    html += '</div>';
    
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;">';
    
    for (var m = 1; m <= 12; m++) {
        var amount = elaunMonthly[m];
        var hasPaid = amount > 0;
        var bg = hasPaid ? 'linear-gradient(135deg,#e9d5ff,#d8b4fe)' : '#fef2f2';
        var color = hasPaid ? '#7c3aed' : '#94a3b8';
        var icon = hasPaid ? '✅' : '❌';
        
        html += '<div style="background:' + bg + ';padding:12px;border-radius:10px;text-align:center;">';
        html += '<div style="font-size:0.75rem;color:#64748b;font-weight:600;margin-bottom:5px;">' + monthLabels[m-1] + '</div>';
        html += '<div style="font-size:1rem;margin-bottom:3px;">' + icon + '</div>';
        html += '<div style="font-size:0.85rem;font-weight:800;color:' + color + ';">RM ' + amount.toLocaleString() + '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    
    // Total Elaun
    html += '<div style="margin-top:15px;text-align:center;background:linear-gradient(135deg,#dbeafe,#bfdbfe);padding:15px;border-radius:10px;">';
    html += '<div style="font-size:0.85rem;color:#1e40af;font-weight:700;">JUMLAH ELAUN ' + year + '</div>';
    html += '<div style="font-size:2rem;font-weight:900;color:#1e40af;">RM ' + totalElaun.toLocaleString() + '</div>';
    html += '</div>';
    html += '</div>';
    
    // ===== STATS BREAKDOWN PER JENIS =====
    html += '<div style="background:white;padding:20px;border-radius:14px;margin-bottom:20px;border:2px solid #e2e8f0;">';
    html += '<h3 style="margin:0 0 15px;color:#1f2937;">💰 Pecahan Per Jenis Bayaran</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">';
    
    var typesSummary = [
        { label: 'Elaun', value: totalElaun, color: '#3b82f6', bg: '#dbeafe', icon: '💼' },
        { label: 'Advance', value: totalAdvance, color: '#8b5cf6', bg: '#ede9fe', icon: '💵' },
        { label: 'Upah', value: totalUpah, color: '#f59e0b', bg: '#fef3c7', icon: '🔨' },
        { label: 'Duit Raya', value: totalDuitRaya, color: '#ec4899', bg: '#fce7f3', icon: '🪙' },
        { label: 'Hadiah', value: totalHadiah, color: '#a78bfa', bg: '#e9d5ff', icon: '🎁' }
    ];
    
    for (var ts = 0; ts < typesSummary.length; ts++) {
        var ts_item = typesSummary[ts];
        if (ts_item.value === 0) continue;
        
        html += '<div style="background:' + ts_item.bg + ';padding:12px;border-radius:10px;text-align:center;">';
        html += '<div style="font-size:1.5rem;margin-bottom:5px;">' + ts_item.icon + '</div>';
        html += '<div style="font-size:0.75rem;color:#64748b;font-weight:600;">' + ts_item.label + '</div>';
        html += '<div style="font-size:1.05rem;font-weight:800;color:' + ts_item.color + ';">RM ' + ts_item.value.toLocaleString() + '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    
    // Grand Total
    html += '<div style="margin-top:15px;text-align:center;background:linear-gradient(135deg,#fef3c7,#fde68a);padding:15px;border-radius:10px;border:2px solid #f59e0b;">';
    html += '<div style="font-size:0.85rem;color:#78350f;font-weight:700;">JUMLAH KESELURUHAN ' + year + '</div>';
    html += '<div style="font-size:2rem;font-weight:900;color:#78350f;">RM ' + grandTotal.toLocaleString() + '</div>';
    html += '<div style="font-size:0.75rem;color:#92400e;margin-top:5px;">(Elaun + Advance + Upah + Duit Raya + Hadiah)</div>';
    html += '</div>';
    html += '</div>';
    
    // ===== SENARAI BAYARAN (Semua dengan badge) =====
    if (ustazTransactions.length > 0) {
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 15px;">';
        html += '<h3 style="margin:0;color:#1f2937;">📝 Senarai Bayaran</h3>';
        html += '<span style="background:#f1f5f9;color:#64748b;padding:4px 10px;border-radius:12px;font-size:0.78rem;font-weight:700;">' + ustazTransactions.length + ' transaksi</span>';
        html += '</div>';
        
        html += '<div style="max-height:400px;overflow-y:auto;">';
        
        ustazTransactions.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        
        var typeColors = {
            'Elaun': { bg: '#dbeafe', color: '#1e40af', icon: '💼' },
            'Advance': { bg: '#ede9fe', color: '#5b21b6', icon: '💵' },
            'Upah': { bg: '#fef3c7', color: '#78350f', icon: '🔨' },
            'Duit Raya': { bg: '#fce7f3', color: '#9d174d', icon: '🪙' },
            'Hadiah/Saguhati': { bg: '#e9d5ff', color: '#7c3aed', icon: '🎁' },
            'Lain-lain': { bg: '#f1f5f9', color: '#64748b', icon: '📦' }
        };
        
        for (var t = 0; t < ustazTransactions.length; t++) {
            var trans = ustazTransactions[t];
            var typeColor = typeColors[trans.type] || typeColors['Lain-lain'];
            
            html += '<div style="background:#f8fafc;padding:12px 15px;border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:12px;border-left:4px solid ' + typeColor.color + ';">';
            
            html += '<div style="flex:1;min-width:0;">';
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">';
            html += '<span style="background:' + typeColor.bg + ';color:' + typeColor.color + ';padding:3px 10px;border-radius:12px;font-size:0.7rem;font-weight:700;">' + typeColor.icon + ' ' + trans.type + '</span>';
            html += '</div>';
            html += '<div style="font-weight:700;color:#1f2937;">' + trans.description + '</div>';
            html += '<div style="font-size:0.78rem;color:#64748b;margin-top:3px;">' + formatDateShortPG(trans.date) + ' • ' + (trans.ref || 'No ref') + '</div>';
            html += '</div>';
            
            html += '<div style="font-weight:800;color:' + typeColor.color + ';font-size:1.05rem;flex-shrink:0;">RM ' + trans.amount.toLocaleString() + '</div>';
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// ===== HELPER: Check if gaji-related =====
function isGajiRelated(cat, desc) {
    return cat.indexOf('GAJI') > -1 || cat.indexOf('ELAUN') > -1 || cat.indexOf('UPAH') > -1 || 
           cat.indexOf('SAGUHATI') > -1 || cat.indexOf('DUIT RAYA') > -1 ||
           desc.indexOf('GAJI') > -1 || desc.indexOf('ELAUN') > -1 || desc.indexOf('UPAH') > -1 ||
           desc.indexOf('ADVANCE') > -1 || desc.indexOf('SAGUHATI') > -1 || 
           desc.indexOf('DUIT RAYA') > -1 || desc.indexOf('HADIAH') > -1;
}

// ===== EXPORT CSV =====
function exportPengurusanGajiCSV() {
    appData = loadData();
    var yearEl = document.getElementById('pgYearFilter');
    var year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();
    
    var transactions = getGajiTransactions(year);
    
    var csv = 'Tarikh,No Ruj,Butiran,Ustaz,Kategori,Jenis,Jumlah\n';
    
    // Fungsi pembantu untuk escape tanda petik (") menjadi ("")
    function escapeCSV(val) {
        if (val === undefined || val === null) return '';
        var str = String(val);
        return str.replace(/"/g, '""');
    }
    
    for (var t = 0; t < transactions.length; t++) {
        var trans = transactions[t];
        
        var safeDate = escapeCSV(trans.date);
        var safeRef = escapeCSV(trans.ref || '');
        var safeDesc = escapeCSV(trans.description);
        var safeUstaz = escapeCSV(trans.ustaz);
        var safeCat = escapeCSV(trans.category);
        var safeType = escapeCSV(trans.type);
        var safeAmount = trans.amount; // Nilai angka tidak memerlukan escape
        
        csv += '"' + safeDate + '","' + safeRef + '","' + safeDesc + '","' + safeUstaz + '","' + safeCat + '","' + safeType + '","' + safeAmount + '"\n';
    }
    
    // Tambah UTF-8 BOM untuk sokongan huruf jawi/aksara khas di Excel
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pengurusan_gaji_' + year + '.csv';
    link.click();
    
    if (typeof showToast === 'function') showToast('✅ CSV berjaya di-export!');
}

// ===== PRINT =====
function printPengurusanGaji() {
    window.print();
}

console.log('✅ Pengurusan Gaji (Upgraded) loaded');

// ===== OVERRIDE: Detection menggunakan SPLIT method =====
window.detectMonthYearFromDescription = function(desc) {
    if (!desc) return { month: null, year: null };
    
    // Split description ikut " - "
    var parts = desc.split(/\s*-\s*/);
    
    var monthMap = {
        'JANUARI': 1, 'JAN': 1, 'JANUARY': 1,
        'FEBRUARI': 2, 'FEB': 2, 'FEBRUARY': 2,
        'MAC': 3, 'MARCH': 3,
        'APRIL': 4, 'APR': 4,
        'MEI': 5, 'MAY': 5,
        'JUN': 6, 'JUNE': 6,
        'JULAI': 7, 'JUL': 7, 'JULY': 7,
        'OGOS': 8, 'OGO': 8, 'AUGUST': 8, 'AUG': 8,
        'SEPTEMBER': 9, 'SEPT': 9, 'SEP': 9,
        'OKTOBER': 10, 'OKT': 10, 'OCTOBER': 10, 'OCT': 10,
        'NOVEMBER': 11, 'NOV': 11,
        'DISEMBER': 12, 'DIS': 12, 'DECEMBER': 12, 'DEC': 12
    };
    
    var detectedMonth = null;
    var detectedYear = null;
    
    // Loop dari belakang (last part biasanya ada "Jun 2024")
    for (var p = parts.length - 1; p >= 0; p--) {
        var part = parts[p].trim().toUpperCase();
        
        // Split jadi words
        var words = part.split(/\s+/);
        
        for (var w = 0; w < words.length; w++) {
            // Clean word - hanya huruf
            var word = words[w].replace(/[^A-Z]/g, '');
            
            // EXACT MATCH dengan month map
            if (monthMap.hasOwnProperty(word)) {
                detectedMonth = monthMap[word];
                
                // Cari year selepas bulan
                if (w + 1 < words.length) {
                    var nextWord = words[w + 1].replace(/[^0-9]/g, '');
                    if (nextWord.length === 4) {
                        var yearNum = parseInt(nextWord);
                        if (yearNum >= 2020 && yearNum <= 2099) {
                            detectedYear = yearNum;
                        }
                    }
                }
                
                break;
            }
        }
        
        if (detectedMonth) break;
    }
    
    // Fallback: cari year dimana-mana
    if (detectedMonth && !detectedYear) {
        var yearMatch = desc.match(/\b(20\d{2})\b/);
        if (yearMatch) {
            detectedYear = parseInt(yearMatch[1]);
        }
    }
    
    return {
        month: detectedMonth,
        year: detectedYear
    };
};

console.log('✅ Detection function overridden (NEW VERSION)');