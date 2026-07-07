// ===== PUBLIC WEBSITE JS =====

// Mobile Navigation Toggle
function toggleMobileNav() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');

    if (toggle && menu) {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
    }
}

// Close mobile nav bila klik link
document.addEventListener('DOMContentLoaded', function() {
    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function() {
            var toggle = document.getElementById('navToggle');
            var menu = document.getElementById('navMenu');
            if (toggle && menu) {
                toggle.classList.remove('active');
                menu.classList.remove('active');
            }
        });
    }
});

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    var navbar = document.getElementById('homeNavbar');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== LANGUAGE TOGGLE =====
var homeCurrentLang = localStorage.getItem('homeLang') || 'ms';

var homeTranslations = {
    ms: {
        'nav.home': 'Utama',
        'nav.about': 'Tentang',
        'nav.programs': 'Program',
        'nav.gallery': 'Galeri',
        'nav.testimonials': 'Testimoni',
        'nav.contact': 'Hubungi',
        'nav.register': '📝 Daftar',
        'nav.login': '🔐 Login',
        'hero.since': 'Sejak 2014',
        'hero.title': 'Madrasah Tahfiz<br><span class="hero-title-accent">Pekan Sungai Buloh</span>',
        'hero.tagline': 'Membentuk Generasi Quran Cinta Sunnah',
        'hero.description': 'Pusat pembelajaran Al-Quran dan hafazan dengan pendekatan moden, dibimbing oleh ustaz/ustazah berpengalaman dan bertauliah.',
        'hero.btnRegister': '📝 Daftar Sekarang',
        'hero.btnLearn': '📖 Ketahui Lebih Lanjut',
        'hero.students': 'Pelajar',
        'hero.teachers': 'Ustaz/Ustazah',
        'hero.years': 'Tahun Pengalaman',
        'hero.cardTitle': 'Pendaftaran Dibuka',
        'hero.cardDesc': 'Sesi Ambilan Baru 2025',
        'hero.cardBtn': 'Daftar Sekarang →'
    },
    en: {
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.programs': 'Programs',
        'nav.gallery': 'Gallery',
        'nav.testimonials': 'Testimonials',
        'nav.contact': 'Contact',
        'nav.register': '📝 Register',
        'nav.login': '🔐 Login',
        'hero.since': 'Since 2014',
        'hero.title': 'Madrasah Tahfiz<br><span class="hero-title-accent">Pekan Sungai Buloh</span>',
        'hero.tagline': 'Nurturing Quran Generation, Loving Sunnah',
        'hero.description': 'Al-Quran learning and memorization center with modern approach, guided by experienced and qualified teachers.',
        'hero.btnRegister': '📝 Register Now',
        'hero.btnLearn': '📖 Learn More',
        'hero.students': 'Students',
        'hero.teachers': 'Teachers',
        'hero.years': 'Years Experience',
        'hero.cardTitle': 'Registration Open',
        'hero.cardDesc': 'New Intake 2025',
        'hero.cardBtn': 'Register Now →'
    }
};

function toggleHomeLang() {
    homeCurrentLang = homeCurrentLang === 'ms' ? 'en' : 'ms';
    localStorage.setItem('homeLang', homeCurrentLang);
    applyHomeTranslations();
}

function applyHomeTranslations() {
    var lang = homeTranslations[homeCurrentLang] || homeTranslations.ms;

    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
        var key = elements[i].getAttribute('data-i18n');
        if (lang[key]) {
            elements[i].innerHTML = lang[key];
        }
    }

    // Update lang button
    var btn = document.getElementById('homeLangBtn');
    if (btn) {
        btn.innerHTML = homeCurrentLang === 'ms' ? '🇲🇾 BM' : '🇬🇧 EN';
    }

    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', homeCurrentLang);
}

// Apply translations on load
document.addEventListener('DOMContentLoaded', applyHomeTranslations);

// ===== SMOOTH SCROLL =====
document.addEventListener('DOMContentLoaded', function() {
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchorLinks.length; i++) {
        anchorLinks[i].addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href === '#' || href.length <= 1) return;

            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
});

console.log('✅ Public website loaded');

// ===== STATS COUNTER ANIMATION =====
function animateCounter(element, target) {
    var duration = 2000;
    var start = 0;
    var increment = target / (duration / 16);
    var current = start;

    var counter = setInterval(function() {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(counter);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Trigger counters when stats section visible
var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            var counters = entry.target.querySelectorAll('[data-counter]');
            for (var i = 0; i < counters.length; i++) {
                if (!counters[i].dataset.animated) {
                    var target = parseInt(counters[i].getAttribute('data-counter'));
                    animateCounter(counters[i], target);
                    counters[i].dataset.animated = 'true';
                }
            }
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', function() {
    var statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }
});

// ===== UPDATE TRANSLATIONS =====
homeTranslations.ms = Object.assign(homeTranslations.ms, {
    // Stats
    'stats.students': 'Pelajar Aktif',
    'stats.teachers': 'Ustaz & Ustazah',
    'stats.khatam': 'Khatam Quran',
    'stats.years': 'Tahun Beroperasi',

    // About
    'about.badge': 'Tentang Kami',
    'about.title': 'Membentuk Generasi Quran<br><span class="section-title-accent">Cinta Sunnah</span>',
    'about.subtitle': 'Sejak 2014, kami komited memberikan pendidikan Al-Quran terbaik',
    'about.heading': 'Madrasah Tahfiz Pekan Sungai Buloh',
    'about.p1': 'Madrasah kami merupakan pusat pembelajaran Al-Quran yang ditubuhkan pada tahun 2014 dengan matlamat membentuk generasi yang menghafaz Al-Quran serta mencintai Sunnah Rasulullah ﷺ.',
    'about.p2': 'Kami menggunakan pendekatan moden dan tradisional dalam pengajaran, dibimbing oleh ustaz dan ustazah yang berpengalaman serta bertauliah dari institusi tahfiz terkemuka.',
    'about.f1Title': 'Pendekatan Sistematik',
    'about.f1Desc': 'Kurikulum tersusun dari Iqra\' hingga Khatam',
    'about.f2Title': 'Guru Bertauliah',
    'about.f2Desc': 'Pengajar berpengalaman & bertauliah',
    'about.f3Title': 'Persekitaran Kondusif',
    'about.f3Desc': 'Suasana pembelajaran yang selesa & islamik',
    'about.f4Title': 'Portal Ibu Bapa',
    'about.f4Desc': 'Pantau progress anak secara online',
    'about.visionTitle': 'Visi',
    'about.visionDesc': 'Menjadi pusat hafazan Al-Quran yang melahirkan huffaz dan huffazah yang berakhlak mulia.',
    'about.missionTitle': 'Misi',
    'about.missionDesc': 'Memberikan pendidikan Al-Quran berkualiti dengan pendekatan moden dan tradisional yang seimbang.',
    'about.valuesTitle': 'Nilai',
    'about.valuesDesc': 'Ikhlas, Sabar, Istiqamah, Tawadhu\' dan Cintakan Ilmu Al-Quran.',

    // Programs
    'programs.badge': 'Program Kami',
    'programs.title': 'Pelbagai Program<br><span class="section-title-accent">Untuk Semua Peringkat</span>',
    'programs.subtitle': 'Dari kanak-kanak hingga dewasa, kami ada kelas yang sesuai untuk anda',
    'programs.popular': '⭐ Popular',
    'programs.ctaTitle': 'Sertai Madrasah Kami Hari Ini!',
    'programs.ctaDesc': 'Pendaftaran dibuka sepanjang tahun',
    'programs.ctaBtn': '📝 Daftar Sekarang',

    // Program 1 - Iqra
    'prog.iqra.title': 'Kelas Iqra\'',
    'prog.iqra.desc': 'Asas pembelajaran Al-Quran dari Iqra\' 1 hingga Iqra\' 6. Sesuai untuk pemula dan kanak-kanak.',
    'prog.iqra.f1': 'Iqra\' 1-6 lengkap',
    'prog.iqra.f2': 'Tajwid asas',
    'prog.iqra.f3': 'Makhraj huruf',
    'prog.iqra.class': 'Kelas 1',

    // Program 2 - Asas
    'prog.asas.title': 'Al-Quran Asas',
    'prog.asas.desc': 'Pembelajaran Al-Quran dengan fokus tajwid yang lengkap. Lulusan Iqra\' atau yang sudah boleh baca.',
    'prog.asas.f1': 'Bacaan dengan tajwid',
    'prog.asas.f2': 'Khatam Al-Quran',
    'prog.asas.f3': 'Hafazan Surah Lazim',
    'prog.asas.class': 'Kelas 2',

    // Program 3 - Juz 30
    'prog.juz30.title': 'Hafazan Juz 30',
    'prog.juz30.desc': 'Hafazan Juz Amma (Juz 30) dengan kaedah talqin dan murajaah. Pelajar yang sudah lancar membaca Al-Quran.',
    'prog.juz30.f1': 'Khatam Juz 30',
    'prog.juz30.f2': 'Sabak baru harian',
    'prog.juz30.f3': 'Para sabak & murajaah',
    'prog.juz30.class': 'Kelas 3',

    // Program 4 - 5 Surah Pilihan
'prog.5surah.title': 'Hafazan 5 Surah Pilihan',
'prog.5surah.desc': 'Program hafazan khusus 5 surah pilihan yang penuh fadhilat dan keberkatan untuk amalan harian.',
'prog.5surah.f1': 'Surah Ya-Sin',
'prog.5surah.f2': 'Surah As-Sajdah',
'prog.5surah.f3': 'Surah Al-Mulk',
'prog.5surah.f4': 'Surah Ad-Dukhan',
'prog.5surah.f5': 'Surah Al-Waqi\'ah',
'prog.5surah.class': 'Kelas 4',

    // Program 5 - Lanjutan
    'prog.lanjutan.title': 'Hafazan Lanjutan',
    'prog.lanjutan.desc': 'Untuk pelajar yang sudah ada hafazan banyak juz. Target khatam 30 juz dengan kaedah intensif.',
    'prog.lanjutan.f1': 'Hafazan intensif',
    'prog.lanjutan.f2': 'Sistem mentor',
    'prog.lanjutan.f3': 'Pra-syahadah',
    'prog.lanjutan.class': 'Kelas 5',

    // Program 6 - Khatam
    'prog.khatam.title': 'Kelas Khatam',
    'prog.khatam.desc': 'Bagi pelajar yang sudah khatam 30 juz. Fokus pada pengukuhan hafazan dan persediaan syahadah.',
    'prog.khatam.f1': 'Khatam 30 juz',
    'prog.khatam.f2': 'Syahadah',
    'prog.khatam.f3': 'Sijil rasmi',
    'prog.khatam.class': 'Kelas 6'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    // Stats
    'stats.students': 'Active Students',
    'stats.teachers': 'Teachers',
    'stats.khatam': 'Quran Completion',
    'stats.years': 'Years Operating',

    // About
    'about.badge': 'About Us',
    'about.title': 'Nurturing Quran Generation<br><span class="section-title-accent">Loving Sunnah</span>',
    'about.subtitle': 'Since 2014, committed to providing the best Al-Quran education',
    'about.heading': 'Madrasah Tahfiz Pekan Sungai Buloh',
    'about.p1': 'Our madrasah is an Al-Quran learning center established in 2014 with the goal of nurturing a generation that memorizes the Al-Quran and loves the Sunnah of Prophet Muhammad ﷺ.',
    'about.p2': 'We use a combination of modern and traditional approaches in teaching, guided by experienced and qualified teachers from prominent tahfiz institutions.',
    'about.f1Title': 'Systematic Approach',
    'about.f1Desc': 'Structured curriculum from Iqra\' to completion',
    'about.f2Title': 'Qualified Teachers',
    'about.f2Desc': 'Experienced & certified instructors',
    'about.f3Title': 'Conducive Environment',
    'about.f3Desc': 'Comfortable & Islamic learning atmosphere',
    'about.f4Title': 'Parent Portal',
    'about.f4Desc': 'Monitor your child\'s progress online',
    'about.visionTitle': 'Vision',
    'about.visionDesc': 'To be a Quran memorization center that produces huffaz with noble character.',
    'about.missionTitle': 'Mission',
    'about.missionDesc': 'Providing quality Al-Quran education with a balanced modern and traditional approach.',
    'about.valuesTitle': 'Values',
    'about.valuesDesc': 'Sincerity, Patience, Consistency, Humility, and Love for Al-Quran Knowledge.',

    // Programs
    'programs.badge': 'Our Programs',
    'programs.title': 'Various Programs<br><span class="section-title-accent">For All Levels</span>',
    'programs.subtitle': 'From children to adults, we have classes suitable for everyone',
    'programs.popular': '⭐ Popular',
    'programs.ctaTitle': 'Join Our Madrasah Today!',
    'programs.ctaDesc': 'Registration open throughout the year',
    'programs.ctaBtn': '📝 Register Now',

    // Programs
    'prog.iqra.title': 'Iqra\' Class',
    'prog.iqra.desc': 'Foundation of Al-Quran learning from Iqra\' 1 to 6. Suitable for beginners and children.',
    'prog.iqra.f1': 'Complete Iqra\' 1-6',
    'prog.iqra.f2': 'Basic tajweed',
    'prog.iqra.f3': 'Letter pronunciation',
    'prog.iqra.class': 'Class 1',

    'prog.asas.title': 'Basic Al-Quran',
    'prog.asas.desc': 'Al-Quran learning focused on complete tajweed. For Iqra\' graduates or those who can already read.',
    'prog.asas.f1': 'Recitation with tajweed',
    'prog.asas.f2': 'Complete Al-Quran',
    'prog.asas.f3': 'Memorize Short Surahs',
    'prog.asas.class': 'Class 2',

    'prog.juz30.title': 'Juz 30 Memorization',
    'prog.juz30.desc': 'Memorizing Juz Amma (Juz 30) using talqin and murajaah methods. For fluent Al-Quran readers.',
    'prog.juz30.f1': 'Complete Juz 30',
    'prog.juz30.f2': 'Daily new memorization',
    'prog.juz30.f3': 'Para sabak & revision',
    'prog.juz30.class': 'Class 3',

    'prog.5surah.title': '5 Selected Surahs Memorization',
'prog.5surah.desc': 'Special program to memorize 5 selected surahs full of virtues and blessings for daily practice.',
'prog.5surah.f1': 'Surah Ya-Sin',
'prog.5surah.f2': 'Surah As-Sajdah',
'prog.5surah.f3': 'Surah Al-Mulk',
'prog.5surah.f4': 'Surah Ad-Dukhan',
'prog.5surah.f5': 'Surah Al-Waqi\'ah',
'prog.5surah.class': 'Class 4',

    'prog.lanjutan.title': 'Advanced Memorization',
    'prog.lanjutan.desc': 'For students with many juz memorized. Target full 30 juz with intensive method.',
    'prog.lanjutan.f1': 'Intensive memorization',
    'prog.lanjutan.f2': 'Mentor system',
    'prog.lanjutan.f3': 'Pre-syahadah',
    'prog.lanjutan.class': 'Class 5',

    'prog.khatam.title': 'Completion Class',
    'prog.khatam.desc': 'For students who completed 30 juz. Focus on strengthening memorization and syahadah preparation.',
    'prog.khatam.f1': 'Complete 30 juz',
    'prog.khatam.f2': 'Syahadah ceremony',
    'prog.khatam.f3': 'Official certificate',
    'prog.khatam.class': 'Class 6'
});

// Re-apply translations
if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== FIREBASE GALLERY LOADER =============
// ============================================

var firebaseConfig = {
    apiKey: "AIzaSyD-78HpBX9BYUjGEXZsyDsY7GqKZkzbv7Y",
    authDomain: "hafazan-madrasah.firebaseapp.com",
    databaseURL: "https://hafazan-madrasah-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hafazan-madrasah",
    storageBucket: "hafazan-madrasah.firebasestorage.app",
    messagingSenderId: "707178356175",
    appId: "1:707178356175:web:f93f9807c3d1645e5246ba"
};

var homeFirebaseDb = null;
var homeAllPhotos = [];
var homeFilteredPhotos = [];
var homeCurrentFilter = 'all';
var homeLightboxIndex = 0;

// Init Firebase
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            homeFirebaseDb = firebase.database();
            loadHomeGallery();
        }
    } catch (e) {
        console.log('Firebase init error:', e.message);
        showGalleryError();
    }
});

function loadHomeGallery() {
    if (!homeFirebaseDb) {
        showGalleryError();
        return;
    }

    homeFirebaseDb.ref('hafazanData/gallery').once('value')
        .then(function(snapshot) {
            var galleryData = snapshot.val();

            if (!galleryData || (Array.isArray(galleryData) && galleryData.length === 0)) {
                showGalleryEmpty();
                return;
            }

            // Convert ke array kalau bukan
            var albums = Array.isArray(galleryData) ? galleryData : Object.values(galleryData);

            // Flatten all photos from all albums
            homeAllPhotos = [];
            for (var i = 0; i < albums.length; i++) {
                var album = albums[i];
                if (!album || !album.photos) continue;

                for (var j = 0; j < album.photos.length; j++) {
                    var photo = album.photos[j];
                    homeAllPhotos.push({
                        url: photo.url || photo.displayUrl,
                        thumb: photo.thumb || photo.url,
                        albumTitle: album.title,
                        albumCategory: album.category,
                        albumDate: album.date,
                        albumLocation: album.location
                    });
                }
            }

            // Sort by date (newest first)
            homeAllPhotos.sort(function(a, b) {
                return new Date(b.albumDate || 0) - new Date(a.albumDate || 0);
            });

            // Show only first 12 by default
            homeFilteredPhotos = homeAllPhotos.slice(0, 12);
            renderHomeGallery();
        })
        .catch(function(error) {
            console.log('Gallery load error:', error.message);
            showGalleryError();
        });
}

