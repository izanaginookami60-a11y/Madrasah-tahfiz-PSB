// ============================================
// ===== HR SYSTEM - COMPLETE =================
// ============================================

var hrCurrentTab = 'dashboard';

// ============================================
// ===== HR TAB SWITCHING =====================
// ============================================

function switchHRTab(tabName, btn) {
    hrCurrentTab = tabName;

    // Hide ALL hr-tab-content
    var tabs = document.querySelectorAll('.hr-tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
        tabs[i].style.display = 'none';
    }
    
    // ⭐ Hide pengurusan gaji juga
    var pgTab = document.getElementById('tab-pengurusanGaji');
    if (pgTab) {
        pgTab.classList.remove('active');
        pgTab.style.display = 'none';
    }

    // Show selected tab
    var target = document.getElementById('hr-' + tabName);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }

    // Update buttons
    var btns = document.querySelectorAll('.hr-tab-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
        btns[i].style.background = 'transparent';
        btns[i].style.color = '#64748b';
        btns[i].style.boxShadow = 'none';
    }
    if (btn) {
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg,#a78bfa,#8b5cf6)';
        btn.style.color = 'white';
        btn.style.boxShadow = '0 3px 10px rgba(16,185,129,0.3)';
    }

    // Init specific tab
    if (tabName === 'dashboard') renderHRDashboard();
    else if (tabName === 'workers') renderWorkersList();
    else if (tabName === 'records') renderPunchRecordsList();
    else if (tabName === 'payroll') renderPayrollTable();
    else if (tabName === 'leave') renderLeaveList();
    else if (tabName === 'settings') loadHRSettings();
}
// ============================================
// ===== HR DASHBOARD =========================
// ============================================

function renderHRDashboard() {
    appData = loadData();
    if (!appData.workers) appData.workers = [];
    if (!appData.punchRecords) appData.punchRecords = [];

    var today = new Date().toISOString().split('T')[0];
    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();

    // Stats
    var totalWorkers = appData.workers.length;
    var todayPresent = 0;
    var todayHours = 0;
    var monthSalary = 0;
    var todayRecords = [];

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.date === today) {
            todayRecords.push(r);
            todayHours += r.hoursWorked || 0;

            // Count unique workers present
            var alreadyCounted = false;
            for (var j = 0; j < i; j++) {
                if (appData.punchRecords[j].date === today && appData.punchRecords[j].workerId === r.workerId) {
                    alreadyCounted = true;
                    break;
                }
            }
            if (!alreadyCounted) todayPresent++;
        }

        // Month salary estimate
        var rParts = r.date.split('-');
        if (parseInt(rParts[0]) === currentYear && parseInt(rParts[1]) === currentMonth) {
            var worker = getWorkerById(r.workerId);
            if (worker) {
                monthSalary += (r.hoursWorked || 0) * (worker.hourlyRate || 0);
            }
        }
    }

    // Add allowances
    for (var i = 0; i < appData.workers.length; i++) {
        monthSalary += appData.workers[i].allowance || 0;
    }

    // Stats HTML
    var statsEl = document.getElementById('hrStatTotal');
    if (statsEl) statsEl.textContent = totalWorkers;

    var presentEl = document.getElementById('hrStatPresent');
    if (presentEl) presentEl.textContent = todayPresent + '/' + totalWorkers;

    var hoursEl = document.getElementById('hrStatHours');
    if (hoursEl) hoursEl.textContent = todayHours.toFixed(1) + 'j';

    var salaryEl = document.getElementById('hrStatSalary');
    if (salaryEl) salaryEl.textContent = 'RM ' + Math.round(monthSalary);

    // Today Activity
    renderTodayActivity(todayRecords);
}

function renderTodayActivity(records) {
    var container = document.getElementById('hrTodayActivity');
    if (!container) return;

    if (records.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;"><div style="font-size:3rem;margin-bottom:10px;">⏰</div><p>Belum ada aktiviti hari ini</p></div>';
        return;
    }

    // Sort by time
    records.sort(function(a, b) {
        return new Date(a.punchIn) - new Date(b.punchIn);
    });

    var html = '';
    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        var worker = getWorkerById(r.workerId);
        if (!worker) continue;

        var inTime = r.punchIn ? formatTimeHR(new Date(r.punchIn)) : '-';
        var outTime = r.punchOut ? formatTimeHR(new Date(r.punchOut)) : '...';
        var hours = r.hoursWorked ? r.hoursWorked.toFixed(1) + 'j' : '-';

        var statusClass = '';
        var statusIcon = '⏳';
        if (r.punchOut) {
            statusClass = 'completed';
            statusIcon = '✅';
        } else {
            statusClass = 'working';
            statusIcon = '▶️';
        }

        var lateTag = '';
        if (r.isLate) {
            lateTag = '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700;margin-left:5px;">⚠️ Lewat ' + r.lateMinutes + 'min</span>';
        }

        html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:' + (statusClass === 'working' ? '#faf5ff' : '#f8fafc') + ';border-radius:10px;margin-bottom:8px;border-left:4px solid ' + (statusClass === 'working' ? '#a78bfa' : '#e2e8f0') + ';">';
        html += '<div style="font-size:2rem;flex-shrink:0;">' + (worker.icon || '👤') + '</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="font-weight:700;font-size:0.92rem;">' + worker.name + lateTag + '</div>';
        html += '<div style="font-size:0.78rem;color:#64748b;">' + worker.role + ' • ' + (r.shiftName || '-') + '</div>';
        html += '<div style="font-size:0.78rem;color:#64748b;">📥 ' + inTime + ' → 📤 ' + outTime + '</div>';
        html += '</div>';
        html += '<div style="text-align:right;flex-shrink:0;">';
        html += '<div style="font-size:1.1rem;">' + statusIcon + '</div>';
        html += '<div style="font-weight:700;color:#7c3aed;font-size:0.88rem;">' + hours + '</div>';
        html += '</div>';
        html += '</div>';
    }

    container.innerHTML = html;
}

// ============================================
// ===== WORKERS LIST =========================
// ============================================

