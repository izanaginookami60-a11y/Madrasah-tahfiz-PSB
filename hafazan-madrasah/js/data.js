// ===== SENARAI SURAH AL-QURAN =====
const SURAH_LIST = [
    { no: 1, name: "Al-Fatihah", juzList: [1], ayat: 7, pageStart: 1, pageEnd: 1 },
    { no: 2, name: "Al-Baqarah", juzList: [1,2,3], ayat: 286, pageStart: 2, pageEnd: 49 },
    { no: 3, name: "Ali Imran", juzList: [3,4], ayat: 200, pageStart: 50, pageEnd: 76 },
    { no: 4, name: "An-Nisa", juzList: [4,5,6], ayat: 176, pageStart: 77, pageEnd: 106 },
    { no: 5, name: "Al-Maidah", juzList: [6,7], ayat: 120, pageStart: 106, pageEnd: 127 },
    { no: 6, name: "Al-Anam", juzList: [7,8], ayat: 165, pageStart: 128, pageEnd: 150 },
    { no: 7, name: "Al-Araf", juzList: [8,9], ayat: 206, pageStart: 151, pageEnd: 176 },
    { no: 8, name: "Al-Anfal", juzList: [9,10], ayat: 75, pageStart: 177, pageEnd: 186 },
    { no: 9, name: "At-Taubah", juzList: [10,11], ayat: 129, pageStart: 187, pageEnd: 207 },
    { no: 10, name: "Yunus", juzList: [11], ayat: 109, pageStart: 208, pageEnd: 221 },
    { no: 11, name: "Hud", juzList: [11,12], ayat: 123, pageStart: 221, pageEnd: 235 },
    { no: 12, name: "Yusuf", juzList: [12,13], ayat: 111, pageStart: 235, pageEnd: 248 },
    { no: 13, name: "Ar-Rad", juzList: [13], ayat: 43, pageStart: 249, pageEnd: 255 },
    { no: 14, name: "Ibrahim", juzList: [13], ayat: 52, pageStart: 255, pageEnd: 261 },
    { no: 15, name: "Al-Hijr", juzList: [14], ayat: 99, pageStart: 262, pageEnd: 267 },
    { no: 16, name: "An-Nahl", juzList: [14], ayat: 128, pageStart: 267, pageEnd: 281 },
    { no: 17, name: "Al-Isra", juzList: [15], ayat: 111, pageStart: 282, pageEnd: 293 },
    { no: 18, name: "Al-Kahf", juzList: [15,16], ayat: 110, pageStart: 293, pageEnd: 304 },
    { no: 19, name: "Maryam", juzList: [16], ayat: 98, pageStart: 305, pageEnd: 312 },
    { no: 20, name: "Taha", juzList: [16], ayat: 135, pageStart: 312, pageEnd: 321 },
    { no: 21, name: "Al-Anbiya", juzList: [17], ayat: 112, pageStart: 322, pageEnd: 331 },
    { no: 22, name: "Al-Hajj", juzList: [17], ayat: 78, pageStart: 332, pageEnd: 341 },
    { no: 23, name: "Al-Mukminun", juzList: [18], ayat: 118, pageStart: 342, pageEnd: 349 },
    { no: 24, name: "An-Nur", juzList: [18], ayat: 64, pageStart: 350, pageEnd: 359 },
    { no: 25, name: "Al-Furqan", juzList: [18,19], ayat: 77, pageStart: 359, pageEnd: 366 },
    { no: 26, name: "Asy-Syuara", juzList: [19], ayat: 227, pageStart: 367, pageEnd: 376 },
    { no: 27, name: "An-Naml", juzList: [19,20], ayat: 93, pageStart: 377, pageEnd: 385 },
    { no: 28, name: "Al-Qasas", juzList: [20], ayat: 88, pageStart: 385, pageEnd: 396 },
    { no: 29, name: "Al-Ankabut", juzList: [20,21], ayat: 69, pageStart: 396, pageEnd: 404 },
    { no: 30, name: "Ar-Rum", juzList: [21], ayat: 60, pageStart: 404, pageEnd: 410 },
    { no: 31, name: "Luqman", juzList: [21], ayat: 34, pageStart: 411, pageEnd: 414 },
    { no: 32, name: "As-Sajdah", juzList: [21], ayat: 30, pageStart: 415, pageEnd: 417 },
    { no: 33, name: "Al-Ahzab", juzList: [21,22], ayat: 73, pageStart: 418, pageEnd: 427 },
    { no: 34, name: "Saba", juzList: [22], ayat: 54, pageStart: 428, pageEnd: 434 },
    { no: 35, name: "Fatir", juzList: [22], ayat: 45, pageStart: 434, pageEnd: 440 },
    { no: 36, name: "Ya Sin", juzList: [22,23], ayat: 83, pageStart: 440, pageEnd: 445 },
    { no: 37, name: "As-Saffat", juzList: [23], ayat: 182, pageStart: 446, pageEnd: 452 },
    { no: 38, name: "Sad", juzList: [23], ayat: 88, pageStart: 453, pageEnd: 458 },
    { no: 39, name: "Az-Zumar", juzList: [23,24], ayat: 75, pageStart: 458, pageEnd: 467 },
    { no: 40, name: "Ghafir", juzList: [24], ayat: 85, pageStart: 467, pageEnd: 476 },
    { no: 41, name: "Fussilat", juzList: [24,25], ayat: 54, pageStart: 477, pageEnd: 482 },
    { no: 42, name: "Asy-Syura", juzList: [25], ayat: 53, pageStart: 483, pageEnd: 489 },
    { no: 43, name: "Az-Zukhruf", juzList: [25], ayat: 89, pageStart: 489, pageEnd: 495 },
    { no: 44, name: "Ad-Dukhan", juzList: [25], ayat: 59, pageStart: 496, pageEnd: 498 },
    { no: 45, name: "Al-Jasiyah", juzList: [25], ayat: 37, pageStart: 499, pageEnd: 502 },
    { no: 46, name: "Al-Ahqaf", juzList: [26], ayat: 35, pageStart: 502, pageEnd: 506 },
    { no: 47, name: "Muhammad", juzList: [26], ayat: 38, pageStart: 507, pageEnd: 510 },
    { no: 48, name: "Al-Fath", juzList: [26], ayat: 29, pageStart: 511, pageEnd: 515 },
    { no: 49, name: "Al-Hujurat", juzList: [26], ayat: 18, pageStart: 515, pageEnd: 517 },
    { no: 50, name: "Qaf", juzList: [26], ayat: 45, pageStart: 518, pageEnd: 520 },
    { no: 51, name: "Az-Zariyat", juzList: [26,27], ayat: 60, pageStart: 520, pageEnd: 523 },
    { no: 52, name: "At-Tur", juzList: [27], ayat: 49, pageStart: 523, pageEnd: 525 },
    { no: 53, name: "An-Najm", juzList: [27], ayat: 62, pageStart: 526, pageEnd: 528 },
    { no: 54, name: "Al-Qamar", juzList: [27], ayat: 55, pageStart: 528, pageEnd: 531 },
    { no: 55, name: "Ar-Rahman", juzList: [27], ayat: 78, pageStart: 531, pageEnd: 534 },
    { no: 56, name: "Al-Waqiah", juzList: [27], ayat: 96, pageStart: 534, pageEnd: 537 },
    { no: 57, name: "Al-Hadid", juzList: [27], ayat: 29, pageStart: 537, pageEnd: 541 },
    { no: 58, name: "Al-Mujadalah", juzList: [28], ayat: 22, pageStart: 542, pageEnd: 545 },
    { no: 59, name: "Al-Hasyr", juzList: [28], ayat: 24, pageStart: 545, pageEnd: 548 },
    { no: 60, name: "Al-Mumtahanah", juzList: [28], ayat: 13, pageStart: 549, pageEnd: 551 },
    { no: 61, name: "As-Saff", juzList: [28], ayat: 14, pageStart: 551, pageEnd: 552 },
    { no: 62, name: "Al-Jumuah", juzList: [28], ayat: 11, pageStart: 553, pageEnd: 554 },
    { no: 63, name: "Al-Munafiqun", juzList: [28], ayat: 11, pageStart: 554, pageEnd: 555 },
    { no: 64, name: "At-Taghabun", juzList: [28], ayat: 18, pageStart: 556, pageEnd: 557 },
    { no: 65, name: "At-Talaq", juzList: [28], ayat: 12, pageStart: 558, pageEnd: 559 },
    { no: 66, name: "At-Tahrim", juzList: [28], ayat: 12, pageStart: 560, pageEnd: 561 },
    { no: 67, name: "Al-Mulk", juzList: [29], ayat: 30, pageStart: 562, pageEnd: 564 },
    { no: 68, name: "Al-Qalam", juzList: [29], ayat: 52, pageStart: 564, pageEnd: 566 },
    { no: 69, name: "Al-Haqqah", juzList: [29], ayat: 52, pageStart: 566, pageEnd: 568 },
    { no: 70, name: "Al-Maarij", juzList: [29], ayat: 44, pageStart: 568, pageEnd: 570 },
    { no: 71, name: "Nuh", juzList: [29], ayat: 28, pageStart: 570, pageEnd: 571 },
    { no: 72, name: "Al-Jinn", juzList: [29], ayat: 28, pageStart: 572, pageEnd: 573 },
    { no: 73, name: "Al-Muzzammil", juzList: [29], ayat: 20, pageStart: 574, pageEnd: 575 },
    { no: 74, name: "Al-Muddassir", juzList: [29], ayat: 56, pageStart: 575, pageEnd: 577 },
    { no: 75, name: "Al-Qiyamah", juzList: [29], ayat: 40, pageStart: 577, pageEnd: 578 },
    { no: 76, name: "Al-Insan", juzList: [29], ayat: 31, pageStart: 578, pageEnd: 580 },
    { no: 77, name: "Al-Mursalat", juzList: [29,30], ayat: 50, pageStart: 580, pageEnd: 581 },
    { no: 78, name: "An-Naba", juzList: [30], ayat: 40, pageStart: 582, pageEnd: 583 },
    { no: 79, name: "An-Naziat", juzList: [30], ayat: 46, pageStart: 583, pageEnd: 584 },
    { no: 80, name: "Abasa", juzList: [30], ayat: 42, pageStart: 585, pageEnd: 585 },
    { no: 81, name: "At-Takwir", juzList: [30], ayat: 29, pageStart: 586, pageEnd: 586 },
    { no: 82, name: "Al-Infitar", juzList: [30], ayat: 19, pageStart: 587, pageEnd: 587 },
    { no: 83, name: "Al-Mutaffifin", juzList: [30], ayat: 36, pageStart: 587, pageEnd: 589 },
    { no: 84, name: "Al-Insyiqaq", juzList: [30], ayat: 25, pageStart: 589, pageEnd: 589 },
    { no: 85, name: "Al-Buruj", juzList: [30], ayat: 22, pageStart: 590, pageEnd: 590 },
    { no: 86, name: "At-Tariq", juzList: [30], ayat: 17, pageStart: 591, pageEnd: 591 },
    { no: 87, name: "Al-Ala", juzList: [30], ayat: 19, pageStart: 591, pageEnd: 592 },
    { no: 88, name: "Al-Ghasyiyah", juzList: [30], ayat: 26, pageStart: 592, pageEnd: 592 },
    { no: 89, name: "Al-Fajr", juzList: [30], ayat: 30, pageStart: 593, pageEnd: 594 },
    { no: 90, name: "Al-Balad", juzList: [30], ayat: 20, pageStart: 594, pageEnd: 594 },
    { no: 91, name: "Asy-Syams", juzList: [30], ayat: 15, pageStart: 595, pageEnd: 595 },
    { no: 92, name: "Al-Lail", juzList: [30], ayat: 21, pageStart: 595, pageEnd: 596 },
    { no: 93, name: "Ad-Duha", juzList: [30], ayat: 11, pageStart: 596, pageEnd: 596 },
    { no: 94, name: "Al-Insyirah", juzList: [30], ayat: 8, pageStart: 596, pageEnd: 596 },
    { no: 95, name: "At-Tin", juzList: [30], ayat: 8, pageStart: 597, pageEnd: 597 },
    { no: 96, name: "Al-Alaq", juzList: [30], ayat: 19, pageStart: 597, pageEnd: 597 },
    { no: 97, name: "Al-Qadr", juzList: [30], ayat: 5, pageStart: 598, pageEnd: 598 },
    { no: 98, name: "Al-Bayyinah", juzList: [30], ayat: 8, pageStart: 598, pageEnd: 599 },
    { no: 99, name: "Az-Zalzalah", juzList: [30], ayat: 8, pageStart: 599, pageEnd: 599 },
    { no: 100, name: "Al-Adiyat", juzList: [30], ayat: 11, pageStart: 599, pageEnd: 600 },
    { no: 101, name: "Al-Qariah", juzList: [30], ayat: 11, pageStart: 600, pageEnd: 600 },
    { no: 102, name: "At-Takasur", juzList: [30], ayat: 8, pageStart: 600, pageEnd: 600 },
    { no: 103, name: "Al-Asr", juzList: [30], ayat: 3, pageStart: 601, pageEnd: 601 },
    { no: 104, name: "Al-Humazah", juzList: [30], ayat: 9, pageStart: 601, pageEnd: 601 },
    { no: 105, name: "Al-Fil", juzList: [30], ayat: 5, pageStart: 601, pageEnd: 601 },
    { no: 106, name: "Quraisy", juzList: [30], ayat: 4, pageStart: 602, pageEnd: 602 },
    { no: 107, name: "Al-Maun", juzList: [30], ayat: 7, pageStart: 602, pageEnd: 602 },
    { no: 108, name: "Al-Kausar", juzList: [30], ayat: 3, pageStart: 602, pageEnd: 602 },
    { no: 109, name: "Al-Kafirun", juzList: [30], ayat: 6, pageStart: 603, pageEnd: 603 },
    { no: 110, name: "An-Nasr", juzList: [30], ayat: 3, pageStart: 603, pageEnd: 603 },
    { no: 111, name: "Al-Masad", juzList: [30], ayat: 5, pageStart: 603, pageEnd: 603 },
    { no: 112, name: "Al-Ikhlas", juzList: [30], ayat: 4, pageStart: 604, pageEnd: 604 },
    { no: 113, name: "Al-Falaq", juzList: [30], ayat: 5, pageStart: 604, pageEnd: 604 },
    { no: 114, name: "An-Nas", juzList: [30], ayat: 6, pageStart: 604, pageEnd: 604 }
];