function filterGalleryHome(category) {
    homeCurrentFilter = category;

    // Update active button
    var buttons = document.querySelectorAll('.gallery-filter-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    event.target.classList.add('active');

    // Filter photos
    if (category === 'all') {
        homeFilteredPhotos = homeAllPhotos.slice(0, 12);
    } else {
        homeFilteredPhotos = homeAllPhotos.filter(function(p) {
            return p.albumCategory === category;
        }).slice(0, 12);
    }

    renderHomeGallery();
}

function renderHomeGallery() {
    var container = document.getElementById('homeGalleryGrid');
    if (!container) return;

    if (homeFilteredPhotos.length === 0) {
        container.innerHTML = '<div class="gallery-empty">' +
            '<div class="gallery-empty-icon">📷</div>' +
            '<p>Tiada gambar untuk kategori ini</p>' +
            '</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < homeFilteredPhotos.length; i++) {
        var photo = homeFilteredPhotos[i];
        var dateStr = '';
        if (photo.albumDate) {
            var d = new Date(photo.albumDate);
            var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
            dateStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        }

        html += '<div class="home-gallery-item" onclick="openHomeLightbox(' + i + ')">';
        html += '<img src="' + (photo.thumb || photo.url) + '" alt="' + photo.albumTitle + '" loading="lazy">';
        html += '<div class="home-gallery-overlay">';
        if (photo.albumCategory) {
            html += '<span class="home-gallery-category">' + photo.albumCategory + '</span>';
        }
        html += '<div class="home-gallery-title">' + photo.albumTitle + '</div>';
        if (dateStr) {
            html += '<div class="home-gallery-date">📅 ' + dateStr + '</div>';
        }
        html += '</div>';
        html += '</div>';
    }

    container.innerHTML = html;
}

function showGalleryEmpty() {
    var container = document.getElementById('homeGalleryGrid');
    if (!container) return;

    container.innerHTML = '<div class="gallery-empty">' +
        '<div class="gallery-empty-icon">📸</div>' +
        '<p>Galeri akan dikemaskini tidak lama lagi</p>' +
        '</div>';
}

function showGalleryError() {
    var container = document.getElementById('homeGalleryGrid');
    if (!container) return;

    container.innerHTML = '<div class="gallery-empty">' +
        '<div class="gallery-empty-icon">⚠️</div>' +
        '<p>Gagal memuat galeri. Sila cuba lagi.</p>' +
        '</div>';
}

// ===== LIGHTBOX =====

function openHomeLightbox(index) {
    homeLightboxIndex = index;
    var lightbox = document.getElementById('homeLightbox');
    if (lightbox) {
        lightbox.classList.remove('hidden');
        showHomeLightboxImage();
        document.body.style.overflow = 'hidden';
    }
}

function closeHomeLightbox() {
    var lightbox = document.getElementById('homeLightbox');
    if (lightbox) {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function showHomeLightboxImage() {
    if (homeFilteredPhotos.length === 0) return;

    var photo = homeFilteredPhotos[homeLightboxIndex];
    var img = document.getElementById('homeLightboxImage');
    var title = document.getElementById('homeLightboxTitle');
    var counter = document.getElementById('homeLightboxCounter');

    if (img) img.src = photo.url;
    if (title) title.textContent = photo.albumTitle;
    if (counter) counter.textContent = (homeLightboxIndex + 1) + ' / ' + homeFilteredPhotos.length;
}

function homeLightboxPrev() {
    homeLightboxIndex = (homeLightboxIndex - 1 + homeFilteredPhotos.length) % homeFilteredPhotos.length;
    showHomeLightboxImage();
}

function homeLightboxNext() {
    homeLightboxIndex = (homeLightboxIndex + 1) % homeFilteredPhotos.length;
    showHomeLightboxImage();
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    var lightbox = document.getElementById('homeLightbox');
    if (lightbox && !lightbox.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') homeLightboxPrev();
        else if (e.key === 'ArrowRight') homeLightboxNext();
        else if (e.key === 'Escape') closeHomeLightbox();
    }
});

// ===== UPDATE TRANSLATIONS =====
homeTranslations.ms = Object.assign(homeTranslations.ms, {
    // Gallery
    'gallery.badge': 'Galeri Aktiviti',
    'gallery.title': 'Saksikan Aktiviti<br><span class="section-title-accent">Pelajar Kami</span>',
    'gallery.subtitle': 'Pelbagai aktiviti pembelajaran, majlis dan acara madrasah',
    'gallery.all': '📷 Semua',
    'gallery.khatam': '🎓 Khatam',
    'gallery.daily': '📚 Harian',
    'gallery.sports': '⚽ Sukan',
    'gallery.trip': '🚌 Lawatan',
    'gallery.raya': '🎉 Hari Raya',
    'gallery.loading': 'Memuat gambar...',
    'gallery.cta': 'Lihat lebih banyak gambar dan aktiviti kami',
    'gallery.ctaBtn': '📂 Akses Penuh Galeri',

    // Testimonials
    'test.badge': 'Testimoni',
    'test.title': 'Kata-kata Mereka<br><span class="section-title-accent">Tentang Kami</span>',
    'test.subtitle': 'Pengalaman sebenar dari ibu bapa dan pelajar madrasah',
    'test.1': 'Anak saya sudah khatam Juz 30 dalam masa setahun di sini. Ustaz dan ustazah sangat sabar dan dedicated mengajar. Alhamdulillah!',
    'test.1role': 'Bapa Pelajar Kelas 3',
    'test.2': 'Saya gembira melihat perubahan akhlak anak saya selepas menyertai madrasah ini. Bukan setakat hafazan, tapi adab dan akhlak juga dibentuk.',
    'test.2role': 'Ibu Pelajar Kelas 2',
    'test.3': 'Portal ibu bapa sangat membantu! Saya boleh pantau progress anak saya setiap hari, lihat markah dan ulasan ustaz. Sangat moden dan efisien!',
    'test.3role': 'Bapa Pelajar Kelas 4',
    'test.4': 'Suasana madrasah yang Islamik dan bersih. Anak-anak seronok belajar. Yuran berpatutan untuk kualiti pendidikan yang diberikan.',
    'test.4role': 'Ibu 2 Pelajar',
    'test.5': 'Saya sendiri pelajar di sini. Ustaz mengajar dengan cara yang seronok, bukan paksa-paksa. Saya cepat hafal dan suka datang ke kelas setiap hari.',
    'test.5role': 'Pelajar Kelas 3',
    'test.6': 'Sistem pendidikan yang tersusun. Dari Iqra\' sampai Khatam Quran, semua ada. Kami sebagai ibu bapa sangat berpuas hati. Highly recommended!',
    'test.6role': 'Bapa Pelajar Kelas 5'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    // Gallery
    'gallery.badge': 'Activity Gallery',
    'gallery.title': 'Witness Our<br><span class="section-title-accent">Student Activities</span>',
    'gallery.subtitle': 'Various learning activities, events and madrasah programs',
    'gallery.all': '📷 All',
    'gallery.khatam': '🎓 Khatam',
    'gallery.daily': '📚 Daily',
    'gallery.sports': '⚽ Sports',
    'gallery.trip': '🚌 Field Trip',
    'gallery.raya': '🎉 Eid',
    'gallery.loading': 'Loading images...',
    'gallery.cta': 'See more photos and activities',
    'gallery.ctaBtn': '📂 Full Gallery Access',

    // Testimonials
    'test.badge': 'Testimonials',
    'test.title': 'What They Say<br><span class="section-title-accent">About Us</span>',
    'test.subtitle': 'Real experiences from parents and students',
    'test.1': 'My son completed Juz 30 within a year here. The teachers are very patient and dedicated. Alhamdulillah!',
    'test.1role': 'Parent of Class 3 Student',
    'test.2': 'I\'m happy to see the change in my child\'s manners after joining this madrasah. Not just memorization, but character building too.',
    'test.2role': 'Mother of Class 2 Student',
    'test.3': 'The parent portal is very helpful! I can monitor my child\'s progress daily, see marks and teacher reviews. Very modern and efficient!',
    'test.3role': 'Parent of Class 4 Student',
    'test.4': 'Islamic and clean madrasah atmosphere. Children love learning. Affordable fees for the quality of education provided.',
    'test.4role': 'Mother of 2 Students',
    'test.5': 'I\'m a student here myself. The teachers teach in a fun way, not forced. I memorize quickly and love coming to class daily.',
    'test.5role': 'Class 3 Student',
    'test.6': 'Well-organized education system. From Iqra\' to Quran completion, everything is here. We parents are very satisfied. Highly recommended!',
    'test.6role': 'Parent of Class 5 Student'
});

// Re-apply translations
if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== FAQ TOGGLE ==========================
// ============================================

function toggleFaq(btn) {
    var item = btn.parentElement;
    var isActive = item.classList.contains('active');

    // Close all FAQ items
    var allItems = document.querySelectorAll('.faq-item');
    for (var i = 0; i < allItems.length; i++) {
        allItems[i].classList.remove('active');
    }

    // Toggle current
    if (!isActive) {
        item.classList.add('active');
    }
}

// ============================================
// ===== BACK TO TOP ==========================
// ============================================

window.addEventListener('scroll', function() {
    var backBtn = document.getElementById('backToTop');
    if (!backBtn) return;

    if (window.scrollY > 500) {
        backBtn.classList.add('visible');
    } else {
        backBtn.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// ===== UPDATE TRANSLATIONS =================
// ============================================


homeTranslations.ms = Object.assign(homeTranslations.ms, {
    // FAQ
    'faq.badge': 'Soalan Lazim',
    'faq.title': 'Soalan Yang Sering<br><span class="section-title-accent">Ditanya</span>',
    'faq.subtitle': 'Jawapan untuk soalan yang biasa ditanya oleh ibu bapa',
    'faq.q1': 'Berapa umur minimum untuk daftar?',
    'faq.a1': 'Umur minimum adalah 4 tahun untuk kelas Iqra\'. Untuk kelas hafazan, pelajar perlu sudah boleh membaca Al-Quran dengan lancar.',
    'faq.q2': 'Berapa yuran bulanan?',
    'faq.a2': 'Yuran bulanan adalah RM300 dengan yuran pendaftaran sekali sahaja RM100 untuk pelajar baru. Yuran ini termasuk bahan pembelajaran asas.',
    'faq.q3': 'Apakah waktu kelas?',
    'faq.a3': 'Madrasah beroperasi Isnin hingga Jumaat, 8AM hingga 9PM. Kami menawarkan 3 sesi: Pagi (8AM-11AM), Petang (2PM-5PM), dan Malam (7PM-9PM). Pilih mengikut keselesaan anda.',
    'faq.q4': 'Bagaimana cara mendaftar?',
    'faq.a4': 'Pendaftaran sangat mudah! Klik butang "Daftar" di atas, isi borang online, dan kami akan menghubungi anda dalam masa 24 jam untuk penilaian dan penempatan kelas yang sesuai.',
    'faq.q5': 'Bolehkah ibu bapa pantau progress anak?',
    'faq.a5': 'Ya! Setiap ibu bapa diberikan akses ke Portal Ibu Bapa untuk pantau rekod hafazan, kehadiran, pembayaran, dan progress anak secara real-time. Login dibekalkan selepas pendaftaran.',
    'faq.q6': 'Adakah kelas dipisahkan lelaki & perempuan?',
    'faq.a6': 'Ya, kami mengikut adab Islam. Kelas pelajar lelaki diajar oleh ustaz, manakala pelajar perempuan diajar oleh ustazah. Persekitaran yang kondusif dan selesa untuk semua.',
    'faq.q7': 'Apa beza dengan madrasah lain?',
    'faq.a7': 'Kami menggabungkan kaedah tradisional (talqin, musyafahah) dengan teknologi moden (portal online, tracking progress). Saiz kelas kecil untuk perhatian individu. Pengalaman 10+ tahun mengeluarkan huffaz.',
    'faq.q8': 'Adakah sijil khatam diberikan?',
    'faq.a8': 'Ya! Setiap pelajar yang khatam akan menerima sijil rasmi dari madrasah. Untuk khatam 30 juz, kami adakan majlis khatam khas dengan kehadiran keluarga dan jemputan.',

    // Contact
    'contact.badge': 'Hubungi Kami',
    'contact.title': 'Mari Berhubung<br><span style="color:#fbbf24;">Dengan Kami</span>',
    'contact.subtitle': 'Kami sedia membantu sebarang pertanyaan anda',
    'contact.addr': 'Alamat',
    'contact.phone': 'Telefon',
    'contact.mudir': 'Mudir:',
    'contact.hours': 'Waktu Operasi',
    'contact.weekday': 'Isnin - Jumaat:',
    'contact.weekend': 'Sabtu - Ahad:',
    'contact.closed': 'Tutup',
    'contact.waTitle': 'WhatsApp Kami',
    'contact.waDesc': 'Klik untuk mesej terus ke Mudir',
    'contact.regTitle': 'Daftar Online',
    'contact.regDesc': 'Isi borang pendaftaran dengan mudah',
    'contact.mapTitle': 'Lokasi Madrasah',
    'contact.mapDesc': 'Lihat di Google Maps',

    // Footer
    'footer.desc': 'Pusat pembelajaran Al-Quran dan hafazan terkemuka di Jeram, Selangor. Membentuk generasi Quran cinta Sunnah sejak 2014.',
    'footer.linksTitle': 'Pautan Pantas',
    'footer.progTitle': 'Program Kami',
    'footer.contactTitle': 'Hubungi Kami',
    'footer.faq': 'FAQ',
    'footer.hours': 'Isnin - Jumaat<br>8:00 AM - 9:00 PM',
    'footer.rights': 'Hak cipta terpelihara.',
    'footer.waTooltip': 'Hubungi Kami'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    // FAQ
    'faq.badge': 'Frequently Asked Questions',
    'faq.title': 'Frequently Asked<br><span class="section-title-accent">Questions</span>',
    'faq.subtitle': 'Answers to questions commonly asked by parents',
    'faq.q1': 'What is the minimum age for registration?',
    'faq.a1': 'Minimum age is 4 years old for Iqra\' class. For memorization classes, students need to be able to read Al-Quran fluently.',
    'faq.q2': 'How much is the monthly fee?',
    'faq.a2': 'Monthly fee is RM300 with a one-time registration fee of RM100 for new students. This includes basic learning materials.',
    'faq.q3': 'What are the class hours?',
    'faq.a3': 'Madrasah operates Monday to Friday, 8AM to 9PM. We offer 3 sessions: Morning (8AM-11AM), Afternoon (2PM-5PM), and Evening (7PM-9PM). Choose what suits you best.',
    'faq.q4': 'How do I register?',
    'faq.a4': 'Registration is very easy! Click the "Register" button above, fill in the online form, and we will contact you within 24 hours for assessment and suitable class placement.',
    'faq.q5': 'Can parents monitor child\'s progress?',
    'faq.a5': 'Yes! Every parent is given access to the Parent Portal to monitor memorization records, attendance, payments, and child\'s progress in real-time. Login is provided after registration.',
    'faq.q6': 'Are classes separated by gender?',
    'faq.a6': 'Yes, we follow Islamic adab. Male students are taught by male teachers, while female students are taught by female teachers. Conducive and comfortable environment for all.',
    'faq.q7': 'What\'s different from other madrasah?',
    'faq.a7': 'We combine traditional methods (talqin, musyafahah) with modern technology (online portal, progress tracking). Small class sizes for individual attention. 10+ years experience producing huffaz.',
    'faq.q8': 'Are completion certificates given?',
    'faq.a8': 'Yes! Every student who completes will receive an official certificate from the madrasah. For 30 juz completion, we hold a special ceremony with family and invited guests.',

    // Contact
    'contact.badge': 'Contact Us',
    'contact.title': 'Let\'s Connect<br><span style="color:#fbbf24;">With Us</span>',
    'contact.subtitle': 'We are ready to help with any of your questions',
    'contact.addr': 'Address',
    'contact.phone': 'Phone',
    'contact.mudir': 'Mudir:',
    'contact.hours': 'Operating Hours',
    'contact.weekday': 'Monday - Friday:',
    'contact.weekend': 'Saturday - Sunday:',
    'contact.closed': 'Closed',
    'contact.waTitle': 'WhatsApp Us',
    'contact.waDesc': 'Click to message Mudir directly',
    'contact.regTitle': 'Register Online',
    'contact.regDesc': 'Fill in the registration form easily',
    'contact.mapTitle': 'Our Location',
    'contact.mapDesc': 'View on Google Maps',

    // Footer
    'footer.desc': 'Leading Al-Quran learning and memorization center in Jeram, Selangor. Nurturing Quran generation loving Sunnah since 2014.',
    'footer.linksTitle': 'Quick Links',
    'footer.progTitle': 'Our Programs',
    'footer.contactTitle': 'Contact Us',
    'footer.faq': 'FAQ',
    'footer.hours': 'Monday - Friday<br>8:00 AM - 9:00 PM',
    'footer.rights': 'All rights reserved.',
    'footer.waTooltip': 'Contact Us'
});

// Re-apply translations
if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

console.log('✅ Public website fully loaded');

// Translations untuk hero baru
homeTranslations.ms['hero.regOpen'] = 'Dibuka';
homeTranslations.ms['hero.intake'] = 'Ambilan 2025';
homeTranslations.ms['hero.scroll'] = 'Scroll Bawah';

homeTranslations.en['hero.regOpen'] = 'Open';
homeTranslations.en['hero.intake'] = '2025 Intake';
homeTranslations.en['hero.scroll'] = 'Scroll Down';

// Re-apply translations
if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== TEAM SECTION TRANSLATIONS ============
// ============================================

homeTranslations.ms = Object.assign(homeTranslations.ms, {
    'nav.team': 'Guru',
    'team.badge': 'Pasukan Kami',
    'team.title': 'Diajar Oleh Ustaz<br><span class="section-title-accent">& Ustazah Bertauliah</span>',
    'team.subtitle': 'Pengajar berpengalaman dengan latar belakang pendidikan tahfiz dari institusi terkemuka',
    'team.mudir': '👑 Mudir',

    // Mudir
    'team.1role': 'Mudir / Pengetua',
    'team.1edu': 'Hafiz 30 Juz',
    'team.1exp': '15+ Tahun',
    'team.1bio': 'Pengasas madrasah dengan pengalaman luas dalam pendidikan tahfiz Al-Quran. Mengabdikan diri untuk melahirkan generasi huffaz.',
    'team.1s1': 'Hafazan Lanjutan',
    'team.1s2': 'Tajwid',

    // Ustaz Hisyam
    'team.2role': 'Ustaz Senior',
    'team.2edu': 'Hafiz 30 Juz',
    'team.2exp': '10+ Tahun',
    'team.2bio': 'Ustaz senior yang pakar dalam pengajaran hafazan dengan kaedah talqin dan musyafahah untuk pelajar pelbagai peringkat.',
    'team.2s1': 'Hafazan Juz 30',
    'team.2s2': 'Murajaah',

    // Ustazah Hafizah
    'team.3role': 'Ustazah Senior',
    'team.3edu': 'Hafizah 30 Juz',
    'team.3exp': '8+ Tahun',
    'team.3bio': 'Ustazah berpengalaman mengajar pelajar perempuan dengan pendekatan mesra dan penyabar. Pakar dalam tajwid.',
    'team.3s1': 'Kelas Perempuan',
    'team.3s2': 'Tajwid',

    // Ustaz Muhammad
    'team.4role': 'Ustaz Hafazan',
    'team.4edu': 'Hafiz 30 Juz',
    'team.4exp': '5+ Tahun',
    'team.4bio': 'Ustaz muda yang energetic dalam mengajar kelas Iqra\' dan asas Al-Quran untuk kanak-kanak.',
    'team.4s1': 'Kelas Iqra\'',
    'team.4s2': 'Asas Quran',

    // Ustazah Aminah
    'team.5role': 'Ustazah Iqra\'',
    'team.5edu': 'Diploma Tahfiz',
    'team.5exp': '3+ Tahun',
    'team.5bio': 'Ustazah yang penyabar dan pakar dalam mengajar kanak-kanak perempuan dari Iqra\' hingga lancar membaca Al-Quran.',
    'team.5s1': 'Iqra\' Perempuan',
    'team.5s2': 'Tajwid Asas',

    // Ustaz Abdullah
    'team.6role': 'Ustaz Khatam',
    'team.6edu': 'Hafiz Sanad',
    'team.6exp': '12+ Tahun',
    'team.6bio': 'Ustaz berpengalaman dengan sanad bacaan. Pakar dalam pengukuhan hafazan dan persediaan syahadah 30 juz.',
    'team.6s1': 'Khatam 30 Juz',
    'team.6s2': 'Syahadah',

    // CTA
    'team.ctaTitle': 'Bersedia Untuk Berkenalan?',
    'team.ctaDesc': 'Hubungi kami untuk lawatan atau temujanji dengan ustaz'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    'nav.team': 'Teachers',
    'team.badge': 'Our Team',
    'team.title': 'Taught By Certified<br><span class="section-title-accent">Ustaz & Ustazah</span>',
    'team.subtitle': 'Experienced teachers with educational backgrounds from prominent tahfiz institutions',
    'team.mudir': '👑 Principal',

    // Mudir
    'team.1role': 'Mudir / Principal',
    'team.1edu': 'Hafiz 30 Juz',
    'team.1exp': '15+ Years',
    'team.1bio': 'Madrasah founder with extensive experience in tahfiz education. Dedicated to producing a generation of huffaz.',
    'team.1s1': 'Advanced Memorization',
    'team.1s2': 'Tajweed',

    // Ustaz Hisyam
    'team.2role': 'Senior Ustaz',
    'team.2edu': 'Hafiz 30 Juz',
    'team.2exp': '10+ Years',
    'team.2bio': 'Senior ustaz specializing in memorization teaching with talqin and musyafahah methods for students of various levels.',
    'team.2s1': 'Juz 30 Memorization',
    'team.2s2': 'Revision',

    // Ustazah Hafizah
    'team.3role': 'Senior Ustazah',
    'team.3edu': 'Hafizah 30 Juz',
    'team.3exp': '8+ Years',
    'team.3bio': 'Experienced ustazah teaching female students with friendly and patient approach. Expert in tajweed.',
    'team.3s1': 'Female Classes',
    'team.3s2': 'Tajweed',

    // Ustaz Muhammad
    'team.4role': 'Memorization Ustaz',
    'team.4edu': 'Hafiz 30 Juz',
    'team.4exp': '5+ Years',
    'team.4bio': 'Energetic young ustaz teaching Iqra\' classes and basic Al-Quran for children.',
    'team.4s1': 'Iqra\' Class',
    'team.4s2': 'Quran Basics',

    // Ustazah Aminah
    'team.5role': 'Iqra\' Ustazah',
    'team.5edu': 'Tahfiz Diploma',
    'team.5exp': '3+ Years',
    'team.5bio': 'Patient ustazah specializing in teaching young girls from Iqra\' to fluent Al-Quran reading.',
    'team.5s1': 'Female Iqra\'',
    'team.5s2': 'Basic Tajweed',

    // Ustaz Abdullah
    'team.6role': 'Completion Ustaz',
    'team.6edu': 'Hafiz with Sanad',
    'team.6exp': '12+ Years',
    'team.6bio': 'Experienced ustaz with recitation sanad. Specializes in memorization reinforcement and 30 juz syahadah preparation.',
    'team.6s1': '30 Juz Completion',
    'team.6s2': 'Syahadah',

    // CTA
    'team.ctaTitle': 'Ready to Meet Us?',
    'team.ctaDesc': 'Contact us for a visit or appointment with our teachers'
});

// Re-apply translations
if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== YURAN SECTION TRANSLATIONS ===========
// ============================================

homeTranslations.ms = Object.assign(homeTranslations.ms, {
    'nav.yuran': 'Yuran',
    'yuran.badge': 'Yuran & Bayaran',
    'yuran.title': 'Yuran Berpatutan<br><span style="background:linear-gradient(135deg,#fbbf24,#fde68a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Telus & Transparent</span>',
    'yuran.subtitle': 'Tiada caj tersembunyi. Bayaran berbaloi untuk masa depan anak anda',
    'yuran.popular': '⭐ Paling Popular',
    'yuran.once': '/sekali',
    'yuran.month': '/bulan',
    'yuran.khatamPeriod': '/khatam',

    // Registration
    'yuran.regTitle': 'Yuran Pendaftaran',
    'yuran.regSub': 'Sekali sahaja untuk pelajar baru',
    'yuran.reg1': 'Pendaftaran rasmi',
    'yuran.reg2': 'Buku rekod pelajar',
    'yuran.reg3': 'Akses Portal Ibu Bapa',
    'yuran.reg4': 'Penilaian awal pelajar',

    // Monthly
    'yuran.monthTitle': 'Yuran Bulanan',
    'yuran.monthSub': 'Untuk semua kelas dan peringkat',
    'yuran.m1': 'Kelas hafazan harian',
    'yuran.m2': 'Bahan pembelajaran asas',
    'yuran.m3': 'Bimbingan ustaz/ustazah',
    'yuran.m4': 'Laporan progress mingguan',
    'yuran.m5': 'Pilihan sesi (Pagi/Petang/Malam)',
    'yuran.m6': 'Akses Portal Ibu Bapa 24/7',

    // Khatam
    'yuran.khatamTitle': 'Pakej Khatam',
    'yuran.khatamSub': 'Termasuk majlis & sijil rasmi',
    'yuran.k1': 'Majlis khatam rasmi',
    'yuran.k2': 'Sijil khatam',
    'yuran.k3': 'Jubah graduasi',
    'yuran.k4': 'Album foto majlis',

    // Discount
    'yuran.discountTitle': 'Diskaun Adik-Beradik!',
    'yuran.discountDesc': 'Daftar <strong>2 anak ke atas</strong> dapat diskaun <strong>RM50/bulan</strong> setiap anak ke-2 dan seterusnya.',
    'yuran.perChild': '/anak',

    // Payment
    'yuran.paymentTitle': '💳 Cara Pembayaran',
    'yuran.cash': 'Tunai',
    'yuran.cashDesc': 'Bayar di pejabat madrasah',
    'yuran.bank': 'Bank Transfer',
    'yuran.bankDesc': 'Pindahan ke akaun rasmi',
    'yuran.online': 'Online Banking',
    'yuran.onlineDesc': 'FPX / DuitNow',
    'yuran.ewallet': 'E-Wallet',
    'yuran.ewalletDesc': 'Touch n Go, GrabPay, dll',

    // Info
    'yuran.info1Title': 'Bayaran Bulanan',
    'yuran.info1Desc': 'Dibayar sebelum 10hb setiap bulan',
    'yuran.info2Title': 'Resit Rasmi',
    'yuran.info2Desc': 'Setiap bayaran dapat resit & invois',
    'yuran.info3Title': 'Tiada Caj Tersembunyi',
    'yuran.info3Desc': 'Yuran yang dipaparkan adalah harga sebenar',
    'yuran.info4Title': 'Bantuan Tersedia',
    'yuran.info4Desc': 'Hubungi kami untuk bincang pilihan bayaran',

    // CTA
    'yuran.ctaTitle': 'Bersedia Untuk Mendaftar?',
    'yuran.ctaDesc': 'Mulakan perjalanan hafazan anak anda hari ini',
    'yuran.ctaBtn1': 'Daftar Sekarang',
    'yuran.ctaBtn2': 'Tanya Yuran'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    'nav.yuran': 'Fees',
    'yuran.badge': 'Fees & Payment',
    'yuran.title': 'Affordable Fees<br><span style="background:linear-gradient(135deg,#fbbf24,#fde68a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Transparent & Clear</span>',
    'yuran.subtitle': 'No hidden charges. Worth every payment for your child\'s future',
    'yuran.popular': '⭐ Most Popular',
    'yuran.once': '/once',
    'yuran.month': '/month',
    'yuran.khatamPeriod': '/completion',

    // Registration
    'yuran.regTitle': 'Registration Fee',
    'yuran.regSub': 'One-time payment for new students',
    'yuran.reg1': 'Official registration',
    'yuran.reg2': 'Student record book',
    'yuran.reg3': 'Parent Portal access',
    'yuran.reg4': 'Initial student assessment',

    // Monthly
    'yuran.monthTitle': 'Monthly Fee',
    'yuran.monthSub': 'For all classes and levels',
    'yuran.m1': 'Daily memorization classes',
    'yuran.m2': 'Basic learning materials',
    'yuran.m3': 'Teacher guidance',
    'yuran.m4': 'Weekly progress reports',
    'yuran.m5': 'Session options (Morning/Afternoon/Evening)',
    'yuran.m6': '24/7 Parent Portal access',

    // Khatam
    'yuran.khatamTitle': 'Completion Package',
    'yuran.khatamSub': 'Includes ceremony & official certificate',
    'yuran.k1': 'Official khatam ceremony',
    'yuran.k2': 'Completion certificate',
    'yuran.k3': 'Graduation robe',
    'yuran.k4': 'Event photo album',

    // Discount
    'yuran.discountTitle': 'Sibling Discount!',
    'yuran.discountDesc': 'Register <strong>2 or more children</strong> and get <strong>RM50/month</strong> discount for 2nd child onwards.',
    'yuran.perChild': '/child',

    // Payment
    'yuran.paymentTitle': '💳 Payment Methods',
    'yuran.cash': 'Cash',
    'yuran.cashDesc': 'Pay at madrasah office',
    'yuran.bank': 'Bank Transfer',
    'yuran.bankDesc': 'Transfer to official account',
    'yuran.online': 'Online Banking',
    'yuran.onlineDesc': 'FPX / DuitNow',
    'yuran.ewallet': 'E-Wallet',
    'yuran.ewalletDesc': 'Touch n Go, GrabPay, etc',

    // Info
    'yuran.info1Title': 'Monthly Payment',
    'yuran.info1Desc': 'Paid before 10th of each month',
    'yuran.info2Title': 'Official Receipt',
    'yuran.info2Desc': 'Every payment gets receipt & invoice',
    'yuran.info3Title': 'No Hidden Charges',
    'yuran.info3Desc': 'Displayed fees are the actual price',
    'yuran.info4Title': 'Help Available',
    'yuran.info4Desc': 'Contact us to discuss payment options',

    // CTA
    'yuran.ctaTitle': 'Ready to Register?',
    'yuran.ctaDesc': 'Start your child\'s memorization journey today',
    'yuran.ctaBtn1': 'Register Now',
    'yuran.ctaBtn2': 'Ask About Fees'
});

// Re-apply translations
if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== EVENTS SECTION TRANSLATIONS ==========
// ============================================

homeTranslations.ms = Object.assign(homeTranslations.ms, {
    'nav.events': 'Acara',
    'events.badge': 'Acara Akan Datang',
    'events.title': 'Sertai Aktiviti<br><span class="section-title-accent">& Acara Madrasah</span>',
    'events.subtitle': 'Pelbagai program istimewa untuk pelajar dan komuniti',
    'events.special': '⭐ Acara Istimewa',
    'events.upcoming': '📌 Acara Lain Yang Akan Datang',

    // Months
    'events.month1': 'Jan',
    'events.month2': 'Feb',
    'events.month3': 'Mac',
    'events.month4': 'Apr',
    'events.month5': 'Mei',
    'events.month6': 'Jun',
    'events.month7': 'Jul',
    'events.month8': 'Ogo',
    'events.month9': 'Sep',
    'events.month10': 'Okt',
    'events.month11': 'Nov',
    'events.month12': 'Dis',

    // Featured Event
    'events.feat.title': 'Program Tadarus Ramadhan 2025',
    'events.feat.desc': 'Program tadarus Al-Quran sepanjang bulan Ramadhan dengan ustaz/ustazah madrasah. Dibuka untuk pelajar dan komuniti. Sertai kami untuk meraih keberkatan Ramadhan!',
    'events.feat.dateLabel': 'Tarikh',
    'events.feat.date': '1 Mac - 30 Mac 2025',
    'events.feat.timeLabel': 'Masa',
    'events.feat.time': 'Selepas Tarawih (9:30 PM)',
    'events.feat.locLabel': 'Lokasi',
    'events.feat.loc': 'Surau Madrasah Tahfiz',
    'events.feat.btn': 'Daftar Sekarang',

    // Categories
    'events.category.class': '📚 Kelas',
    'events.category.event': '🎉 Majlis',
    'events.category.activity': '🌟 Aktiviti',
    'events.category.meeting': '👨‍👩‍👧 Perjumpaan',
    'events.category.holiday': '🏖️ Cuti',
    'events.category.special': '⭐ Sambutan',

    // Event 1
    'events.1.title': 'Sesi Penilaian Pelajar Baru',
    'events.1.desc': 'Penilaian tahap bacaan & penempatan kelas yang sesuai untuk pelajar baru.',

    // Event 2
    'events.2.title': 'Majlis Khatam Quran Sesi 1/2025',
    'events.2.desc': 'Majlis khatam Al-Quran untuk pelajar yang telah menyempurnakan hafazan 30 juz.',

    // Event 3
    'events.3.title': 'Pertandingan Tilawah Antara Kelas',
    'events.3.desc': 'Pertandingan tilawah Al-Quran untuk pelajar semua peringkat dengan hadiah menarik.',

    // Event 4
    'events.4.title': 'Perjumpaan Ibu Bapa',
    'events.4.desc': 'Perbincangan progress pelajar bersama ustaz/ustazah dan perkongsian maklumat penting.',

    // Event 5
    'events.5.title': 'Cuti Pertengahan Tahun',
    'events.5.desc': 'Madrasah akan tutup untuk cuti pertengahan tahun. Kelas akan disambung semula pada 1 Julai.',

    // Event 6
    'events.6.title': 'Sambutan Hari Kemerdekaan',
    'events.6.desc': 'Sambutan khas dengan ceramah agama dan persembahan dari pelajar madrasah.',

    // CTA
    'events.ctaTitle': '🔔 Jangan Terlepas Update!',
    'events.ctaDesc': 'Follow kami untuk update terkini acara dan aktiviti madrasah',
    'events.ctaBtn1': 'Hubungi Kami',
    'events.ctaBtn2': 'Maklumat Lanjut'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    'nav.events': 'Events',
    'events.badge': 'Upcoming Events',
    'events.title': 'Join Our Activities<br><span class="section-title-accent">& Madrasah Events</span>',
    'events.subtitle': 'Various special programs for students and community',
    'events.special': '⭐ Special Event',
    'events.upcoming': '📌 Other Upcoming Events',

    // Months
    'events.month1': 'Jan',
    'events.month2': 'Feb',
    'events.month3': 'Mar',
    'events.month4': 'Apr',
    'events.month5': 'May',
    'events.month6': 'Jun',
    'events.month7': 'Jul',
    'events.month8': 'Aug',
    'events.month9': 'Sep',
    'events.month10': 'Oct',
    'events.month11': 'Nov',
    'events.month12': 'Dec',

    // Featured Event
    'events.feat.title': 'Ramadhan Tadarus Program 2025',
    'events.feat.desc': 'Al-Quran tadarus program throughout Ramadhan with our teachers. Open to students and community. Join us to reap the blessings of Ramadhan!',
    'events.feat.dateLabel': 'Date',
    'events.feat.date': '1 March - 30 March 2025',
    'events.feat.timeLabel': 'Time',
    'events.feat.time': 'After Tarawih (9:30 PM)',
    'events.feat.locLabel': 'Location',
    'events.feat.loc': 'Madrasah Surau',
    'events.feat.btn': 'Register Now',

    // Categories
    'events.category.class': '📚 Class',
    'events.category.event': '🎉 Ceremony',
    'events.category.activity': '🌟 Activity',
    'events.category.meeting': '👨‍👩‍👧 Meeting',
    'events.category.holiday': '🏖️ Holiday',
    'events.category.special': '⭐ Celebration',

    // Event 1
    'events.1.title': 'New Student Assessment Session',
    'events.1.desc': 'Reading level assessment & suitable class placement for new students.',

    // Event 2
    'events.2.title': 'Khatam Quran Ceremony 1/2025',
    'events.2.desc': 'Al-Quran completion ceremony for students who have completed 30 juz memorization.',

    // Event 3
    'events.3.title': 'Inter-Class Tilawah Competition',
    'events.3.desc': 'Al-Quran recitation competition for students of all levels with attractive prizes.',

    // Event 4
    'events.4.title': 'Parents Meeting',
    'events.4.desc': 'Discussion of student progress with teachers and sharing important information.',

    // Event 5
    'events.5.title': 'Mid-Year Holiday',
    'events.5.desc': 'Madrasah will be closed for mid-year holiday. Classes will resume on 1 July.',

    // Event 6
    'events.6.title': 'Independence Day Celebration',
    'events.6.desc': 'Special celebration with religious talk and performances from madrasah students.',

    // CTA
    'events.ctaTitle': '🔔 Don\'t Miss Updates!',
    'events.ctaDesc': 'Follow us for latest madrasah event and activity updates',
    'events.ctaBtn1': 'Contact Us',
    'events.ctaBtn2': 'More Info'
});

// Re-apply translations
if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== LOAD EVENTS FROM FIREBASE ============
// ============================================

function loadHomeEvents() {
    if (!homeFirebaseDb) {
        showEventsEmpty();
        return;
    }

    homeFirebaseDb.ref('hafazanData/events').once('value')
        .then(function(snapshot) {
            var eventsData = snapshot.val();

            if (!eventsData) {
                showEventsEmpty();
                return;
            }

            var events = Array.isArray(eventsData) ? eventsData : Object.values(eventsData);

            // Filter only active events
            events = events.filter(function(e) {
                return e && e.status !== 'hidden';
            });

            if (events.length === 0) {
                showEventsEmpty();
                return;
            }

            renderHomeEvents(events);
        })
        .catch(function(error) {
            console.log('Events load error:', error.message);
            showEventsEmpty();
        });
}

function renderHomeEvents(events) {
    var today = new Date().toISOString().split('T')[0];

    // Filter upcoming only
    var upcoming = events.filter(function(e) { return e.date >= today; });

    if (upcoming.length === 0) {
        showEventsEmpty();
        return;
    }

    // Sort by date
    upcoming.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    // Find featured
    var featured = null;
    var regular = [];

    for (var i = 0; i < upcoming.length; i++) {
        if (upcoming[i].featured && !featured) {
            featured = upcoming[i];
        } else {
            regular.push(upcoming[i]);
        }
    }

    // Render featured
    var featuredContainer = document.querySelector('.event-featured');
    if (featuredContainer && featured) {
        renderFeaturedEvent(featuredContainer, featured);
    } else if (featuredContainer && !featured) {
        // Hide featured section if no featured event
        featuredContainer.style.display = 'none';
        var subheading = document.querySelector('.events-subheading');
        if (subheading) subheading.style.display = 'none';
    }

    // Render regular events
    var grid = document.querySelector('.events-grid');
    if (grid) {
        renderRegularEvents(grid, regular);
    }
}

function renderFeaturedEvent(container, event) {
    var d = new Date(event.date);
    var dEnd = event.dateEnd ? new Date(event.dateEnd) : d;
    var isRange = event.dateEnd && event.dateEnd !== event.date;
    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    var monthName = months[d.getMonth()];

    var icon = event.icon || '🎉';
    var waMessage = event.waMessage || 'Saya berminat sertai ' + event.title;
    var waUrl = 'https://wa.me/60192363638?text=' + encodeURIComponent(waMessage);

    // Date badge HTML
    var dateBadgeHtml = '';
    if (isRange) {
        var sameMonth = d.getMonth() === dEnd.getMonth();
        if (sameMonth) {
            dateBadgeHtml = '<div class="event-featured-date">' +
                '<div class="event-date-day" style="font-size:1.5rem;">' + d.getDate() + '-' + dEnd.getDate() + '</div>' +
                '<div class="event-date-month">' + monthName + '</div>' +
                '</div>';
        } else {
            dateBadgeHtml = '<div class="event-featured-date">' +
                '<div style="font-size:0.95rem;font-weight:800;color:var(--primary-dark);line-height:1.2;">' + d.getDate() + ' ' + months[d.getMonth()] + '</div>' +
                '<div style="font-size:0.7rem;margin:3px 0;color:var(--text-light);">→</div>' +
                '<div style="font-size:0.95rem;font-weight:800;color:var(--primary-dark);line-height:1.2;">' + dEnd.getDate() + ' ' + months[dEnd.getMonth()] + '</div>' +
                '</div>';
        }
    } else {
        dateBadgeHtml = '<div class="event-featured-date">' +
            '<div class="event-date-day">' + d.getDate() + '</div>' +
            '<div class="event-date-month">' + monthName + '</div>' +
            '</div>';
    }

    // Date display in info section
    var dateDisplay = '';
    if (isRange) {
        if (d.getMonth() === dEnd.getMonth()) {
            dateDisplay = d.getDate() + '-' + dEnd.getDate() + ' ' + monthName + ' ' + d.getFullYear();
        } else {
            dateDisplay = d.getDate() + ' ' + months[d.getMonth()] + ' - ' + dEnd.getDate() + ' ' + months[dEnd.getMonth()] + ' ' + d.getFullYear();
        }
    } else {
        dateDisplay = d.getDate() + ' ' + monthName + ' ' + d.getFullYear();
    }

    container.style.display = 'grid';
    container.innerHTML =
        '<div class="event-featured-image">' +
            dateBadgeHtml +
            '<div class="event-featured-overlay">' +
                '<span class="event-featured-icon">' + icon + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="event-featured-content">' +
            '<span class="event-tag event-tag-special">⭐ Acara Istimewa</span>' +
            '<h3 class="event-featured-title">' + event.title + '</h3>' +
            '<p class="event-featured-desc">' + event.description + '</p>' +
            '<div class="event-featured-info">' +
                '<div class="event-info-item">' +
                    '<span class="info-icon-large">📅</span>' +
                    '<div>' +
                        '<strong>Tarikh</strong>' +
                        '<p>' + dateDisplay + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="event-info-item">' +
                    '<span class="info-icon-large">🕐</span>' +
                    '<div>' +
                        '<strong>Masa</strong>' +
                        '<p>' + (event.time || '-') + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="event-info-item">' +
                    '<span class="info-icon-large">📍</span>' +
                    '<div>' +
                        '<strong>Lokasi</strong>' +
                        '<p>' + event.location + '</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<a href="' + waUrl + '" target="_blank" class="btn-hero btn-hero-primary">' +
                '💬 <span>Daftar Sekarang</span>' +
            '</a>' +
        '</div>';
}

function renderRegularEvents(container, events) {
    if (events.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:40px;">' +
            '<div class="empty-icon">📅</div>' +
            '<p>Tiada acara lain pada masa ini</p>' +
            '</div>';
        return;
    }

    var months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    var categories = {
        class: { tag: 'event-tag-class', label: '📚 Kelas' },
        event: { tag: 'event-tag-event', label: '🎉 Majlis' },
        activity: { tag: 'event-tag-activity', label: '🌟 Aktiviti' },
        meeting: { tag: 'event-tag-meeting', label: '👨‍👩‍👧 Perjumpaan' },
        holiday: { tag: 'event-tag-holiday', label: '🏖️ Cuti' },
        special: { tag: 'event-tag-special', label: '⭐ Sambutan' }
    };

    var html = '';

    for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var d = new Date(event.date);
    var dEnd = event.dateEnd ? new Date(event.dateEnd) : d;
    var isRange = event.dateEnd && event.dateEnd !== event.date;
    var cat = categories[event.category] || categories.event;
    var colorClass = 'event-color-' + (event.color || 'green');

    // Date badge
    var dateBadge = '';
    if (isRange && d.getMonth() === dEnd.getMonth()) {
        dateBadge = '<div class="event-date-badge ' + colorClass + '">' +
            '<div class="event-day" style="font-size:1.5rem;">' + d.getDate() + '-' + dEnd.getDate() + '</div>' +
            '<div class="event-month">' + months[d.getMonth()] + '</div>' +
            '</div>';
    } else if (isRange) {
        dateBadge = '<div class="event-date-badge ' + colorClass + '">' +
            '<div style="font-size:0.85rem;font-weight:800;line-height:1.2;">' + d.getDate() + ' ' + months[d.getMonth()] + '</div>' +
            '<div style="font-size:0.65rem;margin:2px 0;">→</div>' +
            '<div style="font-size:0.85rem;font-weight:800;line-height:1.2;">' + dEnd.getDate() + ' ' + months[dEnd.getMonth()] + '</div>' +
            '</div>';
    } else {
        dateBadge = '<div class="event-date-badge ' + colorClass + '">' +
            '<div class="event-day">' + d.getDate() + '</div>' +
            '<div class="event-month">' + months[d.getMonth()] + '</div>' +
            '</div>';
    }

    html += '<div class="event-card">' +
        dateBadge +
        '<div class="event-card-content">' +
            '<span class="event-tag ' + cat.tag + '">' + cat.label + '</span>' +
            '<h4>' + event.title + '</h4>' +
            '<p>' + event.description + '</p>' +
            '<div class="event-meta">';

    if (event.time) html += '<span><span>🕐</span> ' + event.time + '</span>';
    if (event.location) html += '<span><span>📍</span> ' + event.location + '</span>';
    if (isRange) {
        var daysDiff = Math.ceil((dEnd - d) / (1000 * 60 * 60 * 24)) + 1;
        html += '<span><span>📆</span> ' + daysDiff + ' hari</span>';
    }

    html += '</div></div></div>';
}

    container.innerHTML = html;
}

function showEventsEmpty() {
    // Hide featured if no events
    var featuredContainer = document.querySelector('.event-featured');
    if (featuredContainer) featuredContainer.style.display = 'none';

    var subheading = document.querySelector('.events-subheading');
    if (subheading) subheading.style.display = 'none';

    var grid = document.querySelector('.events-grid');
    if (grid) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:60px;text-align:center;">' +
            '<div class="empty-icon" style="font-size:4rem;opacity:0.4;">📅</div>' +
            '<p style="font-size:1.1rem;color:#64748b;">Tiada acara terkini</p>' +
            '<small style="color:#94a3b8;">Sila semak semula tidak lama lagi</small>' +
            '</div>';
    }
}

// Load events when Firebase ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadHomeEvents, 1500);
});

// ============================================
// ===== SMART QUIZ ==========================
// ============================================

var quizCurrentQuestion = 0;
var quizAnswers = [];
var quizQuestions = [
    {
        question: 'Berapa umur anak anda?',
        subtitle: 'Pilih kategori umur yang sesuai',
        options: [
            { icon: '👶', text: '4-6 tahun (Sangat muda)', value: 'young' },
            { icon: '🧒', text: '7-9 tahun (Awal sekolah)', value: 'early' },
            { icon: '👦', text: '10-12 tahun (Pertengahan)', value: 'mid' },
            { icon: '👨', text: '13 tahun ke atas (Remaja)', value: 'teen' }
        ]
    },
    {
        question: 'Apa tahap bacaan Al-Quran anak anda?',
        subtitle: 'Pilih yang paling tepat menggambarkan tahap anak',
        options: [
            { icon: '📕', text: 'Belum kenal huruf Hijaiyah', value: 'none' },
            { icon: '📗', text: 'Sedang belajar Iqra\'', value: 'iqra' },
            { icon: '📘', text: 'Sudah boleh baca Al-Quran (kurang lancar)', value: 'basic' },
            { icon: '📙', text: 'Boleh baca dengan tajwid yang baik', value: 'advanced' }
        ]
    },
    {
        question: 'Sudah ada hafazan?',
        subtitle: 'Tahap hafazan Al-Quran semasa',
        options: [
            { icon: '🌱', text: 'Belum ada hafazan langsung', value: 'none' },
            { icon: '⭐', text: 'Hafal beberapa surah lazim (An-Nas, Al-Falaq, dll)', value: 'lazim' },
            { icon: '🌟', text: 'Hafal sebahagian Juz 30 (Amma)', value: 'partial30' },
            { icon: '🏆', text: 'Sudah khatam Juz 30 atau lebih', value: 'completed30' }
        ]
    },
    {
        question: 'Apa matlamat utama anda?',
        subtitle: 'Pilih objektif yang paling penting',
        options: [
            { icon: '📖', text: 'Anak boleh baca Al-Quran dengan baik', value: 'reading' },
            { icon: '🎓', text: 'Anak hafaz Juz Amma (Juz 30)', value: 'juz30' },
            { icon: '🌟', text: 'Anak hafaz lebih banyak juz', value: 'multiple' },
            { icon: '👑', text: 'Anak menjadi hafiz/hafizah (30 juz)', value: 'huffaz' }
        ]
    },
    {
        question: 'Berapa banyak masa boleh diluangkan setiap hari?',
        subtitle: 'Anggaran masa belajar harian',
        options: [
            { icon: '⏰', text: '1-2 jam sehari (sambil sekolah biasa)', value: 'short' },
            { icon: '⏰', text: '3-4 jam sehari (selepas sekolah)', value: 'medium' },
            { icon: '⏰', text: '5-6 jam sehari (lebih fokus)', value: 'long' },
            { icon: '⏰', text: 'Sepenuh masa (intensive)', value: 'fulltime' }
        ]
    }
];

var quizClasses = {
    iqra: {
        icon: '📕',
        name: 'Kelas Iqra\'',
        tag: '⭐ Sesuai Untuk Anda',
        description: 'Asas pembelajaran Al-Quran dari Iqra\' 1 hingga 6. Sesuai untuk pelajar yang baru bermula.',
        features: [
            'Iqra\' 1-6 lengkap',
            'Pengenalan huruf Hijaiyah',
            'Tajwid asas & makhraj huruf',
            'Persediaan untuk membaca Al-Quran'
        ]
    },
    asas: {
        icon: '📖',
        name: 'Al-Quran Asas',
        tag: '⭐ Sesuai Untuk Anda',
        description: 'Pembelajaran Al-Quran dengan fokus tajwid yang lengkap untuk pelajar yang sudah boleh membaca asas.',
        features: [
            'Bacaan dengan tajwid sempurna',
            'Sasaran khatam Al-Quran',
            'Hafazan Surah Lazim',
            'Bimbingan ustaz/ustazah'
        ]
    },
    juz30: {
        icon: '🌟',
        name: 'Hafazan Juz 30',
        tag: '⭐ Sesuai Untuk Anda',
        description: 'Program khusus untuk menghafaz Juz Amma (Juz 30) dengan kaedah talqin dan murajaah.',
        features: [
            'Khatam Juz 30 dalam masa terancang',
            'Kaedah Sabak Baru harian',
            'Para Sabak & Murajaah',
            'Test bacaan mingguan'
        ]
    },
    surah5: {
        icon: '⭐',
        name: 'Hafazan 5 Surah Pilihan',
        tag: '⭐ Sesuai Untuk Anda',
        description: 'Program khusus menghafaz 5 surah pilihan yang penuh fadhilat untuk amalan harian.',
        features: [
            'Surah Ya-Sin, As-Sajdah, Al-Mulk',
            'Surah Ad-Dukhan, Al-Waqi\'ah',
            'Hafazan dengan tajwid',
            'Memahami maksud ayat'
        ]
    },
    lanjutan: {
        icon: '🎓',
        name: 'Hafazan Lanjutan',
        tag: '⭐ Sesuai Untuk Anda',
        description: 'Program intensif untuk pelajar yang sudah ada asas hafazan dan ingin meneruskan ke tahap lebih tinggi.',
        features: [
            'Hafazan intensif harian',
            'Sistem mentor & buddy',
            'Persediaan pra-syahadah',
            'Target khatam 30 juz'
        ]
    },
    khatam: {
        icon: '🏆',
        name: 'Kelas Khatam',
        tag: '⭐ Sesuai Untuk Anda',
        description: 'Untuk pelajar yang sudah khatam 30 juz. Fokus pada pengukuhan dan persediaan syahadah.',
        features: [
            'Murajaah 30 juz penuh',
            'Persediaan syahadah',
            'Sijil khatam rasmi',
            'Bimbingan untuk menjadi guru'
        ]
    }
};

function startQuiz() {
    quizCurrentQuestion = 0;
    quizAnswers = [];
    showQuizScreen('quizQuestions');
    renderQuestion();
}

function showQuizScreen(screenId) {
    var screens = document.querySelectorAll('.quiz-screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    var target = document.getElementById(screenId);
    if (target) target.classList.add('active');

    // Scroll to quiz section
    var quizSection = document.getElementById('quiz');
    if (quizSection) {
        var offset = quizSection.offsetTop - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }
}

function renderQuestion() {
    var q = quizQuestions[quizCurrentQuestion];
    if (!q) return;

    // Update progress
    var progress = ((quizCurrentQuestion + 1) / quizQuestions.length) * 100;
    document.getElementById('quizProgressBar').style.width = progress + '%';
    document.getElementById('quizCurrent').textContent = quizCurrentQuestion + 1;
    document.getElementById('quizTotal').textContent = quizQuestions.length;

    // Render question
    var container = document.getElementById('quizQuestionContainer');
    var html = '<div class="quiz-question">';
    html += '<span class="question-number">Soalan ' + (quizCurrentQuestion + 1) + '</span>';
    html += '<h3 class="question-title">' + q.question + '</h3>';
    html += '<p class="question-subtitle">' + q.subtitle + '</p>';
    html += '<div class="quiz-options">';

    var currentAnswer = quizAnswers[quizCurrentQuestion];

    for (var i = 0; i < q.options.length; i++) {
        var opt = q.options[i];
        var selectedClass = (currentAnswer === opt.value) ? ' selected' : '';
        html += '<div class="quiz-option' + selectedClass + '" onclick="selectOption(\'' + opt.value + '\', this)">';
        html += '<div class="option-radio"></div>';
        html += '<span class="option-icon">' + opt.icon + '</span>';
        html += '<span class="option-text">' + opt.text + '</span>';
        html += '</div>';
    }

    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    // Update buttons
    var prevBtn = document.getElementById('quizPrevBtn');
    var nextBtn = document.getElementById('quizNextBtn');

    prevBtn.disabled = quizCurrentQuestion === 0;

    // Update next button text
    if (quizCurrentQuestion === quizQuestions.length - 1) {
        nextBtn.innerHTML = '🎯 <span>Dapatkan Cadangan</span>';
    } else {
        nextBtn.innerHTML = '<span>Seterusnya</span> →';
    }

    // Enable/disable next button
    nextBtn.disabled = !currentAnswer;
}

function selectOption(value, element) {
    quizAnswers[quizCurrentQuestion] = value;

    // Update UI
    var options = element.parentElement.querySelectorAll('.quiz-option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    element.classList.add('selected');

    // Enable next button
    document.getElementById('quizNextBtn').disabled = false;
}

function nextQuestion() {
    if (!quizAnswers[quizCurrentQuestion]) return;

    if (quizCurrentQuestion < quizQuestions.length - 1) {
        quizCurrentQuestion++;
        renderQuestion();
    } else {
        // Show result
        calculateResult();
    }
}

function prevQuestion() {
    if (quizCurrentQuestion > 0) {
        quizCurrentQuestion--;
        renderQuestion();
    }
}

function calculateResult() {
    // Scoring system
    var scores = {
        iqra: 0,
        asas: 0,
        juz30: 0,
        surah5: 0,
        lanjutan: 0,
        khatam: 0
    };

    // Q1: Age
    var age = quizAnswers[0];
    if (age === 'young') scores.iqra += 3;
    if (age === 'early') { scores.iqra += 2; scores.asas += 2; scores.juz30 += 1; }
    if (age === 'mid') { scores.asas += 2; scores.juz30 += 3; scores.surah5 += 2; }
    if (age === 'teen') { scores.lanjutan += 3; scores.khatam += 2; scores.surah5 += 2; }

    // Q2: Reading level
    var reading = quizAnswers[1];
    if (reading === 'none') scores.iqra += 5;
    if (reading === 'iqra') { scores.iqra += 3; scores.asas += 1; }
    if (reading === 'basic') { scores.asas += 4; scores.juz30 += 1; }
    if (reading === 'advanced') { scores.juz30 += 3; scores.lanjutan += 2; scores.surah5 += 2; scores.khatam += 1; }

    // Q3: Memorization
    var memo = quizAnswers[2];
    if (memo === 'none') { scores.iqra += 2; scores.asas += 3; }
    if (memo === 'lazim') { scores.juz30 += 3; scores.surah5 += 2; }
    if (memo === 'partial30') { scores.juz30 += 3; scores.surah5 += 3; scores.lanjutan += 1; }
    if (memo === 'completed30') { scores.lanjutan += 4; scores.khatam += 3; scores.surah5 += 1; }

    // Q4: Goal
    var goal = quizAnswers[3];
    if (goal === 'reading') { scores.iqra += 2; scores.asas += 4; }
    if (goal === 'juz30') { scores.juz30 += 5; scores.surah5 += 1; }
    if (goal === 'multiple') { scores.lanjutan += 4; scores.surah5 += 3; }
    if (goal === 'huffaz') { scores.lanjutan += 4; scores.khatam += 5; }

    // Q5: Time
    var time = quizAnswers[4];
    if (time === 'short') { scores.iqra += 2; scores.asas += 2; scores.surah5 += 2; }
    if (time === 'medium') { scores.asas += 1; scores.juz30 += 3; scores.surah5 += 2; }
    if (time === 'long') { scores.juz30 += 2; scores.lanjutan += 3; scores.khatam += 2; }
    if (time === 'fulltime') { scores.lanjutan += 4; scores.khatam += 4; }

    // Find top 3
    var sorted = Object.keys(scores).sort(function(a, b) {
        return scores[b] - scores[a];
    });

    var topClass = sorted[0];
    var otherClasses = [sorted[1], sorted[2]];

    showResult(topClass, otherClasses);
}

function showResult(topClass, otherClasses) {
    showQuizScreen('quizResult');

    var info = quizClasses[topClass];
    if (!info) return;

    // Main recommendation
    var resultHtml = '<div class="result-card-content">';
    resultHtml += '<div class="result-card-icon">' + info.icon + '</div>';
    resultHtml += '<span class="result-card-tag">' + info.tag + '</span>';
    resultHtml += '<h3 class="result-card-title">' + info.name + '</h3>';
    resultHtml += '<p class="result-card-desc">' + info.description + '</p>';
    resultHtml += '<ul class="result-card-features">';
    for (var i = 0; i < info.features.length; i++) {
        resultHtml += '<li>' + info.features[i] + '</li>';
    }
    resultHtml += '</ul>';
    resultHtml += '</div>';

    document.getElementById('quizResultCard').innerHTML = resultHtml;

    // Other recommendations
    var otherHtml = '';
    for (var i = 0; i < otherClasses.length; i++) {
        var other = quizClasses[otherClasses[i]];
        if (!other) continue;

        otherHtml += '<div class="other-class-item">';
        otherHtml += '<span class="other-class-icon">' + other.icon + '</span>';
        otherHtml += '<div class="other-class-content">';
        otherHtml += '<div class="other-class-name">' + other.name + '</div>';
        otherHtml += '<div class="other-class-match">📊 Pilihan ke-' + (i + 2) + '</div>';
        otherHtml += '</div>';
        otherHtml += '</div>';
    }

    document.getElementById('quizOtherClasses').innerHTML = otherHtml;

    // Update WA button with custom message
    var waBtn = document.getElementById('quizWAButton');
    if (waBtn) {
        var msg = 'Assalamualaikum, saya sudah ambil quiz dan dapat cadangan kelas: ' + info.name + '. Boleh tolong terangkan lebih lanjut?';
        waBtn.href = 'https://wa.me/60192363638?text=' + encodeURIComponent(msg);
    }
}

function restartQuiz() {
    quizCurrentQuestion = 0;
    quizAnswers = [];
    showQuizScreen('quizStart');
}

// ============================================
// ===== UPDATE TRANSLATIONS ==================
// ============================================

homeTranslations.ms = Object.assign(homeTranslations.ms, {
    'nav.quiz': 'Quiz',
    'quiz.badge': 'Quiz Pintar',
    'quiz.title': 'Kelas Mana Sesuai<br><span class="section-title-accent">Untuk Anak Anda?</span>',
    'quiz.subtitle': 'Jawab 5 soalan ringkas, kami akan recommend kelas terbaik untuk anak anda',
    'quiz.startTitle': 'Mari Cari Kelas Yang Sesuai!',
    'quiz.startDesc': 'Quiz ini akan bantu anda pilih kelas yang paling sesuai dengan tahap dan keperluan anak anda. Hanya ambil masa <strong>2 minit</strong>.',
    'quiz.feature1': 'Soalan Mudah',
    'quiz.feature2': 'Minit Sahaja',
    'quiz.feature3': 'Kelas Tersedia',
    'quiz.startBtn': '🚀 Mula Quiz',
    'quiz.disclaimer': '💡 Cadangan ini hanya rujukan. Sila berbincang dengan ustaz untuk penilaian penuh.',
    'quiz.progress': 'Soalan',
    'quiz.back': 'Kembali',
    'quiz.next': 'Seterusnya',
    'quiz.resultTitle': 'Tahniah! Kami Ada Cadangan Untuk Anda',
    'quiz.resultSub': 'Berdasarkan jawapan anda, ini adalah kelas yang paling sesuai:',
    'quiz.register': 'Daftar Sekarang',
    'quiz.contact': 'Hubungi Mudir',
    'quiz.restart': 'Cuba Lagi',
    'quiz.otherClasses': '📚 Pilihan Lain'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    'nav.quiz': 'Quiz',
    'quiz.badge': 'Smart Quiz',
    'quiz.title': 'Which Class Is<br><span class="section-title-accent">Right For Your Child?</span>',
    'quiz.subtitle': 'Answer 5 quick questions and we\'ll recommend the best class',
    'quiz.startTitle': 'Let\'s Find The Right Class!',
    'quiz.startDesc': 'This quiz will help you choose the best class for your child\'s level and needs. Only takes <strong>2 minutes</strong>.',
    'quiz.feature1': 'Easy Questions',
    'quiz.feature2': 'Minutes Only',
    'quiz.feature3': 'Classes Available',
    'quiz.startBtn': '🚀 Start Quiz',
    'quiz.disclaimer': '💡 This recommendation is for reference only. Please consult our teachers for full assessment.',
    'quiz.progress': 'Question',
    'quiz.back': 'Back',
    'quiz.next': 'Next',
    'quiz.resultTitle': 'Congrats! Here\'s Our Recommendation',
    'quiz.resultSub': 'Based on your answers, this is the most suitable class:',
    'quiz.register': 'Register Now',
    'quiz.contact': 'Contact Mudir',
    'quiz.restart': 'Try Again',
    'quiz.otherClasses': '📚 Other Options'
});

if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== DONATION FUNCTIONS ===================
// ============================================

var selectedEssentials = {};
var selectedMeal = null;

// ===== ESSENTIALS =====

function selectEssential(element, item, price) {
    if (selectedEssentials[item]) {
        // Deselect
        delete selectedEssentials[item];
        element.classList.remove('selected');
    } else {
        // Select
        selectedEssentials[item] = price;
        element.classList.add('selected');
    }

    updateEssentialsTotal();
}

function updateEssentialsTotal() {
    var total = 0;
    var count = 0;
    for (var item in selectedEssentials) {
        total += selectedEssentials[item];
        count++;
    }

    var totalEl = document.getElementById('essentialsTotal');
    var amountEl = document.getElementById('essentialsAmount');

    if (count > 0) {
        totalEl.style.display = 'flex';
        amountEl.textContent = total.toFixed(2);
    } else {
        totalEl.style.display = 'none';
    }
}

function confirmEssentials() {
    var count = Object.keys(selectedEssentials).length;
    if (count === 0) {
        alert('Sila pilih sekurang-kurangnya 1 item untuk disumbangkan');
        return;
    }

    var total = 0;
    var itemsList = '';
    var itemNames = {
        beras: 'Beras (10kg)',
        minyak: 'Minyak (5L)',
        gula: 'Gula (2kg)',
        tepung: 'Tepung (2kg)',
        telur: 'Telur (30 biji)',
        sardin: 'Sardin (6 tin)'
    };

    for (var item in selectedEssentials) {
        total += selectedEssentials[item];
        itemsList += '- ' + itemNames[item] + ' (RM ' + selectedEssentials[item] + ')\n';
    }

    var message = 'Assalamualaikum, saya berminat untuk infaq barang mentah:\n\n' +
                  itemsList + '\n' +
                  'Jumlah: RM ' + total.toFixed(2) + '\n\n' +
                  'Bagaimana cara untuk membuat sumbangan?';

    var waUrl = 'https://wa.me/60192363638?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank');
}

// ===== MEAL PACKAGES =====

function selectMeal(element, type, amount) {
    // Reset all
    var allMeals = document.querySelectorAll('.meal-package');
    for (var i = 0; i < allMeals.length; i++) {
        allMeals[i].classList.remove('selected');
    }

    // Select clicked
    element.classList.add('selected');

    selectedMeal = {
        type: type,
        amount: amount
    };

    // Clear custom input
    var customInput = document.getElementById('customMealAmount');
    if (customInput) customInput.value = '';
}

function selectMealCustom() {
    var customInput = document.getElementById('customMealAmount');
    if (customInput) customInput.focus();
}

function updateCustomMeal(value) {
    var amount = parseFloat(value) || 0;
    if (amount < 10) return;

    // Reset other selections
    var allMeals = document.querySelectorAll('.meal-package');
    for (var i = 0; i < allMeals.length; i++) {
        allMeals[i].classList.remove('selected');
    }

    // Mark custom as selected
    var customEl = document.querySelector('.meal-package.custom');
    if (customEl) customEl.classList.add('selected');

    selectedMeal = {
        type: 'custom',
        amount: amount
    };
}

function confirmMeal() {
    if (!selectedMeal) {
        alert('Sila pilih pakej sajian makanan');
        return;
    }

    var typeName = {
        daily: 'Sajian Sehari (100 pelajar)',
        weekly: 'Sajian Seminggu (100 pelajar × 7 hari)',
        monthly: 'Sajian Sebulan (100 pelajar × 30 hari)',
        custom: 'Jumlah Pilihan'
    };

    var message = 'Assalamualaikum, saya berminat untuk sponsor sajian makanan pelajar:\n\n' +
                  '📦 Pakej: ' + typeName[selectedMeal.type] + '\n' +
                  '💰 Jumlah: RM ' + selectedMeal.amount.toFixed(2) + '\n\n' +
                  'Bagaimana cara untuk membuat sumbangan?';

    var waUrl = 'https://wa.me/60192363638?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank');
}

// ===== BILL PAYMENT MODAL =====

function openBillModal(billType) {
    var modal = document.getElementById('billModal');
    var title = document.getElementById('billModalTitle');
    var linksContainer = document.getElementById('paymentLinks');

    var billConfigs = {
        tnb: {
            title: '⚡ Bayar Bil TNB (Elektrik)',
            links: [
                {
                    icon: '⚡',
                    name: 'myTNB App',
                    desc: 'Bayar terus melalui aplikasi rasmi TNB',
                    url: 'https://www.mytnb.com.my/'
                },
                {
                    icon: '🏦',
                    name: 'Maybank2u',
                    desc: 'Jom Pay → TNB',
                    url: 'https://www.maybank2u.com.my/'
                },
                {
                    icon: '💳',
                    name: 'CIMB Clicks',
                    desc: 'Bill Payment → TNB',
                    url: 'https://www.cimbclicks.com.my/'
                }
            ]
        },
        syabas: {
            title: '💧 Bayar Bil Air (Air Selangor)',
            links: [
                {
                    icon: '💧',
                    name: 'Air Selangor App',
                    desc: 'Aplikasi rasmi Air Selangor',
                    url: 'https://www.airselangor.com/'
                },
                {
                    icon: '🏦',
                    name: 'Maybank2u',
                    desc: 'Jom Pay → Air Selangor',
                    url: 'https://www.maybank2u.com.my/'
                },
                {
                    icon: '💳',
                    name: 'CIMB Clicks',
                    desc: 'Bill Payment → Air Selangor',
                    url: 'https://www.cimbclicks.com.my/'
                }
            ]
        },
        internet: {
            title: '📡 Bayar Bil Internet (Unifi/TM)',
            links: [
                {
                    icon: '📡',
                    name: 'Unifi App',
                    desc: 'Aplikasi rasmi Unifi/TM',
                    url: 'https://unifi.com.my/'
                },
                {
                    icon: '🏦',
                    name: 'Maybank2u',
                    desc: 'Jom Pay → TM Unifi',
                    url: 'https://www.maybank2u.com.my/'
                },
                {
                    icon: '💳',
                    name: 'Touch n Go eWallet',
                    desc: 'Pay Bills → Internet',
                    url: 'https://www.touchngo.com.my/'
                }
            ]
        },
        all: {
            title: '💡 Pilih Bil Untuk Dibayar',
            links: [
                {
                    icon: '⚡',
                    name: 'TNB (Elektrik)',
                    desc: 'Bayar bil elektrik madrasah',
                    onclick: 'openBillModal(\'tnb\')'
                },
                {
                    icon: '💧',
                    name: 'Syabas / Air Selangor',
                    desc: 'Bayar bil air madrasah',
                    onclick: 'openBillModal(\'syabas\')'
                },
                {
                    icon: '📡',
                    name: 'Internet / WiFi',
                    desc: 'Bayar bil internet madrasah',
                    onclick: 'openBillModal(\'internet\')'
                }
            ]
        }
    };

    var config = billConfigs[billType];
    if (!config) return;

    title.textContent = config.title;

    var html = '';
    for (var i = 0; i < config.links.length; i++) {
        var link = config.links[i];
        if (link.onclick) {
            html += '<a href="javascript:void(0)" class="payment-link-item" onclick="' + link.onclick + '">';
        } else {
            html += '<a href="' + link.url + '" target="_blank" class="payment-link-item">';
        }
        html += '<div class="payment-link-icon">' + link.icon + '</div>';
        html += '<div class="payment-link-info">';
        html += '<div class="payment-link-name">' + link.name + '</div>';
        html += '<div class="payment-link-desc">' + link.desc + '</div>';
        html += '</div>';
        html += '<div class="payment-link-arrow">→</div>';
        html += '</a>';
    }

        linksContainer.innerHTML = html;
    modal.classList.remove('hidden');

    // Lock body scroll & scroll modal ke atas
    document.body.classList.add('popup-open');

    // Scroll modal body ke atas
    setTimeout(function() {
        var modalBody = modal.querySelector('.bill-popup-body');
        if (modalBody) modalBody.scrollTop = 0;
    }, 100);
}

function closeBillModal() {
    var modal = document.getElementById('billModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    // Unlock body scroll
    document.body.classList.remove('popup-open');
}

// ===== COPY BANK ACCOUNT =====

function copyAccountNumber() {
    var accNum = document.getElementById('bankAccNumber').textContent.replace(/\s/g, '').replace(/-/g, '');

    // Try modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(accNum).then(function() {
            showCopySuccess();
        }).catch(function() {
            fallbackCopy(accNum);
        });
    } else {
        fallbackCopy(accNum);
    }
}

