// ===== PUNCH ADMIN SYSTEM =====

var currentPunchTab = 'dashboard';
var editingWorkerId = null;

// Init
function initPunchAdmin() {
    if (!appData) appData = loadData();

    if (!appData.workers) {
        appData.workers = getDefaultWorkers();
        saveData(appData);
    }
    if (!appData.punchRecords) appData.punchRecords = [];
    if (!appData.leaves) appData.leaves = [];
    if (!appData.salarySlips) appData.salarySlips = [];

    populatePunchFilters();
    renderPunchDashboard();
    updatePunchLink();
    updateDashboardSettingsCards();
}

function getDefaultWorkers() {
    return [
        {
            id: 'WRK001',
            name: 'En. Ahmad',
            role: 'Warden',
            icon: '👮',
            icNumber: '800101145678',
            phone: '0123456789',
            loginId: 'warden',
            loginPass: 'warden123',
            salaryType: 'hourly',
            hourlyRate: 10,
            monthlySalary: 0,
            dailyRate: 0,
            overtimeRate: 15,
            allowance: 0,
            startDate: '2024-01-15',
            bank: '',
            notes: '',
            createdAt: new Date().toISOString()
        },
        {
            id: 'WRK002',
            name: 'Pn. Siti',
            role: 'Tukang Masak',
            icon: '👨‍🍳',
            icNumber: '750505145678',
            phone: '0123456790',
            loginId: 'masak',
            loginPass: 'masak123',
            salaryType: 'hourly',
            hourlyRate: 8,
            monthlySalary: 0,
            dailyRate: 0,
            overtimeRate: 12,
            allowance: 100,
            startDate: '2024-01-15',
            bank: '',
            notes: '',
            createdAt: new Date().toISOString()
        },
        {
            id: 'WRK003',
            name: 'Ustaz Hafiz',
            role: 'Ustaz Quran',
            icon: '👨‍🏫',
            icNumber: '850315145678',
            phone: '0123456791',
            loginId: 'ustaz',
            loginPass: 'ustaz123',
            salaryType: 'monthly',
            hourlyRate: 0,
            monthlySalary: 2500,
            dailyRate: 0,
            overtimeRate: 20,
            allowance: 200,
            startDate: '2024-01-15',
            bank: '',
            notes: '',
            createdAt: new Date().toISOString()
        }
    ];
}

// ===== punch-admin.js =====
// CARI fungsi populatePunchFilters() dan GANTI KESELURUHAN:

function populatePunchFilters() {
    var months = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    var currentMonth = new Date().getMonth() + 1;
    var currentYear = new Date().getFullYear();

    // Dashboard date
    var dashDate = document.getElementById('dashDate');
    if (dashDate && !dashDate.value) {
        dashDate.value = new Date().toISOString().split('T')[0];
    }

    // Worker filter
    var workerSelect = document.getElementById('recordsWorker');
    if (workerSelect) {
        var html = '<option value="all">Semua Pekerja</option>';
        if (appData.workers) {
            for (var i = 0; i < appData.workers.length; i++) {
                html += '<option value="' + appData.workers[i].id + '">' + appData.workers[i].name + '</option>';
            }
        }
        workerSelect.innerHTML = html;
    }

    // Records Month
    var recordsMonth = document.getElementById('recordsMonth');
    if (recordsMonth) {
        var html = '';
        for (var i = 1; i <= 12; i++) {
            html += '<option value="' + i + '"' + (i === currentMonth ? ' selected' : '') + '>' + months[i] + '</option>';
        }
        recordsMonth.innerHTML = html;
    }

    // Records Year - COLLECT years dari punchRecords juga
    var recordsYear = document.getElementById('recordsYear');
    if (recordsYear) {
        var currentYear = new Date().getFullYear();
        var yearsMap = {};
        yearsMap[currentYear] = true;

        // Scan SEMUA punch records untuk dapatkan tahun sebenar
        if (appData.punchRecords) {
            for (var i = 0; i < appData.punchRecords.length; i++) {
                var r = appData.punchRecords[i];
                if (r && r.date) {
                    var y = parseInt(r.date.split('-')[0]);
                    if (y && y > 2020 && y < 2030) {
                        yearsMap[y] = true;
                    }
                }
            }
        }

        // Tambah tahun sekitar current year
        yearsMap[currentYear - 1] = true;
        yearsMap[currentYear + 1] = true;

        var yearKeys = Object.keys(yearsMap).sort(function(a, b) { return b - a; });

        // Auto-detect: kalau ada data, default ke tahun yang ada data terbanyak
        var defaultYear = currentYear;
        var maxCount = 0;
        for (var yk = 0; yk < yearKeys.length; yk++) {
            var count = 0;
            var yr = parseInt(yearKeys[yk]);
            if (appData.punchRecords) {
                for (var j = 0; j < appData.punchRecords.length; j++) {
                    if (appData.punchRecords[j].date && parseInt(appData.punchRecords[j].date.split('-')[0]) === yr) {
                        count++;
                    }
                }
            }
            if (count > maxCount) {
                maxCount = count;
                defaultYear = yr;
            }
        }

        var html = '';
        for (var i = 0; i < yearKeys.length; i++) {
            var selected = parseInt(yearKeys[i]) === defaultYear ? ' selected' : '';
            html += '<option value="' + yearKeys[i] + '"' + selected + '>' + yearKeys[i] + '</option>';
        }
        recordsYear.innerHTML = html;
    }

    // Salary Month/Year
    var salaryMonth = document.getElementById('salaryMonth');
    if (salaryMonth) {
        var html = '';
        for (var i = 1; i <= 12; i++) {
            html += '<option value="' + i + '"' + (i === currentMonth ? ' selected' : '') + '>' + months[i] + '</option>';
        }
        salaryMonth.innerHTML = html;
    }

    var salaryYear = document.getElementById('salaryYear');
    if (salaryYear) {
        var html = '';
        for (var y = currentYear + 1; y >= currentYear - 2; y--) {
            html += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
        }
        salaryYear.innerHTML = html;
    }

    // Payroll Month/Year
    var payrollMonth = document.getElementById('payrollMonth');
    if (payrollMonth && payrollMonth.options.length === 0) {
        var html = '';
        for (var i = 1; i <= 12; i++) {
            html += '<option value="' + i + '"' + (i === currentMonth ? ' selected' : '') + '>' + months[i] + '</option>';
        }
        payrollMonth.innerHTML = html;
    }

    var payrollYear = document.getElementById('payrollYear');
    if (payrollYear && payrollYear.options.length === 0) {
        var html = '';
        for (var y = currentYear + 1; y >= currentYear - 2; y--) {
            html += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
        }
        payrollYear.innerHTML = html;
    }
}

// Switch tabs
function switchPunchTab(tab, btn) {
    currentPunchTab = tab;

    var contents = document.querySelectorAll('.punch-tab-content');
    for (var i = 0; i < contents.length; i++) contents[i].classList.remove('active');

    var btns = document.querySelectorAll('.punch-subtab');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');

    document.getElementById('punchTab-' + tab).classList.add('active');
    if (btn) btn.classList.add('active');

    if (tab === 'dashboard') renderPunchDashboard();
    if (tab === 'records') renderPunchTabRecords();  // ← PASTIKAN INI BETUL
    if (tab === 'workers') renderWorkers();
    if (tab === 'salary') renderSalaryList();
    if (tab === 'leave') renderLeaveList();
    if (tab === 'payroll') {
        initPayroll();
        renderPayrollTable();
    }
}

// ===== DASHBOARD =====
function renderPunchDashboard() {
    if (!appData.workers) return;

    var date = document.getElementById('dashDate').value || new Date().toISOString().split('T')[0];

    // Today stats
    var todayPresent = 0;
    var todayHours = 0;

    var workersToday = {};
    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.date === date) {
            workersToday[r.workerId] = true;
            todayHours += r.hoursWorked || 0;
        }
    }
    todayPresent = Object.keys(workersToday).length;

    document.getElementById('punchTotalWorkers').textContent = appData.workers.length;
    document.getElementById('punchTodayPresent').textContent = todayPresent + ' / ' + appData.workers.length;
    document.getElementById('punchTodayHours').textContent = todayHours.toFixed(1);

    // Calculate month salary
    var monthSalary = calculateAllMonthSalary();
    document.getElementById('punchMonthSalary').textContent = 'RM ' + monthSalary.toLocaleString();

    // Today activity
    renderPunchTodayActivity(date);

    // Month stats
    renderMonthStats();
}

