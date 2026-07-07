// ===== PUNCH SYSTEM =====

var currentWorker = null;
var appData = null;
var clockInterval = null;

// Init on load
document.addEventListener('DOMContentLoaded', function() {
    // Init Firebase first
    if (typeof initFirebase === 'function') {
        initFirebase();
    }

    // Sync data
    if (typeof syncData === 'function' && typeof firebaseReady !== 'undefined' && firebaseReady) {
    syncData(function() {
        startPunchApp();
    });
} else {
    startPunchApp();
}

// Double-check: reload location after 3 seconds (Firebase might be slow)
setTimeout(function() {
    appData = loadData();
    loadMadrasahLocation();
}, 3000);
});

function startPunchApp() {
    appData = loadData();
    loadMadrasahLocation();

    // Init workers if not exists
    if (!appData.workers) {
        appData.workers = getDefaultWorkers();
        saveData(appData);
    }

    if (!appData.punchRecords) appData.punchRecords = [];

    // Check if already logged in
    var savedWorker = sessionStorage.getItem('currentWorker');
    if (savedWorker) {
        currentWorker = JSON.parse(savedWorker);
        showPunchPage();
    } else {
        showLoginPage();
    }

    // Start clock
    updateClock();
    if (clockInterval) clearInterval(clockInterval);
    clockInterval = setInterval(updateClock, 1000);
}

function getDefaultWorkers() {
    return [
        {
            id: 'WRK001',
            name: 'Warden',
            role: 'Warden',
            icon: '👮',
            phone: '',
            loginId: 'warden',
            loginPass: 'warden123',
            salaryType: 'hourly',
            hourlyRate: 5,
            overtimeRate: 7,
            allowance: 0,
            shifts: [
                { name: 'Malam', start: '22:00', end: '04:50' },
                { name: 'Pagi', start: '07:30', end: '09:00' },
                { name: 'Tengahari', start: '12:30', end: '13:15' },
                { name: 'Petang', start: '17:30', end: '19:00' }
            ],
            workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'WRK002',
            name: 'Ustaz',
            role: 'Ustaz Quran',
            icon: '👨‍🏫',
            phone: '',
            loginId: 'ustaz',
            loginPass: 'ustaz123',
            salaryType: 'hourly',
            hourlyRate: 5,
            overtimeRate: 7,
            allowance: 0,
            shifts: [
                { name: 'Subuh', start: '04:50', end: '07:30' },
                { name: 'Pagi', start: '09:00', end: '12:30' },
                { name: 'Petang', start: '13:15', end: '17:30' },
                { name: 'Malam', start: '19:00', end: '22:00' }
            ],
            workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'WRK003',
            name: 'Tukang Masak',
            role: 'Tukang Masak',
            icon: '👨‍🍳',
            phone: '',
            loginId: 'masak',
            loginPass: 'masak123',
            salaryType: 'hourly',
            hourlyRate: 5,
            overtimeRate: 7,
            allowance: 0,
            shifts: [
                { name: 'Pagi', start: '07:30', end: '08:30' },
                { name: 'Tengahari', start: '11:30', end: '12:30' },
                { name: 'Malam', start: '21:00', end: '22:00' }
            ],
            workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
            createdAt: new Date().toISOString()
        }
    ];
}

// ===== LOGIN =====
function punchLogin(event) {
    event.preventDefault();

    var loginId = document.getElementById('punchLoginId').value.trim().toLowerCase();
    var loginPass = document.getElementById('punchLoginPass').value.trim();

    var found = null;
    for (var i = 0; i < appData.workers.length; i++) {
        if (appData.workers[i].loginId.toLowerCase() === loginId &&
            appData.workers[i].loginPass === loginPass) {
            found = appData.workers[i];
            break;
        }
    }

    if (!found) {
        showToast('❌ ID atau Password salah');
        return;
    }

    currentWorker = found;
    sessionStorage.setItem('currentWorker', JSON.stringify(currentWorker));

    showToast('✅ Selamat datang, ' + currentWorker.name);
    showPunchPage();
}

function punchLogout() {
    if (!confirm('Log keluar dari sistem punch?')) return;

    sessionStorage.removeItem('currentWorker');
    currentWorker = null;
    showLoginPage();
}

function showLoginPage() {
    document.getElementById('punchLoginPage').classList.add('active');
    document.getElementById('punchMainPage').classList.remove('active');
}

function showPunchPage() {
    document.getElementById('punchLoginPage').classList.remove('active');
    document.getElementById('punchMainPage').classList.add('active');

    // Auto-add shifts kalau takde
    if (!currentWorker.shifts) {
        currentWorker.shifts = getDefaultShiftsForRole(currentWorker.role);
        for (var i = 0; i < appData.workers.length; i++) {
            if (appData.workers[i].id === currentWorker.id) {
                appData.workers[i].shifts = currentWorker.shifts;
                appData.workers[i].workDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
                break;
            }
        }
        saveData(appData);
        sessionStorage.setItem('currentWorker', JSON.stringify(currentWorker));
    }

    if (!currentWorker.workDays) {
        currentWorker.workDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
    }

    document.getElementById('workerAvatar').textContent = currentWorker.icon || '👤';
    document.getElementById('workerName').textContent = currentWorker.name;
    document.getElementById('workerRole').textContent = currentWorker.role + ' • RM' + (currentWorker.hourlyRate || 5) + '/jam';

    updatePunchStatus();
    renderShiftPunchButtons();
    renderTodayStats();
    renderMonthStats();
    renderRecentPunches();
}

// ===== CLOCK =====
function updateClock() {
    var now = new Date();

    var dateEl = document.getElementById('currentDate');
    var timeEl = document.getElementById('currentTime');
    var dayEl = document.getElementById('currentDay');

    if (!dateEl || !timeEl) return;

    var months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    var days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

    var dateStr = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    var timeStr = String(now.getHours()).padStart(2, '0') + ':' +
                  String(now.getMinutes()).padStart(2, '0') + ':' +
                  String(now.getSeconds()).padStart(2, '0');
    var dayStr = days[now.getDay()];

    dateEl.textContent = dateStr;
    timeEl.textContent = timeStr;
    if (dayEl) dayEl.textContent = dayStr;
}

// ===== PUNCH IN/OUT =====
// ===== UPDATED PUNCH FUNCTION =====
function doPunch() {
    if (!currentWorker) return;

    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var today = new Date().toISOString().split('T')[0];

    // Cari rekod yang BELUM punch out hari ini
    var openRecord = null;
    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today && !r.punchOut) {
            openRecord = r;
            break;
        }
    }

    if (openRecord) {
        // Ada shift belum punch out → PUNCH OUT
        punchTypePending = 'out';
    } else {
        // Punch IN → cari shift yang sesuai dengan MASA SEKARANG
        punchTypePending = 'in';
    }

    openCameraModal(punchTypePending);
}

// ===== UPDATE STATUS =====
function updatePunchStatus() {
    if (!currentWorker) return;

    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var today = new Date().toISOString().split('T')[0];

    // Count stats
    var todayRecords = [];
    var totalHours = 0;
    var hasActive = false;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today) {
            todayRecords.push(r);
            totalHours += r.hoursWorked || 0;
            if (!r.punchOut) hasActive = true;
        }
    }

    // Update status card (kalau ada)
    var statusCard = document.getElementById('statusCard');
    var statusIcon = document.getElementById('statusIcon');
    var statusText = document.getElementById('statusText');
    var statusTime = document.getElementById('statusTime');

    if (statusCard && statusIcon && statusText && statusTime) {
        if (todayRecords.length === 0) {
            statusCard.classList.remove('working');
            statusIcon.textContent = '⏱️';
            statusText.textContent = 'Belum Punch';
            statusTime.textContent = 'Pilih shift di bawah untuk punch';
        } else if (hasActive) {
            statusCard.classList.add('working');
            statusIcon.textContent = '✅';
            statusText.textContent = 'Sedang Bekerja';
            statusTime.textContent = totalHours.toFixed(1) + ' jam hari ini';
        } else {
            statusCard.classList.remove('working');
            statusIcon.textContent = '📊';
            statusText.textContent = todayRecords.length + ' shift selesai';
            statusTime.textContent = totalHours.toFixed(1) + ' jam hari ini';
        }
    }

    // Refresh shift buttons
    if (typeof renderShiftPunchButtons === 'function') {
        renderShiftPunchButtons();
    }
}

