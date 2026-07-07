// ============================================
// ===== PARENT DATA WIZARD - JavaScript ======
// ============================================

// Global state
var pdwState = {
    currentStep: 0,
    totalSteps: 0,
    sectionKeys: [],
    formData: {},
    student: null,
    onSaveCallback: null,
    firebaseRef: null,
    
    // ===== BARU: Skip tracking =====
    skipCount: 0,           // Berapa kali skip
    maxSkips: 3,            // Max boleh skip
    snoozeUntil: null       // Timestamp bila boleh muncul lagi
};

// ============================================
// ===== SKIP MANAGEMENT ======================
// ============================================

/**
 * Get skip data dari localStorage
 */
function pdwGetSkipData(studentId) {
    try {
        var key = 'pdwSkip_' + studentId;
        var data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
    } catch(e) {}
    
    return {
        skipCount: 0,
        snoozeUntil: null,
        lastSkipped: null
    };
}

/**
 * Save skip data ke localStorage
 */
function pdwSaveSkipData(studentId, data) {
    try {
        var key = 'pdwSkip_' + studentId;
        localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {}
}

/**
 * Reset skip data (bila data dah 100% lengkap)
 */
function pdwResetSkipData(studentId) {
    try {
        var key = 'pdwSkip_' + studentId;
        localStorage.removeItem(key);
    } catch(e) {}
}

// ============================================
// ===== DRAFT MANAGEMENT =====================
// ============================================

// ============================================
// ===== FIELD HELPERS ========================
// ============================================

/**
 * Get placeholder text untuk field
 */
function pdwGetFieldPlaceholder(field) {
    // Get current idType untuk dynamic placeholder
    var idType = pdwState.formData.idType || 'MyKid/IC';
    var fatherIdType = pdwState.formData.fatherIdType || 'MyKad/IC';
    var motherIdType = pdwState.formData.motherIdType || 'MyKad/IC';
    
    var placeholders = {
        // Pelajar
        name: 'Contoh: Ahmad bin Ali',
        ic: idType === 'MyKid/IC' ? '120515-14-1234' : 
            idType === 'No. Passport' ? 'Contoh: A12345678' : 
            'Contoh: BS123456',
        birthPlace: 'Contoh: Hospital Sungai Buloh',
        address: 'No. 123, Jalan Contoh 4/5, Taman Damai',
        postcode: '47000',
        city: 'Contoh: Sungai Buloh',
        
        // Bapa
        fatherName: 'Contoh: Ali bin Ahmad',
        fatherIC: fatherIdType === 'MyKad/IC' ? '800101-14-5678' : 'Contoh: B12345678',
        fatherJob: 'Contoh: Jurutera',
        fatherEmployer: 'Contoh: Petronas',
        fatherPhone: '012-3456789 (atau 011-12345678)',
        fatherEmail: 'ali@email.com',
        
        // Ibu
        motherName: 'Contoh: Fatimah binti Hassan',
        motherIC: motherIdType === 'MyKad/IC' ? '820203-14-9012' : 'Contoh: C87654321',
        motherJob: 'Contoh: Guru',
        motherEmployer: 'Contoh: SK Sungai Buloh',
        motherPhone: '019-8765432 (atau 011-98765432)',
        motherEmail: 'fatimah@email.com',
        
        // Kecemasan
        emergencyName: 'Contoh: Datuk Ahmad',
        emergencyPhone: '017-1234567',
        emergencyAddress: 'Alamat waris untuk kecemasan',
        
        // Kesihatan
        allergies: 'Contoh: Alahan udang, telur (atau "Tiada")',
        medicalConditions: 'Contoh: Asma (atau "Tiada")',
        currentMedication: 'Contoh: Ventolin (atau "Tiada")',
        familyDoctor: 'Contoh: Klinik Damai',
        
        // Pendidikan
        previousSchool: 'Contoh: Tadika Al-Amin',
        hafazanCert: 'Contoh: Juz 30 (Al-Amin 2024)'
    };
    
    return placeholders[field.key] || '';
}

/**
 * Get hint text untuk field
 */
function pdwGetFieldHint(field) {
    var idType = pdwState.formData.idType || 'MyKid/IC';
    var fatherIdType = pdwState.formData.fatherIdType || 'MyKad/IC';
    var motherIdType = pdwState.formData.motherIdType || 'MyKad/IC';
    
    var hints = {
        idType: 'Pilih jenis dokumen pengenalan pelajar',
        fatherIdType: 'Pilih jenis dokumen pengenalan bapa',
        motherIdType: 'Pilih jenis dokumen pengenalan ibu',
        
        ic: idType === 'MyKid/IC' ? 'Format: 12 digit (dengan atau tanpa "-")' :
            idType === 'No. Passport' ? 'Format: Huruf + Nombor (contoh: A12345678)' :
            'Nombor pada surat beranak',
        
        fatherIC: fatherIdType === 'MyKad/IC' ? 'Format: 12 digit' : 'Format: Passport',
        motherIC: motherIdType === 'MyKad/IC' ? 'Format: 12 digit' : 'Format: Passport',
        
        fatherPhone: 'Format: 01X-XXXXXXX (10 atau 11 digit)',
        motherPhone: 'Format: 01X-XXXXXXX (10 atau 11 digit)',
        emergencyPhone: 'Nombor yang boleh dihubungi 24 jam (10-11 digit)',
        
        nationality: 'Warganegara Malaysia atau warganegara asing',
        fatherNationality: 'Warganegara asal bapa',
        motherNationality: 'Warganegara asal ibu',
        
        allergies: 'Tulis "Tiada" jika tiada alahan',
        medicalConditions: 'Tulis "Tiada" jika sihat',
        currentMedication: 'Tulis "Tiada" jika tiada ubat',
        
        emergencyName: 'Pilih orang selain ibu/bapa (untuk backup)'
    };
    
    return hints[field.key] || '';
}
/**
 * Save draft ke localStorage
 */
function pdwSaveDraft() {
    if (!pdwState.student || !pdwState.student.id) return;
    
    try {
        var key = 'pdwDraft_' + pdwState.student.id;
        var draft = {
            formData: pdwState.formData,
            currentStep: pdwState.currentStep,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(draft));
        console.log('💾 Draft saved (Step ' + (pdwState.currentStep + 1) + ')');
    } catch(e) {
        console.log('⚠️ Failed to save draft:', e);
    }
}

/**
 * Load draft dari localStorage
 */
function pdwLoadDraft(studentId) {
    try {
        var key = 'pdwDraft_' + studentId;
        var data = localStorage.getItem(key);
        if (data) {
            var draft = JSON.parse(data);
            
            // Check kalau draft terlalu lama (>7 hari)
            var savedAt = new Date(draft.savedAt);
            var daysAgo = (new Date() - savedAt) / (1000 * 60 * 60 * 24);
            
            if (daysAgo > 7) {
                console.log('⏰ Draft too old, ignoring');
                pdwClearDraft(studentId);
                return null;
            }
            
            return draft;
        }
    } catch(e) {}
    
    return null;
}

/**
 * Clear draft
 */
function pdwClearDraft(studentId) {
    try {
        var key = 'pdwDraft_' + studentId;
        localStorage.removeItem(key);
        console.log('🗑️ Draft cleared');
    } catch(e) {}
}

/**
 * Check kalau patut skip popup
 */
function pdwShouldSkipReminder(studentId) {
    var skipData = pdwGetSkipData(studentId);
    
    // Check snooze period
    if (skipData.snoozeUntil) {
        var now = new Date().getTime();
        var snoozeTime = new Date(skipData.snoozeUntil).getTime();
        
        if (now < snoozeTime) {
            var hoursLeft = Math.ceil((snoozeTime - now) / (1000 * 60 * 60));
            console.log('⏰ Popup snoozed for ' + hoursLeft + ' more hours');
            return true;
        } else {
            // Snooze expired
            skipData.snoozeUntil = null;
            pdwSaveSkipData(studentId, skipData);
        }
    }
    
    return false;
}

/**
 * Initialize wizard dengan student data
 * @param {Object} student - Object pelajar
 * @param {Object} options - { onSave, firebaseRef }
 */
function pdwInit(student, options) {
    options = options || {};
    
    if (!student) {
        console.error('❌ pdwInit: No student provided');
        return;
    }
    
    pdwState.student = student;
    pdwState.formData = JSON.parse(JSON.stringify(student));
    pdwState.sectionKeys = Object.keys(PARENT_DATA_SECTIONS);
    pdwState.totalSteps = pdwState.sectionKeys.length;
    pdwState.currentStep = 0;
    pdwState.onSaveCallback = options.onSave || null;
    pdwState.firebaseRef = options.firebaseRef || 'admin';
    
    // ===== BARU: Load skip data =====
    var skipData = pdwGetSkipData(student.id);
    pdwState.skipCount = skipData.skipCount || 0;
    pdwState.snoozeUntil = skipData.snoozeUntil;
    
    // Check completeness
    var completeness = checkStudentDataCompleteness(student);
    
    // Kalau dah 100%, tak perlu tunjuk apa-apa
    if (completeness.isComplete) {
        console.log('✅ Data lengkap 100%!');
        pdwResetSkipData(student.id); // Reset skip data
        return;
    }
    
    // ===== BARU: Check kalau patut skip =====
    if (pdwShouldSkipReminder(student.id)) {
        // Tak tunjuk popup, tapi tunjuk banner
        pdwShowBanner();
        pdwUpdateBanner(completeness.overall);
        console.log('⏭ Popup skipped, showing banner only');
        return;
    }
    
    // ===== BARU: Check kalau force (dah skip lebih 3 kali) =====
    var isForced = pdwState.skipCount >= pdwState.maxSkips;
    
    // Tunjuk reminder popup
    pdwShowReminder(completeness, isForced);
    
    // Update banner
    pdwUpdateBanner(completeness.overall);
}

// ============================================
// ===== REMINDER POPUP =======================
// ============================================

function pdwShowReminder(completeness, isForced) {
    var popup = document.getElementById('pdwReminderPopup');
    if (!popup) return;
    
    // Update student name
    var studentEl = document.getElementById('pdwReminderStudent');
    if (studentEl && pdwState.student) {
        studentEl.textContent = 'Anak: ' + (pdwState.student.name || 'Tidak Diketahui');
    }
    
    // Update percentage
    var percentEl = document.getElementById('pdwReminderPercent');
    if (percentEl) {
        percentEl.textContent = completeness.overall + '%';
    }
    
    // Update progress bar
    var barEl = document.getElementById('pdwReminderBar');
    if (barEl) {
        setTimeout(function() {
            barEl.style.width = completeness.overall + '%';
        }, 100);
    }
    
    // Render sections list
    var sectionsEl = document.getElementById('pdwReminderSections');
    if (sectionsEl) {
        var html = '';
        for (var key in completeness.sections) {
            var section = completeness.sections[key];
            var config = PARENT_DATA_SECTIONS[key];
            
            var statusIcon = section.percentage === 100 ? '✅' : (section.percentage > 0 ? '⚠️' : '❌');
            var statusColor = section.percentage === 100 ? '#059669' : (section.percentage > 0 ? '#f59e0b' : '#ef4444');
            var bgColor = section.percentage === 100 ? '#d1fae5' : (section.percentage > 0 ? '#fef3c7' : '#fee2e2');
            
            html += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:' + bgColor + ';border-radius:8px;">';
            html += '<span style="font-size:1.5rem;">' + config.icon + '</span>';
            html += '<div style="flex:1;">';
            html += '<div style="font-weight:700;color:#1f2937;font-size:0.88rem;">' + config.title + '</div>';
            html += '<div style="font-size:0.75rem;color:#64748b;">' + section.totalFilled + '/' + section.totalRequired + ' fields</div>';
            html += '</div>';
            html += '<div style="display:flex;align-items:center;gap:5px;">';
            html += '<span style="font-weight:800;color:' + statusColor + ';font-size:0.95rem;">' + section.percentage + '%</span>';
            html += '<span style="font-size:1.2rem;">' + statusIcon + '</span>';
            html += '</div>';
            html += '</div>';
        }
        sectionsEl.innerHTML = html;
    }
    
    // ===== BARU: Update buttons based on isForced =====
    var buttonsContainer = popup.querySelector('div[style*="display:flex;gap:10px"]:last-of-type');
    if (buttonsContainer) {
        if (isForced) {
            // FORCE MODE - takda button Kemudian
            buttonsContainer.innerHTML = 
                '<button onclick="pdwOpenWizard()" style="flex:1;padding:14px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border:none;border-radius:12px;font-weight:800;cursor:pointer;font-size:0.95rem;box-shadow:0 4px 15px rgba(239,68,68,0.4);">' +
                '📝 Lengkapkan Sekarang (Wajib)' +
                '</button>';
        } else {
            // NORMAL MODE - ada button Kemudian
            var skipsLeft = pdwState.maxSkips - pdwState.skipCount;
            var skipText = skipsLeft > 0 ? 'Kemudian (' + skipsLeft + ' skip lagi)' : 'Kemudian';
            
            buttonsContainer.innerHTML = 
                '<button onclick="pdwOpenWizard()" style="flex:2;padding:14px;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;border:none;border-radius:12px;font-weight:800;cursor:pointer;font-size:0.95rem;box-shadow:0 4px 15px rgba(124,58,237,0.4);">' +
                '📝 Lengkapkan Sekarang' +
                '</button>' +
                '<button onclick="pdwCloseReminder()" style="flex:1;padding:14px;background:#f1f5f9;color:#64748b;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-size:0.9rem;">' +
                skipText +
                '</button>';
        }
    }
    
    // ===== BARU: Show force warning kalau force mode =====
    if (isForced) {
        // Tambah warning banner dalam popup
        var body = popup.querySelector('div[style*="padding:25px"]');
        if (body) {
            var existingWarning = body.querySelector('.pdw-force-warning');
            if (!existingWarning) {
                var warning = document.createElement('div');
                warning.className = 'pdw-force-warning';
                warning.style.cssText = 'background:#fee2e2;padding:12px;border-radius:10px;border-left:4px solid #ef4444;margin-bottom:15px;';
                warning.innerHTML = '<p style="margin:0;color:#991b1b;font-size:0.85rem;font-weight:600;">⚠️ Anda telah skip ' + pdwState.skipCount + ' kali. Sila lengkapkan sekarang.</p>';
                body.insertBefore(warning, body.firstChild);
            }
        }
    }
    
    // Show popup
    popup.style.display = 'flex';
}

function pdwCloseReminder() {
    // ===== BARU: Check kalau force =====
    if (pdwState.skipCount >= pdwState.maxSkips) {
        alert('⚠️ Sila lengkapkan maklumat dahulu. Tidak boleh skip lagi!');
        return;
    }
    
    // ===== BARU: Track skip =====
    if (pdwState.student && pdwState.student.id) {
        var skipData = pdwGetSkipData(pdwState.student.id);
        skipData.skipCount = (skipData.skipCount || 0) + 1;
        skipData.lastSkipped = new Date().toISOString();
        
        // Snooze for 1 hour (agar tak muncul immediate)
        var snoozeHours = 1;
        var snoozeUntil = new Date();
        snoozeUntil.setHours(snoozeUntil.getHours() + snoozeHours);
        skipData.snoozeUntil = snoozeUntil.toISOString();
        
        pdwSaveSkipData(pdwState.student.id, skipData);
        pdwState.skipCount = skipData.skipCount;
        
        var skipsLeft = pdwState.maxSkips - skipData.skipCount;
        console.log('⏭ Skipped. ' + skipsLeft + ' skips remaining.');
    }
    
    var popup = document.getElementById('pdwReminderPopup');
    if (popup) popup.style.display = 'none';
    
    // Show banner instead
    pdwShowBanner();
}

// ============================================
// ===== BANNER (PERSISTENT) ==================
// ============================================

function pdwShowBanner() {
    var banner = document.getElementById('pdwBanner');
    if (banner) banner.style.display = 'block';
}

function pdwHideBanner() {
    var banner = document.getElementById('pdwBanner');
    if (banner) banner.style.display = 'none';
}

function pdwUpdateBanner(percent) {
    // Update percent number
    var el = document.getElementById('pdwBannerPercent');
    if (el) el.textContent = percent;
    
    // Update progress bar
    var bar = document.getElementById('pdwBannerProgressBar');
    if (bar) {
        setTimeout(function() {
            bar.style.width = percent + '%';
        }, 100);
    }
    
    // Update subtext berdasarkan progress
    var subtext = document.getElementById('pdwBannerSubtext');
    if (subtext) {
        if (percent === 0) {
            subtext.textContent = '🚀 Mari mulakan! Klik untuk lihat apa yang perlu diisi';
        } else if (percent < 30) {
            subtext.textContent = '💪 Baru bermula. Teruskan!';
        } else if (percent < 60) {
            subtext.textContent = '⭐ Bagus! Separuh jalan sahaja lagi';
        } else if (percent < 90) {
            subtext.textContent = '🔥 Hampir siap! Sedikit lagi';
        } else if (percent < 100) {
            subtext.textContent = '🎯 Nak siap! Beberapa field sahaja lagi';
        }
    }
    
    // Update banner details (sections)
    pdwUpdateBannerDetails();
    
    // Auto-hide kalau 100%
    if (percent === 100) {
        pdwShowCompleteBadge();
        setTimeout(function() {
            pdwHideBanner();
        }, 3000); // Hide selepas 3 saat celebration
    }
}

// ============================================
// ===== BANNER DETAILS (EXPANDABLE) ==========
// ============================================

function pdwToggleBannerDetails() {
    var details = document.getElementById('pdwBannerDetails');
    var icon = document.getElementById('pdwBannerToggleIcon');
    
    if (!details) return;
    
    if (details.style.display === 'none' || !details.style.display) {
        details.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        details.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}

function pdwUpdateBannerDetails() {
    var listEl = document.getElementById('pdwBannerSectionsList');
    if (!listEl || !pdwState.student) return;
    
    var completeness = checkStudentDataCompleteness(pdwState.student);
    if (!completeness) return;
    
    var html = '';
    for (var key in completeness.sections) {
        var section = completeness.sections[key];
        var config = PARENT_DATA_SECTIONS[key];
        
        var statusIcon = section.percentage === 100 ? '✅' : (section.percentage > 0 ? '⚠️' : '❌');
        var bgColor = section.percentage === 100 ? '#d1fae5' : (section.percentage > 0 ? '#fef3c7' : '#fee2e2');
        var textColor = section.percentage === 100 ? '#065f46' : (section.percentage > 0 ? '#78350f' : '#991b1b');
        
        html += '<div style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:' + bgColor + ';border-radius:8px;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.02)\'" onmouseout="this.style.transform=\'scale(1)\'" onclick="pdwOpenWizardAtSection(\'' + key + '\')">';
        html += '<span style="font-size:1rem;">' + config.icon + '</span>';
        html += '<span style="font-size:0.75rem;font-weight:700;color:' + textColor + ';flex:1;">' + config.title + '</span>';
        html += '<span style="font-size:0.8rem;font-weight:800;color:' + textColor + ';">' + section.percentage + '%</span>';
        html += '<span style="font-size:0.9rem;">' + statusIcon + '</span>';
        html += '</div>';
    }
    
    listEl.innerHTML = html;
}

// ============================================
// ===== OPEN WIZARD AT SPECIFIC SECTION ======
// ============================================

function pdwOpenWizardAtSection(sectionKey) {
    var stepIndex = pdwState.sectionKeys.indexOf(sectionKey);
    if (stepIndex === -1) return;
    
    // Open wizard
    var popup = document.getElementById('pdwReminderPopup');
    if (popup) popup.style.display = 'none';
    
    var modal = document.getElementById('pdwWizardModal');
    if (modal) modal.style.display = 'flex';
    
    // Jump to specific step
    pdwState.currentStep = stepIndex;
    pdwRenderStep();
    
    console.log('📂 Jumped to section: ' + sectionKey + ' (Step ' + (stepIndex + 1) + ')');
}

// ============================================
// ===== COMPLETION CELEBRATION ===============
// ============================================

function pdwShowCompleteBadge() {
    var existing = document.getElementById('pdwCompleteBadge');
    if (existing) existing.remove();
    
    var badge = document.createElement('div');
    badge.id = 'pdwCompleteBadge';
    badge.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:15px 30px;border-radius:50px;font-weight:800;font-size:1rem;box-shadow:0 10px 30px rgba(16,185,129,0.4);animation:pdwCelebrate 3s ease;';
    
    badge.innerHTML = '🎉 Tahniah! Maklumat 100% Lengkap!';
    
    document.body.appendChild(badge);
    
    // Play celebration sound
    pdwPlayCelebrationSound();
    
    // Auto remove
    setTimeout(function() {
        if (badge && badge.parentNode) {
            badge.remove();
        }
    }, 3000);
    
    // Add celebration CSS
    if (!document.getElementById('pdwCelebrationCSS')) {
        var style = document.createElement('style');
        style.id = 'pdwCelebrationCSS';
        style.textContent = 
            '@keyframes pdwCelebrate {' +
            '0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }' +
            '20% { transform: translateX(-50%) translateY(0); opacity: 1; }' +
            '80% { transform: translateX(-50%) translateY(0); opacity: 1; }' +
            '100% { transform: translateX(-50%) translateY(-100px); opacity: 0; }' +
            '}';
        document.head.appendChild(style);
    }
}

function pdwPlayCelebrationSound() {
    try {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play 3 notes (C, E, G - happy chord)
        var notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        var delays = [0, 100, 200];
        
        for (var i = 0; i < notes.length; i++) {
            (function(freq, delay) {
                setTimeout(function() {
                    var osc = audioCtx.createOscillator();
                    var gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.4);
                }, delay);
            })(notes[i], delays[i]);
        }
    } catch(e) {}
}

// ============================================
// ===== WIZARD MODAL =========================
// ============================================

function pdwOpenWizard() {
    // Close reminder popup
    var popup = document.getElementById('pdwReminderPopup');
    if (popup) popup.style.display = 'none';
    
    // Check kalau ada draft
    if (pdwState.student && pdwState.student.id) {
        var draft = pdwLoadDraft(pdwState.student.id);
        
        if (draft && draft.formData) {
            var savedAt = new Date(draft.savedAt);
            var timeAgo = Math.round((new Date() - savedAt) / (1000 * 60));
            var timeText = timeAgo < 60 ? timeAgo + ' minit' : Math.round(timeAgo / 60) + ' jam';
            
            var confirmed = confirm(
                '📝 Anda ada draft yang belum siap.\n\n' +
                'Disimpan: ' + timeText + ' lepas\n' +
                'Step: ' + (draft.currentStep + 1) + '/6\n\n' +
                'Klik OK untuk sambung draft.\n' +
                'Klik Cancel untuk mula baru.'
            );
            
            if (confirmed) {
                pdwState.formData = draft.formData;
                pdwState.currentStep = draft.currentStep;
                console.log('📂 Draft loaded from step ' + (draft.currentStep + 1));
            } else {
                pdwClearDraft(pdwState.student.id);
                pdwState.currentStep = 0;
            }
        } else {
            pdwState.currentStep = 0;
        }
    } else {
        pdwState.currentStep = 0;
    }
    
    // ===== BARU: Lock body scroll =====
    document.body.classList.add('pdw-modal-open');
    
    // Show wizard
    var modal = document.getElementById('pdwWizardModal');
    if (modal) modal.style.display = 'flex';
    
    // Render step
    pdwRenderStep();
}

function pdwCloseWizard() {
    if (!confirm('⚠️ Perubahan tak akan disimpan. Teruskan?')) return;
    
    var modal = document.getElementById('pdwWizardModal');
    if (modal) modal.style.display = 'none';
    
    // ===== BARU: Unlock body scroll =====
    document.body.classList.remove('pdw-modal-open');
}

function pdwRenderStep() {
    var sectionKey = pdwState.sectionKeys[pdwState.currentStep];
    var section = PARENT_DATA_SECTIONS[sectionKey];
    
    if (!section) return;
    
    // Update progress info
    document.getElementById('pdwStepCurrent').textContent = pdwState.currentStep + 1;
    document.getElementById('pdwStepTotal').textContent = pdwState.totalSteps;
    
    var percent = Math.round(((pdwState.currentStep + 1) / pdwState.totalSteps) * 100);
    document.getElementById('pdwStepPercent').textContent = percent + '%';
    document.getElementById('pdwStepBar').style.width = percent + '%';
    
    // Render section header + fields
    var html = '';
    
    // Section header
    html += '<div class="pdw-section-header" style="border-left-color:' + section.color + ';background:linear-gradient(135deg,' + section.color + '15,' + section.color + '05);">';
    html += '<span class="icon">' + section.icon + '</span>';
    html += '<div class="info">';
    html += '<h3 style="color:' + section.color + ';">' + section.title + '</h3>';
    html += '<p style="color:' + section.color + ';">Sila isi semua maklumat di bawah</p>';
    html += '</div>';
    html += '</div>';
    
    // Fields
    for (var i = 0; i < section.fields.length; i++) {
        var field = section.fields[i];
        var value = pdwState.formData[field.key] || field.default || '';
        var requiredMark = field.required ? '<span class="required">*</span>' : '';
        
        html += '<div class="pdw-field-group" id="pdwGroup_' + field.key + '">';
        html += '<label>' + field.label + ' ' + requiredMark + '</label>';
        
        // ===== BARU: Get placeholder & hint =====
var placeholder = pdwGetFieldPlaceholder(field);
var hint = pdwGetFieldHint(field);

// Render input based on type
if (field.type === 'select') {
    html += '<select id="pdwField_' + field.key + '" data-key="' + field.key + '" data-required="' + field.required + '">';
    html += '<option value="">Pilih ' + field.label + '</option>';
    for (var j = 0; j < field.options.length; j++) {
        var selected = value === field.options[j] ? ' selected' : '';
        html += '<option value="' + field.options[j] + '"' + selected + '>' + field.options[j] + '</option>';
    }
    html += '</select>';
} else if (field.type === 'textarea') {
    html += '<textarea id="pdwField_' + field.key + '" data-key="' + field.key + '" data-required="' + field.required + '" rows="3" placeholder="' + placeholder + '">' + value + '</textarea>';
} else {
    var maxlength = field.maxlength ? ' maxlength="' + field.maxlength + '"' : '';
    html += '<input type="' + field.type + '" id="pdwField_' + field.key + '" data-key="' + field.key + '" data-required="' + field.required + '" value="' + value + '" placeholder="' + placeholder + '"' + maxlength + '>';
}

// ===== BARU: Hint text =====
if (hint) {
    html += '<div style="font-size:0.75rem;color:#64748b;margin-top:4px;">💡 ' + hint + '</div>';
}

html += '<div class="error-msg">Field ini wajib diisi</div>';
html += '</div>';
    }
    
    document.getElementById('pdwWizardBody').innerHTML = html;

// ===== BARU: Listen untuk ID type change =====
var idTypeFields = ['idType', 'fatherIdType', 'motherIdType'];
for (var i = 0; i < idTypeFields.length; i++) {
    var el = document.getElementById('pdwField_' + idTypeFields[i]);
    if (el) {
        el.addEventListener('change', function() {
            // Save value dulu
            pdwState.formData[this.dataset.key] = this.value;
            // Re-render untuk update placeholder & hints
            pdwRenderStep();
        });
    }
}

// Update buttons
var btnBack = document.getElementById('pdwBtnBack');
    
    // Update buttons
    var btnBack = document.getElementById('pdwBtnBack');
    var btnNext = document.getElementById('pdwBtnNext');
    
    if (pdwState.currentStep === 0) {
        btnBack.style.display = 'none';
    } else {
        btnBack.style.display = 'block';
    }
    
    if (pdwState.currentStep === pdwState.totalSteps - 1) {
        btnNext.innerHTML = '💾 Simpan Semua';
    } else {
        btnNext.innerHTML = 'Seterusnya →';
    }
    
    // Scroll to top
    var modal = document.getElementById('pdwWizardModal');
    if (modal) modal.scrollTop = 0;
}

function pdwCollectFormData() {
    var sectionKey = pdwState.sectionKeys[pdwState.currentStep];
    var section = PARENT_DATA_SECTIONS[sectionKey];
    
    var errors = [];
    
    // Collect data & validate
    for (var i = 0; i < section.fields.length; i++) {
        var field = section.fields[i];
        var input = document.getElementById('pdwField_' + field.key);
        if (!input) continue;
        
        var value = input.value.trim();
        pdwState.formData[field.key] = value;
        
        // Validate required
        var group = document.getElementById('pdwGroup_' + field.key);
        var errorEl = group ? group.querySelector('.error-msg') : null;
        
        if (field.required && !value) {
            if (group) group.classList.add('has-error');
            if (errorEl) errorEl.textContent = 'Field ini wajib diisi';
            errors.push(field.label);
            continue;
        }
        
        // ===== BARU: Format validation =====
if (value) {
    // ===== ID validation (smart - based on idType) =====
    if (field.key === 'ic' || field.key === 'fatherIC' || field.key === 'motherIC') {
        // Determine idType key
        var idTypeKey = 'idType'; // default untuk pelajar
        if (field.key === 'fatherIC') idTypeKey = 'fatherIdType';
        else if (field.key === 'motherIC') idTypeKey = 'motherIdType';
        
        var idType = pdwState.formData[idTypeKey] || 'MyKad/IC';
        
        // Validate based on type
        if (idType === 'MyKid/IC' || idType === 'MyKad/IC') {
            // MyKid/IC - mesti 12 digit
            var cleanIC = value.replace(/[^0-9]/g, '');
            if (cleanIC.length !== 12) {
                if (group) group.classList.add('has-error');
                if (errorEl) errorEl.textContent = 'MyKad/IC mesti 12 digit (bukan ' + cleanIC.length + ')';
                errors.push(field.label + ' (IC tidak sah)');
                continue;
            }
            // Auto-format: 120515141234 → 120515-14-1234
            var formatted = cleanIC.substring(0, 6) + '-' + cleanIC.substring(6, 8) + '-' + cleanIC.substring(8, 12);
            pdwState.formData[field.key] = formatted;
            input.value = formatted;
        } else if (idType === 'No. Passport') {
            // Passport - minimum 6 characters (mix alphanumeric)
            if (value.length < 6) {
                if (group) group.classList.add('has-error');
                if (errorEl) errorEl.textContent = 'No. Passport mesti sekurang-kurangnya 6 aksara';
                errors.push(field.label + ' (Passport tidak sah)');
                continue;
            }
            // Convert to uppercase
            pdwState.formData[field.key] = value.toUpperCase();
            input.value = value.toUpperCase();
        } else if (idType === 'No. Surat Beranak') {
            // Surat Beranak - minimum 5 characters
            if (value.length < 5) {
                if (group) group.classList.add('has-error');
                if (errorEl) errorEl.textContent = 'No. Surat Beranak tidak sah';
                errors.push(field.label + ' (Surat Beranak tidak sah)');
                continue;
            }
        }
    }
    
    // ===== Phone validation (accept 10-11 digit) =====
    if (field.type === 'tel') {
        var cleanPhone = value.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            if (group) group.classList.add('has-error');
            if (errorEl) errorEl.textContent = 'No. telefon tidak sah (10-11 digit)';
            errors.push(field.label + ' (Phone tidak sah)');
            continue;
        }
    }
    
    // Email validation
    if (field.type === 'email') {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            if (group) group.classList.add('has-error');
            if (errorEl) errorEl.textContent = 'Format email tidak sah';
            errors.push(field.label + ' (Email tidak sah)');
            continue;
        }
    }
    
    // Postcode validation (5 digits)
    if (field.key === 'postcode') {
        var cleanPostcode = value.replace(/[^0-9]/g, '');
        if (cleanPostcode.length !== 5) {
            if (group) group.classList.add('has-error');
            if (errorEl) errorEl.textContent = 'Poskod mesti 5 digit';
            errors.push(field.label + ' (Poskod tidak sah)');
            continue;
        }
    }
}

// Clear error kalau lulus
if (group) group.classList.remove('has-error');
    }
    
    return errors;
}