function renderPunchTodayActivity(date) {
    var container = document.getElementById('todayActivity');
    if (!container) return;

    if (!appData.workers || appData.workers.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;">Tiada pekerja</div>';
        return;
    }

    if (!appData.punchRecords) appData.punchRecords = [];

    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();

    var html = '';

    for (var w = 0; w < appData.workers.length; w++) {
        var worker = appData.workers[w];
        var shifts = worker.shifts || [];
        var rate = worker.hourlyRate || 5;

        // Get today's records
        var workerRecords = [];
        var totalHoursWorked = 0;
        var totalDeduction = 0;

        for (var j = 0; j < appData.punchRecords.length; j++) {
            var r = appData.punchRecords[j];
            if (r.workerId === worker.id && r.date === date) {
                workerRecords.push(r);
                totalHoursWorked += r.hoursWorked || 0;
                totalDeduction += r.lateDeduction || 0;
                totalDeduction += r.earlyDeduction || 0;
            }
        }

        // Calculate expected hours & missed deduction
        var totalExpectedHours = 0;
        var missedHours = 0;
        var missedDeduction = 0;

        // Determine status
        var hasActive = false;
        var completedShifts = 0;

        for (var j = 0; j < workerRecords.length; j++) {
            if (!workerRecords[j].punchOut) hasActive = true;
            if (workerRecords[j].punchOut) completedShifts++;
        }

        var statusColor = hasActive ? '#a78bfa' : (completedShifts > 0 ? '#3b82f6' : '#ef4444');
        var statusText = hasActive ? '🟢 Aktif' : (completedShifts > 0 ? '✅ ' + completedShifts + ' shift selesai' : '⚪ Belum punch');

        // Worker card
        html += '<div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:15px;margin-bottom:12px;border-left:5px solid ' + statusColor + ';">';

        // Header
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">';
        html += '<div style="width:45px;height:45px;background:#faf5ff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">' + (worker.icon || '👤') + '</div>';
        html += '<div style="flex:1;">';
        html += '<strong>' + worker.name + '</strong>';
        html += '<div style="font-size:0.8rem;color:#64748b;">' + worker.role + ' • ' + statusText + '</div>';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div style="font-size:1.3rem;font-weight:800;color:' + (totalHoursWorked > 0 ? '#7c3aed' : '#94a3b8') + ';">' + totalHoursWorked.toFixed(1) + '</div>';
        html += '<div style="font-size:0.7rem;color:#64748b;">jam</div>';
        html += '</div>';
        html += '</div>';

        // Shift breakdown
        if (shifts.length > 0) {
            html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">';

            for (var s = 0; s < shifts.length; s++) {
                var shift = shifts[s];
                var shiftHours = parseFloat(calculateShiftHoursAdmin(shift.start, shift.end));
                totalExpectedHours += shiftHours;

                // Find matching record
                var record = null;
                for (var j = 0; j < workerRecords.length; j++) {
                    if (workerRecords[j].shiftName === shift.name) {
                        record = workerRecords[j];
                        break;
                    }
                }

                var bg = '#f1f5f9';
                var color = '#64748b';
                var icon = '⏳';
                var label = shift.name;

                if (record && record.punchOut) {
                    // Selesai
                    bg = record.isLate ? '#fef3c7' : '#e9d5ff';
                    color = record.isLate ? '#78350f' : '#5b21b6';
                    icon = record.isLate ? '⚠️' : '✅';
                    label = shift.name + ' ' + (record.hoursWorked || 0).toFixed(1) + 'j';

                } else if (record && !record.punchOut) {
                    // Aktif
                    bg = '#dbeafe';
                    color = '#1e40af';
                    icon = '▶️';
                    label = shift.name + ' (aktif)';

                } else {
                    // Tak punch - check terlepas atau belum
                    var sParts = shift.start.split(':');
                    var eParts = shift.end.split(':');
                    var eMin = parseInt(eParts[0]) * 60 + parseInt(eParts[1]);
                    var sMin = parseInt(sParts[0]) * 60 + parseInt(sParts[1]);
                    var isOvernight = eMin < sMin;

                    var isPast = false;
                    if (isOvernight) {
                        isPast = nowMinutes > eMin && nowMinutes < sMin;
                    } else {
                        isPast = nowMinutes > eMin;
                    }

                    if (isPast) {
                        // TERLEPAS - tolak gaji
                        bg = '#fee2e2';
                        color = '#991b1b';
                        icon = '❌';
                        label = shift.name + ' -RM' + (shiftHours * rate).toFixed(2);

                        missedHours += shiftHours;
                        missedDeduction += shiftHours * rate;
                    }
                }

                html += '<span style="background:' + bg + ';color:' + color + ';padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:600;">' + icon + ' ' + label + '</span>';
            }

            html += '</div>';
        }

        // Gaji calculation
        var grossPay = totalExpectedHours * rate;
        var allDeductions = totalDeduction + missedDeduction;
        var netPay = grossPay - allDeductions;

        html += '<div style="background:#f8fafc;border-radius:8px;padding:10px;font-size:0.82rem;">';

        html += '<div style="display:flex;justify-content:space-between;padding:2px 0;">';
        html += '<span style="color:#64748b;">Gaji penuh (' + totalExpectedHours.toFixed(1) + 'j × RM' + rate + '):</span>';
        html += '<span style="color:#7c3aed;font-weight:600;">RM ' + grossPay.toFixed(2) + '</span>';
        html += '</div>';

        if (missedDeduction > 0) {
            html += '<div style="display:flex;justify-content:space-between;padding:2px 0;">';
            html += '<span style="color:#dc2626;">❌ Tolak shift terlepas (' + missedHours.toFixed(1) + 'j):</span>';
            html += '<span style="color:#dc2626;font-weight:600;">- RM ' + missedDeduction.toFixed(2) + '</span>';
            html += '</div>';
        }

        if (totalDeduction > 0) {
            html += '<div style="display:flex;justify-content:space-between;padding:2px 0;">';
            html += '<span style="color:#f59e0b;">⚠️ Tolak lewat/awal:</span>';
            html += '<span style="color:#f59e0b;font-weight:600;">- RM ' + totalDeduction.toFixed(2) + '</span>';
            html += '</div>';
        }

        html += '<div style="display:flex;justify-content:space-between;padding:4px 0;margin-top:4px;border-top:1px solid #e2e8f0;font-weight:800;">';
        html += '<span>Gaji bersih hari ini:</span>';
        html += '<span style="color:' + (netPay >= 0 ? '#7c3aed' : '#dc2626') + ';">RM ' + netPay.toFixed(2) + '</span>';
        html += '</div>';

        html += '</div>';

        html += '</div>';
    }

    container.innerHTML = html;
}   
// ===== ADMIN HELPER FUNCTIONS =====

function sortShiftsForAdmin(shifts) {
    var sorted = [];

    for (var i = 0; i < shifts.length; i++) {
        var shift = JSON.parse(JSON.stringify(shifts[i]));
        var startParts = shift.start.split(':');
        var endParts = shift.end.split(':');
        var startHour = parseInt(startParts[0]);
        var endHour = parseInt(endParts[0]);

        var isOvernight = endHour < startHour;

        if (isOvernight) {
            shift.isOvernightFromYesterday = true;
            shift.sortOrder = -1;
        } else {
            shift.isOvernightFromYesterday = false;
            shift.sortOrder = startHour * 60 + parseInt(startParts[1]);
        }

        sorted.push(shift);
    }

    sorted.sort(function(a, b) {
        return a.sortOrder - b.sortOrder;
    });

    return sorted;
}

function calculateShiftHoursAdmin(startTime, endTime) {
    var startParts = startTime.split(':');
    var endParts = endTime.split(':');

    var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
    }

    var diff = endMinutes - startMinutes;
    return (diff / 60).toFixed(1);
}

function formatShiftTimeAdmin(time24) {
    if (!time24) return '-';
    var parts = time24.split(':');
    var hours = parseInt(parts[0]);
    var minutes = parts[1];
    var period = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return hours + ':' + minutes + ' ' + period;
}

function formatTimeAdmin(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return hours + ':' + String(minutes).padStart(2, '0') + ' ' + ampm;
}

function renderMonthStats() {
    var container = document.getElementById('monthStats');
    if (!container) return;

    if (!appData.punchRecords) appData.punchRecords = [];

    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();
    var today = now.toISOString().split('T')[0];
    var nowMinutes = now.getHours() * 60 + now.getMinutes();

    var html = '<table class="table">';
    html += '<thead><tr>';
    html += '<th>Pekerja</th>';
    html += '<th>Hari Kerja</th>';
    html += '<th>Jam Bekerja</th>';
    html += '<th>Jam Terlepas</th>';
    html += '<th>Potongan</th>';
    html += '<th>Gaji Bersih</th>';
    html += '</tr></thead><tbody>';

    var grandTotalHours = 0;
    var grandTotalSalary = 0;

    for (var w = 0; w < appData.workers.length; w++) {
        var worker = appData.workers[w];
        var rate = worker.hourlyRate || 5;
        var shifts = worker.shifts || [];

        var totalHoursWorked = 0;
        var totalLateDeduction = 0;
        var totalMissedHours = 0;
        var totalMissedDeduction = 0;
        var uniqueDays = {};
        var totalExpectedHours = 0;

        // Get work days dalam bulan ni
        var workDays = worker.workDays || ['mon', 'tue', 'wed', 'thu', 'fri'];
        var dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        // Loop setiap hari dalam bulan
        var daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        for (var d = 1; d <= daysInMonth; d++) {
            var dateObj = new Date(currentYear, currentMonth - 1, d);
            var dateStr = currentYear + '-' + String(currentMonth).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            var dayName = dayNames[dateObj.getDay()];

            // Skip kalau bukan work day
            if (workDays.indexOf(dayName) === -1) continue;

            // Skip hari masa depan
            if (dateStr > today) continue;

            // Get records untuk hari ni
            var dayRecords = [];
            for (var i = 0; i < appData.punchRecords.length; i++) {
                var r = appData.punchRecords[i];
                if (r.workerId === worker.id && r.date === dateStr) {
                    dayRecords.push(r);
                    totalHoursWorked += r.hoursWorked || 0;
                    totalLateDeduction += r.lateDeduction || 0;
                    totalLateDeduction += r.earlyDeduction || 0;
                }
            }

            if (dayRecords.length > 0) {
                uniqueDays[dateStr] = true;
            }

            // Check setiap shift - kalau terlepas, tolak
            for (var s = 0; s < shifts.length; s++) {
                var shift = shifts[s];
                var shiftHours = parseFloat(calculateShiftHoursAdmin(shift.start, shift.end));
                totalExpectedHours += shiftHours;

                // Check kalau shift ni ada punch
                var hasPunch = false;
                for (var j = 0; j < dayRecords.length; j++) {
                    if (dayRecords[j].shiftName === shift.name) {
                        hasPunch = true;
                        break;
                    }
                }

                // Kalau tak punch DAN shift dah lepas
                if (!hasPunch) {
                    var eParts = shift.end.split(':');
                    var sParts = shift.start.split(':');
                    var eMin = parseInt(eParts[0]) * 60 + parseInt(eParts[1]);
                    var sMin = parseInt(sParts[0]) * 60 + parseInt(sParts[1]);
                    var isOvernight = eMin < sMin;

                    var shiftPast = false;

                    if (dateStr < today) {
                        // Hari lepas - semua shift dah lepas
                        shiftPast = true;
                    } else if (dateStr === today) {
                        // Hari ni - check masa
                        if (isOvernight) {
                            shiftPast = nowMinutes > eMin && nowMinutes < sMin;
                        } else {
                            shiftPast = nowMinutes > eMin;
                        }
                    }

                    if (shiftPast) {
                        totalMissedHours += shiftHours;
                        totalMissedDeduction += shiftHours * rate;
                    }
                }
            }
        }

        var workDaysCount = Object.keys(uniqueDays).length;
        var grossSalary = totalExpectedHours * rate;
        var allDeductions = totalLateDeduction + totalMissedDeduction;
        var netSalary = grossSalary - allDeductions + (worker.allowance || 0);

        grandTotalHours += totalHoursWorked;
        grandTotalSalary += netSalary;

        html += '<tr>';
        html += '<td>' + (worker.icon || '👤') + ' <strong>' + worker.name + '</strong><br><small style="color:#64748b;">' + worker.role + '</small></td>';
        html += '<td>' + workDaysCount + ' hari</td>';
        html += '<td style="color:#7c3aed;font-weight:600;">' + totalHoursWorked.toFixed(1) + ' jam</td>';
        html += '<td style="color:#dc2626;">' + (totalMissedHours > 0 ? totalMissedHours.toFixed(1) + ' jam' : '-') + '</td>';
        html += '<td style="color:#dc2626;font-weight:600;">' + (allDeductions > 0 ? '-RM ' + allDeductions.toFixed(2) : '-') + '</td>';
        html += '<td><strong style="color:' + (netSalary >= 0 ? '#7c3aed' : '#dc2626') + ';">RM ' + netSalary.toFixed(2) + '</strong></td>';
        html += '</tr>';
    }

    // Grand total
    html += '<tr style="background:#faf5ff;font-weight:800;">';
    html += '<td>JUMLAH</td>';
    html += '<td></td>';
    html += '<td style="color:#7c3aed;">' + grandTotalHours.toFixed(1) + ' jam</td>';
    html += '<td></td>';
    html += '<td></td>';
    html += '<td style="color:#7c3aed;">RM ' + grandTotalSalary.toFixed(2) + '</td>';
    html += '</tr>';

    html += '</tbody></table>';
    container.innerHTML = html;
}

