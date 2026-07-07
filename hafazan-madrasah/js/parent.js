// ===== PARENT DASHBOARD =====

function getBadgeClassParent(status) {
    if (status === 'Lancar') return 'badge-lancar';
    if (status === 'Sederhana') return 'badge-sederhana';
    if (status === 'Perlu Ulang') return 'badge-ulang';
    if (status === 'Tidak Lulus') return 'badge-gagal';
    return '';
}

function formatSurahDisplayParent(surah) {
    if (Array.isArray(surah)) {
        if (surah.length <= 3) return surah.join(', ');
        return surah.slice(0, 3).join(', ') + ' (+' + (surah.length - 3) + ' lagi)';
    }
    return surah || '-';
}

function formatJuzDisplayParent(juz) {
    if (Array.isArray(juz)) {
        var parts = [];
        for (var i = 0; i < juz.length; i++) {
            parts.push('Juz ' + juz[i]);
        }
        return parts.join(', ');
    }
    return juz ? 'Juz ' + juz : '-';
}

function formatSurahWithAyatParent(record) {
    if (!record.surahDetails || record.surahDetails.length === 0) {
        return formatSurahDisplayParent(record.surah);
    }

    var details = record.surahDetails;

    // Satu surah sahaja
    if (details.length === 1) {
        var sd = details[0];
        var info = (typeof getSurahInfo === 'function') ? getSurahInfo(sd.name) : null;
        var totalAyat = info ? info.ayat : 0;
        var isFull = (!sd.ayatFrom || sd.ayatFrom == 1) &&
                     (!sd.ayatTo || sd.ayatTo == totalAyat);

        if (isFull) {
            return sd.name;
        }

        var ayatText = '';
        if (sd.ayatFrom && sd.ayatTo) {
            ayatText = ' (Ayat ' + sd.ayatFrom + '-' + sd.ayatTo + ')';
        }
        return sd.name + ayatText;
    }

    // Kalau getSurahInfo tak ada, fallback simple
    if (typeof getSurahInfo !== 'function') {
        var parts = [];
        for (var i = 0; i < details.length; i++) {
            var sd = details[i];
            var ayatText = '';
            if (sd.ayatFrom && sd.ayatTo) {
                ayatText = ' (Ayat ' + sd.ayatFrom + '-' + sd.ayatTo + ')';
            }
            parts.push(sd.name + ayatText);
        }
        return parts.join(', ');
    }

    // Smart grouping
    var groups = [];
    var currentGroup = [];

    for (var i = 0; i < details.length; i++) {
        var sd = details[i];
        var info = getSurahInfo(sd.name);

        if (!info) {
            if (currentGroup.length > 0) {
                groups.push({ type: 'consecutive', items: currentGroup });
                currentGroup = [];
            }
            groups.push({ type: 'single', items: [{ sd: sd, info: null }] });
            continue;
        }

        var isFull = (!sd.ayatFrom || sd.ayatFrom == 1) &&
                     (!sd.ayatTo || sd.ayatTo == info.ayat);

        if (!isFull) {
            if (currentGroup.length > 0) {
                groups.push({ type: 'consecutive', items: currentGroup });
                currentGroup = [];
            }
            groups.push({ type: 'single', items: [{ sd: sd, info: info }] });
            continue;
        }

        if (currentGroup.length === 0) {
            currentGroup.push({ sd: sd, info: info });
        } else {
            var lastInGroup = currentGroup[currentGroup.length - 1];
            if (info.no === lastInGroup.info.no + 1) {
                currentGroup.push({ sd: sd, info: info });
            } else {
                groups.push({ type: 'consecutive', items: currentGroup });
                currentGroup = [{ sd: sd, info: info }];
            }
        }
    }

    if (currentGroup.length > 0) {
        groups.push({ type: 'consecutive', items: currentGroup });
    }

    var parts = [];

    for (var g = 0; g < groups.length; g++) {
        var group = groups[g];

        if (group.type === 'consecutive' && group.items.length >= 3) {
            var first = group.items[0].sd.name;
            var last = group.items[group.items.length - 1].sd.name;
            parts.push(first + ' - ' + last + ' (' + group.items.length + ' surah)');
        } else {
            for (var i = 0; i < group.items.length; i++) {
                var item = group.items[i];
                var sd = item.sd;
                var info = item.info;
                var totalAyat = info ? info.ayat : 0;

                var isFullSurah = (!sd.ayatFrom || sd.ayatFrom == 1) &&
                                  (!sd.ayatTo || sd.ayatTo == totalAyat);

                var ayatText = '';
                if (!isFullSurah && sd.ayatFrom && sd.ayatTo) {
                    ayatText = ' (Ayat ' + sd.ayatFrom + '-' + sd.ayatTo + ')';
                }
                parts.push(sd.name + ayatText);
            }
        }
    }

    return parts.join(', ');
}

// ===== MAIN INIT =====
function initParentDashboard() {
    appData = loadData();

    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === currentUser.studentId) {
            student = appData.students[i];
            break;
        }
    }

    if (!student) {
        document.querySelector('#parentPage .container').innerHTML = '<div class="empty-state" style="padding:60px;"><div class="empty-icon">⚠️</div><p>Data Tidak Ditemui</p><small>Sila hubungi guru atau admin madrasah.</small></div>';
        return;
    }

    var records = getStudentRecordsParent(student.id);

    document.getElementById('childName').textContent = student.name;
    document.getElementById('childClass').textContent = student.class;

    var surahSet = [];
    var totalScore = 0;
    for (var i = 0; i < records.length; i++) {
        totalScore += records[i].score;
        var rs = records[i].surah;
        if (Array.isArray(rs)) {
            for (var j = 0; j < rs.length; j++) {
                if (surahSet.indexOf(rs[j]) === -1) surahSet.push(rs[j]);
            }
        } else {
            if (rs && surahSet.indexOf(rs) === -1) surahSet.push(rs);
        }
    }

    var avgScore = records.length > 0 ? Math.round(totalScore / records.length) : 0;
    var lastRecord = records.length > 0 ? records[records.length - 1] : null;
    var lastStatus = lastRecord ? lastRecord.status : '-';

    var totalSurahEl = document.getElementById('parentTotalSurah');
    var avgScoreEl = document.getElementById('parentAvgScore');
    var lastStatusEl = document.getElementById('parentLastStatus');

    if (totalSurahEl) totalSurahEl.textContent = surahSet.length;
    if (avgScoreEl) avgScoreEl.textContent = avgScore + '%';
    if (lastStatusEl) lastStatusEl.textContent = lastStatus;

    var progressPercent = Math.round((surahSet.length / 114) * 100);
    var progressEl = document.getElementById('progressPercent');
    if (progressEl) progressEl.textContent = progressPercent + '%';

    var circle = document.getElementById('progressCircle');
    if (circle) {
        var circumference = 2 * Math.PI * 54;
        var offset = circumference - (progressPercent / 100) * circumference;
        setTimeout(function() {
            circle.style.strokeDashoffset = offset;
        }, 300);
    }

    parentHafazanAllRecords = records;
// Render dengan default limit 10
if (typeof renderParentRecordsFiltered === 'function') {
    setTimeout(renderParentRecordsFiltered, 200);
} else {
    renderParentRecords(records);
}
    renderParentChart(records);
    renderParentDashboard(records);
    renderTargetProgress(student, records);
    renderAchievements(student, records);
    renderUstazList(student);
    renderNotifications(student, records);
    initParentReport();
    renderChildAlbum(student);
    renderChildVideos(student);

            try { initParentAttendance(); } catch(e) { debugLog('Attendance init error:', e.message); }
    try { initParentPayments(); } catch(e) { debugLog('Payments init error:', e.message); }
    try { initParentGallery(); } catch(e) { debugLog('Gallery init error:', e.message); }
    try { initParentPrayerTimes(); } catch(e) { debugLog('Prayer init error:', e.message); }
    try { initParentSchedule(); } catch(e) { debugLog('Schedule init error:', e.message); }
    
    // ===== BARU: Auto-check maklumat lengkap (Wizard) =====
    setTimeout(function() {
        pdwCheckAndShowLogin(student);
    }, 2000);
}

// ============================================
// ===== PARENT DATA WIZARD CHECK =============
// ============================================

/**
 * Auto-check kalau parent perlu lengkapkan maklumat (untuk login.html)
 */
function pdwCheckAndShowLogin(student) {
    // Pastikan wizard functions loaded
    if (typeof pdwInit !== 'function') {
        console.log('⏳ Wizard belum ready, retry...');
        setTimeout(function() {
            pdwCheckAndShowLogin(student);
        }, 1000);
        return;
    }
    
    if (!student) {
        console.log('❌ Student data tidak dijumpai');
        return;
    }
    
    console.log('🔍 Checking student data completeness (login.html)...');
    
    // Init wizard dengan callback save
    pdwInit(student, {
        onSave: function(data, callback) {
            // Save guna appData (login.html method)
            pdwSaveToLocalData(data, function(success, error) {
                if (success) {
                    // Update reference dalam appData
                    for (var i = 0; i < appData.students.length; i++) {
                        if (appData.students[i] && appData.students[i].id === data.id) {
                            appData.students[i] = Object.assign({}, appData.students[i], data);
                            break;
                        }
                    }
                }
                callback(success, error);
            });
        }
    });
}

/**
 * Called selepas save berjaya - refresh UI (login.html)
 */
function pdwOnUpdateUI() {
    console.log('🔄 Refreshing UI after data update (login.html)...');
    
    // Reload appData
    appData = loadData();
    
    // Re-init dashboard
    if (typeof initParentDashboard === 'function') {
        // Delay untuk pastikan data dah save
        setTimeout(function() {
            initParentDashboard();
        }, 500);
    }
    
    // Show toast
    if (typeof showToast === 'function') {
        showToast('✅ Maklumat dikemas kini!');
    }
}

function getStudentRecordsParent(studentId) {
    var result = [];
    if (!appData.records) return result;
    for (var i = 0; i < appData.records.length; i++) {
        if (appData.records[i].studentId === studentId) {
            result.push(appData.records[i]);
        }
    }
    result.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    return result;
}

// ===== RECORDS TABLE VIEW =====
function renderParentRecords(records) {
    var container = document.getElementById('parentRecordsList');
    if (!container) return;

    if (records.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>Tiada Rekod Hafazan</p><small>Belum ada rekod baru direkodkan setakat ini.</small></div>';
        return;
    }

    var reversed = records.slice().reverse();
    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    var html = '<div class="table-responsive"><table class="table">';
    html += '<thead><tr>';
    html += '<th>Tarikh</th>';
    html += '<th>Sesi</th>';
    html += '<th>Jenis</th>';
    html += '<th>Bacaan</th>';
    html += '<th>Penyemak</th>';
    html += '<th>Markah</th>';
    html += '<th>Status</th>';
    html += '<th>Catatan</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < reversed.length; i++) {
        var record = reversed[i];
        var d = new Date(record.date);
        var dateStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

        var badgeClass = getBadgeClassParent(record.status);

        // Session badge
        var sessionBadge = '';
        if (record.session === 'pagi') {
            sessionBadge = '<span style="background:#fef3c7;color:#78350f;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">🌅 Pagi</span>';
        } else if (record.session === 'petang') {
            sessionBadge = '<span style="background:#fed7aa;color:#7c2d12;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">🌤 Petang</span>';
        } else if (record.session === 'malam') {
            sessionBadge = '<span style="background:#ddd6fe;color:#4c1d95;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">🌙 Malam</span>';
        } else {
            sessionBadge = '<span style="color:#94a3b8;font-size:0.75rem;">-</span>';
        }

        // Reading type badge
        var readingBadge = '';
        var rtTypes = {
            nazirah_khatam: { name: 'Nazirah Khatam', bg: '#dbeafe', color: '#1e40af' },
            nazirah_iqra: { name: 'Nazirah Iqra', bg: '#dbeafe', color: '#1e40af' },
            sabak_baru: { name: 'Sabak Baru', bg: '#fef3c7', color: '#78350f' },
            para_sabak: { name: 'Para Sabak', bg: '#fef3c7', color: '#78350f' },
            mukhtar: { name: 'Mukhtar', bg: '#fef3c7', color: '#78350f' },
            mukhtar_khatam: { name: 'Mukhtar Khatam', bg: '#fef3c7', color: '#78350f' },
            pra_syahadah: { name: 'Pra Syahadah', bg: '#e9d5ff', color: '#5b21b6' },
            syahadah: { name: 'Syahadah', bg: '#e9d5ff', color: '#5b21b6' }
        };

        if (record.readingType && rtTypes[record.readingType]) {
            var rt = rtTypes[record.readingType];
            readingBadge = '<span style="background:' + rt.bg + ';color:' + rt.color + ';padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">' + rt.name + '</span>';
        } else {
            readingBadge = '<span style="color:#94a3b8;font-size:0.75rem;">-</span>';
        }

        // Bacaan text
        var bacaanText = '';
        if (record.isIqra) {
            bacaanText = '<strong>📕 ' + (record.iqraBook || 'Iqra') + '</strong>';
            bacaanText += '<br><small style="color:#64748b;">ms ' + (record.iqraPage || '-') + ' • Baris ' + (record.iqraLineFrom || '-') + '-' + (record.iqraLineTo || '-') + '</small>';
        } else {
            var surahText = formatSurahWithAyatParent(record);
            var juzText = formatJuzDisplayParent(record.juz);
            bacaanText = '<strong>' + surahText + '</strong>';
            bacaanText += '<br><small style="color:#64748b;">' + juzText + '</small>';
        }

        // Checker
        var checkerText = '-';
        if (record.checkerName) {
            var checkerIcon = record.checkerType === 'pelajar' ? '👨‍🎓' : '👨‍🏫';
            checkerText = '<small>' + checkerIcon + ' ' + record.checkerName + '</small>';
        }

        // Score color
        var scoreColor = record.score >= 80 ? '#a78bfa' : record.score >= 60 ? '#f59e0b' : '#ef4444';

        html += '<tr>';
        html += '<td><strong>' + dateStr + '</strong></td>';
        html += '<td>' + sessionBadge + '</td>';
        html += '<td>' + readingBadge + '</td>';
        html += '<td style="max-width:200px;">' + bacaanText + '</td>';
        html += '<td>' + checkerText + '</td>';
        html += '<td><span style="display:inline-flex;align-items:center;justify-content:center;width:45px;height:45px;border-radius:50%;background:' + scoreColor + ';color:white;font-weight:800;font-size:1rem;">' + record.score + '</span></td>';
        html += '<td><span class="badge ' + badgeClass + '">' + record.status + '</span></td>';
        html += '<td style="max-width:200px;font-size:0.82rem;color:#64748b;">' + (record.notes ? '<em>"' + record.notes + '"</em>' : '-') + '</td>';
        html += '</tr>';
    }

    html += '</tbody></table></div>';

    container.innerHTML = html;
}

// ============================================
// ===== PARENT HAFAZAN FILTER ================
// ============================================

var parentHafazanAllRecords = []; // Store all records

function initParentHafazanFilters() {
    // Populate year dropdown - auto detect dari records
    var yearSelect = document.getElementById('parentHafazanYear');
    if (yearSelect) {
        var currentYear = new Date().getFullYear();
        var years = [];

        // Get years from records
        if (parentHafazanAllRecords && parentHafazanAllRecords.length > 0) {
            for (var i = 0; i < parentHafazanAllRecords.length; i++) {
                var y = parseInt(parentHafazanAllRecords[i].date.split('-')[0]);
                if (y && years.indexOf(y) === -1) {
                    years.push(y);
                }
            }
        }

        // Add current year if not exist
        if (years.indexOf(currentYear) === -1) {
            years.push(currentYear);
        }

        years.sort(function(a, b) { return b - a; }); // Newest first

        // Only rebuild if changed
        var newHtml = '';
        for (var i = 0; i < years.length; i++) {
            newHtml += '<option value="' + years[i] + '">' + years[i] + '</option>';
        }

        if (yearSelect.innerHTML !== newHtml) {
            var currentValue = yearSelect.value;
            yearSelect.innerHTML = newHtml;

            // Restore selection if still valid
            if (currentValue && years.indexOf(parseInt(currentValue)) > -1) {
                yearSelect.value = currentValue;
            } else {
                // Default to latest year with records
                yearSelect.value = String(years[0]);
            }
        }
    }

    // Set default custom dates (last 7 days)
    var dateFrom = document.getElementById('parentHafazanDateFrom');
    var dateTo = document.getElementById('parentHafazanDateTo');
    if (dateFrom && !dateFrom.value) {
        var today = new Date();
        var weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);

        if (dateTo) dateTo.value = today.toISOString().split('T')[0];
        dateFrom.value = weekAgo.toISOString().split('T')[0];
    }
}

// Handle filter type change
function onParentHafazanFilterChange() {
    var filterType = document.getElementById('parentHafazanFilterType').value;

    var monthWrapper = document.getElementById('parentHafazanMonthWrapper');
    var yearWrapper = document.getElementById('parentHafazanYearWrapper');
    var customWrapper = document.getElementById('parentHafazanCustomWrapper');

    // Hide all first
    if (monthWrapper) monthWrapper.style.display = 'none';
    if (yearWrapper) yearWrapper.style.display = 'none';
    if (customWrapper) customWrapper.style.display = 'none';

    // Show based on selection
    if (filterType === 'month') {
        if (monthWrapper) monthWrapper.style.display = 'block';
        if (yearWrapper) yearWrapper.style.display = 'block';
    } else if (filterType === 'year') {
        if (yearWrapper) yearWrapper.style.display = 'block';
    } else if (filterType === 'custom') {
        if (customWrapper) customWrapper.style.display = 'block';
    }

    // Re-render
    renderParentRecordsFiltered();
}

// Reset filters
function resetParentHafazanFilters() {
    var elements = [
        { id: 'parentHafazanFilterType', value: 'all' },
        { id: 'parentHafazanStatus', value: 'all' },
        { id: 'parentHafazanSession', value: 'all' },
        { id: 'parentHafazanLimit', value: '10' }
    ];

    for (var i = 0; i < elements.length; i++) {
        var el = document.getElementById(elements[i].id);
        if (el) el.value = elements[i].value;
    }

    // Hide all filter wrappers
    var wrappers = ['parentHafazanMonthWrapper', 'parentHafazanYearWrapper', 'parentHafazanCustomWrapper'];
    for (var i = 0; i < wrappers.length; i++) {
        var el = document.getElementById(wrappers[i]);
        if (el) el.style.display = 'none';
    }

    renderParentRecordsFiltered();
    showToast('🔄 Filter direset');
}

// MAIN: Render filtered records (UPDATED VERSION)
function renderParentRecordsFiltered() {
    if (!currentUser || !currentUser.studentId) return;

    appData = loadData();
    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === currentUser.studentId) {
            student = appData.students[i];
            break;
        }
    }
    if (!student) return;

    parentHafazanAllRecords = getStudentRecordsParent(student.id);

    // Init filters if not done
    initParentHafazanFilters();

    // Get filter values
    var filterType = document.getElementById('parentHafazanFilterType') ?
        document.getElementById('parentHafazanFilterType').value : 'all';
    var statusFilter = document.getElementById('parentHafazanStatus') ?
        document.getElementById('parentHafazanStatus').value : 'all';
    var sessionFilter = document.getElementById('parentHafazanSession') ?
        document.getElementById('parentHafazanSession').value : 'all';
    var limit = document.getElementById('parentHafazanLimit') ?
        document.getElementById('parentHafazanLimit').value : '10';

    // Apply filters
    var filtered = parentHafazanAllRecords.slice();
    var filterDescription = '';

    // Date filter
    var now = new Date();
    var today = now.toISOString().split('T')[0];

    if (filterType === 'today') {
        filtered = filtered.filter(function(r) {
            return r.date === today;
        });
        filterDescription = 'Hari Ini (' + formatDateP(today) + ')';
    } else if (filterType === 'week') {
        var weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        var weekAgoStr = weekAgo.toISOString().split('T')[0];
        filtered = filtered.filter(function(r) {
            return r.date >= weekAgoStr && r.date <= today;
        });
        filterDescription = 'Minggu Ini (' + formatDateP(weekAgoStr) + ' - ' + formatDateP(today) + ')';
    } else if (filterType === 'month') {
        var monthEl = document.getElementById('parentHafazanMonth');
        var yearEl = document.getElementById('parentHafazanYear');
        var month = monthEl ? parseInt(monthEl.value) : new Date().getMonth() + 1;
        var year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();

        // PASTIKAN valid numbers
        if (isNaN(month) || month < 1 || month > 12) month = new Date().getMonth() + 1;
        if (isNaN(year)) year = new Date().getFullYear();

        filtered = filtered.filter(function(r) {
            var parts = r.date.split('-');
            return parseInt(parts[0]) === year && parseInt(parts[1]) === month;
        });

        var monthNames = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                         'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
        filterDescription = monthNames[month] + ' ' + year;
    } else if (filterType === 'year') {
        var yearEl = document.getElementById('parentHafazanYear');
        var year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();
        if (isNaN(year)) year = new Date().getFullYear();

        filtered = filtered.filter(function(r) {
            return parseInt(r.date.split('-')[0]) === year;
        });
        filterDescription = 'Tahun ' + year;
    } else if (filterType === 'custom') {
        var dateFrom = document.getElementById('parentHafazanDateFrom').value;
        var dateTo = document.getElementById('parentHafazanDateTo').value;
        if (dateFrom && dateTo) {
            filtered = filtered.filter(function(r) {
                return r.date >= dateFrom && r.date <= dateTo;
            });
            filterDescription = formatDateP(dateFrom) + ' - ' + formatDateP(dateTo);
        }
    }

    // Status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(function(r) { return r.status === statusFilter; });
    }

    // Session filter
    if (sessionFilter !== 'all') {
        filtered = filtered.filter(function(r) { return r.session === sessionFilter; });
    }

    var totalFiltered = filtered.length;

    // Sort newest first
    filtered.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Apply limit
    var displayCount = filtered.length;
    if (limit !== 'all') {
        var limitNum = parseInt(limit);
        if (filtered.length > limitNum) {
            filtered = filtered.slice(0, limitNum);
            displayCount = limitNum;
        }
    }

    // Update info text - LEBIH JELAS
    var infoEl = document.getElementById('parentHafazanResultsInfo');
    if (infoEl) {
        if (totalFiltered === 0) {
            // TIADA REKOD
            infoEl.innerHTML = '⚠️ <strong>Tiada rekod</strong> untuk ' + (filterDescription || 'filter ini');
            infoEl.style.color = '#ef4444';
        } else if (totalFiltered === parentHafazanAllRecords.length) {
            // SEMUA REKOD
            infoEl.innerHTML = '📊 Menunjukkan <strong>' + displayCount + '</strong> dari <strong>' + totalFiltered + '</strong> rekod';
            infoEl.style.color = '#7c3aed';
        } else {
            // FILTERED
            infoEl.innerHTML = '🔍 Menunjukkan <strong>' + displayCount + '</strong> dari <strong>' + totalFiltered + '</strong> rekod';
            if (filterDescription) {
                infoEl.innerHTML += ' • ' + filterDescription;
            }
            infoEl.innerHTML += ' <small style="color:#94a3b8;">(jumlah keseluruhan: ' + parentHafazanAllRecords.length + ')</small>';
            infoEl.style.color = '#3b82f6';
        }
    }

    // Render
    renderParentRecordsList(filtered);

    // BONUS: Show available months hint kalau filter month dan tiada record
    if (filterType === 'month' && totalFiltered === 0) {
        showAvailableMonthsHint();
    }
}

// BONUS: Tunjuk months yang ada records
function showAvailableMonthsHint() {
    var container = document.getElementById('parentRecordsList');
    if (!container) return;

    // Get months yang ada records
    var monthsWithRecords = {};
    var monthNames = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                     'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    for (var i = 0; i < parentHafazanAllRecords.length; i++) {
        var parts = parentHafazanAllRecords[i].date.split('-');
        var key = parts[0] + '-' + parts[1];
        if (!monthsWithRecords[key]) {
            monthsWithRecords[key] = {
                year: parts[0],
                month: parseInt(parts[1]),
                count: 0
            };
        }
        monthsWithRecords[key].count++;
    }

    var monthsArr = Object.values(monthsWithRecords);
    monthsArr.sort(function(a, b) {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });

    if (monthsArr.length === 0) return;

    var html = '<div style="padding:40px 20px;text-align:center;">';
    html += '<div style="font-size:4rem;margin-bottom:15px;opacity:0.5;">📅</div>';
    html += '<h3 style="color:#1f2937;margin-bottom:10px;">Tiada Rekod Untuk Bulan Ini</h3>';
    html += '<p style="color:#64748b;margin-bottom:20px;">Cuba pilih bulan/tahun lain yang ada rekod:</p>';

    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:600px;margin:0 auto;">';

    for (var i = 0; i < Math.min(monthsArr.length, 12); i++) {
        var m = monthsArr[i];
        html += '<button onclick="jumpToMonth(' + m.year + ', ' + m.month + ')" style="background:#faf5ff;border:2px solid #a78bfa;color:#7c3aed;padding:10px 16px;border-radius:10px;cursor:pointer;font-weight:600;font-size:0.88rem;transition:all 0.3s;">';
        html += monthNames[m.month] + ' ' + m.year;
        html += '<span style="background:#a78bfa;color:white;padding:2px 8px;border-radius:10px;margin-left:6px;font-size:0.75rem;">' + m.count + '</span>';
        html += '</button>';
    }

    html += '</div>';

    if (monthsArr.length > 12) {
        html += '<p style="margin-top:15px;color:#94a3b8;font-size:0.85rem;">+ ' + (monthsArr.length - 12) + ' bulan lagi</p>';
    }

    html += '</div>';

    container.innerHTML = html;
}

