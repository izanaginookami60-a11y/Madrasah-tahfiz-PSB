// ===== MAIN APP =====

document.addEventListener('DOMContentLoaded', function () {

    // Initialize Firebase first
    if (typeof initFirebase === 'function') {
        initFirebase();
    }

    // Sync data from cloud, then init app
    if (typeof syncData === 'function' && firebaseReady) {
        syncData(function () {
            startApp();
        });
    } else {
        startApp();
    }
});

function startApp() {
    // Init auth
    if (typeof initAuth === 'function') {
        initAuth();
    }

    // Login form
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Close modal on outside click
    var modal = document.getElementById('studentModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Setup Juz dropdown
    var juzTags = document.getElementById('selectedJuzTags');
    var juzDropdown = document.getElementById('juzDropdown');

    if (juzTags && juzDropdown) {
        juzTags.addEventListener('click', function (e) {
            if (e.target.classList.contains('tag-remove')) return;
            juzDropdown.classList.toggle('hidden');
            juzTags.classList.toggle('active');

            var surahDropdown = document.getElementById('surahDropdown');
            var surahTags = document.getElementById('selectedSurahTags');
            if (surahDropdown) surahDropdown.classList.add('hidden');
            if (surahTags) surahTags.classList.remove('active');

            if (typeof initJuzOptions === 'function') {
                initJuzOptions();
            }
        });
    }

    // Setup Surah dropdown
    var surahTags = document.getElementById('selectedSurahTags');
    var surahDropdown = document.getElementById('surahDropdown');

    if (surahTags && surahDropdown) {
        surahTags.addEventListener('click', function (e) {
            if (e.target.classList.contains('tag-remove')) return;
            surahDropdown.classList.toggle('hidden');
            surahTags.classList.toggle('active');

            var juzDropdown2 = document.getElementById('juzDropdown');
            var juzTags2 = document.getElementById('selectedJuzTags');
            if (juzDropdown2) juzDropdown2.classList.add('hidden');
            if (juzTags2) juzTags2.classList.remove('active');
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
        var jt = document.getElementById('selectedJuzTags');
        var jd = document.getElementById('juzDropdown');
        var st = document.getElementById('selectedSurahTags');
        var sd = document.getElementById('surahDropdown');

        if (jt && jd) {
            if (!jt.contains(e.target) && !jd.contains(e.target)) {
                jd.classList.add('hidden');
                jt.classList.remove('active');
            }
        }
        if (st && sd) {
            if (!st.contains(e.target) && !sd.contains(e.target)) {
                sd.classList.add('hidden');
                st.classList.remove('active');
            }
        }
    });

    console.log('🕌 Sistem Hafazan Al-Quran - Ready');
    console.log(firebaseReady ? '🔥 Firebase: Connected' : '📴 Firebase: Offline (using localStorage)');
}

// ===== MOBILE NAVIGATION =====

function mobileNavClick(event, tabName) {
    event.preventDefault();

    // Close menu kalau buka
    closeMobileMenu();

    // Update active state
    var navItems = document.querySelectorAll('.mobile-nav-item');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
        if (navItems[i].dataset.tab === tabName) {
            navItems[i].classList.add('active');
        }
    }

    // Switch tab
    if (typeof switchTab === 'function') {
        // Find the corresponding top tab button
        var topTabBtn = document.querySelector('.tab-btn[onclick*="' + tabName + '"]');
        switchTab(tabName, topTabBtn);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMobileMenu(event) {
    event.preventDefault();
    var menu = document.getElementById('mobileMoreMenu');
    if (menu) {
        menu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    var menu = document.getElementById('mobileMoreMenu');
    if (menu) {
        menu.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ===== DETECT MOBILE =====
function isMobile() {
    return window.innerWidth < 768;
}

// ===== AUTO HIDE BOTTOM NAV ON SCROLL DOWN =====
var lastScrollTop = 0;
var bottomNav = null;

window.addEventListener('scroll', function() {
    if (!isMobile()) return;

    if (!bottomNav) bottomNav = document.getElementById('mobileBottomNav');
    if (!bottomNav) return;

    var st = window.pageYOffset || document.documentElement.scrollTop;

    if (st > lastScrollTop && st > 100) {
        // Scroll down - hide
        bottomNav.style.transform = 'translateY(100%)';
        bottomNav.style.transition = 'transform 0.3s';
    } else {
        // Scroll up - show
        bottomNav.style.transform = 'translateY(0)';
    }
    lastScrollTop = st <= 0 ? 0 : st;
}, false);

// ===== PULL TO REFRESH =====
var touchStartY = 0;
var touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (window.scrollY === 0 && touchStartY > 0) {
        touchEndY = e.changedTouches[0].clientY;
        var diff = touchEndY - touchStartY;

        if (diff > 100) {
            // Pulled down enough
            if (typeof syncData === 'function') {
                showToast('🔄 Refreshing...');
                syncData(function() {
                    location.reload();
                });
            }
        }
        touchStartY = 0;
    }
}, { passive: true });

// ===== PREVENT iOS BOUNCE =====
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.modal-content, .edit-overlay, .receipt-overlay-body, .mobile-menu-content')) {
        return;
    }
    if (document.body.scrollTop === 0 && e.touches[0].clientY > 0) {
        // At top, prevent overscroll
    }
}, { passive: true });

// ===== HIDE MOBILE NAV WHEN MODAL/OVERLAY OPEN =====
var observer = new MutationObserver(function(mutations) {
    if (!isMobile()) return;

    var hasOpenOverlay = document.querySelector('.edit-overlay:not(.hidden), .receipt-overlay:not(.hidden), .modal:not(.hidden), .lightbox:not(.hidden)');
    var mobileNav = document.getElementById('mobileBottomNav');

    if (mobileNav) {
        if (hasOpenOverlay) {
            mobileNav.style.display = 'none';
        } else {
            mobileNav.style.display = 'flex';
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

// ===== TAB SYNC WITH MOBILE NAV =====
// Override switchTab untuk update mobile nav
var originalSwitchTab = window.switchTab;
if (typeof originalSwitchTab === 'function') {
    window.switchTab = function(tabName, btn) {
        originalSwitchTab(tabName, btn);

        // Update mobile nav
        var navItems = document.querySelectorAll('.mobile-nav-item');
        var foundInBottomNav = false;

        for (var i = 0; i < navItems.length; i++) {
            navItems[i].classList.remove('active');
            if (navItems[i].dataset.tab === tabName) {
                navItems[i].classList.add('active');
                foundInBottomNav = true;
            }
        }

        // Kalau tab tak dalam bottom nav, highlight "More"
        if (!foundInBottomNav) {
            var moreItem = document.querySelector('.mobile-nav-item[data-tab="more"]');
            if (moreItem) moreItem.classList.add('active');
        }
    };
}

// ===== LANGUAGE MENU TOGGLE =====
function toggleLangMenu() {
    var menu = document.getElementById('langMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function closeLangMenu() {
    var menu = document.getElementById('langMenu');
    if (menu) {
        menu.classList.add('hidden');
    }
}

// Close menu when click outside
document.addEventListener('click', function(e) {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langSwitcher');
    if (!menu || !btn) return;

    if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// ============================================
// ===== FIX LEAKED TAB CONTENTS ==============
// ============================================

function fixLeakedTabs() {
    // Tab IDs yang sepatutnya dalam adminPage
    var adminTabIds = [
        'tab-students', 'tab-addStudent', 'tab-addRecord', 'tab-attendance',
        'tab-cashbook', 'tab-profiles', 'tab-schedule', 'tab-manageRecords',
        'tab-progressHafazan', 'tab-manageEvents', 'tab-webContent',
        'tab-newReg', 'tab-finance', 'tab-gallery', 'tab-reports',
        'tab-punch', 'tab-backup', 'tab-profileDetail'
    ];

    var adminPage = document.getElementById('adminPage');
    var adminContainer = adminPage ? adminPage.querySelector('.container') : null;

    if (!adminContainer) {
        console.log('❌ Admin container not found');
        return;
    }

    var movedCount = 0;

    for (var i = 0; i < adminTabIds.length; i++) {
        var tabEl = document.getElementById(adminTabIds[i]);

        if (!tabEl) continue;

        // Check if it's in body directly (BOCOR)
        if (tabEl.parentElement === document.body) {
            console.log('🔧 Moving back:', adminTabIds[i]);
            adminContainer.appendChild(tabEl);
            movedCount++;
        }
    }

    if (movedCount > 0) {
        console.log('✅ Moved ' + movedCount + ' leaked tabs back to adminPage');
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(fixLeakedTabs, 100);
    setTimeout(fixLeakedTabs, 500);
});

// Also run periodically as safety
setTimeout(fixLeakedTabs, 2000);

console.log('✅ Tab leak fixer activated');