function renderWorkersList() {
    appData = loadData();
    if (!appData.workers) appData.workers = [];

    var container = document.getElementById('hrWorkersList');
    if (!container) return;

    if (appData.workers.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:50px;color:#94a3b8;"><div style="font-size:4rem;margin-bottom:15px;">👥</div><p style="font-weight:700;margin-bottom:5px;">Tiada pekerja</p><small>Klik "Tambah Pekerja" untuk mula</small></div>';
        return;
    }

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px;">';

    for (var i = 0; i < appData.workers.length; i++) {
        var w = appData.workers[i];

        // Get this month stats
        var monthStats = getWorkerMonthStats(w.id);

        // Determine salary display
        var salaryDisplay = '';
        if (w.salaryType === 'monthly') {
            salaryDisplay = 'RM ' + (w.monthlySalary || 0) + '/bulan';
        } else if (w.salaryType === 'daily') {
            salaryDisplay = 'RM ' + (w.dailyRate || 0) + '/hari';
        } else {
            salaryDisplay = 'RM ' + (w.hourlyRate || 0) + '/jam';
        }

        // Status - check if punched today
        var todayStr = new Date().toISOString().split('T')[0];
        var isWorkingNow = false;
        var hasPunchedToday = false;

        if (appData.punchRecords) {
            for (var j = 0; j < appData.punchRecords.length; j++) {
                var pr = appData.punchRecords[j];
                if (pr.workerId === w.id && pr.date === todayStr) {
                    hasPunchedToday = true;
                    if (!pr.punchOut) isWorkingNow = true;
                }
            }
        }

        var statusBadge = '';
        if (isWorkingNow) {
            statusBadge = '<span style="background:#e9d5ff;color:#5b21b6;padding:3px 10px;border-radius:10px;font-size:0.72rem;font-weight:700;">🟢 Sedang Bekerja</span>';
        } else if (hasPunchedToday) {
            statusBadge = '<span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:10px;font-size:0.72rem;font-weight:700;">✅ Hadir</span>';
        } else {
            statusBadge = '<span style="background:#f1f5f9;color:#64748b;padding:3px 10px;border-radius:10px;font-size:0.72rem;font-weight:700;">⚪ Belum Punch</span>';
        }

        html += '<div style="background:white;border:2px solid #e2e8f0;border-radius:16px;overflow:hidden;transition:all 0.3s;position:relative;">';

        // Header with avatar
        html += '<div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:20px;display:flex;align-items:center;gap:15px;">';
        html += '<div style="width:55px;height:55px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid rgba(255,255,255,0.3);flex-shrink:0;">' + (w.icon || '👤') + '</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="color:white;font-weight:800;font-size:1.05rem;">' + w.name + '</div>';
        html += '<div style="color:rgba(255,255,255,0.85);font-size:0.85rem;">' + w.role + '</div>';
        html += '</div>';
        html += statusBadge;
        html += '</div>';

        // Body
        html += '<div style="padding:18px;">';

        // Info rows
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">';

        html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">📞 Telefon</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;margin-top:3px;">' + (w.phone || '-') + '</div>';
        html += '</div>';

        html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">🔑 Login ID</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;margin-top:3px;">' + (w.loginId || '-') + '</div>';
        html += '</div>';

        html += '<div style="background:#faf5ff;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">💰 Gaji</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;color:#7c3aed;margin-top:3px;">' + salaryDisplay + '</div>';
        html += '</div>';

        html += '<div style="background:#fef3c7;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">⚡ Overtime</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;color:#78350f;margin-top:3px;">RM ' + (w.overtimeRate || 0) + '/jam</div>';
        html += '</div>';

        html += '</div>';

        // Monthly summary
        html += '<div style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);padding:12px;border-radius:10px;margin-bottom:15px;border:1px solid #e9d5ff;">';
        html += '<div style="font-size:0.72rem;color:#7c3aed;font-weight:700;margin-bottom:8px;">📊 BULAN INI</div>';
        html += '<div style="display:flex;justify-content:space-between;font-size:0.82rem;">';
        html += '<span>Hari Kerja: <strong>' + monthStats.days + '</strong></span>';
        html += '<span>Jam: <strong>' + monthStats.hours.toFixed(1) + '</strong></span>';
        html += '<span>Est: <strong style="color:#7c3aed;">RM ' + Math.round(monthStats.salary) + '</strong></span>';
        html += '</div>';
        html += '</div>';

        // Shifts
        if (w.shifts && w.shifts.length > 0) {
            html += '<div style="margin-bottom:15px;">';
            html += '<div style="font-size:0.72rem;color:#64748b;font-weight:700;margin-bottom:6px;">⏰ SHIFT</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:5px;">';
            for (var s = 0; s < w.shifts.length; s++) {
                html += '<span style="background:#f1f5f9;padding:4px 10px;border-radius:8px;font-size:0.72rem;font-weight:600;">';
                html += w.shifts[s].name + ' ' + w.shifts[s].start + '-' + w.shifts[s].end;
                html += '</span>';
            }
            html += '</div>';
            html += '</div>';
        }

        // Action buttons
        html += '<div style="display:flex;gap:8px;">';
        html += '<button onclick="editWorkerHR(\'' + w.id + '\')" style="flex:1;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;padding:10px;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">✏️ Edit</button>';
        html += '<button onclick="sendWorkerWA(\'' + w.id + '\')" style="flex:1;background:linear-gradient(135deg,#25d366,#128c7e);color:white;border:none;padding:10px;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">💬 WA</button>';
        html += '<button onclick="viewWorkerSchedule(\'' + w.id + '\')" style="flex:1;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;padding:10px;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">📅 Shift</button>';
        html += '<button onclick="deleteWorkerHR(\'' + w.id + '\')" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border:none;padding:10px;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;width:44px;">🗑</button>';
        html += '</div>';

        html += '</div>';
        html += '</div>';
    }

    html += '</div>';

    container.innerHTML = html;
}

// ============================================
// ===== WORKER HELPERS =======================
// ============================================

function getWorkerById(workerId) {
    if (!appData.workers) return null;
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].id === workerId) return appData.workers[i];
    }
    return null;
}

function getWorkerMonthStats(workerId) {
    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();
    var worker = getWorkerById(workerId);

    var stats = { days: 0, hours: 0, shifts: 0, salary: 0, deductions: 0 };
    var uniqueDays = {};

    if (!appData.punchRecords) return stats;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId !== workerId) continue;

        var parts = r.date.split('-');
        if (parseInt(parts[0]) !== currentYear || parseInt(parts[1]) !== currentMonth) continue;

        uniqueDays[r.date] = true;
        stats.hours += r.hoursWorked || 0;
        if (r.punchOut) stats.shifts++;
        stats.deductions += (r.lateDeduction || 0) + (r.earlyDeduction || 0);
    }

    stats.days = Object.keys(uniqueDays).length;

    if (worker) {
        if (worker.salaryType === 'monthly') {
            stats.salary = worker.monthlySalary || 0;
        } else if (worker.salaryType === 'daily') {
            stats.salary = stats.days * (worker.dailyRate || 0);
        } else {
            stats.salary = stats.hours * (worker.hourlyRate || 0);
        }
        stats.salary += (worker.allowance || 0);
        stats.salary -= stats.deductions;
    }

    return stats;
}