// Jump to specific month
function jumpToMonth(year, month) {
    var monthEl = document.getElementById('parentHafazanMonth');
    var yearEl = document.getElementById('parentHafazanYear');

    if (monthEl) monthEl.value = String(month);
    if (yearEl) {
        // Add option if not exist
        var yearStr = String(year);
        var found = false;
        for (var i = 0; i < yearEl.options.length; i++) {
            if (yearEl.options[i].value === yearStr) {
                found = true;
                break;
            }
        }
        if (!found) {
            var opt = document.createElement('option');
            opt.value = yearStr;
            opt.textContent = yearStr;
            yearEl.appendChild(opt);
        }
        yearEl.value = yearStr;
    }

    renderParentRecordsFiltered();

    // Scroll to results
    setTimeout(function() {
        var resultsEl = document.getElementById('parentRecordsList');
        if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
}

// Render records to list (use existing logic from renderParentRecords)
function renderParentRecordsList(records) {
    var container = document.getElementById('parentRecordsList');
    if (!container) return;

    if (records.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>Tiada Rekod Ditemui</p><small>Cuba ubah filter atau reset carian anda.</small></div>';
        return;
    }

    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    var html = '<div class="table-responsive"><table class="table">';
    html += '<thead><tr>';
    html += '<th>Tarikh</th>';
    html += '<th>Sesi</th>';
    html += '<th>Jenis</th>';
    html += '<th>Bacaan</th>';
    html += '<th>Penyemak</th>';
    html += '<th>Markah</th>';
    html += '<th>Status</th>';
    html += '<th>Catatan</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var d = new Date(record.date);
        var dateStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

        var badgeClass = getBadgeClassParent(record.status);

        // Session badge
        var sessionBadge = '';
        if (record.session === 'pagi') {
            sessionBadge = '<span style="background:#fef3c7;color:#78350f;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">🌅 Pagi</span>';
        } else if (record.session === 'petang') {
            sessionBadge = '<span style="background:#fed7aa;color:#7c2d12;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">🌤 Petang</span>';
        } else if (record.session === 'malam') {
            sessionBadge = '<span style="background:#ddd6fe;color:#4c1d95;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">🌙 Malam</span>';
        } else {
            sessionBadge = '<span style="color:#94a3b8;font-size:0.75rem;">-</span>';
        }

        // Reading type badge
        var readingBadge = '';
        var rtTypes = {
            nazirah_khatam: { name: 'Nazirah Khatam', bg: '#dbeafe', color: '#1e40af' },
            nazirah_iqra: { name: 'Nazirah Iqra', bg: '#dbeafe', color: '#1e40af' },
            sabak_baru: { name: 'Sabak Baru', bg: '#fef3c7', color: '#78350f' },
            para_sabak: { name: 'Para Sabak', bg: '#fef3c7', color: '#78350f' },
            mukhtar: { name: 'Mukhtar', bg: '#fef3c7', color: '#78350f' },
            mukhtar_khatam: { name: 'Mukhtar Khatam', bg: '#fef3c7', color: '#78350f' },
            pra_syahadah: { name: 'Pra Syahadah', bg: '#e9d5ff', color: '#5b21b6' },
            syahadah: { name: 'Syahadah', bg: '#e9d5ff', color: '#5b21b6' }
        };

        if (record.readingType && rtTypes[record.readingType]) {
            var rt = rtTypes[record.readingType];
            readingBadge = '<span style="background:' + rt.bg + ';color:' + rt.color + ';padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">' + rt.name + '</span>';
        } else {
            readingBadge = '<span style="color:#94a3b8;font-size:0.75rem;">-</span>';
        }

        // Bacaan text
        var bacaanText = '';
        if (record.isIqra) {
            bacaanText = '<strong>📕 ' + (record.iqraBook || 'Iqra') + '</strong>';
            bacaanText += '<br><small style="color:#64748b;">ms ' + (record.iqraPage || '-') + ' • Baris ' + (record.iqraLineFrom || '-') + '-' + (record.iqraLineTo || '-') + '</small>';
        } else {
            var surahText = formatSurahWithAyatParent(record);
            var juzText = formatJuzDisplayParent(record.juz);
            bacaanText = '<strong>' + surahText + '</strong>';
            bacaanText += '<br><small style="color:#64748b;">' + juzText + '</small>';
        }

        // Checker
        var checkerText = '-';
        if (record.checkerName) {
            var checkerIcon = record.checkerType === 'pelajar' ? '👨‍🎓' : '👨‍🏫';
            checkerText = '<small>' + checkerIcon + ' ' + record.checkerName + '</small>';
        }

        // Score color
        var scoreColor = record.score >= 80 ? '#a78bfa' : record.score >= 60 ? '#f59e0b' : '#ef4444';

        html += '<tr>';
        html += '<td><strong>' + dateStr + '</strong></td>';
        html += '<td>' + sessionBadge + '</td>';
        html += '<td>' + readingBadge + '</td>';
        html += '<td style="max-width:200px;">' + bacaanText + '</td>';
        html += '<td>' + checkerText + '</td>';
        html += '<td><span style="display:inline-flex;align-items:center;justify-content:center;width:45px;height:45px;border-radius:50%;background:' + scoreColor + ';color:white;font-weight:800;font-size:1rem;">' + record.score + '</span></td>';
        html += '<td><span class="badge ' + badgeClass + '">' + record.status + '</span></td>';
        html += '<td style="max-width:200px;font-size:0.82rem;color:#64748b;">' + (record.notes ? '<em>"' + record.notes + '"</em>' : '-') + '</td>';
        html += '</tr>';
    }

    html += '</tbody></table></div>';

    container.innerHTML = html;
}

console.log('✅ Parent Hafazan Filters loaded');

// ===== CHART =====
function renderParentChart(records) {
    var container = document.getElementById('parentChart');
    if (!container) return;

    if (records.length < 2) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Data Tidak Mencukupi</p><small>Perlu sekurang-kurangnya 2 rekod hafazan untuk memaparkan carta purata.</small></div>';
        return;
    }

    var monthlyData = {};
    for (var i = 0; i < records.length; i++) {
        var d = new Date(records[i].date);
        var key = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
        if (!monthlyData[key]) monthlyData[key] = { total: 0, count: 0 };
        monthlyData[key].total += records[i].score;
        monthlyData[key].count++;
    }

    var sortedMonths = Object.keys(monthlyData).sort().slice(-8);
    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    var barsHtml = '';
    var labelsHtml = '';

    for (var i = 0; i < sortedMonths.length; i++) {
        var key = sortedMonths[i];
        var avg = Math.round(monthlyData[key].total / monthlyData[key].count);
        var height = (avg / 100) * 160;
        var color = avg >= 80 ? '#a78bfa' : avg >= 60 ? '#f59e0b' : '#ef4444';
        var monthIdx = parseInt(key.split('-')[1]) - 1;

        barsHtml += '<div class="chart-bar" style="height:' + height + 'px;background:' + color + ';" data-value="' + avg + '%"></div>';
        labelsHtml += '<span>' + months[monthIdx] + '</span>';
    }

    container.innerHTML = '<div class="chart-bar-group">' + barsHtml + '</div><div class="chart-labels">' + labelsHtml + '</div><p style="text-align:center;margin-top:15px;color:#64748b;font-size:0.8rem;">📊 Purata markah bulanan</p>';
}

// ===== ATTENDANCE =====
function initParentAttendance() {
    var monthEl = document.getElementById('parentAttMonth');
    var yearEl = document.getElementById('parentAttYear');

    if (!monthEl || !yearEl) return;

    // Populate year dropdown
    var currentYear = new Date().getFullYear();
    var yearsMap = {};
    yearsMap[currentYear] = true;

    // Collect years from attendance data
    var attendance = appData.attendance || [];
    for (var i = 0; i < attendance.length; i++) {
        var y = parseInt(attendance[i].date.split('-')[0]);
        if (y) yearsMap[y] = true;
    }

    var yearKeys = Object.keys(yearsMap).sort(function(a, b) { return b - a; });
    var yearHtml = '';
    for (var i = 0; i < yearKeys.length; i++) {
        yearHtml += '<option value="' + yearKeys[i] + '">' + yearKeys[i] + '</option>';
    }
    yearEl.innerHTML = yearHtml;

    // Set to latest month/year with data
    var studentId = currentUser ? currentUser.studentId : '';
    var latestDate = null;

    for (var i = 0; i < attendance.length; i++) {
        if (!attendance[i].records) continue;
        for (var j = 0; j < attendance[i].records.length; j++) {
            if (attendance[i].records[j].studentId === studentId) {
                if (!latestDate || attendance[i].date > latestDate) {
                    latestDate = attendance[i].date;
                }
            }
        }
    }

    if (latestDate) {
        var parts = latestDate.split('-');
        yearEl.value = parts[0];
        monthEl.value = String(parseInt(parts[1]));
    } else {
        yearEl.value = String(currentYear);
        monthEl.value = String(new Date().getMonth() + 1);
    }

    loadParentAttendance();
}

function loadParentAttendance() {
    if (!currentUser || !currentUser.studentId) return;

    var studentId = currentUser.studentId;
    var monthEl = document.getElementById('parentAttMonth');
    var yearEl = document.getElementById('parentAttYear');
    if (!monthEl) return;

    var month = parseInt(monthEl.value);
    var year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();

    if (isNaN(month)) month = new Date().getMonth() + 1;
    if (isNaN(year)) year = new Date().getFullYear();

    appData = loadData();
    if (!appData.attendance) appData.attendance = [];

    var records = [];
    for (var i = 0; i < appData.attendance.length; i++) {
        var att = appData.attendance[i];
        if (!att.records) continue;
        for (var j = 0; j < att.records.length; j++) {
            if (att.records[j].studentId === studentId) {
                var parts = att.date.split('-');
                if (parseInt(parts[1]) === month && parseInt(parts[0]) === year) {
                    records.push({ date: att.date, status: att.records[j].status, time: att.records[j].time || '', note: att.records[j].note || '' });
                }
            }
        }
    }

    var hadir = 0, lewat = 0, mc = 0, tidak = 0;
    for (var i = 0; i < records.length; i++) {
        if (records[i].status === 'hadir') hadir++;
        else if (records[i].status === 'lewat') lewat++;
        else if (records[i].status === 'mc') mc++;
        else if (records[i].status === 'tidak_hadir') tidak++;
    }

    var total = records.length;
    var percent = total > 0 ? Math.round(((hadir + lewat) / total) * 100) : 0;

    var el = function(id) { return document.getElementById(id); };
    if (el('parentAttHadir')) el('parentAttHadir').textContent = hadir;
    if (el('parentAttLewat')) el('parentAttLewat').textContent = lewat;
    if (el('parentAttMC')) el('parentAttMC').textContent = mc;
    if (el('parentAttTidak')) el('parentAttTidak').textContent = tidak;

    var fill = el('parentAttPercentFill');
    var text = el('parentAttPercentText');
    if (fill) {
        var color = percent >= 80 ? '#a78bfa' : percent >= 60 ? '#f59e0b' : '#ef4444';
        fill.style.width = percent + '%';
        fill.style.background = color;
    }
    if (text) {
        text.textContent = percent + '% Kehadiran';
        text.style.color = percent >= 80 ? '#a78bfa' : percent >= 60 ? '#f59e0b' : '#ef4444';
    }

    buildParentCalendar(year, month, records);
    buildParentAttList(records);
}

function buildParentCalendar(year, month, records) {
    var calEl = document.getElementById('parentAttCalendar');
    if (!calEl) return;

    var daysInMonth = new Date(year, month, 0).getDate();
    var firstDay = new Date(year, month - 1, 1).getDay();
    var today = new Date();
    var dateStatus = {};
    for (var i = 0; i < records.length; i++) {
        dateStatus[new Date(records[i].date).getDate()] = records[i].status;
    }

    var days = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
    var html = '<div class="parent-cal-grid">';
    for (var i = 0; i < 7; i++) html += '<div class="parent-cal-header">' + days[i] + '</div>';
    for (var i = 0; i < firstDay; i++) html += '<div class="parent-cal-day empty"></div>';

    for (var d = 1; d <= daysInMonth; d++) {
        var isToday = (d === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear());
        var status = dateStatus[d] || null;
        var cls = 'parent-cal-day' + (isToday ? ' today-mark' : '') + (status ? ' status-' + status : ' no-data');
        html += '<div class="' + cls + '">' + d + '</div>';
    }

    html += '</div>';
    html += '<div class="parent-cal-legend">';
    html += '<div class="parent-cal-legend-item"><div class="parent-cal-legend-dot legend-hadir"></div>Hadir</div>';
    html += '<div class="parent-cal-legend-item"><div class="parent-cal-legend-dot legend-lewat"></div>Lewat</div>';
    html += '<div class="parent-cal-legend-item"><div class="parent-cal-legend-dot legend-mc"></div>MC</div>';
    html += '<div class="parent-cal-legend-item"><div class="parent-cal-legend-dot legend-tidak"></div>Tidak Hadir</div>';
    html += '</div>';
    calEl.innerHTML = html;
}

function buildParentAttList(records) {
    var container = document.getElementById('parentAttList');
    if (!container) return;

    if (records.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>Tiada Rekod Kehadiran</p><small>Data kehadiran untuk bulan ini belum dikemas kini.</small></div>';
        return;
    }

    records.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    var html = '';
    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        var d = new Date(r.date);
        var statusText = r.status === 'hadir' ? 'Hadir' : r.status === 'lewat' ? 'Lewat' : r.status === 'mc' ? 'MC' : 'Tidak Hadir';
        var statusIcon = r.status === 'hadir' ? '✅' : r.status === 'lewat' ? '⏰' : r.status === 'mc' ? '🏥' : '❌';

        html += '<div class="parent-att-item att-item-' + r.status + '">';
        html += '<div class="parent-att-date"><div class="parent-att-date-day">' + d.getDate() + '</div><div class="parent-att-date-month">' + months[d.getMonth()] + '</div></div>';
        html += '<div class="parent-att-info"><div class="parent-att-status-text">' + statusText + '</div>';
        if (r.time) html += '<div class="parent-att-time">Masa: ' + r.time + '</div>';
        if (r.note) html += '<div class="parent-att-note">💬 ' + r.note + '</div>';
        html += '</div>';
        html += '<div class="parent-att-icon">' + statusIcon + '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

// ===== PAYMENTS =====
function initParentPayments() {
    var yearEl = document.getElementById('parentPayYear');
    if (yearEl) {
        var cy = new Date().getFullYear();
        var yearsMap = {};

        // Tambah tahun semasa dan sekitar
        yearsMap[cy] = true;
        yearsMap[cy + 1] = true;
        yearsMap[cy - 1] = true;

        // Scan cashbook untuk semua tahun yang ada data
        if (appData.cashbook) {
            for (var i = 0; i < appData.cashbook.length; i++) {
                var e = appData.cashbook[i];
                if (e && e.date) {
                    var y = parseInt(e.date.split('-')[0]);
                    if (y && y > 2020 && y < 2030) {
                        yearsMap[y] = true;
                    }
                }
            }
        }

        // Tambah tahun dari 2022 ke atas
        for (var y = 2022; y <= cy + 1; y++) {
            yearsMap[y] = true;
        }

        // Sort descending
        var yearKeys = Object.keys(yearsMap).sort(function(a, b) { return b - a; });

        var html = '';
        for (var i = 0; i < yearKeys.length; i++) {
            html += '<option value="' + yearKeys[i] + '"' + (parseInt(yearKeys[i]) === cy ? ' selected' : '') + '>' + yearKeys[i] + '</option>';
        }
        yearEl.innerHTML = html;
    }
    loadParentPayments();
}

// ============================================
// ===== LOAD PARENT PAYMENTS =================
// ============================================
function loadParentPayments() {
    if (!currentUser || !currentUser.studentId) return;
    appData = loadData();
    if (!appData.cashbook) appData.cashbook = [];

    var studentId = currentUser.studentId;
    var yearEl = document.getElementById('parentPayYear');
    var year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();

    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === studentId) { 
            student = appData.students[i]; 
            break; 
        }
    }
    if (!student) return;

    var payments = [];
    
    for (var i = 0; i < appData.cashbook.length; i++) {
        var entry = appData.cashbook[i];
        
        if (entry.type !== 'debit') continue;
        if (entry._skipStudentMatch) continue;
        
        var desc = (entry.description || '').toUpperCase();
        var cat = (entry.category || '').toUpperCase();
        
        // SKIP non-yuran
        if (desc.indexOf('SUMBANGAN') > -1) continue;
        if (desc.indexOf('INFAQ') > -1) continue;
        if (desc.indexOf('DERMA') > -1) continue;
        if (desc.indexOf('SEDEKAH') > -1) continue;
        if (desc.indexOf('HADIAH') > -1) continue;
        if (desc.indexOf('SAGUHATI') > -1) continue;
        if (desc.indexOf('TERIMA JUALAN') > -1) continue;
        if (desc.indexOf('TERIMA DUIT') > -1) continue;
        if (desc.indexOf('SEWA VAN') > -1) continue;
        if (desc.indexOf('DUIT DARI MUDIR') > -1) continue;
        if (desc.indexOf('DUIT ISI MINYAK') > -1) continue;
        if (desc.indexOf('JUALAN') > -1) continue;
        if (desc.indexOf('PENDAPATAN') > -1) continue;
        
        if (cat === 'DERMA' || cat === 'INFAQ' || cat === 'JUALAN' || cat === 'PENDAPATAN LAIN') continue;

                // ===== CHECK ZAKAT DISTRIBUTION (AUTO-DETECT) =====
        if (entry.zakatDistribution && entry.zakatDistribution.length > 0) {
            var zakatMatch = false;
            for (var zd = 0; zd < entry.zakatDistribution.length; zd++) {
                if (entry.zakatDistribution[zd].studentId === studentId) {
                    zakatMatch = true;
                    
                    // Clone entry dengan amount yang diagihkan
                    var zakatEntry = JSON.parse(JSON.stringify(entry));
                    zakatEntry.amount = entry.zakatDistribution[zd].amount;
                    zakatEntry._numStudents = 1;
                    zakatEntry._isZakatShare = true;
                    zakatEntry.studentId = studentId;
                    
                    // Check tahun
                    var zMatchYear = false;
                    var zYearMatches = desc.match(/\b(20\d{2})\b/g);
                    if (zYearMatches) {
                        for (var zy = 0; zy < zYearMatches.length; zy++) {
                            if (parseInt(zYearMatches[zy]) === year) { zMatchYear = true; break; }
                        }
                    } else {
                        if (parseInt(entry.date.split('-')[0]) === year) zMatchYear = true;
                    }
                    
                    if (zMatchYear) {
                        payments.push(zakatEntry);
                    }
                    break;
                }
            }
            if (zakatMatch) continue; // Skip normal matching
        }

        // CHECK MATCH STUDENT
        var isMatchStudent = false;
        
        if (entry.studentId && entry.studentId === studentId) {
            isMatchStudent = true;
        }
        
        // Method 2: Nama pelajar dalam description
if (!isMatchStudent && (desc.indexOf('YURAN') > -1 || desc.indexOf('TAJAAN') > -1 || desc.indexOf('ZAKAT') > -1 || desc.indexOf('BANTUAN') > -1 || cat.indexOf('ZAKAT') > -1 || cat.indexOf('YURAN') > -1) && student.name) {
    var studentNameUpper = student.name.toUpperCase();
    
    // Full name match
    if (desc.indexOf(studentNameUpper) > -1) {
        isMatchStudent = true;
    } else {
        var nameParts = studentNameUpper.split(/\s+/);
        
        // First + second name
        if (nameParts.length >= 2) {
            var shortName = nameParts[0] + ' ' + nameParts[1];
            if (desc.indexOf(shortName) > -1) {
                isMatchStudent = true;
            }
        }
        
        // First name dalam pattern berbeza
                // First name dalam pattern berbeza
        if (!isMatchStudent && nameParts.length >= 2) {
            // Skip generic names
            var skipNames = ['MUHAMMAD', 'MOHD', 'SITI', 'NUR', 'AHMAD', 'ABU', 'ABDUL', 'WAN', 'NIK', 'CHE'];
            var firstName = nameParts[0];
            var matchName = firstName;
            
            // Kalau nama generic, guna nama KEDUA
            if (skipNames.indexOf(firstName) > -1) {
                matchName = nameParts[1]; // cth: "KHAIRIL" dari "MUHAMMAD KHAIRIL RAFQI"
            }
            
            if (matchName.length >= 4) {
                // Pattern 1: "YURAN BULANAN - MATCHNAME -"
                var pattern1 = new RegExp('YURAN\\s+\\w+\\s*-\\s*' + matchName + '\\s*-', 'i');
                
                // Pattern 2: "& MATCHNAME"
                var pattern2 = new RegExp('&\\s*' + matchName, 'i');
                
                // Pattern 3: "MATCHNAME &"
                var pattern3 = new RegExp(matchName + '\\s*&', 'i');
                
                // Pattern 4: "DAN MATCHNAME"
                var pattern4 = new RegExp('\\bDAN\\s+' + matchName + '\\b', 'i');
                
                // Pattern 5: "MATCHNAME DAN"
                var pattern5 = new RegExp(matchName + '\\s+DAN\\b', 'i');
                
                if (pattern1.test(desc) || pattern2.test(desc) || pattern3.test(desc) || pattern4.test(desc) || pattern5.test(desc)) {
                    isMatchStudent = true;
                }
            }
        }
    }
}
        
        if (!isMatchStudent) continue;
        
        // CHECK TAHUN: dari description ATAU tarikh
        var matchYear = false;
        
        var yearMatches = desc.match(/\b(20\d{2})\b/g);
        if (yearMatches && yearMatches.length > 0) {
            for (var y = 0; y < yearMatches.length; y++) {
                if (parseInt(yearMatches[y]) === year) {
                    matchYear = true;
                    break;
                }
            }
        } else {
            if (parseInt(entry.date.split('-')[0]) === year) {
                matchYear = true;
            }
        }
        
        if (matchYear) {
    // BARU: Detect berapa pelajar dalam entry
    var numStudentsInEntry = 1;
    var namesPartMatch = desc.match(/YURAN\s+\w+\s*-\s*(.+?)\s*-\s*\w+\s+\d{4}/i);
    if (namesPartMatch) {
        var namesPart = namesPartMatch[1];
        var separators = (namesPart.match(/&|\bDAN\b/g) || []).length;
        numStudentsInEntry = separators + 1;
    }

        // ===== DETECT MULTIPLE STUDENTS DARI "&" ATAU "DAN" =====
    if (desc.indexOf('&') > -1 || desc.indexOf(' DAN ') > -1) {
        var separators = (desc.match(/&|\bDAN\b/g) || []).length;
        if (separators > 0) {
            numStudentsInEntry = separators + 1;
        }
    }
    
    // Clone entry dan tambah maklumat
    var entryClone = JSON.parse(JSON.stringify(entry));
    entryClone._numStudents = numStudentsInEntry;
    payments.push(entryClone);
}
    }

    payments.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

    // CALCULATE TOTAL
var totalAmount = 0;
var lastDate = null;

for (var i = 0; i < payments.length; i++) {
    var entry = payments[i];
    var desc = (entry.description || '').toUpperCase();
    var numStudents = entry._numStudents || 1;        // BARU
    var effectiveAmount = entry.amount / numStudents; // BARU: Bahagi ikut jumlah pelajar
    
    var yearMatches = desc.match(/\b(20\d{2})\b/g);
    var uniqueYears = [];
    if (yearMatches) {
        for (var y = 0; y < yearMatches.length; y++) {
            var yNum = parseInt(yearMatches[y]);
            if (uniqueYears.indexOf(yNum) === -1) {
                uniqueYears.push(yNum);
            }
        }
    }
    
    if (uniqueYears.length > 1) {
        var totalMonths = countAllMonths(entry.description);
        var monthsInThisYear = countMonthsInYear(entry.description, year);
        
        if (totalMonths > 0 && monthsInThisYear > 0) {
            var portionAmount = (effectiveAmount / totalMonths) * monthsInThisYear; // UBAH: effectiveAmount
            totalAmount += portionAmount;
        }
    } else {
        totalAmount += effectiveAmount; // UBAH: effectiveAmount
    }
    
    if (!lastDate || new Date(entry.date) > new Date(lastDate)) {
        lastDate = entry.date;
    }
}

    var el = function(id) { return document.getElementById(id); };
    if (el('parentPayTotal')) el('parentPayTotal').textContent = 'RM ' + totalAmount.toFixed(2);
    if (el('parentPayCount')) el('parentPayCount').textContent = payments.length;
    if (el('parentPayLast')) el('parentPayLast').textContent = lastDate ? formatDateP(lastDate) : '-';

    renderMonthlyStatus(payments, year);
    renderPaymentList(payments);
}

// ============================================
// ===== HELPER: COUNT MONTHS IN YEAR =========
// ============================================
function countMonthsInYear(description, year) {
    if (typeof detectMonthsWithYearFromDescription === 'function') {
        var withYear = detectMonthsWithYearFromDescription(description.toUpperCase());
        var count = 0;
        for (var i = 0; i < withYear.length; i++) {
            if (withYear[i].year === year) count++;
        }
        return count;
    }
    return 0;
}

// ============================================
// ===== HELPER: COUNT ALL MONTHS =============
// ============================================
function countAllMonths(description) {
    if (typeof detectMonthsWithYearFromDescription === 'function') {
        var withYear = detectMonthsWithYearFromDescription(description.toUpperCase());
        return withYear.length;
    }
    return 0;
}

