# 🕌 MADRASAH TAHFIZ PSB - PROJECT BRIEF
## Last Updated: 7 Julai 2026 (Session 3 — Phase 2 + Dapur System + Audit Sambungan Bahagian 5, baris 3400-8600)

---

## 📁 PROJECT STRUCTURE
- `login.html` — Admin + Parent portal (desktop)
- `parent-app.html` — Mobile parent portal
- `infaq.html` — Public infaq page DESKTOP (kalendar vertical hijau)
- `infaq-mobile.html` — Public infaq page MOBILE (auto-redirect dari infaq.html)
- `dapur.html` — **BARU** — Mobile page untuk tukang masak update menu harian
- `js/admin.js` — **24,071+ baris**, admin functions (includes infaq + dapur admin panel)
- `js/parent.js` — 5,675 baris, parent functions
- `js/data.js` — Firebase config + data helpers
- `js/parent-data-wizard.js` — Data completion wizard (multi-step)
- `js/pengurusan-gaji.js` — HR / salary module
- `css/style.css` — Main styles (16,391 baris)
- `css/dark-mode.css` — Dark mode styles
- `api/upload-image.js` — Serverless (ImgBB)
- `api/upload-video.js` — Serverless (Cloudinary)
- `punch.html` — Mobile Face Recognition Punch Card system
- `js/punch.js` — Mobile punch card logic & GPS handling
- `js/punch-admin.js` — Punch card admin tools & setting controllers

---

## 🏫 IDENTITY
- **Nama Rasmi:** Madrasah Tahfiz Pekan Sungai Buloh
- **Logo URL:** https://i.ibb.co/DgSPkh8d/logo.png
- **WhatsApp Admin:** 601161000542 (Ustaz Aisamuddin)
- **Jumlah Pelajar:** 10 orang (termasuk ustaz & keluarga)
- **Tukang Masak:** 3 orang (giliran tidak tetap)

---

## 🔧 TECH STACK
- **Frontend:** Vanilla JS + HTML + CSS (no framework)
- **Database:** Firebase Realtime Database
- **Hosting:** Vercel → `hafazan-madrasah.vercel.app`
- **Image Upload:** ImgBB (via serverless API)
- **Video Upload:** Cloudinary (via serverless API)
- **Storage (local):** localStorage (cache + settings)
- **Password Hashing:** SHA-256 (Web Crypto API) untuk PIN tukang masak

---

## 🗄️ FIREBASE DATABASE STRUCTURE
- `hafazanData/students` — pelajar
- `hafazanData/records` — hafazan
- `hafazanData/attendance` — kehadiran (3 sesi)
- `hafazanData/cashbook` — kewangan (sumber data untuk Pengurusan Gaji)
- `hafazanData/gallery` — galeri
- `hafazanData/outings` — outing
- `hafazanData/events` — TAKWIM/ACARA (dengan field `autoBlockInfaq` + `infaqSlots[]`)
- `hafazanData/parentUpdates` — update parent
- `hafazanData/admins` — admin accounts
- `registrations` — pendaftaran baru
- `hutangData` — rekod hutang
- `deletedStudents/` — backup pelajar yang dipadam
- `infaq/{dateKey}_{slot}` — infaq (contoh: `2026-07-08_sarapan`)
  - Fields: `nama, whatsapp, jenis, jumlah, menu, catatan, dedah, status, dateKey, slot, slotLabel, sertakanDoa, doaData`
  - `source` (`takwim`/`public`/`manual`), `eventId`, `sponsorName`, `sponsorPhone`, `sponsorNote`
  - Status: `pending`, `confirmed`, `rejected`, `SPONSORED`
- `infaqStats/pageViews` — view counter untuk infaq-mobile.html (auto-increment, secure)
- `dapurConfig/` — **BARU** konfigurasi sistem dapur
  - `cooks/{cookId}` — { nama, pin (SHA-256 hash), status, createdAt }
  - `loginLog/` — audit log setiap login tukang masak
  - `pinChangeRequests/` — request tukar PIN