function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (e) {
        alert('Gagal copy. No. akaun: ' + text);
    }

    document.body.removeChild(textarea);
}

function showCopySuccess() {
    var btn = document.querySelector('.copy-btn');
    var originalText = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    btn.style.background = '#10b981';

    setTimeout(function() {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
}

// ===== TRANSLATIONS =====

homeTranslations.ms = Object.assign(homeTranslations.ms, {
    'nav.donate': '💝 Infaq',
    'donate.badge': 'Infaq & Sumbangan',
    'donate.title': 'Sertai Kami Dalam<br><span class="section-title-accent">Membantu Madrasah</span>',
    'donate.subtitle': 'Setiap sumbangan anda akan membantu pelajar dan operasi madrasah. Pilih cara untuk membantu.',
    'donate.hadith': '"Sesiapa yang membina (membantu) masjid kerana Allah, nescaya Allah akan binakan untuknya sebuah rumah di syurga"',
    'donate.hadithSource': '— Hadith Riwayat Bukhari & Muslim',
    'donate.urgent': '⚡ Bulanan',
    'donate.popular': '⭐ Popular',
    'donate.recommended': '💫 Disyorkan',

    // Utility
    'donate.utility.title': 'Bil Utiliti',
    'donate.utility.desc': 'Bantu kami bayar bil bulanan utiliti madrasah. Bayar terus ke akaun TNB, Syabas atau Internet.',
    'donate.utility.btn': 'Bayar Bil',

    // Essentials
    'donate.essentials.title': 'Infaq Barang Mentah',
    'donate.essentials.desc': 'Sumbang barang mentah untuk dapur madrasah. Pilih item yang anda nak infaqkan.',
    'donate.essentials.btn': 'Sumbang Sekarang',
    'donate.total': 'Jumlah:',

    // Meals
    'donate.meals.title': 'Sajian Makanan',
    'donate.meals.desc': 'Sponsor makanan untuk pelajar. Pilih kekerapan sumbangan yang anda mahu.',
    'donate.meals.btn': 'Sponsor Makanan',

    // Bank Info
    'donate.bankInfo': 'Maklumat Akaun Bank Madrasah',
    'donate.accName': 'Nama Akaun:',
    'donate.accNum': 'No. Akaun:',
    'donate.bankNote': '💡 Sila WhatsApp resit/screenshot pembayaran kepada Mudir untuk pengesahan dan resit rasmi.',

    // CTA
    'donate.ctaTitle': 'Sumbangan Anda Sangat Bermakna',
    'donate.ctaDesc': 'Setiap sen yang anda infaqkan akan menjadi pahala jariah yang berterusan. Bantu kami mendidik generasi Quran masa hadapan.',
    'donate.contactBtn': 'Hubungi Mudir Untuk Sumbangan Khas'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    'nav.donate': '💝 Donate',
    'donate.badge': 'Infaq & Donation',
    'donate.title': 'Join Us In<br><span class="section-title-accent">Helping The Madrasah</span>',
    'donate.subtitle': 'Every contribution helps students and madrasah operations. Choose how you want to help.',
    'donate.hadith': '"Whoever builds a mosque for Allah, Allah will build for him a house in paradise"',
    'donate.hadithSource': '— Hadith Reported by Bukhari & Muslim',
    'donate.urgent': '⚡ Monthly',
    'donate.popular': '⭐ Popular',
    'donate.recommended': '💫 Recommended',

    // Utility
    'donate.utility.title': 'Utility Bills',
    'donate.utility.desc': 'Help us pay monthly madrasah utility bills. Pay directly to TNB, Syabas or Internet.',
    'donate.utility.btn': 'Pay Bills',

    // Essentials
    'donate.essentials.title': 'Donate Essentials',
    'donate.essentials.desc': 'Donate essentials for madrasah kitchen. Select items you want to contribute.',
    'donate.essentials.btn': 'Donate Now',
    'donate.total': 'Total:',

    // Meals
    'donate.meals.title': 'Meal Sponsorship',
    'donate.meals.desc': 'Sponsor meals for students. Choose your donation frequency.',
    'donate.meals.btn': 'Sponsor Meals',

    // Bank Info
    'donate.bankInfo': 'Madrasah Bank Account Information',
    'donate.accName': 'Account Name:',
    'donate.accNum': 'Account Number:',
    'donate.bankNote': '💡 Please WhatsApp payment receipt/screenshot to Mudir for verification and official receipt.',

    // CTA
    'donate.ctaTitle': 'Your Contribution Is Meaningful',
    'donate.ctaDesc': 'Every sen you donate becomes continuous charity. Help us educate the next Quran generation.',
    'donate.contactBtn': 'Contact Mudir For Special Donation'
});

if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== BILL POPUP - CLOSE HANDLERS ==========
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Close on overlay click
    var modal = document.getElementById('billModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            // Only close if clicked on overlay, not container
            if (e.target === modal) {
                closeBillModal();
            }
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            var modal = document.getElementById('billModal');
            if (modal && !modal.classList.contains('hidden')) {
                closeBillModal();
            }
        }
    });
});