// ============================================
// ===== RENDER MONTHLY STATUS ================
// ============================================
function renderMonthlyStatus(payments, year) {
    var container = document.getElementById('parentMonthlyStatus');
    if (!container) return;

    var monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    var YURAN_SEBULAN = 300;
    var YURAN_PENDAFTARAN = 500;

    // ===== SENARAI PELAJAR YANG GUNA CHRONOLOGICAL FILL =====
    var CHRONOLOGICAL_STUDENTS = [
        'STU004',              // Wildan
        'STU1782290705082',    // Sahil
        'STU1782290830139'     // Rafqi
    ];
    
    var useChronological = currentUser && currentUser.studentId && 
                           CHRONOLOGICAL_STUDENTS.indexOf(currentUser.studentId) > -1;

    var monthData = {};
    for (var i = 1; i <= 12; i++) {
        monthData[i] = { paid: false, amount: 0 };
    }

    // Get startMonth
    var currentStartMonth = 1;
    if (currentUser && currentUser.studentId) {
        for (var s = 0; s < appData.students.length; s++) {
            if (appData.students[s].id === currentUser.studentId) {
                var startDate = appData.students[s].startDate || appData.students[s].createdAt;
                if (startDate) {
                    var sParts = startDate.split('-');
                    if (sParts.length === 3) {
                        var sYear = parseInt(sParts[0]);
                        var sMonth = parseInt(sParts[1]);
                        if (sYear === year) currentStartMonth = sMonth;
                        else if (sYear > year) currentStartMonth = 13;
                    }
                }
                break;
            }
        }
    }

    var normalPayments = [];
    var zakatPayments = [];
    var pendaftaranPayments = [];

    for (var i = 0; i < payments.length; i++) {
        var desc = (payments[i].description || '').toUpperCase();
        var cat = (payments[i].category || '').toUpperCase();
        var amount = payments[i].amount || 0;
        var numStudents = payments[i]._numStudents || 1;

        if (desc.indexOf('YURAN') === -1 && cat.indexOf('YURAN') === -1 && desc.indexOf('TAJAAN') === -1 && desc.indexOf('ZAKAT') === -1 && desc.indexOf('BANTUAN') === -1 && cat.indexOf('ZAKAT') === -1 && cat.indexOf('BANTUAN') === -1) continue;

        if (desc.indexOf('PENDAFTARAN') > -1 && desc.indexOf('BULANAN') > -1) {
            pendaftaranPayments.push({
                description: payments[i].description,
                date: payments[i].date,
                amount: YURAN_PENDAFTARAN / numStudents,
                ref: payments[i].ref
            });
            
            var bulananAmount = (amount - YURAN_PENDAFTARAN) / numStudents;
            if (bulananAmount > 0) {
                normalPayments.push({
                    description: payments[i].description,
                    date: payments[i].date,
                    amount: bulananAmount,
                    ref: payments[i].ref
                });
            }
            continue;
        }

        if (desc.indexOf('PENDAFTARAN') > -1 || cat.indexOf('PENDAFTARAN') > -1) {
            pendaftaranPayments.push({
                description: payments[i].description,
                date: payments[i].date,
                amount: amount / numStudents,
                ref: payments[i].ref
            });
        } else if (desc.indexOf('ZAKAT') > -1 || desc.indexOf('TANGGUNGAN') > -1 || desc.indexOf('BANTUAN') > -1) {
            zakatPayments.push({
                description: payments[i].description,
                date: payments[i].date,
                amount: amount / numStudents,
                ref: payments[i].ref
            });
        } else {
            normalPayments.push({
                description: payments[i].description,
                date: payments[i].date,
                amount: amount / numStudents,
                ref: payments[i].ref
            });
        }
    }

    if (useChronological) {
    // ==========================================
    // ===== CHRONOLOGICAL FILL - GROUP RULES =====
    // ==========================================
    // Same logic as admin - proper carry forward antara tahun
    
    var studentRulesParent = {
        'STU004': [                                                          // Wildan
            { startYear: 2024, startMonth: 1, endYear: 2026, endMonth: 12 },
            { startYear: 2027, startMonth: 1, endYear: 2099, endMonth: 12 }
        ],
        'STU1782290705082': [                                                // Sahil
            { startYear: 2024, startMonth: 1, endYear: 2026, endMonth: 12 },
            { startYear: 2027, startMonth: 1, endYear: 2099, endMonth: 12 }
        ],
        'STU1782290830139': [                                                // Rafqi
            { startYear: 2025, startMonth: 5, endYear: 2026, endMonth: 12 },
            { startYear: 2027, startMonth: 1, endYear: 2099, endMonth: 12 }
        ]
    };
    
    var rulesP = studentRulesParent[currentUser.studentId];
    var currentGroupP = null;
    
    if (rulesP) {
        for (var g = 0; g < rulesP.length; g++) {
            if (year >= rulesP[g].startYear && year <= rulesP[g].endYear) {
                currentGroupP = rulesP[g];
                break;
            }
        }
    }
    
    if (currentGroupP) {
        // ===== STEP 1: Kumpul SEMUA payments dari SEMUA tahun dalam group =====
        var allPaymentsInGroup = [];
        var cashbookForChrono = appData.cashbook || [];
        
        for (var cbIdx = 0; cbIdx < cashbookForChrono.length; cbIdx++) {
            var entry = cashbookForChrono[cbIdx];
            if (entry.type !== 'debit') continue;
            if (entry._skipStudentMatch) continue;
            
            var entryYear = parseInt(entry.date.split('-')[0]);
            var entryMonth = parseInt(entry.date.split('-')[1]);
            
            // Check range group
            if (entryYear < currentGroupP.startYear || entryYear > currentGroupP.endYear) continue;
            if (entryYear === currentGroupP.startYear && entryMonth < currentGroupP.startMonth) continue;
            if (entryYear === currentGroupP.endYear && entryMonth > currentGroupP.endMonth) continue;
            
            var desc = (entry.description || '').toUpperCase();
            var cat = (entry.category || '').toUpperCase();
            
            // Skip non-yuran
            if (desc.indexOf('SUMBANGAN') > -1) continue;
            if (desc.indexOf('INFAQ') > -1) continue;
            if (desc.indexOf('DERMA') > -1) continue;
            if (desc.indexOf('SEDEKAH') > -1) continue;
            if (desc.indexOf('HADIAH') > -1) continue;
            if (desc.indexOf('SAGUHATI') > -1) continue;
            if (cat === 'DERMA' || cat === 'INFAQ' || cat === 'JUALAN' || cat === 'PENDAPATAN LAIN') continue;
            
            // Check description year
            var yearMatchesP = desc.match(/\b(20\d{2})\b/g);
            if (yearMatchesP && yearMatchesP.length > 0) {
                var descInGroupP = false;
                for (var yi = 0; yi < yearMatchesP.length; yi++) {
                    var yrNum = parseInt(yearMatchesP[yi]);
                    if (yrNum >= currentGroupP.startYear && yrNum <= currentGroupP.endYear) {
                        descInGroupP = true;
                        break;
                    }
                }
                if (!descInGroupP) continue;
            }
            
            var matchedAmountP = 0;
            var isMatchStudentP = false;
            
            // Get current student
            var currentStudent = null;
            for (var ss = 0; ss < appData.students.length; ss++) {
                if (appData.students[ss].id === currentUser.studentId) {
                    currentStudent = appData.students[ss];
                    break;
                }
            }
            
            // Method 1: Direct studentId
            if (entry.studentId === currentUser.studentId) {
                isMatchStudentP = true;
                matchedAmountP = entry.amount;
            }
            
            // Method 2: Zakat Distribution
            if (!isMatchStudentP && entry.zakatDistribution) {
                for (var zd = 0; zd < entry.zakatDistribution.length; zd++) {
                    if (entry.zakatDistribution[zd].studentId === currentUser.studentId) {
                        isMatchStudentP = true;
                        matchedAmountP = entry.zakatDistribution[zd].amount;
                        break;
                    }
                }
            }
            
            // Method 3: Nama dalam description
            if (!isMatchStudentP && currentStudent && currentStudent.name) {
                var studentNameUpperP = currentStudent.name.toUpperCase();
                var isYuranEntryP = desc.indexOf('YURAN') > -1 || desc.indexOf('TAJAAN') > -1 || 
                                  desc.indexOf('ZAKAT') > -1 || desc.indexOf('BANTUAN') > -1 ||
                                  cat.indexOf('ZAKAT') > -1 || cat.indexOf('YURAN') > -1;
                
                if (isYuranEntryP) {
                    if (desc.indexOf(studentNameUpperP) > -1) {
                        isMatchStudentP = true;
                    } else {
                        var namePartsP = studentNameUpperP.split(/\s+/);
                        if (namePartsP.length >= 2) {
                            var shortNameP = namePartsP[0] + ' ' + namePartsP[1];
                            if (desc.indexOf(shortNameP) > -1) {
                                isMatchStudentP = true;
                            }
                        }
                        
                        if (!isMatchStudentP && namePartsP.length >= 2) {
                            var skipNamesP = ['MUHAMMAD', 'MOHD', 'SITI', 'NUR', 'AHMAD', 'ABU', 'ABDUL', 'WAN', 'NIK', 'CHE'];
                            var firstNameP = namePartsP[0];
                            var matchNameP = firstNameP;
                            
                            if (skipNamesP.indexOf(firstNameP) > -1) {
                                matchNameP = namePartsP[1];
                            }
                            
                            if (matchNameP.length >= 4) {
                                var p1 = new RegExp('YURAN\\s+\\w+\\s*-\\s*' + matchNameP + '\\s*-', 'i');
                                var p2 = new RegExp('&\\s*' + matchNameP, 'i');
                                var p3 = new RegExp(matchNameP + '\\s*&', 'i');
                                var p4 = new RegExp('\\bDAN\\s+' + matchNameP + '\\b', 'i');
                                var p5 = new RegExp(matchNameP + '\\s+DAN\\b', 'i');
                                
                                if (p1.test(desc) || p2.test(desc) || p3.test(desc) || p4.test(desc) || p5.test(desc)) {
                                    isMatchStudentP = true;
                                }
                            }
                        }
                    }
                    
                    if (isMatchStudentP) {
                        var numStudentsP = 1;
                        var monthKeywordsP = /(JANUARI|FEBRUARI|MAC|APRIL|MEI|JUN|JULAI|OGOS|SEPTEMBER|OKTOBER|NOVEMBER|DISEMBER|JAN|FEB|MAR|APR|MAY|JUL|AUG|SEP|OCT|NOV|DEC)/i;
                        var monthMatchP = desc.match(monthKeywordsP);
                        
                        if (monthMatchP) {
                            var namesPartP = desc.substring(0, monthMatchP.index);
                            var separatorsP = 0;
                            if (namesPartP.indexOf('&') > -1) {
                                separatorsP += (namesPartP.match(/&/g) || []).length;
                            }
                            if (namesPartP.indexOf(' DAN ') > -1) {
                                separatorsP += (namesPartP.match(/\sDAN\s/g) || []).length;
                            }
                            numStudentsP = separatorsP + 1;
                        }
                        
                        if (entry.zakatDistribution && entry.zakatDistribution.length > 0) {
                            numStudentsP = entry.zakatDistribution.length;
                        }
                        
                        matchedAmountP = entry.amount / numStudentsP;
                    }
                }
            }
            
            if (isMatchStudentP && matchedAmountP > 0) {
                allPaymentsInGroup.push({
                    date: entry.date,
                    amount: matchedAmountP,
                    year: entryYear
                });
            }
        }
        
        // ===== STEP 2: Sort by date =====
        allPaymentsInGroup.sort(function(a, b) { return a.date.localeCompare(b.date); });
        
        // ===== STEP 3: Generate months untuk WHOLE GROUP =====
        var groupMonthsP = [];
        for (var yr = currentGroupP.startYear; yr <= currentGroupP.endYear; yr++) {
            var mStart = (yr === currentGroupP.startYear) ? currentGroupP.startMonth : 1;
            var mEnd = (yr === currentGroupP.endYear) ? currentGroupP.endMonth : 12;
            for (var mo = mStart; mo <= mEnd; mo++) {
                groupMonthsP.push({
                    year: yr,
                    month: mo,
                    paid: false,
                    amount: 0
                });
            }
        }
        
        // ===== STEP 4: Fill chronologically ACROSS YEARS =====
        for (var p = 0; p < allPaymentsInGroup.length; p++) {
            var payment = allPaymentsInGroup[p];
            var remaining = payment.amount;
            
            for (var m = 0; m < groupMonthsP.length && remaining > 0; m++) {
                if (groupMonthsP[m].paid) continue;
                
                var needed = YURAN_SEBULAN - groupMonthsP[m].amount;
                if (needed <= 0) {
                    groupMonthsP[m].paid = true;
                    continue;
                }
                
                var toAdd = Math.min(remaining, needed);
                toAdd = Math.round(toAdd * 100) / 100;
                
                groupMonthsP[m].amount += toAdd;
                groupMonthsP[m].amount = Math.round(groupMonthsP[m].amount * 100) / 100;
                
                if (groupMonthsP[m].amount >= YURAN_SEBULAN) {
                    groupMonthsP[m].paid = true;
                }
                
                remaining -= toAdd;
                remaining = Math.round(remaining * 100) / 100;
            }
        }
        
        // ===== STEP 5: Extract HANYA bulan untuk filter year =====
        for (var m = 0; m < groupMonthsP.length; m++) {
            if (groupMonthsP[m].year === year) {
                monthData[groupMonthsP[m].month] = {
                    paid: groupMonthsP[m].paid,
                    amount: groupMonthsP[m].amount
                };
            }
        }
    }
}
else {
        // Process normal payments (assign to detected months)
        for (var i = 0; i < normalPayments.length; i++) {
            var entry = normalPayments[i];
            var desc = (entry.description || '').toUpperCase();
            var amount = entry.amount || 0;

            var detectedMonthsWithYear = typeof detectMonthsWithYearFromDescription === 'function' 
                ? detectMonthsWithYearFromDescription(desc) : [];

            if (detectedMonthsWithYear.length > 0) {
                var monthsForThisYear = detectedMonthsWithYear.filter(function(item) {
                    return item.year === year;
                });

                if (monthsForThisYear.length > 0) {
                    var perMonth = amount / detectedMonthsWithYear.length;
                    
                    for (var dm = 0; dm < monthsForThisYear.length; dm++) {
                        var month = monthsForThisYear[dm].month;
                        if (month >= 1 && month <= 12) {
                            monthData[month].amount += perMonth;
                            if (monthData[month].amount >= YURAN_SEBULAN) {
                                monthData[month].paid = true;
                            }
                        }
                    }
                }
            } else {
                var payMonth = parseInt(entry.date.split('-')[1]);
                var payYear = parseInt(entry.date.split('-')[0]);
                if (payYear === year) {
                    monthData[payMonth].amount += amount;
                    if (monthData[payMonth].amount >= YURAN_SEBULAN) {
                        monthData[payMonth].paid = true;
                    }
                }
            }
        }

        // Process zakat (fill from Jan)
        zakatPayments.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
        
        var totalZakat = 0;
        for (var i = 0; i < zakatPayments.length; i++) {
            var zYear = parseInt(zakatPayments[i].date.split('-')[0]);
            if (zYear === year) {
                totalZakat += zakatPayments[i].amount || 0;
            }
        }

        if (totalZakat > 0) {
            var remaining = totalZakat;
            
            for (var m = 1; m <= 12 && remaining > 0; m++) {
                if (monthData[m].paid) continue;
                
                var needed = YURAN_SEBULAN - monthData[m].amount;
                
                if (needed <= 0) {
                    monthData[m].paid = true;
                    continue;
                }

                if (remaining >= needed) {
                    monthData[m].amount += needed;
                    monthData[m].paid = true;
                    remaining -= needed;
                } else {
                    monthData[m].amount += remaining;
                    remaining = 0;
                }
            }
        }
    }

    // Process pendaftaran
    var totalPendaftaran = 0;
    var pendaftaranDate = null;
    
    for (var i = 0; i < pendaftaranPayments.length; i++) {
        totalPendaftaran += pendaftaranPayments[i].amount || 0;
        if (!pendaftaranDate || pendaftaranPayments[i].date < pendaftaranDate) {
            pendaftaranDate = pendaftaranPayments[i].date;
        }
    }

    // ===== RENDER =====
    var cm = new Date().getMonth() + 1;
    var cy = new Date().getFullYear();

    var html = '';

    if (totalPendaftaran > 0) {
        html += '<div style="grid-column:1/-1;margin-bottom:15px;">';
        html += '<div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:12px;padding:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;">';
        html += '<div style="display:flex;align-items:center;gap:15px;">';
        html += '<div style="font-size:2.5rem;">🎓</div>';
        html += '<div>';
        html += '<div style="font-size:0.78rem;color:#78350f;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Yuran Pendaftaran (Sekali Sahaja)</div>';
        html += '<div style="font-size:1.05rem;color:#1f2937;font-weight:800;margin-top:3px;">';
        if (pendaftaranDate) {
            html += '📅 Dibayar pada ' + formatDateP(pendaftaranDate);
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div style="font-size:1.6rem;font-weight:900;color:#92400e;">RM ' + totalPendaftaran.toFixed(2) + '</div>';
        html += '<div style="font-size:0.78rem;color:#78350f;font-weight:700;margin-top:3px;">✅ Telah Dibayar</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }

    // Load overrides
var overrides = {};
if (currentUser && currentUser.studentId && appData.yuranOverrides) {
    for (var key in appData.yuranOverrides) {
        if (key.indexOf(currentUser.studentId + '_' + year + '_') === 0) {
            var parts = key.split('_');
            var monthNum = parseInt(parts[parts.length - 1]);
            overrides[monthNum] = appData.yuranOverrides[key];
        }
    }
}

for (var m = 1; m <= 12; m++) {
    var isFuture = (year > cy) || (year === cy && m > cm);
    var isBelumDaftar = (m < currentStartMonth);
    var override = overrides[m];
    
    var cls, status, displayAmount, extraStyle = '', overrideNote = '';
    
    // CHECK OVERRIDE FIRST
    if (override) {
        if (override.status === 'not_required') {
            cls = 'month-card';
            status = '🚫';
            displayAmount = 'TIDAK PERLU BAYAR';
            extraStyle = 'background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border-color:#9ca3af;';
            if (override.notes) {
                overrideNote = '<div style="font-size:0.7rem;color:#4b5563;margin-top:5px;font-style:italic;padding:5px;background:rgba(255,255,255,0.5);border-radius:6px;">📝 ' + override.notes + '</div>';
            }
        } else if (override.status === 'paid') {
            cls = 'month-card';
            status = '✏️';
            displayAmount = 'RM ' + (override.amount || 300).toFixed(2);
            extraStyle = 'background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-color:#8b5cf6;';
            if (override.notes) {
                overrideNote = '<div style="font-size:0.7rem;color:#5b21b6;margin-top:5px;font-style:italic;padding:5px;background:rgba(255,255,255,0.5);border-radius:6px;">📝 ' + override.notes + '</div>';
            }
        } else if (override.status === 'unpaid') {
            cls = 'month-card unpaid';
            status = '❌';
            displayAmount = 'Belum bayar';
            if (override.notes) {
                overrideNote = '<div style="font-size:0.7rem;color:#991b1b;margin-top:5px;font-style:italic;padding:5px;background:rgba(255,255,255,0.5);border-radius:6px;">📝 ' + override.notes + '</div>';
            }
        }
    } else if (isBelumDaftar) {
        cls = 'month-card future';
        status = '📅';
        displayAmount = 'Belum Daftar';
    } else if (isFuture) {
        cls = 'month-card future';
        status = '⏳';
        displayAmount = '-';
    } else if (monthData[m].paid) {
        cls = 'month-card paid';
        status = '✅';
        displayAmount = 'RM ' + monthData[m].amount.toFixed(2);
    } else if (monthData[m].amount > 0) {
        cls = 'month-card unpaid';
        status = '⚠️';
        displayAmount = 'RM ' + monthData[m].amount.toFixed(2);
    } else {
        cls = 'month-card unpaid';
        status = '❌';
        displayAmount = 'Belum bayar';
    }

    // Kalau ada payment atau override paid, boleh klik untuk lihat resit
    var isClickable = (monthData[m].paid || monthData[m].amount > 0 || (override && override.status === 'paid'));
    var clickHandler = isClickable ? 'onclick="openMonthReceipt(' + m + ', ' + year + ')"' : '';
    var cursorStyle = isClickable ? 'cursor:pointer;' : '';
    var hoverTitle = isClickable ? 'title="Klik untuk lihat resit"' : '';

    html += '<div class="' + cls + '" ' + clickHandler + ' ' + hoverTitle + ' style="' + extraStyle + cursorStyle + 'transition:all 0.3s;">';
    html += '<div class="month-card-name">' + monthNames[m - 1] + '</div>';
    html += '<div class="month-card-status">' + status + '</div>';
    html += '<div class="month-card-amount">' + displayAmount + '</div>';
    if (overrideNote) html += overrideNote;
    if (isClickable) html += '<div style="font-size:0.65rem;color:#7c3aed;margin-top:5px;font-weight:700;">👆 Klik untuk resit</div>';
    html += '</div>';
}

container.innerHTML = html;
}

// ============================================
// ===== DETECT MONTHS WITH YEAR ==============
// ============================================
function detectMonthsWithYearFromDescription(desc) {
    var monthNamesFull = ['JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'];
    var monthShort = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGO', 'SEP', 'OKT', 'NOV', 'DIS'];
    
    var result = [];

    var yearMatches = desc.match(/\b(20\d{2})\b/g);
    if (!yearMatches) {
        return result;
    }
    
    var years = [];
    for (var i = 0; i < yearMatches.length; i++) {
        var y = parseInt(yearMatches[i]);
        if (years.indexOf(y) === -1) years.push(y);
    }
    years.sort();

    var foundMonths = [];
    
    for (var m = 0; m < monthNamesFull.length; m++) {
        var pos = desc.indexOf(monthNamesFull[m]);
        while (pos !== -1) {
            foundMonths.push({
                month: m + 1,
                position: pos,
                name: monthNamesFull[m]
            });
            pos = desc.indexOf(monthNamesFull[m], pos + 1);
        }
    }
    
    if (foundMonths.length === 0) {
        for (var m = 0; m < monthShort.length; m++) {
            var regex = new RegExp('\\b' + monthShort[m] + '\\b', 'g');
            var match;
            while ((match = regex.exec(desc)) !== null) {
                foundMonths.push({
                    month: m + 1,
                    position: match.index,
                    name: monthShort[m]
                });
            }
        }
    }

    if (foundMonths.length === 0) return result;

    foundMonths.sort(function(a, b) { return a.position - b.position; });

    var yearPositions = [];
    for (var i = 0; i < years.length; i++) {
        var yStr = String(years[i]);
        var pos = desc.indexOf(yStr);
        while (pos !== -1) {
            yearPositions.push({ year: years[i], position: pos });
            pos = desc.indexOf(yStr, pos + 1);
        }
    }
    yearPositions.sort(function(a, b) { return a.position - b.position; });

    var hasRange = desc.indexOf(' - ') > -1 || desc.indexOf(' HINGGA ') > -1;
    
    if (hasRange && foundMonths.length === 2 && years.length === 1) {
        var startM = foundMonths[0].month;
        var endM = foundMonths[1].month;
        var theYear = years[0];

        if (startM <= endM) {
            for (var m = startM; m <= endM; m++) {
                result.push({ month: m, year: theYear });
            }
            return result;
        }
    }

    for (var i = 0; i < foundMonths.length; i++) {
        var monthPos = foundMonths[i].position;
        var assignedYear = years[years.length - 1];
        
        for (var j = 0; j < yearPositions.length; j++) {
            if (yearPositions[j].position > monthPos) {
                assignedYear = yearPositions[j].year;
                break;
            }
        }
        
        result.push({
            month: foundMonths[i].month,
            year: assignedYear
        });
    }

    return result;
}

// ============================================
// ===== BACKWARD COMPATIBILITY ===============
// ============================================
function detectMonthsFromDescription(desc, year) {
    var withYear = detectMonthsWithYearFromDescription(desc);
    var filtered = withYear.filter(function(item) {
        return item.year === year;
    });
    return filtered.map(function(item) {
        return item.month;
    });
}

function renderPaymentList(payments) {
    var container = document.getElementById('parentPayList');
    if (!container) return;

    if (payments.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">💸</div><p>Tiada Rekod Pembayaran</p><small>Belum ada transaksi yang direkodkan.</small></div>';
    }

    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    var html = '';

    for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        var d = new Date(p.date);

        html += '<div class="parent-pay-item">';
        html += '<div class="parent-pay-date"><div class="parent-pay-date-day">' + d.getDate() + '</div><div class="parent-pay-date-month">' + months[d.getMonth()] + ' ' + d.getFullYear() + '</div></div>';
        html += '<div class="parent-pay-info"><div class="parent-pay-desc">' + p.description + '</div><div class="parent-pay-meta">📌 ' + p.category + (p.payMethod ? ' • 💳 ' + p.payMethod : '') + (p.ref ? ' • 🧾 ' + p.ref : '') + '</div></div>';
        html += '<div style="text-align:right;"><div class="parent-pay-amount">RM ' + p.amount.toFixed(2) + '</div></div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

// ===== GALLERY =====
function initParentGallery() { loadParentGallery(); }

function loadParentGallery() {
    var container = document.getElementById('parentGalleryContainer');
    if (!container) return;

    appData = loadData();
    if (!appData.gallery) appData.gallery = [];

    var catEl = document.getElementById('parentGalleryCategory');
    var catFilter = catEl ? catEl.value : 'all';

    var filtered = [];
    for (var i = 0; i < appData.gallery.length; i++) {
        if (catFilter === 'all' || appData.gallery[i].category === catFilter) filtered.push(appData.gallery[i]);
    }

    filtered.sort(function(a, b) { return new Date(b.date || b.uploadedAt) - new Date(a.date || a.uploadedAt); });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📸</div><p>Tiada Album</p><small>Belum ada gambar yang dimuat naik.</small></div>';
        return;
    }

    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    var html = '';

    for (var i = 0; i < filtered.length; i++) {
        var album = filtered[i];
        html += '<div class="gallery-album"><div class="gallery-album-header"><div>';
        html += '<h3 class="gallery-album-title"><span class="gallery-category-badge">' + album.category + '</span>' + album.title + '</h3>';
        html += '<div class="gallery-album-meta">';
        if (album.date) { var d = new Date(album.date); html += '📅 ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear(); }
        html += ' • 📷 ' + (album.photos ? album.photos.length : 0) + ' gambar</div>';
        html += '</div></div>';

        if (album.photos && album.photos.length > 0) {
            html += '<div class="gallery-grid">';
            for (var j = 0; j < album.photos.length; j++) {
                html += '<div class="gallery-item" onclick="openParentLightbox(\'' + album.id + '\', ' + j + ')"><img src="' + (album.photos[j].thumb || album.photos[j].url) + '" loading="lazy"><div class="gallery-item-overlay">' + album.title + '</div></div>';
            }
            html += '</div>';
        }
        html += '</div>';
    }
    container.innerHTML = html;
}

function openParentLightbox(albumId, photoIndex) {
    var album = null;
    for (var i = 0; i < appData.gallery.length; i++) {
        if (appData.gallery[i].id === albumId) { album = appData.gallery[i]; break; }
    }
    if (!album || !album.photos) return;

    if (typeof lightboxImages === 'undefined') window.lightboxImages = [];
    if (typeof lightboxIndex === 'undefined') window.lightboxIndex = 0;

    lightboxImages = album.photos.map(function(p) {
        return { url: p.url || p.displayUrl, title: album.title, meta: album.category };
    });
    lightboxIndex = photoIndex;

    if (typeof showLightboxImage === 'function') showLightboxImage();
    var lb = document.getElementById('lightbox');
    if (lb) { lb.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
}

// ===== PRAYER TIMES =====
var prayerData = null;
var currentPrayerZone = 'SGR02';
var prayerCountdownInterval = null;

function initParentPrayerTimes() {
    var savedZone = localStorage.getItem('prayerZone') || 'SGR02';
    currentPrayerZone = savedZone;

    // Set dropdown value
    var zoneSelect = document.getElementById('prayerZone-parent');
    if (zoneSelect) {
        zoneSelect.value = savedZone;

        // Add change listener
        zoneSelect.addEventListener('change', function() {
            changeParentPrayerZone(this.value);
        });
    }

    fetchParentPrayerTimes();
    updateParentDateDisplay();

    if (prayerCountdownInterval) clearInterval(prayerCountdownInterval);
    prayerCountdownInterval = setInterval(updateParentCountdown, 1000);
}

function fetchParentPrayerTimes() {
    var widget = document.getElementById('prayerTimesWidgetParent');
    if (!widget) return;

    // Guna currentPrayerZone (bukan localStorage directly)
    var zone = currentPrayerZone || localStorage.getItem('prayerZone') || 'SGR02';

    console.log('🕌 Fetching prayer times for zone:', zone);

    fetch('https://api.waktusolat.app/v2/solat/' + zone)
        .then(function(response) {
            if (!response.ok) throw new Error('API error');
            return response.json();
        })
        .then(function(data) {
            if (data && data.prayers && data.prayers.length > 0) {
                var today = new Date();
                var todayDay = today.getDate();
                var todayPrayer = null;

                for (var i = 0; i < data.prayers.length; i++) {
                    if (data.prayers[i].day === todayDay) {
                        todayPrayer = data.prayers[i];
                        break;
                    }
                }

                if (!todayPrayer) {
                    todayPrayer = data.prayers[0];
                }

                function fmtTime(timestamp) {
                    if (!timestamp) return '00:00';
                    if (typeof timestamp === 'number') {
                        var d = new Date(timestamp * 1000);
                        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
                    }
                    if (typeof timestamp === 'string') {
                        return timestamp.substring(0, 5);
                    }
                    return '00:00';
                }

                prayerData = {
                    Subuh: fmtTime(todayPrayer.fajr),
                    Syuruk: fmtTime(todayPrayer.syuruk),
                    Zohor: fmtTime(todayPrayer.dhuhr),
                    Asar: fmtTime(todayPrayer.asr),
                    Maghrib: fmtTime(todayPrayer.maghrib),
                    Isyak: fmtTime(todayPrayer.isha)
                };

                var locEl = document.getElementById('prayerLocation-parent');
                if (locEl) locEl.textContent = '📍 ' + (data.place || zone);

                console.log('✅ Prayer times loaded:', prayerData);

                displayParentPrayerTimes();
                updateParentCountdown();
            } else {
                throw new Error('Invalid data');
            }
        })
        .catch(function(err) {
            console.log('❌ Prayer API error:', err.message);
            prayerData = {
                Subuh: '05:50',
                Zohor: '13:15',
                Asar: '16:35',
                Maghrib: '19:25',
                Isyak: '20:35'
            };

            var locEl = document.getElementById('prayerLocation-parent');
            if (locEl) locEl.textContent = '📍 Anggaran';

            displayParentPrayerTimes();
            updateParentCountdown();
        });
}

function changeParentPrayerZone(zone) {
    console.log('🔄 Changing zone to:', zone);
    currentPrayerZone = zone;
    localStorage.setItem('prayerZone', zone);
    fetchParentPrayerTimes();
}

function displayParentPrayerTimes() {
    if (!prayerData) return;
    var prayers = ['Subuh', 'Zohor', 'Asar', 'Maghrib', 'Isyak'];
    for (var i = 0; i < prayers.length; i++) {
        var el = document.getElementById('time-' + prayers[i] + '-parent');
        if (el) el.textContent = formatTime12H(prayerData[prayers[i]]);
    }
    highlightParentPrayer();
}

function formatTime12H(time24) {
    if (!time24) return '-';
    var parts = time24.split(':');
    var h = parseInt(parts[0]);
    var m = parts[1];
    var p = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return h + ':' + m + ' ' + p;
}

function highlightParentPrayer() {
    if (!prayerData) return;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var prayers = ['Subuh', 'Zohor', 'Asar', 'Maghrib', 'Isyak'];
    var current = null;

    for (var i = 0; i < prayers.length; i++) {
        var parts = prayerData[prayers[i]].split(':');
        var pMin = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        if (nowMin >= pMin) current = prayers[i];
    }

    // Specific to parent grid sahaja
    var parentGrid = document.getElementById('prayerTimesGridParent');
    if (!parentGrid) return;

    var cards = parentGrid.querySelectorAll('.prayer-time-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('active', 'passed');
        var cp = cards[i].dataset.prayer;
        if (cp === current) cards[i].classList.add('active');
        else if (prayerData[cp]) {
            var pp = prayerData[cp].split(':');
            if (parseInt(pp[0]) * 60 + parseInt(pp[1]) < nowMin) cards[i].classList.add('passed');
        }
    }
}

function updateParentCountdown() {
    if (!prayerData) return;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var prayers = ['Subuh', 'Zohor', 'Asar', 'Maghrib', 'Isyak'];
    var next = null;
    var nextTime = null;

    for (var i = 0; i < prayers.length; i++) {
        var parts = prayerData[prayers[i]].split(':');
        var pMin = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        if (pMin > nowMin) { next = prayers[i]; nextTime = prayerData[prayers[i]]; break; }
    }

    if (!next) { next = 'Subuh'; nextTime = prayerData.Subuh; }

        var nameEl = document.getElementById('nextPrayerName-parent');
    var timeEl = document.getElementById('nextPrayerTime-parent');
    if (nameEl) nameEl.textContent = next;
    if (timeEl) timeEl.textContent = formatTime12H(nextTime);

    var parts = nextTime.split(':');
    var target = new Date();
    target.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
    if (next === 'Subuh' && nowMin >= parseInt(prayerData.Isyak.split(':')[0]) * 60) target.setDate(target.getDate() + 1);

    var diff = Math.max(0, target - now);
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

        var hEl = document.getElementById('countdownHours-parent');
    var mEl = document.getElementById('countdownMinutes-parent');
    var sEl = document.getElementById('countdownSeconds-parent');
    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent = String(m).padStart(2, '0');
    if (sEl) sEl.textContent = String(s).padStart(2, '0');
}

function updateParentDateDisplay() {
    var now = new Date();
    var months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    var days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

        var masihiEl = document.getElementById('prayerDateMasihi-parent');
    if (masihiEl) masihiEl.textContent = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

    // Hijri
    fetch('https://api.aladhan.com/v1/gToH/' + now.getDate() + '-' + (now.getMonth() + 1) + '-' + now.getFullYear())
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data && data.data && data.data.hijri) {
                var h = data.data.hijri;
                                var hijriEl = document.getElementById('prayerDateHijri-parent');
                if (hijriEl) hijriEl.textContent = h.day + ' ' + h.month.en + ' ' + h.year + ' H';
            }
        })
        .catch(function() {});
}

// ===== SCHEDULE =====
function initParentSchedule() { renderParentSchedule(); }

function renderParentSchedule() {
    var container = document.getElementById('parentScheduleContent');
    if (!container) return;

    appData = loadData();
    if (!appData.schedule) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;">Jadual belum ditetapkan</div>';
        return;
    }

    var dayEl = document.getElementById('parentScheduleDay');
    var dayType = dayEl ? dayEl.value : 'weekday';
    var items = appData.schedule[dayType] || appData.schedule.weekday || [];

    // Auto-detect day type
    var today = new Date();
    var todayDay = today.getDay();
    if (todayDay === 5) {
        if (dayEl) dayEl.value = 'friday';
        items = appData.schedule.friday || appData.schedule.weekday || [];
    } else if (todayDay === 0 || todayDay === 6) {
        if (dayEl) dayEl.value = 'weekend';
        items = appData.schedule.weekend || appData.schedule.weekday || [];
    }

    var nowHours = today.getHours();
    var nowMinutes = nowHours * 60 + today.getMinutes();
    var currentActivity = null;
    var nextActivity = null;

    // Find current & next activity
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item.time || item.auto) continue;

        var startParts = item.time.split(':');
        var endParts = (item.endTime || '').split(':');
        var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1] || 0);
        var endMin = endParts.length === 2 ? parseInt(endParts[0]) * 60 + parseInt(endParts[1] || 0) : startMin + 60;

        if (nowMinutes >= startMin && nowMinutes < endMin) {
            currentActivity = item;
        } else if (nowMinutes < startMin && !nextActivity) {
            nextActivity = item;
        }
    }

    // Today's highlight
    var highlightEl = document.getElementById('todayScheduleHighlight');
    if (highlightEl) {
        if (currentActivity) {
            highlightEl.style.display = 'block';
            highlightEl.innerHTML = '<div style="display:flex;align-items:center;gap:12px;">' +
                '<span style="font-size:2rem;">▶️</span>' +
                '<div>' +
                '<strong style="color:#78350f;">Sedang Berlangsung:</strong>' +
                '<div style="font-size:1.1rem;font-weight:800;color:#1f2937;">' + (currentActivity.icon || '') + ' ' + currentActivity.activity + '</div>' +
                '<small style="color:#92400e;">' + formatTime12HParent(currentActivity.time) + ' - ' + formatTime12HParent(currentActivity.endTime) + '</small>' +
                '</div></div>';
        } else if (nextActivity) {
            highlightEl.style.display = 'block';
            highlightEl.innerHTML = '<div style="display:flex;align-items:center;gap:12px;">' +
                '<span style="font-size:2rem;">⏳</span>' +
                '<div>' +
                '<strong style="color:#78350f;">Seterusnya:</strong>' +
                '<div style="font-size:1.1rem;font-weight:800;color:#1f2937;">' + (nextActivity.icon || '') + ' ' + nextActivity.activity + '</div>' +
                '<small style="color:#92400e;">' + formatTime12HParent(nextActivity.time) + ' - ' + formatTime12HParent(nextActivity.endTime) + '</small>' +
                '</div></div>';
        } else {
            highlightEl.style.display = 'none';
        }
    }

    // Render schedule table
    var html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<thead><tr style="background:#7c3aed;color:white;">';
    html += '<th style="padding:12px 15px;text-align:left;border-radius:10px 0 0 0;">Waktu</th>';
    html += '<th style="padding:12px 15px;text-align:left;border-radius:0 10px 0 0;">Aktiviti</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var timeStart = item.time || '';
        var timeEnd = item.endTime || '';

        if (item.auto && item.prayerKey && prayerData && prayerData[item.prayerKey]) {
            timeStart = prayerData[item.prayerKey];
        }

        var timeDisplay = timeStart ? formatTime12HParent(timeStart) + (timeEnd ? ' - ' + formatTime12HParent(timeEnd) : '') : '';

        // Check if current
        var isCurrent = false;
        if (item === currentActivity) isCurrent = true;

        var rowBg = 'white';
        var borderLeft = '#e2e8f0';
        if (item.type === 'prayer') { rowBg = '#fffbeb'; borderLeft = '#f59e0b'; }
        else if (item.type === 'meal') { rowBg = '#fff1f2'; borderLeft = '#f43f5e'; }
        else if (item.type === 'break') { rowBg = '#faf5ff'; borderLeft = '#a78bfa'; }
        else if (item.type === 'sleep') { rowBg = '#eef2ff'; borderLeft = '#6366f1'; }

        if (isCurrent) {
            rowBg = '#fef3c7';
            borderLeft = '#f59e0b';
        }

        html += '<tr style="background:' + rowBg + ';border-left:4px solid ' + borderLeft + ';">';

        // Time
        html += '<td style="padding:12px 15px;border-bottom:1px solid #e2e8f0;width:200px;">';
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += '<span style="font-size:1.2rem;">' + (item.icon || '📋') + '</span>';
        html += '<div>';
        html += '<strong style="font-size:0.88rem;">' + timeDisplay + '</strong>';
        if (item.auto) html += '<div><span style="background:#3b82f6;color:white;padding:2px 6px;border-radius:4px;font-size:0.6rem;font-weight:600;">Auto</span></div>';
        if (isCurrent) html += '<div><span style="background:#f59e0b;color:white;padding:2px 6px;border-radius:4px;font-size:0.6rem;font-weight:600;">▶ Sekarang</span></div>';
        html += '</div></div></td>';

        // Activity
        html += '<td style="padding:12px 15px;border-bottom:1px solid #e2e8f0;">';
        html += '<strong style="font-size:0.95rem;">' + item.activity + '</strong>';
        if (item.type === 'prayer') html += ' <span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:4px;font-size:0.7rem;font-weight:700;">Solat</span>';
        html += '</td>';

        html += '</tr>';
    }

    html += '</tbody></table>';

    container.innerHTML = html;
}