// ===== DEBUG MODE =====
// Tukar ke 'false' untuk production
var DEBUG_MODE = false;

function debugLog() {
    if (DEBUG_MODE && console && console.log) {
        console.log.apply(console, arguments);
    }
}


function getSurahAyat(surahName) {
    for (var i = 0; i < SURAH_LIST.length; i++) {
        if (SURAH_LIST[i].name === surahName) return SURAH_LIST[i].ayat;
    }
    return 0;
}

function getSurahInfo(surahName) {
    for (var i = 0; i < SURAH_LIST.length; i++) {
        if (SURAH_LIST[i].name === surahName) return SURAH_LIST[i];
    }
    return null;
}

function getSurahInfoByNo(surahNo) {
    for (var i = 0; i < SURAH_LIST.length; i++) {
        if (SURAH_LIST[i].no === surahNo) return SURAH_LIST[i];
    }
    return null;
}

// Check kalau surah ada dalam juz tertentu
function isSurahInJuz(surah, juzNum) {
    if (surah.juzList) {
        return surah.juzList.indexOf(juzNum) > -1;
    }
    // Fallback untuk data lama
    return surah.juz === juzNum;
}

// Helper untuk dapatkan jumlah ayat surah
function getSurahAyat(surahName) {
    for (var i = 0; i < SURAH_LIST.length; i++) {
        if (SURAH_LIST[i].name === surahName) {
            return SURAH_LIST[i].ayat;
        }
    }
    return 0;
}