// ============================================
// ===== SIJIL MODAL FUNCTIONS ================
// ============================================

var sijilData = {
    jakim: {
        title: '🕌 JAKIM',
        subtitle: 'Jabatan Kemajuan Islam Malaysia',
        description: 'Madrasah ini diiktiraf dan didaftarkan di bawah JAKIM Malaysia sebagai institusi pendidikan Islam yang sah.',
        icon: '🕌',
        details: [
            { label: 'No. Pendaftaran', value: 'JAKIM/MTPSB/2014' },
            { label: 'Status', value: '✅ Aktif & Berdaftar' },
            { label: 'Tarikh Pendaftaran', value: '15 Mac 2014' },
            { label: 'Kelas Sijil', value: 'Pusat Pengajian Islam' }
        ],
        website: 'https://www.islam.gov.my'
    },
    jais: {
        title: '🏛️ JAIS Selangor',
        subtitle: 'Jabatan Agama Islam Selangor',
        description: 'Madrasah berdaftar dengan JAIS Selangor sebagai pusat tahfiz dan pendidikan Al-Quran di negeri Selangor.',
        icon: '🏛️',
        details: [
            { label: 'No. Pendaftaran', value: 'JAIS/SEL/PT/2014/001' },
            { label: 'Status', value: '✅ Aktif & Diiktiraf' },
            { label: 'Tarikh Pendaftaran', value: '20 Mac 2014' },
            { label: 'Daerah', value: 'Kuala Selangor' }
        ],
        website: 'https://www.jais.gov.my'
    },
    kpm: {
        title: '🎓 KPM',
        subtitle: 'Kementerian Pendidikan Malaysia',
        description: 'Madrasah berdaftar dengan KPM sebagai institusi pendidikan swasta dengan kelulusan untuk menjalankan aktiviti pengajian.',
        icon: '🎓',
        details: [
            { label: 'No. Pendaftaran', value: 'KPM/PT/SEL/2014/01' },
            { label: 'Status', value: '✅ Berdaftar' },
            { label: 'Kategori', value: 'Pendidikan Islam' },
            { label: 'Tarikh', value: '2014 - Sekarang' }
        ],
        website: 'https://www.moe.gov.my'
    },
    ssm: {
        title: '📋 ROS / SSM',
        subtitle: 'Pendaftar Pertubuhan / Suruhanjaya Syarikat Malaysia',
        description: 'Madrasah didaftarkan sebagai badan amal yang sah di sisi undang-undang Malaysia.',
        icon: '📋',
        details: [
            { label: 'No. Pendaftaran', value: 'PPM-012-10-12032014' },
            { label: 'Jenis Pertubuhan', value: 'Persatuan Bukan Untung' },
            { label: 'Status', value: '✅ Aktif' },
            { label: 'Tarikh Didaftarkan', value: '12 Mac 2014' }
        ],
        website: 'https://www.ros.gov.my'
    },
    halal: {
        title: '🛡️ Sijil Halal',
        subtitle: 'Pengiktirafan Makanan Halal',
        description: 'Dapur dan makanan yang disediakan untuk pelajar dijamin halal dan mengikuti standard Islam yang ketat.',
        icon: '🛡️',
        details: [
            { label: 'Status Halal', value: '✅ Diakreditasi' },
            { label: 'Bekalan Makanan', value: 'Halal Verified' },
            { label: 'Pemeriksaan', value: 'Berkala 6 bulan' },
            { label: 'Standard', value: 'JAKIM Halal Standard' }
        ],
        website: 'https://www.halal.gov.my'
    },
    tahfiz: {
        title: '📖 Pusat Tahfiz',
        subtitle: 'Pengiktirafan Pusat Tahfiz Al-Quran',
        description: 'Pengiktirafan sebagai pusat tahfiz yang berkualiti dengan kurikulum hafazan yang sistematik.',
        icon: '📖',
        details: [
            { label: 'No. Pengiktirafan', value: 'PT-SEL-2014-MTPSB' },
            { label: 'Bidang', value: 'Hafazan Al-Quran' },
            { label: 'Status', value: '✅ Aktif' },
            { label: 'Pengiktirafan', value: 'JAIS Selangor' }
        ],
        website: 'https://www.jais.gov.my'
    }
};