- `dapurMenu/{YYYY-MM-DD}/{slot}` — **BARU** menu harian oleh tukang masak
  - Fields: `menu, cook, cookId, note, timestamp, updatedAt, addedBy`
  - Slot keys: `sarapan`, `tengahari`, `minumpetang`, `malam`

---

## ✅ COMPLETED FEATURES
- Student management (CRUD)
- Hafazan records (Juz + Surah + Ayat)
- Attendance system (3 sessions: pagi/petang/malam)
- Cashbook / Finance / Payment Voucher / Receipt
- Multi-month payment + cross-year handling
- Gallery (photos + videos)
- Events / Calendar / Takwim
- Outing system (parent apply → admin approve)
- Parent data wizard (multi-step onboarding)
- HR / Punch card system
- Salary / Gaji module (Pengurusan Gaji)
- Web CMS
- Firebase security rules (comprehensive)
- API keys moved to Vercel env variables
- Loading spinners CSS
- Infaq Makanan System + Auto-Sync Takwim
- Dark mode (admin & parent portal fully working) ✅
- Better empty states (UI/UX ditingkatkan) ✅
- Navbar layout fix — language switcher (🌐 BM) + overflow icons ✅
- Infaq mobile: WhatsApp submit fix, view counter, arahan langkah demi langkah ✅
- **Sistem Dapur — Menu harian oleh tukang masak** ✅
  - PIN 6 digit + SHA-256 hash + lockout 5 attempts
  - Setup panel via URL secret `?setup=RAHSIA123`
  - Tukar PIN sendiri (self-service)
  - 4 slot harian (sarapan/tengahari/minumpetang/malam)
  - History 3 hari lepas
  - Sponsor banner integration (dari infaq)
- **Admin Dapur Panel — Kategori "🍳 Dapur & Menu"** ✅
  - Kalendar view (bulan ini / bulan depan)
  - Modal detail per tarikh dengan 4 slot
  - Admin boleh EDIT/DELETE menu (override tukang masak)
  - Stats: Hari ini, Minggu ini, Cooks aktif, Sponsor
  - Senarai tukang masak berdaftar
  - Export CSV
- **Infaq Mobile — Integration dengan menu dapur** ✅
  - Banner "Menu Hari Ini" di atas kalendar
  - Menu dipapar dalam day modal setiap slot
  - **Slot yang dah dimasak → auto-block dari infaq** (elak duplicate)
  - Status baru: `dimasak` (badge oren)

---

## 🔒 SECURITY
- **Firebase Rules:** Validated structure — tambah rules untuk `dapurConfig` & `dapurMenu`
- **API Keys:** Hidden in Vercel env variables
- **ImgBB:** via `/api/upload-image`
- **Cloudinary:** via `/api/upload-video`
- ✅ **XSS fix selesai** — `escapeHtml()` utility ditambah, semua fungsi render dikemas kini
- ✅ **Password plaintext fix selesai** — `maskPassword()` + `showLoginInfoModal()` + auto-hide
- ✅ **Whole-tree overwrite fix selesai** — `saveDataFirebase()` migrate ke `update()` multi-path
- ✅ **infaqStats rules** — validate increment +1 sahaja, blok field lain (`$other: false`)
- ✅ **Dapur security:**
  - PIN disimpan sebagai SHA-256 hash dengan salt `MADRASAH_PSB_DAPUR_`
  - Lockout 60 saat selepas 5 kali login gagal
  - Session storage — auto logout bila tutup tab
  - Login audit log ke `dapurConfig/loginLog`
  - Setup URL guna secret key untuk elak public access
  - Rules `dapurConfig`: read=false secara default, cuma `cooks/{id}/pin` boleh read+write untuk self-verify

---