// ===== DEFAULT DATA (untuk demo) =====
function getDefaultData() {
    return {
        students: [
            {
                id: "STU001",
                name: "Ahmad bin Abdullah",
                class: "Kelas 3 (Hafazan Juz 30)",
                parentName: "Abdullah bin Hassan",
                fatherName: "Abdullah bin Hassan",
                fatherPhone: "012-3456789",
                parentPhone: "012-3456789",
                parentLoginId: "parent1",
                parentLoginPass: "parent123",
                createdAt: "2024-01-15"
            },
            {
                id: "STU002",
                name: "Fatimah binti Abu Bakar",
                class: "Kelas 3 (Hafazan Juz 30)",
                parentName: "Abu Bakar bin Othman",
                fatherName: "Abu Bakar bin Othman",
                fatherPhone: "013-9876543",
                parentPhone: "013-9876543",
                parentLoginId: "parent2",
                parentLoginPass: "parent123",
                createdAt: "2024-01-15"
            },
            {
                id: "STU003",
                name: "Muhammad Irfan bin Ismail",
                class: "Kelas 4 (Hafazan Juz 29-28)",
                parentName: "Ismail bin Yusof",
                fatherName: "Ismail bin Yusof",
                fatherPhone: "011-1234567",
                parentPhone: "011-1234567",
                parentLoginId: "parent3",
                parentLoginPass: "parent123",
                createdAt: "2024-02-01"
            },
            {
                id: "STU004",
                name: "Aisyah binti Mohd Rizal",
                class: "Kelas 2 (Al-Quran Asas)",
                parentName: "Mohd Rizal bin Ahmad",
                fatherName: "Mohd Rizal bin Ahmad",
                fatherPhone: "019-8765432",
                parentPhone: "019-8765432",
                parentLoginId: "parent4",
                parentLoginPass: "parent123",
                createdAt: "2024-02-10"
            }
        ],
        records: [
            { id: "REC001", studentId: "STU001", date: "2024-11-01", juz: 30, surah: "An-Nas", score: 92, status: "Lancar", notes: "Bacaan sangat baik. Tajwid tepat." },
            { id: "REC002", studentId: "STU001", date: "2024-11-08", juz: 30, surah: "Al-Falaq", score: 88, status: "Lancar", notes: "Perlu perbaiki makhraj huruf Qaf." },
            { id: "REC003", studentId: "STU001", date: "2024-11-15", juz: 30, surah: "Al-Ikhlas", score: 95, status: "Lancar", notes: "Cemerlang! Hafazan sangat mantap." },
            { id: "REC004", studentId: "STU001", date: "2024-11-22", juz: 30, surah: "Al-Masad", score: 78, status: "Sederhana", notes: "Ada beberapa kesilapan pada ayat 3-4." },
            { id: "REC005", studentId: "STU001", date: "2024-12-01", juz: 30, surah: "An-Nasr", score: 90, status: "Lancar", notes: "Bagus! Teruskan usaha." },
            { id: "REC006", studentId: "STU002", date: "2024-11-05", juz: 1, surah: "Al-Fatihah", score: 97, status: "Lancar", notes: "Hafazan sempurna." },
            { id: "REC007", studentId: "STU002", date: "2024-11-12", juz: 30, surah: "An-Nas", score: 85, status: "Lancar", notes: "Baik. Perlu lebih lancar." },
            { id: "REC008", studentId: "STU003", date: "2024-11-10", juz: 30, surah: "Al-Kafirun", score: 65, status: "Perlu Ulang", notes: "Banyak kesilapan. Perlu ulang." },
            { id: "REC009", studentId: "STU003", date: "2024-11-20", juz: 30, surah: "Al-Kafirun", score: 82, status: "Sederhana", notes: "Ada peningkatan." },
            { id: "REC010", studentId: "STU004", date: "2024-11-15", juz: 1, surah: "Al-Fatihah", score: 90, status: "Lancar", notes: "Sangat baik untuk permulaan." }
        ],
        attendance: [],
        admins: [
            { id: "admin", password: "admin123", name: "Ustaz Aisamuddin bin Kamal" }
        ]
    };
}