function getWorkerMonthStats(workerId, month, year) {
    var totalHours = 0;
    var uniqueDays = {};

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId !== workerId) continue;

        var parts = r.date.split('-');
        var rYear = parseInt(parts[0]);
        var rMonth = parseInt(parts[1]);

        if (rYear === year && rMonth === month) {
            totalHours += r.hoursWorked || 0;
            uniqueDays[r.date] = true;
        }
    }

    return {
        totalHours: totalHours,
        workDays: Object.keys(uniqueDays).length
    };
}

function calculateWorkerSalary(worker, totalHours, workDays) {
    var rate = worker.hourlyRate || 5;
    var grossSalary = totalHours * rate;

    // Calculate total deductions from punch records
    var totalDeduction = 0;
    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId !== worker.id) continue;

        var parts = r.date.split('-');
        if (parseInt(parts[0]) === currentYear && parseInt(parts[1]) === currentMonth) {
            totalDeduction += r.lateDeduction || 0;
            totalDeduction += r.earlyDeduction || 0;
        }
    }

    var allowance = worker.allowance || 0;
    var netSalary = grossSalary + allowance - totalDeduction;

    return netSalary;
}

function calculateAllMonthSalary() {
    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();
    var total = 0;

    for (var i = 0; i < appData.workers.length; i++) {
        var stats = getWorkerMonthStats(appData.workers[i].id, currentMonth, currentYear);
        total += calculateWorkerSalary(appData.workers[i], stats.totalHours, stats.workDays);
    }

    return total;
}

// ===== PUNCH RECORDS =====
// ===== punch-admin.js =====
// CARI renderPunchRecords dan GANTI KESELURUHAN:

function renderPunchTabRecords() {
    // Reload data terkini
    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var workerFilter = document.getElementById('recordsWorker');
    var monthFilter = document.getElementById('recordsMonth');
    var yearFilter = document.getElementById('recordsYear');
    var statusFilter = document.getElementById('recordsStatus');

    if (!workerFilter || !monthFilter || !yearFilter || !statusFilter) {
        console.log('❌ Punch filter elements not found');
        return;
    }

    var wFilter = workerFilter.value;
    var mFilter = parseInt(monthFilter.value);
    var yFilter = parseInt(yearFilter.value);
    var sFilter = statusFilter.value;

    // Safety check
    if (isNaN(mFilter)) mFilter = new Date().getMonth() + 1;
    if (isNaN(yFilter)) yFilter = new Date().getFullYear();

    var filtered = [];
    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (!r || !r.date) continue;

        var parts = r.date.split('-');
        var rYear = parseInt(parts[0]);
        var rMonth = parseInt(parts[1]);

        var workerOk = wFilter === 'all' || r.workerId === wFilter;
        var monthOk = rMonth === mFilter;
        var yearOk = rYear === yFilter;
        var statusOk = sFilter === 'all' || r.status === sFilter;

        if (workerOk && monthOk && yearOk && statusOk) {
            filtered.push(r);
        }
    }

    filtered.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    var tbody = document.getElementById('punchRecordsBody');
    if (!tbody) {
        console.log('❌ punchRecordsBody not found');
        return;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:40px;"><div class="empty-state"><div class="empty-icon">📭</div><p>Tiada rekod untuk bulan/tahun ini</p><small>Cuba tukar filter bulan atau tahun</small></div></td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var r = filtered[i];
        var inTime = r.punchIn ? formatTimePunch(new Date(r.punchIn)) : '-';
        var outTime = r.punchOut ? formatTimePunch(new Date(r.punchOut)) : '<span style="color:#94a3b8;">Belum</span>';
        var statusClass = r.status || 'pending';
        var statusText = r.status === 'approved' ? '✅ Approved' :
                         r.status === 'rejected' ? '❌ Rejected' : '⏳ Pending';

        html += '<tr>';
        html += '<td>' + formatDate(r.date) + '</td>';
        html += '<td><strong>' + (r.workerName || 'Unknown') + '</strong></td>';
        html += '<td>' + (r.shiftName || '-') + '</td>';
        html += '<td>';
        if (r.punchInPhoto) {
            html += '<img src="' + r.punchInPhoto + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;cursor:pointer;margin-right:5px;" onclick="viewPunchPhoto(\'' + r.punchInPhoto + '\', \'IN\')">';
        }
        html += inTime;
        if (r.punchInLocation) {
            var validClass = r.punchInLocationValid ? '✅' : '⚠️';
            html += ' <span style="cursor:pointer;" onclick="viewPunchMap(' + r.punchInLocation.lat + ', ' + r.punchInLocation.lng + ')" title="Klik untuk tengok lokasi">' + validClass + '</span>';
        }
        html += '</td>';
        html += '<td>';
        if (r.punchOutPhoto) {
            html += '<img src="' + r.punchOutPhoto + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;cursor:pointer;margin-right:5px;" onclick="viewPunchPhoto(\'' + r.punchOutPhoto + '\', \'OUT\')">';
        }
        html += outTime;
        if (r.punchOutLocation) {
            var validClass2 = r.punchOutLocationValid ? '✅' : '⚠️';
            html += ' <span style="cursor:pointer;" onclick="viewPunchMap(' + r.punchOutLocation.lat + ', ' + r.punchOutLocation.lng + ')" title="Klik untuk tengok lokasi">' + validClass2 + '</span>';
        }
        html += '</td>';
        html += '<td><strong>' + (r.hoursWorked || 0).toFixed(1) + ' jam</strong></td>';
        html += '<td><span class="punch-status-badge ' + statusClass + '">' + statusText + '</span></td>';
        html += '<td><div style="display:flex;gap:5px;">';
        if (r.status !== 'approved') {
            html += '<button class="btn btn-sm btn-primary" onclick="approvePunch(\'' + r.id + '\')" title="Approve">✅</button>';
        }
        if (r.status !== 'rejected') {
            html += '<button class="btn btn-sm" style="background:#ef4444;color:white;" onclick="rejectPunch(\'' + r.id + '\')" title="Reject">❌</button>';
        }
        html += '<button class="btn btn-sm" style="background:#3b82f6;color:white;" onclick="editPunch(\'' + r.id + '\')" title="Edit">✏️</button>';
        html += '<button class="btn btn-sm btn-delete" onclick="deletePunch(\'' + r.id + '\')" title="Padam">🗑</button>';
        html += '</div></td>';
        html += '</tr>';
    }

    tbody.innerHTML = html;
}

function approvePunch(recordId) {
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].id === recordId) {
            appData.punchRecords[i].status = 'approved';
            appData.punchRecords[i].approvedAt = new Date().toISOString();
            saveData(appData);
            showToast('✅ Punch approved');
            renderPunchTabRecords();
            return;
        }
    }
}

function rejectPunch(recordId) {
    if (!confirm('Reject punch ini?')) return;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].id === recordId) {
            appData.punchRecords[i].status = 'rejected';
            saveData(appData);
            showToast('❌ Punch rejected');
            renderPunchTabRecords();
            return;
        }
    }
}

function approveAllPending() {
    var count = 0;
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].status === 'pending') {
            appData.punchRecords[i].status = 'approved';
            appData.punchRecords[i].approvedAt = new Date().toISOString();
            count++;
        }
    }
    saveData(appData);
    showToast('✅ ' + count + ' punch approved');
    renderPunchTabRecords();
}

function editPunch(recordId) {
    var record = null;
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].id === recordId) {
            record = appData.punchRecords[i];
            break;
        }
    }
    if (!record) return;

    var inTime = record.punchIn ? formatTimeForInput(new Date(record.punchIn)) : '08:00';
    var outTime = record.punchOut ? formatTimeForInput(new Date(record.punchOut)) : '17:00';

    var newIn = prompt('Edit masa Punch In (HH:MM):', inTime);
    if (!newIn) return;

    var newOut = prompt('Edit masa Punch Out (HH:MM):', outTime);
    if (!newOut) return;

    var inDate = new Date(record.date + 'T' + newIn);
    var outDate = new Date(record.date + 'T' + newOut);

    record.punchIn = inDate.toISOString();
    record.punchOut = outDate.toISOString();
    record.hoursWorked = (outDate - inDate) / (1000 * 60 * 60);
    record.hoursWorked = Math.round(record.hoursWorked * 100) / 100;

    saveData(appData);
    showToast('✅ Punch updated');
    renderPunchTabRecords();
}

