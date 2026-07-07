// ===== AUTHENTICATION =====
let currentUser = null;
let appData = null;

function initAuth() {
    appData = loadData();
    
    // Check if already logged in
    const session = sessionStorage.getItem('hafazanSession');
    if (session) {
        currentUser = JSON.parse(session);
        if (currentUser.role === 'admin') {
            showAdminPage();
        } else {
            showParentPage();
        }
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const loginId = document.getElementById('loginId').value.trim();
    const loginPass = document.getElementById('loginPass').value.trim();
    const errorEl = document.getElementById('loginError');
    
    appData = loadData();
    
    // Check admin
    const admin = appData.admins.find(a => a.id === loginId && a.password === loginPass);
    if (admin) {
        currentUser = { role: 'admin', id: admin.id, name: admin.name };
        sessionStorage.setItem('hafazanSession', JSON.stringify(currentUser));
        errorEl.classList.add('hidden');
        showAdminPage();
        return;
    }
    
    // Check parent
    const student = appData.students.find(s => 
        s.parentLoginId === loginId && s.parentLoginPass === loginPass
    );
    if (student) {
        currentUser = { 
            role: 'parent', 
            id: student.parentLoginId, 
            name: student.parentName,
            studentId: student.id 
        };
        sessionStorage.setItem('hafazanSession', JSON.stringify(currentUser));
        errorEl.classList.add('hidden');
        showParentPage();
        return;
    }
    
    // Login failed
    errorEl.textContent = '❌ ID atau kata laluan salah. Sila cuba lagi.';
    errorEl.classList.remove('hidden');
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('hafazanSession');
    showPage('loginPage');
    document.getElementById('loginForm').reset();
}

function showPage(pageId) {
    // Hide ALL pages first
    var allPages = document.querySelectorAll('.page');
    for (var i = 0; i < allPages.length; i++) {
        allPages[i].classList.remove('active');
        allPages[i].style.display = 'none';
    }

    // Show only target page
    var targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function showAdminPage() {
    showPage('adminPage');
    document.getElementById('adminName').textContent = currentUser.name;
    initAdminDashboard();
}

function showParentPage() {
    showPage('parentPage');
    document.getElementById('parentUserName').textContent = currentUser.name;
    initParentDashboard();
}