// ===== LOCAL STORAGE HELPERS =====
function loadData() {
    var saved = localStorage.getItem('hafazanData');
    if (saved) {
        return JSON.parse(saved);
    }
    // Kalau takde local data, return default TAPI jangan save dulu
    // Nanti syncData akan check Firebase dulu
    return getDefaultData();
}

function saveData(data, callback) {
    data.lastUpdated = Date.now();
    localStorage.setItem('hafazanData', JSON.stringify(data));
    if (typeof saveDataFirebase === 'function' && firebaseReady) {
        saveDataFirebase(data, callback);
    } else {
        // Offline - dah simpan local, anggap berjaya
        if (callback) callback(true);
    }
}

function resetData() {
    // HANYA clear local - JANGAN sentuh Firebase
    localStorage.removeItem('hafazanData');
    location.reload();
    // Bila reload, syncData akan tarik data dari Firebase balik
}

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

// Initialize Firebase
var firebaseApp = null;
var firebaseDb = null;
var firebaseReady = false;

function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseDb = firebase.database();
            firebaseReady = true;
            console.log('🔥 Firebase connected!');
        } else {
            console.log('⚠️ Firebase not loaded, using localStorage');
            firebaseReady = false;
        }
    } catch (e) {
        console.log('⚠️ Firebase error:', e.message);
        firebaseReady = false;
    }
}