function editWorkerHR(workerId) {
    // Use existing worker form
    if (typeof editWorker === 'function') {
        editWorker(workerId);
    } else if (typeof openWorkerForm === 'function') {
        // Find worker and populate form
        var worker = getWorkerById(workerId);
        if (!worker) return;

        openWorkerForm();

        // Fill form
        setTimeout(function() {
            document.getElementById('workerEditId').value = worker.id;
            document.getElementById('workerFormTitle').textContent = '✏️ Edit Pekerja';
            document.getElementById('workerName').value = worker.name || '';
            document.getElementById('workerRole').value = worker.role || '';
            document.getElementById('workerIC').value = worker.ic || '';
            document.getElementById('workerPhone').value = worker.phone || '';
            document.getElementById('workerLoginId').value = worker.loginId || '';
            document.getElementById('workerLoginPass').value = worker.loginPass || '';
            document.getElementById('workerSalaryType').value = worker.salaryType || 'hourly';
            document.getElementById('workerHourlyRate').value = worker.hourlyRate || 0;
            document.getElementById('workerOvertimeRate').value = worker.overtimeRate || 0;
            document.getElementById('workerAllowance').value = worker.allowance || 0;
            document.getElementById('workerStartDate').value = worker.startDate || '';
            document.getElementById('workerBank').value = worker.bank || '';
            document.getElementById('workerNotes').value = worker.notes || '';

            if (worker.salaryType === 'monthly') {
                document.getElementById('workerMonthlySalary').value = worker.monthlySalary || 0;
            } else if (worker.salaryType === 'daily') {
                document.getElementById('workerDailyRate').value = worker.dailyRate || 0;
            }

            if (typeof toggleSalaryFields === 'function') toggleSalaryFields();
        }, 200);
    }
}

function deleteWorkerHR(workerId) {
    var worker = getWorkerById(workerId);
    if (!worker) return;

    if (!confirm('⚠️ Padam pekerja "' + worker.name + '"?\n\nSemua punch records pekerja ini juga akan dipadam!\n\nTindakan ini TIDAK boleh diundo!')) return;

    // Remove worker
    appData.workers = appData.workers.filter(function(w) { return w.id !== workerId; });

    // Remove punch records
    if (appData.punchRecords) {
        appData.punchRecords = appData.punchRecords.filter(function(r) { return r.workerId !== workerId; });
    }

    saveData(appData);
    showToast('🗑 Pekerja dipadam');
    renderWorkersList();
    renderHRDashboard();
}

function sendWorkerWA(workerId) {
    var worker = getWorkerById(workerId);
    if (!worker || !worker.phone) {
        showToast('❌ Tiada no telefon');
        return;
    }

    var phone = worker.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '60' + phone.substring(1);

    var msg = 'Assalamualaikum ' + worker.name + ',\n\nIni mesej dari Madrasah Tahfiz PSB.';
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

function viewWorkerSchedule(workerId) {
    var worker = getWorkerById(workerId);
    if (!worker) return;

    var shifts = worker.shifts || [];
    var msg = '📅 SHIFT SCHEDULE\n\n';
    msg += '👤 ' + worker.name + ' (' + worker.role + ')\n\n';

    if (shifts.length === 0) {
        msg += 'Tiada shift ditetapkan.';
    } else {
        for (var i = 0; i < shifts.length; i++) {
            msg += '⏰ ' + shifts[i].name + ': ' + shifts[i].start + ' - ' + shifts[i].end + '\n';
        }
    }

    alert(msg);
}

// ============================================
// ===== PUNCH RECORDS ========================
// ============================================


function renderPunchRecordsList() {
    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var container = document.getElementById('hrPunchRecordsBody');
    if (!container) return;

    // Get filters
    var workerFilter = document.getElementById('hrFilterWorker') ? document.getElementById('hrFilterWorker').value : 'all';
    var monthFilter = document.getElementById('hrFilterMonth') ? document.getElementById('hrFilterMonth').value : String(new Date().getMonth() + 1);
    var yearFilter = document.getElementById('hrFilterYear') ? document.getElementById('hrFilterYear').value : String(new Date().getFullYear());
    var statusFilter = document.getElementById('hrFilterStatus') ? document.getElementById('hrFilterStatus').value : 'all';

    // Populate worker dropdown if empty
    var workerDropdown = document.getElementById('hrFilterWorker');
    if (workerDropdown && workerDropdown.options.length <= 1) {
        var html = '<option value="all">Semua Pekerja</option>';
        for (var i = 0; i < appData.workers.length; i++) {
            html += '<option value="' + appData.workers[i].id + '">' + appData.workers[i].name + '</option>';
        }
        workerDropdown.innerHTML = html;
    }

    // Populate year dropdown if empty or missing data years
    var yearDropdown = document.getElementById('hrFilterYear');
    if (yearDropdown) {
        var currentYear = new Date().getFullYear();
        var yearsMap = {};
        yearsMap[currentYear] = true;
        yearsMap[currentYear - 1] = true;
        yearsMap[currentYear + 1] = true;

        // Scan punch records untuk tahun sebenar
        for (var i = 0; i < appData.punchRecords.length; i++) {
            var r = appData.punchRecords[i];
            if (r && r.date) {
                var y = parseInt(r.date.split('-')[0]);
                if (y && y > 2020 && y < 2030) {
                    yearsMap[y] = true;
                }
            }
        }

        var yearKeys = Object.keys(yearsMap).sort(function(a, b) { return b - a; });

        // Find default year (year with most records)
        var defaultYear = currentYear;
        var maxCount = 0;
        for (var yk = 0; yk < yearKeys.length; yk++) {
            var count = 0;
            var yr = parseInt(yearKeys[yk]);
            for (var j = 0; j < appData.punchRecords.length; j++) {
                if (appData.punchRecords[j].date && parseInt(appData.punchRecords[j].date.split('-')[0]) === yr) {
                    count++;
                }
            }
            if (count > maxCount) {
                maxCount = count;
                defaultYear = yr;
            }
        }

        // Only rebuild if current value not in options or options empty
        var currentValue = yearDropdown.value;
        var needRebuild = yearDropdown.options.length === 0;
        if (!needRebuild) {
            var hasValue = false;
            for (var i = 0; i < yearDropdown.options.length; i++) {
                if (yearDropdown.options[i].value === String(defaultYear)) hasValue = true;
            }
            if (!hasValue) needRebuild = true;
        }

        if (needRebuild) {
            var html = '';
            for (var i = 0; i < yearKeys.length; i++) {
                var selected = parseInt(yearKeys[i]) === defaultYear ? ' selected' : '';
                html += '<option value="' + yearKeys[i] + '"' + selected + '>' + yearKeys[i] + '</option>';
            }
            yearDropdown.innerHTML = html;
            yearFilter = String(defaultYear);
        }
    }

    // Safety: parse filters
    var mFilter = parseInt(monthFilter);
    var yFilter = parseInt(yearFilter);
    if (isNaN(mFilter)) mFilter = new Date().getMonth() + 1;
    if (isNaN(yFilter)) yFilter = new Date().getFullYear();

    // Filter records
    var filtered = appData.punchRecords.filter(function(r) {
        if (!r || !r.date) return false;
        if (workerFilter !== 'all' && r.workerId !== workerFilter) return false;

        var parts = r.date.split('-');
        if (parseInt(parts[1]) !== mFilter) return false;
        if (parseInt(parts[0]) !== yFilter) return false;

        if (statusFilter === 'pending' && r.status !== 'pending') return false;
        if (statusFilter === 'approved' && r.status !== 'approved') return false;

        return true;
    });

    // Sort newest first
    filtered.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

    // Update count
    var countEl = document.getElementById('hrRecordCount');
    if (countEl) countEl.textContent = filtered.length + ' rekod';

    if (filtered.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#94a3b8;"><div style="font-size:3rem;margin-bottom:10px;">📭</div><p style="font-weight:700;">Tiada rekod untuk bulan/tahun ini</p><small>Cuba tukar filter bulan atau tahun</small></td></tr>';
        return;
    }

    var months = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep','Okt','Nov','Dis'];
    var html = '';

    for (var i = 0; i < filtered.length; i++) {
        var r = filtered[i];
        var worker = getWorkerById(r.workerId);
        var d = new Date(r.date);

        var inTime = r.punchIn ? formatTimeHR(new Date(r.punchIn)) : '-';
        var outTime = r.punchOut ? formatTimeHR(new Date(r.punchOut)) : '-';
        var hours = r.hoursWorked ? r.hoursWorked.toFixed(1) : '-';

        var statusBadge = '';
        if (r.status === 'approved') {
            statusBadge = '<span style="background:#e9d5ff;color:#5b21b6;padding:3px 10px;border-radius:12px;font-size:0.72rem;font-weight:700;">✅ OK</span>';
        } else {
            statusBadge = '<span style="background:#fef3c7;color:#78350f;padding:3px 10px;border-radius:12px;font-size:0.72rem;font-weight:700;">⏳ Pending</span>';
        }

        var lateTag = '';
        if (r.isLate) {
            lateTag = '<div style="font-size:0.68rem;color:#dc2626;font-weight:600;">⚠️ Lewat ' + r.lateMinutes + 'min</div>';
        }

        html += '<tr>';
        html += '<td><strong>' + d.getDate() + ' ' + months[d.getMonth()] + '</strong></td>';
        html += '<td>' + (worker ? worker.name : (r.workerName || 'Unknown')) + '<br><small style="color:#64748b;">' + (worker ? worker.role : '') + '</small></td>';
        html += '<td>' + (r.shiftName || '-') + '</td>';
        html += '<td style="color:#7c3aed;font-weight:600;">' + inTime + '</td>';
        html += '<td style="color:#dc2626;font-weight:600;">' + outTime + '</td>';
        html += '<td><strong>' + hours + '</strong>' + lateTag + '</td>';
        html += '<td>' + statusBadge + '</td>';
        html += '<td>';
        if (r.status !== 'approved') {
            html += '<button onclick="approvePunchRecord(\'' + r.id + '\')" style="background:#a78bfa;color:white;border:none;padding:5px 10px;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;margin-right:4px;">✅</button>';
        }
        html += '<button onclick="deletePunchRecord(\'' + r.id + '\')" style="background:#ef4444;color:white;border:none;padding:5px 10px;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;">🗑</button>';
        html += '</td>';
        html += '</tr>';
    }

    container.innerHTML = html;
}

function approvePunchRecord(recordId) {
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].id === recordId) {
            appData.punchRecords[i].status = 'approved';
            saveData(appData);
            showToast('✅ Record approved');
            renderPunchRecordsList();
            return;
        }
    }
}