function openSijilModal(type) {
    var data = sijilData[type];
    if (!data) return;

    var modal = document.getElementById('sijilModal');
    var title = document.getElementById('sijilModalTitle');
    var content = document.getElementById('sijilContent');

    if (!modal || !title || !content) return;

    title.textContent = '📜 ' + data.title;

    var html = '<div class="sijil-display">';
    html += '<div class="sijil-display-icon">' + data.icon + '</div>';
    html += '<h3>' + data.title + '</h3>';
    html += '<p>' + data.description + '</p>';

    html += '<div class="sijil-info-box">';
    for (var i = 0; i < data.details.length; i++) {
        html += '<div class="info-row">';
        html += '<span class="info-label">' + data.details[i].label + '</span>';
        html += '<span class="info-value-cert">' + data.details[i].value + '</span>';
        html += '</div>';
    }
    html += '</div>';

    html += '<div class="sijil-image-placeholder">';
    html += '<div class="placeholder-text">📷 Gambar sijil rasmi akan dipaparkan di sini</div>';
    html += '<div style="margin-top:10px;font-size:0.85rem;color:#94a3b8;">Untuk maklumat lanjut, sila hubungi pejabat madrasah</div>';
    html += '</div>';

    html += '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px;">';
    html += '<a href="' + data.website + '" target="_blank" style="background:linear-gradient(135deg,#047857,#065f46);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:8px;">';
    html += '🌐 Lawat Portal Rasmi';
    html += '</a>';
    html += '<a href="https://wa.me/60192363638?text=Assalamualaikum,%20saya%20ingin%20bertanya%20tentang%20sijil%20' + encodeURIComponent(data.title) + '" target="_blank" style="background:linear-gradient(135deg,#25d366,#128c7e);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:8px;">';
    html += '💬 Tanya Kami';
    html += '</a>';
    html += '</div>';

    html += '</div>';

    content.innerHTML = html;
    modal.classList.remove('hidden');
    document.body.classList.add('popup-open');
}