function pdwNextStep() {
    // Validate current step
    var errors = pdwCollectFormData();
    
    if (errors.length > 0) {
        alert('⚠️ Sila isi field wajib:\n\n' + errors.join('\n'));
        return;
    }
    
    // ===== BARU: Auto-save draft =====
    pdwSaveDraft();
    
    // Kalau ni step terakhir, save data
    if (pdwState.currentStep === pdwState.totalSteps - 1) {
        pdwSaveData();
        return;
    }
    
    // Next step
    pdwState.currentStep++;
    pdwRenderStep();
}

function pdwBackStep() {
    // Save current data (no validation)
    var sectionKey = pdwState.sectionKeys[pdwState.currentStep];
    var section = PARENT_DATA_SECTIONS[sectionKey];
    
    for (var i = 0; i < section.fields.length; i++) {
        var field = section.fields[i];
        var input = document.getElementById('pdwField_' + field.key);
        if (input) {
            pdwState.formData[field.key] = input.value.trim();
        }
    }
    
    // ===== BARU: Auto-save draft =====
    pdwSaveDraft();
    
    if (pdwState.currentStep > 0) {
        pdwState.currentStep--;
        pdwRenderStep();
    }
}

// ============================================
// ===== SAVE DATA ============================
// ============================================

function pdwSaveData() {
    console.log('💾 Saving data...', pdwState.formData);
    
    // ===== BARU: Show loading =====
    pdwShowLoading('Menyimpan maklumat...');
    
    // Call save callback
    if (typeof pdwState.onSaveCallback === 'function') {
        pdwState.onSaveCallback(pdwState.formData, function(success, error) {
            // ===== BARU: Hide loading =====
            pdwHideLoading();
            
            if (success) {
                // Reset skip data kalau 100%
                var completeness = checkStudentDataCompleteness(pdwState.formData);
                if (completeness.isComplete && pdwState.student && pdwState.student.id) {
                    pdwResetSkipData(pdwState.student.id);
                    console.log('✅ Skip data reset - data complete!');
                }
                
                // ===== BARU: Clear draft =====
                if (pdwState.student && pdwState.student.id) {
                    pdwClearDraft(pdwState.student.id);
                }
                
                // Show success
                pdwShowSuccess(completeness.overall);
            } else {
                alert('❌ Gagal simpan: ' + (error || 'Unknown error'));
            }
        });
    } else {
        pdwHideLoading();
        console.error('❌ No save callback defined!');
        alert('❌ Save function tak dikonfigur. Sila hubungi admin.');
    }
}