// ===== TODAY STATS =====
function renderTodayStats() {
    if (!currentWorker) return;
    if (!appData.punchRecords) appData.punchRecords = [];

    var today = new Date().toISOString().split('T')[0];
    var totalHours = 0;
    var completedShifts = 0;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today) {
            totalHours += r.hoursWorked || 0;
            if (r.punchOut) completedShifts++;
        }
    }

    var totalShifts = currentWorker.shifts ? currentWorker.shifts.length : 0;
    var rate = currentWorker.hourlyRate || 5;
    var todayPay = totalHours * rate;

    document.getElementById('todayIn').textContent = completedShifts + '/' + totalShifts;
    document.getElementById('todayHours').textContent = totalHours.toFixed(1) + ' jam';
    document.getElementById('todayOut').textContent = 'RM ' + todayPay.toFixed(0);
}

// ===== MONTH STATS =====
function renderMonthStats() {
    if (!currentWorker) return;
    if (!appData.punchRecords) appData.punchRecords = [];

    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();

    var uniqueDays = {};
    var totalHours = 0;
    var totalShifts = 0;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId !== currentWorker.id) continue;

        var parts = r.date.split('-');
        var recYear = parseInt(parts[0]);
        var recMonth = parseInt(parts[1]);

        if (recYear === currentYear && recMonth === currentMonth) {
            uniqueDays[r.date] = true;
            totalHours += r.hoursWorked || 0;
            if (r.punchOut) totalShifts++;
        }
    }

    var totalDays = Object.keys(uniqueDays).length;

    // Kira gaji: jam × kadar
    var rate = currentWorker.hourlyRate || 5;
    var estimatedSalary = totalHours * rate;

    // Tambah elaun
    estimatedSalary += currentWorker.allowance || 0;

    document.getElementById('monthDays').textContent = totalDays;
    document.getElementById('monthHours').textContent = totalHours.toFixed(1);
    document.getElementById('monthSalary').textContent = 'RM ' + estimatedSalary.toFixed(0);
}

// ===== RECENT PUNCHES =====
function renderRecentPunches() {
    if (!currentWorker) return;
    if (!appData.punchRecords) appData.punchRecords = [];

    var container = document.getElementById('recentPunches');
    if (!container) return;

    var records = [];
    for (var i = 0; i < appData.punchRecords.length; i++) {
        if (appData.punchRecords[i].workerId === currentWorker.id) {
            records.push(appData.punchRecords[i]);
        }
    }

    // Sort newest first
    records.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Take last 7
    records = records.slice(0, 7);

    if (records.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:20px;">Belum ada rekod punch</p>';
        return;
    }

    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    var html = '';
    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        var d = new Date(r.date);

        var inTime = r.punchIn ? formatTime(new Date(r.punchIn)) : '-';
        var outTime = r.punchOut ? formatTime(new Date(r.punchOut)) : 'Belum';

        html += '<div class="punch-record-item">';
        html += '<div class="punch-record-date">';
        html += '<div class="record-day">' + d.getDate() + '</div>';
        html += '<div class="record-month">' + months[d.getMonth()] + '</div>';
        html += '</div>';
        html += '<div class="punch-record-info">';
        html += '<div class="record-times">📥 ' + inTime + ' → 📤 ' + outTime + '</div>';
        html += '<div class="record-hours">' + (r.hoursWorked || 0).toFixed(1) + ' jam</div>';
        html += '</div>';
        var statusClass = r.status === 'approved' ? 'approved' : 'pending';
        var statusText = r.status === 'approved' ? '✅' : '⏳';
        html += '<span class="record-status ' + statusClass + '">' + statusText + '</span>';
        html += '</div>';
    }

    container.innerHTML = html;
}

// ===== HELPERS =====
function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return hours + ':' + String(minutes).padStart(2, '0') + ' ' + ampm;
}

function showToast(message) {
    var toast = document.getElementById('toast');
    var msgEl = document.getElementById('toastMsg');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(function() {
        toast.classList.add('hidden');
    }, 3000);
}

// ============================================
// ===== GPS VERIFICATION ===================
// ============================================

// Default lokasi madrasah (TUKAR dengan lokasi sebenar)
var MADRASAH_LOCATION = {
    lat: 3.247250,
    lng: 101.317083,
    radius: 1000,
    name: 'Madrasah Tahfiz Pekan Sungai Buloh'
};

// Auto-load dari settings
function loadMadrasahLocation() {
    if (appData && appData.punchSettings && appData.punchSettings.lat) {
        MADRASAH_LOCATION.lat = appData.punchSettings.lat;
        MADRASAH_LOCATION.lng = appData.punchSettings.lng;
        MADRASAH_LOCATION.radius = appData.punchSettings.radius || 500;
        MADRASAH_LOCATION.name = appData.punchSettings.locationName || 'Madrasah';
    }
}

// Function: Get current location
function getCurrentLocation() {
    return new Promise(function(resolve, reject) {
        if (!navigator.geolocation) {
            reject('GPS tidak disokong dalam pelayar ini');
            return;
        }

        var options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            function(position) {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            function(error) {
                var message = 'GPS error';
                switch(error.code) {
                    case 1: message = '❌ Anda menolak akses GPS. Sila benarkan.'; break;
                    case 2: message = '❌ GPS tidak tersedia. Cuba lagi.'; break;
                    case 3: message = '❌ GPS timeout. Cuba lagi.'; break;
                }
                reject(message);
            },
            options
        );
    });
}

// Function: Calculate distance (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    var R = 6371000; // Earth radius in meters
    var φ1 = lat1 * Math.PI / 180;
    var φ2 = lat2 * Math.PI / 180;
    var Δφ = (lat2 - lat1) * Math.PI / 180;
    var Δλ = (lng2 - lng1) * Math.PI / 180;

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
}

// Function: Verify location
function verifyLocation(currentLoc) {
    var distance = calculateDistance(
        currentLoc.lat,
        currentLoc.lng,
        MADRASAH_LOCATION.lat,
        MADRASAH_LOCATION.lng
    );

    return {
        distance: distance,
        valid: distance <= MADRASAH_LOCATION.radius,
        location: currentLoc
    };
}

// ============================================
// ===== CAMERA & SELFIE =====================
// ============================================

var cameraStream = null;
var currentLocation = null;
var locationValid = false;
var capturedPhotoData = null;
var punchTypePending = null; // 'in' atau 'out'

// Open camera modal & start verification
function openCameraModal(punchType) {
    punchTypePending = punchType;

    var modal = document.getElementById('cameraModal');
    modal.classList.remove('hidden');

    // Reset UI
    document.getElementById('cameraVideo').style.display = 'block';
    document.getElementById('capturedPhoto').style.display = 'none';
    document.getElementById('captureBtn').classList.remove('hidden');
    document.getElementById('retakeBtn').classList.add('hidden');
    document.getElementById('confirmBtn').classList.add('hidden');
    document.getElementById('captureBtn').disabled = true;

    // Start verification
    startGPSCheck();
    startCamera();
}

// Close camera modal
function closeCameraModal() {
    var modal = document.getElementById('cameraModal');
    modal.classList.add('hidden');
    stopCamera();
    capturedPhotoData = null;
    currentLocation = null;
    locationValid = false;
    punchTypePending = null;
}

// Start GPS check
function startGPSCheck() {
    // FORCE reload data & location
    appData = loadData();
    loadMadrasahLocation();


    var verifyGPS = document.getElementById('verifyGPS');
    var locationInfo = document.getElementById('locationInfo');

    verifyGPS.className = 'verify-item loading';
    verifyGPS.innerHTML = '<span class="verify-icon">⏳</span><span class="verify-text">Mengesan lokasi GPS...</span>';

    locationInfo.innerHTML = '<div class="location-loading">📡 Memeriksa lokasi anda...</div>';

    getCurrentLocation()
        .then(function(loc) {
            currentLocation = loc;

            // RELOAD SETTINGS SEKALI LAGI sebelum verify
            appData = loadData();
            loadMadrasahLocation();

            var verification = verifyLocation(loc);
            locationValid = verification.valid;

            if (verification.valid) {
                verifyGPS.className = 'verify-item valid';
                verifyGPS.innerHTML = '<span class="verify-icon">✅</span><span class="verify-text">Lokasi disahkan (' + verification.distance + 'm dari madrasah)</span>';

                locationInfo.innerHTML = '<div class="location-valid">' +
                    '✅ <strong>Lokasi Sah!</strong><br>' +
                    'Anda ' + verification.distance + 'm dari ' + MADRASAH_LOCATION.name +
                    '</div>';
            } else {
                verifyGPS.className = 'verify-item invalid';
                verifyGPS.innerHTML = '<span class="verify-icon">❌</span><span class="verify-text">Anda terlalu jauh (' + verification.distance + 'm)</span>';

                locationInfo.innerHTML = '<div class="location-invalid">' +
                    '⚠️ <strong>Lokasi Tidak Sah!</strong><br>' +
                    'Anda ' + verification.distance + 'm dari madrasah.<br>' +
                    'Mesti dalam ' + MADRASAH_LOCATION.radius + 'm untuk punch.' +
                    '</div>';
            }

            checkReadyToCapture();
        })
        .catch(function(error) {
            verifyGPS.className = 'verify-item invalid';
            verifyGPS.innerHTML = '<span class="verify-icon">❌</span><span class="verify-text">' + error + '</span>';

            locationInfo.innerHTML = '<div class="location-invalid">⚠️ ' + error + '</div>';
            locationValid = false;
        });
}