function closeSijilModal() {
    var modal = document.getElementById('sijilModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    document.body.classList.remove('popup-open');
}

// Close handlers
document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('sijilModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeSijilModal();
            }
        });
    }

    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            var sijilModal = document.getElementById('sijilModal');
            if (sijilModal && !sijilModal.classList.contains('hidden')) {
                closeSijilModal();
            }
        }
    });
});

// ============================================
// ===== TRANSLATIONS =========================
// ============================================

homeTranslations.ms = Object.assign(homeTranslations.ms, {
    'nav.akred': '🏆 Akreditasi',
    'akred.badge': 'Pengiktirafan Rasmi',
    'akred.title': 'Diiktiraf & Diakreditasi<br><span class="section-title-accent">Oleh Pihak Berwajib</span>',
    'akred.subtitle': 'Madrasah kami didaftarkan rasmi dan diiktiraf oleh agensi-agensi kerajaan',

    // Trust badges
    'akred.t1Title': 'Berdaftar Rasmi',
    'akred.t1Sub': 'Sejak 2014',
    'akred.t2Title': 'Diakreditasi JAIS',
    'akred.t2Sub': 'Selangor',
    'akred.t3Title': 'Halal Certified',
    'akred.t3Sub': 'Makanan halal',
    'akred.t4Title': '10+ Tahun',
    'akred.t4Sub': 'Pengalaman',

    // Logos
    'akred.logosTitle': '🏛️ Pengiktirafan & Pendaftaran Rasmi',
    'akred.jakim': 'Jabatan Kemajuan Islam Malaysia',
    'akred.jais': 'Jabatan Agama Islam Selangor',
    'akred.kpm': 'Kementerian Pendidikan Malaysia',
    'akred.ssm': 'Pendaftar Pertubuhan',
    'akred.halal': 'Sijil Halal Makanan',
    'akred.tahfiz': 'Pengiktirafan Tahfiz',
    'akred.verified': 'Berdaftar',
    'akred.note': '💡 Klik mana-mana logo untuk lihat sijil rasmi',

    // Info cards
    'akred.info1Title': 'No. Pendaftaran',
    'akred.info1Sub': 'Berdaftar dengan JAIS Selangor',
    'akred.info2Title': 'Ditubuhkan',
    'akred.info2Sub': 'Lebih 10 tahun beroperasi',
    'akred.info3Title': 'Jumlah Pelajar',
    'akred.info3Sub': 'Pelajar aktif setiap tahun',
    'akred.info4Title': 'Alumni',
    'akred.info4Sub': 'Pelajar berjaya khatam',

    // Achievements
    'akred.achTitle': 'Pencapaian & Anugerah',
    'akred.ach1': 'Anugerah Tahfiz Terbaik',
    'akred.ach2': 'Johan Tilawah Daerah',
    'akred.ach3': '50+ Khatam Quran',
    'akred.ach4': 'Pengiktirafan Komuniti',

    // Verification
    'akred.verifyTitle': 'Mahu Verify Pendaftaran Kami?',
    'akred.verifyDesc': 'Anda boleh semak status pendaftaran madrasah kami di portal rasmi JAIS Selangor',
    'akred.verifyBtn1': 'Portal JAIS Selangor',
    'akred.verifyBtn2': 'Tanya Kami'
});

homeTranslations.en = Object.assign(homeTranslations.en, {
    'nav.akred': '🏆 Accreditation',
    'akred.badge': 'Official Recognition',
    'akred.title': 'Recognized & Accredited<br><span class="section-title-accent">By Authorities</span>',
    'akred.subtitle': 'Our madrasah is officially registered and recognized by government agencies',

    // Trust badges
    'akred.t1Title': 'Officially Registered',
    'akred.t1Sub': 'Since 2014',
    'akred.t2Title': 'JAIS Accredited',
    'akred.t2Sub': 'Selangor',
    'akred.t3Title': 'Halal Certified',
    'akred.t3Sub': 'Halal food',
    'akred.t4Title': '10+ Years',
    'akred.t4Sub': 'Experience',

    // Logos
    'akred.logosTitle': '🏛️ Recognition & Official Registration',
    'akred.jakim': 'Department of Islamic Development Malaysia',
    'akred.jais': 'Selangor Islamic Religious Department',
    'akred.kpm': 'Ministry of Education Malaysia',
    'akred.ssm': 'Registrar of Societies',
    'akred.halal': 'Halal Food Certificate',
    'akred.tahfiz': 'Tahfiz Recognition',
    'akred.verified': 'Registered',
    'akred.note': '💡 Click any logo to view official certificate',

    // Info cards
    'akred.info1Title': 'Registration No.',
    'akred.info1Sub': 'Registered with JAIS Selangor',
    'akred.info2Title': 'Established',
    'akred.info2Sub': 'Over 10 years operating',
    'akred.info3Title': 'Total Students',
    'akred.info3Sub': 'Active students yearly',
    'akred.info4Title': 'Alumni',
    'akred.info4Sub': 'Successful Quran completion',

    // Achievements
    'akred.achTitle': 'Achievements & Awards',
    'akred.ach1': 'Best Tahfiz Award',
    'akred.ach2': 'District Tilawah Champion',
    'akred.ach3': '50+ Quran Completion',
    'akred.ach4': 'Community Recognition',

    // Verification
    'akred.verifyTitle': 'Want To Verify Our Registration?',
    'akred.verifyDesc': 'You can check our madrasah registration status at the official JAIS Selangor portal',
    'akred.verifyBtn1': 'JAIS Selangor Portal',
    'akred.verifyBtn2': 'Ask Us'
});

if (typeof applyHomeTranslations === 'function') {
    applyHomeTranslations();
}

// ============================================
// ===== AUTO-LOAD FROM FIREBASE ==============
// ============================================

// ============================================
// ===== AUTO-LOAD FROM FIREBASE (UPDATED) ====
// ============================================

function loadSiteContentFromFirebase() {
    if (!homeFirebaseDb) return;

    homeFirebaseDb.ref('hafazanData/siteContent').once('value')
        .then(function(snapshot) {
            var content = snapshot.val();
            if (!content) return;

            // Load Team
            if (content.team && content.team.members) {
                renderTeamFromCMS(content.team.members);
            }

            // Load FAQs
            if (content.faq && content.faq.list) {
                renderFAQFromCMS(content.faq.list);
            }

            // Load Testimonials
            if (content.testimoni && content.testimoni.list) {
                renderTestimoniFromCMS(content.testimoni.list);
            }

            // Load Tentang Kami
            if (content.tentang) {
                renderTentangFromCMS(content.tentang);
            }

            // Load Yuran
            if (content.yuran) {
                renderYuranFromCMS(content.yuran);
            }

            // Load Payment Info
            if (content.payment) {
                renderPaymentFromCMS(content.payment);
            }
            // Load Akreditasi
            if (content.akreditasi) {
                renderAkreditasiFromCMS(content.akreditasi);
            }

            // Load Programs
            if (content.programs && content.programs.list) {
                renderProgramsFromCMS(content.programs);
            }

            // Load Infaq
            if (content.infaq) {
                renderInfaqFromCMS(content.infaq);
            }

            // Load Quiz
            if (content.quiz) {
                renderQuizFromCMS(content.quiz);
            }
            
        })
        
        .catch(function(err) {
            console.log('Site content load error:', err.message);
        });
}

// ===== RENDER TENTANG KAMI =====
function renderTentangFromCMS(t) {
    // Update badge
    var badge = document.querySelector('.about-section .section-badge span:last-child');
    if (badge && t.badge) badge.textContent = t.badge;

    // Update title
    var title = document.querySelector('.about-section .section-title');
    if (title && t.title) {
        var accent = t.titleAccent ? '<br><span class="section-title-accent">' + t.titleAccent + '</span>' : '';
        title.innerHTML = t.title + accent;
    }

    // Update subtitle
    var subtitle = document.querySelector('.about-section .section-subtitle');
    if (subtitle && t.subtitle) subtitle.textContent = t.subtitle;

    // Update main heading
    var heading = document.querySelector('.about-content h3');
    if (heading && t.heading) heading.textContent = t.heading;

    // Update paragraphs
    var paragraphs = document.querySelectorAll('.about-content > p');
    if (paragraphs[0] && t.paragraph1) paragraphs[0].textContent = t.paragraph1;
    if (paragraphs[1] && t.paragraph2) paragraphs[1].textContent = t.paragraph2;

    // Update features
    if (t.features && t.features.length === 4) {
        var features = document.querySelectorAll('.about-feature');
        for (var i = 0; i < 4 && i < features.length; i++) {
            var titleEl = features[i].querySelector('h4');
            var descEl = features[i].querySelector('p');
            if (titleEl && t.features[i].title) titleEl.textContent = t.features[i].title;
            if (descEl && t.features[i].desc) descEl.textContent = t.features[i].desc;
        }
    }

    // Update vision cards
    var visionCards = document.querySelectorAll('.vision-card p');
    if (visionCards[0] && t.vision) visionCards[0].textContent = t.vision;
    if (visionCards[1] && t.mission) visionCards[1].textContent = t.mission;
    if (visionCards[2] && t.values) visionCards[2].textContent = t.values;
}

// ===== RENDER YURAN =====
function renderYuranFromCMS(y) {
    // Update header
    var badge = document.querySelector('.yuran-section .section-badge span:last-child');
    if (badge && y.badge) badge.textContent = y.badge;

    var title = document.querySelector('.yuran-section .section-title');
    if (title && y.title) {
        var subtitle = y.subtitle ? '<br><span style="background:linear-gradient(135deg,#fbbf24,#fde68a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">' + y.subtitle + '</span>' : '';
        title.innerHTML = y.title + subtitle;
    }

    // Get all 3 yuran cards
    var cards = document.querySelectorAll('.yuran-card');
    if (cards.length < 3) return;

    // Card 1: Pendaftaran
    if (y.registration) {
        updateYuranCard(cards[0], y.registration, 'Yuran Pendaftaran');
    }

    // Card 2: Bulanan (Featured)
    if (y.monthly) {
        updateYuranCard(cards[1], y.monthly, 'Yuran Bulanan');
    }

    // Card 3: Khatam
    if (y.khatam) {
        updateYuranCard(cards[2], y.khatam, 'Pakej Khatam');
    }

    // Discount banner
    if (y.siblingDiscount) {
        var discountAmount = document.querySelector('.discount-percent');
        if (discountAmount) discountAmount.textContent = '-RM' + y.siblingDiscount;

        var discountDesc = document.querySelector('.discount-content p');
        if (discountDesc) {
            discountDesc.innerHTML = 'Daftar <strong>2 anak ke atas</strong> dapat diskaun <strong>RM' + y.siblingDiscount + '/bulan</strong> setiap anak ke-2 dan seterusnya.';
        }
    }
}

function updateYuranCard(card, data, defaultTitle) {
    if (!card || !data) return;

    var titleEl = card.querySelector('.yuran-card-title');
    if (titleEl) titleEl.textContent = defaultTitle;

    var subEl = card.querySelector('.yuran-card-subtitle');
    if (subEl && data.description) subEl.textContent = data.description;

    var amountEl = card.querySelector('.yuran-amount');
    if (amountEl && data.amount) amountEl.textContent = data.amount;

    var periodEl = card.querySelector('.yuran-period');
    if (periodEl && data.period) periodEl.textContent = data.period;

    // Update features
    if (data.features && data.features.length > 0) {
        var featuresEl = card.querySelector('.yuran-features');
        if (featuresEl) {
            var html = '';
            for (var i = 0; i < data.features.length; i++) {
                html += '<li><span class="check">✓</span> <span>' + data.features[i] + '</span></li>';
            }
            featuresEl.innerHTML = html;
        }
    }
}

// ===== RENDER PAYMENT =====
function renderPaymentFromCMS(p) {
    // Update bank info in yuran section
    var bankDetails = document.querySelector('.bank-details');
    if (!bankDetails) return;

    var bankItems = bankDetails.querySelectorAll('.bank-detail-item');
    if (bankItems.length >= 3) {
        // Bank name
        var bankValue = bankItems[0].querySelector('.bank-value');
        if (bankValue && p.bankName) bankValue.textContent = p.bankName;

        // Account name
        var accNameValue = bankItems[1].querySelector('.bank-value');
        if (accNameValue && p.accountName) accNameValue.textContent = p.accountName;

        // Account number
        var accNumValue = document.getElementById('bankAccNumber');
        if (accNumValue && p.accountNumber) accNumValue.textContent = p.accountNumber;
    }

    // Update payment methods
    if (p.methods && p.methods.length === 4) {
        var methodCards = document.querySelectorAll('.payment-method');
        for (var i = 0; i < 4 && i < methodCards.length; i++) {
            var nameEl = methodCards[i].querySelector('.payment-name');
            var descEl = methodCards[i].querySelector('.payment-desc');
            if (nameEl && p.methods[i].name) nameEl.textContent = p.methods[i].name;
            if (descEl && p.methods[i].desc) descEl.textContent = p.methods[i].desc;
        }
    }

    // Update notes
    if (p.notes) {
        var bankNote = document.querySelector('.bank-note');
        if (bankNote) bankNote.innerHTML = '💡 ' + p.notes;
    }
}

// ===== RENDER TEAM FROM CMS =====
function renderTeamFromCMS(members) {
    var grid = document.querySelector('.team-grid');
    if (!grid) return;

    // Filter active only
    var activeMembers = members.filter(function(m) { return m.status !== 'hidden'; });

    if (activeMembers.length === 0) return;

    // Sort: featured first
    activeMembers.sort(function(a, b) {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    });

    var html = '';
    for (var i = 0; i < activeMembers.length; i++) {
        var m = activeMembers[i];
        var featuredClass = m.featured ? ' team-card-featured' : '';

        html += '<div class="team-card' + featuredClass + '">';
        if (m.featured) {
            html += '<div class="team-card-badge">👑 Mudir</div>';
        }
        html += '<div class="team-image-wrapper">';
        html += '<div class="team-image team-placeholder">';
        html += '<span>' + (m.icon || '👨‍🏫') + '</span>';
        html += '</div>';
        html += '<div class="team-image-glow"></div>';
        html += '</div>';
        html += '<div class="team-info">';
        html += '<h3 class="team-name">' + m.name + '</h3>';
        html += '<p class="team-role">' + m.role + '</p>';

        if (m.education || m.experience) {
            html += '<div class="team-stats">';
            if (m.education) html += '<div class="team-stat"><span class="team-stat-icon">🎓</span><span>' + m.education + '</span></div>';
            if (m.experience) html += '<div class="team-stat"><span class="team-stat-icon">⭐</span><span>' + m.experience + '</span></div>';
            html += '</div>';
        }

        if (m.bio) {
            html += '<p class="team-bio">' + m.bio + '</p>';
        }

        if (m.specialty1 || m.specialty2) {
            html += '<div class="team-specialties">';
            if (m.specialty1) html += '<span class="team-specialty">' + m.specialty1 + '</span>';
            if (m.specialty2) html += '<span class="team-specialty">' + m.specialty2 + '</span>';
            html += '</div>';
        }

        if (m.phone) {
            html += '<a href="tel:' + m.phone + '" class="team-contact">';
            html += '<span>📞</span>';
            html += '<span>' + m.phone + '</span>';
            html += '</a>';
        }

        html += '</div>';
        html += '</div>';
    }

    grid.innerHTML = html;
}

// ===== RENDER FAQ FROM CMS =====
function renderFAQFromCMS(faqs) {
    var list = document.querySelector('.faq-list');
    if (!list) return;

    var activeFaqs = faqs.filter(function(f) { return f.status !== 'hidden'; });
    if (activeFaqs.length === 0) return;

    // Sort by order
    activeFaqs.sort(function(a, b) {
        return (a.order || 0) - (b.order || 0);
    });

    var html = '';
    for (var i = 0; i < activeFaqs.length; i++) {
        var f = activeFaqs[i];
        html += '<div class="faq-item">';
        html += '<button class="faq-question" onclick="toggleFaq(this)">';
        html += '<span>' + f.question + '</span>';
        html += '<span class="faq-icon">+</span>';
        html += '</button>';
        html += '<div class="faq-answer">';
        html += '<p>' + f.answer + '</p>';
        html += '</div>';
        html += '</div>';
    }

    list.innerHTML = html;
}