function saveDataFirebase(data, callback) {
    if (!firebaseDb) {
        if (callback) callback(false);
        return;
    }

    // ✅ FIXED: Guna update() bukan set()
    // update() hanya tulis key yang ada dalam object — key lain tak disentuh
    // Berbeza dengan set() yang DELETE semua key yang tak ada dalam object
    var updatePayload = {
        'hafazanData/students':      data.students      || [],
        'hafazanData/records':       data.records       || [],
        'hafazanData/attendance':    data.attendance    || {},
        'hafazanData/cashbook':      data.cashbook      || [],
        'hafazanData/gallery':       data.gallery       || [],
        'hafazanData/events':        data.events        || [],
        'hafazanData/outings':       data.outings       || [],
        'hafazanData/parentUpdates': data.parentUpdates || [],
        'hafazanData/lastUpdated':   Date.now()
    };

    // firebaseDb.ref('/').update() — multi-path update, atomic
    // Ini cara Firebase yang disyorkan untuk update berbilang path sekaligus
    firebaseDb.ref('/').update(updatePayload)
        .then(function () {
            console.log('☁️ Saved to Firebase (multi-path update)');
            if (callback) callback(true);
        })
        .catch(function (error) {
            console.error('⚠️ Firebase save error:', error.message);
            if (callback) callback(false, error);
        });
}

function syncData(callback) {
    if (!firebaseReady || !firebaseDb) {
        showSyncStatus('offline');
        // Takde Firebase, guna default data
        var localSaved = localStorage.getItem('hafazanData');
        if (!localSaved) {
            var defaultData = getDefaultData();
            localStorage.setItem('hafazanData', JSON.stringify(defaultData));
        }
        if (callback) callback();
        return;
    }

    showSyncStatus('syncing');

    firebaseDb.ref('hafazanData').once('value')
        .then(function(snapshot) {
            var cloudData = snapshot.val();
            var localSaved = localStorage.getItem('hafazanData');
            var localData = localSaved ? JSON.parse(localSaved) : null;

            if (cloudData && cloudData.students && cloudData.students.length > 0) {
                // Ada data dalam Firebase - GUNA data Firebase
                if (localData) {
                    var cloudTime = cloudData.lastUpdated || 0;
                    var localTime = localData.lastUpdated || 0;

                    if (cloudTime >= localTime) {
                        // Cloud sama atau lebih baru - guna cloud
                        localStorage.setItem('hafazanData', JSON.stringify(cloudData));
                        if (typeof appData !== 'undefined') {
                            appData = cloudData;
                        }
                        console.log('☁️ Using cloud data');
                    } else {
                        // Local lebih baru - upload ke cloud
                        saveDataFirebase(localData);
                        console.log('☁️ Uploaded local data (newer)');
                    }
                } else {
                    // Takde local data, guna cloud
                    localStorage.setItem('hafazanData', JSON.stringify(cloudData));
                    if (typeof appData !== 'undefined') {
                        appData = cloudData;
                    }
                    console.log('☁️ Restored from cloud');
                }
            } else if (localData && localData.students && localData.students.length > 0) {
                // Takde cloud data tapi ada local - upload
                localData.lastUpdated = Date.now();
                saveDataFirebase(localData);
                localStorage.setItem('hafazanData', JSON.stringify(localData));
                console.log('☁️ First upload to Firebase');
            } else {
                // Takde data langsung - guna default
                var defaultData = getDefaultData();
                defaultData.lastUpdated = Date.now();
                localStorage.setItem('hafazanData', JSON.stringify(defaultData));
                saveDataFirebase(defaultData);
                console.log('☁️ Created default data');
            }

            showSyncStatus('synced');
            if (callback) callback();
        })
        .catch(function(error) {
            console.log('⚠️ Sync error:', error.message);
            showSyncStatus('error');
            // Kalau error, pastikan ada data local
            var localSaved = localStorage.getItem('hafazanData');
            if (!localSaved) {
                var defaultData = getDefaultData();
                localStorage.setItem('hafazanData', JSON.stringify(defaultData));
            }
            if (callback) callback();
        });
}