function formatTime12HParent(time24) {
    if (!time24 || time24 === 'undefined') return '-';
    var parts = time24.split(':');
    var h = parseInt(parts[0]);
    var m = parts[1] || '00';
    var p = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return h + ':' + m + ' ' + p;
}

function submitScheduleSuggestion() {
    var textEl = document.getElementById('parentSuggestion');
    if (!textEl) return;
    var text = textEl.value.trim();
    if (!text) { if (typeof showToast === 'function') showToast('❌ Sila tulis cadangan'); return; }

    appData = loadData();
    if (!appData.scheduleSuggestions) appData.scheduleSuggestions = [];

    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === currentUser.studentId) { student = appData.students[i]; break; }
    }

    appData.scheduleSuggestions.push({
        id: 'SUG' + Date.now(),
        parentName: currentUser.name || (student ? student.fatherName : 'Ibu Bapa'),
        studentName: student ? student.name : '-',
        text: text,
        date: new Date().toISOString().split('T')[0]
    });

    saveData(appData);
    textEl.value = '';
    if (typeof showToast === 'function') showToast('✅ Cadangan dihantar!');
}

// ===== HELPERS =====
function formatDateP(dateStr) {
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function showToast(message) {
    var toast = document.getElementById('toast');
    var msgEl = document.getElementById('toastMsg');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(function() { toast.classList.add('hidden'); }, 3000);
}

console.log('✅ Parent.js loaded successfully');

// ============================================
// ===== PARENT CALENDAR ======================
// ============================================

var parentCalDate = new Date();

function initParentCalendar() {
    parentCalDate = new Date();
    renderParentCalendar();
}

function renderParentCalendar() {
    var year = parentCalDate.getFullYear();
    var month = parentCalDate.getMonth();

    var months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    var monthYearEl = document.getElementById('parentCalMonthYear');
    if (monthYearEl) {
        monthYearEl.textContent = months[month] + ' ' + year;
    }

    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var totalDays = lastDay.getDate();
    var startWeekday = firstDay.getDay();

    var today = new Date();
    var todayStr = today.toISOString().split('T')[0];

    // Get events for this month
    var eventsByDate = {};
    if (appData.events) {
        for (var i = 0; i < appData.events.length; i++) {
            var event = appData.events[i];
            if (event.status === 'hidden') continue;

            var eventDate = new Date(event.date);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                var dateKey = event.date;
                if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
                eventsByDate[dateKey].push(event);
            }
        }
    }

    var html = '';

    // Previous month padding
    var prevMonthLastDay = new Date(year, month, 0).getDate();
    for (var i = startWeekday - 1; i >= 0; i--) {
        var prevDay = prevMonthLastDay - i;
        html += '<div class="cal-day empty other-month">';
        html += '<div class="cal-day-number">' + prevDay + '</div>';
        html += '</div>';
    }

    // Current month days
    for (var day = 1; day <= totalDays; day++) {
        var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        var date = new Date(year, month, day);
        var dayOfWeek = date.getDay();
        var isToday = dateStr === todayStr;
        var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        var dayEvents = eventsByDate[dateStr] || [];

        var classes = ['cal-day'];
        if (isToday) classes.push('today');
        if (isWeekend) classes.push('weekend');

        var clickHandler = dayEvents.length > 0 ? 'onclick="openParentDayEvents(\'' + dateStr + '\')"' : '';

        html += '<div class="' + classes.join(' ') + '" ' + clickHandler + '>';
        html += '<div class="cal-day-number">' + day + '</div>';
        html += '<div class="cal-day-events">';

        var maxShow = 3;
for (var i = 0; i < Math.min(dayEvents.length, maxShow); i++) {
    var e = dayEvents[i];
    var color = e.color || 'green';
    var featuredClass = e.featured ? ' featured' : '';

    // BARU: Better tooltip
    var tooltipText = e.title;
    if (e.time) tooltipText += ' • ' + e.time;
    if (e.location) tooltipText += ' • 📍 ' + e.location;

    html += '<div class="cal-event color-' + color + featuredClass + '" title="' + tooltipText.replace(/"/g, '&quot;') + '">';
    html += (e.featured ? '⭐ ' : '') + e.title;
    html += '</div>';
}

if (dayEvents.length > maxShow) {
    html += '<div class="cal-event-more">+' + (dayEvents.length - maxShow) + ' lagi</div>';
}

        html += '</div></div>';
    }

    // Next month padding
    var totalCells = startWeekday + totalDays;
    var remaining = 42 - totalCells;
    if (remaining > 7) remaining -= 7;

    for (var i = 1; i <= remaining; i++) {
        html += '<div class="cal-day empty other-month">';
        html += '<div class="cal-day-number">' + i + '</div>';
        html += '</div>';
    }

    var gridEl = document.getElementById('parentCalGrid');
    if (gridEl) {
        gridEl.innerHTML = html;

        // FORCE GRID
        gridEl.style.cssText = 'display: grid !important; grid-template-columns: repeat(7, minmax(0, 1fr)) !important; gap: 6px !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;';

        // Force parent weekdays
        var parentCalContainer = gridEl.closest('.calendar-container');
        if (parentCalContainer) {
            parentCalContainer.style.cssText = 'width: 100% !important; padding: 20px !important; box-sizing: border-box !important;';

            var parentWeekdays = parentCalContainer.querySelector('.cal-weekdays');
            if (parentWeekdays) {
                parentWeekdays.style.cssText = 'display: grid !important; grid-template-columns: repeat(7, minmax(0, 1fr)) !important; gap: 6px !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; margin-bottom: 8px !important;';
            }
        }

        // Force cells
        var cells = gridEl.children;
        for (var c = 0; c < cells.length; c++) {
            cells[c].style.cssText += '; width: 100% !important; min-width: 0 !important; max-width: 100% !important; box-sizing: border-box !important;';
        }
    }
}

function changeParentMonth(direction) {
    parentCalDate.setMonth(parentCalDate.getMonth() + direction);
    renderParentCalendar();
}

function openParentDayEvents(dateStr) {
    var dayEvents = [];
    if (appData.events) {
        for (var i = 0; i < appData.events.length; i++) {
            if (appData.events[i].date === dateStr && appData.events[i].status !== 'hidden') {
                dayEvents.push(appData.events[i]);
            }
        }
    }

    var d = new Date(dateStr);
    var months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    var days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

    var dateDisplay = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

    // BARU: Create modal if not exist
    var modal = document.getElementById('parentDayEventsModal');

    if (!modal) {
        // Create modal dynamically
        var modalHtml = '<div id="parentDayEventsModal" class="modal hidden">';
        modalHtml += '<div class="modal-content" style="max-width:600px;">';
        modalHtml += '<div class="modal-header">';
        modalHtml += '<h2 id="parentDayEventsTitle">📅 Acara</h2>';
        modalHtml += '<button onclick="closeParentDayEvents()" class="btn-close">✕</button>';
        modalHtml += '</div>';
        modalHtml += '<div style="padding:25px;">';
        modalHtml += '<div id="parentDayEventsList"></div>';
        modalHtml += '</div>';
        modalHtml += '</div>';
        modalHtml += '</div>';

        var div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div.firstChild);

        modal = document.getElementById('parentDayEventsModal');
    }

    // BARU: Safe access dengan null check
    var titleEl = document.getElementById('parentDayEventsTitle');
    var listContainer = document.getElementById('parentDayEventsList');

    if (titleEl) {
        titleEl.textContent = '📅 ' + dateDisplay;
    }

    if (!listContainer) {
        console.log('❌ parentDayEventsList not found');
        return;
    }

    if (dayEvents.length === 0) {
        listContainer.innerHTML = '<div class="empty-state" style="padding:30px;">' +
            '<div class="empty-icon">📭</div>' +
            '<p>Tiada acara pada tarikh ini</p>' +
            '</div>';
    } else {
        var categories = {
            class: '📚 Kelas',
            event: '🎉 Majlis',
            activity: '🌟 Aktiviti',
            meeting: '👨‍👩‍👧 Perjumpaan',
            holiday: '🏖️ Cuti',
            special: '⭐ Sambutan'
        };

        var colors = {
            purple: '#8b5cf6',
            blue: '#3b82f6',
            orange: '#f97316',
            green: '#a78bfa',
            red: '#ef4444',
            gold: '#fbbf24'
        };

        var html = '';
        for (var i = 0; i < dayEvents.length; i++) {
            var event = dayEvents[i];
            var color = colors[event.color] || '#a78bfa';

            html += '<div class="day-event-card">';
            html += '<div class="day-event-color" style="background:' + color + ';"></div>';
            html += '<div class="day-event-content" style="flex:1;">';

            if (event.featured) {
                html += '<span style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1f2937;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:800;margin-right:6px;">⭐ FEATURED</span>';
            }
            html += '<span style="background:#faf5ff;color:#7c3aed;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700;">' + (categories[event.category] || event.category) + '</span>';

            html += '<h4 class="day-event-title" style="margin-top:8px;">' + event.title + '</h4>';
            html += '<p class="day-event-desc">' + event.description + '</p>';
            html += '<div class="day-event-meta">';
            if (event.time) html += '<span>🕐 ' + event.time + '</span>';
            if (event.location) html += '<span>📍 ' + event.location + '</span>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }

        listContainer.innerHTML = html;
    }

    // Show modal
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeParentDayEvents() {
    var modal = document.getElementById('parentDayEventsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Auto-init when parent dashboard loads
var originalInitParent = window.initParentDashboard;
window.initParentDashboard = function() {
    if (typeof originalInitParent === 'function') {
        originalInitParent();
    }

    // Init calendar
    setTimeout(function() {
        if (typeof initParentCalendar === 'function') {
            initParentCalendar();
        }
    }, 500);
};

console.log('✅ Parent calendar loaded');

// ============================================
// ===== QUICK ACTIONS ========================
// ============================================

function scrollToSection(elementId) {
    var el = document.getElementById(elementId);
    if (el) {
        var offset = el.offsetTop - 130;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }
}

function chatWithUstaz() {
    if (!currentUser || !currentUser.studentId) {
        window.open('https://wa.me/60192363638', '_blank');
        return;
    }

    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === currentUser.studentId) {
            student = appData.students[i];
            break;
        }
    }

    var studentName = student ? student.name : 'anak saya';
    var className = student ? student.class : '';
    var parentName = currentUser.name || 'Ibu/Bapa';

    var msg = 'Assalamualaikum Ustaz,\n\nSaya ' + parentName + ', ibu/bapa kepada ' + studentName + ' (' + className + ').\n\nSaya ingin bertanya tentang perkembangan anak saya.';

    window.open('https://wa.me/60192363638?text=' + encodeURIComponent(msg), '_blank');
}

console.log('✅ Quick Actions loaded');

// ============================================
// ===== DASHBOARD VISUAL CHARTS ==============
// ============================================

function renderParentDashboard(records) {
    renderDashboardStats(records);
    renderStatusChart(records);
    renderSurahProgressChart(records);
}

function renderDashboardStats(records) {
    var container = document.getElementById('parentDashStats');
    if (!container) return;

    var totalRecords = records.length;
    var totalScore = 0;
    var lancarCount = 0;
    var thisMonthCount = 0;
    var currentMonth = new Date().getMonth();
    var currentYear = new Date().getFullYear();

    var surahSet = [];

    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        totalScore += (r.score || 0);
        if (r.status === 'Lancar') lancarCount++;

        var d = new Date(r.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            thisMonthCount++;
        }

        var surahs = Array.isArray(r.surah) ? r.surah : (r.surah ? [r.surah] : []);
        for (var j = 0; j < surahs.length; j++) {
            if (surahSet.indexOf(surahs[j]) === -1) surahSet.push(surahs[j]);
        }
    }

    var avgScore = totalRecords > 0 ? Math.round(totalScore / totalRecords) : 0;
    var avgColor = avgScore >= 80 ? '#a78bfa' : avgScore >= 60 ? '#f59e0b' : '#ef4444';
    var lancarPercent = totalRecords > 0 ? Math.round((lancarCount / totalRecords) * 100) : 0;

    var html = '';

    html += '<div class="parent-dash-stat">';
    html += '<div class="parent-dash-stat-icon">📚</div>';
    html += '<div class="parent-dash-stat-value" style="color:#3b82f6;">' + totalRecords + '</div>';
    html += '<div class="parent-dash-stat-label">Jumlah Rekod</div>';
    html += '</div>';

    html += '<div class="parent-dash-stat">';
    html += '<div class="parent-dash-stat-icon">⭐</div>';
    html += '<div class="parent-dash-stat-value" style="color:' + avgColor + ';">' + avgScore + '%</div>';
    html += '<div class="parent-dash-stat-label">Purata Markah</div>';
    html += '</div>';

    html += '<div class="parent-dash-stat">';
    html += '<div class="parent-dash-stat-icon">✅</div>';
    html += '<div class="parent-dash-stat-value" style="color:#a78bfa;">' + lancarPercent + '%</div>';
    html += '<div class="parent-dash-stat-label">Kadar Lancar</div>';
    html += '</div>';

    html += '<div class="parent-dash-stat">';
    html += '<div class="parent-dash-stat-icon">📅</div>';
    html += '<div class="parent-dash-stat-value" style="color:#8b5cf6;">' + thisMonthCount + '</div>';
    html += '<div class="parent-dash-stat-label">Bulan Ini</div>';
    html += '</div>';

    container.innerHTML = html;
}

function renderStatusChart(records) {
    var container = document.getElementById('parentStatusChart');
    if (!container) return;

    var lancar = 0, sederhana = 0, ulang = 0, gagal = 0;

    for (var i = 0; i < records.length; i++) {
        var s = records[i].status;
        if (s === 'Lancar') lancar++;
        else if (s === 'Sederhana') sederhana++;
        else if (s === 'Perlu Ulang') ulang++;
        else if (s === 'Tidak Lulus') gagal++;
    }

    var total = records.length || 1;

    // Calculate percentages for conic gradient
    var p1 = (lancar / total) * 100;
    var p2 = p1 + (sederhana / total) * 100;
    var p3 = p2 + (ulang / total) * 100;

    var gradient = 'conic-gradient(' +
        '#a78bfa 0% ' + p1 + '%, ' +
        '#f59e0b ' + p1 + '% ' + p2 + '%, ' +
        '#ef4444 ' + p2 + '% ' + p3 + '%, ' +
        '#1f2937 ' + p3 + '% 100%)';

    var html = '<div class="status-donut">';

    html += '<div class="donut-chart" style="background:' + gradient + ';">';
    html += '<div class="donut-center">';
    html += '<div class="donut-center-num">' + records.length + '</div>';
    html += '<div class="donut-center-label">Total</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="donut-legend">';
    html += '<div class="donut-legend-item"><div class="donut-legend-dot" style="background:#a78bfa;"></div><span>Lancar</span><span class="donut-legend-count">' + lancar + '</span></div>';
    html += '<div class="donut-legend-item"><div class="donut-legend-dot" style="background:#f59e0b;"></div><span>Sederhana</span><span class="donut-legend-count">' + sederhana + '</span></div>';
    html += '<div class="donut-legend-item"><div class="donut-legend-dot" style="background:#ef4444;"></div><span>Perlu Ulang</span><span class="donut-legend-count">' + ulang + '</span></div>';
    html += '<div class="donut-legend-item"><div class="donut-legend-dot" style="background:#1f2937;"></div><span>Tidak Lulus</span><span class="donut-legend-count">' + gagal + '</span></div>';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
}

function renderSurahProgressChart(records) {
    var container = document.getElementById('parentSurahProgress');
    if (!container) return;

    if (typeof SURAH_LIST === 'undefined') {
        container.innerHTML = '<p style="color:#64748b;text-align:center;">Data surah tidak tersedia</p>';
        return;
    }

    // Track surah progress dari records
    var surahProgress = {};

    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.surahDetails) {
            for (var j = 0; j < r.surahDetails.length; j++) {
                var sd = r.surahDetails[j];
                var count = (sd.ayatTo || 0) - (sd.ayatFrom || 1) + 1;
                if (!surahProgress[sd.name]) surahProgress[sd.name] = 0;
                surahProgress[sd.name] = Math.max(surahProgress[sd.name], count);
            }
        } else if (r.surah) {
            var surahs = Array.isArray(r.surah) ? r.surah : [r.surah];
            for (var j = 0; j < surahs.length; j++) {
                surahProgress[surahs[j]] = 999;
            }
        }
    }

    // Count completed
    var completedCount = 0;
    for (var i = 0; i < SURAH_LIST.length; i++) {
        var memorized = surahProgress[SURAH_LIST[i].name] || 0;
        if (memorized >= SURAH_LIST[i].ayat) completedCount++;
    }

    // Update title
    var chartCard = container.closest('.parent-chart-card');
    if (chartCard) {
        var h4 = chartCard.querySelector('h4');
        if (h4) h4.textContent = '📖 Progress Al-Quran (' + completedCount + ' / 114 surah)';
    }

    // Render ALL 114 surahs
    var html = '<div class="surah-progress-list">';

    for (var i = 0; i < SURAH_LIST.length; i++) {
        var surah = SURAH_LIST[i];
        var memorized = surahProgress[surah.name] || 0;
        var totalAyat = surah.ayat;
        var percent = Math.min(100, Math.round((memorized / totalAyat) * 100));

        var barColor = percent >= 100 ? '#a78bfa' : percent >= 50 ? '#f59e0b' : percent > 0 ? '#3b82f6' : '#e2e8f0';
        var textColor = percent >= 100 ? '#7c3aed' : percent > 0 ? '#1f2937' : '#94a3b8';

        html += '<div class="surah-progress-item">';
        html += '<span class="surah-progress-name" style="color:' + textColor + ';">' + surah.no + '. ' + surah.name + '</span>';
        html += '<div class="surah-progress-bar"><div class="surah-progress-fill" style="width:' + percent + '%;background:' + barColor + ';"></div></div>';
        html += '<span class="surah-progress-percent" style="color:' + textColor + ';">' + percent + '%</span>';
        html += '</div>';
    }

    html += '</div>';

    container.innerHTML = html;
}