// ============================================
// ===== LOADING INDICATOR ====================
// ============================================

function pdwShowLoading(message) {
    var existing = document.getElementById('pdwLoadingOverlay');
    if (existing) existing.remove();
    
    var overlay = document.createElement('div');
    overlay.id = 'pdwLoadingOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;';
    
    overlay.innerHTML = 
        '<div style="background:white;padding:30px;border-radius:16px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
        '<div style="font-size:3rem;margin-bottom:15px;animation:pdwSpin 1s linear infinite;display:inline-block;">⏳</div>' +
        '<div style="font-weight:800;color:#7c3aed;font-size:1rem;">' + (message || 'Sila tunggu...') + '</div>' +
        '</div>' +
        '<style>' +
        '@keyframes pdwSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' +
        '</style>';
    
    document.body.appendChild(overlay);
}

function pdwHideLoading() {
    var overlay = document.getElementById('pdwLoadingOverlay');
    if (overlay) overlay.remove();
}
// ============================================
// ===== SUCCESS MODAL ========================
// ============================================

function pdwShowSuccess(percent) {
    // Close wizard
    document.getElementById('pdwWizardModal').style.display = 'none';
    
    // Update percent
    document.getElementById('pdwSuccessPercent').textContent = percent + '%';
    
    var msgEl = document.getElementById('pdwSuccessMsg');
    if (msgEl) {
        if (percent === 100) {
            msgEl.textContent = 'Semua maklumat telah lengkap. Terima kasih!';
        } else {
            msgEl.textContent = 'Maklumat telah dikemas kini. Anda masih perlu lengkapkan ' + (100 - percent) + '% lagi.';
        }
    }
    
    // Show success modal
    document.getElementById('pdwSuccessModal').style.display = 'flex';
}