function showSyncStatus(status) {
    var el = document.getElementById('syncStatus');
    if (!el) return;
    if (status === 'syncing') {
        el.textContent = '🔄 Syncing...';
        el.style.color = 'var(--gold)';
    } else if (status === 'synced') {
        el.textContent = '☁️ Synced';
        el.style.color = 'var(--primary-light)';
    } else if (status === 'offline') {
        el.textContent = '📴 Offline';
        el.style.color = '#aaa';
    } else if (status === 'error') {
        el.textContent = '⚠️ Error';
        el.style.color = 'var(--red)';
    }
}

// ============================================
// ===== PARENT DATA COMPLETION CHECKER =======
// ============================================

/**
 * Configuration: Field yang wajib untuk setiap section
 * Struktur: { sectionKey: { title, icon, fields: [{ key, label, required }] } }
 */
var PARENT_DATA_SECTIONS = {
    pelajar: {
    title: 'Maklumat Pelajar',
    icon: '👨‍🎓',
    color: '#7c3aed',
    fields: [
        { key: 'name', label: 'Nama Penuh', required: true, type: 'text' },
        { 
            key: 'idType', 
            label: 'Jenis Pengenalan', 
            required: true, 
            type: 'select', 
            options: ['MyKid/IC', 'No. Passport', 'No. Surat Beranak'],
            default: 'MyKid/IC'
        },
        { key: 'ic', label: 'No. Pengenalan', required: true, type: 'text', maxlength: 20 },
        { key: 'dob', label: 'Tarikh Lahir', required: true, type: 'date' },
        { key: 'gender', label: 'Jantina', required: true, type: 'select', options: ['Lelaki', 'Perempuan'] },
        { key: 'birthPlace', label: 'Tempat Lahir', required: true, type: 'text' },
        { key: 'nationality', label: 'Kewarganegaraan', required: true, type: 'select', options: ['Malaysia', 'Indonesia', 'Bangladesh', 'Myanmar', 'Yemen', 'Somalia', 'Syria', 'Rohingya', 'Lain-lain'], default: 'Malaysia' },
        { key: 'race', label: 'Bangsa', required: true, type: 'select', options: ['Melayu', 'Cina', 'India', 'Arab', 'Rohingya', 'Lain-lain'] },
        { key: 'religion', label: 'Agama', required: true, type: 'text', default: 'Islam' },
        { key: 'address', label: 'Alamat Rumah', required: true, type: 'textarea' },
        { key: 'postcode', label: 'Poskod', required: true, type: 'text', maxlength: 5 },
        { key: 'city', label: 'Bandar', required: true, type: 'text' },
        { key: 'state', label: 'Negeri', required: true, type: 'select', options: ['Selangor', 'Kuala Lumpur', 'Putrajaya', 'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Terengganu', 'Labuan'] }
    ]
},
    
    bapa: {
    title: 'Maklumat Bapa',
    icon: '👨',
    color: '#3b82f6',
    fields: [
        { key: 'fatherName', label: 'Nama Bapa', required: true, type: 'text' },
        { 
            key: 'fatherIdType', 
            label: 'Jenis Pengenalan Bapa', 
            required: true, 
            type: 'select', 
            options: ['MyKad/IC', 'No. Passport'],
            default: 'MyKad/IC'
        },
        { key: 'fatherIC', label: 'No. Pengenalan Bapa', required: true, type: 'text', maxlength: 20 },
        { key: 'fatherDob', label: 'Tarikh Lahir Bapa', required: true, type: 'date' },
        { key: 'fatherNationality', label: 'Kewarganegaraan Bapa', required: true, type: 'select', options: ['Malaysia', 'Indonesia', 'Bangladesh', 'Myanmar', 'Yemen', 'Somalia', 'Syria', 'Rohingya', 'Lain-lain'], default: 'Malaysia' },
        { key: 'fatherJob', label: 'Pekerjaan Bapa', required: true, type: 'text' },
        { key: 'fatherEmployer', label: 'Majikan/Syarikat', required: true, type: 'text' },
        { key: 'fatherPhone', label: 'No. Telefon Bapa', required: true, type: 'tel' },
        { key: 'fatherEmail', label: 'Email Bapa', required: false, type: 'email' }
    ]
},

ibu: {
    title: 'Maklumat Ibu',
    icon: '👩',
    color: '#ec4899',
    fields: [
        { key: 'motherName', label: 'Nama Ibu', required: true, type: 'text' },
        { 
            key: 'motherIdType', 
            label: 'Jenis Pengenalan Ibu', 
            required: true, 
            type: 'select', 
            options: ['MyKad/IC', 'No. Passport'],
            default: 'MyKad/IC'
        },
        { key: 'motherIC', label: 'No. Pengenalan Ibu', required: true, type: 'text', maxlength: 20 },
        { key: 'motherDob', label: 'Tarikh Lahir Ibu', required: true, type: 'date' },
        { key: 'motherNationality', label: 'Kewarganegaraan Ibu', required: true, type: 'select', options: ['Malaysia', 'Indonesia', 'Bangladesh', 'Myanmar', 'Yemen', 'Somalia', 'Syria', 'Rohingya', 'Lain-lain'], default: 'Malaysia' },
        { key: 'motherJob', label: 'Pekerjaan Ibu', required: true, type: 'text' },
        { key: 'motherEmployer', label: 'Majikan/Syarikat', required: true, type: 'text' },
        { key: 'motherPhone', label: 'No. Telefon Ibu', required: true, type: 'tel' },
        { key: 'motherEmail', label: 'Email Ibu', required: false, type: 'email' }
    ]
},
    
    kecemasan: {
        title: 'Waris Kecemasan',
        icon: '🚨',
        color: '#ef4444',
        fields: [
            { key: 'emergencyName', label: 'Nama Waris', required: true, type: 'text' },
            { key: 'emergencyRelation', label: 'Hubungan', required: true, type: 'select', options: ['Datuk', 'Nenek', 'Pak Cik', 'Mak Cik', 'Abang', 'Kakak', 'Sepupu', 'Jiran', 'Lain-lain'] },
            { key: 'emergencyPhone', label: 'No. Telefon Waris', required: true, type: 'tel' },
            { key: 'emergencyAddress', label: 'Alamat Waris', required: true, type: 'textarea' }
        ]
    },
    
    kesihatan: {
        title: 'Maklumat Kesihatan',
        icon: '🏥',
        color: '#10b981',
        fields: [
            { key: 'allergies', label: 'Alahan (tulis "Tiada" jika tiada)', required: true, type: 'textarea' },
            { key: 'medicalConditions', label: 'Penyakit Kronik (tulis "Tiada" jika tiada)', required: true, type: 'textarea' },
            { key: 'currentMedication', label: 'Ubat Semasa (tulis "Tiada" jika tiada)', required: true, type: 'textarea' },
            { key: 'familyDoctor', label: 'Klinik/Doktor Keluarga', required: false, type: 'text' }
        ]
    },
    
    pendidikan: {
        title: 'Latar Belakang Pendidikan',
        icon: '📚',
        color: '#f59e0b',
        fields: [
            { key: 'previousSchool', label: 'Sekolah Lama (jika ada)', required: false, type: 'text' },
            { key: 'quranLevel', label: 'Tahap Al-Quran Semasa', required: true, type: 'select', options: ['Iqra 1', 'Iqra 2', 'Iqra 3', 'Iqra 4', 'Iqra 5', 'Iqra 6', 'Muqaddam', 'Al-Quran', 'Hafazan'] },
            { key: 'hafazanCert', label: 'Sijil Hafazan (jika ada)', required: false, type: 'text' }
        ]
    }
};