// ============================================
// ===== TARGET & PROGRESS ====================
// ============================================

function renderTargetProgress(student, records) {
    var container = document.getElementById('targetProgressContent');
    if (!container) return;

    // ===== URUTAN JUZ HAFAZAN =====
    // 30 → 29 → 28 → 27 → 26 → 1 → 2 → 3 → ... → 25
    var juzOrder = [30, 29, 28, 27, 26, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

    // Calculate surah & juz progress
    var surahSet = [];
    var juzSet = [];

    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        var surahs = Array.isArray(r.surah) ? r.surah : (r.surah ? [r.surah] : []);
        for (var j = 0; j < surahs.length; j++) {
            if (surahSet.indexOf(surahs[j]) === -1) surahSet.push(surahs[j]);
        }
        var juzs = Array.isArray(r.juz) ? r.juz : (r.juz ? [r.juz] : []);
        for (var j = 0; j < juzs.length; j++) {
            if (juzSet.indexOf(juzs[j]) === -1) juzSet.push(juzs[j]);
        }
    }

    // ===== CHECK SETIAP JUZ IKUT URUTAN =====
    var completedJuz = [];
    var currentJuz = null;
    var currentJuzProgress = 0;

        for (var i = 0; i < juzOrder.length; i++) {
        var juzNum = juzOrder[i];
        var juzSurahs = getJuzSurahsClean(juzNum);
        var juzTotal = juzSurahs.length;
        var juzDone = 0;

        for (var j = 0; j < juzSurahs.length; j++) {
            if (surahSet.indexOf(juzSurahs[j]) > -1) {
                juzDone++;
            }
        }

        var juzPercent = juzTotal > 0 ? Math.round((juzDone / juzTotal) * 100) : 0;

        if (juzPercent >= 100) {
            completedJuz.push(juzNum);
        } else if (!currentJuz) {
            // Ini juz yang sedang dihafaz (belum habis)
            currentJuz = juzNum;
            currentJuzProgress = juzPercent;
        }
    }

    // Kalau semua juz complete
    if (!currentJuz && completedJuz.length === 30) {
        currentJuz = null; // Khatam Al-Quran!
    } else if (!currentJuz && completedJuz.length > 0) {
        // Cari next juz dalam urutan
        for (var i = 0; i < juzOrder.length; i++) {
            if (completedJuz.indexOf(juzOrder[i]) === -1) {
                currentJuz = juzOrder[i];
                currentJuzProgress = 0;
                break;
            }
        }
    } else if (!currentJuz) {
        currentJuz = 30; // Default mula dari Juz 30
        currentJuzProgress = 0;
    }

    // Overall progress
    var overallPercent = Math.round((completedJuz.length / 30) * 100);
    var isKhatam = completedJuz.length === 30;

    // Get current juz info
    var currentJuzSurahs = currentJuz ? getSurahsInJuz(currentJuz) : [];
    var currentJuzTotal = currentJuzSurahs.length;
    var currentJuzDone = 0;
    if (currentJuz) {
        for (var j = 0; j < currentJuzSurahs.length; j++) {
            if (surahSet.indexOf(currentJuzSurahs[j].name) > -1) currentJuzDone++;
        }
        currentJuzProgress = currentJuzTotal > 0 ? Math.round((currentJuzDone / currentJuzTotal) * 100) : 0;
    }

    // Next juz after current
    var nextJuz = null;
    if (currentJuz) {
        var currentIdx = juzOrder.indexOf(currentJuz);
        if (currentIdx > -1 && currentIdx < juzOrder.length - 1) {
            nextJuz = juzOrder[currentIdx + 1];
        }
    }

    // ===== RENDER =====
    var radius = 55;
    var circumference = 2 * Math.PI * radius;
    var currentRingPercent = currentJuz ? currentJuzProgress : 100;
    var offset = circumference - (currentRingPercent / 100) * circumference;

    var html = '<div class="target-progress-container">';

    // ===== MAIN CARD =====
    html += '<div class="target-main">';
    html += '<div class="target-main-header">';

    if (isKhatam) {
        html += '<div class="target-main-title">🏆 KHATAM AL-QURAN!</div>';
        html += '<div class="target-main-badge">30/30 Juz ✅</div>';
    } else {
        html += '<div class="target-main-title">📖 Sedang Hafaz: Juz ' + currentJuz + '</div>';
        html += '<div class="target-main-badge">' + completedJuz.length + '/30 Juz Selesai</div>';
    }

    html += '</div>';

    html += '<div class="target-ring-container">';

    // Ring
    html += '<div class="target-ring">';
    html += '<svg viewBox="0 0 120 120">';
    html += '<circle class="target-ring-bg" cx="60" cy="60" r="' + radius + '"/>';
    html += '<circle class="target-ring-fill" cx="60" cy="60" r="' + radius + '" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '"/>';
    html += '</svg>';
    html += '<div class="target-ring-text">';
    html += '<div class="target-ring-percent">' + currentRingPercent + '%</div>';
    html += '<div class="target-ring-label">' + (isKhatam ? 'Khatam!' : 'Juz ' + currentJuz) + '</div>';
    html += '</div>';
    html += '</div>';

    // Details
    html += '<div class="target-details">';

    if (isKhatam) {
        html += '<div class="target-detail-row"><span class="target-detail-label">🏆 Status:</span><span class="target-detail-value">Khatam 30 Juz!</span></div>';
    } else {
        html += '<div class="target-detail-row"><span class="target-detail-label">📖 Juz Semasa:</span><span class="target-detail-value">Juz ' + currentJuz + '</span></div>';
        html += '<div class="target-detail-row"><span class="target-detail-label">📊 Progress Juz:</span><span class="target-detail-value">' + currentJuzDone + ' / ' + currentJuzTotal + ' surah</span></div>';
        if (nextJuz) {
            html += '<div class="target-detail-row"><span class="target-detail-label">➡️ Juz Seterusnya:</span><span class="target-detail-value">Juz ' + nextJuz + '</span></div>';
        }
    }

    html += '<div class="target-detail-row"><span class="target-detail-label">✅ Juz Selesai:</span><span class="target-detail-value">' + completedJuz.length + ' / 30</span></div>';
    html += '<div class="target-detail-row"><span class="target-detail-label">📖 Total Surah:</span><span class="target-detail-value">' + surahSet.length + ' / 114</span></div>';
    html += '<div class="target-detail-row"><span class="target-detail-label">📝 Total Rekod:</span><span class="target-detail-value">' + records.length + '</span></div>';

    html += '</div>';
    html += '</div>';

    // ===== KHATAM BANNER =====
    if (isKhatam) {
        html += '<div style="background:linear-gradient(135deg,#fbbf24,#f59e0b);border-radius:14px;padding:25px;text-align:center;color:#1f2937;margin-top:15px;">';
        html += '<div style="font-size:4rem;margin-bottom:8px;">🏆</div>';
        html += '<h3 style="margin:0 0 8px;">Masyaallah! Khatam 30 Juz Al-Quran!</h3>';
        html += '<p style="margin:0;font-size:0.92rem;">Semoga Allah permudahkan istiqamah murajaah</p>';
        html += '</div>';
    }

    html += '</div>';

    // ===== JUZ MILESTONES (Visual Grid) =====
    html += '<div style="margin-top:20px;">';
    html += '<h4 style="margin:0 0 15px;color:#7c3aed;font-size:1rem;">📚 Progress Ikut Juz (Urutan Hafazan)</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;">';

    for (var i = 0; i < juzOrder.length; i++) {
        var juzNum = juzOrder[i];
        var isComplete = completedJuz.indexOf(juzNum) > -1;
        var isCurrent = juzNum === currentJuz;

        var bg = 'white';
        var border = '#e2e8f0';
        var textCol = '#94a3b8';
        var icon = '⬜';

        if (isComplete) {
            bg = '#e9d5ff';
            border = '#a78bfa';
            textCol = '#7c3aed';
            icon = '✅';
        } else if (isCurrent) {
            bg = '#fef3c7';
            border = '#f59e0b';
            textCol = '#92400e';
            icon = '▶️';
        }

        html += '<div style="background:' + bg + ';border:2px solid ' + border + ';border-radius:10px;padding:10px;text-align:center;transition:all 0.3s;">';
        html += '<div style="font-size:1.2rem;">' + icon + '</div>';
        html += '<div style="font-weight:800;color:' + textCol + ';font-size:0.9rem;">Juz ' + juzNum + '</div>';

        if (isCurrent) {
            html += '<div style="font-size:0.72rem;color:#92400e;font-weight:700;margin-top:3px;">' + currentJuzProgress + '%</div>';
        }

        html += '</div>';
    }

    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
}

// ===== HELPER: Get Surahs dalam Juz =====
function getSurahsInJuz(juzNum) {
    if (typeof SURAH_LIST === 'undefined') return [];

    var result = [];
    for (var i = 0; i < SURAH_LIST.length; i++) {
        var surah = SURAH_LIST[i];
        if (!surah.juzList) continue;

        // Hanya include kalau juz ini adalah JUZ UTAMA surah
        // (juz pertama dalam juzList, ATAU juz terakhir untuk surah pendek)
        if (surah.juzList.indexOf(juzNum) > -1) {
            // Kalau surah ada dalam multiple juz, assign ke juz yang PALING BANYAK content
            if (surah.juzList.length === 1) {
                // Surah hanya dalam 1 juz - confirm include
                result.push(surah);
            } else {
                // Surah merentasi beberapa juz
                // Assign ke juz TERAKHIR dalam list (sebab biasanya majority content di situ)
                var lastJuz = surah.juzList[surah.juzList.length - 1];
                if (lastJuz === juzNum) {
                    result.push(surah);
                }
            }
        }
    }
    return result;
}

// ============================================
// ===== ACHIEVEMENT BADGES ===================
// ============================================

function renderAchievements(student, records) {
    var container = document.getElementById('achievementBadges');
    if (!container) return;

    // Define all achievements
    var achievements = [
        {
            id: 'first_record',
            icon: '🌱',
            name: 'Permulaan',
            desc: 'Rekod hafazan pertama',
            check: function() { return records.length >= 1; }
        },
        {
            id: 'ten_records',
            icon: '📚',
            name: '10 Rekod',
            desc: 'Capai 10 rekod hafazan',
            check: function() { return records.length >= 10; }
        },
        {
            id: 'fifty_records',
            icon: '📖',
            name: '50 Rekod',
            desc: 'Capai 50 rekod hafazan',
            check: function() { return records.length >= 50; }
        },
        {
            id: 'first_lancar',
            icon: '⭐',
            name: 'Bintang Pertama',
            desc: 'Status "Lancar" pertama kali',
            check: function() {
                for (var i = 0; i < records.length; i++) {
                    if (records[i].status === 'Lancar') return true;
                }
                return false;
            }
        },
        {
            id: 'score_90',
            icon: '🌟',
            name: 'Cemerlang',
            desc: 'Markah 90 ke atas',
            check: function() {
                for (var i = 0; i < records.length; i++) {
                    if (records[i].score >= 90) return true;
                }
                return false;
            }
        },
        {
            id: 'score_100',
            icon: '💎',
            name: 'Sempurna',
            desc: 'Markah penuh 100!',
            check: function() {
                for (var i = 0; i < records.length; i++) {
                    if (records[i].score >= 100) return true;
                }
                return false;
            }
        },
        {
            id: 'five_surah',
            icon: '📿',
            name: '5 Surah',
            desc: 'Hafaz 5 surah berbeza',
            check: function() {
                var set = [];
                for (var i = 0; i < records.length; i++) {
                    var s = Array.isArray(records[i].surah) ? records[i].surah : [records[i].surah];
                    for (var j = 0; j < s.length; j++) {
                        if (s[j] && set.indexOf(s[j]) === -1) set.push(s[j]);
                    }
                }
                return set.length >= 5;
            }
        },
        {
            id: 'ten_surah',
            icon: '🎖️',
            name: '10 Surah',
            desc: 'Hafaz 10 surah berbeza',
            check: function() {
                var set = [];
                for (var i = 0; i < records.length; i++) {
                    var s = Array.isArray(records[i].surah) ? records[i].surah : [records[i].surah];
                    for (var j = 0; j < s.length; j++) {
                        if (s[j] && set.indexOf(s[j]) === -1) set.push(s[j]);
                    }
                }
                return set.length >= 10;
            }
        },
        {
            id: 'consistency',
            icon: '🔥',
            name: 'Konsisten',
            desc: 'Rekod 3 minggu berturut',
            check: function() {
                if (records.length < 3) return false;
                var weeks = {};
                for (var i = 0; i < records.length; i++) {
                    var d = new Date(records[i].date);
                    var week = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
                    weeks[week] = true;
                }
                var sorted = Object.keys(weeks).sort();
                var consecutive = 1;
                for (var i = 1; i < sorted.length; i++) {
                    if (parseInt(sorted[i]) - parseInt(sorted[i - 1]) === 1) {
                        consecutive++;
                        if (consecutive >= 3) return true;
                    } else {
                        consecutive = 1;
                    }
                }
                return false;
            }
        },
        {
            id: 'juz30_complete',
            icon: '🏆',
            name: 'Khatam Juz 30',
            desc: 'Khatam seluruh Juz Amma',
            check: function() {
                var set = [];
                for (var i = 0; i < records.length; i++) {
                    var s = Array.isArray(records[i].surah) ? records[i].surah : [records[i].surah];
                    for (var j = 0; j < s.length; j++) {
                        if (s[j] && set.indexOf(s[j]) === -1) set.push(s[j]);
                    }
                }
                return set.length >= 37;
            }
        },
        {
            id: 'all_lancar',
            icon: '👑',
            name: 'Raja Hafazan',
            desc: 'Semua rekod status Lancar',
            check: function() {
                if (records.length === 0) return false;
                for (var i = 0; i < records.length; i++) {
                    if (records[i].status !== 'Lancar') return false;
                }
                return true;
            }
        },
        {
            id: 'high_average',
            icon: '🎓',
            name: 'Purata Tinggi',
            desc: 'Purata markah 85+',
            check: function() {
                if (records.length < 5) return false;
                var total = 0;
                for (var i = 0; i < records.length; i++) {
                    total += records[i].score || 0;
                }
                return (total / records.length) >= 85;
            }
        }
    ];

    // Evaluate achievements
    var earnedCount = 0;
    var html = '<div class="achievements-container">';

    for (var i = 0; i < achievements.length; i++) {
        var a = achievements[i];
        var isEarned = a.check();
        if (isEarned) earnedCount++;

        var cardClass = isEarned ? ' earned' : ' locked';

        html += '<div class="achievement-badge-card' + cardClass + '">';
        if (!isEarned) html += '<span class="achievement-badge-lock">🔒</span>';
        html += '<div class="achievement-badge-icon">' + a.icon + '</div>';
        html += '<div class="achievement-badge-name">' + a.name + '</div>';
        html += '<div class="achievement-badge-desc">' + a.desc + '</div>';
        if (isEarned) html += '<div class="achievement-badge-date">✅ Dicapai!</div>';
        html += '</div>';
    }

    html += '</div>';

    // Summary
    html = '<div style="text-align:center;margin-bottom:20px;">' +
        '<span style="font-size:1.1rem;font-weight:800;color:#7c3aed;">' + earnedCount + '</span>' +
        '<span style="color:#64748b;font-size:0.9rem;"> / ' + achievements.length + ' pencapaian diperolehi</span>' +
        '</div>' + html;

    container.innerHTML = html;
}

// ============================================
// ===== WHATSAPP USTAZ LIST ==================
// ============================================

function renderUstazList(student) {
    var container = document.getElementById('parentUstazList');
    if (!container) return;

    // Get teachers from workers or siteContent
    var teachers = [];

    // Try from siteContent (CMS)
    if (appData.siteContent && appData.siteContent.team && appData.siteContent.team.members) {
        var members = appData.siteContent.team.members;
        for (var i = 0; i < members.length; i++) {
            if (members[i].status !== 'hidden' && members[i].phone) {
                teachers.push(members[i]);
            }
        }
    }

    // Fallback: from admins
    if (teachers.length === 0 && appData.admins) {
        for (var i = 0; i < appData.admins.length; i++) {
            teachers.push({
                name: appData.admins[i].name,
                role: 'Admin',
                icon: '👨‍🏫',
                phone: '0192363638'
            });
        }
    }

    // Fallback: default
    if (teachers.length === 0) {
        teachers = [
            { name: 'Mudir', role: 'Pengetua', icon: '👨‍🏫', phone: '0192363638' },
            { name: 'Ustaz Hisyam', role: 'Ustaz Senior', icon: '👨‍🏫', phone: '01161000542' }
        ];
    }

    var studentName = student ? student.name : 'anak saya';
    var className = student ? student.class : '';
    var parentName = currentUser ? currentUser.name : 'Ibu/Bapa';

    var html = '<div class="ustaz-list">';

    for (var i = 0; i < teachers.length; i++) {
        var t = teachers[i];
        var phone = (t.phone || '').replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) phone = '60' + phone.substring(1);

        var msg = 'Assalamualaikum ' + t.name + ',\n\nSaya ' + parentName + ', ibu/bapa kepada ' + studentName + ' (' + className + ').\n\nSaya ingin bertanya tentang perkembangan anak saya.';

        html += '<div class="ustaz-card">';
        html += '<div class="ustaz-card-avatar">' + (t.icon || '👨‍🏫') + '</div>';
        html += '<div class="ustaz-card-info">';
        html += '<div class="ustaz-card-name">' + t.name + '</div>';
        html += '<div class="ustaz-card-role">' + (t.role || 'Ustaz') + '</div>';
        html += '</div>';
        html += '<button class="ustaz-card-wa" onclick="window.open(\'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg) + '\', \'_blank\')" title="WhatsApp ' + t.name + '">💬</button>';
        html += '</div>';
    }

    html += '</div>';

    container.innerHTML = html;
}

// ============================================
// ===== NOTIFIKASI REAL-TIME =================
// ============================================

// ============================================
// ===== NOTIFIKASI ENHANCED ==================
// ============================================

var notifExpanded = false;
var notifDeletedIds = []; // Track deleted notifications