function deletePunch(recordId) {
    if (!confirm('Padam punch ini?')) return;

    var newList = [];
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].id !== recordId) newList.push(appData.punchRecords[i]);
    }
    appData.punchRecords = newList;
    saveData(appData);
    showToast('🗑 Punch dipadam');
    renderPunchTabRecords();
}

// ===== WORKERS =====
function renderWorkers() {
    var container = document.getElementById('workersList');
    if (!container) return;

    if (!appData.workers || appData.workers.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:40px;"><div class="empty-icon">👥</div><p>Belum ada pekerja</p></div>';
        return;
    }

    var html = '<div class="workers-grid">';
    for (var i = 0; i < appData.workers.length; i++) {
        var w = appData.workers[i];
        var salaryDisplay = '';

        if (w.salaryType === 'hourly') {
            salaryDisplay = 'RM ' + w.hourlyRate + '/jam';
        } else if (w.salaryType === 'daily') {
            salaryDisplay = 'RM ' + w.dailyRate + '/hari';
        } else {
            salaryDisplay = 'RM ' + w.monthlySalary + '/bulan';
        }

        html += '<div class="worker-card">';
        html += '<div class="worker-card-header">';
        html += '<div class="worker-card-avatar">' + (w.icon || '👤') + '</div>';
        html += '<div class="worker-card-info">';
        html += '<h3>' + w.name + '</h3>';
        html += '<p>' + w.role + '</p>';
        html += '</div>';
        html += '</div>';

        html += '<div class="worker-card-details">';
        html += '<div class="worker-detail-row"><span class="worker-detail-label">📞 Telefon</span><span class="worker-detail-value">' + w.phone + '</span></div>';
        html += '<div class="worker-detail-row"><span class="worker-detail-label">🔑 Login ID</span><span class="worker-detail-value">' + w.loginId + '</span></div>';
        html += '<div class="worker-detail-row"><span class="worker-detail-label">💰 Gaji</span><span class="worker-detail-value">' + salaryDisplay + '</span></div>';
        html += '<div class="worker-detail-row"><span class="worker-detail-label">⚡ Overtime</span><span class="worker-detail-value">RM ' + w.overtimeRate + '/jam</span></div>';
        if (w.allowance > 0) {
            html += '<div class="worker-detail-row"><span class="worker-detail-label">🎁 Elaun</span><span class="worker-detail-value">RM ' + w.allowance + '</span></div>';
        }
        html += '</div>';

        html += '<div class="worker-card-actions">';
        html += '<button class="btn btn-sm btn-view" onclick="editWorker(\'' + w.id + '\')">✏️ Edit</button>';
        html += '<button class="btn btn-sm" style="background:#25d366;color:white;" onclick="shareWorkerLogin(\'' + w.id + '\')">📱 WA</button>';
        html += '<button class="btn btn-sm btn-delete" onclick="deleteWorker(\'' + w.id + '\')">🗑</button>';
        html += '</div>';
        html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
}

function openWorkerForm() {
    editingWorkerId = null;
    document.getElementById('workerFormTitle').textContent = '➕ Tambah Pekerja Baru';
    document.getElementById('workerForm').reset();
    document.getElementById('workerEditId').value = '';
    toggleSalaryFields();
    document.getElementById('workerFormModal').classList.remove('hidden');
}

function editWorker(workerId) {
    var worker = null;
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].id === workerId) {
            worker = appData.workers[i];
            break;
        }
    }
    if (!worker) return;

    editingWorkerId = workerId;
    document.getElementById('workerFormTitle').textContent = '✏️ Edit Pekerja';
    document.getElementById('workerEditId').value = workerId;
    document.getElementById('workerName').value = worker.name;
    document.getElementById('workerRole').value = worker.role;
    document.getElementById('workerIC').value = worker.icNumber || '';
    document.getElementById('workerPhone').value = worker.phone;
    document.getElementById('workerLoginId').value = worker.loginId;
    document.getElementById('workerLoginPass').value = worker.loginPass;
    document.getElementById('workerSalaryType').value = worker.salaryType;
    document.getElementById('workerHourlyRate').value = worker.hourlyRate || 0;
    document.getElementById('workerMonthlySalary').value = worker.monthlySalary || 0;
    document.getElementById('workerDailyRate').value = worker.dailyRate || 0;
    document.getElementById('workerOvertimeRate').value = worker.overtimeRate || 0;
    document.getElementById('workerAllowance').value = worker.allowance || 0;
    document.getElementById('workerStartDate').value = worker.startDate || '';
    document.getElementById('workerBank').value = worker.bank || '';
    document.getElementById('workerNotes').value = worker.notes || '';

    toggleSalaryFields();
    document.getElementById('workerFormModal').classList.remove('hidden');
}

function closeWorkerForm() {
    document.getElementById('workerFormModal').classList.add('hidden');
}

function toggleSalaryFields() {
    var type = document.getElementById('workerSalaryType').value;

    document.getElementById('hourlyRateGroup').style.display = type === 'hourly' ? 'block' : 'none';
    document.getElementById('monthlySalaryGroup').style.display = type === 'monthly' ? 'block' : 'none';
    document.getElementById('dailyRateGroup').style.display = type === 'daily' ? 'block' : 'none';
}

function saveWorker(event) {
    event.preventDefault();

    var roleIcons = {
        'Warden': '👮', 'Tukang Masak': '👨‍🍳', 'Ustaz Quran': '👨‍🏫',
        'Ustazah': '👩‍🏫', 'Pengetua': '👔', 'Pembantu Am': '🧹',
        'Pemandu': '🚗', 'Pengawal Keselamatan': '💂', 'Lain-lain': '👤'
    };

    var role = document.getElementById('workerRole').value;

    var workerData = {
        id: editingWorkerId || 'WRK' + Date.now(),
        name: document.getElementById('workerName').value.trim(),
        role: role,
        icon: roleIcons[role] || '👤',
        icNumber: document.getElementById('workerIC').value.trim(),
        phone: document.getElementById('workerPhone').value.trim(),
        loginId: document.getElementById('workerLoginId').value.trim().toLowerCase(),
        loginPass: document.getElementById('workerLoginPass').value.trim(),
        salaryType: document.getElementById('workerSalaryType').value,
        hourlyRate: parseFloat(document.getElementById('workerHourlyRate').value) || 0,
        monthlySalary: parseFloat(document.getElementById('workerMonthlySalary').value) || 0,
        dailyRate: parseFloat(document.getElementById('workerDailyRate').value) || 0,
        overtimeRate: parseFloat(document.getElementById('workerOvertimeRate').value) || 0,
        allowance: parseFloat(document.getElementById('workerAllowance').value) || 0,
        startDate: document.getElementById('workerStartDate').value,
        bank: document.getElementById('workerBank').value.trim(),
        notes: document.getElementById('workerNotes').value.trim(),
        createdAt: new Date().toISOString()
    };

    // Check duplicate loginId
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].loginId === workerData.loginId &&
            appData.workers[i].id !== editingWorkerId) {
            showToast('❌ Login ID sudah digunakan!');
            return;
        }
    }

    if (editingWorkerId) {
        // Update
        for (var i = 0; i < appData.workers.length; i++) {
            if (appData.workers[i].id === editingWorkerId) {
                appData.workers[i] = workerData;
                break;
            }
        }
        showToast('✅ Pekerja dikemaskini');
    } else {
        appData.workers.push(workerData);
        showToast('✅ Pekerja baru ditambah');
    }

    saveData(appData);
    closeWorkerForm();
    renderWorkers();
    populatePunchFilters();
}

function deleteWorker(workerId) {
    if (!confirm('Padam pekerja ini? Semua punch records akan dipadam juga.')) return;

    var newWorkers = [];
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].id !== workerId) newWorkers.push(appData.workers[i]);
    }
    appData.workers = newWorkers;

    // Padam punch records juga
    var newRecords = [];
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].workerId !== workerId) newRecords.push(appData.punchRecords[i]);
    }
    appData.punchRecords = newRecords;

    saveData(appData);
    showToast('🗑 Pekerja dipadam');
    renderWorkers();
}

function shareWorkerLogin(workerId) {
    var worker = null;
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].id === workerId) {
            worker = appData.workers[i];
            break;
        }
    }
    if (!worker) return;

    var punchUrl = window.location.origin + '/punch.html';

    var msg = '*🕌 Sistem Punch Card Madrasah*\n\n';
    msg += 'Assalamualaikum ' + worker.name + ',\n\n';
    msg += 'Berikut adalah maklumat login anda:\n\n';
    msg += '🔗 *Link:*\n' + punchUrl + '\n\n';
    msg += '👤 *ID Login:* ' + worker.loginId + '\n';
    msg += '🔐 *Kata Laluan:* ' + worker.loginPass + '\n\n';
    msg += '⚠️ Sila simpan link ini dan punch in/out setiap hari.\n\n';
    msg += '_Madrasah Tahfiz Pekan Sungai Buloh_';

    var phone = worker.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '60' + phone.substring(1);

    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===== SALARY (FIXED MONTHLY FLAT RATE) =====