/**
 * Check completeness untuk satu pelajar
 * @param {Object} student - Object pelajar
 * @returns {Object} Result dengan overall %, section %, missing fields
 */
function checkStudentDataCompleteness(student) {
    if (!student) return null;
    
    var result = {
        overall: 0,
        totalRequired: 0,
        totalFilled: 0,
        sections: {},
        missingFields: [],
        isComplete: false
    };
    
    // Loop setiap section
    for (var sectionKey in PARENT_DATA_SECTIONS) {
        var section = PARENT_DATA_SECTIONS[sectionKey];
        var sectionResult = {
            title: section.title,
            icon: section.icon,
            color: section.color,
            totalRequired: 0,
            totalFilled: 0,
            percentage: 0,
            missingFields: []
        };
        
        // Loop setiap field
        for (var i = 0; i < section.fields.length; i++) {
            var field = section.fields[i];
            
            // Skip kalau tak wajib
            if (!field.required) continue;
            
            sectionResult.totalRequired++;
            result.totalRequired++;
            
            // Check kalau field ada isi
            var value = student[field.key];
            var hasValue = value && String(value).trim().length > 0;
            
            if (hasValue) {
                sectionResult.totalFilled++;
                result.totalFilled++;
            } else {
                sectionResult.missingFields.push({
                    key: field.key,
                    label: field.label,
                    section: sectionKey
                });
                result.missingFields.push({
                    key: field.key,
                    label: field.label,
                    section: sectionKey,
                    sectionTitle: section.title,
                    sectionIcon: section.icon
                });
            }
        }
        
        // Kira peratus section
        if (sectionResult.totalRequired > 0) {
            sectionResult.percentage = Math.round((sectionResult.totalFilled / sectionResult.totalRequired) * 100);
        }
        
        result.sections[sectionKey] = sectionResult;
    }
    
    // Kira peratus overall
    if (result.totalRequired > 0) {
        result.overall = Math.round((result.totalFilled / result.totalRequired) * 100);
    }
    
    result.isComplete = result.overall === 100;
    
    return result;
}