function renderNotifications(student, records) {
    var container = document.getElementById('parentNotifications');
    if (!container) return;

    // Load deleted IDs from localStorage
    var savedDeleted = localStorage.getItem('parentNotifDeleted_' + (student ? student.id : ''));
    if (savedDeleted) {
        try {
            notifDeletedIds = JSON.parse(savedDeleted);
        } catch(e) {
            notifDeletedIds = [];
        }
    }

    var notifications = [];
    var now = new Date();

    // Generate notifications from recent records
    var recentRecords = records.slice().reverse().slice(0, 20);

    for (var i = 0; i < recentRecords.length; i++) {
        var r = recentRecords[i];
        var d = new Date(r.date);
        var daysAgo = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        var timeLabel = '';

        if (daysAgo === 0) timeLabel = 'Hari ini';
        else if (daysAgo === 1) timeLabel = 'Semalam';
        else if (daysAgo <= 7) timeLabel = daysAgo + ' hari lepas';
        else timeLabel = formatDateP(r.date);

        var surahText = '';
        if (r.isIqra) {
            surahText = (r.iqraBook || 'Iqra') + ' ms ' + (r.iqraPage || '-');
        } else {
            surahText = formatSurahWithAyatParent(r);
        }

        var notifId = 'hafazan_' + r.id;

        // Skip if deleted
        if (notifDeletedIds.indexOf(notifId) > -1) continue;

        notifications.push({
            id: notifId,
            type: 'hafazan',
            icon: r.score >= 80 ? '⭐' : r.score >= 60 ? '📝' : '🔄',
            title: 'Rekod Hafazan Baru',
            desc: surahText + ' - ' + r.score + '% (' + r.status + ')',
            time: timeLabel,
            date: r.date,
            isNew: daysAgo <= 1
        });
    }

    // Check attendance notifications
    if (appData.attendance) {
        for (var i = 0; i < appData.attendance.length; i++) {
            var att = appData.attendance[i];
            if (!att.records) continue;

            for (var j = 0; j < att.records.length; j++) {
                if (att.records[j].studentId === student.id) {
                    var attDate = new Date(att.date);
                    var attDaysAgo = Math.floor((now - attDate) / (1000 * 60 * 60 * 24));

                    if (attDaysAgo <= 7) {
                        var status = att.records[j].status;
                        var statusText = status === 'hadir' ? '✅ Hadir' : status === 'lewat' ? '⏰ Lewat' : status === 'mc' ? '🏥 MC' : '❌ Tidak Hadir';
                        var statusIcon = status === 'hadir' ? '✅' : status === 'lewat' ? '⏰' : status === 'mc' ? '🏥' : '❌';

                        var notifId = 'att_' + att.id + '_' + j;

                        // Skip if deleted
                        if (notifDeletedIds.indexOf(notifId) > -1) continue;

                        notifications.push({
                            id: notifId,
                            type: 'attendance',
                            icon: statusIcon,
                            title: 'Kehadiran ' + (att.session || 'Pagi'),
                            desc: statusText + (att.records[j].time ? ' • ' + att.records[j].time : ''),
                            time: attDaysAgo === 0 ? 'Hari ini' : attDaysAgo === 1 ? 'Semalam' : attDaysAgo + ' hari lepas',
                            date: att.date,
                            isNew: attDaysAgo === 0
                        });
                    }
                }
            }
        }
    }

    // Sort by date (newest first)
    notifications.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    if (notifications.length === 0) {
        container.innerHTML =
            '<div class="notif-empty">' +
            '<div class="notif-empty-icon">🔔</div>' +
            '<p style="font-weight:700;color:#64748b;margin-bottom:5px;">Tiada notifikasi</p>' +
            '<small>Semua notifikasi telah dibaca atau dipadam</small>' +
            '</div>';
        return;
    }

    // Build HTML
    var unreadCount = 0;
    for (var i = 0; i < notifications.length; i++) {
        if (notifications[i].isNew) unreadCount++;
    }

    var html = '<div class="notif-container">';

    // Header with actions
    html += '<div class="notif-header-actions">';
    html += '<div>';
    html += '<span class="notif-count-badge">' + notifications.length + ' notifikasi';
    if (unreadCount > 0) {
        html += ' • <strong>' + unreadCount + ' baru</strong>';
    }
    html += '</span>';
    html += '</div>';
    html += '<button class="notif-action-btn" onclick="confirmClearAllNotifs()">🗑 Padam Semua</button>';
    html += '</div>';

    // Notifications list
    html += '<div class="notif-list" id="notifList">';

    var maxShow = notifExpanded ? notifications.length : 3;

    for (var i = 0; i < notifications.length; i++) {
        var n = notifications[i];
        var itemClass = n.isNew ? 'unread' : '';
        var iconClass = n.type === 'hafazan' ? 'hafazan' : n.type === 'attendance' ? 'attendance' : 'general';
        var hiddenClass = i >= maxShow ? 'hidden-collapsed' : '';

        html += '<div class="notif-item ' + itemClass + ' ' + hiddenClass + '" data-notif-id="' + n.id + '" data-index="' + i + '">';
        html += '<div class="notif-icon ' + iconClass + '">' + n.icon + '</div>';
        html += '<div class="notif-content">';
        html += '<div class="notif-title">' + n.title + '</div>';
        html += '<div class="notif-desc">' + n.desc + '</div>';
        html += '<div class="notif-time">🕐 ' + n.time + '</div>';
        html += '</div>';
        html += '<button class="notif-delete-btn" onclick="deleteNotification(\'' + n.id + '\', this)" title="Padam">✕</button>';
        html += '</div>';
    }

    html += '</div>';

    // Show more/less button (only if more than 3)
    if (notifications.length > 3) {
        var btnClass = notifExpanded ? 'expanded' : '';
        var btnText = notifExpanded ? 'Tunjuk Kurang' : 'Tunjuk Lagi (' + (notifications.length - 3) + ' notifikasi)';
        html += '<button class="notif-toggle-btn ' + btnClass + '" onclick="toggleNotifications()">';
        html += '<span>' + btnText + '</span>';
        html += '<span class="notif-toggle-icon">▼</span>';
        html += '</button>';
    }

    html += '</div>';

    // Confirm Modal
    html += '<div id="notifConfirmModal" class="notif-confirm-modal hidden">';
    html += '<div class="notif-confirm-box">';
    html += '<div class="notif-confirm-icon">🗑</div>';
    html += '<h3 id="notifConfirmTitle">Padam Notifikasi?</h3>';
    html += '<p id="notifConfirmDesc">Notifikasi yang dipadam tidak boleh dikembalikan.</p>';
    html += '<div class="notif-confirm-actions">';
    html += '<button class="notif-action-btn" onclick="restoreAllNotifications()" style="background:#a78bfa;color:white;border-color:#a78bfa;">🔄 Pulihkan</button>';
    html += '<button class="notif-confirm-cancel" onclick="closeNotifConfirm()">Batal</button>';
    html += '<button class="notif-confirm-delete" id="notifConfirmBtn">🗑 Padam</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
}

// ===== TOGGLE EXPAND/COLLAPSE =====
function toggleNotifications() {
    notifExpanded = !notifExpanded;

    var items = document.querySelectorAll('#notifList .notif-item');
    var btn = document.querySelector('.notif-toggle-btn');

    if (notifExpanded) {
        // Show all
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('hidden-collapsed');
        }
        btn.classList.add('expanded');
        btn.querySelector('span:first-child').textContent = 'Tunjuk Kurang';
    } else {
        // Show only first 3
        for (var i = 0; i < items.length; i++) {
            if (i >= 3) {
                items[i].classList.add('hidden-collapsed');
            }
        }
        btn.classList.remove('expanded');
        btn.querySelector('span:first-child').textContent = 'Tunjuk Lagi (' + (items.length - 3) + ' notifikasi)';
    }
}

// ===== DELETE SINGLE NOTIFICATION =====
function deleteNotification(notifId, btnEl) {
    var item = btnEl.closest('.notif-item');
    if (!item) return;

    // Animate out
    item.classList.add('deleting');

    setTimeout(function() {
        // Add to deleted list
        if (notifDeletedIds.indexOf(notifId) === -1) {
            notifDeletedIds.push(notifId);
        }

        // Save to localStorage
        if (currentUser && currentUser.studentId) {
            localStorage.setItem('parentNotifDeleted_' + currentUser.studentId, JSON.stringify(notifDeletedIds));
        }

        // Re-render
        var student = null;
        for (var i = 0; i < appData.students.length; i++) {
            if (appData.students[i].id === currentUser.studentId) {
                student = appData.students[i];
                break;
            }
        }
        if (student) {
            var records = getStudentRecordsParent(student.id);
            renderNotifications(student, records);
        }

        showToast('🗑 Notifikasi dipadam');
    }, 400);
}

// ===== CLEAR ALL NOTIFICATIONS =====
function confirmClearAllNotifs() {
    var modal = document.getElementById('notifConfirmModal');
    var title = document.getElementById('notifConfirmTitle');
    var desc = document.getElementById('notifConfirmDesc');
    var btn = document.getElementById('notifConfirmBtn');

    if (!modal) return;

    title.textContent = 'Padam Semua Notifikasi?';
    desc.textContent = 'Semua notifikasi akan dipadam. Tindakan ini tidak boleh dikembalikan.';
    btn.onclick = clearAllNotifications;

    modal.classList.remove('hidden');
}

function closeNotifConfirm() {
    var modal = document.getElementById('notifConfirmModal');
    if (modal) modal.classList.add('hidden');
}

function clearAllNotifications() {
    closeNotifConfirm();

    // Get all current notif IDs
    var items = document.querySelectorAll('#notifList .notif-item');
    var allIds = [];

    for (var i = 0; i < items.length; i++) {
        var id = items[i].dataset.notifId;
        if (id) allIds.push(id);

        // Animate out with delay
        (function(item, idx) {
            setTimeout(function() {
                item.classList.add('deleting');
            }, idx * 50);
        })(items[i], i);
    }

    // Save all as deleted
    setTimeout(function() {
        notifDeletedIds = notifDeletedIds.concat(allIds);

        // Remove duplicates
        var unique = [];
        for (var i = 0; i < notifDeletedIds.length; i++) {
            if (unique.indexOf(notifDeletedIds[i]) === -1) {
                unique.push(notifDeletedIds[i]);
            }
        }
        notifDeletedIds = unique;

        // Save to localStorage
        if (currentUser && currentUser.studentId) {
            localStorage.setItem('parentNotifDeleted_' + currentUser.studentId, JSON.stringify(notifDeletedIds));
        }

        // Re-render
        var student = null;
        for (var i = 0; i < appData.students.length; i++) {
            if (appData.students[i].id === currentUser.studentId) {
                student = appData.students[i];
                break;
            }
        }
        if (student) {
            var records = getStudentRecordsParent(student.id);
            renderNotifications(student, records);
        }

        showToast('✅ Semua notifikasi dipadam');
    }, items.length * 50 + 400);
}

// ===== RESTORE DELETED (Bonus) =====
function restoreAllNotifications() {
    if (!confirm('Pulihkan semua notifikasi yang dipadam?')) return;

    notifDeletedIds = [];

    if (currentUser && currentUser.studentId) {
        localStorage.removeItem('parentNotifDeleted_' + currentUser.studentId);
    }

    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === currentUser.studentId) {
            student = appData.students[i];
            break;
        }
    }
    if (student) {
        var records = getStudentRecordsParent(student.id);
        renderNotifications(student, records);
    }

    showToast('✅ Notifikasi dipulihkan');
}

// ============================================
// ===== REPORT CARD / LAPORAN BULANAN ========
// ============================================

function initParentReport() {
    if (!currentUser || !currentUser.studentId) return;
    appData = loadData();

    var monthEl = document.getElementById('parentReportMonth');
    var yearEl = document.getElementById('parentReportYear');
    if (!monthEl || !yearEl) return;

    var studentId = currentUser.studentId;
    var recs = appData.records || [];

    // Collect years
    var yearsMap = {};
    yearsMap[new Date().getFullYear()] = true;
    for (var i = 0; i < recs.length; i++) {
        if (recs[i].studentId === studentId) {
            var y = parseInt(recs[i].date.split('-')[0]);
            if (y) yearsMap[y] = true;
        }
    }

    var yearKeys = Object.keys(yearsMap).sort(function(a, b) { return b - a; });
    var yearHtml = '';
    for (var i = 0; i < yearKeys.length; i++) {
        yearHtml += '<option value="' + yearKeys[i] + '">' + yearKeys[i] + '</option>';
    }
    yearEl.innerHTML = yearHtml;

    // Find latest record
    var studentRecs = recs.filter(function(r) { return r.studentId === studentId; });
    studentRecs.sort(function(a, b) { return b.date.localeCompare(a.date); });

    if (studentRecs.length > 0) {
        var parts = studentRecs[0].date.split('-');
        yearEl.value = parts[0];
        monthEl.value = String(parseInt(parts[1]));
    }

    generateParentReport();
}

function generateParentReport() {
    var container = document.getElementById('parentReportContent');
    if (!container || !currentUser || !currentUser.studentId) return;
    appData = loadData();

    var monthEl = document.getElementById('parentReportMonth');
    var yearEl = document.getElementById('parentReportYear');

    var month = monthEl ? parseInt(monthEl.value) : 0;
    var year = yearEl ? parseInt(yearEl.value) : 0;

    if (!month || month < 1 || month > 12) month = new Date().getMonth() + 1;
    if (!year) year = new Date().getFullYear();

    var studentId = currentUser.studentId;
    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === studentId) { student = appData.students[i]; break; }
    }
    if (!student) return;

    // Filter using string match
    var monthStr = month < 10 ? '0' + month : String(month);
    var prefix = year + '-' + monthStr;

    var allRecords = [];
    var recs = appData.records || [];
    for (var i = 0; i < recs.length; i++) {
        if (recs[i].studentId === studentId && recs[i].date.indexOf(prefix) === 0) {
            allRecords.push(recs[i]);
        }
    }

    var totalRecords = allRecords.length;
    var totalScore = 0;
    var lancar = 0, sederhana = 0, ulang = 0, gagal = 0;
    var surahSet = [];

    for (var i = 0; i < allRecords.length; i++) {
        var r = allRecords[i];
        totalScore += (r.score || 0);
        if (r.status === 'Lancar') lancar++;
        else if (r.status === 'Sederhana') sederhana++;
        else if (r.status === 'Perlu Ulang') ulang++;
        else gagal++;
        var ss = Array.isArray(r.surah) ? r.surah : (r.surah ? [r.surah] : []);
        for (var j = 0; j < ss.length; j++) {
            if (surahSet.indexOf(ss[j]) === -1) surahSet.push(ss[j]);
        }
    }

    var avgScore = totalRecords > 0 ? Math.round(totalScore / totalRecords) : 0;
    var avgColor = avgScore >= 80 ? '#a78bfa' : avgScore >= 60 ? '#f59e0b' : '#ef4444';
    var grade = avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : avgScore >= 60 ? 'D' : 'E';

    var attHadir = 0, attTotal = 0;
    if (appData.attendance) {
        for (var i = 0; i < appData.attendance.length; i++) {
            var att = appData.attendance[i];
            if (!att.date || att.date.indexOf(prefix) !== 0) continue;
            if (!att.records) continue;
            for (var j = 0; j < att.records.length; j++) {
                if (att.records[j].studentId === studentId) {
                    attTotal++;
                    if (att.records[j].status === 'hadir' || att.records[j].status === 'lewat') attHadir++;
                }
            }
        }
    }
    var attPercent = attTotal > 0 ? Math.round((attHadir / attTotal) * 100) : 0;

    var monthNames = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    var monthName = monthNames[month];

    var html = '<div id="parentReportPrint">';
    html += '<div style="text-align:center;padding:20px 0;border-bottom:3px double #7c3aed;margin-bottom:20px;">';
    html += '<div style="margin-bottom:8px;"><img src="https://i.ibb.co/DgSPkh8d/logo.png" style="width:80px;height:80px;object-fit:contain;" alt="Logo"></div>';
    html += '<h2 style="color:#7c3aed;margin:0 0 5px;">MADRASAH TAHFIZ PEKAN SUNGAI BULOH</h2>';
    html += '<h3 style="color:#1f2937;margin:0 0 5px;">LAPORAN HAFAZAN BULANAN</h3>';
    html += '<p style="color:#64748b;margin:0;">' + monthName + ' ' + year + '</p>';
    html += '</div>';

    if (totalRecords === 0) {
        html += '<div style="text-align:center;padding:40px;background:#fef3c7;border-radius:12px;">';
        html += '<div style="font-size:3rem;margin-bottom:10px;">📭</div>';
        html += '<h3 style="color:#78350f;margin:0 0 8px;">Tiada Rekod</h3>';
        html += '<p style="color:#92400e;margin:0;">Tiada rekod untuk ' + monthName + ' ' + year + '</p>';
        html += '</div></div>';
        container.innerHTML = html;
        return;
    }

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:25px;padding:20px;background:#faf5ff;border-radius:12px;">';
    html += '<div><strong style="color:#64748b;">Nama:</strong> <span style="font-weight:700;">' + student.name + '</span></div>';
    html += '<div><strong style="color:#64748b;">Kelas:</strong> <span style="font-weight:700;">' + student.class + '</span></div>';
    html += '<div><strong style="color:#64748b;">Bapa:</strong> ' + (student.fatherName || '-') + '</div>';
    html += '<div><strong style="color:#64748b;">Ibu:</strong> ' + (student.motherName || '-') + '</div>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:25px;">';
    html += '<div style="text-align:center;padding:20px;background:white;border:2px solid #e2e8f0;border-radius:12px;"><div style="font-size:2.5rem;font-weight:900;color:' + avgColor + ';">' + grade + '</div><div style="color:#64748b;font-size:0.82rem;">Gred</div></div>';
    html += '<div style="text-align:center;padding:20px;background:white;border:2px solid #e2e8f0;border-radius:12px;"><div style="font-size:2.5rem;font-weight:900;color:' + avgColor + ';">' + avgScore + '%</div><div style="color:#64748b;font-size:0.82rem;">Purata</div></div>';
    html += '<div style="text-align:center;padding:20px;background:white;border:2px solid #e2e8f0;border-radius:12px;"><div style="font-size:2.5rem;font-weight:900;color:#3b82f6;">' + totalRecords + '</div><div style="color:#64748b;font-size:0.82rem;">Rekod</div></div>';
    html += '<div style="text-align:center;padding:20px;background:white;border:2px solid #e2e8f0;border-radius:12px;"><div style="font-size:2.5rem;font-weight:900;color:#8b5cf6;">' + attPercent + '%</div><div style="color:#64748b;font-size:0.82rem;">Kehadiran</div></div>';
    html += '</div>';

    html += '<div style="margin-bottom:25px;"><h4 style="color:#7c3aed;margin-bottom:15px;">📊 Pecahan Status</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">';
    html += '<div style="text-align:center;padding:15px;background:#e9d5ff;border-radius:10px;"><div style="font-size:1.5rem;font-weight:900;color:#7c3aed;">' + lancar + '</div><small style="color:#7c3aed;">Lancar</small></div>';
    html += '<div style="text-align:center;padding:15px;background:#fef3c7;border-radius:10px;"><div style="font-size:1.5rem;font-weight:900;color:#92400e;">' + sederhana + '</div><small style="color:#92400e;">Sederhana</small></div>';
    html += '<div style="text-align:center;padding:15px;background:#fee2e2;border-radius:10px;"><div style="font-size:1.5rem;font-weight:900;color:#991b1b;">' + ulang + '</div><small style="color:#991b1b;">Perlu Ulang</small></div>';
    html += '<div style="text-align:center;padding:15px;background:#f1f5f9;border-radius:10px;"><div style="font-size:1.5rem;font-weight:900;color:#1f2937;">' + gagal + '</div><small style="color:#1f2937;">Tidak Lulus</small></div>';
    html += '</div></div>';

    html += '<div style="margin-bottom:25px;"><h4 style="color:#7c3aed;margin-bottom:10px;">📖 Surah (' + surahSet.length + ')</h4><div style="display:flex;flex-wrap:wrap;gap:6px;">';
    for (var i = 0; i < surahSet.length; i++) {
        html += '<span style="background:#faf5ff;color:#7c3aed;padding:4px 10px;border-radius:15px;font-size:0.78rem;font-weight:600;border:1px solid #a78bfa;">' + surahSet[i] + '</span>';
    }
    html += '</div></div>';

    html += '<div style="margin-bottom:25px;"><h4 style="color:#7c3aed;margin-bottom:10px;">📝 Rekod</h4>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;"><thead><tr style="background:#7c3aed;color:white;"><th style="padding:10px;">Tarikh</th><th style="padding:10px;">Bacaan</th><th style="padding:10px;">Markah</th><th style="padding:10px;">Status</th></tr></thead><tbody>';
    for (var i = 0; i < allRecords.length; i++) {
        var r = allRecords[i];
        html += '<tr style="border-bottom:1px solid #e2e8f0;">';
        html += '<td style="padding:8px;">' + formatDateP(r.date) + '</td>';
        html += '<td style="padding:8px;">' + formatSurahWithAyatParent(r) + '</td>';
        html += '<td style="padding:8px;font-weight:700;color:' + (r.score >= 80 ? '#7c3aed' : '#991b1b') + ';">' + r.score + '%</td>';
        html += '<td style="padding:8px;"><span class="badge ' + getBadgeClassParent(r.status) + '">' + r.status + '</span></td>';
        html += '</tr>';
    }
    html += '</tbody></table></div>';

    html += '<div style="text-align:center;padding-top:20px;border-top:2px solid #e2e8f0;color:#64748b;font-size:0.85rem;">';
    html += '<p>Dijana: ' + new Date().toLocaleDateString('ms-MY') + ' • Madrasah Tahfiz PSB</p></div>';
    html += '</div>';

    container.innerHTML = html;
}

function printParentReport() {
    var reportContent = document.getElementById('parentReportPrint');
    if (!reportContent) {
        generateParentReport();
        setTimeout(printParentReport, 500);
        return;
    }

    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Laporan Hafazan</title>');
    printWindow.document.write('<style>body{font-family:Inter,sans-serif;padding:20px;color:#1f2937;} table{width:100%;border-collapse:collapse;} th,td{padding:8px;text-align:left;border-bottom:1px solid #e2e8f0;} .badge{padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:700;} .badge-lancar{background:#e9d5ff;color:#5b21b6;} .badge-sederhana{background:#fef3c7;color:#78350f;} .badge-ulang{background:#fef3c7;color:#7c2d12;} .badge-gagal{background:#fee2e2;color:#7f1d1d;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(reportContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function() { printWindow.print(); }, 500);
}

// ============================================
// ===== ALBUM ANAK ===========================
// ============================================

function renderChildAlbum(student) {
    var container = document.getElementById('childAlbumContent');
    if (!container || !student) return;

    var gallery = appData.gallery || [];
    var childPhotos = [];

    // Cari gambar yang berkaitan dengan anak
    for (var i = 0; i < gallery.length; i++) {
        var album = gallery[i];
        if (!album.photos) continue;

        for (var j = 0; j < album.photos.length; j++) {
            childPhotos.push({
                url: album.photos[j].url || album.photos[j].displayUrl,
                thumb: album.photos[j].thumb || album.photos[j].url,
                title: album.title,
                category: album.category,
                date: album.date
            });
        }
    }

    // Also check for student-specific album
    if (appData.studentAlbums && appData.studentAlbums[student.id]) {
        var studentPhotos = appData.studentAlbums[student.id];
        for (var i = 0; i < studentPhotos.length; i++) {
            childPhotos.push(studentPhotos[i]);
        }
    }

    if (childPhotos.length === 0) {
        container.innerHTML =
            '<div class="child-album-empty">' +
            '<div class="child-album-empty-icon">📷</div>' +
            '<p style="font-weight:700;margin-bottom:5px;">Belum ada gambar</p>' +
            '<small>Gambar aktiviti anak akan dipaparkan di sini</small>' +
            '</div>';
        return;
    }

    // Take latest 12
    childPhotos = childPhotos.slice(0, 12);

    var html = '<div class="child-album-grid">';

    for (var i = 0; i < childPhotos.length; i++) {
        var photo = childPhotos[i];
        var dateStr = '';
        if (photo.date) {
            var d = new Date(photo.date);
            var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
            dateStr = d.getDate() + ' ' + months[d.getMonth()];
        }

        html += '<div class="child-album-item" onclick="openChildPhoto(\'' + (photo.url || photo.thumb) + '\', \'' + (photo.title || '') + '\')">';
        html += '<img src="' + (photo.thumb || photo.url) + '" alt="" loading="lazy">';
        html += '<div class="child-album-overlay">';
        if (photo.title) html += '<div style="font-weight:700;">' + photo.title + '</div>';
        if (dateStr) html += '<div>📅 ' + dateStr + '</div>';
        html += '</div>';
        html += '</div>';
    }

    html += '</div>';

    if (childPhotos.length >= 12) {
        html += '<div style="text-align:center;margin-top:15px;">';
        html += '<button onclick="scrollToSection(\'parentGalleryContainer\')" style="background:#a78bfa;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:600;">📸 Lihat Semua Gallery</button>';
        html += '</div>';
    }

    container.innerHTML = html;
}

function openChildPhoto(url, title) {
    // Use existing lightbox if available
    if (typeof openParentLightbox === 'function') {
        // Find album containing this photo
        var gallery = appData.gallery || [];
        for (var i = 0; i < gallery.length; i++) {
            if (!gallery[i].photos) continue;
            for (var j = 0; j < gallery[i].photos.length; j++) {
                var photoUrl = gallery[i].photos[j].url || gallery[i].photos[j].displayUrl;
                if (photoUrl === url) {
                    openParentLightbox(gallery[i].id, j);
                    return;
                }
            }
        }
    }

    // Fallback: simple modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;cursor:pointer;';
    modal.onclick = function() { modal.remove(); };
    modal.innerHTML = '<div style="max-width:90%;max-height:90vh;" onclick="event.stopPropagation()">' +
        '<img src="' + url + '" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:12px;">' +
        (title ? '<p style="color:white;text-align:center;margin-top:10px;font-weight:600;">' + title + '</p>' : '') +
        '</div>';
    document.body.appendChild(modal);
}

// ============================================
// ===== VIDEO BACAAN ANAK ====================
// ============================================

function renderChildVideos(student) {
    var container = document.getElementById('childVideoContent');
    if (!container || !student) return;

    // Check for student videos
    var videos = [];

    // From student-specific videos
    if (appData.studentVideos && appData.studentVideos[student.id]) {
        videos = appData.studentVideos[student.id];
    }

    // From testimoni with video (that mentions this student)
    if (appData.siteContent && appData.siteContent.testimoni && appData.siteContent.testimoni.list) {
        var testimoni = appData.siteContent.testimoni.list;
        for (var i = 0; i < testimoni.length; i++) {
            var t = testimoni[i];
            if (t.type === 'video' && t.videoUrl) {
                videos.push({
                    url: t.videoUrl,
                    title: t.name + ' - Testimoni',
                    date: t.createdAt,
                    type: 'testimoni'
                });
            }
        }
    }

    if (videos.length === 0) {
        container.innerHTML =
            '<div class="child-video-empty">' +
            '<div style="font-size:4rem;margin-bottom:12px;opacity:0.5;">🎥</div>' +
            '<p style="font-weight:700;margin-bottom:5px;">Belum ada video</p>' +
            '<small>Rakaman bacaan anak akan dipaparkan di sini apabila tersedia</small>' +
            '<div style="margin-top:20px;padding:15px;background:#faf5ff;border-radius:10px;border-left:4px solid #a78bfa;text-align:left;">' +
            '<strong style="color:#7c3aed;">💡 Tips untuk Ibu Bapa:</strong>' +
            '<ul style="margin:8px 0 0;padding-left:20px;color:#374151;font-size:0.88rem;line-height:1.8;">' +
            '<li>Rakam bacaan anak di rumah</li>' +
            '<li>Hantar video ke ustaz melalui WhatsApp</li>' +
            '<li>Video akan dikongsi di sini selepas semakan</li>' +
            '</ul>' +
            '</div>' +
            '</div>';
        return;
    }

    var html = '<div class="child-video-list">';

    for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        var dateStr = '';
        if (v.date) {
            dateStr = formatDateP(v.date.split('T')[0]);
        }

        html += '<div class="child-video-card">';
        html += '<div class="child-video-player">';

        // Check if YouTube
        var youtubeId = extractYouTubeIdChild(v.url);
        if (youtubeId) {
            html += '<iframe src="https://www.youtube.com/embed/' + youtubeId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        } else {
            html += '<video controls preload="metadata"><source src="' + v.url + '" type="video/mp4">Video tidak dapat dipaparkan</video>';
        }

        if (v.type) {
            var badges = { testimoni: '💬 Testimoni', bacaan: '📖 Bacaan', hafazan: '📚 Hafazan', umum: '🎬 Umum' };
            html += '<div class="child-video-badge">' + (badges[v.type] || v.type) + '</div>';
        }

        html += '</div>';

        html += '<div class="child-video-info">';
        html += '<div class="child-video-title">' + (v.title || 'Video Bacaan') + '</div>';
        html += '<div class="child-video-meta">';
        if (dateStr) html += '<span>📅 ' + dateStr + '</span>';
        if (v.surah) html += '<span>📖 ' + v.surah + '</span>';
        if (v.score) html += '<span>⭐ ' + v.score + '%</span>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
    }

    html += '</div>';

    container.innerHTML = html;
}