// ===== RENDER TESTIMONI FROM CMS (WITH MEDIA) =====
function renderTestimoniFromCMS(testimonials) {
    var grid = document.querySelector('.testimonials-grid');
    if (!grid) return;

    var active = testimonials.filter(function(t) { return t.status !== 'hidden'; });
    if (active.length === 0) return;

    var html = '';
    for (var i = 0; i < active.length; i++) {
        var t = active[i];
        var stars = '';
        for (var s = 0; s < (t.rating || 5); s++) {
            stars += '⭐';
        }

        html += '<div class="testimonial-card testimonial-' + (t.type || 'text') + '">';

                // Media section
        if (t.type === 'video' && t.videoUrl) {
            var videoId = extractYouTubeIdHome(t.videoUrl);

            if (videoId) {
                // YouTube embed
                html += '<div class="testimonial-video-wrapper">';
                html += '<iframe src="https://www.youtube.com/embed/' + videoId + '" ';
                html += 'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ';
                html += 'allowfullscreen></iframe>';
                html += '</div>';
            } else {
                // Direct video (uploaded or URL)
                html += '<div class="testimonial-video-wrapper" style="padding-bottom:0;height:auto;">';
                html += '<video controls style="width:100%;max-height:400px;border-radius:16px 16px 0 0;background:#000;" preload="metadata">';
                html += '<source src="' + t.videoUrl + '" type="video/mp4">';
                html += 'Video tidak dapat dipaparkan';
                html += '</video>';
                html += '</div>';
            }
        } else if (t.type === 'photo' && t.photoUrl) {
            html += '<div class="testimonial-photo-wrapper">';
            html += '<img src="' + t.photoUrl + '" alt="' + t.name + '" loading="lazy">';
            html += '</div>';
        }

        html += '<div class="testimonial-quote">"</div>';
        html += '<p class="testimonial-text">' + t.text + '</p>';
        html += '<div class="testimonial-rating">' + stars + '</div>';
        html += '<div class="testimonial-author">';

        // Avatar
        if (t.type === 'photo' && t.photoUrl) {
            html += '<div class="testimonial-avatar testimonial-avatar-photo">';
            html += '<img src="' + t.photoUrl + '" alt="' + t.name + '">';
            html += '</div>';
        } else {
            html += '<div class="testimonial-avatar">' + (t.icon || '👤') + '</div>';
        }

        html += '<div class="testimonial-info">';
        html += '<div class="testimonial-name">' + t.name + '</div>';
        html += '<div class="testimonial-role">' + t.role + '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }

    grid.innerHTML = html;
}

// Helper function untuk extract YouTube ID
function extractYouTubeIdHome(url) {
    if (!url) return null;

    var patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

// Load on page load (after Firebase init)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadSiteContentFromFirebase, 1500);
});

// ============================================
// ===== RENDER AKREDITASI ====================
// ============================================
function renderAkreditasiFromCMS(a) {
    var badge = document.querySelector('.akreditasi-section .section-badge span:last-child');
    if (badge && a.badge) badge.textContent = a.badge;

    var title = document.querySelector('.akreditasi-section .section-title');
    if (title && a.title) {
        var accent = a.titleAccent ? '<br><span class="section-title-accent">' + a.titleAccent + '</span>' : '';
        title.innerHTML = a.title + accent;
    }

    var subtitle = document.querySelector('.akreditasi-section .section-subtitle');
    if (subtitle && a.subtitle) subtitle.textContent = a.subtitle;

    // Info cards
    var infoCards = document.querySelectorAll('.info-card .info-value');
    if (infoCards.length >= 4) {
        if (a.registrationNo) infoCards[0].textContent = a.registrationNo;
        if (a.yearEstablished) infoCards[1].textContent = a.yearEstablished;
        if (a.totalStudents) infoCards[2].textContent = a.totalStudents;
        if (a.totalAlumni) infoCards[3].textContent = a.totalAlumni;
    }

    // Trust badges
    if (a.trustBadges && a.trustBadges.length === 4) {
        var trustBadges = document.querySelectorAll('.trust-badge .trust-text');
        for (var i = 0; i < 4 && i < trustBadges.length; i++) {
            var titleEl = trustBadges[i].querySelector('strong');
            var subEl = trustBadges[i].querySelector('small');
            if (titleEl && a.trustBadges[i].title) titleEl.textContent = a.trustBadges[i].title;
            if (subEl && a.trustBadges[i].sub) subEl.textContent = a.trustBadges[i].sub;
        }
    }

    // Achievements
    if (a.achievements && a.achievements.length === 4) {
        var achievements = document.querySelectorAll('.achievement-text');
        for (var i = 0; i < 4 && i < achievements.length; i++) {
            var titleEl = achievements[i].querySelector('strong');
            var subEl = achievements[i].querySelector('small');
            if (titleEl && a.achievements[i].title) titleEl.textContent = a.achievements[i].title;
            if (subEl && a.achievements[i].sub) subEl.textContent = a.achievements[i].sub;
        }
    }
}

// ============================================
// ===== RENDER PROGRAMS ======================
// ============================================
function renderProgramsFromCMS(p) {
    // Header
    var badge = document.querySelector('.programs-section .section-badge span:last-child');
    if (badge && p.badge) badge.textContent = p.badge;

    var title = document.querySelector('.programs-section .section-title');
    if (title && p.title) {
        var accent = p.subtitle ? '<br><span class="section-title-accent">' + p.subtitle + '</span>' : '';
        title.innerHTML = p.title + accent;
    }

    // Programs grid
    if (!p.list || p.list.length === 0) return;

    var grid = document.querySelector('.programs-grid');
    if (!grid) return;

    var activePrograms = p.list.filter(function(prog) { return prog.status !== 'hidden'; });
    activePrograms.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });

    var html = '';
    for (var i = 0; i < activePrograms.length; i++) {
        var prog = activePrograms[i];
        var featuredClass = prog.featured ? ' program-card-featured' : '';

        html += '<div class="program-card' + featuredClass + '">';
        if (prog.featured) {
            html += '<div class="program-badge">⭐ Popular</div>';
        }
        html += '<div class="program-icon">' + (prog.icon || '📚') + '</div>';
        html += '<h3 class="program-title">' + prog.name + '</h3>';
        html += '<p class="program-desc">' + prog.description + '</p>';

        if (prog.features && prog.features.length > 0) {
            html += '<ul class="program-features">';
            for (var j = 0; j < prog.features.length; j++) {
                html += '<li><span>✓</span> <span>' + prog.features[j] + '</span></li>';
            }
            html += '</ul>';
        }

        html += '<div class="program-meta">';
        if (prog.age) html += '<span class="program-age">👶 ' + prog.age + '</span>';
        if (prog.classLabel) html += '<span class="program-class">' + prog.classLabel + '</span>';
        html += '</div>';
        html += '</div>';
    }

    grid.innerHTML = html;
}

// ============================================
// ===== RENDER INFAQ =========================
// ============================================
function renderInfaqFromCMS(inf) {
    // Header
    var badge = document.querySelector('.donation-section .section-badge span:last-child');
    if (badge && inf.badge) badge.textContent = inf.badge;

    var title = document.querySelector('.donation-section .section-title');
    if (title && inf.title) {
        var accent = inf.subtitle ? '<br><span class="section-title-accent">' + inf.subtitle + '</span>' : '';
        title.innerHTML = inf.title + accent;
    }

    // Update utility bills
    if (inf.utilityBills && inf.utilityBills.length === 3) {
        var billItems = document.querySelectorAll('.bill-item');
        for (var i = 0; i < 3 && i < billItems.length; i++) {
            var nameEl = billItems[i].querySelector('.bill-name');
            var amountEl = billItems[i].querySelector('.bill-amount');
            if (nameEl && inf.utilityBills[i].name) nameEl.textContent = inf.utilityBills[i].name;
            if (amountEl && inf.utilityBills[i].amount) amountEl.textContent = inf.utilityBills[i].amount;
        }
    }

    // Update essentials
    if (inf.essentials && inf.essentials.length === 6) {
        var essentialItems = document.querySelectorAll('.essential-item');
        for (var i = 0; i < 6 && i < essentialItems.length; i++) {
            var nameEl = essentialItems[i].querySelector('.essential-name');
            var priceEl = essentialItems[i].querySelector('.essential-price');
            if (nameEl && inf.essentials[i].name) nameEl.textContent = inf.essentials[i].name;
            if (priceEl && inf.essentials[i].price) priceEl.textContent = 'RM ' + inf.essentials[i].price;
        }
    }

    // Update meal packages
    if (inf.mealPackages && inf.mealPackages.length === 3) {
        var mealPackages = document.querySelectorAll('.meal-package:not(.custom)');
        for (var i = 0; i < 3 && i < mealPackages.length; i++) {
            var nameEl = mealPackages[i].querySelector('.meal-name');
            var detailEl = mealPackages[i].querySelector('.meal-detail');
            var priceEl = mealPackages[i].querySelector('.meal-price');

            if (nameEl && inf.mealPackages[i].name) nameEl.textContent = inf.mealPackages[i].name;
            if (detailEl && inf.mealPackages[i].detail) detailEl.textContent = inf.mealPackages[i].detail;
            if (priceEl && inf.mealPackages[i].price) priceEl.textContent = 'RM ' + inf.mealPackages[i].price;
        }
    }
}

// ============================================
// ===== RENDER QUIZ ==========================
// ============================================
function renderQuizFromCMS(q) {
    // Header
    var badge = document.querySelector('.quiz-section .section-badge span:last-child');
    if (badge && q.badge) badge.textContent = q.badge;

    var title = document.querySelector('.quiz-section .section-title');
    if (title && q.title) {
        var accent = q.titleAccent ? '<br><span class="section-title-accent">' + q.titleAccent + '</span>' : '';
        title.innerHTML = q.title + accent;
    }

    var subtitle = document.querySelector('.quiz-section .section-subtitle');
    if (subtitle && q.subtitle) subtitle.textContent = q.subtitle;

    // Start screen
    var startTitle = document.querySelector('#quizStart h3');
    if (startTitle && q.startTitle) startTitle.textContent = q.startTitle;

    var startDesc = document.querySelector('#quizStart p:not(.quiz-disclaimer)');
    if (startDesc && q.startDesc) {
        startDesc.innerHTML = q.startDesc.replace(/2 minit/g, '<strong>' + (q.duration || '2 Minit') + '</strong>');
    }

    var startBtn = document.querySelector('.btn-quiz-start span');
    if (startBtn && q.startBtn) startBtn.textContent = q.startBtn;

    var disclaimer = document.querySelector('.quiz-disclaimer');
    if (disclaimer && q.disclaimer) disclaimer.textContent = q.disclaimer;

    // Features numbers
    var featureNums = document.querySelectorAll('.feature-num');
    if (featureNums.length >= 3) {
        if (q.numQuestions) featureNums[0].textContent = q.numQuestions;
        if (q.duration) {
            var parts = q.duration.split(' ');
            if (parts[0] && !isNaN(parts[0])) {
                featureNums[1].textContent = parts[0];
            }
        }
        if (q.numClasses) featureNums[2].textContent = q.numClasses;
    }

    // Result screen
    var resultTitle = document.querySelector('#quizResult h3');
    if (resultTitle && q.resultTitle) resultTitle.textContent = q.resultTitle;

    var resultSub = document.querySelector('.result-subtitle');
    if (resultSub && q.resultSub) resultSub.textContent = q.resultSub;

    // Buttons
    var btnRegister = document.querySelector('.btn-quiz-primary span:last-child');
    if (btnRegister && q.btnRegister) btnRegister.textContent = q.btnRegister;

    var btnContact = document.querySelector('.btn-quiz-secondary span:last-child');
    if (btnContact && q.btnContact) btnContact.textContent = q.btnContact;
}

// ============================================
// ===== HERO VIDEO BACKGROUND ================
// ============================================

// Default video URLs (kalau admin belum set)
var DEFAULT_HERO_VIDEO = ''; // Kosong = takda video default
var DEFAULT_HERO_FALLBACK = ''; // Image fallback

function setupHeroVideo(videoUrl, fallbackImage) {
    if (!videoUrl) return;

    var hero = document.querySelector('.hero-premium');
    if (!hero) return;

    var isMobile = window.innerWidth <= 768;
    var isSaveData = navigator.connection && navigator.connection.saveData;

    // Check if YouTube URL
    var youtubeId = extractYouTubeIdHero(videoUrl);

    if (isMobile || isSaveData) {
        // Mobile - show fallback image only
        var fallback = document.getElementById('heroVideoFallback');
        if (fallbackImage && fallback) {
            fallback.style.backgroundImage = 'url(' + fallbackImage + ')';
            fallback.classList.add('show');
        }
        hero.classList.add('has-video');
        return;
    }

    if (youtubeId) {
        // YouTube Mode - guna iframe
        setupYouTubeHeroVideo(youtubeId, fallbackImage);
    } else {
        // Direct Video Mode (MP4)
        setupDirectHeroVideo(videoUrl, fallbackImage);
    }
}