// Start camera
function startCamera() {
    var verifyCamera = document.getElementById('verifyCamera');
    var video = document.getElementById('cameraVideo');

    verifyCamera.className = 'verify-item loading';
    verifyCamera.innerHTML = '<span class="verify-icon">⏳</span><span class="verify-text">Memuat kamera...</span>';

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        verifyCamera.className = 'verify-item invalid';
        verifyCamera.innerHTML = '<span class="verify-icon">❌</span><span class="verify-text">Kamera tidak disokong</span>';
        return;
    }

    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'user',  // Front camera (selfie)
            width: { ideal: 640 },
            height: { ideal: 480 }
        },
        audio: false
    })
    .then(function(stream) {
        cameraStream = stream;
        video.srcObject = stream;

        verifyCamera.className = 'verify-item valid';
        verifyCamera.innerHTML = '<span class="verify-icon">✅</span><span class="verify-text">Kamera bersedia</span>';

        checkReadyToCapture();
    })
    .catch(function(error) {
        verifyCamera.className = 'verify-item invalid';

        var msg = 'Gagal akses kamera';
        if (error.name === 'NotAllowedError') {
            msg = 'Anda menolak akses kamera. Sila benarkan.';
        } else if (error.name === 'NotFoundError') {
            msg = 'Tiada kamera dijumpai';
        }

        verifyCamera.innerHTML = '<span class="verify-icon">❌</span><span class="verify-text">' + msg + '</span>';
    });
}

// Stop camera
function stopCamera() {
    if (cameraStream) {
        var tracks = cameraStream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
        cameraStream = null;
    }
}

// Check if ready to capture
function checkReadyToCapture() {
    var captureBtn = document.getElementById('captureBtn');

    if (locationValid && cameraStream) {
        captureBtn.disabled = false;
        captureBtn.textContent = '📸 Ambil Selfie';
    } else if (!locationValid && cameraStream) {
        captureBtn.disabled = true;
        captureBtn.textContent = '❌ Lokasi Tidak Sah';
    } else {
        captureBtn.disabled = true;
        captureBtn.textContent = '⏳ Memuat...';
    }
}

// Capture selfie
function captureSelfie() {
    var video = document.getElementById('cameraVideo');
    var canvas = document.getElementById('cameraCanvas');
    var photo = document.getElementById('capturedPhoto');

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror image (selfie mode)
    var ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    capturedPhotoData = canvas.toDataURL('image/jpeg', 0.7);

    // Display captured photo
    photo.src = capturedPhotoData;
    photo.style.display = 'block';
    video.style.display = 'none';

    // Update buttons
    document.getElementById('captureBtn').classList.add('hidden');
    document.getElementById('retakeBtn').classList.remove('hidden');
    document.getElementById('confirmBtn').classList.remove('hidden');
}

// Retake selfie
function retakeSelfie() {
    var video = document.getElementById('cameraVideo');
    var photo = document.getElementById('capturedPhoto');

    video.style.display = 'block';
    photo.style.display = 'none';

    document.getElementById('captureBtn').classList.remove('hidden');
    document.getElementById('retakeBtn').classList.add('hidden');
    document.getElementById('confirmBtn').classList.add('hidden');

    capturedPhotoData = null;
}

// Confirm and save punch
function confirmPunch() {
    // Reload data
    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    if (!currentLocation) {
        showToast('❌ Lokasi belum dikesan. Cuba lagi.');
        return;
    }

    showToast('⏳ Memproses punch...');

    // Kalau ada selfie, upload dulu
    if (capturedPhotoData) {
        // Try upload selfie
        uploadSelfieToImgBB(capturedPhotoData)
            .then(function(photoUrl) {
                savePunchRecord(photoUrl);
            })
            .catch(function(error) {
                savePunchRecord(null);
            });
    } else {
        // No selfie, save direct
        savePunchRecord(null);
    }
}

// Upload selfie to ImgBB
function uploadSelfieToImgBB(base64Data) {
    return new Promise(function(resolve, reject) {
        var IMGBB_KEY = 'f5e045918eaade7e35b9a66a87dcfd16'; // Same key as gallery

        // Remove data URL prefix
        var base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

        var formData = new FormData();
        formData.append('image', base64);

        fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_KEY, {
            method: 'POST',
            body: formData
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success && data.data) {
                resolve(data.data.url);
            } else {
                reject('Upload failed');
            }
        })
        .catch(function(err) {
            reject(err);
        });
    });
}

// ===== CARI SHIFT YANG SESUAI DENGAN MASA SEKARANG =====
function findCurrentShift(nowMinutes, today) {
    var result = { shift: null, index: -1 };

    if (!currentWorker || !currentWorker.shifts) return result;

    // Get shifts yang DAH di-punch hari ini
    var punchedIndexes = {};
    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today) {
            if (typeof r.shiftIndex === 'number') {
                punchedIndexes[r.shiftIndex] = true;
            }
        }
    }

    // Loop SEMUA shifts (unsorted - ikut original order)
    var shifts = currentWorker.shifts;

    // STEP 1: Cari shift yang TEPAT dalam range masa sekarang
    for (var i = 0; i < shifts.length; i++) {
        if (punchedIndexes[i]) continue; // Dah punch

        var shift = shifts[i];
        var range = getShiftRange(shift);

        // Dalam range (termasuk 30 min awal)
        if (nowMinutes >= (range.start - 30) && nowMinutes <= range.end) {
            result.shift = shift;
            result.index = i;
            return result;
        }
    }

    // STEP 2: Kalau takde exact match, cari shift SETERUSNYA yang belum sampai
    var closestFuture = null;
    var closestFutureIndex = -1;
    var closestDistance = 99999;

    for (var i = 0; i < shifts.length; i++) {
        if (punchedIndexes[i]) continue;

        var shift = shifts[i];
        var range = getShiftRange(shift);

        // Shift belum bermula
        if (range.start > nowMinutes) {
            var distance = range.start - nowMinutes;
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFuture = shift;
                closestFutureIndex = i;
            }
        }
    }

    if (closestFuture) {
        result.shift = closestFuture;
        result.index = closestFutureIndex;
        return result;
    }

    // STEP 3: Kalau semua dah lepas, bagi shift terakhir yang belum punch
    for (var i = shifts.length - 1; i >= 0; i--) {
        if (punchedIndexes[i]) continue;
        result.shift = shifts[i];
        result.index = i;
        return result;
    }

    return result;
}

// Helper: Get shift start/end dalam minit biasa (handle overnight)
function getShiftRange(shift) {
    var startParts = shift.start.split(':');
    var endParts = shift.end.split(':');

    var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    var endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    // Handle overnight (cth: 22:00-04:50)
    // Kalau end < start, bermakna cross midnight
    if (endMin < startMin) {
        // Untuk matching purposes:
        // Kalau sekarang selepas tengah malam (0:00-04:50), treat as 0-endMin
        // Kalau sekarang sebelum midnight (22:00-23:59), treat as startMin-1440
        endMin = endMin; // Keep as is, special handling in caller
    }

    return { start: startMin, end: endMin };
}