function deletePunchRecord(recordId) {
    if (!confirm('Padam punch record ini?')) return;

    appData.punchRecords = appData.punchRecords.filter(function(r) { return r.id !== recordId; });
    saveData(appData);
    showToast('🗑 Record dipadam');
    renderPunchRecordsList();
}

function approveAllPendingHR() {
    var count = 0;
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].status === 'pending') {
            appData.punchRecords[i].status = 'approved';
            count++;
        }
    }
    saveData(appData);
    showToast('✅ ' + count + ' records approved');
    renderPunchRecordsList();
}

// ============================================
// ===== PAYROLL ==============================
// ============================================

function renderPayrollTable() {
    appData = loadData();
    var container = document.getElementById('hrPayrollContent');
    if (!container) return;

    var monthEl = document.getElementById('hrPayrollMonth');
    var yearEl = document.getElementById('hrPayrollYear');

    var month = monthEl ? parseInt(monthEl.value) : new Date().getMonth() + 1;
    var year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();

    var monthNames = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    if (!appData.workers || appData.workers.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;">Tiada pekerja</div>';
        return;
    }

    var html = '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
    html += '<thead><tr style="background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;">';
    html += '<th style="padding:12px;text-align:left;">Pekerja</th>';
    html += '<th style="padding:12px;text-align:center;">Hari</th>';
    html += '<th style="padding:12px;text-align:center;">Jam</th>';
    html += '<th style="padding:12px;text-align:center;">Shift</th>';
    html += '<th style="padding:12px;text-align:right;">Gaji Asas</th>';
    html += '<th style="padding:12px;text-align:right;">Elaun</th>';
    html += '<th style="padding:12px;text-align:right;">Potongan</th>';
    html += '<th style="padding:12px;text-align:right;font-weight:800;">Gaji Bersih</th>';
    html += '<th style="padding:12px;text-align:center;">Tindakan</th>';
    html += '</tr></thead><tbody>';

    var grandTotal = 0;

    for (var i = 0; i < appData.workers.length; i++) {
        var w = appData.workers[i];
        var stats = getWorkerMonthStatsForMonth(w.id, month, year);

        var baseSalary = 0;
        if (w.salaryType === 'monthly') {
            baseSalary = w.monthlySalary || 0;
        } else if (w.salaryType === 'daily') {
            baseSalary = stats.days * (w.dailyRate || 0);
        } else {
            baseSalary = stats.hours * (w.hourlyRate || 0);
        }

        var allowance = w.allowance || 0;
        var deductions = stats.deductions;
        var netSalary = baseSalary + allowance - deductions;
        grandTotal += netSalary;

        html += '<tr style="border-bottom:1px solid #e2e8f0;">';
        html += '<td style="padding:12px;"><div style="font-weight:700;">' + w.name + '</div><div style="font-size:0.78rem;color:#64748b;">' + w.role + '</div></td>';
        html += '<td style="padding:12px;text-align:center;font-weight:600;">' + stats.days + '</td>';
        html += '<td style="padding:12px;text-align:center;font-weight:600;">' + stats.hours.toFixed(1) + '</td>';
        html += '<td style="padding:12px;text-align:center;">' + stats.shifts + '</td>';
        html += '<td style="padding:12px;text-align:right;font-weight:600;">RM ' + baseSalary.toFixed(2) + '</td>';
        html += '<td style="padding:12px;text-align:right;color:#7c3aed;">RM ' + allowance.toFixed(2) + '</td>';
        html += '<td style="padding:12px;text-align:right;color:#dc2626;">RM ' + deductions.toFixed(2) + '</td>';
        html += '<td style="padding:12px;text-align:right;font-weight:800;font-size:1rem;color:#7c3aed;">RM ' + netSalary.toFixed(2) + '</td>';
        html += '<td style="padding:12px;text-align:center;">';
        html += '<button onclick="viewSalarySlipHR(\'' + w.id + '\',' + month + ',' + year + ')" style="background:#3b82f6;color:white;border:none;padding:6px 12px;border-radius:6px;font-size:0.78rem;font-weight:700;cursor:pointer;">📄 Slip</button>';
        html += '</td>';
        html += '</tr>';
    }

    // Grand total
    html += '<tr style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);border-top:3px double #7c3aed;">';
    html += '<td colspan="7" style="padding:14px;text-align:right;font-weight:800;font-size:1rem;color:#7c3aed;">JUMLAH GAJI ' + monthNames[month].toUpperCase() + ' ' + year + '</td>';
    html += '<td style="padding:14px;text-align:right;font-weight:900;font-size:1.1rem;color:#7c3aed;">RM ' + grandTotal.toFixed(2) + '</td>';
    html += '<td></td>';
    html += '</tr>';

    html += '</tbody></table>';

    container.innerHTML = html;
}