## 📊 CURRENT STATUS
- ✅ Task 1-4: Loading Spinners, Dark Mode, Infaq System, Auto-Sync
- ✅ Task 5-8: Bug Fixes (Infaq, Hafazan, Pengurusan Gaji, Punch System)
- ✅ Task 9: Reka bentuk "Better Empty States" & Mod Gelap untuk `parent-app.html`
- ✅ Task 10: Navbar Language Switcher & Layout Fix
- ✅ **Phase 1 (Audit):** Bahagian 1-4 siap (baris 1–3400), 28 isu dikenal pasti
- ✅ **Phase 2 (Fix):** CRITICAL, HIGH & MEDIUM selesai
- ✅ **Infaq Enhancements:** WhatsApp fix, view counter, arahan
- ✅ **Sistem Dapur:** Tukang masak page + admin panel + infaq integration
- ⏳ **Seterusnya:** ISU LOW (6 isu) + Good Practice (4) — belum mula
- ⏸️ **DITANGGUH:** Certificate generator & Report card generator

---

## 🔍 SESSION 3 — AUDIT & POLISH + DAPUR SYSTEM (7 Julai 2026)

### Phase 1 (Audit) — Bahagian 1-4 SIAP (baris 1–3400)
### Phase 1 (Audit) — Bahagian 5 SEDANG JALAN (baris 3400–7700 SIAP)
*### Phase 1 (Audit) — Bahagian 5 SEDANG JALAN (baris 3400–8600 SIAP)
**Baki audit:** `admin.js` baris 8600–24071 (SAMBUNG DARI SINI), kemudian `parent.js`, `login.html`, `style.css`

**Isu dijumpai & fix (Session 3, sambungan 7 Julai 2026):**
| # | Isu | Fungsi | Status |
|---|---|---|---|
| 1 | XSS — tiada escapeHtml() (data public pendaftaran) | `loadRegistrations()` | ✅ Fixed |
| 2 | Tiada null guard `submittedAt` | `loadRegistrations()` | ✅ Fixed |
| 3 | XSS — tiada escapeHtml() (data admin) | `renderCashbook()` | ✅ Fixed |
| 4 | XSS — tiada escapeHtml() (resit rasmi) | `generateReceiptMulti()` | ✅ Fixed |
| 5 | XSS — tiada escapeHtml() (PV) | `generatePV()` | ✅ Fixed |
| 6 | XSS — tiada escapeHtml() (PV multi) | `generatePVMulti()` | ✅ Fixed |
| 7 | Rujuk `IMGBB_API_KEY` yang tak wujud | `uploadGalleryPhoto()` | ⏸️ Skip (verified: versi live OK) |
| 8 | XSS — tiada escapeHtml() (galeri, 2 lokasi) | `renderGallery()` | ✅ Fixed |
| 9 | XSS — nama kelas tiada escape | `broadcastWhatsApp()` | ✅ Fixed |
| 10 | XSS — nama kelas tiada escape | `populateFinanceFilters()` | ✅ Fixed |
| 11 | XSS — data invois tiada escape | `renderDebts()` | ✅ Fixed |
| 12 | XSS — nama pelajar tiada escape | `previewInvoices()` | ✅ Fixed |
| 13 | XSS — classFilter tiada escape | `renderInvoiceHistory()` | ✅ Fixed |
| 14 | CSV export — petikan dua `"` tak escape konsisten | `downloadStudentsExcel()`, `downloadCashbookExcel()`, `downloadHafazanExcel()` | ✅ Fixed (tambah helper `csvField()`) |

**Nota tambahan:**
- Ada kod duplicate/mati (dead code, bukan bug) di `uploadGalleryPhoto()` baris ~5925-5956 (blok video kedua tak pernah run) — cadangan cleanup masa sesi "Good Practice"
- Function baru ditambah: `csvField(val)` — helper escape CSV, letak sebelum `downloadStudentsExcel()`