// ===== CHECK IF LATE =====
function checkIfLate(punchTime, shift) {
    var result = {
        isLate: false,
        lateMinutes: 0,
        earlyMinutes: 0,
        deduction: 0
    };

    if (!shift || !shift.start) return result;

    var scheduleParts = shift.start.split(':');
    var scheduleMinutes = parseInt(scheduleParts[0]) * 60 + parseInt(scheduleParts[1]);

    var punchMinutes = punchTime.getHours() * 60 + punchTime.getMinutes();

    // Handle overnight shift
    if (scheduleMinutes > 720 && punchMinutes < 360) {
        punchMinutes += 1440;
    }

    var diff = punchMinutes - scheduleMinutes;

    if (diff > 5) {
        // Lewat (bagi grace period 5 minit)
        result.isLate = true;
        result.lateMinutes = diff - 5;
        var rate = currentWorker.hourlyRate || 5;
        result.deduction = (result.lateMinutes / 60) * rate;
        result.deduction = Math.round(result.deduction * 100) / 100;
    } else if (diff < 0) {
        // Awal
        result.earlyMinutes = Math.abs(diff);
    }

    return result;
}

// ===== CHECK EARLY LEAVE =====
function checkEarlyLeave(punchTime, record) {
    var result = {
        isEarly: false,
        earlyMinutes: 0,
        deduction: 0
    };

    if (!record.scheduledEnd) return result;

    var scheduleParts = record.scheduledEnd.split(':');
    var scheduleMinutes = parseInt(scheduleParts[0]) * 60 + parseInt(scheduleParts[1]);

    var punchMinutes = punchTime.getHours() * 60 + punchTime.getMinutes();

    // Handle overnight shift
    if (scheduleMinutes < 360 && punchMinutes > 720) {
        scheduleMinutes += 1440;
    }

    var diff = scheduleMinutes - punchMinutes;

    if (diff > 5) {
        // Keluar awal (bagi grace period 5 minit)
        result.isEarly = true;
        result.earlyMinutes = diff - 5;
        var rate = currentWorker.hourlyRate || 5;
        result.deduction = (result.earlyMinutes / 60) * rate;
        result.deduction = Math.round(result.deduction * 100) / 100;
    }

    return result;
}

// ============================================
// ===== WHATSAPP NOTIFICATIONS =============
// ============================================

// Admin phone number (untuk notification)
var ADMIN_WHATSAPP = '601161000542'; // WhatsApp Ustaz Aisamuddin
// Send punch notification to admin
function sendPunchNotification(type, worker, record) {
    var emoji = type === 'IN' ? '📥' : '📤';
    var time = formatTime(new Date(type === 'IN' ? record.punchIn : record.punchOut));

    var msg = '*' + emoji + ' PUNCH ' + type + '*\n';
    msg += '━━━━━━━━━━━━━━━━━━\n\n';
    msg += '👤 *Pekerja:* ' + worker.name + '\n';
    msg += '💼 *Jawatan:* ' + worker.role + '\n';
    msg += '🕐 *Masa:* ' + time + '\n';
    msg += '📅 *Tarikh:* ' + new Date().toLocaleDateString('ms-MY') + '\n';

    if (type === 'OUT' && record.hoursWorked) {
        msg += '⏱️ *Jam Kerja:* ' + record.hoursWorked + ' jam\n';
    }

    // Location verification status
    var locValid = type === 'IN' ? record.punchInLocationValid : record.punchOutLocationValid;
    var loc = type === 'IN' ? record.punchInLocation : record.punchOutLocation;

    msg += '\n📍 *Lokasi:* ';
    if (locValid) {
        msg += '✅ Di madrasah\n';
    } else {
        msg += '⚠️ JAUH DARI MADRASAH!\n';
        if (loc) {
            msg += '🗺️ Map: https://maps.google.com/?q=' + loc.lat + ',' + loc.lng + '\n';
        }
    }

    msg += '\n━━━━━━━━━━━━━━━━━━\n';
    msg += '_Sistem Punch Card Madrasah_';

    // Save notification to queue (kalau nak send manual)
    if (!appData.pendingNotifications) appData.pendingNotifications = [];
    appData.pendingNotifications.push({
        id: 'NOTIF' + Date.now(),
        type: 'punch_' + type.toLowerCase(),
        workerId: worker.id,
        message: msg,
        createdAt: new Date().toISOString(),
        sent: false
    });
    saveData(appData);

    // Auto-open WhatsApp (kalau nak auto)
    // var url = 'https://wa.me/' + ADMIN_WHATSAPP + '?text=' + encodeURIComponent(msg);
    // window.open(url, '_blank');
}

// ===== NOTIFICATION DENGAN LATE INFO =====
function sendPunchNotificationWithLate(type, worker, record, lateInfo) {
    // Load admin WA from settings
    appData = loadData();
    var adminWA = '601161000542'; // WhatsApp Ustaz Aisamuddin
    if (appData.punchSettings && appData.punchSettings.adminWhatsApp) {
        adminWA = appData.punchSettings.adminWhatsApp;
    }

    var emoji = type === 'IN' ? '📥' : '📤';
    var time = formatTime(new Date(type === 'IN' ? record.punchIn : record.punchOut));

    var msg = '*' + emoji + ' PUNCH ' + type + '*\n';
    msg += '━━━━━━━━━━━━━━━━━━\n\n';
    msg += '👤 *' + worker.name + '* (' + worker.role + ')\n';
    msg += '📅 ' + new Date().toLocaleDateString('ms-MY') + '\n';
    msg += '🕐 ' + time + '\n';

    if (record.shiftName) {
        msg += '📋 Shift: *' + record.shiftName + '*';
        if (record.scheduledStart) {
            msg += ' (' + formatShiftTime(record.scheduledStart) + ' - ' + formatShiftTime(record.scheduledEnd) + ')';
        }
        msg += '\n';
    }

    // Late info
    if (type === 'IN' && lateInfo && lateInfo.isLate) {
        msg += '\n⚠️ *LEWAT ' + lateInfo.lateMinutes + ' MINIT!*\n';
        msg += '💸 Tolak: *RM ' + lateInfo.deduction.toFixed(2) + '*\n';
    } else if (type === 'IN' && lateInfo && lateInfo.earlyMinutes > 0) {
        msg += '\n✅ On time (' + lateInfo.earlyMinutes + ' min awal)\n';
    }

    // Early leave
    if (type === 'OUT' && lateInfo && lateInfo.isEarly) {
        msg += '\n⚠️ *KELUAR AWAL ' + lateInfo.earlyMinutes + ' MINIT!*\n';
        msg += '💸 Tolak: *RM ' + lateInfo.deduction.toFixed(2) + '*\n';
    }

    if (type === 'OUT' && record.hoursWorked) {
        msg += '\n⏱️ Jam kerja shift ini: *' + record.hoursWorked.toFixed(1) + ' jam*\n';
    }

    // Total deduction
    if (record.totalDeduction > 0) {
        msg += '\n💸 *Total potongan shift ini: RM ' + record.totalDeduction.toFixed(2) + '*\n';
    }

    // Location
    var locValid = type === 'IN' ? record.punchInLocationValid : record.punchOutLocationValid;
    msg += '\n📍 Lokasi: ' + (locValid ? '✅ Di madrasah' : '⚠️ Jauh!') + '\n';

    msg += '\n━━━━━━━━━━━━━━━━━━\n';
    msg += '_Sistem Punch Card Madrasah_';

    // Save to notification queue
    if (!appData.pendingNotifications) appData.pendingNotifications = [];
    appData.pendingNotifications.push({
        id: 'NOTIF' + Date.now(),
        type: 'punch_' + type.toLowerCase(),
        workerId: worker.id,
        message: msg,
        isLate: lateInfo ? lateInfo.isLate : false,
        createdAt: new Date().toISOString(),
        sent: false
    });
    saveData(appData);

    // Auto open WhatsApp kalau LEWAT (admin perlu tahu segera)
    if ((lateInfo && lateInfo.isLate) || (lateInfo && lateInfo.isEarly)) {
        var waUrl = 'https://wa.me/' + adminWA + '?text=' + encodeURIComponent(msg);
        window.open(waUrl, '_blank');
    }
}