function getWorkerMonthStatsForMonth(workerId, month, year) {
    var stats = { days: 0, hours: 0, shifts: 0, deductions: 0 };
    var uniqueDays = {};

    if (!appData.punchRecords) return stats;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId !== workerId) continue;

        var parts = r.date.split('-');
        if (parseInt(parts[0]) !== year || parseInt(parts[1]) !== month) continue;

        uniqueDays[r.date] = true;
        stats.hours += r.hoursWorked || 0;
        if (r.punchOut) stats.shifts++;
        stats.deductions += (r.lateDeduction || 0) + (r.earlyDeduction || 0) + (r.totalDeduction || 0);
    }

    stats.days = Object.keys(uniqueDays).length;
    return stats;
}

function viewSalarySlipHR(workerId, month, year) {
    alert('📄 Slip Gaji - Coming soon!\n\nWorker: ' + workerId + '\nBulan: ' + month + '/' + year);
}

// ============================================
// ===== LEAVE MANAGEMENT =====================
// ============================================

function renderLeaveList() {
    appData = loadData();
    if (!appData.leaves) appData.leaves = [];

    var container = document.getElementById('hrLeaveList');
    if (!container) return;

    if (appData.leaves.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;"><div style="font-size:3rem;margin-bottom:10px;">🏖️</div><p>Tiada rekod cuti</p></div>';
        return;
    }

    var sorted = appData.leaves.slice().sort(function(a, b) {
        return new Date(b.startDate) - new Date(a.startDate);
    });

    var typeColors = {
        annual: { bg: '#e9d5ff', border: '#a78bfa', icon: '🏖️', label: 'Cuti Tahunan' },
        mc: { bg: '#fee2e2', border: '#ef4444', icon: '🏥', label: 'MC' },
        emergency: { bg: '#fef3c7', border: '#f59e0b', icon: '⚠️', label: 'Kecemasan' },
        unpaid: { bg: '#f1f5f9', border: '#64748b', icon: '💸', label: 'Tanpa Gaji' },
        public: { bg: '#ede9fe', border: '#8b5cf6', icon: '🎉', label: 'Cuti Umum' }
    };

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
        var l = sorted[i];
        var worker = getWorkerById(l.workerId);
        var type = typeColors[l.type] || typeColors.annual;

        html += '<div style="background:' + type.bg + ';border-left:4px solid ' + type.border + ';border-radius:10px;padding:15px;margin-bottom:10px;display:flex;align-items:center;gap:15px;">';
        html += '<div style="font-size:2rem;">' + type.icon + '</div>';
        html += '<div style="flex:1;">';
        html += '<div style="font-weight:700;">' + (worker ? worker.name : 'Unknown') + '</div>';
        html += '<div style="font-size:0.82rem;color:#64748b;">' + type.label + ' • ' + l.startDate + ' → ' + l.endDate + '</div>';
        if (l.reason) html += '<div style="font-size:0.78rem;color:#475569;margin-top:3px;font-style:italic;">' + l.reason + '</div>';
        html += '</div>';
        html += '<button onclick="deleteLeaveHR(' + i + ')" style="background:#ef4444;color:white;border:none;padding:6px;border-radius:6px;cursor:pointer;">🗑</button>';
        html += '</div>';
    }

    container.innerHTML = html;
}

function deleteLeaveHR(index) {
    if (!confirm('Padam rekod cuti ini?')) return;
    appData.leaves.splice(index, 1);
    saveData(appData);
    showToast('🗑 Cuti dipadam');
    renderLeaveList();
}

// ============================================
// ===== HR SETTINGS ==========================
// ============================================

function loadHRSettings() {
    appData = loadData();
    if (!appData.punchSettings) appData.punchSettings = {};

    var s = appData.punchSettings;

    var nameEl = document.getElementById('hrSettingLocName');
    var latEl = document.getElementById('hrSettingLat');
    var lngEl = document.getElementById('hrSettingLng');
    var radiusEl = document.getElementById('hrSettingRadius');
    var waEl = document.getElementById('hrSettingAdminWA');

    if (nameEl) nameEl.value = s.locationName || 'Madrasah Tahfiz PSB';
    if (latEl) latEl.value = s.lat || '';
    if (lngEl) lngEl.value = s.lng || '';
    if (radiusEl) radiusEl.value = s.radius || 500;
    if (waEl) waEl.value = s.adminWhatsApp || '';

    // Update display
    var displayName = document.getElementById('hrDisplayLocName');
    var displayCoords = document.getElementById('hrDisplayCoords');
    var displayRadius = document.getElementById('hrDisplayRadius');
    var displayWA = document.getElementById('hrDisplayWA');

    if (displayName) displayName.textContent = s.locationName || '-';
    if (displayCoords) displayCoords.textContent = s.lat ? s.lat + ', ' + s.lng : '-';
    if (displayRadius) displayRadius.textContent = (s.radius || 500) + 'm';
    if (displayWA) displayWA.textContent = s.adminWhatsApp || '-';

    // Punch link
    var linkEl = document.getElementById('hrPunchLink');
    if (linkEl) {
        var baseUrl = window.location.origin;
        linkEl.textContent = baseUrl + '/punch.html';
    }
}