function pdwCloseSuccess() {
    document.body.classList.remove('pdw-modal-open');
    document.getElementById('pdwSuccessModal').style.display = 'none';
    
    // Update banner
    var completeness = checkStudentDataCompleteness(pdwState.formData);
    
    // ===== BARU: Update student reference =====
    if (pdwState.student && completeness.isComplete) {
        // Update student data dalam state
        for (var key in pdwState.formData) {
            pdwState.student[key] = pdwState.formData[key];
        }
    }
    
    pdwUpdateBanner(completeness.overall);
    
    // Banner logic
    if (completeness.isComplete) {
        // Show celebration (already handled by pdwUpdateBanner)
        // Banner auto-hide dalam 3 saat
    } else {
        pdwShowBanner();
    }
    
    // Refresh page atau update UI
    if (typeof pdwOnUpdateUI === 'function') {
        pdwOnUpdateUI();
    }
}
// ============================================
// ===== SAVE FUNCTIONS =======================
// ============================================

/**
 * Save untuk parent-app.html (Firebase directly)
 * @param {Object} data - Form data
 * @param {Function} callback - callback(success, error)
 */
function pdwSaveToFirebase(data, callback) {
    if (typeof db === 'undefined') {
        callback(false, 'Firebase tidak tersedia');
        return;
    }
    
    var studentId = data.id;
    if (!studentId) {
        callback(false, 'Student ID tidak dijumpai');
        return;
    }
    
    // ===== 1. UPDATE STUDENTS COLLECTION =====
    console.log('💾 Updating student:', studentId);
    
    // Get all students first
    db.ref('hafazanData/students').once('value').then(function(snap) {
        var students = snap.val() || [];
        if (!Array.isArray(students)) students = Object.values(students);
        
        // Find and update the student
        var updated = false;
        for (var i = 0; i < students.length; i++) {
            if (students[i] && students[i].id === studentId) {
                // Merge new data with existing
                students[i] = Object.assign({}, students[i], data);
                students[i].lastUpdatedByParent = new Date().toISOString();
                updated = true;
                break;
            }
        }
        
        if (!updated) {
            callback(false, 'Pelajar tidak dijumpai dalam database');
            return;
        }
        
        // Save students array
        db.ref('hafazanData/students').set(students).then(function() {
            console.log('✅ Students updated');
            
            // ===== 2. LOG TO PARENT UPDATES =====
            var updateLog = {
                id: 'PU' + Date.now(),
                studentId: studentId,
                studentName: data.name,
                updatedBy: 'parent',
                updatedAt: new Date().toISOString(),
                completeness: checkStudentDataCompleteness(data).overall,
                dataSnapshot: {
                    name: data.name,
                    ic: data.ic,
                    fatherName: data.fatherName,
                    motherName: data.motherName
                    // Simpan snapshot penting sahaja
                }
            };
            
            db.ref('hafazanData/parentUpdates').push(updateLog).then(function() {
                console.log('✅ Update logged');
                callback(true);
            }).catch(function(err) {
                console.log('⚠️ Log failed but student updated:', err);
                callback(true); // Success walaupun log gagal
            });
            
        }).catch(function(err) {
            console.log('❌ Update failed:', err);
            callback(false, err.message);
        });
        
    }).catch(function(err) {
        console.log('❌ Read failed:', err);
        callback(false, err.message);
    });
}