function renderSalaryList() {
    var container = document.getElementById('salaryList');
    if (!container) return;

    var month = parseInt(document.getElementById('salaryMonth').value);
    var year = parseInt(document.getElementById('salaryYear').value);

    var html = '';

    for (var i = 0; i < appData.workers.length; i++) {
        var worker = appData.workers[i];
        var stats = getWorkerMonthStats(worker.id, month, year);
        var regularHours = Math.min(stats.totalHours, 8 * stats.workDays);
        var overtimeHours = Math.max(0, stats.totalHours - regularHours);

        var basicSalary = 0;
        if (worker.salaryType === 'hourly') {
            basicSalary = regularHours * worker.hourlyRate;
        } else if (worker.salaryType === 'daily') {
            basicSalary = stats.workDays * worker.dailyRate;
        } else {
            // FIX: Gaji bulanan adalah flat rate, tidak lagi diprorate /22 secara automatik
            basicSalary = worker.monthlySalary || 0;
        }

        var overtimePay = overtimeHours * worker.overtimeRate;
        var allowance = worker.allowance || 0;
        var grossPay = basicSalary + overtimePay + allowance;
        var netPay = grossPay;

        html += '<div class="salary-card">';
        html += '<div class="salary-card-header">';
        html += '<div>';
        html += '<h3 style="margin:0;">' + (worker.icon || '👤') + ' ' + worker.name + '</h3>';
        html += '<small style="color:var(--text-light);">' + worker.role + '</small>';
        html += '</div>';
        html += '<div class="salary-amount">RM ' + netPay.toFixed(2) + '</div>';
        html += '</div>';

        html += '<div class="salary-breakdown">';
        html += '<div class="salary-breakdown-item">';
        html += '<div class="salary-breakdown-label">Hari Kerja</div>';
        html += '<div class="salary-breakdown-value">' + stats.workDays + ' hari</div>';
        html += '</div>';
        html += '<div class="salary-breakdown-item">';
        html += '<div class="salary-breakdown-label">Jumlah Jam</div>';
        html += '<div class="salary-breakdown-value">' + stats.totalHours.toFixed(1) + ' jam</div>';
        html += '</div>';
        html += '<div class="salary-breakdown-item">';
        html += '<div class="salary-breakdown-label">Gaji Asas</div>';
        html += '<div class="salary-breakdown-value positive">RM ' + basicSalary.toFixed(2) + '</div>';
        html += '</div>';
        html += '<div class="salary-breakdown-item">';
        html += '<div class="salary-breakdown-label">Overtime</div>';
        html += '<div class="salary-breakdown-value positive">RM ' + overtimePay.toFixed(2) + '</div>';
        html += '</div>';
        html += '<div class="salary-breakdown-item">';
        html += '<div class="salary-breakdown-label">Elaun</div>';
        html += '<div class="salary-breakdown-value positive">RM ' + allowance.toFixed(2) + '</div>';
        html += '</div>';
        html += '</div>';

        html += '<div style="display:flex;gap:10px;margin-top:15px;">';
        html += '<button class="btn btn-primary" onclick="viewSalarySlip(\'' + worker.id + '\', ' + month + ', ' + year + ')">🖨 Lihat Slip Gaji</button>';
        html += '<button class="btn" style="background:#25d366;color:white;" onclick="sendSalaryWA(\'' + worker.id + '\', ' + month + ', ' + year + ')">📱 WhatsApp</button>';
        html += '</div>';

        html += '</div>';
    }

    container.innerHTML = html;
}
// ===== VIEW SALARY SLIP (FIXED MONTHLY FLAT RATE) =====
function viewSalarySlip(workerId, month, year) {
    var worker = null;
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].id === workerId) {
            worker = appData.workers[i];
            break;
        }
    }
    if (!worker) return;

    var stats = getWorkerMonthStats(workerId, month, year);
    var regularHours = Math.min(stats.totalHours, 8 * stats.workDays);
    var overtimeHours = Math.max(0, stats.totalHours - regularHours);

    var basicSalary = 0;
    if (worker.salaryType === 'hourly') {
        basicSalary = regularHours * worker.hourlyRate;
    } else if (worker.salaryType === 'daily') {
        basicSalary = stats.workDays * worker.dailyRate;
    } else {
        // FIX: Selaraskan gaji bulanan flat rate
        basicSalary = worker.monthlySalary || 0;
    }

    var overtimePay = overtimeHours * worker.overtimeRate;
    var allowance = worker.allowance || 0;
    var grossPay = basicSalary + overtimePay + allowance;
    var netPay = grossPay;

    var months = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    var html = '<div style="text-align:center;margin-bottom:25px;border-bottom:3px double #333;padding-bottom:20px;">';
    html += '<h1 style="margin:0;color:#7c3aed;">🕌 MADRASAH TAHFIZ PEKAN SUNGAI BULOH</h1>';
    html += '<p style="margin:5px 0;">Lot 2305, Lorong Lebai Daud, Jeram, Kuala Selangor</p>';
    html += '<h2 style="margin-top:15px;color:#1f2937;">SLIP GAJI</h2>';
    html += '<p style="font-size:1.1rem;color:#475569;">' + months[month] + ' ' + year + '</p>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px;">';
    html += '<div><strong>Nama:</strong> ' + worker.name + '</div>';
    html += '<div><strong>Jawatan:</strong> ' + worker.role + '</div>';
    html += '<div><strong>No. IC:</strong> ' + (worker.icNumber || '-') + '</div>';
    html += '<div><strong>Bank:</strong> ' + (worker.bank || '-') + '</div>';
    html += '</div>';

    html += '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">';
    html += '<thead><tr style="background:#7c3aed;color:white;">';
    html += '<th style="padding:10px;text-align:left;">Butiran</th>';
    html += '<th style="padding:10px;text-align:right;">Jumlah (RM)</th>';
    html += '</tr></thead><tbody>';

    html += '<tr><td style="padding:10px;border-bottom:1px solid #ddd;">Hari Kerja</td><td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;">' + stats.workDays + ' hari</td></tr>';
    html += '<tr><td style="padding:10px;border-bottom:1px solid #ddd;">Jumlah Jam Kerja</td><td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;">' + stats.totalHours.toFixed(1) + ' jam</td></tr>';
    html += '<tr><td style="padding:10px;border-bottom:1px solid #ddd;">Jam Regular</td><td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;">' + regularHours.toFixed(1) + ' jam</td></tr>';
    html += '<tr><td style="padding:10px;border-bottom:1px solid #ddd;">Jam Overtime</td><td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;">' + overtimeHours.toFixed(1) + ' jam</td></tr>';

    html += '<tr style="background:#faf5ff;font-weight:700;"><td colspan="2" style="padding:10px;">📥 PENDAPATAN</td></tr>';
    html += '<tr><td style="padding:10px;padding-left:25px;border-bottom:1px solid #ddd;">Gaji Asas</td><td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;color:#7c3aed;">' + basicSalary.toFixed(2) + '</td></tr>';
    html += '<tr><td style="padding:10px;padding-left:25px;border-bottom:1px solid #ddd;">Bayaran Overtime</td><td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;color:#7c3aed;">' + overtimePay.toFixed(2) + '</td></tr>';
    html += '<tr><td style="padding:10px;padding-left:25px;border-bottom:1px solid #ddd;">Elaun</td><td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;color:#7c3aed;">' + allowance.toFixed(2) + '</td></tr>';

    html += '<tr style="background:#7c3aed;color:white;font-weight:800;font-size:1.1rem;">';
    html += '<td style="padding:15px;">JUMLAH BERSIH (NET PAY)</td>';
    html += '<td style="padding:15px;text-align:right;">RM ' + netPay.toFixed(2) + '</td>';
    html += '</tr>';

    html += '</tbody></table>';

    html += '<div style="margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:40px;">';
    html += '<div><div style="border-bottom:1px solid #333;height:40px;margin-bottom:8px;"></div><p style="text-align:center;"><strong>Penerima</strong><br>' + worker.name + '</p></div>';
    html += '<div><div style="border-bottom:1px solid #333;height:40px;margin-bottom:8px;"></div><p style="text-align:center;"><strong>Diluluskan</strong><br>Pengetua/Bendahari</p></div>';
    html += '</div>';

    html += '<p style="text-align:center;margin-top:30px;color:#94a3b8;font-size:0.85rem;font-style:italic;">Dijana pada ' + new Date().toLocaleDateString('ms-MY') + ' oleh Sistem Hafazan Al-Quran</p>';

    document.getElementById('salarySlipContent').innerHTML = html;
    document.getElementById('salarySlipOverlay').classList.remove('hidden');
    document.getElementById('salarySlipOverlay').setAttribute('style',
        'position:fixed !important;top:0 !important;left:0 !important;width:100vw !important;' +
        'height:100vh !important;background:rgba(0,0,0,0.9) !important;z-index:99999 !important;' +
        'display:flex !important;flex-direction:column !important;');
    document.body.style.overflow = 'hidden';
}

function closeSalarySlip() {
    document.getElementById('salarySlipOverlay').classList.add('hidden');
    document.getElementById('salarySlipOverlay').setAttribute('style', 'display:none !important;');
    document.body.style.overflow = '';
}

function printSalarySlip() {
    window.print();
}

function sendSalaryWA(workerId, month, year) {
    var worker = null;
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].id === workerId) {
            worker = appData.workers[i];
            break;
        }
    }
    if (!worker) return;

    var stats = getWorkerMonthStats(workerId, month, year);
    var salary = calculateWorkerSalary(worker, stats.totalHours, stats.workDays);

    var months = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    var msg = '*💰 SLIP GAJI - MADRASAH TAHFIZ PEKAN SUNGAI BULOH*\n\n';
    msg += 'Assalamualaikum ' + worker.name + ',\n\n';
    msg += '*Bulan:* ' + months[month] + ' ' + year + '\n\n';
    msg += '📊 *Ringkasan:*\n';
    msg += 'Hari Kerja: ' + stats.workDays + ' hari\n';
    msg += 'Jumlah Jam: ' + stats.totalHours.toFixed(1) + ' jam\n\n';
    msg += '*💰 JUMLAH GAJI: RM ' + salary.toFixed(2) + '*\n\n';
    msg += 'Slip gaji penuh boleh diambil dari pejabat.\n\n';
    msg += '_Jazakumullah Khairan_\n_Madrasah Tahfiz Pekan Sungai Buloh_';

    var phone = worker.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '60' + phone.substring(1);

    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