function saveHRSettings() {
    if (!appData.punchSettings) appData.punchSettings = {};

    var nameEl = document.getElementById('hrSettingLocName');
    var latEl = document.getElementById('hrSettingLat');
    var lngEl = document.getElementById('hrSettingLng');
    var radiusEl = document.getElementById('hrSettingRadius');
    var waEl = document.getElementById('hrSettingAdminWA');

    if (nameEl) appData.punchSettings.locationName = nameEl.value.trim();
    if (latEl) appData.punchSettings.lat = parseFloat(latEl.value) || 0;
    if (lngEl) appData.punchSettings.lng = parseFloat(lngEl.value) || 0;
    if (radiusEl) appData.punchSettings.radius = parseInt(radiusEl.value) || 500;
    if (waEl) appData.punchSettings.adminWhatsApp = waEl.value.trim();

    saveData(appData);
    showToast('✅ Tetapan HR disimpan');
    loadHRSettings();
}

function getMyLocationHR() {
    if (!navigator.geolocation) {
        showToast('❌ GPS tidak disokong');
        return;
    }

    showToast('📍 Mendapatkan lokasi...');

    navigator.geolocation.getCurrentPosition(function(pos) {
        document.getElementById('hrSettingLat').value = pos.coords.latitude.toFixed(6);
        document.getElementById('hrSettingLng').value = pos.coords.longitude.toFixed(6);
        showToast('✅ Lokasi diperolehi!');
    }, function(err) {
        showToast('❌ GPS error: ' + err.message);
    }, { enableHighAccuracy: true, timeout: 10000 });
}

function copyPunchLinkHR() {
    var link = document.getElementById('hrPunchLink').textContent;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(function() {
            showToast('✅ Link disalin!');
        });
    } else {
        showToast('Link: ' + link);
    }
}