/**
 * Save untuk login.html (guna appData local + Firebase sync)
 * @param {Object} data - Form data
 * @param {Function} callback - callback(success, error)
 */
function pdwSaveToLocalData(data, callback) {
    if (typeof appData === 'undefined' || !appData.students) {
        callback(false, 'appData tidak tersedia');
        return;
    }
    
    var studentId = data.id;
    if (!studentId) {
        callback(false, 'Student ID tidak dijumpai');
        return;
    }
    
    // ===== 1. UPDATE APPDATA =====
    var updated = false;
    for (var i = 0; i < appData.students.length; i++) {
        if (appData.students[i] && appData.students[i].id === studentId) {
            // Merge new data
            appData.students[i] = Object.assign({}, appData.students[i], data);
            appData.students[i].lastUpdatedByParent = new Date().toISOString();
            updated = true;
            break;
        }
    }
    
    if (!updated) {
        callback(false, 'Pelajar tidak dijumpai');
        return;
    }
    
    // ===== 2. LOG TO PARENT UPDATES =====
    if (!appData.parentUpdates) appData.parentUpdates = [];
    
    appData.parentUpdates.push({
        id: 'PU' + Date.now(),
        studentId: studentId,
        studentName: data.name,
        updatedBy: 'parent',
        updatedAt: new Date().toISOString(),
        completeness: checkStudentDataCompleteness(data).overall,
        dataSnapshot: {
            name: data.name,
            ic: data.ic,
            fatherName: data.fatherName,
            motherName: data.motherName
        }
    });
    
    // ===== 3. SAVE DATA (existing function) =====
    try {
        if (typeof saveData === 'function') {
            saveData(appData);
            console.log('✅ Data saved via saveData()');
            callback(true);
        } else {
            callback(false, 'saveData function tidak dijumpai');
        }
    } catch(err) {
        console.log('❌ Save error:', err);
        callback(false, err.message);
    }
}

/**
 * Helper: Get parent update history
 * @param {string} studentId - Student ID (optional)
 * @returns {Array} List of updates
 */
function pdwGetUpdateHistory(studentId) {
    var updates = [];
    
    // From appData
    if (typeof appData !== 'undefined' && appData.parentUpdates) {
        updates = updates.concat(appData.parentUpdates);
    }
    
    // Filter by student if provided
    if (studentId) {
        updates = updates.filter(function(u) {
            return u.studentId === studentId;
        });
    }
    
    // Sort by date (newest first)
    updates.sort(function(a, b) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    return updates;
}

// ============================================
// ===== INIT & READY STATE ===================
// ============================================

// Add pdw-ready class bila semua loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add('pdw-ready');
    });
} else {
    document.body.classList.add('pdw-ready');
}

console.log('✅ Parent Data Wizard JS loaded');