function generateAllSalary() {
    showToast('✅ Slip gaji untuk semua pekerja telah dijana!');
    renderSalaryList();
}

// ===== LEAVE =====
function renderLeaveList() {
    var container = document.getElementById('leaveList');
    if (!container) return;

    if (!appData.leaves || appData.leaves.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:40px;"><div class="empty-icon">🏖️</div><p>Tiada rekod cuti</p></div>';
        return;
    }

    var sorted = appData.leaves.slice().sort(function(a, b) {
        return new Date(b.startDate) - new Date(a.startDate);
    });

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
        var leave = sorted[i];
        var icons = {
            annual: '🏖️', mc: '🏥', emergency: '⚠️',
            unpaid: '💸', public: '🎉'
        };

        html += '<div class="leave-card ' + leave.type + '">';
        html += '<div class="leave-icon">' + (icons[leave.type] || '📋') + '</div>';
        html += '<div class="leave-info">';
        html += '<div class="leave-worker">' + leave.workerName + '</div>';
        html += '<div class="leave-date">📅 ' + formatDate(leave.startDate) + ' → ' + formatDate(leave.endDate) + '</div>';
        if (leave.reason) html += '<div class="leave-reason">💬 ' + leave.reason + '</div>';
        html += '</div>';
        html += '<button class="btn btn-sm btn-delete" onclick="deleteLeave(\'' + leave.id + '\')">🗑</button>';
        html += '</div>';
    }

    container.innerHTML = html;
}

function openLeaveForm() {
    var select = document.getElementById('leaveWorker');
    var html = '<option value="">Pilih pekerja</option>';
    for (var i = 0; i < appData.workers.length; i++) {
        html += '<option value="' + appData.workers[i].id + '">' + appData.workers[i].name + '</option>';
    }
    select.innerHTML = html;

    document.getElementById('leaveForm').reset();
    document.getElementById('leaveFormModal').classList.remove('hidden');
}

function closeLeaveForm() {
    document.getElementById('leaveFormModal').classList.add('hidden');
}

function saveLeave(event) {
    event.preventDefault();

    var workerId = document.getElementById('leaveWorker').value;
    var workerName = '';
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].id === workerId) {
            workerName = appData.workers[i].name;
            break;
        }
    }

    var leave = {
        id: 'LV' + Date.now(),
        workerId: workerId,
        workerName: workerName,
        type: document.getElementById('leaveType').value,
        paid: document.getElementById('leavePaid').value === 'yes',
        startDate: document.getElementById('leaveStart').value,
        endDate: document.getElementById('leaveEnd').value,
        reason: document.getElementById('leaveReason').value.trim(),
        createdAt: new Date().toISOString()
    };

    if (!appData.leaves) appData.leaves = [];
    appData.leaves.push(leave);
    saveData(appData);

    showToast('✅ Cuti ditambah');
    closeLeaveForm();
    renderLeaveList();
}

function deleteLeave(leaveId) {
    if (!confirm('Padam rekod cuti ini?')) return;

    var newList = [];
    for (var i = 0; i < appData.leaves.length; i++) {
        if (appData.leaves[i].id !== leaveId) newList.push(appData.leaves[i]);
    }
    appData.leaves = newList;
    saveData(appData);
    showToast('🗑 Cuti dipadam');
    renderLeaveList();
}

// ===== HELPERS =====
// ===== HELPERS =====
function formatTimePunch(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return hours + ':' + String(minutes).padStart(2, '0') + ' ' + ampm;
}