function sharePunchLinkWAHR() {
    var link = document.getElementById('hrPunchLink').textContent;
    var msg = '📱 PUNCH CARD SYSTEM\n\nGunakan link ini untuk punch in/out:\n' + link + '\n\nLogin dengan ID dan password anda.';
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// ============================================
// ===== HELPERS ==============================
// ============================================

function formatTimeHR(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return hours + ':' + String(minutes).padStart(2, '0') + ' ' + ampm;
}

// ============================================
// ===== INIT HR TAB ==========================
// ============================================

function initHRSystem() {
    // Populate year dropdowns
    var yearDropdowns = ['hrFilterYear', 'hrPayrollYear'];
    var currentYear = new Date().getFullYear();

    for (var d = 0; d < yearDropdowns.length; d++) {
        var el = document.getElementById(yearDropdowns[d]);
        if (el && el.options.length === 0) {
            var html = '';
            for (var y = currentYear + 1; y >= currentYear - 2; y--) {
                html += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
            }
            el.innerHTML = html;
        }
    }

    // Set current month
    var monthDropdowns = ['hrFilterMonth', 'hrPayrollMonth'];
    var currentMonth = new Date().getMonth() + 1;

    for (var d = 0; d < monthDropdowns.length; d++) {
        var el = document.getElementById(monthDropdowns[d]);
        if (el) el.value = String(currentMonth);
    }

    // Render dashboard
    renderHRDashboard();
}

console.log('✅ HR System loaded');

// ============================================
// ===== WORKER STATUS MANAGEMENT =============
// ============================================

// Toggle resign fields
function onEmployStatusChange() {
    var status = document.getElementById('workerEmployStatus').value;
    var resignDate = document.getElementById('resignedDateGroup');
    var resignReason = document.getElementById('resignReasonGroup');

    if (status === 'resigned' || status === 'terminated') {
        if (resignDate) resignDate.classList.remove('hidden');
        if (resignReason) resignReason.classList.remove('hidden');
    } else {
        if (resignDate) resignDate.classList.add('hidden');
        if (resignReason) resignReason.classList.add('hidden');
    }
}

// Attach listener
document.addEventListener('DOMContentLoaded', function() {
    var statusEl = document.getElementById('workerEmployStatus');
    if (statusEl) {
        statusEl.addEventListener('change', onEmployStatusChange);
    }
});

// ============================================
// ===== UPDATE SAVE WORKER ===================
// ============================================

// Override saveWorker to include new fields
var _originalSaveWorker = window.saveWorker;
window.saveWorker = function(event) {
    event.preventDefault();

    appData = loadData();
    if (!appData.workers) appData.workers = [];

    var editId = document.getElementById('workerEditId').value;

    // Get all form values
    var workerData = {
        id: editId || 'WRK' + Date.now(),
        name: document.getElementById('workerName').value.trim(),
        role: document.getElementById('workerRole').value,
        ic: document.getElementById('workerIC') ? document.getElementById('workerIC').value.trim() : '',
        phone: document.getElementById('workerPhone').value.trim(),
        loginId: document.getElementById('workerLoginId').value.trim(),
        loginPass: document.getElementById('workerLoginPass').value.trim(),
        salaryType: document.getElementById('workerSalaryType').value,
        hourlyRate: parseFloat(document.getElementById('workerHourlyRate').value) || 0,
        overtimeRate: parseFloat(document.getElementById('workerOvertimeRate').value) || 0,
        allowance: parseFloat(document.getElementById('workerAllowance').value) || 0,
        startDate: document.getElementById('workerStartDate') ? document.getElementById('workerStartDate').value : '',
        bank: document.getElementById('workerBank') ? document.getElementById('workerBank').value.trim() : '',
        notes: document.getElementById('workerNotes') ? document.getElementById('workerNotes').value.trim() : '',

        // Salary type specifics
        monthlySalary: parseFloat(document.getElementById('workerMonthlySalary') ? document.getElementById('workerMonthlySalary').value : 0) || 0,
        dailyRate: parseFloat(document.getElementById('workerDailyRate') ? document.getElementById('workerDailyRate').value : 0) || 0,

        // NEW: Employment status
        employStatus: document.getElementById('workerEmployStatus') ? document.getElementById('workerEmployStatus').value : 'active',
        endDate: document.getElementById('workerEndDate') ? document.getElementById('workerEndDate').value : '',
        resignReason: document.getElementById('workerResignReason') ? document.getElementById('workerResignReason').value.trim() : '',

        updatedAt: new Date().toISOString()
    };

    // Set icon based on role
    var roleIcons = {
        'Warden': '👮',
        'Tukang Masak': '👨‍🍳',
        'Ustaz Quran': '👨‍🏫',
        'Ustazah': '👩‍🏫',
        'Pengetua': '👔',
        'Pembantu Am': '🧹',
        'Pemandu': '🚗',
        'Pengawal Keselamatan': '💂'
    };
    workerData.icon = roleIcons[workerData.role] || '👤';

    if (editId) {
        // Update existing
        for (var i = 0; i < appData.workers.length; i++) {
            if (appData.workers[i].id === editId) {
                // Keep existing shifts and other data
                workerData.shifts = appData.workers[i].shifts || [];
                workerData.workDays = appData.workers[i].workDays || ['mon','tue','wed','thu','fri'];
                workerData.createdAt = appData.workers[i].createdAt || new Date().toISOString();
                appData.workers[i] = workerData;
                break;
            }
        }
        showToast('✅ Pekerja dikemaskini');
    } else {
        // Add new
        workerData.createdAt = new Date().toISOString();

        // Auto-assign shifts based on role
        if (typeof getDefaultShiftsForRole === 'function') {
            workerData.shifts = getDefaultShiftsForRole(workerData.role);
        }
        workerData.workDays = ['mon','tue','wed','thu','fri'];

        appData.workers.push(workerData);
        showToast('✅ Pekerja baru ditambah');
    }

    saveData(appData);

    // Close form
    if (typeof closeWorkerForm === 'function') {
        closeWorkerForm();
    }

    // Refresh lists
    if (typeof renderWorkersList === 'function') renderWorkersList();
    if (typeof renderHRDashboard === 'function') renderHRDashboard();
};

// ============================================
// ===== UPDATE EDIT WORKER ===================
// ============================================

var _origEditWorkerHR = window.editWorkerHR;
window.editWorkerHR = function(workerId) {
    var worker = getWorkerById(workerId);
    if (!worker) return;

    if (typeof openWorkerForm === 'function') {
        openWorkerForm();
    }

    setTimeout(function() {
        document.getElementById('workerEditId').value = worker.id;
        document.getElementById('workerFormTitle').textContent = '✏️ Edit Pekerja';
        document.getElementById('workerName').value = worker.name || '';
        document.getElementById('workerRole').value = worker.role || '';

        if (document.getElementById('workerIC'))
            document.getElementById('workerIC').value = worker.ic || '';

        document.getElementById('workerPhone').value = worker.phone || '';
        document.getElementById('workerLoginId').value = worker.loginId || '';
        document.getElementById('workerLoginPass').value = worker.loginPass || '';
        document.getElementById('workerSalaryType').value = worker.salaryType || 'hourly';
        document.getElementById('workerHourlyRate').value = worker.hourlyRate || 0;
        document.getElementById('workerOvertimeRate').value = worker.overtimeRate || 0;
        document.getElementById('workerAllowance').value = worker.allowance || 0;

        if (document.getElementById('workerStartDate'))
            document.getElementById('workerStartDate').value = worker.startDate || '';

        if (document.getElementById('workerBank'))
            document.getElementById('workerBank').value = worker.bank || '';

        if (document.getElementById('workerNotes'))
            document.getElementById('workerNotes').value = worker.notes || '';

        if (document.getElementById('workerMonthlySalary'))
            document.getElementById('workerMonthlySalary').value = worker.monthlySalary || 0;

        if (document.getElementById('workerDailyRate'))
            document.getElementById('workerDailyRate').value = worker.dailyRate || 0;

        // NEW: Employment status
        if (document.getElementById('workerEmployStatus'))
            document.getElementById('workerEmployStatus').value = worker.employStatus || 'active';

        if (document.getElementById('workerEndDate'))
            document.getElementById('workerEndDate').value = worker.endDate || '';

        if (document.getElementById('workerResignReason'))
            document.getElementById('workerResignReason').value = worker.resignReason || '';

        if (typeof toggleSalaryFields === 'function') toggleSalaryFields();
        onEmployStatusChange();
    }, 200);
};

// ============================================
// ===== UPDATE WORKERS LIST DISPLAY ==========
// ============================================

// Override to show active/resigned status
var _origRenderWorkersList = window.renderWorkersList;
window.renderWorkersList = function() {
    appData = loadData();
    if (!appData.workers) appData.workers = [];

    var container = document.getElementById('hrWorkersList');
    if (!container) return;

    // Separate active and resigned
    var activeWorkers = [];
    var resignedWorkers = [];

    for (var i = 0; i < appData.workers.length; i++) {
        var w = appData.workers[i];
        if (w.employStatus === 'resigned' || w.employStatus === 'terminated') {
            resignedWorkers.push(w);
        } else {
            activeWorkers.push(w);
        }
    }

    if (appData.workers.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:50px;color:#94a3b8;"><div style="font-size:4rem;margin-bottom:15px;">👥</div><p style="font-weight:700;">Tiada pekerja</p></div>';
        return;
    }

    var html = '';

    // ACTIVE WORKERS
    if (activeWorkers.length > 0) {
        html += '<div style="margin-bottom:10px;display:flex;align-items:center;gap:10px;">';
        html += '<h3 style="color:#7c3aed;font-size:1rem;margin:0;">🟢 Pekerja Aktif (' + activeWorkers.length + ')</h3>';
        html += '</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px;margin-bottom:30px;">';
        html += buildWorkerCards(activeWorkers, false);
        html += '</div>';
    }

    // RESIGNED WORKERS
    if (resignedWorkers.length > 0) {
        html += '<div style="margin-bottom:10px;display:flex;align-items:center;gap:10px;">';
        html += '<h3 style="color:#64748b;font-size:1rem;margin:0;">🔴 Pekerja Berhenti (' + resignedWorkers.length + ')</h3>';
        html += '<small style="color:#94a3b8;">Rekod disimpan untuk rujukan</small>';
        html += '</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px;opacity:0.75;">';
        html += buildWorkerCards(resignedWorkers, true);
        html += '</div>';
    }

    container.innerHTML = html;
};

function buildWorkerCards(workers, isResigned) {
    var html = '';
    var todayStr = new Date().toISOString().split('T')[0];

    for (var i = 0; i < workers.length; i++) {
        var w = workers[i];
        var monthStats = getWorkerMonthStats(w.id);

        // Salary display
        var salaryDisplay = '';
        if (w.salaryType === 'monthly') {
            salaryDisplay = 'RM ' + (w.monthlySalary || 0) + '/bulan';
        } else if (w.salaryType === 'daily') {
            salaryDisplay = 'RM ' + (w.dailyRate || 0) + '/hari';
        } else {
            salaryDisplay = 'RM ' + (w.hourlyRate || 0) + '/jam';
        }

        // Status badge
        var statusBadge = '';
        if (isResigned) {
            var endDateStr = w.endDate ? ' • Tamat: ' + w.endDate : '';
            statusBadge = '<span style="background:#fee2e2;color:#991b1b;padding:3px 10px;border-radius:10px;font-size:0.72rem;font-weight:700;">🔴 Berhenti' + endDateStr + '</span>';
        } else {
            // Check punch status
            var isWorkingNow = false;
            var hasPunchedToday = false;
            if (appData.punchRecords) {
                for (var j = 0; j < appData.punchRecords.length; j++) {
                    var pr = appData.punchRecords[j];
                    if (pr.workerId === w.id && pr.date === todayStr) {
                        hasPunchedToday = true;
                        if (!pr.punchOut) isWorkingNow = true;
                    }
                }
            }

            if (isWorkingNow) {
                statusBadge = '<span style="background:#e9d5ff;color:#5b21b6;padding:3px 10px;border-radius:10px;font-size:0.72rem;font-weight:700;">🟢 Sedang Bekerja</span>';
            } else if (hasPunchedToday) {
                statusBadge = '<span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:10px;font-size:0.72rem;font-weight:700;">✅ Hadir</span>';
            } else {
                statusBadge = '<span style="background:#f1f5f9;color:#64748b;padding:3px 10px;border-radius:10px;font-size:0.72rem;font-weight:700;">⚪ Belum Punch</span>';
            }
        }

        // Header bg color
        var headerBg = isResigned ? 'linear-gradient(135deg,#475569,#334155)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)';

        html += '<div style="background:white;border:2px solid ' + (isResigned ? '#94a3b8' : '#e2e8f0') + ';border-radius:16px;overflow:hidden;">';

        // Header
        html += '<div style="background:' + headerBg + ';padding:20px;display:flex;align-items:center;gap:15px;">';
        html += '<div style="width:55px;height:55px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid rgba(255,255,255,0.3);flex-shrink:0;">' + (w.icon || '👤') + '</div>';
        html += '<div style="flex:1;">';
        html += '<div style="color:white;font-weight:800;font-size:1.05rem;">' + w.name + '</div>';
        html += '<div style="color:rgba(255,255,255,0.85);font-size:0.85rem;">' + w.role + '</div>';
        if (w.startDate) {
            html += '<div style="color:rgba(255,255,255,0.7);font-size:0.72rem;margin-top:3px;">📅 Mula: ' + w.startDate + '</div>';
        }
        html += '</div>';
        html += statusBadge;
        html += '</div>';

        // Body
        html += '<div style="padding:18px;">';

        // Info grid
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">';

        html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">📞 Telefon</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;margin-top:3px;">' + (w.phone || '-') + '</div>';
        html += '</div>';

        html += '<div style="background:#f8fafc;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">🔑 Login ID</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;margin-top:3px;">' + (w.loginId || '-') + '</div>';
        html += '</div>';

        html += '<div style="background:#faf5ff;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">💰 Gaji</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;color:#7c3aed;margin-top:3px;">' + salaryDisplay + '</div>';
        html += '</div>';

        html += '<div style="background:#fef3c7;padding:10px;border-radius:8px;">';
        html += '<div style="font-size:0.72rem;color:#64748b;font-weight:600;">⚡ Overtime</div>';
        html += '<div style="font-weight:700;font-size:0.88rem;color:#78350f;margin-top:3px;">RM ' + (w.overtimeRate || 0) + '/jam</div>';
        html += '</div>';

        html += '</div>';

        // Resigned info
        if (isResigned && w.resignReason) {
            html += '<div style="background:#fef2f2;padding:10px;border-radius:8px;margin-bottom:15px;border-left:4px solid #ef4444;">';
            html += '<div style="font-size:0.72rem;color:#991b1b;font-weight:700;">Sebab Berhenti:</div>';
            html += '<div style="font-size:0.82rem;color:#1f2937;margin-top:3px;">' + w.resignReason + '</div>';
            html += '</div>';
        }

        // Monthly summary (only for active)
        if (!isResigned) {
            html += '<div style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);padding:12px;border-radius:10px;margin-bottom:15px;border:1px solid #e9d5ff;">';
            html += '<div style="font-size:0.72rem;color:#7c3aed;font-weight:700;margin-bottom:8px;">📊 BULAN INI</div>';
            html += '<div style="display:flex;justify-content:space-between;font-size:0.82rem;">';
            html += '<span>Hari: <strong>' + monthStats.days + '</strong></span>';
            html += '<span>Jam: <strong>' + monthStats.hours.toFixed(1) + '</strong></span>';
            html += '<span>Est: <strong style="color:#7c3aed;">RM ' + Math.round(monthStats.salary) + '</strong></span>';
            html += '</div>';
            html += '</div>';
        }

        // Shifts
        if (w.shifts && w.shifts.length > 0) {
            html += '<div style="margin-bottom:15px;">';
            html += '<div style="font-size:0.72rem;color:#64748b;font-weight:700;margin-bottom:6px;">⏰ SHIFT</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:5px;">';
            for (var s = 0; s < w.shifts.length; s++) {
                html += '<span style="background:#f1f5f9;padding:4px 10px;border-radius:8px;font-size:0.72rem;font-weight:600;">';
                html += w.shifts[s].name + ' ' + w.shifts[s].start + '-' + w.shifts[s].end;
                html += '</span>';
            }
            html += '</div>';
            html += '</div>';
        }

        // Actions
        html += '<div style="display:flex;gap:8px;">';
        html += '<button onclick="editWorkerHR(\'' + w.id + '\')" style="flex:1;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;padding:10px;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;">✏️ Edit</button>';

        if (!isResigned) {
            html += '<button onclick="sendWorkerWA(\'' + w.id + '\')" style="flex:1;background:linear-gradient(135deg,#25d366,#128c7e);color:white;border:none;padding:10px;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;">💬 WA</button>';
        }

        html += '<button onclick="deleteWorkerHR(\'' + w.id + '\')" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border:none;padding:10px;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;width:44px;">🗑</button>';
        html += '</div>';

        html += '</div>';
        html += '</div>';
    }

    return html;
}

// ============================================
// ===== MANUAL SALARY ENTRY (LAMA) ===========
// ============================================

// Untuk masukkan rekod gaji lama yang tak ada punch record
function addManualSalaryRecord() {
    var workerId = prompt('Masukkan Worker ID:');
    if (!workerId) return;

    var worker = getWorkerById(workerId);
    if (!worker) {
        showToast('❌ Pekerja tidak ditemui');
        return;
    }

    var month = prompt('Bulan (1-12):');
    var year = prompt('Tahun (cth: 2024):');
    var amount = prompt('Jumlah Gaji (RM):');
    var notes = prompt('Catatan (optional):');

    if (!month || !year || !amount) {
        showToast('❌ Sila isi semua maklumat');
        return;
    }

    appData = loadData();
    if (!appData.manualSalary) appData.manualSalary = [];

    appData.manualSalary.push({
        id: 'SAL' + Date.now(),
        workerId: workerId,
        workerName: worker.name,
        month: parseInt(month),
        year: parseInt(year),
        amount: parseFloat(amount),
        notes: notes || '',
        createdAt: new Date().toISOString()
    });

    saveData(appData);
    showToast('✅ Rekod gaji manual ditambah');
}

console.log('✅ HR Worker Status & Manual Salary loaded');