// Send daily summary (jalan automatik atau manual)
function sendDailySummary() {
    var today = new Date().toISOString().split('T')[0];
    var dateStr = new Date().toLocaleDateString('ms-MY');

    var msg = '*📊 RINGKASAN HARI INI*\n';
    msg += '━━━━━━━━━━━━━━━━━━\n';
    msg += '📅 ' + dateStr + '\n\n';

    var totalHours = 0;
    var presentCount = 0;
    var absentList = [];

    for (var i = 0; i < appData.workers.length; i++) {
        var worker = appData.workers[i];
        var todayRec = null;
        var totalToday = 0;

        for (var j = 0; j < appData.punchRecords.length; j++) {
            if (appData.punchRecords[j].workerId === worker.id &&
                appData.punchRecords[j].date === today) {
                todayRec = appData.punchRecords[j];
                totalToday += appData.punchRecords[j].hoursWorked || 0;
            }
        }

        if (todayRec) {
            presentCount++;
            totalHours += totalToday;

            msg += '✅ *' + worker.name + '*\n';
            msg += '   ⏱️ ' + totalToday.toFixed(1) + ' jam\n';

            if (!todayRec.punchOut) {
                msg += '   ⚠️ Belum punch out!\n';
            }
        } else {
            absentList.push(worker.name);
        }
    }

    if (absentList.length > 0) {
        msg += '\n❌ *Tidak Hadir:*\n';
        for (var i = 0; i < absentList.length; i++) {
            msg += '• ' + absentList[i] + '\n';
        }
    }

    msg += '\n📊 *Total:* ' + presentCount + '/' + appData.workers.length + ' pekerja\n';
    msg += '⏱️ *Jumlah Jam:* ' + totalHours.toFixed(1) + ' jam\n';
    msg += '\n━━━━━━━━━━━━━━━━━━\n';
    msg += '_Auto-generated_';

    var url = 'https://wa.me/' + ADMIN_WHATSAPP + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}

// ===== AUTO REFRESH DATA DARI FIREBASE =====
setInterval(function() {
    if (!currentWorker) return;

    // Sync dari Firebase
    if (typeof syncData === 'function' && typeof firebaseReady !== 'undefined' && firebaseReady) {
        syncData(function() {
            appData = loadData();
            loadMadrasahLocation();
            updatePunchStatus();
            renderTodayStats();
            renderMonthStats();
            renderRecentPunches();
        });
    } else {
        // Fallback - reload from localStorage
        appData = loadData();
        updatePunchStatus();
        renderTodayStats();
        renderMonthStats();
        renderRecentPunches();
    }
}, 30000); // Setiap 30 saat

function manualRefresh() {
    showToast('🔄 Mengemas kini data...');

    if (typeof syncData === 'function' && typeof firebaseReady !== 'undefined' && firebaseReady) {
        syncData(function() {
            appData = loadData();
            loadMadrasahLocation();
            updatePunchStatus();
            renderTodayStats();
            renderMonthStats();
            renderRecentPunches();
            showToast('✅ Data dikemas kini!');
        });
    } else {
        appData = loadData();
        updatePunchStatus();
        renderTodayStats();
        renderMonthStats();
        renderRecentPunches();
        showToast('✅ Data dikemas kini!');
    }
}

// ===== DEBUG GPS FUNCTION =====
function debugGPS() {
    var resultDiv = document.getElementById('debugResult');
    if (!resultDiv) return;

    resultDiv.innerHTML = '⏳ Checking...';

    // Force reload
    appData = loadData();
    if (typeof loadMadrasahLocation === 'function') {
        loadMadrasahLocation();
    }

    var html = '';
    html += '<strong>📦 App Data:</strong><br>';
    html += 'Has settings: ' + (appData.punchSettings ? 'YES' : 'NO') + '<br>';

    if (appData.punchSettings) {
        html += 'Settings lat: ' + appData.punchSettings.lat + '<br>';
        html += 'Settings lng: ' + appData.punchSettings.lng + '<br>';
        html += 'Settings radius: ' + appData.punchSettings.radius + '<br>';
    }

    html += '<br><strong>📍 MADRASAH_LOCATION:</strong><br>';
    html += 'Lat: ' + MADRASAH_LOCATION.lat + '<br>';
    html += 'Lng: ' + MADRASAH_LOCATION.lng + '<br>';
    html += 'Radius: ' + MADRASAH_LOCATION.radius + '<br>';
    html += 'Name: ' + MADRASAH_LOCATION.name + '<br>';

    html += '<br><strong>🔍 Match check:</strong><br>';
    if (appData.punchSettings) {
        html += 'Lat match: ' + (MADRASAH_LOCATION.lat === appData.punchSettings.lat) + '<br>';
        html += 'Lng match: ' + (MADRASAH_LOCATION.lng === appData.punchSettings.lng) + '<br>';
    }

    resultDiv.innerHTML = html + '<br>⏳ Getting your GPS...';

    // Get current location
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            var myLat = pos.coords.latitude;
            var myLng = pos.coords.longitude;
            var accuracy = pos.coords.accuracy;

            // Calculate distance using SETTINGS
            var distSettings = 0;
            if (appData.punchSettings) {
                distSettings = calculateDistance(myLat, myLng, appData.punchSettings.lat, appData.punchSettings.lng);
            }

            // Calculate distance using MADRASAH_LOCATION
            var distHardcoded = calculateDistance(myLat, myLng, MADRASAH_LOCATION.lat, MADRASAH_LOCATION.lng);

            html += '<br><strong>📱 Your GPS:</strong><br>';
            html += 'Lat: ' + myLat + '<br>';
            html += 'Lng: ' + myLng + '<br>';
            html += 'Accuracy: ' + Math.round(accuracy) + 'm<br>';

            html += '<br><strong>📏 Distance:</strong><br>';
            html += 'From HARDCODED: ' + distHardcoded + 'm<br>';
            html += 'From SETTINGS: ' + distSettings + 'm<br>';
            html += 'Radius: ' + MADRASAH_LOCATION.radius + 'm<br>';

            html += '<br><strong>✅ Result:</strong><br>';
            html += 'Valid (hardcoded): ' + (distHardcoded <= MADRASAH_LOCATION.radius ? 'YES ✅' : 'NO ❌') + '<br>';
            html += 'Valid (settings): ' + (distSettings <= (appData.punchSettings ? appData.punchSettings.radius : 500) ? 'YES ✅' : 'NO ❌') + '<br>';

            html += '<br><a href="https://maps.google.com/?q=' + myLat + ',' + myLng + '" target="_blank" style="color:#3b82f6;">🗺️ My Location Map</a><br>';

            if (appData.punchSettings) {
                html += '<a href="https://maps.google.com/?q=' + appData.punchSettings.lat + ',' + appData.punchSettings.lng + '" target="_blank" style="color:#10b981;">🗺️ Madrasah Map</a>';
            }

            resultDiv.innerHTML = html;
        },
        function(err) {
            html += '<br>❌ GPS Error: ' + err.message;
            resultDiv.innerHTML = html;
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// ===== SHIFT SCHEDULE DISPLAY =====
function renderShiftSchedule() {
    if (!currentWorker || !currentWorker.shifts) return;

    var scheduleDiv = document.getElementById('shiftScheduleDiv');
    if (!scheduleDiv) {
        scheduleDiv = document.createElement('div');
        scheduleDiv.id = 'shiftScheduleDiv';
        scheduleDiv.style.cssText = 'background:white;margin:0 20px 15px;border-radius:16px;padding:20px;box-shadow:0 8px 25px rgba(0,0,0,0.1);';

        var container = document.getElementById('recentPunches');
        if (container) container.parentNode.insertBefore(scheduleDiv, container);
    }

    var today = new Date().toISOString().split('T')[0];

    // Get today's completed records
    var todayRecords = [];
    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today) {
            todayRecords.push(r);
        }
    }

    // Sort by punch in time
    todayRecords.sort(function(a, b) {
        return new Date(a.punchIn) - new Date(b.punchIn);
    });

    var html = '<h3 style="margin:0 0 12px;color:#047857;font-size:1rem;">📅 Jadual Shift Hari Ini</h3>';

    var totalDeduction = 0;
    var totalHours = 0;

    for (var i = 0; i < currentWorker.shifts.length; i++) {
        var shift = currentWorker.shifts[i];
        var record = todayRecords[i] || null;
        var isDone = record && record.punchOut;
        var isActive = record && !record.punchOut;
        var isNext = !record && i === todayRecords.length;

        var bgColor = '#f8fafc';
        var borderColor = '#e2e8f0';
        var statusIcon = '⏳';
        var statusText = 'Belum';

        if (isDone) {
            bgColor = '#f0fdf4';
            borderColor = '#10b981';
            statusIcon = '✅';
            statusText = 'Selesai';
            totalHours += record.hoursWorked || 0;

            if (record.isLate) {
                bgColor = '#fef3c7';
                borderColor = '#f59e0b';
                statusIcon = '⚠️';
                statusText = 'Lewat ' + record.lateMinutes + 'min';
                totalDeduction += record.lateDeduction || 0;
            }

            if (record.isEarlyLeave) {
                statusText += ' | Awal ' + record.earlyMinutes + 'min';
                totalDeduction += record.earlyDeduction || 0;
            }

            totalDeduction += record.totalDeduction || 0;

        } else if (isActive) {
            bgColor = '#dbeafe';
            borderColor = '#3b82f6';
            statusIcon = '▶️';
            statusText = 'Sedang berjalan';
        } else if (isNext) {
            statusIcon = '➡️';
            statusText = 'Seterusnya';
        }

        var shiftHours = calculateShiftHours(shift.start, shift.end);

        html += '<div style="display:flex;align-items:center;gap:12px;padding:10px;background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:10px;margin-bottom:6px;">';
        html += '<span style="font-size:1.3rem;flex-shrink:0;">' + statusIcon + '</span>';
        html += '<div style="flex:1;">';
        html += '<strong style="color:#1f2937;">' + shift.name + '</strong>';
        html += '<div style="font-size:0.82rem;color:#64748b;">' + formatShiftTime(shift.start) + ' → ' + formatShiftTime(shift.end) + '</div>';

        // Show actual punch times kalau ada
        if (record) {
            var actualIn = formatTime(new Date(record.punchIn));
            var actualOut = record.punchOut ? formatTime(new Date(record.punchOut)) : '...';
            html += '<div style="font-size:0.78rem;color:#3b82f6;margin-top:2px;">Actual: ' + actualIn + ' → ' + actualOut + '</div>';
        }

        html += '</div>';

        // Status & deduction
        html += '<div style="text-align:right;">';
        html += '<div style="font-weight:700;color:#047857;font-size:0.85rem;">' + shiftHours + ' jam</div>';

        if (record && (record.lateDeduction > 0 || record.earlyDeduction > 0)) {
            var deduct = (record.lateDeduction || 0) + (record.earlyDeduction || 0);
            html += '<div style="font-size:0.75rem;color:#dc2626;font-weight:600;">-RM' + deduct.toFixed(2) + '</div>';
        }

        html += '<div style="font-size:0.72rem;color:#64748b;">' + statusText + '</div>';
        html += '</div>';
        html += '</div>';
    }

    // Total
    var totalExpected = 0;
    for (var i = 0; i < currentWorker.shifts.length; i++) {
        totalExpected += parseFloat(calculateShiftHours(currentWorker.shifts[i].start, currentWorker.shifts[i].end));
    }

    var rate = currentWorker.hourlyRate || 5;
    var grossPay = totalExpected * rate;
    var netPay = grossPay - totalDeduction;

    html += '<div style="padding:12px;background:#047857;color:white;border-radius:10px;margin-top:8px;">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">';
    html += '<span>Total Sehari:</span>';
    html += '<span>' + totalExpected.toFixed(1) + ' jam × RM' + rate + ' = RM' + grossPay.toFixed(2) + '</span>';
    html += '</div>';

    if (totalDeduction > 0) {
        html += '<div style="display:flex;justify-content:space-between;color:#fca5a5;font-size:0.85rem;">';
        html += '<span>Potongan Lewat/Awal:</span>';
        html += '<span>- RM' + totalDeduction.toFixed(2) + '</span>';
        html += '</div>';
        html += '<div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.3);padding-top:5px;margin-top:5px;font-weight:800;">';
        html += '<span>Gaji Bersih:</span>';
        html += '<span>RM' + netPay.toFixed(2) + '</span>';
        html += '</div>';
    }

    html += '</div>';

    scheduleDiv.innerHTML = html;
}