/**
 * Get list of sections yang tak lengkap
 * @param {Object} completeness - Result dari checkStudentDataCompleteness
 * @returns {Array} List section
 */
function getIncompleteSections(completeness) {
    if (!completeness) return [];
    
    var incomplete = [];
    for (var key in completeness.sections) {
        var section = completeness.sections[key];
        if (section.percentage < 100) {
            incomplete.push({
                key: key,
                title: section.title,
                icon: section.icon,
                color: section.color,
                percentage: section.percentage,
                missing: section.missingFields.length
            });
        }
    }
    return incomplete;
}

console.log('✅ Parent Data Completion System loaded');

function savePathFirebase(path, value, callback) {
    if (!firebaseDb) {
        if (callback) callback(false);
        return;
    }
    firebaseDb.ref(path).set(value)
        .then(function () {
            // Sentiasa update lastUpdated bila ada save
            firebaseDb.ref('hafazanData/lastUpdated').set(Date.now());
            console.log('☁️ Saved to Firebase path:', path);
            if (callback) callback(true);
        })
        .catch(function (error) {
            console.error('⚠️ Firebase save error [' + path + ']:', error.message);
            if (callback) callback(false, error);
        });
}

function savePathSafely(path, localValue, callback) {
    if (!firebaseReady || !firebaseDb) {
        // Offline - simpan local sahaja
        localStorage.setItem('hafazanData', JSON.stringify(appData));
        if (callback) callback(true);
        return;
    }

    firebaseDb.ref(path).once('value')
        .then(function (snapshot) {
            // Guna data cloud sebagai base (bukan local lama)
            // localValue akan replace terus (caller bertanggungjawab bagi data betul)
            return firebaseDb.ref(path).set(localValue);
        })
        .then(function () {
            firebaseDb.ref('hafazanData/lastUpdated').set(Date.now());
            // Sync local cache
            localStorage.setItem('hafazanData', JSON.stringify(appData));
            console.log('☁️ Safely saved to Firebase path:', path);
            if (callback) callback(true);
        })
        .catch(function (error) {
            console.error('⚠️ Firebase safe save error [' + path + ']:', error.message);
            if (callback) callback(false, error);
        });
}

// ============================================================
// UTILITY: Escape HTML untuk elak XSS
// Guna bila render data user ke innerHTML
// ============================================================

/**
 * escapeHtml(str)
 * Convert aksara HTML special kepada entities yang selamat.
 * 
 * Contoh:
 *   escapeHtml('<script>alert(1)</script>')
 *   → '&lt;script&gt;alert(1)&lt;/script&gt;'
 * 
 * @param  {*}      str - Nilai yang nak di-escape (any type)
 * @return {string}     - String yang selamat untuk innerHTML
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================================
// UTILITY: Mask password untuk paparan
// Password disimpan plaintext dalam DB (known limitation)
// tapi JANGAN papar plaintext dalam UI tanpa sebab
// ============================================================

/**
 * maskPassword(pass)
 * Papar password sebagai asterisk, dengan toggle show/hide.
 * 
 * @param  {string} pass     - Password asal
 * @param  {string} fieldId  - ID unik untuk toggle (contoh: student.id)
 * @return {string}          - HTML string dengan mask + toggle button
 */
function maskPassword(pass, fieldId) {
    if (!pass) return '-';
    var safePass = escapeHtml(pass);
    var safeId = escapeHtml(fieldId || 'pass');
    var masked = '•'.repeat(Math.min(pass.length, 12)); // max 12 dots

    return '<span id="passDisplay_' + safeId + '">' + masked + '</span>' +
           '<button type="button" ' +
           'onclick="togglePasswordVisibility(\'' + safeId + '\', \'' + safePass + '\')" ' +
           'style="background:none;border:none;cursor:pointer;margin-left:6px;font-size:0.85rem;color:var(--primary);" ' +
           'title="Tunjuk/Sembunyi kata laluan">' +
           '👁</button>';
}

/**
 * togglePasswordVisibility(fieldId, pass)
 * Toggle antara masked dan plaintext.
 * Dipanggil oleh button dalam maskPassword().
 */
function togglePasswordVisibility(fieldId, pass) {
    var el = document.getElementById('passDisplay_' + fieldId);
    if (!el) return;

    if (el.dataset.shown === '1') {
        // Sembunyi semula
        el.textContent = '•'.repeat(Math.min(pass.length, 12));
        el.dataset.shown = '0';
    } else {
        // Tunjuk
        el.textContent = pass;
        el.dataset.shown = '1';

        // Auto-hide selepas 5 saat
        setTimeout(function() {
            if (el.dataset.shown === '1') {
                el.textContent = '•'.repeat(Math.min(pass.length, 12));
                el.dataset.shown = '0';
            }
        }, 5000);
    }
}