function extractYouTubeIdChild(url) {
    if (!url) return null;
    var patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match && match[1]) return match[1];
    }
    return null;
}

// ===== GET JUZ SURAHS (CLEAN - NO DUPLICATES) =====
function getJuzSurahsClean(juzNum) {
    if (typeof SURAH_LIST === 'undefined') return [];

    // Predefined juz boundaries (surah start - surah end)
    var juzBoundaries = {
        1: [1, 2], 2: [2, 2], 3: [2, 3], 4: [3, 4], 5: [4, 4],
        6: [4, 5], 7: [5, 6], 8: [6, 7], 9: [7, 8], 10: [8, 9],
        11: [9, 11], 12: [11, 12], 13: [12, 14], 14: [15, 16], 15: [17, 18],
        16: [18, 20], 17: [21, 22], 18: [23, 25], 19: [25, 27], 20: [27, 29],
        21: [29, 33], 22: [33, 36], 23: [36, 39], 24: [39, 41], 25: [41, 45],
        26: [46, 51], 27: [51, 57], 28: [58, 66], 29: [67, 77], 30: [78, 114]
    };

    var bounds = juzBoundaries[juzNum];
    if (!bounds) return [];

    var startSurah = bounds[0];
    var endSurah = bounds[1];

    var result = [];
    for (var i = 0; i < SURAH_LIST.length; i++) {
        if (SURAH_LIST[i].no >= startSurah && SURAH_LIST[i].no <= endSurah) {
            result.push(SURAH_LIST[i].name);
        }
    }

    return result;
}

// ============================================
// ===== PARENT TAB NAVIGATION ================
// ============================================

function parentSwitchTab(tabName, btn) {
    // Hide all tab contents
    var tabs = document.querySelectorAll('#parentPage .tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }

    // Remove active from all buttons
    var btns = document.querySelectorAll('#parentPage .tab-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }

    // Show selected tab
    var targetTab = document.getElementById('parentTab-' + tabName);
    if (targetTab) targetTab.classList.add('active');

    // Highlight button
    if (btn) {
        btn.classList.add('active');
    } else {
        var allBtns = document.querySelectorAll('#parentPage .tab-btn');
        for (var i = 0; i < allBtns.length; i++) {
            var onclick = allBtns[i].getAttribute('onclick') || '';
            if (onclick.indexOf("'" + tabName + "'") > -1) {
                allBtns[i].classList.add('active');
                break;
            }
        }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-render content for tabs
    setTimeout(function() {
        var student = null;
        if (currentUser && currentUser.studentId) {
            for (var i = 0; i < appData.students.length; i++) {
                if (appData.students[i].id === currentUser.studentId) {
                    student = appData.students[i];
                    break;
                }
            }
        }

        if (!student) return;
        var records = getStudentRecordsParent(student.id);

        // Tab-specific actions
        if (tabName === 'progress') {
            var targetEl = document.getElementById('targetProgressContent2');
            if (targetEl) {
                renderTargetProgressInto(student, records, 'targetProgressContent2');
            }
        } else if (tabName === 'hafazan') {
        // BARU: Render dengan filter
        if (typeof renderParentRecordsFiltered === 'function') {
        renderParentRecordsFiltered();
        }
        } else if (tabName === 'notifikasi') {
            renderNotificationsInto(student, records, 'parentNotifications2');
        } else if (tabName === 'achievement') {
            renderAchievementsInto(student, records, 'achievementBadges2');
        } else if (tabName === 'calendar') {
    if (typeof renderParentCalendar === 'function') {
        renderParentCalendar();
    }
    if (typeof renderEventsPreviewParent === 'function') {
        setTimeout(renderEventsPreviewParent, 200);
    }
        } else if (tabName === 'attendance') {
            if (typeof loadParentAttendance === 'function') {
                loadParentAttendance();
            }
        } else if (tabName === 'payment') {
            if (typeof loadParentPayments === 'function') {
                loadParentPayments();
            }
        } else if (tabName === 'gallery') {
            if (typeof loadParentGallery === 'function') {
                loadParentGallery();
            }
        } else if (tabName === 'schedule') {
            if (typeof renderParentSchedule === 'function') {
                renderParentSchedule();
            }
        } else if (tabName === 'report') {
            if (typeof initParentReport === 'function') {
                initParentReport();
            }
        } else if (tabName === 'prayer') {
            if (typeof initParentPrayerTimes === 'function') {
                initParentPrayerTimes();
            }
        } else if (tabName === 'video') {
            if (typeof renderChildVideos === 'function') {
                renderChildVideos(student);
            }
        } else if (tabName === 'album') {
            if (typeof renderChildAlbum === 'function') {
                renderChildAlbum(student);
            }
        } else if (tabName === 'ustaz') {
            if (typeof renderUstazList === 'function') {
                renderUstazList(student);
            }
        }
    }, 100);
}

// Helper untuk render ke specific container
function renderTargetProgressInto(student, records, containerId) {
    var originalEl = document.getElementById('targetProgressContent');
    var targetEl = document.getElementById(containerId);

    if (!targetEl) return;

    // Render ke original dulu, kemudian copy
    renderTargetProgress(student, records);

    if (originalEl && targetEl) {
        targetEl.innerHTML = originalEl.innerHTML;
    }
}

function renderNotificationsInto(student, records, containerId) {
    var originalEl = document.getElementById('parentNotifications');
    var targetEl = document.getElementById(containerId);

    if (!targetEl) return;

    renderNotifications(student, records);

    if (originalEl && targetEl) {
        targetEl.innerHTML = originalEl.innerHTML;
    }
}

function renderAchievementsInto(student, records, containerId) {
    var originalEl = document.getElementById('achievementBadges');
    var targetEl = document.getElementById(containerId);

    if (!targetEl) return;

    renderAchievements(student, records);

    if (originalEl && targetEl) {
        targetEl.innerHTML = originalEl.innerHTML;
    }
}

// ===== TOGGLE MORE MENU =====
function toggleParentTabMore() {
    var menu = document.getElementById('parentTabMoreMenu');
    if (menu) menu.classList.toggle('hidden');
}

function closeParentTabMore() {
    var menu = document.getElementById('parentTabMoreMenu');
    if (menu) menu.classList.add('hidden');
}

function parentSwitchTabFromMenu(tabName) {
    closeParentTabMore();
    parentSwitchTab(tabName, null);

    // Highlight "Lagi" button
    var allTabs = document.querySelectorAll('#parentPage .tab-btn');
    for (var i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active');
    }
    var moreBtn = document.querySelector('#parentPage .tab-more-btn');
    if (moreBtn) moreBtn.classList.add('active');
}

// Close menu when click outside
document.addEventListener('click', function(e) {
    var wrapper = document.querySelector('#parentPage .tab-more-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        closeParentTabMore();
    }
});

console.log('✅ Parent tab navigation loaded');

// ============================================
// ===== FORCE HIDE LEAKED ELEMENTS ===========
// ============================================

function forceHideNonActivePages() {
    var allPages = document.querySelectorAll('.page');
    for (var i = 0; i < allPages.length; i++) {
        if (!allPages[i].classList.contains('active')) {
            allPages[i].style.cssText =
                'display: none !important;' +
                'visibility: hidden !important;' +
                'position: absolute !important;' +
                'left: -99999px !important;' +
                'pointer-events: none !important;' +
                'opacity: 0 !important;';

            // Force hide all children
            var children = allPages[i].querySelectorAll('*');
            for (var j = 0; j < children.length; j++) {
                children[j].style.visibility = 'hidden';
            }
        } else {
            allPages[i].style.cssText = '';

            // Restore children visibility
            var children = allPages[i].querySelectorAll('*');
            for (var j = 0; j < children.length; j++) {
                children[j].style.visibility = '';
            }
        }
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(forceHideNonActivePages, 100);
});

// Run when page changes (override showPage)
var originalShowPage = window.showPage;
window.showPage = function(pageId) {
    if (typeof originalShowPage === 'function') {
        originalShowPage(pageId);
    }

    setTimeout(forceHideNonActivePages, 100);
};

// Run when logout/login
var originalLogout = window.logout;
window.logout = function() {
    if (typeof originalLogout === 'function') {
        originalLogout();
    }
    setTimeout(forceHideNonActivePages, 200);
};

console.log('✅ Force hide non-active pages enabled');

// ============================================
// ===== EVENTS PREVIEW CARDS =================
// ============================================

function renderEventsPreviewParent() {
    var container = document.getElementById('parentEventsPreview');
    if (!container) return;

    // Get current month/year dari parent calendar
    if (typeof parentCalDate === 'undefined') {
        parentCalDate = new Date();
    }

    var year = parentCalDate.getFullYear();
    var month = parentCalDate.getMonth();

    var monthNames = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    // Filter events untuk bulan ni
    var events = [];
    if (appData.events) {
        for (var i = 0; i < appData.events.length; i++) {
            var event = appData.events[i];
            if (event.status === 'hidden') continue;

            var eventStart = new Date(event.date);
            var eventEnd = event.dateEnd ? new Date(event.dateEnd) : eventStart;

            // Check if event falls in this month
            if ((eventStart.getMonth() === month && eventStart.getFullYear() === year) ||
                (eventEnd.getMonth() === month && eventEnd.getFullYear() === year) ||
                (eventStart < new Date(year, month, 1) && eventEnd > new Date(year, month + 1, 0))) {
                events.push(event);
            }
        }
    }

    // Sort by date
    events.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    // Build HTML
    var html = '<div class="events-preview-header">';
    html += '<div class="events-preview-badge">';
    html += '<span>📅</span>';
    html += '<span>Acara Bulan Ini</span>';
    html += '</div>';
    html += '<h3 class="events-preview-title">Senarai Aktiviti<br><span class="events-preview-title-accent">' + monthNames[month] + ' ' + year + '</span></h3>';
    html += '<p class="events-preview-subtitle">Pelbagai program istimewa untuk pelajar dan komuniti</p>';
    html += '<div class="events-preview-month-indicator">' + events.length + ' acara dalam bulan ' + monthNames[month] + '</div>';
    html += '</div>';

    if (events.length === 0) {
        html += '<div class="events-preview-empty">';
        html += '<div class="events-preview-empty-icon">📭</div>';
        html += '<p style="font-weight:700;margin-bottom:5px;">Tiada acara bulan ini</p>';
        html += '<small>Acara baru akan dikemaskini di sini</small>';
        html += '</div>';
    } else {
        html += '<div class="events-preview-grid">';

        var months = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep','Okt','Nov','Dis'];
        var categories = {
            class: { label: '📚 Kelas', cls: 'tag-class' },
            event: { label: '🎉 Majlis', cls: 'tag-event' },
            activity: { label: '🌟 Aktiviti', cls: 'tag-activity' },
            meeting: { label: '👨‍👩‍👧 Perjumpaan', cls: 'tag-meeting' },
            holiday: { label: '🏖️ Cuti', cls: 'tag-holiday' },
            special: { label: '⭐ Sambutan', cls: 'tag-special' }
        };

        for (var i = 0; i < events.length; i++) {
            var e = events[i];
            var d = new Date(e.date);
            var dEnd = e.dateEnd ? new Date(e.dateEnd) : d;
            var isRange = e.dateEnd && e.dateEnd !== e.date;
            var color = e.color || 'green';
            var cat = categories[e.category] || { label: e.category, cls: 'tag-event' };

            html += '<div class="event-preview-card" onclick="openParentDayEvents(\'' + e.date + '\')">';

            // Top section dengan tarikh
            html += '<div class="event-preview-top color-' + color + '">';
            if (isRange && d.getMonth() === dEnd.getMonth()) {
                html += '<div class="event-preview-day">' + d.getDate() + '-' + dEnd.getDate() + '</div>';
                html += '<div class="event-preview-month">' + months[d.getMonth()] + '</div>';
            } else if (isRange) {
                html += '<div class="event-preview-day" style="font-size:1.2rem;">' + d.getDate() + ' ' + months[d.getMonth()] + '</div>';
                html += '<div style="font-size:0.65rem;margin:3px 0;opacity:0.9;">→</div>';
                html += '<div class="event-preview-day" style="font-size:1.2rem;">' + dEnd.getDate() + ' ' + months[dEnd.getMonth()] + '</div>';
            } else {
                html += '<div class="event-preview-day">' + d.getDate() + '</div>';
                html += '<div class="event-preview-month">' + months[d.getMonth()] + '</div>';
            }
            html += '</div>';

            // Body
            html += '<div class="event-preview-body">';

            // Tag
            html += '<div>';
            html += '<span class="event-preview-tag ' + cat.cls + '">' + cat.label + '</span>';
            if (e.featured) {
                html += '<span class="event-preview-featured-badge">⭐ FEATURED</span>';
            }
            html += '</div>';

            // Title
            html += '<h4 class="event-preview-title-h">' + e.title + '</h4>';

            // Description
            if (e.description) {
                html += '<p class="event-preview-desc">' + e.description + '</p>';
            }

            // Meta
            html += '<div class="event-preview-meta">';
            if (e.time) {
                html += '<div class="event-preview-meta-item">';
                html += '<span class="icon">🕐</span>';
                html += '<span class="text">' + e.time + '</span>';
                html += '</div>';
            }
            if (e.location) {
                html += '<div class="event-preview-meta-item">';
                html += '<span class="icon">📍</span>';
                html += '<span class="text">' + e.location + '</span>';
                html += '</div>';
            }
            html += '</div>';

            html += '</div>';
            html += '</div>';
        }

        html += '</div>';
    }

    container.innerHTML = html;
}

// Override renderParentCalendar untuk auto-update events preview
var _originalRenderParentCalendar = window.renderParentCalendar;
if (typeof _originalRenderParentCalendar === 'function') {
    window.renderParentCalendar = function() {
        _originalRenderParentCalendar();
        setTimeout(renderEventsPreviewParent, 100);
    };
}

console.log('✅ Events preview (parent) loaded');

// ============================================
// ===== OPEN MONTH RECEIPT (PARENT) ==========
// ============================================

function openMonthReceipt(month, year) {
    if (!currentUser || !currentUser.studentId) return;
    
    appData = loadData();
    var cashbook = appData.cashbook || [];
    var students = appData.students || [];
    
    var student = null;
    for (var i = 0; i < students.length; i++) {
        if (students[i].id === currentUser.studentId) {
            student = students[i];
            break;
        }
    }
    if (!student) return;
    
    var monthNames = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    
    // Chronological students
    var CHRONO_IDS = ['STU004', 'STU1782290705082', 'STU1782290830139'];
    var isChrono = CHRONO_IDS.indexOf(currentUser.studentId) > -1;
    
    // Collect sumber pembayaran
    var sources = [];
    var totalPaid = 0;
    
    if (isChrono) {
        // For chronological students - trace balik sumber
        sources = traceChronologicalSources(currentUser.studentId, student.name, year, month, cashbook);
    } else {
        // Untuk pelajar biasa - direct match
        for (var i = 0; i < cashbook.length; i++) {
            var e = cashbook[i];
            if (e.type !== 'debit') continue;
            
            var desc = (e.description || '').toUpperCase();
            var cat = (e.category || '').toUpperCase();
            
            // Skip non-yuran
            if (desc.indexOf('SUMBANGAN') > -1) continue;
            if (desc.indexOf('INFAQ') > -1) continue;
            if (desc.indexOf('DERMA') > -1) continue;
            if (desc.indexOf('SEDEKAH') > -1) continue;
            if (cat === 'DERMA' || cat === 'INFAQ') continue;
            
            var isMatch = false;
            var amount = 0;
            
            if (e.studentId === currentUser.studentId) {
                isMatch = true;
                amount = e.amount;
            }
            
            if (!isMatch && e.zakatDistribution) {
                for (var z = 0; z < e.zakatDistribution.length; z++) {
                    if (e.zakatDistribution[z].studentId === currentUser.studentId) {
                        isMatch = true;
                        amount = e.zakatDistribution[z].amount;
                        break;
                    }
                }
            }
            
            if (!isMatch) continue;
            
            // Check bulan & tahun match
            var entryYear = parseInt(e.date.split('-')[0]);
            var entryMonth = parseInt(e.date.split('-')[1]);
            
            var yearMatches = desc.match(/\b(20\d{2})\b/g);
            var monthKeywords = /(JANUARI|FEBRUARI|MAC|APRIL|MEI|JUN|JULAI|OGOS|SEPTEMBER|OKTOBER|NOVEMBER|DISEMBER)/i;
            var monthMatch = desc.match(monthKeywords);
            
            var matchThisMonth = false;
            
            if (yearMatches && monthMatch) {
                var monthMap = {'JANUARI':1,'FEBRUARI':2,'MAC':3,'APRIL':4,'MEI':5,'JUN':6,'JULAI':7,'OGOS':8,'SEPTEMBER':9,'OKTOBER':10,'NOVEMBER':11,'DISEMBER':12};
                var mNum = monthMap[monthMatch[0].toUpperCase()];
                for (var y = 0; y < yearMatches.length; y++) {
                    if (parseInt(yearMatches[y]) === year && mNum === month) {
                        matchThisMonth = true;
                        break;
                    }
                }
            } else if (entryYear === year && entryMonth === month) {
                matchThisMonth = true;
            }
            
            if (matchThisMonth) {
                sources.push({
                    date: e.date,
                    amount: amount,
                    description: e.description,
                    person: e.person || '-',
                    ref: e.ref || '-',
                    payMethod: e.payMethod || 'Tunai'
                });
                totalPaid += amount;
            }
        }
    }
    
    if (isChrono) {
        for (var i = 0; i < sources.length; i++) {
            totalPaid += sources[i].amount;
        }
    }
    
    // Check override
    var overrideKey = currentUser.studentId + '_' + year + '_' + month;
    var override = null;
    if (appData.yuranOverrides && appData.yuranOverrides[overrideKey]) {
        override = appData.yuranOverrides[overrideKey];
        if (override.status === 'paid') {
            totalPaid = override.amount || 300;
            sources.push({
                date: override.date || new Date().toISOString().split('T')[0],
                amount: totalPaid,
                description: 'Override Manual - ' + (override.notes || 'Ditandakan sudah bayar oleh admin'),
                person: 'Admin',
                ref: 'OVERRIDE',
                payMethod: 'Manual',
                isOverride: true
            });
        }
    }
    
    // Build resit HTML
    var resitHtml = buildParentReceiptHtml(student, month, year, sources, totalPaid, override);
    
    // Show modal
    showParentReceiptModal(resitHtml);
}

// Trace chronological sources
function traceChronologicalSources(studentId, studentName, targetYear, targetMonth, cashbook) {
    var YURAN_SEBULAN = 300;
    var CHRONO_GROUPS = {
        'STU004': [{ startYear: 2024, startMonth: 1, endYear: 2026, endMonth: 12 }],
        'STU1782290705082': [{ startYear: 2024, startMonth: 1, endYear: 2026, endMonth: 12 }],
        'STU1782290830139': [{ startYear: 2025, startMonth: 5, endYear: 2026, endMonth: 12 }]
    };
    
    var groups = CHRONO_GROUPS[studentId];
    if (!groups) return [];
    
    var currentGroup = null;
    for (var g = 0; g < groups.length; g++) {
        if (targetYear >= groups[g].startYear && targetYear <= groups[g].endYear) {
            currentGroup = groups[g];
            break;
        }
    }
    if (!currentGroup) return [];
    
    // Collect all payments dalam group
    var allPayments = [];
    for (var i = 0; i < cashbook.length; i++) {
        var e = cashbook[i];
        if (e.type !== 'debit') continue;
        
        var desc = (e.description || '').toUpperCase();
        if (desc.indexOf('SUMBANGAN') > -1) continue;
        if (desc.indexOf('INFAQ') > -1) continue;
        if (desc.indexOf('DERMA') > -1) continue;
        if (desc.indexOf('SEDEKAH') > -1) continue;
        
        var isMatch = false;
        var amount = 0;
        
        if (e.studentId === studentId) {
            isMatch = true;
            amount = e.amount;
        }
        
        if (!isMatch && e.zakatDistribution) {
            for (var z = 0; z < e.zakatDistribution.length; z++) {
                if (e.zakatDistribution[z].studentId === studentId) {
                    isMatch = true;
                    amount = e.zakatDistribution[z].amount;
                    break;
                }
            }
        }
        
        if (!isMatch && studentName) {
            var nameParts = studentName.toUpperCase().split(/\s+/);
            if (nameParts.length >= 2) {
                var skipNames = ['MUHAMMAD', 'MOHD', 'SITI', 'NUR', 'AHMAD', 'ABU', 'ABDUL'];
                var matchName = skipNames.indexOf(nameParts[0]) > -1 ? nameParts[1] : nameParts[0];
                
                if (matchName.length >= 4 && desc.indexOf(matchName) > -1) {
                    isMatch = true;
                    var numStudents = 1;
                    if (desc.indexOf('&') > -1) numStudents = (desc.match(/&/g) || []).length + 1;
                    amount = e.amount / numStudents;
                }
            }
        }
        
        if (!isMatch) continue;
        
        var entryYear = parseInt(e.date.split('-')[0]);
        if (entryYear < currentGroup.startYear || entryYear > currentGroup.endYear) continue;
        
        allPayments.push({
            date: e.date,
            amount: amount,
            description: e.description,
            person: e.person || '-',
            ref: e.ref || '-',
            payMethod: e.payMethod || 'Tunai'
        });
    }
    
    allPayments.sort(function(a, b) { return a.date.localeCompare(b.date); });
    
    // Generate months untuk group
    var groupMonths = [];
    for (var yr = currentGroup.startYear; yr <= currentGroup.endYear; yr++) {
        var mStart = (yr === currentGroup.startYear) ? currentGroup.startMonth : 1;
        var mEnd = (yr === currentGroup.endYear) ? currentGroup.endMonth : 12;
        for (var mo = mStart; mo <= mEnd; mo++) {
            groupMonths.push({ year: yr, month: mo, paid: false, amount: 0, sources: [] });
        }
    }
    
    // Fill chronologically & track sources
    for (var p = 0; p < allPayments.length; p++) {
        var payment = allPayments[p];
        var remaining = payment.amount;
        
        for (var m = 0; m < groupMonths.length && remaining > 0; m++) {
            if (groupMonths[m].paid) continue;
            
            var needed = YURAN_SEBULAN - groupMonths[m].amount;
            if (needed <= 0) {
                groupMonths[m].paid = true;
                continue;
            }
            
            var toAdd = Math.min(remaining, needed);
            groupMonths[m].amount += toAdd;
            
            groupMonths[m].sources.push({
                date: payment.date,
                amount: toAdd,
                description: payment.description,
                person: payment.person,
                ref: payment.ref,
                payMethod: payment.payMethod
            });
            
            if (groupMonths[m].amount >= YURAN_SEBULAN) {
                groupMonths[m].paid = true;
            }
            
            remaining -= toAdd;
        }
    }
    
    // Find target month sources
    for (var m = 0; m < groupMonths.length; m++) {
        if (groupMonths[m].year === targetYear && groupMonths[m].month === targetMonth) {
            return groupMonths[m].sources;
        }
    }
    
    return [];
}

// Build receipt HTML
function buildParentReceiptHtml(student, month, year, sources, totalPaid, override) {
    var monthNames = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    var monthShort = ['', 'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    var logoUrl = 'https://i.ibb.co/DgSPkh8d/logo.png';
    
    var html = '';
    
    // Header
    html += '<div style="text-align:center;padding-bottom:20px;border-bottom:3px solid #7c3aed;margin-bottom:25px;">';
    html += '<img src="' + logoUrl + '" style="width:80px;height:80px;object-fit:contain;margin-bottom:10px;">';
    html += '<h1 style="margin:0;color:#7c3aed;font-size:1.5rem;font-weight:900;">MADRASAH TAHFIZ PEKAN SUNGAI BULOH</h1>';
    html += '<p style="margin:5px 0;color:#64748b;font-size:0.85rem;">Lot 2305, Lorong Lebai Daud, Jalan Raja Abdullah, 45800 Jeram, Selangor</p>';
    html += '<p style="margin:5px 0;color:#64748b;font-size:0.85rem;">Tel: 01161000542 | Email: mtsbakhirzaman2023@gmail.com</p>';
    html += '<h2 style="margin:15px 0 0;color:#1f2937;font-size:1.3rem;font-weight:700;letter-spacing:3px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);padding:10px;">RESIT BULANAN</h2>';
    html += '</div>';
    
    // Info
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;padding:20px;background:#faf5ff;border-radius:12px;">';
    html += '<div><strong style="color:#64748b;">Nama Pelajar:</strong><br><span style="font-weight:700;color:#1f2937;font-size:1.05rem;">' + student.name + '</span></div>';
    html += '<div><strong style="color:#64748b;">Kelas:</strong><br><span style="font-weight:700;">' + student.class + '</span></div>';
    html += '<div><strong style="color:#64748b;">Bulan Yuran:</strong><br><span style="font-weight:700;color:#7c3aed;font-size:1.05rem;">' + monthNames[month] + ' ' + year + '</span></div>';
    html += '<div><strong style="color:#64748b;">Tarikh Cetak:</strong><br><span style="font-weight:700;">' + formatDateP(new Date().toISOString().split('T')[0]) + '</span></div>';
    html += '</div>';
    
    // Sources table
    html += '<h3 style="color:#7c3aed;margin-bottom:10px;">📋 Butiran Pembayaran</h3>';
    
    if (sources.length === 0) {
        html += '<div style="padding:30px;text-align:center;background:#fee2e2;border-radius:10px;color:#991b1b;">';
        html += '<div style="font-size:2rem;margin-bottom:10px;">❌</div>';
        html += '<strong>Tiada rekod pembayaran untuk bulan ini</strong>';
        html += '</div>';
    } else {
        html += '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;border:2px solid #7c3aed;">';
        html += '<thead><tr style="background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;">';
        html += '<th style="padding:10px;text-align:left;">No</th>';
        html += '<th style="padding:10px;text-align:left;">Tarikh</th>';
        html += '<th style="padding:10px;text-align:left;">Sumber / Pembayar</th>';
        html += '<th style="padding:10px;text-align:left;">Rujukan</th>';
        html += '<th style="padding:10px;text-align:right;">Jumlah (RM)</th>';
        html += '</tr></thead><tbody>';
        
        for (var i = 0; i < sources.length; i++) {
            var s = sources[i];
            var bg = i % 2 === 0 ? '#ffffff' : '#faf5ff';
            html += '<tr style="background:' + bg + ';">';
            html += '<td style="padding:10px;border-bottom:1px solid #e2e8f0;">' + (i + 1) + '</td>';
            html += '<td style="padding:10px;border-bottom:1px solid #e2e8f0;">' + formatDateP(s.date) + '</td>';
            html += '<td style="padding:10px;border-bottom:1px solid #e2e8f0;">';
            html += '<strong>' + s.person + '</strong>';
            html += '<br><small style="color:#64748b;">' + s.description + '</small>';
            html += '<br><small style="color:#7c3aed;">💳 ' + s.payMethod + '</small>';
            if (s.isOverride) {
                html += ' <span style="background:#ede9fe;color:#5b21b6;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700;">✏️ OVERRIDE</span>';
            }
            html += '</td>';
            html += '<td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:0.78rem;color:#7c3aed;font-weight:600;">' + s.ref + '</td>';
            html += '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#059669;">' + s.amount.toFixed(2) + '</td>';
            html += '</tr>';
        }
        
        // Total row
        html += '<tr style="background:linear-gradient(135deg,#faf5ff,#ede9fe);">';
        html += '<td colspan="4" style="padding:15px;font-weight:800;color:#5b21b6;text-align:right;font-size:1rem;">JUMLAH:</td>';
        html += '<td style="padding:15px;text-align:right;font-weight:800;color:#5b21b6;font-size:1.1rem;">RM ' + totalPaid.toFixed(2) + '</td>';
        html += '</tr>';
        
        html += '</tbody></table>';
        
        // Status
        html += '<div style="margin-top:20px;padding:15px;border-radius:10px;text-align:center;';
        if (totalPaid >= 300) {
            html += 'background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:2px solid #10b981;">';
            html += '<div style="font-size:1.5rem;margin-bottom:5px;">✅</div>';
            html += '<strong style="color:#047857;font-size:1.1rem;">STATUS: LUNAS</strong>';
        } else {
            html += 'background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;">';
            html += '<div style="font-size:1.5rem;margin-bottom:5px;">⚠️</div>';
            html += '<strong style="color:#92400e;font-size:1.1rem;">STATUS: SEPARA (Baki: RM ' + (300 - totalPaid).toFixed(2) + ')</strong>';
        }
        html += '</div>';
    }
    
    // Footer
    html += '<div style="margin-top:30px;padding-top:20px;border-top:2px dashed #cbd5e1;text-align:center;color:#64748b;font-size:0.85rem;">';
    html += '<p>Resit ini dijana automatik dari sistem.</p>';
    html += '<p style="font-family:\'Amiri\',serif;color:#7c3aed;font-size:1.2rem;margin-top:10px;">جَزَاكُمُ اللهُ خَيْرًا</p>';
    html += '<p style="margin-top:10px;">Terima kasih atas sokongan anda.</p>';
    html += '</div>';
    
    return html;
}

// Show modal
function showParentReceiptModal(html) {
    var existing = document.getElementById('parentReceiptModal');
    if (existing) existing.remove();
    
    var modal = document.createElement('div');
    modal.id = 'parentReceiptModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;';
    
    var content = '<div style="max-width:900px;width:100%;">';
    
    // Toolbar
    content += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;color:white;padding:0 10px;">';
    content += '<div style="font-weight:700;font-size:1.1rem;">📄 Resit Yuran Bulanan</div>';
    content += '<div style="display:flex;gap:10px;">';
    content += '<button onclick="printParentReceipt()" style="background:#7c3aed;color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;">🖨 Cetak</button>';
    content += '<button onclick="closeParentReceipt()" style="background:#ef4444;color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;">✕ Tutup</button>';
    content += '</div>';
    content += '</div>';
    
    // Paper
    content += '<div id="parentReceiptPaper" style="background:white;padding:40px;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">';
    content += html;
    content += '</div>';
    
    content += '</div>';
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) closeParentReceipt();
    };
}

function closeParentReceipt() {
    var modal = document.getElementById('parentReceiptModal');
    if (modal) modal.remove();
}

function printParentReceipt() {
    var paper = document.getElementById('parentReceiptPaper');
    if (!paper) return;
    
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<!DOCTYPE html><html><head><title>Resit Bulanan</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('@page{size:A4;margin:15mm}body{font-family:Arial,sans-serif;margin:0;padding:0;color:#000}');
    printWindow.document.write('table{border-collapse:collapse}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(paper.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function() { printWindow.print(); }, 500);
}

console.log('✅ Parent monthly receipt feature loaded');

// ============================================
// ===== APPLY PORTAL SETTINGS (PARENT) =======
// ============================================

// Global cache untuk portal settings
var _parentPortalSettingsCache = null;
var _parentPortalListenerActive = false;

// Default settings
function getDefaultParentPortalSettings() {
    return {
        quickActions: {
            hafazan: true,
            attendance: true,
            payment: true,
            ustaz: true,
            calendar: true
        },
        tabs: {
            dashboard: true,
            hafazan: true,
            progress: true,
            attendance: true,
            payment: true,
            report: true,
            schedule: true,
            calendar: true,
            gallery: true,
            video: true,
            prayer: true,
            notifikasi: true,
            achievement: true,
            ustaz: true,
            album: true,
            outing: true
        }
    };
}

// ✅ FIX: Init real-time listener untuk portal settings
function initParentPortalListener() {
    if (_parentPortalListenerActive) return;
    _parentPortalListenerActive = true;

    if (typeof firebase === 'undefined' || !firebase.database) {
        console.warn('⚠️ Firebase tidak tersedia, guna default settings');
        _parentPortalSettingsCache = getDefaultParentPortalSettings();
        applyParentPortalSettings();
        return;
    }

    firebase.database().ref('hafazanData/parentPortalSettings').on('value', function(snap) {
        var data = snap.val();
        if (data) {
            _parentPortalSettingsCache = data;
            console.log('🔔 Portal settings updated from Firebase');
        } else {
            _parentPortalSettingsCache = getDefaultParentPortalSettings();
            console.log('ℹ️ Guna default portal settings');
        }
        applyParentPortalSettings();
    }, function(err) {
        console.error('❌ Portal settings listener error:', err.message);
        _parentPortalSettingsCache = getDefaultParentPortalSettings();
        applyParentPortalSettings();
    });
}

// ✅ FIX: Apply settings dari cache (bukan loadData)
function applyParentPortalSettings() {
    // Guna cache dari Firebase listener
    var settings = _parentPortalSettingsCache || getDefaultParentPortalSettings();

    // Safety: pastikan quickActions & tabs ada
    if (!settings.quickActions) settings.quickActions = getDefaultParentPortalSettings().quickActions;
    if (!settings.tabs) settings.tabs = getDefaultParentPortalSettings().tabs;

    // ===== Hide/Show Quick Actions =====
    var qaItems = document.querySelectorAll('.pqa-item');
    for (var i = 0; i < qaItems.length; i++) {
        var qa = qaItems[i];
        var onclick = qa.getAttribute('onclick') || '';

        var keyMatch = null;
        if (onclick.indexOf("'hafazan'") > -1) keyMatch = 'hafazan';
        else if (onclick.indexOf("'attendance'") > -1) keyMatch = 'attendance';
        else if (onclick.indexOf("'payment'") > -1) keyMatch = 'payment';
        else if (onclick.indexOf('chatWithUstaz') > -1) keyMatch = 'ustaz';
        else if (onclick.indexOf("'calendar'") > -1) keyMatch = 'calendar';

        if (keyMatch) {
            if (settings.quickActions[keyMatch]) {
                qa.style.setProperty('display', 'flex', 'important');
            } else {
                qa.style.setProperty('display', 'none', 'important');
            }
        }
    }

    // ===== Hide/Show Tabs =====
    var tabBtns = document.querySelectorAll('#parentPage .tab-nav .tab-btn');
    var firstVisibleTab = null;

    for (var i = 0; i < tabBtns.length; i++) {
        var btn = tabBtns[i];
        var onclick = btn.getAttribute('onclick') || '';

        var match = onclick.match(/parentSwitchTab\('([^']+)'/);
        if (!match) continue;

        var tabName = match[1];
        var shouldShow = settings.tabs[tabName] === true;

        if (shouldShow) {
            btn.style.setProperty('display', 'flex', 'important');
        } else {
            btn.style.setProperty('display', 'none', 'important');
        }

        if (shouldShow && !firstVisibleTab) {
            firstVisibleTab = { btn: btn, name: tabName };
        }
    }

    // ===== Hide/Show items dalam "Lagi" menu =====
    var moreBtn = document.querySelector('#parentPage .tab-more-btn');
    if (moreBtn) {
        var moreItems = document.querySelectorAll('#parentTabMoreMenu .tab-more-item');
        var anyMoreActive = false;
        for (var i = 0; i < moreItems.length; i++) {
            var onclick = moreItems[i].getAttribute('onclick') || '';
            var m = onclick.match(/parentSwitchTabFromMenu\('([^']+)'/);
            if (m && settings.tabs[m[1]]) {
                moreItems[i].style.display = '';
                anyMoreActive = true;
            } else if (m) {
                moreItems[i].style.display = 'none';
            }
        }
        moreBtn.style.display = anyMoreActive ? '' : 'none';
    }

    // Auto switch to first visible tab kalau current tab hidden
    if (firstVisibleTab) {
        var currentActive = document.querySelector('#parentPage .tab-btn.active');
        var currentVisible = currentActive && currentActive.style.display !== 'none';

        if (!currentVisible) {
            if (typeof parentSwitchTab === 'function') {
                parentSwitchTab(firstVisibleTab.name, firstVisibleTab.btn);
            }
        }
    }

    console.log('✅ Portal settings applied');
}

// ✅ FIX: Auto-init listener bila parent dashboard init
var _origInitParentSettings = window.initParentDashboard;
window.initParentDashboard = function() {
    if (typeof _origInitParentSettings === 'function') {
        _origInitParentSettings();
    }

    // Start Firebase listener (auto-apply bila data berubah)
    setTimeout(initParentPortalListener, 500);
};

console.log('✅ Parent portal settings loaded (with real-time listener)');

// ============================================
// ===== PARENT OUTING SYSTEM =================
// ============================================

function initParentOuting() {
    renderParentOutingList();
}

function openParentOutingForm() {
    // Reset form
    document.getElementById('parentOutingForm').reset();
    
    // Set default date to next Saturday
    var today = new Date();
    var daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
    var nextSaturday = new Date();
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    document.getElementById('poutingDate').value = nextSaturday.toISOString().split('T')[0];
    document.getElementById('poutingDate').min = today.toISOString().split('T')[0];
    
    // Reset warnings
    document.getElementById('poutingWeekdayWarning').style.display = 'none';
    document.getElementById('poutingDurationWarning').style.display = 'none';
    
    // Add listeners
    setupOutingFormListeners();
    
    document.getElementById('parentOutingModal').classList.remove('hidden');
}

function closeParentOutingForm() {
    document.getElementById('parentOutingModal').classList.add('hidden');
}

function setupOutingFormListeners() {
    var dateEl = document.getElementById('poutingDate');
    var timeOutEl = document.getElementById('poutingTimeOut');
    var expectedEl = document.getElementById('poutingExpected');
    
    // Check weekday
    dateEl.onchange = function() {
        var d = new Date(this.value);
        var day = d.getDay();
        var warning = document.getElementById('poutingWeekdayWarning');
        
        if (day !== 0 && day !== 6) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    };
    
    // Check duration
    var checkDuration = function() {
        var out = timeOutEl.value;
        var exp = expectedEl.value;
        if (!out || !exp) return;
        
        var outParts = out.split(':');
        var expParts = exp.split(':');
        var outMin = parseInt(outParts[0]) * 60 + parseInt(outParts[1]);
        var expMin = parseInt(expParts[0]) * 60 + parseInt(expParts[1]);
        var diff = expMin - outMin;
        
        var warning = document.getElementById('poutingDurationWarning');
        if (diff > 240 || diff < 0) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    };
    
    timeOutEl.onchange = checkDuration;
    expectedEl.onchange = checkDuration;
}

function submitParentOuting(e) {
    e.preventDefault();
    
    var date = document.getElementById('poutingDate').value;
    var timeOut = document.getElementById('poutingTimeOut').value;
    var expected = document.getElementById('poutingExpected').value;
    var reason = document.getElementById('poutingReason').value.trim();
    var pickupName = document.getElementById('poutingPickupName').value.trim();
    var relation = document.getElementById('poutingRelation').value;
    var phone = document.getElementById('poutingPickupPhone').value.trim();
    var notes = document.getElementById('poutingNotes').value.trim();
    
    // Validate duration
    var outParts = timeOut.split(':');
    var expParts = expected.split(':');
    var outMin = parseInt(outParts[0]) * 60 + parseInt(outParts[1]);
    var expMin = parseInt(expParts[0]) * 60 + parseInt(expParts[1]);
    var diff = expMin - outMin;
    
    if (diff <= 0) {
        alert('❌ Masa pulang mesti selepas masa keluar!');
        return;
    }
    
    if (diff > 240) {
        if (!confirm('⚠️ Tempoh outing melebihi 4 jam. Teruskan?')) return;
    }
    
    // Get student info
    var student = null;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i].id === currentUser.studentId) {
            student = appData.students[i];
            break;
        }
    }
    if (!student) {
        alert('❌ Data pelajar tidak ditemui');
        return;
    }
    
    // Check outing count this month
    if (!appData.outings) appData.outings = [];
    
    var outingMonth = parseInt(date.split('-')[1]);
    var outingYear = parseInt(date.split('-')[0]);
    var monthCount = 0;
    
    for (var i = 0; i < appData.outings.length; i++) {
        var o = appData.outings[i];
        if (o.studentId === student.id && o.date) {
            var oM = parseInt(o.date.split('-')[1]);
            var oY = parseInt(o.date.split('-')[0]);
            if (oM === outingMonth && oY === outingYear && 
                (o.status === 'approved' || o.status === 'checkedout' || o.status === 'completed')) {
                monthCount++;
            }
        }
    }
    
    if (monthCount >= 1) {
        if (!confirm('⚠️ Anak anda sudah ada ' + monthCount + ' outing bulan ini.\n\nPeraturan: Outing hanya sebulan sekali.\n\nTeruskan mohon?')) return;
    }
    
    // Create outing record
    var newOuting = {
        id: 'OUT' + Date.now(),
        studentId: student.id,
        studentName: student.name,
        studentClass: student.class,
        date: date,
        timeOut: timeOut,
        expectedReturn: expected,
        reason: reason,
        pickupName: pickupName,
        pickupRelation: relation,
        pickupPhone: phone,
        parentNotes: notes,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        appliedBy: currentUser.name
    };
    
    appData.outings.push(newOuting);
    saveData(appData);
    
    closeParentOutingForm();
    showToast('✅ Permohonan outing dihantar!');
    renderParentOutingList();
    
    // Notify admin via WhatsApp
    setTimeout(function() {
        if (confirm('📱 Hantar notifikasi ke admin via WhatsApp?')) {
            sendOutingApplyNotification(newOuting);
        }
    }, 500);
}