**⚠️ PENTING — BELUM DEPLOY:** Semua 13 fix di atas (isu #1-6, #8-14) dah di-paste ke fail lokal tapi **BELUM di-deploy ke Vercel**. Lepas semua fix siap ditest, jalankan:
```bash
vercel --prod
```

---

### Phase 2 (Fix) — ✅ SELESAI

#### CRITICAL — SELESAI
- **CRITICAL #1** — `trackEditChanges()` misplaced code (admin.js) ✅
- **CRITICAL #2** — `saveDataFirebase()` whole-tree overwrite (data.js) ✅

#### HIGH — SELESAI
- **HIGH #1** — XSS (`escapeHtml()` utility + 6 fungsi render) ✅
- **HIGH #2** — Password plaintext (`maskPassword()` + `showLoginInfoModal()`) ✅
- **HIGH #3** — `initAdminDashboard()` tanpa try-catch berasingan ✅
- **HIGH #4** — `saveData()` dalam fungsi student — migrate ke `savePathSafely()` ✅

#### MEDIUM — SELESAI (9 isu)
- `viewStudent()` null guard ✅
- `addStudent()` JS validation + try-catch ✅
- `deleteStudent()` backup ke `deletedStudents/` ✅
- onclick attribute escape petikan dua ✅
- `addHafazanRecord()` NaN score + studentId/date validation ✅
- `trackEditChanges()` listener bertimbun (memory leak) ✅
- `loadAttendanceHistory()` buang `appData = loadData()` ✅
- `approveRegistration()` tambah `.catch()` ✅

#### LOW & GOOD PRACTICE — BELUM MULA
6 isu low + 4 good practice.

---

### Infaq Enhancements (7 Julai 2026) — ✅ SELESAI
- WhatsApp Submit Fix (buang setTimeout, tambah fallback button) ✅
- View Counter (Firebase transaction + auto-increment + sessionStorage) ✅
- Arahan Langkah Demi Langkah (collapsible panel + auto-expand first-time) ✅
- Meta tag deprecated fix (`mobile-web-app-capable`) ✅

---

### Sistem Dapur (7 Julai 2026) — ✅ SELESAI

**Fasa 1: Page Tukang Masak (`dapur.html`)**
- Login PIN 6 digit dengan numpad UI
- SHA-256 hash + salt untuk PIN
- Lockout 60 saat selepas 5 percubaan gagal
- Session storage (auto logout bila tutup tab)
- Setup panel via URL secret (`?setup=RAHSIA123`)
- Tukar PIN self-service (verify PIN lama dulu, check kekuatan PIN baru)
- 4 slot menu harian
- Sponsor banner (kalau ada infaq confirmed)
- History 3 hari lepas
- XSS safe dengan `dEscapeHtml()`

**Fasa 2: Admin Panel (`admin.js` + `login.html`)**
- Kategori baru "🍳 Dapur & Menu" dalam admin navigation
- Tab "🍳 Jadual Menu" dengan calendar view (macam infaq)
- Warna oren (`#ea580c`) sebagai identity dapur
- Modal detail per tarikh — 4 slot dengan CRUD penuh
- Admin boleh add/edit/delete menu (override tukang masak)
- Dropdown pilih tukang masak dari senarai berdaftar
- Stats: Hari ini (X/4), Minggu ini (X/28), Cooks aktif, Sponsor hari ini
- Senarai tukang masak berdaftar (dengan status)
- Export CSV
- Auto-sync dengan `infaq` data — tunjuk sponsor banner

**Fasa 3: Integration dengan Infaq Mobile**
- Banner "🍳 Menu Hari Ini" di atas kalendar (auto-hide kalau tiada menu)
- Menu dipapar dalam day modal setiap slot (dengan icon 🍽️ + tukang masak)
- **Slot yang dah dimasak → auto-block dari infaq** (status: `dimasak`, badge oren)
- Elak duplicate: kalau tukang masak dah masak, orang lain tak boleh sponsor lagi

**Firebase Rules Baru:**
- `dapurConfig/cooks/{id}/pin` — read+write terbuka (untuk PIN verification & self-change)
- `dapurConfig/cooks/{id}/nama` — read only
- `dapurConfig/loginLog` — write only (audit log)
- `dapurMenu/{dateKey}/{slot}` — read+write dengan validation (menu 2-200 chars, cook 2+ chars)
- Regex validate `dateKey` format `YYYY-MM-DD`

---

## 🚨 FUNGSI & UTILITIES BARU DITAMBAH (Session 3)

### `data.js` — Fungsi baru:
| Fungsi | Tujuan |
|---|---|
| `escapeHtml(str)` | Escape HTML entities — elak XSS |
| `maskPassword(pass, fieldId)` | Papar password sebagai `•••` dengan toggle |
| `togglePasswordVisibility(fieldId, pass)` | Toggle show/hide password, auto-hide 5s |
| `savePathFirebase(path, value, cb)` | Tulis ke specific Firebase path sahaja |
| `savePathSafely(path, value, cb)` | Read-then-write pattern selamat |

### `admin.js` — Fungsi baru:
| Fungsi | Tujuan |
|---|---|
| `showLoginInfoModal(name, id, pass)` | Modal khas papar login info selepas approve |
| `toggleLoginInfoPass()` | Toggle password dalam loginInfoModal |
| `copyLoginInfo(elementId, btn)` | Copy ID/password ke clipboard |
| `shareLoginViaWhatsApp(id, pass, name)` | Share login info via WhatsApp |
| `performDeleteStudent(studentId, name)` | Helper — padam sebenar selepas backup |
| `initDapurAdmin()` | Init listener untuk dapur admin panel |
| `loadDapurAdmin()` | Refresh dapur data |
| `dapurAdminSwitchMonth(view)` | Toggle bulan ini/bulan depan |
| `dapurRenderCalendar()` | Render kalendar menu dapur |
| `dapurAdminOpenModal(dateKey)` | Buka modal detail menu harian |
| `dapurAdminCloseModal()` | Tutup modal |
| `dapurAdminSaveSlot(dateKey, slotKey)` | Admin simpan menu |
| `dapurAdminEditSlot(dateKey, slotKey)` | Admin edit menu sedia ada |
| `dapurAdminClearSlot(dateKey, slotKey)` | Admin padam menu |
| `dapurUpdateStats()` | Update 4 stat cards |
| `dapurRenderCooksList()` | Render senarai tukang masak |
| `exportDapurCSV()` | Export jadual menu ke CSV |

### `infaq-mobile.html` — Fungsi baru:
| Fungsi | Tujuan |
|---|---|
| `initViewCounter()` | Firebase transaction auto-increment page views |
| `formatViewCount(num)` | Format nombor cantik (1,234 / 12.3K / 1.2M) |
| `toggleHowTo()` | Collapse/expand arahan cara infaq |
| `initHowTo()` | Auto-expand untuk first-time visitor |
| `initTodayMenu()` | Papar banner menu dapur hari ini |
| `renderDaySlotsWithMenu(dateKey, dateObj, dapurMenu)` | Render slot dengan menu dapur info |

### `dapur.html` — Fail baru:
- Login screen dengan numpad PIN
- Main app: header + date selector + 4 menu cards + history
- Change PIN modal
- Setup panel (via URL secret)
- Fungsi: `hashPin`, `dPressKey`, `dDeleteKey`, `dVerifyPin`, `dShowApp`, `dLogout`, `dSetToday`, `dLoadMenu`, `dRenderMenu`, `dSaveSlot`, `dEditSlot`, `dClearSlot`, `dLoadHistory`, `dEscapeHtml`, `dFormatTime`, `dShowToast`, `dOpenChangePin`, `dCloseChangePin`, `dSubmitChangePin`, `dCheckPinStrength`, `dRunSetup`

---

## 🐛 KNOWN ISSUES
- BlackBox terminal errors — cosmetic, ignore

### 🔍 RESOLVED (Session 3)
- ✅ `trackEditChanges()` misplaced code
- ✅ `saveDataFirebase()` whole-tree overwrite
- ✅ XSS dalam 6 fungsi render utama
- ✅ Password plaintext dalam alert + profile detail + viewStudent
- ✅ `initAdminDashboard()` tanpa try-catch
- ✅ `addStudent()` tiada validation + try-catch
- ✅ `deleteStudent()` tiada backup
- ✅ `viewStudent()` tiada null guard
- ✅ onclick escape petikan dua
- ✅ `addHafazanRecord()` NaN score
- ✅ `trackEditChanges()` listener bertimbun
- ✅ `loadAttendanceHistory()` overwrite appData
- ✅ `approveRegistration()` tiada `.catch()`
- ✅ Typo `hhtml` → `html` dalam `viewProfileDetail()`
- ✅ Infaq mobile — WhatsApp tak buka (popup blocked)
- ✅ Infaq mobile — `mCloseModal('mSuccessModal')` crash
- ✅ Infaq mobile — `mLastWaUrl` undefined
- ✅ Meta tag deprecated
- ✅ Firebase rules `infaqStats` permission_denied
- ✅ Firebase rules `dapurConfig/cooks` permission_denied semasa setup
- ✅ Infaq day modal — kod literal tersalah paste (HTML template rosak)
- ✅ Slot yang dah ada menu tukang masak masih boleh ditaja (auto-block fix)

### 🔍 RESOLVED (Session 2 — 6 Julai 2026)
- ✅ Flag emoji 🇲🇾 tak render di Windows
- ✅ Dark mode & settings icon overflow di navbar
- ✅ Navbar responsive untuk mobile/tablet

---

## 📝 TODO (Remaining)
- [ ] **Fix ISU LOW (6 isu) + Good Practice (4)**
- [ ] **Selesaikan audit admin.js Bahagian 5-6 + parent.js + login.html + style.css**
- [ ] Certificate generator
- [ ] Report card generator
- [ ] Online payment integration
- [ ] Firebase Auth migration
- [ ] Tambah arahan cara infaq ke `infaq.html` (desktop version)
- [ ] Tambah menu dapur integration ke `infaq.html` (desktop version)
- [ ] Notification untuk tukang masak (reminder isi menu)
- [ ] Report bulanan menu (paling popular, tukang masak paling aktif)
- [x] Fix CRITICAL, HIGH & MEDIUM ✅
- [x] Sistem Dapur (tukang masak page + admin panel + infaq integration) ✅
- [x] Infaq mobile enhancements (WhatsApp fix, view counter, arahan) ✅
- [x] Firebase rules untuk `infaqStats` + `dapurConfig` + `dapurMenu` ✅
- [x] Add dark mode toggle to `parent-app.html` ✅
- [x] Better empty states ✅
- [x] Fix navbar layout & language switcher ✅

---

## 🎯 INFAQ SLOT NAMING CONVENTION (PENTING!)
Semua guna **lowercase**: `sarapan`, `tengahari`, `minumpetang`, `malam`
Firebase key format: `{YYYY-MM-DD}_{slot}` — contoh: `2026-07-08_tengahari`
Sama untuk `dapurMenu`: `{YYYY-MM-DD}/{slot}` — contoh: `2026-07-08/tengahari`

---

## 🎨 UI/UX CONVENTIONS
- **Language switcher:** Guna 🌐 (globe) + text code (BM/EN/AR)
- **Icon buttons di navbar:** Semua ada `flex-shrink: 0`
- **Responsive breakpoints:**
  - `>900px` — Full navbar (semua button visible)
  - `600-900px` — Broadcast & Install App hidden
  - `<480px` — Language cuma icon (no text)
- **Colour Identity:**
  - Infaq: hijau (`#22c55e` / `#16a34a`)
  - Dapur: oren (`#ea580c` / `#c2410c`)
  - Admin category buttons: gradient
- **Infaq mobile layout:**
  - Header → View Counter → Menu Hari Ini (auto-hide) → Cara Infaq → Month Switch → Calendar → Legend → T&C

---

## 🍳 DAPUR SYSTEM — QUICK REFERENCE

### Setup Tukang Masak (satu kali sahaja):
```
1. Tukar rules dapurConfig sementara: read=true, write=true
2. Buka: hafazan-madrasah.vercel.app/dapur.html?setup=RAHSIA123
3. Isi nama & PIN untuk 3 tukang masak → Simpan
4. Tukar balik rules dapurConfig ke secure version
```

### Tukang Masak Login:
```
URL: hafazan-madrasah.vercel.app/dapur.html
- Masukkan PIN 6 digit
- Session kekal sehingga tutup tab
- Boleh tukar PIN sendiri via butang 🔑
```

### Admin Pantau Menu:
```
Login admin → Kategori "🍳 Dapur & Menu" → Tab "Jadual Menu"
- Kalendar view (bulan ini / bulan depan)
- Klik tarikh → modal 4 slot
- Boleh edit/delete menu (override tukang masak)
- Export CSV untuk laporan
```

### Public Lihat Menu:
```
infaq-mobile.html:
- Banner "Menu Hari Ini" di atas kalendar
- Klik tarikh → nampak menu bersama slot infaq
- Slot yang dah dimasak → tak boleh ditaja lagi
```

---

## 📌 FAIL YANG DIEDIT

### Session 3 — Sistem Dapur (7 Julai 2026):
- `dapur.html` — **FAIL BARU** — Mobile page tukang masak dengan PIN login, numpad, menu CRUD, tukar PIN, setup panel
- `admin.js` — Tambah kategori `dapur` dalam `adminCategoryConfig`; tambah case `'dapur'` dalam `switchAdminCategory()`; tambah ~500 baris fungsi dapur admin (calendar, modal, CRUD, stats, cooks list, CSV export)
- `login.html` — Tambah button kategori "🍳 Dapur & Menu"; tambah `div#tab-dapur` dengan stats, kalendar, modal, cooks list
- `infaq-mobile.html` — Tambah banner "Menu Hari Ini" (`initTodayMenu()`); tambah menu info dalam day modal (`renderDaySlotsWithMenu()`); tambah status `dimasak` — auto-block slot yang dah ada menu tukang masak
- Firebase Rules — Tambah `dapurConfig` (cooks, loginLog, pinChangeRequests) + `dapurMenu` dengan validation regex date + menu length check

### Session 3 — Infaq Enhancements:
- `infaq-mobile.html` — fix WhatsApp submit; fix success modal; view counter; arahan cara infaq; meta tag; `mLastWaUrl` global
- Firebase Rules — `infaqStats` dengan validate increment +1

### Session 3 — Phase 2 (Fix):
- `data.js` — utilities baru (escapeHtml, maskPassword, savePathSafely dll); fix `saveDataFirebase`
- `admin.js` — fix banyak fungsi (fillEditForm, trackEditChanges, initAdminDashboard, render functions, save functions, deleteStudent dll)

### Session 3 — Phase 1 (Audit):
- `admin.js` — AUDIT SAHAJA (Bahagian 1-4/6)

### Session 2 (Navbar Fix):
- `login.html` (language switcher HTML)
- `style.css` (navbar layout + button styles)

### Session 1 (Bug Fixes & Features):
- `admin.js`, `infaq.html`, `infaq-mobile.html`, `data.js`, `pengurusan-gaji.js`, `punch.js`, `punch-admin.js`, `punch.html`, `parent-app.html`, `parent.js`

---

## 🚀 DEPLOYMENT
```bash
vercel --prod
```
**Nota:** Deploy selepas semua fix selesai dan diuji. Ingat tukar Firebase rules kembali ke secure version selepas setup tukang masak.