// ============================================
// ===== SHIFT SCHEDULE & REMINDER ===========
// ============================================

var shiftCountdownInterval = null;
var reminderShown = {};

// ===== SORT SHIFTS FOR TODAY'S FLOW =====
function sortShiftsForToday(shifts) {
    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();

    var sorted = [];

    for (var i = 0; i < shifts.length; i++) {
        var shift = JSON.parse(JSON.stringify(shifts[i]));
        var startParts = shift.start.split(':');
        var endParts = shift.end.split(':');
        var startHour = parseInt(startParts[0]);
        var endHour = parseInt(endParts[0]);
        var startMin = startHour * 60 + parseInt(startParts[1]);
        var endMin = endHour * 60 + parseInt(endParts[1]);

        var isOvernight = endHour < startHour;

        if (isOvernight) {
            // Shift overnight (cth: 22:00-04:50)
            if (nowMinutes <= endMin) {
                // Sekarang SEBELUM end time (cth: sekarang 3AM, shift end 4:50AM)
                // Bermakna shift ni bermula SEMALAM dan masih berjalan
                shift.isOvernightFromYesterday = true;
                shift.sortOrder = -1; // Letak paling atas
            } else {
                // Sekarang SELEPAS end time (cth: sekarang 12PM)
                // Shift ni akan bermula MALAM NI
                shift.isOvernightFromYesterday = false;
                shift.sortOrder = startMin; // Ikut start time (22:00 = 1320)
            }
        } else {
            // Shift biasa
            shift.isOvernightFromYesterday = false;
            shift.sortOrder = startMin;
        }

        sorted.push(shift);
    }

    sorted.sort(function(a, b) {
        return a.sortOrder - b.sortOrder;
    });

    return sorted;
}

// Helper: Get shift start minutes for today's context
function getShiftStartMinutes(startTime, isOvernight) {
    var parts = startTime.split(':');
    var hours = parseInt(parts[0]);
    var minutes = parseInt(parts[1]);

    if (isOvernight) {
        return 0;
    }

    return hours * 60 + minutes;
}

// Helper: Get shift end minutes
function getShiftEndMinutes(startTime, endTime, isOvernight) {
    var endParts = endTime.split(':');
    var endHour = parseInt(endParts[0]);
    var endMin = parseInt(endParts[1]);

    return endHour * 60 + endMin;
}

// ===== SHIFT COUNTDOWN =====
function updateShiftCountdown() {
    if (!currentWorker || !currentWorker.shifts) return;

    // Pastikan data wujud
    if (!appData) appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();
    var today = new Date().toISOString().split('T')[0];

    var sortedShifts = sortShiftsForToday(currentWorker.shifts);

    // Count completed shifts
    var completedCount = 0;
    var hasActive = false;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today) {
            if (r.punchOut) {
                completedCount++;
            } else {
                hasActive = true;
            }
        }
    }

    // Find next upcoming shift
    var nextShift = null;

    for (var i = 0; i < sortedShifts.length; i++) {
        // Skip completed/active
        if (i < completedCount) continue;
        if (hasActive && i === completedCount) continue;

        var shift = sortedShifts[i];
        var shiftStartMin = parseInt(shift.start.split(':')[0]) * 60 + parseInt(shift.start.split(':')[1]);

        // Skip overnight shifts yang dah lepas (before dawn)
        if (shift.isOvernightFromYesterday) {
            var endMin = parseInt(shift.end.split(':')[0]) * 60 + parseInt(shift.end.split(':')[1]);
            if (nowMinutes > endMin) continue; // Dah lepas
        }

        if (shiftStartMin > nowMinutes || (shift.isOvernightFromYesterday && !shift.isPast)) {
            nextShift = shift;
            break;
        }
    }

    var countdownDiv = document.getElementById('nextShiftCountdown');
    if (!countdownDiv) return;

    if (!nextShift) {
        if (completedCount >= sortedShifts.length) {
            countdownDiv.innerHTML = '<div style="padding:20px;text-align:center;"><div style="font-size:2rem;margin-bottom:8px;">🎉</div><div style="font-weight:700;color:#fbbf24;">Semua shift selesai!</div></div>';
        } else if (hasActive) {
            countdownDiv.innerHTML = '<div style="padding:20px;text-align:center;"><div style="font-size:2rem;margin-bottom:8px;">▶️</div><div style="font-weight:700;color:#fbbf24;">Shift sedang berjalan</div></div>';
        } else {
            countdownDiv.innerHTML = '<div style="padding:20px;text-align:center;"><div style="font-size:2rem;margin-bottom:8px;">⏰</div><div style="font-weight:700;color:#fbbf24;">Tiada shift seterusnya</div></div>';
        }
        return;
    }

    countdownDiv.classList.remove('hidden');

    document.getElementById('nextShiftName').textContent = nextShift.name;
    document.getElementById('nextShiftTime').textContent = formatShiftTime(nextShift.start) + ' - ' + formatShiftTime(nextShift.end);

    // Calculate countdown
    var targetParts = nextShift.start.split(':');
    var targetMinutes = parseInt(targetParts[0]) * 60 + parseInt(targetParts[1]);
    var diffMinutes = targetMinutes - nowMinutes;

    if (diffMinutes < 0) diffMinutes = 0;

    var diffSeconds = (diffMinutes * 60) - now.getSeconds();
    if (diffSeconds < 0) diffSeconds = 0;

    var hours = Math.floor(diffSeconds / 3600);
    var minutes = Math.floor((diffSeconds % 3600) / 60);
    var seconds = diffSeconds % 60;

    var hEl = document.getElementById('shiftCountdownHours');
    var mEl = document.getElementById('shiftCountdownMinutes');
    var sEl = document.getElementById('shiftCountdownSeconds');

    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
}