function formatTimeForInput(date) {
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

function updatePunchLink() {
    var url = window.location.origin + '/punch.html';
    var el = document.getElementById('punchLinkText');
    if (el) el.textContent = url;
}

function copyPunchLink() {
    var url = window.location.origin + '/punch.html';
    var textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('📋 Link disalin!');
}

function sharePunchLinkWA() {
    var url = window.location.origin + '/punch.html';
    var msg = 'Link Sistem Punch Card Madrasah:\n' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

function exportPunchCSV() {
    if (!appData.punchRecords || appData.punchRecords.length === 0) {
        showToast('❌ Tiada data');
        return;
    }

    var csv = 'Tarikh,Pekerja,Punch In,Punch Out,Jam Kerja,Status\n';

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        var inTime = r.punchIn ? new Date(r.punchIn).toLocaleString('ms-MY') : '';
        var outTime = r.punchOut ? new Date(r.punchOut).toLocaleString('ms-MY') : '';

        csv += '"' + r.date + '","' + r.workerName + '","' + inTime + '","' + outTime + '","' + (r.hoursWorked || 0) + '","' + (r.status || 'pending') + '"\n';
    }

    var BOM = '\uFEFF';
    var blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'punch_records_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();

    showToast('✅ Export berjaya!');
}

// ===== PUNCH SETTINGS =====

function openPunchSettings() {
    // Kill old modal
    var oldModal = document.getElementById('punchSettingsModal');
    if (oldModal) oldModal.remove();

    if (!appData) appData = loadData();

    // FIX: Selaraskan koordinat, radius & WhatsApp Admin mengikut identiti rasmi Madrasah
    var settings = appData.punchSettings || {
        locationName: 'Madrasah Tahfiz Pekan Sungai Buloh',
        lat: 3.247250,
        lng: 101.317083,
        radius: 1000,
        adminWhatsApp: '601161000542', // Ustaz Aisamuddin
        notifyPunchIn: true,
        notifyPunchOut: true,
        notifyInvalidLocation: true
    };

    

    // Create modal from scratch
    var modal = document.createElement('div');
    modal.id = 'punchSettingsModal';
    modal.style.cssText = 
        'position:fixed !important;' +
        'top:0 !important;' +
        'left:0 !important;' +
        'right:0 !important;' +
        'bottom:0 !important;' +
        'width:100vw !important;' +
        'height:100vh !important;' +
        'background:rgba(0,0,0,0.85) !important;' +
        'z-index:999999 !important;' +
        'display:flex !important;' +
        'align-items:center !important;' +
        'justify-content:center !important;' +
        'padding:20px !important;' +
        'overflow:auto !important;';

    var html = '<div style="background:white;border-radius:16px;padding:0;max-width:600px;width:100%;max-height:95vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,0.3);">';

    // Header
    html += '<div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;padding:20px;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;">';
    html += '<h2 style="margin:0;font-size:1.2rem;">⚙️ Tetapan Punch System</h2>';
    html += '<button onclick="closePunchSettings()" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1rem;">✕</button>';
    html += '</div>';

    // Body
    html += '<div style="padding:25px;">';

    // Location Section
    html += '<div style="background:#faf5ff;padding:15px;border-radius:10px;margin-bottom:20px;border-left:4px solid #a78bfa;">';
    html += '<h3 style="color:#7c3aed;margin:0 0 10px;font-size:1.05rem;">📍 Lokasi Madrasah</h3>';
    html += '<p style="font-size:0.85rem;color:#64748b;margin-bottom:10px;">Pekerja mesti dalam radius untuk punch.</p>';

    html += '<div style="margin-bottom:12px;">';
    html += '<label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.9rem;">Nama Lokasi</label>';
    html += '<input type="text" id="setLocName" value="' + (settings.locationName || '') + '" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.95rem;box-sizing:border-box;">';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">';
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.9rem;">Latitude</label>';
    html += '<input type="number" id="setLat" step="0.000001" value="' + settings.lat + '" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.95rem;box-sizing:border-box;">';
    html += '</div>';
    html += '<div>';
    html += '<label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.9rem;">Longitude</label>';
    html += '<input type="number" id="setLng" step="0.000001" value="' + settings.lng + '" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.95rem;box-sizing:border-box;">';
    html += '</div>';
    html += '</div>';

    html += '<button type="button" onclick="getCurrentLocationForSetting()" style="width:100%;padding:12px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.95rem;">📍 Guna Lokasi Saya Sekarang</button>';
    html += '</div>';

    // Radius
    html += '<div style="margin-bottom:15px;">';
    html += '<label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.9rem;">📏 Radius Allowed (meter)</label>';
    html += '<input type="number" id="setRadius" min="50" max="5000" step="50" value="' + settings.radius + '" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.95rem;box-sizing:border-box;">';
    html += '<small style="color:#64748b;display:block;margin-top:5px;">Pekerja mesti dalam jarak ini dari madrasah.</small>';
    html += '</div>';

    // Admin WhatsApp
    html += '<div style="margin-bottom:15px;">';
    html += '<label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.9rem;">📱 WhatsApp Admin</label>';
    html += '<input type="tel" id="setAdminWA" value="' + (settings.adminWhatsApp || '') + '" placeholder="60123456789" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.95rem;box-sizing:border-box;">';
    html += '<small style="color:#64748b;display:block;margin-top:5px;">Format: 60xxxxxxxxx (tanpa + atau -)</small>';
    html += '</div>';

    // Notifications
    html += '<div style="margin-bottom:20px;">';
    html += '<label style="display:block;margin-bottom:8px;font-weight:600;font-size:0.9rem;">🔔 Auto Notification</label>';
    html += '<div style="display:flex;gap:15px;flex-wrap:wrap;">';
    html += '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="notifyPunchIn" ' + (settings.notifyPunchIn ? 'checked' : '') + '><span>Punch In</span></label>';
    html += '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="notifyPunchOut" ' + (settings.notifyPunchOut ? 'checked' : '') + '><span>Punch Out</span></label>';
    html += '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="notifyInvalidLocation" ' + (settings.notifyInvalidLocation ? 'checked' : '') + '><span>Invalid Location</span></label>';
    html += '</div>';
    html += '</div>';

    // Buttons
    html += '<div style="display:flex;gap:10px;">';
    html += '<button onclick="savePunchSettingsDirect()" style="flex:1;padding:14px;background:linear-gradient(135deg,#a78bfa,#7c3aed);color:white;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:1rem;">💾 Simpan Tetapan</button>';
    html += '<button onclick="closePunchSettings()" style="padding:14px 24px;background:#6b7280;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Batal</button>';
    html += '</div>';

    html += '</div>'; // close body
    html += '</div>'; // close container

    modal.innerHTML = html;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closePunchSettings() {
    var modal = document.getElementById('punchSettingsModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

function savePunchSettingsDirect() {
    if (!appData) appData = loadData();

    appData.punchSettings = {
        locationName: document.getElementById('setLocName').value.trim(),
        lat: parseFloat(document.getElementById('setLat').value),
        lng: parseFloat(document.getElementById('setLng').value),
        radius: parseInt(document.getElementById('setRadius').value),
        adminWhatsApp: document.getElementById('setAdminWA').value.trim(),
        notifyPunchIn: document.getElementById('notifyPunchIn').checked,
        notifyPunchOut: document.getElementById('notifyPunchOut').checked,
        notifyInvalidLocation: document.getElementById('notifyInvalidLocation').checked
    };

    saveData(appData);

    if (typeof updatePunchSettingsDisplay === 'function') {
        updatePunchSettingsDisplay();
    }

    closePunchSettings();
    showToast('✅ Tetapan disimpan!');
}

function getCurrentLocationForSetting() {
    if (!navigator.geolocation) {
        alert('GPS tidak disokong');
        return;
    }

    showToast('📡 Mengesan lokasi...');

    navigator.geolocation.getCurrentPosition(
        function(pos) {
            document.getElementById('setLat').value = pos.coords.latitude.toFixed(6);
            document.getElementById('setLng').value = pos.coords.longitude.toFixed(6);
            showToast('✅ Lokasi diset!');
        },
        function(err) {
            alert('❌ Gagal: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ===== UPDATE DASHBOARD DISPLAY =====
function updatePunchSettingsDisplay() {
    updateDashboardSettingsCards();
}

function updateDashboardSettingsCards() {
    if (!appData || !appData.punchSettings) return;

    var s = appData.punchSettings;

    var el1 = document.getElementById('settingLocationName');
    if (el1) el1.textContent = s.locationName || 'Belum diset';

    var el2 = document.getElementById('settingCoords');
    if (el2) el2.textContent = (s.lat && s.lng) ? s.lat.toFixed(4) + ', ' + s.lng.toFixed(4) : '-';

    var el3 = document.getElementById('settingRadius');
    if (el3) el3.textContent = (s.radius || 500) + 'm';

    var el4 = document.getElementById('settingAdminWA');
    if (el4) el4.textContent = s.adminWhatsApp || 'Belum diset';
}

// ===== VIEW PUNCH PHOTO & MAP =====

function viewPunchPhoto(photoUrl, type) {
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;cursor:pointer;';
    modal.onclick = function() { modal.remove(); };
    modal.innerHTML = '<div style="max-width:500px;width:100%;background:white;border-radius:15px;overflow:hidden;" onclick="event.stopPropagation()">' +
        '<div style="background:#7c3aed;color:white;padding:15px;text-align:center;font-weight:700;">📸 Selfie Punch ' + type + '</div>' +
        '<img src="' + photoUrl + '" style="width:100%;display:block;">' +
        '<div style="padding:15px;text-align:center;">' +
        '<button onclick="this.closest(\'div[style]\').parentElement.remove()" style="padding:10px 30px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">✕ Tutup</button>' +
        '</div></div>';
    document.body.appendChild(modal);
}

function viewPunchMap(lat, lng) {
    window.open('https://maps.google.com/?q=' + lat + ',' + lng, '_blank');
}

// ===== RESET PUNCH RECORDS =====
function resetAllPunchRecords() {
    var count = appData.punchRecords ? appData.punchRecords.length : 0;

    if (count === 0) {
        showToast('📭 Tiada rekod untuk dipadam');
        return;
    }

    if (!confirm('⚠️ AMARAN!\n\nPadam SEMUA ' + count + ' rekod punch?\n\nIni termasuk:\n- Semua punch in/out\n- Semua selfie records\n- Semua location records\n\nTindakan ini TIDAK boleh diundo!')) {
        return;
    }

    if (!confirm('PENGESAHAN AKHIR!\n\nAdakah anda PASTI nak padam semua rekod punch?\n\nTekan OK untuk teruskan.')) {
        return;
    }

    appData.punchRecords = [];
    appData.pendingNotifications = [];
    saveData(appData);

    showToast('🗑️ Semua ' + count + ' rekod punch telah dipadam!');

    // Refresh
    renderPunchDashboard();
    renderPunchTabRecords();
}

// ============================================
// ===== PAYROLL TABLE ========================
// ============================================

function initPayroll() {
    var months = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();

    var monthEl = document.getElementById('payrollMonth');
    if (monthEl) {
        var html = '';
        for (var i = 1; i <= 12; i++) {
            html += '<option value="' + i + '"' + (i === currentMonth ? ' selected' : '') + '>' + months[i] + '</option>';
        }
        monthEl.innerHTML = html;
    }

    var yearEl = document.getElementById('payrollYear');
    if (yearEl) {
        var html = '';
        for (var y = currentYear + 1; y >= currentYear - 2; y--) {
            html += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
        }
        yearEl.innerHTML = html;
    }
}

function renderPayrollTable() {
    var container = document.getElementById('payrollContent');
    if (!container) return;

    if (!appData.workers || appData.workers.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;">Tiada pekerja</div>';
        return;
    }

    var month = parseInt(document.getElementById('payrollMonth').value);
    var year = parseInt(document.getElementById('payrollYear').value);
    var months = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    if (!appData.punchRecords) appData.punchRecords = [];
    if (!appData.payrollAdjustments) appData.payrollAdjustments = {};

    var now = new Date();
    var today = now.toISOString().split('T')[0];
    var nowMinutes = now.getHours() * 60 + now.getMinutes();
    var dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    var html = '';

    // Title
    html += '<div style="text-align:center;margin-bottom:20px;">';
    html += '<h2 style="margin:0;color:#7c3aed;">📊 JADUAL GAJI</h2>';
    html += '<p style="margin:5px 0;color:#64748b;">' + months[month] + ' ' + year + '</p>';
    html += '</div>';

    // Table
    html += '<table style="width:100%;border-collapse:collapse;border:2px solid #7c3aed;">';

    // Header
    html += '<thead>';
    html += '<tr style="background:#7c3aed;color:white;">';
    html += '<th style="padding:12px;text-align:left;border:1px solid #5b21b6;">Butiran</th>';

    for (var w = 0; w < appData.workers.length; w++) {
        html += '<th style="padding:12px;text-align:center;border:1px solid #5b21b6;min-width:150px;">';
        html += (appData.workers[w].icon || '👤') + '<br>';
        html += appData.workers[w].name + '<br>';
        html += '<small style="opacity:0.8;">' + appData.workers[w].role + '</small>';
        html += '</th>';
    }

    html += '<th style="padding:12px;text-align:center;border:1px solid #5b21b6;background:#4c1d95;">JUMLAH</th>';
    html += '</tr>';
    html += '</thead>';

    html += '<tbody>';

    // Calculate data for each worker
    var workerData = [];
    var totals = {
        workDays: 0, hoursWorked: 0, hoursMissed: 0,
        grossPay: 0, lateDeduction: 0, missedDeduction: 0,
        bonus: 0, allowance: 0, otherDeduction: 0, netPay: 0
    };

    for (var w = 0; w < appData.workers.length; w++) {
        var worker = appData.workers[w];
        var rate = worker.hourlyRate || 5;
        var shifts = worker.shifts || [];
        var workDays = worker.workDays || ['mon', 'tue', 'wed', 'thu', 'fri'];

        var data = {
            workDays: 0,
            hoursWorked: 0,
            hoursMissed: 0,
            expectedHours: 0,
            lateDeduction: 0,
            missedDeduction: 0,
            rate: rate,
            allowance: worker.allowance || 0
        };

        // Get payroll adjustment key
        var adjKey = worker.id + '_' + year + '_' + month;
        var adj = appData.payrollAdjustments[adjKey] || {};

        // Loop setiap hari
        var daysInMonth = new Date(year, month, 0).getDate();
        var uniqueDays = {};

        for (var d = 1; d <= daysInMonth; d++) {
            var dateObj = new Date(year, month - 1, d);
            var dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            var dayName = dayNames[dateObj.getDay()];

            if (workDays.indexOf(dayName) === -1) continue;
            if (dateStr > today) continue;

            var dayRecords = [];
            for (var i = 0; i < appData.punchRecords.length; i++) {
                var r = appData.punchRecords[i];
                if (r.workerId === worker.id && r.date === dateStr) {
                    dayRecords.push(r);
                    data.hoursWorked += r.hoursWorked || 0;
                    data.lateDeduction += r.lateDeduction || 0;
                    data.lateDeduction += r.earlyDeduction || 0;
                }
            }

            if (dayRecords.length > 0) uniqueDays[dateStr] = true;

            // Check missed shifts
            for (var s = 0; s < shifts.length; s++) {
                var shift = shifts[s];
                var shiftHours = parseFloat(calculateShiftHoursAdmin(shift.start, shift.end));
                data.expectedHours += shiftHours;

                var hasPunch = false;
                for (var j = 0; j < dayRecords.length; j++) {
                    if (dayRecords[j].shiftName === shift.name) {
                        hasPunch = true;
                        break;
                    }
                }

                if (!hasPunch) {
                    var eParts = shift.end.split(':');
                    var sParts = shift.start.split(':');
                    var eMin = parseInt(eParts[0]) * 60 + parseInt(eParts[1]);
                    var sMin = parseInt(sParts[0]) * 60 + parseInt(sParts[1]);
                    var isOvernight = eMin < sMin;
                    var shiftPast = false;

                    if (dateStr < today) {
                        shiftPast = true;
                    } else if (dateStr === today) {
                        shiftPast = isOvernight ? (nowMinutes > eMin && nowMinutes < sMin) : (nowMinutes > eMin);
                    }

                    if (shiftPast) {
                        data.hoursMissed += shiftHours;
                        data.missedDeduction += shiftHours * rate;
                    }
                }
            }
        }

        data.workDays = Object.keys(uniqueDays).length;
        data.grossPay = data.expectedHours * rate;
        data.bonus = adj.bonus || 0;
        data.otherDeduction = adj.otherDeduction || 0;
        data.otherDeductionNote = adj.otherDeductionNote || '';
        data.bonusNote = adj.bonusNote || '';
        data.netPay = data.grossPay - data.lateDeduction - data.missedDeduction + data.allowance + data.bonus - data.otherDeduction;

        workerData.push(data);

        totals.workDays += data.workDays;
        totals.hoursWorked += data.hoursWorked;
        totals.hoursMissed += data.hoursMissed;
        totals.grossPay += data.grossPay;
        totals.lateDeduction += data.lateDeduction;
        totals.missedDeduction += data.missedDeduction;
        totals.bonus += data.bonus;
        totals.allowance += data.allowance;
        totals.otherDeduction += data.otherDeduction;
        totals.netPay += data.netPay;
    }

    // Row: Kadar Gaji
    html += makePayrollRow('💰 Kadar Gaji (RM/jam)', workerData.map(function(d) {
        return '<input type="number" class="payroll-input" data-field="rate" data-worker="' + appData.workers[workerData.indexOf(d)].id + '" value="' + d.rate + '" min="0" step="0.50" style="width:80px;">';
    }), '');

    // Row: Hari Bekerja
    html += makePayrollRow('📅 Hari Bekerja', workerData.map(function(d) {
        return d.workDays + ' hari';
    }), totals.workDays + ' hari');

    // Row: Jam Dijadual
    html += makePayrollRow('⏰ Jam Dijadual', workerData.map(function(d) {
        return d.expectedHours.toFixed(1) + ' jam';
    }), '');

    // Row: Jam Bekerja
    html += makePayrollRow('✅ Jam Bekerja', workerData.map(function(d) {
        return '<span style="color:#7c3aed;font-weight:700;">' + d.hoursWorked.toFixed(1) + ' jam</span>';
    }), '<span style="color:#7c3aed;">' + totals.hoursWorked.toFixed(1) + '</span>');

    // Row: Jam Terlepas
    html += makePayrollRow('❌ Jam Terlepas', workerData.map(function(d) {
        return d.hoursMissed > 0 ? '<span style="color:#dc2626;">' + d.hoursMissed.toFixed(1) + ' jam</span>' : '-';
    }), totals.hoursMissed > 0 ? '<span style="color:#dc2626;">' + totals.hoursMissed.toFixed(1) + '</span>' : '-');

    // Separator
    html += '<tr style="background:#e8f5e9;"><td colspan="' + (appData.workers.length + 2) + '" style="padding:8px;font-weight:700;color:#7c3aed;border:1px solid #ddd;">📥 PENDAPATAN</td></tr>';

    // Row: Gaji Kasar
    html += makePayrollRow('💰 Gaji Kasar', workerData.map(function(d) {
        return '<span style="color:#7c3aed;font-weight:700;">RM ' + d.grossPay.toFixed(2) + '</span>';
    }), '<strong style="color:#7c3aed;">RM ' + totals.grossPay.toFixed(2) + '</strong>');

    // Row: Elaun
    html += makePayrollRow('🎁 Elaun Bulanan', workerData.map(function(d, i) {
        return '<input type="number" class="payroll-input" data-field="allowance" data-worker="' + appData.workers[i].id + '" value="' + d.allowance + '" min="0" step="10" style="width:80px;">';
    }), 'RM ' + totals.allowance.toFixed(2));

    // Row: Bonus
    html += makePayrollRow('⭐ Bonus / Insentif', workerData.map(function(d, i) {
        return '<input type="number" class="payroll-input payroll-bonus" data-field="bonus" data-worker="' + appData.workers[i].id + '" data-month="' + month + '" data-year="' + year + '" value="' + d.bonus + '" min="0" step="10" style="width:80px;">';
    }), 'RM ' + totals.bonus.toFixed(2));

    // Separator
    html += '<tr style="background:#fef2f2;"><td colspan="' + (appData.workers.length + 2) + '" style="padding:8px;font-weight:700;color:#dc2626;border:1px solid #ddd;">📤 POTONGAN</td></tr>';

    // Row: Potongan Lewat
    html += makePayrollRow('⚠️ Potongan Lewat/Awal', workerData.map(function(d) {
        return d.lateDeduction > 0 ? '<span style="color:#dc2626;">- RM ' + d.lateDeduction.toFixed(2) + '</span>' : '-';
    }), totals.lateDeduction > 0 ? '<span style="color:#dc2626;">- RM ' + totals.lateDeduction.toFixed(2) + '</span>' : '-');

    // Row: Potongan Terlepas
    html += makePayrollRow('❌ Potongan Shift Terlepas', workerData.map(function(d) {
        return d.missedDeduction > 0 ? '<span style="color:#dc2626;">- RM ' + d.missedDeduction.toFixed(2) + '</span>' : '-';
    }), totals.missedDeduction > 0 ? '<span style="color:#dc2626;">- RM ' + totals.missedDeduction.toFixed(2) + '</span>' : '-');

    // Row: Potongan Lain
    html += makePayrollRow('📝 Potongan Lain', workerData.map(function(d, i) {
        return '<input type="number" class="payroll-input payroll-deduction" data-field="otherDeduction" data-worker="' + appData.workers[i].id + '" data-month="' + month + '" data-year="' + year + '" value="' + d.otherDeduction + '" min="0" step="5" style="width:80px;">';
    }), totals.otherDeduction > 0 ? '<span style="color:#dc2626;">- RM ' + totals.otherDeduction.toFixed(2) + '</span>' : '-');

    // Total Row
    html += '<tr style="background:#7c3aed;color:white;">';
    html += '<td style="padding:15px;font-weight:800;font-size:1.05rem;border:1px solid #5b21b6;">💵 GAJI BERSIH</td>';

    for (var w = 0; w < workerData.length; w++) {
        html += '<td style="padding:15px;text-align:center;font-weight:800;font-size:1.2rem;border:1px solid #5b21b6;">RM ' + workerData[w].netPay.toFixed(2) + '</td>';
    }

    html += '<td style="padding:15px;text-align:center;font-weight:800;font-size:1.2rem;border:1px solid #5b21b6;background:#4c1d95;">RM ' + totals.netPay.toFixed(2) + '</td>';
    html += '</tr>';

    html += '</tbody></table>';

    // Notes
    html += '<div style="margin-top:15px;padding:15px;background:#fffbeb;border-radius:10px;border-left:4px solid #f59e0b;">';
    html += '<strong style="color:#78350f;">📝 Nota:</strong>';
    html += '<ul style="margin:8px 0 0;padding-left:20px;font-size:0.85rem;color:#78350f;">';
    html += '<li>Edit kadar gaji, elaun, bonus, atau potongan terus dalam jadual</li>';
    html += '<li>Klik "💾 Simpan" untuk save perubahan</li>';
    html += '<li>Gaji bersih = Gaji kasar + Elaun + Bonus - Potongan lewat - Potongan terlepas - Potongan lain</li>';
    html += '</ul>';
    html += '</div>';

    container.innerHTML = html;
}

// Helper: Make payroll table row
function makePayrollRow(label, values, total) {
    var html = '<tr>';
    html += '<td style="padding:10px 12px;font-weight:600;font-size:0.88rem;border:1px solid #e2e8f0;background:#f8fafc;">' + label + '</td>';

    for (var i = 0; i < values.length; i++) {
        html += '<td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0;font-size:0.9rem;">' + values[i] + '</td>';
    }

    html += '<td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0;font-weight:700;background:#faf5ff;">' + total + '</td>';
    html += '</tr>';
    return html;
}

// Save payroll changes
function savePayrollChanges() {
    if (!appData.payrollAdjustments) appData.payrollAdjustments = {};

    var month = parseInt(document.getElementById('payrollMonth').value);
    var year = parseInt(document.getElementById('payrollYear').value);

    // Save rate changes
    var rateInputs = document.querySelectorAll('.payroll-input[data-field="rate"]');
    for (var i = 0; i < rateInputs.length; i++) {
        var workerId = rateInputs[i].dataset.worker;
        var newRate = parseFloat(rateInputs[i].value) || 0;

        for (var j = 0; j < appData.workers.length; j++) {
            if (appData.workers[j].id === workerId) {
                appData.workers[j].hourlyRate = newRate;
                break;
            }
        }
    }

    // Save allowance changes
    var allowanceInputs = document.querySelectorAll('.payroll-input[data-field="allowance"]');
    for (var i = 0; i < allowanceInputs.length; i++) {
        var workerId = allowanceInputs[i].dataset.worker;
        var newAllowance = parseFloat(allowanceInputs[i].value) || 0;

        for (var j = 0; j < appData.workers.length; j++) {
            if (appData.workers[j].id === workerId) {
                appData.workers[j].allowance = newAllowance;
                break;
            }
        }
    }

    // Save bonus & deductions
    var bonusInputs = document.querySelectorAll('.payroll-bonus');
    for (var i = 0; i < bonusInputs.length; i++) {
        var workerId = bonusInputs[i].dataset.worker;
        var adjKey = workerId + '_' + year + '_' + month;

        if (!appData.payrollAdjustments[adjKey]) {
            appData.payrollAdjustments[adjKey] = {};
        }
        appData.payrollAdjustments[adjKey].bonus = parseFloat(bonusInputs[i].value) || 0;
    }

    var deductionInputs = document.querySelectorAll('.payroll-deduction');
    for (var i = 0; i < deductionInputs.length; i++) {
        var workerId = deductionInputs[i].dataset.worker;
        var adjKey = workerId + '_' + year + '_' + month;

        if (!appData.payrollAdjustments[adjKey]) {
            appData.payrollAdjustments[adjKey] = {};
        }
        appData.payrollAdjustments[adjKey].otherDeduction = parseFloat(deductionInputs[i].value) || 0;
    }

    saveData(appData);
    showToast('✅ Jadual gaji disimpan!');

    // Refresh table
    renderPayrollTable();
}

// Print payroll
function printPayroll() {
    window.print();
}