function sendOutingApplyNotification(outing) {
    var adminPhone = '60192363638'; // Default admin phone
    
    var msg = '🕌 *MADRASAH TAHFIZ PEKAN SUNGAI BULOH*\n';
    msg += '━━━━━━━━━━━━━━━━━━━\n\n';
    msg += '📩 *PERMOHONAN OUTING BARU*\n\n';
    msg += '👨‍🎓 *Pelajar:* ' + outing.studentName + '\n';
    msg += '📚 *Kelas:* ' + outing.studentClass + '\n';
    msg += '📅 *Tarikh:* ' + formatDateP(outing.date) + '\n';
    msg += '🕐 *Masa:* ' + outing.timeOut + ' - ' + outing.expectedReturn + '\n';
    msg += '👤 *Pengambil:* ' + outing.pickupName + ' (' + outing.pickupRelation + ')\n';
    msg += '📱 *Tel:* ' + outing.pickupPhone + '\n';
    msg += '📝 *Sebab:* ' + outing.reason + '\n';
    if (outing.parentNotes) {
        msg += '💬 *Catatan:* ' + outing.parentNotes + '\n';
    }
    msg += '\n━━━━━━━━━━━━━━━━━━━\n';
    msg += 'Sila semak dan lulus/tolak di admin panel.\n\n';
    msg += '_Dihantar oleh: ' + currentUser.name + '_';
    
    var waUrl = 'https://wa.me/' + adminPhone + '?text=' + encodeURIComponent(msg);
    window.open(waUrl, '_blank');
}

function renderParentOutingList() {
    var container = document.getElementById('parentOutingList');
    if (!container) return;
    
    if (!currentUser || !currentUser.studentId) return;
    
    var outings = [];
    if (appData.outings) {
        for (var i = 0; i < appData.outings.length; i++) {
            if (appData.outings[i].studentId === currentUser.studentId) {
                outings.push(appData.outings[i]);
            }
        }
    }
    
    if (outings.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:40px;"><div class="empty-icon">🚗</div><p>Belum ada permohonan outing</p><small>Klik "Mohon Outing Baru" untuk mula</small></div>';
        return;
    }
    
    // Sort newest first
    outings.sort(function(a, b) {
        return new Date(b.appliedAt || b.date) - new Date(a.appliedAt || a.date);
    });
    
    var statusConfig = {
        pending: { label: '⏳ Menunggu Kelulusan', bg: '#fef3c7', color: '#78350f', border: '#f59e0b' },
        approved: { label: '✅ Diluluskan', bg: '#d1fae5', color: '#065f46', border: '#10b981' },
        rejected: { label: '❌ Ditolak', bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
        checkedout: { label: '🚗 Sedang Outing', bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
        completed: { label: '✅ Selesai', bg: '#f0fdf4', color: '#047857', border: '#10b981' }
    };
    
    var html = '';
    for (var i = 0; i < outings.length; i++) {
        var o = outings[i];
        var sc = statusConfig[o.status] || statusConfig.pending;
        
        html += '<div style="background:white;border:2px solid ' + sc.border + ';border-radius:14px;padding:15px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">';
        
        // Header dengan status
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">';
        html += '<div style="font-weight:800;color:#1f2937;font-size:1rem;">📅 ' + formatDateP(o.date) + '</div>';
        html += '<span style="background:' + sc.bg + ';color:' + sc.color + ';padding:5px 12px;border-radius:12px;font-size:0.78rem;font-weight:700;">' + sc.label + '</span>';
        html += '</div>';
        
        // Details
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.85rem;margin-bottom:10px;">';
        html += '<div><strong style="color:#64748b;">🕐 Masa:</strong><br>' + (o.timeOut || '-') + ' - ' + (o.expectedReturn || '-') + '</div>';
        html += '<div><strong style="color:#64748b;">👤 Pengambil:</strong><br>' + (o.pickupName || '-') + '</div>';
        html += '</div>';
        
        // Reason
        if (o.reason) {
            html += '<div style="background:#faf5ff;padding:10px;border-radius:8px;margin-bottom:10px;">';
            html += '<div style="font-size:0.72rem;color:#7c3aed;font-weight:700;margin-bottom:3px;">📝 SEBAB:</div>';
            html += '<div style="font-size:0.85rem;color:#1f2937;">' + o.reason + '</div>';
            html += '</div>';
        }
        
        // Check In/Out info
        if (o.actualCheckOut || o.actualCheckIn) {
            html += '<div style="background:#dbeafe;padding:10px;border-radius:8px;margin-bottom:10px;font-size:0.82rem;">';
            if (o.actualCheckOut) html += '<div>🚗 <strong>Check Out:</strong> ' + o.actualCheckOut + '</div>';
            if (o.actualCheckIn) html += '<div style="margin-top:3px;">🏠 <strong>Check In:</strong> ' + o.actualCheckIn + '</div>';
            
            if (o.actualCheckOut && o.actualCheckIn) {
                var outT = o.actualCheckOut.split(':');
                var inT = o.actualCheckIn.split(':');
                var outM = parseInt(outT[0]) * 60 + parseInt(outT[1]);
                var inM = parseInt(inT[0]) * 60 + parseInt(inT[1]);
                var diff = inM - outM;
                var h = Math.floor(diff / 60);
                var m = diff % 60;
                html += '<div style="margin-top:3px;color:' + (diff > 240 ? '#dc2626' : '#059669') + ';font-weight:700;">⏱ <strong>Tempoh:</strong> ' + h + 'j ' + m + 'm' + (diff > 240 ? ' ⚠️ Overtime!' : '') + '</div>';
            }
            html += '</div>';
        }
        
        // Reject reason
        if (o.status === 'rejected' && o.rejectReason) {
            html += '<div style="background:#fee2e2;padding:10px;border-radius:8px;margin-bottom:10px;">';
            html += '<div style="font-size:0.72rem;color:#991b1b;font-weight:700;margin-bottom:3px;">❌ SEBAB DITOLAK:</div>';
            html += '<div style="font-size:0.85rem;color:#7f1d1d;">' + o.rejectReason + '</div>';
            html += '</div>';
        }
        
        // Admin notes
        if (o.adminNotes) {
            html += '<div style="background:#fef3c7;padding:10px;border-radius:8px;margin-bottom:10px;">';
            html += '<div style="font-size:0.72rem;color:#78350f;font-weight:700;margin-bottom:3px;">💬 CATATAN ADMIN:</div>';
            html += '<div style="font-size:0.85rem;color:#92400e;">' + o.adminNotes + '</div>';
            html += '</div>';
        }
        
        // Footer
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px dashed #e2e8f0;font-size:0.72rem;color:#94a3b8;">';
        html += '<span>📅 Mohon: ' + formatDateP(o.appliedAt ? o.appliedAt.split('T')[0] : o.date) + '</span>';
        if (o.status === 'pending') {
            html += '<button onclick="cancelParentOuting(\'' + o.id + '\')" style="background:#ef4444;color:white;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700;font-size:0.72rem;">🗑 Batal</button>';
        }
        html += '</div>';
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function cancelParentOuting(outingId) {
    if (!confirm('Batalkan permohonan outing ini?')) return;
    
    appData.outings = appData.outings.filter(function(o) { return o.id !== outingId; });
    saveData(appData);
    renderParentOutingList();
    showToast('🗑 Permohonan dibatalkan');
}

// Hook to parent tab switch
var _origParentSwitchTabOuting = window.parentSwitchTab;
window.parentSwitchTab = function(tabName, btn) {
    if (typeof _origParentSwitchTabOuting === 'function') {
        _origParentSwitchTabOuting(tabName, btn);
    }
    
    if (tabName === 'outing') {
        setTimeout(initParentOuting, 100);
    }
};

console.log('✅ Parent Outing System loaded');

// ============================================
// ===== DARK MODE TOGGLE (PARENT) ============
// ============================================
function initParentTheme() {
    var savedTheme = localStorage.getItem('parentTheme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        var btn = document.getElementById('btnThemeToggleP');
        if (btn) btn.textContent = '☀️';
    }
}

function toggleParentTheme() {
    var htmlEl = document.documentElement;
    var currentTheme = htmlEl.getAttribute('data-theme');
    var btn = document.getElementById('btnThemeToggleP');

    if (currentTheme === 'dark') {
        htmlEl.removeAttribute('data-theme');
        localStorage.setItem('parentTheme', 'light');
        if (btn) btn.textContent = '🌙';
        if (typeof showToast === 'function') showToast('☀️ Mod Cerah diaktifkan');
    } else {
        htmlEl.setAttribute('data-theme', 'dark');
        localStorage.setItem('parentTheme', 'dark');
        if (btn) btn.textContent = '☀️';
        if (typeof showToast === 'function') showToast('🌙 Mod Gelap diaktifkan');
    }
}

// Init theme immediately on load
document.addEventListener('DOMContentLoaded', initParentTheme);
// Panggil sekali lagi sekiranya event sudah berjalan
initParentTheme();

// ============================================
// ===== PORTAL IBU BAPA - TEMA GELAP ========
// ============================================

// Fungsi untuk menukar tema gelap/cerah
function toggleParentTheme() {
    var body = document.body;
    
    // Toggle class 'dark-mode' pada body
    var isDark = body.classList.toggle('dark-mode');
    
    // Simpan pilihan ke dalam localStorage
    localStorage.setItem('parentTheme', isDark ? 'dark' : 'light');
    
    // Kemas kini ikon atau teks butang jika ada
    updateParentThemeUI(isDark);
}

// Fungsi untuk memuatkan tema yang disimpan semasa aplikasi dibuka
function initParentTheme() {
    var savedTheme = localStorage.getItem('parentTheme');
    var body = document.body;
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateParentThemeUI(true);
    } else {
        body.classList.remove('dark-mode');
        updateParentThemeUI(false);
    }
}

// Pembantu mengemas kini ikon/teks butang tema
function updateParentThemeUI(isDark) {
    // Cari elemen ikon di butang penukar tema (jika anda menggunakan ID ini)
    var iconEl = document.getElementById('themeToggleIcon') || document.querySelector('.theme-toggle-btn i');
    if (iconEl) {
        if (iconEl.tagName.toLowerCase() === 'i') {
            // Jika menggunakan class font-awesome/boxicons
            if (isDark) {
                iconEl.className = 'bx bx-sun'; // atau ikon matahari pilihan anda
            } else {
                iconEl.className = 'bx bx-moon'; // atau ikon bulan pilihan anda
            }
        } else {
            // Jika menggunakan teks emoji
            iconEl.textContent = isDark ? '☀️' : '🌙';
        }
    }
}

// Jalankan fungsi init secara automatik apabila fail ini dimuatkan
document.addEventListener('DOMContentLoaded', function() {
    initParentTheme();
});