// ===== SHIFT REMINDER =====
function checkShiftReminder() {
    if (!currentWorker || !currentWorker.shifts) return;

    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();
    var today = new Date().toISOString().split('T')[0];

    for (var i = 0; i < currentWorker.shifts.length; i++) {
        var shift = currentWorker.shifts[i];
        var startParts = shift.start.split(':');
        var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);

        var minsUntil = startMin - nowMinutes;
        var reminderKey = today + '_' + i;

        // Reminder 10 minit sebelum
        if (minsUntil === 10 && !reminderShown[reminderKey + '_10']) {
            reminderShown[reminderKey + '_10'] = true;
            showShiftReminder('⏰ 10 Minit Lagi!', shift.name + ' bermula pada ' + formatShiftTime(shift.start) + '\n\nSila bersiap untuk punch in.');
            playReminderSound();
        }

        // Reminder 5 minit sebelum
        if (minsUntil === 5 && !reminderShown[reminderKey + '_5']) {
            reminderShown[reminderKey + '_5'] = true;
            showShiftReminder('⚠️ 5 Minit Lagi!', shift.name + ' bermula pada ' + formatShiftTime(shift.start) + '\n\nPunch in SEKARANG!');
            playReminderSound();
        }

        // Reminder bila dah masuk waktu tapi belum punch
        if (minsUntil === 0 && !reminderShown[reminderKey + '_now']) {
            // Check kalau belum punch shift ini
            var hasPunched = false;
            for (var j = 0; j < appData.punchRecords.length; j++) {
                var r = appData.punchRecords[j];
                if (r.workerId === currentWorker.id && r.date === today && r.shiftIndex === i) {
                    hasPunched = true;
                    break;
                }
            }

            if (!hasPunched) {
                reminderShown[reminderKey + '_now'] = true;
                showShiftReminder('🔴 Waktu Dah Masuk!', shift.name + ' dah bermula!\n\nPunch in SEGERA atau gaji akan dipotong!');
                playReminderSound();
            }
        }

        // Reminder 5 minit LEWAT
        if (minsUntil === -5 && !reminderShown[reminderKey + '_late5']) {
            var hasPunched2 = false;
            for (var j = 0; j < appData.punchRecords.length; j++) {
                var r = appData.punchRecords[j];
                if (r.workerId === currentWorker.id && r.date === today && r.shiftIndex === i) {
                    hasPunched2 = true;
                    break;
                }
            }

            if (!hasPunched2) {
                reminderShown[reminderKey + '_late5'] = true;
                showShiftReminder('🔴 ANDA LEWAT!', 'Anda sudah 5 MINIT LEWAT untuk ' + shift.name + '!\n\nGaji akan DIPOTONG bermula sekarang!\n\nPunch in SEGERA!');
                playReminderSound();
                playReminderSound();
            }
        }
    }
}

function showShiftReminder(title, message) {
    var reminder = document.getElementById('shiftReminder');
    var text = document.getElementById('reminderText');

    if (!reminder || !text) return;

    text.innerHTML = '<strong style="font-size:1.3rem;display:block;margin-bottom:10px;">' + title + '</strong>' + message.replace(/\n/g, '<br>');

    reminder.classList.remove('hidden');

    // Auto dismiss after 30 seconds
    setTimeout(function() {
        dismissReminder();
    }, 30000);

    // Also try browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'https://api.iconify.design/twemoji/mosque.svg'
        });
    }
}

function dismissReminder() {
    var reminder = document.getElementById('shiftReminder');
    if (reminder) reminder.classList.add('hidden');
}

function playReminderSound() {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var notes = [880, 1100, 880, 1100, 880];

        for (var i = 0; i < notes.length; i++) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = notes[i];
            osc.type = 'sine';
            var startTime = ctx.currentTime + (i * 0.2);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(function() {
        Notification.requestPermission();
    }, 5000);
}

// ===== DEFAULT SHIFTS IKUT ROLE =====
function getDefaultShiftsForRole(role) {
    var roleLower = (role || '').toLowerCase();

    if (roleLower.indexOf('warden') > -1) {
        return [
            { name: 'Malam', start: '22:00', end: '04:50' },
            { name: 'Pagi', start: '07:30', end: '09:00' },
            { name: 'Tengahari', start: '12:30', end: '13:15' },
            { name: 'Petang', start: '17:30', end: '19:00' }
        ];
    }

    if (roleLower.indexOf('ustaz') > -1 || roleLower.indexOf('quran') > -1) {
        return [
            { name: 'Subuh', start: '04:50', end: '07:30' },
            { name: 'Pagi', start: '09:00', end: '12:30' },
            { name: 'Petang', start: '13:15', end: '17:30' },
            { name: 'Malam', start: '19:00', end: '22:00' }
        ];
    }

    if (roleLower.indexOf('masak') > -1 || roleLower.indexOf('cook') > -1) {
        return [
            { name: 'Pagi', start: '07:30', end: '08:30' },
            { name: 'Tengahari', start: '11:30', end: '12:30' },
            { name: 'Malam', start: '21:00', end: '22:00' }
        ];
    }

    // Default untuk role lain
    return [
        { name: 'Pagi', start: '08:00', end: '12:00' },
        { name: 'Petang', start: '14:00', end: '18:00' }
    ];
}

// ===== SHIFT CALCULATION HELPERS =====

function calculateShiftHours(startTime, endTime) {
    var startParts = startTime.split(':');
    var endParts = endTime.split(':');

    var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    // Handle overnight shift (cth: 22:00 - 04:50)
    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
    }

    var diff = endMinutes - startMinutes;
    return (diff / 60).toFixed(1);
}

function formatShiftTime(time24) {
    if (!time24) return '-';
    var parts = time24.split(':');
    var hours = parseInt(parts[0]);
    var minutes = parts[1];
    var period = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return hours + ':' + minutes + ' ' + period;
}

// ===== SHIFT RANGE HELPER =====
function getShiftRange(shift) {
    var startParts = shift.start.split(':');
    var endParts = shift.end.split(':');

    var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    var endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    return { start: startMin, end: endMin };
}

// ============================================
// ===== FINAL SAVE PUNCH RECORD ==============
// ============================================