function setupYouTubeHeroVideo(videoId, fallbackImage) {
    var hero = document.querySelector('.hero-premium');
    var videoContainer = document.getElementById('heroVideoContainer');
    var fallback = document.getElementById('heroVideoFallback');

    if (!hero || !videoContainer) return;

    // Show fallback while loading
    if (fallbackImage && fallback) {
        fallback.style.backgroundImage = 'url(' + fallbackImage + ')';
        fallback.classList.add('show');
    }

    // Hide existing video element
    var existingVideo = document.getElementById('heroBackgroundVideo');
    if (existingVideo) existingVideo.style.display = 'none';

    // Create YouTube iframe (muted, looped, autoplay)
    var iframe = document.createElement('iframe');
    iframe.id = 'heroYouTubeIframe';
    iframe.src = 'https://www.youtube.com/embed/' + videoId +
                 '?autoplay=1&mute=1&loop=1&playlist=' + videoId +
                 '&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3' +
                 '&playsinline=1&disablekb=1&fs=0';
    iframe.frameborder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowfullscreen = false;

    // Style iframe
    iframe.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100vw;
        height: 56.25vw;
        min-height: 100vh;
        min-width: 177.77vh;
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 1.5s ease-in-out;
        z-index: 0;
    `;

    videoContainer.appendChild(iframe);
    hero.classList.add('has-video');

    // Fade in after 2 seconds (give time to load)
    setTimeout(function() {
        iframe.style.opacity = '0.5'; // Adjust opacity here

        // Fade out fallback
        if (fallback) {
            setTimeout(function() {
                fallback.classList.remove('show');
            }, 500);
        }
    }, 2000);
}

function setupDirectHeroVideo(videoUrl, fallbackImage) {
    var hero = document.querySelector('.hero-premium');
    var video = document.getElementById('heroBackgroundVideo');
    var fallback = document.getElementById('heroVideoFallback');
    var source = video ? video.querySelector('source') : null;

    if (!hero || !video || !source) return;

    // Setup fallback
    if (fallbackImage && fallback) {
        fallback.style.backgroundImage = 'url(' + fallbackImage + ')';
        fallback.classList.add('show');
    }

    source.src = videoUrl;
    if (fallbackImage) {
        video.setAttribute('poster', fallbackImage);
    }

    hero.classList.add('has-video');
    video.load();
    showVideoLoading();

    video.addEventListener('canplay', function() {
        video.classList.add('loaded');
        hideVideoLoading();

        if (fallback) {
            setTimeout(function() {
                fallback.classList.remove('show');
            }, 500);
        }
    });

    video.addEventListener('error', function() {
        console.log('Video failed to load');
        hideVideoLoading();
        if (fallback) {
            fallback.classList.add('show');
        }
    });

    var playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(function(error) {
            console.log('Autoplay prevented:', error);
            showVideoPlayButton();
        });
    }
}

// Helper: Extract YouTube ID
function extractYouTubeIdHero(url) {
    if (!url) return null;

    var patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

function showVideoLoading() {
    var hero = document.querySelector('.hero-premium');
    if (!hero) return;

    var loadingEl = hero.querySelector('.hero-video-loading');
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.className = 'hero-video-loading';
        loadingEl.textContent = 'Loading video...';
        hero.appendChild(loadingEl);
    }
    loadingEl.classList.add('show');
}

function hideVideoLoading() {
    var loadingEl = document.querySelector('.hero-video-loading');
    if (loadingEl) {
        loadingEl.classList.remove('show');
        setTimeout(function() {
            if (loadingEl.parentNode) {
                loadingEl.parentNode.removeChild(loadingEl);
            }
        }, 500);
    }
}

function showVideoPlayButton() {
    var hero = document.querySelector('.hero-premium');
    if (!hero) return;

    var controlsEl = hero.querySelector('.hero-video-controls');
    if (!controlsEl) {
        controlsEl = document.createElement('div');
        controlsEl.className = 'hero-video-controls';
        controlsEl.innerHTML = '<button class="video-control-btn" onclick="manualPlayVideo()">▶</button>';
        controlsEl.innerHTML += '<span style="color:white;font-size:0.85rem;">Click to play video</span>';
        hero.appendChild(controlsEl);
    }
    controlsEl.classList.add('show');
}

function manualPlayVideo() {
    var video = document.getElementById('heroBackgroundVideo');
    if (video) {
        video.play();
        var controls = document.querySelector('.hero-video-controls');
        if (controls) {
            controls.classList.remove('show');
        }
    }
}

// Toggle video on/off (untuk admin atau user preference)
function toggleHeroVideo() {
    var video = document.getElementById('heroBackgroundVideo');
    if (!video) return;

    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

// ============================================
// ===== HERO VIDEO - FIXED AUTO LOAD =========
// ============================================

// Load hero video dari Firebase
function loadHeroVideoFromCMS() {
    console.log('🎬 Loading hero video...');

    if (!homeFirebaseDb) {
        console.log('❌ Firebase not ready');
        return;
    }

    homeFirebaseDb.ref('hafazanData/siteContent/heroVideo').once('value')
        .then(function(snapshot) {
            var data = snapshot.val();

            if (!data) {
                console.log('❌ No heroVideo data');
                return;
            }

            if (data.status === 'disabled') {
                console.log('⏸ Video disabled by admin');
                return;
            }

            if (!data.videoUrl) {
                console.log('❌ No video URL');
                return;
            }

            console.log('✅ Video URL found:', data.videoUrl);
            console.log('📊 Opacity:', data.opacity);

            // Extract YouTube ID
            var videoId = null;
            var url = data.videoUrl;
            var patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                /youtube\.com\/v\/([^&\n?#]+)/,
                /youtube\.com\/shorts\/([^&\n?#]+)/
            ];

            for (var i = 0; i < patterns.length; i++) {
                var match = url.match(patterns[i]);
                if (match && match[1]) {
                    videoId = match[1];
                    break;
                }
            }

            if (!videoId) {
                console.log('❌ Cannot extract YouTube ID from:', url);
                return;
            }

            console.log('✅ YouTube ID:', videoId);

            // Get elements
            var hero = document.querySelector('.hero-premium');
            var videoContainer = document.getElementById('heroVideoContainer');

            if (!hero || !videoContainer) {
                console.log('❌ Hero or video container not found');
                return;
            }

            // Hide existing video element
            var existingVideo = document.getElementById('heroBackgroundVideo');
            if (existingVideo) existingVideo.style.display = 'none';

            // Remove existing iframe
            var existingIframe = document.getElementById('heroYouTubeIframe');
            if (existingIframe) existingIframe.remove();

            // Create YouTube iframe
            var opacity = (data.opacity || 50) / 100;

            var iframe = document.createElement('iframe');
            iframe.id = 'heroYouTubeIframe';
            iframe.src = 'https://www.youtube.com/embed/' + videoId +
                         '?autoplay=1&mute=1&loop=1&playlist=' + videoId +
                         '&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3' +
                         '&playsinline=1&disablekb=1&fs=0';
            iframe.frameBorder = '0';
            iframe.allow = 'autoplay; encrypted-media';
            iframe.setAttribute('allowfullscreen', '');

            iframe.style.cssText =
                'position: absolute !important;' +
                'top: 50% !important;' +
                'left: 50% !important;' +
                'width: 100vw !important;' +
                'height: 56.25vw !important;' +
                'min-height: 100vh !important;' +
                'min-width: 177.77vh !important;' +
                'transform: translate(-50%, -50%) !important;' +
                'pointer-events: none !important;' +
                'opacity: 0 !important;' +
                'transition: opacity 2s ease-in-out !important;' +
                'z-index: 0 !important;' +
                'border: none !important;';

            videoContainer.appendChild(iframe);
            hero.classList.add('has-video');

            // Fade in after 2 seconds
            setTimeout(function() {
                iframe.style.opacity = opacity + ' !important';
                iframe.style.setProperty('opacity', opacity, 'important');
                console.log('✅ Video fading in, opacity:', opacity);
            }, 2000);

            console.log('✅ YouTube iframe created successfully!');
        })
        .catch(function(err) {
            console.log('❌ Firebase error:', err.message);
        });
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Try multiple times
    setTimeout(loadHeroVideoFromCMS, 2000);
    setTimeout(loadHeroVideoFromCMS, 4000);
    setTimeout(loadHeroVideoFromCMS, 6000);
});

window.addEventListener('load', function() {
    setTimeout(loadHeroVideoFromCMS, 3000);
});

console.log('✅ Hero Video Fixed Auto Load ready');

// ============================================
// ===== PARALLAX & SCROLL EFFECTS ============
// ============================================

(function() {
    'use strict';

    // ===== 1. SCROLL REVEAL (Fade In On Scroll) =====

    function initScrollReveal() {
        // Add scroll-reveal class to elements
        var sections = document.querySelectorAll('.section-header');
        for (var i = 0; i < sections.length; i++) {
            sections[i].classList.add('scroll-reveal');
        }

        // Section badges
        var badges = document.querySelectorAll('.section-badge');
        for (var i = 0; i < badges.length; i++) {
            badges[i].classList.add('scroll-reveal');
        }

        // Cards - stagger animation
        var grids = document.querySelectorAll('.programs-grid, .team-grid, .testimonials-grid, .logos-grid, .achievements-grid, .yuran-grid, .donation-grid, .events-grid');
        for (var i = 0; i < grids.length; i++) {
            grids[i].classList.add('scroll-reveal-stagger');
            var children = grids[i].children;
            for (var j = 0; j < children.length; j++) {
                children[j].classList.add('scroll-reveal');
            }
        }

        // Individual cards
        var cards = document.querySelectorAll('.program-card, .team-card, .testimonial-card, .logo-card, .info-card, .achievement-item, .yuran-card, .donation-card, .event-card, .faq-item, .contact-card, .contact-action-card, .vision-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.add('scroll-reveal');
        }

        // About content
        var aboutContent = document.querySelector('.about-content');
        if (aboutContent) aboutContent.classList.add('scroll-reveal-left');

        var aboutVisual = document.querySelector('.about-visual');
        if (aboutVisual) aboutVisual.classList.add('scroll-reveal-right');

        // Featured event
        var featuredEvent = document.querySelector('.event-featured');
        if (featuredEvent) featuredEvent.classList.add('scroll-reveal-scale');

        // Quiz container
        var quizContainer = document.querySelector('.quiz-container');
        if (quizContainer) quizContainer.classList.add('scroll-reveal-scale');

        // CTA sections
        var ctas = document.querySelectorAll('.programs-cta, .team-cta, .events-cta, .donation-cta, .verification-cta, .yuran-cta');
        for (var i = 0; i < ctas.length; i++) {
            ctas[i].classList.add('scroll-reveal');
        }

        // Trust strip
        var trustStrip = document.querySelector('.trust-strip');
        if (trustStrip) trustStrip.classList.add('scroll-reveal');

        // Bank info
        var bankInfo = document.querySelector('.bank-info-card');
        if (bankInfo) bankInfo.classList.add('scroll-reveal');

        // Inspiration quote
        var inspiration = document.querySelector('.donation-inspiration');
        if (inspiration) inspiration.classList.add('scroll-reveal-scale');

        // Contact map
        var map = document.querySelector('.contact-map');
        if (map) map.classList.add('scroll-reveal');

        // Start observer
        observeScrollReveal();
    }

    function observeScrollReveal() {
        var revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            });

            for (var i = 0; i < revealElements.length; i++) {
                observer.observe(revealElements[i]);
            }
        } else {
            // Fallback: show all
            for (var i = 0; i < revealElements.length; i++) {
                revealElements[i].classList.add('revealed');
            }
        }
    }

    // ===== 2. HERO PARALLAX =====

    var heroParallaxEnabled = true;
    var ticking = false;

    function updateParallax() {
        if (!heroParallaxEnabled) return;

        var scrollY = window.pageYOffset;
        var hero = document.querySelector('.hero-premium');

        if (!hero) return;

        var heroHeight = hero.offsetHeight;

        // Only apply parallax when hero is visible
        if (scrollY > heroHeight + 200) return;

        // Hero background moves slower (parallax)
        var bgGradient = hero.querySelector('.hero-bg-gradient');
        var pattern = hero.querySelector('.hero-pattern');
        var orbs = hero.querySelectorAll('.orb');
        var stars = hero.querySelectorAll('.star');
        var heroContent = hero.querySelector('.hero-container-centered');
        var youtubeIframe = document.getElementById('heroYouTubeIframe');

        // Background moves at 30% speed
        if (bgGradient) {
            bgGradient.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
        }

        if (pattern) {
            pattern.style.transform = 'translateY(' + (scrollY * 0.2) + 'px)';
        }

        // Orbs move at different speeds
        for (var i = 0; i < orbs.length; i++) {
            var speed = 0.1 + (i * 0.05);
            orbs[i].style.transform = 'translateY(' + (scrollY * speed) + 'px)';
        }

        // Stars move faster
        for (var i = 0; i < stars.length; i++) {
            var speed = 0.15 + (i * 0.03);
            stars[i].style.transform = 'translateY(' + (scrollY * speed) + 'px)';
        }

        // Hero content fades out slightly on scroll
        if (heroContent) {
            var opacity = Math.max(0, 1 - (scrollY / heroHeight) * 1.2);
            var translateY = scrollY * 0.4;
            heroContent.style.opacity = opacity;
            heroContent.style.transform = 'translateY(' + translateY + 'px)';
        }

        // YouTube iframe parallax
        if (youtubeIframe) {
            youtubeIframe.style.transform = 'translate(-50%, calc(-50% + ' + (scrollY * 0.15) + 'px))';
        }

        ticking = false;
    }

    // ===== 3. SECTION PARALLAX DECORATIONS =====

    function updateSectionParallax() {
        var scrollY = window.pageYOffset;
        var windowHeight = window.innerHeight;

        // Parallax on section ::after pseudo elements via CSS variable
        var sections = document.querySelectorAll('.about-section, .programs-section, .quiz-section, .donation-section, .team-section, .events-section, .gallery-section, .testimonials-section, .faq-section');

        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var rect = section.getBoundingClientRect();

            // Only process if section is near viewport
            if (rect.top > windowHeight + 200 || rect.bottom < -200) continue;

            var scrollInSection = windowHeight - rect.top;
            var parallaxValue = scrollInSection * 0.05;

            section.style.setProperty('--parallax-y', parallaxValue + 'px');
        }
    }

    // ===== 4. CARD TILT 3D =====

    function initCardTilt() {
        var cards = document.querySelectorAll('.program-card, .team-card, .vision-card, .yuran-card, .donation-card');

        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.add('tilt-card');

            cards[i].addEventListener('mousemove', function(e) {
                var rect = this.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                var centerX = rect.width / 2;
                var centerY = rect.height / 2;

                var rotateX = (y - centerY) / centerY * -3;
                var rotateY = (x - centerX) / centerX * 3;

                this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-5px)';
            });

            cards[i].addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        }
    }

    // ===== 5. NAVBAR SHRINK =====

    function updateNavbar() {
        var navbar = document.getElementById('homeNavbar');
        if (!navbar) return;

        if (window.pageYOffset > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ===== MAIN SCROLL HANDLER =====

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateParallax();
                updateSectionParallax();
                updateNavbar();
                ticking = false;
            });
            ticking = true;
        }
    }

    // ===== INIT =====

    function initAllEffects() {
        // Check reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            heroParallaxEnabled = false;
            console.log('⚡ Reduced motion detected, parallax disabled');
            return;
        }

        // Check mobile (disable heavy parallax)
        if (window.innerWidth <= 768) {
            heroParallaxEnabled = false;
            initScrollReveal(); // Keep fade-in effects
            console.log('📱 Mobile detected, parallax simplified');
            return;
        }

        // Desktop - full effects
        initScrollReveal();
        initCardTilt();

        // Attach scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });

        console.log('✅ Parallax & scroll effects initialized');
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initAllEffects, 500);
        });
    } else {
        setTimeout(initAllEffects, 500);
    }

})();

// ============================================
// ===== VIRTUAL TOUR =========================
// ============================================

var tourCurrentPhoto = 0;
var tourCurrentPhotos = [];

var tourData = {
    kelas: {
        title: '📖 Kelas Hafazan',
        name: 'Kelas Hafazan',
        description: 'Bilik kelas kami direka khas untuk sesi hafazan dan talaqqi Al-Quran. Persekitaran yang tenang dan kondusif membantu pelajar fokus menghafaz.',
        features: [
            { icon: '📚', text: 'Kapasiti 20 pelajar' },
            { icon: '❄️', text: 'Ber-aircond' },
            { icon: '🪑', text: 'Kerusi & meja selesa' },
            { icon: '📋', text: 'Papan putih interaktif' },
            { icon: '🔇', text: 'Kalis bunyi' },
            { icon: '💡', text: 'Pencahayaan baik' }
        ],
        photos: []
    },
    surau: {
        title: '🕌 Surau Madrasah',
        name: 'Surau Madrasah',
        description: 'Surau yang luas dan selesa untuk solat berjemaah lima waktu, solat sunat, dan kelas malam. Dilengkapi sistem audio.',
        features: [
            { icon: '🕌', text: 'Mampu 100 jemaah' },
            { icon: '🔊', text: 'Sistem PA & audio' },
            { icon: '❄️', text: 'Ber-aircond penuh' },
            { icon: '📿', text: 'Sejadah & Al-Quran' },
            { icon: '🚿', text: 'Tempat wudhu' },
            { icon: '🧹', text: 'Sentiasa bersih' }
        ],
        photos: []
    },
    dapur: {
        title: '🍽️ Dapur & Ruang Makan',
        name: 'Dapur & Ruang Makan',
        description: 'Dapur bersih yang menyediakan makanan berkhasiat untuk pelajar. Ruang makan yang luas dan selesa.',
        features: [
            { icon: '🍳', text: '3 waktu makan sehari' },
            { icon: '🛡️', text: 'Makanan 100% halal' },
            { icon: '🥗', text: 'Menu seimbang' },
            { icon: '🧹', text: 'Standard kebersihan' },
            { icon: '🪑', text: 'Kapasiti 100 pelajar' },
            { icon: '💧', text: 'Air minuman bersih' }
        ],
        photos: []
    },
    asrama: {
        title: '🛏️ Asrama Pelajar',
        name: 'Asrama Pelajar',
        description: 'Asrama yang bersih dan selesa untuk pelajar bermastautin. Dipantau oleh warden 24 jam.',
        features: [
            { icon: '🛏️', text: 'Katil 2 tingkat' },
            { icon: '👮', text: 'Warden 24 jam' },
            { icon: '🏠', text: 'Loker peribadi' },
            { icon: '🚿', text: 'Bilik mandi bersih' },
            { icon: '❄️', text: 'Kipas & pengudaraan' },
            { icon: '🔒', text: 'Kawalan keselamatan' }
        ],
        photos: []
    },
    padang: {
        title: '🌳 Padang & Kawasan Luar',
        name: 'Padang & Kawasan Luar',
        description: 'Kawasan lapang yang luas untuk aktiviti sukan, riadah, dan gotong-royong.',
        features: [
            { icon: '⚽', text: 'Padang sukan' },
            { icon: '🏃', text: 'Trek jogging' },
            { icon: '🌳', text: 'Kawasan hijau' },
            { icon: '🅿️', text: 'Parking luas' },
            { icon: '💡', text: 'Lampu kawasan' },
            { icon: '🔒', text: 'Pagar keselamatan' }
        ],
        photos: []
    },
    pejabat: {
        title: '🏢 Pejabat Pentadbiran',
        name: 'Pejabat Pentadbiran',
        description: 'Pejabat pentadbiran untuk urusan pendaftaran, pembayaran, dan perjumpaan dengan ibu bapa.',
        features: [
            { icon: '📋', text: 'Pendaftaran pelajar' },
            { icon: '💰', text: 'Urusan pembayaran' },
            { icon: '👨‍👩‍👧', text: 'Bilik mesyuarat' },
            { icon: '🖥️', text: 'Sistem komputer' },
            { icon: '📞', text: 'Talian khidmat' },
            { icon: '❄️', text: 'Ber-aircond' }
        ],
        photos: []
    }
};

function openTourModal(areaKey) {
    var area = tourData[areaKey];
    if (!area) return;

    tourCurrentPhoto = 0;

    document.getElementById('tourModalTitle').textContent = area.title;
    document.getElementById('tourAreaName').textContent = area.name;
    document.getElementById('tourAreaDesc').textContent = area.description;

    // Render features
    var featuresHtml = '';
    for (var i = 0; i < area.features.length; i++) {
        var f = area.features[i];
        featuresHtml += '<div class="tour-feature-item"><span>' + f.icon + '</span>' + f.text + '</div>';
    }
    document.getElementById('tourFeatures').innerHTML = featuresHtml;

    // Photos - check CMS first, fallback to placeholder
    tourCurrentPhotos = area.photos && area.photos.length > 0 ? area.photos : [];

    if (tourCurrentPhotos.length > 0) {
        renderTourPhotos();
    } else {
        // Show placeholder
        var mainImg = document.getElementById('tourMainImage');
        mainImg.src = '';
        mainImg.style.display = 'none';

        var mainContainer = document.querySelector('.tour-main-photo');
        mainContainer.innerHTML =
            '<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);">' +
            '<span style="font-size:6rem;margin-bottom:15px;">📷</span>' +
            '<p style="color:#047857;font-weight:700;font-size:1.1rem;">Gambar akan dikemaskini</p>' +
            '<small style="color:#64748b;">Hubungi kami untuk lawatan fizikal</small>' +
            '</div>' +
            '<div class="tour-photo-counter" id="tourPhotoCounter">0 Gambar</div>';

        document.getElementById('tourThumbs').innerHTML = '';
    }

    // Show modal
    document.getElementById('tourModal').classList.remove('hidden');
    document.body.classList.add('popup-open');
}

function renderTourPhotos() {
    var mainImg = document.getElementById('tourMainImage');
    mainImg.src = tourCurrentPhotos[tourCurrentPhoto];
    mainImg.style.display = 'block';

    document.getElementById('tourPhotoCounter').textContent =
        (tourCurrentPhoto + 1) + ' / ' + tourCurrentPhotos.length;

    // Thumbnails
    var thumbsHtml = '';
    for (var i = 0; i < tourCurrentPhotos.length; i++) {
        var activeClass = i === tourCurrentPhoto ? ' active' : '';
        thumbsHtml += '<div class="tour-thumb' + activeClass + '" onclick="goToTourPhoto(' + i + ')">';
        thumbsHtml += '<img src="' + tourCurrentPhotos[i] + '" alt="">';
        thumbsHtml += '</div>';
    }
    document.getElementById('tourThumbs').innerHTML = thumbsHtml;
}

function goToTourPhoto(index) {
    tourCurrentPhoto = index;
    renderTourPhotos();
}

function tourPrevPhoto() {
    if (tourCurrentPhotos.length === 0) return;
    tourCurrentPhoto = (tourCurrentPhoto - 1 + tourCurrentPhotos.length) % tourCurrentPhotos.length;
    renderTourPhotos();
}

function tourNextPhoto() {
    if (tourCurrentPhotos.length === 0) return;
    tourCurrentPhoto = (tourCurrentPhoto + 1) % tourCurrentPhotos.length;
    renderTourPhotos();
}

function closeTourModal() {
    document.getElementById('tourModal').classList.add('hidden');
    document.body.classList.remove('popup-open');
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    var modal = document.getElementById('tourModal');
    if (modal && !modal.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') tourPrevPhoto();
        else if (e.key === 'ArrowRight') tourNextPhoto();
        else if (e.key === 'Escape') closeTourModal();
    }
});

// Close on overlay click
document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('tourModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeTourModal();
        });
    }
});

// Load tour photos from CMS
function loadTourFromCMS() {
    if (!homeFirebaseDb) return;

    homeFirebaseDb.ref('hafazanData/siteContent/virtualTour').once('value')
        .then(function(snapshot) {
            var data = snapshot.val();
            if (!data) return;

            // Update tourData with CMS photos
            for (var key in data) {
                if (tourData[key] && data[key]) {
                    if (data[key].photos) tourData[key].photos = data[key].photos;
                    if (data[key].title) tourData[key].title = data[key].title;
                    if (data[key].name) tourData[key].name = data[key].name;
                    if (data[key].description) tourData[key].description = data[key].description;

                    // Update card photo if available
                    if (data[key].photos && data[key].photos.length > 0) {
                        var card = document.querySelector('.vtour-card[onclick*="' + key + '"]');
                        if (card) {
                            var placeholder = card.querySelector('.vtour-card-placeholder');
                            if (placeholder) {
                                placeholder.innerHTML = '<img src="' + data[key].photos[0] + '" style="width:100%;height:100%;object-fit:cover;">';
                            }
                        }
                    }
                }
            }
        })
        .catch(function(err) {
            console.log('Tour load error:', err.message);
        });
}

// Auto-load tour data
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadTourFromCMS, 3000);
});

console.log('✅ Virtual Tour loaded');

// ===== NAV MORE DROPDOWN (HOMEPAGE) =====
function toggleNavMoreHome(e) {
    e.stopPropagation();
    var menu = document.getElementById('navMoreMenuHome');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Close dropdown when click outside
document.addEventListener('click', function(e) {
    var menu = document.getElementById('navMoreMenuHome');
    var btn = e.target.closest('.nav-more-dropdown');
    if (menu && !btn) {
        menu.classList.remove('show');
    }
});

// Close dropdown when click link inside
document.addEventListener('DOMContentLoaded', function() {
    var menuLinks = document.querySelectorAll('.nav-more-menu-home a');
    for (var i = 0; i < menuLinks.length; i++) {
        menuLinks[i].addEventListener('click', function() {
            var menu = document.getElementById('navMoreMenuHome');
            if (menu) menu.classList.remove('show');
        });
    }
});

function subscribeWA() {
    var input = document.querySelector('.footer-newsletter-input');
    var phone = input ? input.value.trim() : '';
    
    if (!phone) {
        alert('Sila masukkan no. WhatsApp anda');
        return;
    }

    var msg = 'Assalamualaikum, saya ingin subscribe untuk terima update terkini dari Madrasah Tahfiz Pekan Sungai Buloh. No saya: ' + phone;
    window.open('https://wa.me/60192363638?text=' + encodeURIComponent(msg), '_blank');
    
    if (input) input.value = '';
    alert('✅ Terima kasih! Kami akan menghubungi anda.');
}