function savePunchRecord(photoUrl) {

    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var today = new Date().toISOString().split('T')[0];
    var now = new Date();
    var nowISO = now.toISOString();

    // Get shift yang dipilih
    var shiftName = window._punchingShiftName || 'Extra';
    var shiftIndex = window._punchingShiftIndex || -1;

    // Get shift details
    var shift = null;
    if (currentWorker.shifts && shiftIndex >= 0) {
        shift = currentWorker.shifts[shiftIndex];
    }

    // Cari active record untuk shift ni
    var activeRecord = null;
    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today && !r.punchOut && r.shiftName === shiftName) {
            activeRecord = r;
            break;
        }
    }

    if (punchTypePending === 'out' && activeRecord) {
        // PUNCH OUT
        var punchInTime = new Date(activeRecord.punchIn);
        var hoursWorked = (now - punchInTime) / (1000 * 60 * 60);

        activeRecord.punchOut = nowISO;
        activeRecord.hoursWorked = Math.round(hoursWorked * 100) / 100;
        activeRecord.punchOutPhoto = photoUrl;
        activeRecord.punchOutLocation = currentLocation;
        activeRecord.punchOutLocationValid = locationValid;

        saveData(appData);
        showToast('✅ Punch OUT [' + shiftName + ']! ' + activeRecord.hoursWorked.toFixed(1) + ' jam');

    } else {
        // PUNCH IN
        var lateInfo = { isLate: false, lateMinutes: 0, deduction: 0 };
        if (shift) {
            try { lateInfo = checkIfLate(now, shift); } catch(e) {}
        }

        var newRecord = {
            id: 'PCH' + Date.now(),
            workerId: currentWorker.id,
            workerName: currentWorker.name,
            date: today,
            punchIn: nowISO,
            punchOut: null,
            hoursWorked: 0,
            status: 'pending',
            shiftIndex: shiftIndex,
            shiftName: shiftName,
            scheduledStart: shift ? shift.start : null,
            scheduledEnd: shift ? shift.end : null,
            isLate: lateInfo.isLate,
            lateMinutes: lateInfo.lateMinutes,
            lateDeduction: lateInfo.deduction,
            punchInPhoto: photoUrl,
            punchInLocation: currentLocation,
            punchInLocationValid: locationValid,
            createdAt: nowISO
        };

        appData.punchRecords.push(newRecord);
        saveData(appData);

        if (lateInfo.isLate) {
            showToast('⚠️ Punch IN [' + shiftName + '] LEWAT ' + lateInfo.lateMinutes + 'min!');
        } else {
            showToast('✅ Punch IN [' + shiftName + '] berjaya!');
        }

        try {
            if (typeof sendPunchNotificationWithLate === 'function') {
                sendPunchNotificationWithLate('IN', currentWorker, newRecord, lateInfo);
            }
        } catch(e) {}
    }

    // Clear
    window._punchingShiftName = null;
    window._punchingShiftIndex = null;

    closeCameraModal();

    setTimeout(function() {
        appData = loadData();
        if (!appData.punchRecords) appData.punchRecords = [];
        updatePunchStatus();
        renderTodayStats();
        renderMonthStats();
        renderRecentPunches();
        renderShiftPunchButtons();
    }, 500);
}

// ============================================
// ===== SHIFT PUNCH BUTTONS =================
// ============================================

function renderShiftPunchButtons() {
    var container = document.getElementById('shiftPunchContainer');
    if (!container) return;
    if (!currentWorker || !currentWorker.shifts) return;

    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();
    var today = now.toISOString().split('T')[0];

    var shifts = currentWorker.shifts;

    // Get punched shifts hari ini
    var punchedShifts = {};
    var activeShift = null;

    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today) {
            if (r.punchOut) {
                punchedShifts[r.shiftName] = r;
            } else {
                activeShift = r;
            }
        }
    }

    var html = '';

    for (var i = 0; i < shifts.length; i++) {
        var shift = shifts[i];
        var shiftHours = calculateShiftHours(shift.start, shift.end);

        // Get timing
        var startParts = shift.start.split(':');
        var endParts = shift.end.split(':');
        var sMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        var eMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
        var isOvernight = eMin < sMin;

        // Determine status
        var status = 'locked';  // Default: belum masuk waktu
        var icon = '🔒';
        var actionText = 'Belum Masuk Waktu';
        var statusText = '';
        var canClick = false;
        var record = punchedShifts[shift.name] || null;

        // Check kalau shift ni sedang active (ada open punch)
        if (activeShift && activeShift.shiftName === shift.name) {
            status = 'working';
            icon = '▶️';
            actionText = '📤 PUNCH OUT';
            statusText = 'Sedang bekerja sejak ' + formatTime(new Date(activeShift.punchIn));
            canClick = true;
        }
        // Check kalau dah selesai
        else if (record) {
            status = 'done';
            icon = '✅';
            actionText = 'Selesai';
            var actualIn = formatTime(new Date(record.punchIn));
            var actualOut = formatTime(new Date(record.punchOut));
            statusText = actualIn + ' → ' + actualOut + ' (' + (record.hoursWorked || 0).toFixed(1) + 'j)';

            if (record.isLate) {
                icon = '⚠️';
                statusText += ' | Lewat ' + record.lateMinutes + 'min';
            }
        }
        // Check kalau ada active shift LAIN (tak boleh punch 2 sekaligus)
        else if (activeShift) {
            status = 'locked';
            icon = '⏸️';
            actionText = 'Punch Out Dulu';
            statusText = 'Shift ' + activeShift.shiftName + ' masih aktif';
        }
        // Check timing
        else {
            var inRange = false;
            var isPast = false;
            var isFuture = false;

            if (isOvernight) {
                // Overnight: 22:00-04:50
                inRange = (nowMinutes >= (sMin - 30)) || (nowMinutes <= eMin);
                isPast = (nowMinutes > eMin && nowMinutes < sMin);
                isFuture = (nowMinutes < (sMin - 30) && nowMinutes > eMin);
            } else {
                inRange = (nowMinutes >= (sMin - 30) && nowMinutes <= (eMin + 15));
                isPast = (nowMinutes > (eMin + 15));
                isFuture = (nowMinutes < (sMin - 30));
            }

            if (inRange) {
                status = 'can-punch';
                icon = '📥';
                actionText = '📥 PUNCH IN';

                var minsLate = nowMinutes - sMin;
                if (minsLate > 5) {
                    statusText = '⚠️ Lewat ' + (minsLate - 5) + ' minit!';
                } else if (minsLate < 0) {
                    statusText = Math.abs(minsLate) + ' minit awal';
                } else {
                    statusText = 'On time ✅';
                }
                canClick = true;

            } else if (isPast) {
                status = 'missed';
                icon = '❌';
                actionText = 'Terlepas';
                statusText = 'Waktu dah berlalu';

            } else if (isFuture) {
                status = 'locked';
                icon = '🔒';

                var minsUntil = sMin - nowMinutes;
                if (minsUntil < 60) {
                    actionText = minsUntil + 'm lagi';
                } else {
                    actionText = Math.floor(minsUntil / 60) + 'j ' + (minsUntil % 60) + 'm lagi';
                }
                statusText = 'Belum masuk waktu';
            }
        }

        // Build button HTML
        var onclick = canClick ? ' onclick="punchShift(\'' + shift.name + '\', ' + i + ')"' : '';

        html += '<button class="shift-punch-btn ' + status + '"' + onclick + '>';
        html += '<div class="shift-punch-icon">' + icon + '</div>';
        html += '<div class="shift-punch-info">';
        html += '<div class="shift-punch-name">' + shift.name + '</div>';
        html += '<div class="shift-punch-time">' + formatShiftTime(shift.start) + ' → ' + formatShiftTime(shift.end) + '</div>';

        if (statusText) {
            html += '<div class="shift-punch-status">' + statusText + '</div>';
        }

        if (record) {
            html += '<div class="shift-punch-actual">📌 ' + formatTime(new Date(record.punchIn)) + ' → ' + formatTime(new Date(record.punchOut)) + '</div>';
        }

        html += '</div>';

        html += '<div class="shift-punch-hours">';
        html += '<div class="shift-punch-hours-num">' + shiftHours + '</div>';
        html += '<div class="shift-punch-hours-label">jam</div>';
        html += '</div>';

        html += '<div class="shift-punch-action">' + actionText + '</div>';

        html += '</button>';
    }

    container.innerHTML = html;
}

// ===== PUNCH SPECIFIC SHIFT =====
function punchShift(shiftName, shiftIndex) {
    if (!currentWorker) return;

    appData = loadData();
    if (!appData.punchRecords) appData.punchRecords = [];

    var today = new Date().toISOString().split('T')[0];

    // Check kalau ada active shift (nak punch out)
    var activeRecord = null;
    for (var i = 0; i < appData.punchRecords.length; i++) {
        var r = appData.punchRecords[i];
        if (r.workerId === currentWorker.id && r.date === today && !r.punchOut && r.shiftName === shiftName) {
            activeRecord = r;
            break;
        }
    }

    if (activeRecord) {
        punchTypePending = 'out';
    } else {
        punchTypePending = 'in';
    }

    // Set which shift we're punching
    window._punchingShiftName = shiftName;
    window._punchingShiftIndex = shiftIndex;

    // Open camera
    openCameraModal(punchTypePending);
}

// Auto refresh shift buttons setiap 30 saat
setInterval(function() {
    if (currentWorker) {
        renderShiftPunchButtons();
    }
}, 30000);

