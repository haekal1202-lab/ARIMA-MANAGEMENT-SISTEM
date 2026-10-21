window.App = (() => {
  "use strict";

  const menus = [
    ["dashboard", "Dashboard", "▦"],
    ["students", "Siswa", "♙"],
    ["sensei", "Sensei", "◎"],
    ["attendance", "Absensi", "✓"],
    ["billing", "Tagihan", "Rp"],
    ["receipts", "Kuitansi", "▣"],
    ["finance", "Mutasi Keuangan", "↔"],
    ["salary", "Payroll Sensei", "¥"],
    ["reports", "Laporan", "▤"],
    ["settings", "Pengaturan", "⚙"]
  ];

  let user = null;

  const FORM_CONFIG = {
    students: {
      title: "Tambah Siswa", editTitle: "Edit Siswa",
      description: "Lengkapi identitas, kontak keluarga, dan program belajar siswa.",
      idField: "ID_SISWA",
      fields: [
        { key: "ID_SISWA", label: "ID Siswa", type: "text", required: false, placeholder: "Kosongkan untuk ID otomatis" },
        { key: "NAMA", label: "Nama Siswa", type: "text", required: true, placeholder: "Nama lengkap siswa" },
        { key: "NIK", label: "NIK", type: "text", required: false, placeholder: "Nomor Induk Kependudukan" },
        { key: "NO_WA", label: "No. WhatsApp", type: "text", required: true, placeholder: "08xxxxxxxxxx" },
        { key: "NAMA_ORANG_TUA", label: "Nama Orang Tua / Wali", type: "text", required: true, placeholder: "Nama orang tua / wali" },
        { key: "NO_WA_ORANG_TUA", label: "No. WhatsApp Orang Tua / Wali", type: "text", required: false, placeholder: "08xxxxxxxxxx" },
        { key: "PROGRAM", label: "Program", type: "select", required: true, options: ["MAGANG", "TOKUTEI GINOU", "ENGINEER"] },
        { key: "ASRAMA", label: "Asrama", type: "select", required: true, options: ["YA", "TIDAK"] },
        { key: "TANGGAL_MASUK", label: "Tanggal Masuk", type: "date", required: true },
        { key: "SSW", label: "Ikut Program SSW", type: "select", required: false, options: ["YA", "TIDAK"] },
        { key: "SSW_DETAIL", label: "Bidang SSW", type: "combo", required: false, placeholder: "Pilih atau ketik bidang...", options: ["KAIGO", "FOOD SERVICE", "CONSTRUCTION", "AGRICULTURE", "BUILDING CLEANING", "MANUFACTURING", "FISHERY", "AUTO MAINTENANCE", "LAINNYA"] },
        { key: "NILAI_SSW", label: "Nilai Ujian SSW", type: "select", required: false, options: ["LULUS", "TIDAK LULUS", "BELUM UJIAN"] },
        { key: "JFT_LEVEL", label: "Sertifikat JFT", type: "combo", required: false, placeholder: "Pilih level JFT...", options: ["A1", "A2", "A2.1", "A2.2", "B1", "B1.1", "B1.2", "B2", "B2.1", "B2.2"] },
        { key: "JLPT_LEVEL", label: "Sertifikat JLPT", type: "combo", required: false, placeholder: "Pilih level JLPT...", options: ["N5", "N4", "N3", "N2", "N1"] },
        { key: "JFT_JLPT_DATE", label: "Tanggal Sertifikat", type: "date", required: false },
        { key: "FOTO_SISWA_URL", label: "Foto Siswa", type: "file", required: false },
        { key: "CV_URL", label: "File CV", type: "file", required: false },
        { key: "STATUS", label: "Status", type: "select", required: true, options: ["AKTIF", "NONAKTIF", "LULUS", "KELUAR"] }
      ]
    },
    sensei: {
      title: "Tambah Sensei", editTitle: "Edit Sensei",
      description: "Simpan profil pengajar dan tarif per JP untuk perhitungan payroll.",
      idField: "ID_SENSEI",
      fields: [
        { key: "ID_SENSEI", label: "ID Sensei", type: "text", required: false, placeholder: "Kosongkan untuk ID otomatis" },
        { key: "NAMA", label: "Nama Sensei", type: "text", required: true, placeholder: "Nama lengkap sensei" },
        { key: "NO_WA", label: "No. WhatsApp", type: "text", required: false, placeholder: "08xxxxxxxxxx" },
        { key: "EMAIL", label: "Email", type: "email", required: false, placeholder: "email@example.com" },
        { key: "TARIF_PER_JAM", label: "Tarif per JP (45 menit)", type: "number", required: false, placeholder: "0" },
        { key: "STATUS", label: "Status", type: "select", required: true, options: ["AKTIF", "NONAKTIF"] }
      ]
    },
    attendance: {
      title: "Catat Absensi", editTitle: "Edit Absensi", idField: "ATTENDANCE_ID",
      fields: [
        { key: "ATTENDANCE_ID", label: "ID Absensi", type: "text", required: false, placeholder: "Kosongkan untuk ID otomatis" },
        { key: "ACTOR_ID", label: "ID Siswa / Sensei", type: "text", required: true, placeholder: "ID aktor" },
        { key: "ACTOR_TYPE", label: "Tipe Aktor", type: "select", required: true, options: ["STUDENT", "SENSEI"] },
        { key: "SESSION_ID", label: "Session ID", type: "text", required: false, placeholder: "Session ID" },
        { key: "CLASS_ID", label: "Class ID", type: "text", required: false, placeholder: "Class ID" },
        { key: "TANGGAL", label: "Tanggal", type: "date", required: true },
        { key: "JAM_MASUK", label: "Jam Masuk", type: "time", required: false },
        { key: "JAM_KELUAR", label: "Jam Keluar", type: "time", required: false },
        { key: "STATUS", label: "Status", type: "select", required: true, options: ["HADIR", "IZIN", "SAKIT", "ALPA", "TERLAMBAT"] },
        { key: "CATATAN", label: "Catatan", type: "textarea", required: false }
      ]
    },
    billing: {
      title: "Tambah Tagihan", editTitle: "Edit Tagihan", idField: "BILLING_ID",
      fields: [
        { key: "ID_SISWA", label: "ID Siswa", type: "text", required: true },
        { key: "DESCRIPTION", label: "Deskripsi", type: "text", required: true, placeholder: "Contoh: Biaya belajar bulan Oktober" },
        { key: "CATEGORY", label: "Kategori", type: "select", required: true, options: ["BELAJAR", "ASRAMA", "JOB", "LAINNYA"] },
        { key: "AMOUNT", label: "Jumlah", type: "number", required: true, placeholder: "0" },
        { key: "DUE_DATE", label: "Jatuh Tempo", type: "date", required: true },
        { key: "STATUS", label: "Status", type: "select", required: true, options: ["BELUM BAYAR", "LUNAS", "TERTUNGGAK", "CICILAN"] },
        { key: "PENERIMA", label: "Penerima / Penanggung Jawab", type: "select", required: false, options: ["Suwardi, S.T. - Direktur", "Rachmat Septiadi Ujianto - Penanggung Jawab", "M Irvan Haekal - Administrasi"] },
        { key: "NOTES", label: "Catatan", type: "textarea", required: false }
      ]
    },
    finance: {
      title: "Tambah Mutasi Keuangan", editTitle: "Edit Mutasi Keuangan",
      description: "Catat pemasukan atau pengeluaran harian.", idField: "TRANSACTION_ID",
      fields: [
        { key: "DATE", label: "Tanggal", type: "date", required: true },
        { key: "TYPE", label: "Jenis Mutasi", type: "select", required: true, options: ["PEMASUKAN", "PENGELUARAN"] },
        { key: "CATEGORY", label: "Kategori", type: "select", required: true, options: ["SPP", "Pendaftaran", "Seragam", "Donasi", "Gaji", "Operasional", "Utilitas", "Transportasi", "Konsumsi", "Perlengkapan", "Lainnya"] },
        { key: "DESCRIPTION", label: "Keterangan", type: "text", required: true, placeholder: "Contoh: pembayaran SPP bulan Oktober" },
        { key: "AMOUNT", label: "Nominal", type: "number", required: true, placeholder: "0" },
        { key: "PAYMENT_METHOD", label: "Metode", type: "select", required: true, options: ["CASH", "TRANSFER", "QRIS", "LAINNYA"] },
        { key: "REFERENCE_NO", label: "No. Referensi", type: "text", required: false },
        { key: "NOTES", label: "Catatan", type: "textarea", required: false }
      ]
    },
    payments: {
      title: "Tambah Pembayaran", editTitle: "Edit Pembayaran", idField: "PAYMENT_ID",
      fields: [
        { key: "ID_SISWA", label: "ID Siswa", type: "text", required: true },
        { key: "BILLING_ID", label: "ID Tagihan", type: "text", required: true },
        { key: "PAYMENT_DATE", label: "Tanggal Pembayaran", type: "date", required: true },
        { key: "AMOUNT", label: "Jumlah Pembayaran", type: "number", required: true },
        { key: "PAYMENT_METHOD", label: "Metode Pembayaran", type: "select", required: true, options: ["CASH", "TRANSFER", "QRIS", "LAINNYA"] },
        { key: "REFERENCE_NO", label: "Penerima", type: "select", required: false, options: ["Suwardi, S.T. - Direktur", "Rachmat Septiadi Ujianto - Penanggung Jawab", "M Irvan Haekal - Administrasi"] },
        { key: "NOTES", label: "Catatan", type: "textarea", required: false }
      ]
    },
    salary: {
      title: "Payroll Sensei", editTitle: "Edit Payroll",
      description: "Pilih sensei dan periode untuk melihat ringkasan gaji dari absensi.", idField: "SALARY_ID",
      fields: [
        { key: "ID_SENSEI", label: "ID Sensei", type: "text", required: true },
        { key: "PERIOD", label: "Periode", type: "month", required: true },
        { key: "BONUS", label: "Bonus", type: "number", required: false },
        { key: "TRANSPORT", label: "Transport", type: "number", required: false },
        { key: "DEDUCTION", label: "Potongan", type: "number", required: false },
        { key: "PAYMENT_DATE", label: "Tanggal Pembayaran", type: "date", required: false },
        { key: "PAYMENT_STATUS", label: "Status Pembayaran", type: "select", required: true, options: ["PENDING", "DIBAYAR", "LUNAS"] },
        { key: "PENERIMA", label: "Penerima / Penanggung Jawab", type: "select", required: false, options: ["Suwardi, S.T. - Direktur", "Rachmat Septiadi Ujianto - Penanggung Jawab", "M Irvan Haekal - Administrasi"] },
        { key: "NOTES", label: "Catatan", type: "textarea", required: false }
      ]
    }
  };

  function esc(v) { return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
  function formatNumber(v) { const n = Number(v||0); return new Intl.NumberFormat("id-ID").format(Number.isFinite(n)?n:0); }
  function formatRupiah(v) { const n = Number(v||0); return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0); }
  function qs(s,root=document){return root.querySelector(s);}
  function qsa(s,root=document){return Array.from(root.querySelectorAll(s));}
  function getAppRoot(){return document.getElementById("app")||document.getElementById("app-root")||document.querySelector("main")||document.body;}
  function getContentRoot(){return document.getElementById("page-content")||document.getElementById("content")||document.getElementById("app-content")||document.querySelector(".page-content")||getAppRoot();}

  function renderError(el, error) {
    console.error("ARIMA APP ERROR:", error);
    el.innerHTML = `<div class="card"><h3>Terjadi kesalahan</h3><p class="muted">${esc(error?.message || error || "Terjadi kesalahan.")}</p></div>`;
  }

  function showToast(message, type = "success") {
    let toast = document.getElementById("arima-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "arima-toast";
      Object.assign(toast.style, {position:"fixed",right:"24px",bottom:"24px",zIndex:"99999",padding:"14px 18px",borderRadius:"10px",boxShadow:"0 10px 30px rgba(0,0,0,.18)",background:"#111827",color:"#fff",fontSize:"14px"});
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.dataset.type = type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.remove(), 3000);
  }

  function getStoredUser() {
    try {
      if (window.Auth && typeof window.Auth.current === "function") { const c = window.Auth.current(); if (c) return c; }
      for (const k of ["arima_session","ARIMA_USER","ARIMA_SESSION"]) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const p = JSON.parse(raw);
        if (p && typeof p === "object") return p;
      }
      return null;
    } catch (e) { return null; }
  }

  function requireAuth() {
    const u = getStoredUser();
    if (!u) { window.location.replace("login.html"); return null; }
    user = u;
    try { const v = JSON.stringify(u); localStorage.setItem("arima_session",v); localStorage.setItem("ARIMA_USER",v); } catch(e){}
    return u;
  }

  function isAdminUser() { return String(user?.role || user?.ROLE || "").trim().toUpperCase() === "ADMIN"; }

  function logout() {
    try {
      if (window.Auth && typeof window.Auth.logout === "function") { window.Auth.logout(); return; }
      ["arima_session","ARIMA_USER","ARIMA_SESSION","ARIMA_TOKEN"].forEach(k=>localStorage.removeItem(k));
      sessionStorage.removeItem("ARIMA_TOKEN");
    } catch(e){}
    window.location.replace("login.html");
  }

  function renderLayout() {
    const root = getAppRoot();
    if (!root) return;
    const adminMenus = ["students","sensei","attendance","billing","receipts","finance","salary","reports","settings"];
    const visibleMenus = menus.filter(m => !adminMenus.includes(m[0]) || isAdminUser());
    root.innerHTML = `
      <div class="arima-layout">
        <aside class="sidebar" id="arima-sidebar">
          <div class="sidebar-brand">
            <div class="sidebar-logo"><img src="assets/logo.webp" alt="Logo"></div>
            <div class="brand-copy">
              <div class="brand-title">ARIMA</div>
              <div class="brand-subtitle">MANAGEMENT SYSTEM</div>
            </div>
          </div>
          <nav class="sidebar-nav" id="arima-menu">
            ${visibleMenus.map(m => `<button type="button" class="nav-item" data-page="${esc(m[0])}"><span class="nav-icon">${m[2]}</span><span>${esc(m[1])}</span></button>`).join("")}
          </nav>
          <div class="sidebar-footer">
            <a class="nav-item nav-link" href="attendance.html"><span class="nav-icon">✓</span><span>Absensi Siswa / Sensei</span></a>
            <button type="button" id="btn-logout" class="nav-item logout-button"><span class="nav-icon">⇥</span><span>Keluar</span></button>
          </div>
        </aside>
        <section class="main-area">
          <header class="topbar">
            <div><button type="button" id="btn-sidebar" class="icon-button" aria-label="Menu">☰</button></div>
            <div class="topbar-user"><span id="topbar-user-name">${esc(user?.name || user?.NAME || "")}</span></div>
          </header>
          <main id="page-content" class="page-content"><div class="card">Memuat aplikasi...</div></main>
        </section>
      </div>
    `;
    qs("#arima-menu")?.addEventListener("click", e => {
      const b = e.target.closest("[data-page]");
      if (b) load(b.dataset.page);
    });
    qs("#btn-logout")?.addEventListener("click", logout);
    qs("#btn-sidebar")?.addEventListener("click", () => qs("#arima-sidebar")?.classList.toggle("collapsed"));
  }

  function setActiveMenu(page) {
    qsa("[data-page]").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  }

  async function load(page) {
    const el = getContentRoot();
    if (!el) return;
    setActiveMenu(page);
    el.innerHTML = `<div class="card"><div class="muted">Memuat...</div></div>`;
    try {
      switch (String(page || "").toLowerCase()) {
        case "dashboard": await renderDashboard(el); break;
        case "students": await renderStudents(el); break;
        case "sensei": await renderSensei(el); break;
        case "attendance": await renderAttendance(el); break;
        case "billing": await renderBilling(el); break;
        case "receipts": await renderReceipts(el); break;
        case "finance": await renderFinance(el); break;
        case "salary": await renderSalary(el); break;
        case "reports": await renderReports(el); break;
        case "settings": await renderSettings(el); break;
        default: await renderDashboard(el);
      }
    } catch (e) { renderError(el, e); }
  }

  function pageHeader(title, desc, btnText = "", btnId = "") {
    return `<div class="page-title"><div><h1>${esc(title)}</h1>${desc ? `<p>${esc(desc)}</p>` : ""}</div>${btnText ? `<button type="button" class="btn btn-primary" id="${esc(btnId)}">+ ${esc(btnText)}</button>` : ""}</div>`;
  }

  function renderTable(rows, columns, options = {}) {
    const data = Array.isArray(rows) ? rows : [];
    if (!data.length) return `<div class="card"><div class="muted">${esc(options.emptyText || "Belum ada data.")}</div></div>`;
    return `
      <div class="table-wrap"><table class="data-table">
        <thead><tr>
          ${columns.map(c => `<th>${esc(c.label || c.key)}</th>`).join("")}
          ${options.actions ? "<th>Aksi</th>" : ""}
        </tr></thead>
        <tbody>
          ${data.map((row, i) => `
            <tr>
              ${columns.map(c => {
                let v = row[c.key];
                if (typeof c.render === "function") v = c.render(v, row, i);
                return `<td>${v === null || v === undefined ? "" : v}</td>`;
              }).join("")}
              ${options.actions ? `<td><div class="table-actions">${options.actions(row, i)}</div></td>` : ""}
            </tr>`).join("")}
        </tbody>
      </table></div>`;
  }

  async function renderDashboard(el) {
    try {
      const r = await API.dashboard();
      const d = r?.data || {};
      el.innerHTML = `
        <div class="page-title"><div><h1>Dashboard</h1><p>Ringkasan operasional LPKS Arima Persada.</p></div></div>
        <div class="cards">
          <div class="card"><div class="muted">Siswa Aktif</div><div class="metric">${formatNumber(d.students)}</div></div>
          <div class="card"><div class="muted">Sensei Aktif</div><div class="metric">${formatNumber(d.sensei)}</div></div>
          <div class="card"><div class="muted">Kehadiran</div><div class="metric">${formatNumber(d.attendance)}%</div></div>
          <div class="card"><div class="muted">Tagihan Pending</div><div class="metric">${formatNumber(d.pendingBilling)}</div></div>
        </div>
        <div class="section"><div class="card"><strong>Selamat datang, ${esc(user?.name || user?.NAME || "User")}</strong><p class="muted">Gunakan menu di sebelah kiri.</p></div></div>`;
    } catch (e) { renderError(el, e); }
  }

  async function renderStudents(el) {
    try {
      const r = await API.students();
      const rows = r?.data || [];
      el.innerHTML = `
        ${pageHeader("Data Siswa", "Kelola data siswa LPKS Arima Persada.", "Tambah Siswa", "btn-add-student")}
        <div class="card">${renderTable(rows, [
          { key: "ID_SISWA", label: "ID" },
          { key: "NAMA", label: "Nama" },
          { key: "NIK", label: "NIK" },
          { key: "NO_WA", label: "WhatsApp" },
          { key: "PROGRAM", label: "Program" },
          { key: "ASRAMA", label: "Asrama" },
          { key: "STATUS", label: "Status" }
        ], { actions: row => `
          <button type="button" class="btn btn-small btn-primary" data-detail-student="${esc(row.ID_SISWA)}" data-row-number="${esc(row.__ROW_NUMBER||"")}">Detail</button>
          <button type="button" class="btn btn-small" data-edit-student="${esc(row.ID_SISWA)}" data-row-number="${esc(row.__ROW_NUMBER||"")}">Edit</button>
          <button type="button" class="btn btn-small btn-danger" data-delete-student="${esc(row.ID_SISWA)}" data-row-number="${esc(row.__ROW_NUMBER||"")}">Hapus</button>
        ` })}</div>`;

      qs("#btn-add-student")?.addEventListener("click", () => openFormModal("students"));
      qsa("[data-edit-student]").forEach(b => b.addEventListener("click", () => {
        const row = rows.find(it => String(it.__ROW_NUMBER) === String(b.dataset.rowNumber)) || rows.find(it => String(it.ID_SISWA) === String(b.dataset.editStudent));
        if (row) openFormModal("students", row);
      }));
      qsa("[data-detail-student]").forEach(b => b.addEventListener("click", () => {
        const row = rows.find(it => String(it.__ROW_NUMBER) === String(b.dataset.rowNumber)) || rows.find(it => String(it.ID_SISWA) === String(b.dataset.detailStudent));
        if (row) openStudentDetailModal(row);
      }));
      qsa("[data-delete-student]").forEach(b => b.addEventListener("click", async () => {
        if (!confirm("Hapus data siswa ini?")) return;
        try {
          const res = await API.delete("students", { ID_SISWA: b.dataset.deleteStudent, __ROW_NUMBER: b.dataset.rowNumber });
          if (res?.success === false) throw new Error(res.message);
          showToast("Data siswa berhasil dihapus.");
          await renderStudents(el);
        } catch (e) { showToast(e.message || "Gagal menghapus.", "error"); }
      }));
    } catch (e) { renderError(el, e); }
  }

  let __chartJsPromise = null;
  function ensureChartJs() {
    if (window.Chart) return Promise.resolve(window.Chart);
    if (!__chartJsPromise) {
      __chartJsPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
        s.onload = () => window.Chart ? resolve(window.Chart) : reject(new Error("Chart.js tidak tersedia."));
        s.onerror = () => reject(new Error("Chart.js gagal dimuat."));
        document.head.appendChild(s);
      });
    }
    return __chartJsPromise;
  }

  function defaultStartDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; }
  function defaultEndDate() { const d = new Date(); const l = new Date(d.getFullYear(), d.getMonth()+1, 0); return `${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`; }

  async function openStudentDetailModal(student) {
    if (!student) return;
    document.getElementById("arima-student-detail")?.remove();
    const modal = document.createElement("div");
    modal.id = "arima-student-detail";
    modal.className = "modal-overlay form-modal";
    modal.innerHTML = `
      <div class="modal form-modal-shell student-detail-shell" role="dialog" aria-modal="true">
        <div class="form-modal-header">
          <div class="form-modal-heading">
            <span class="form-modal-kicker">DETAIL SISWA</span>
            <h2>${esc(student.NAMA || "-")}</h2>
            <p>ID ${esc(student.ID_SISWA || "-")} · ${esc(student.PROGRAM || "-")} · ${esc(student.STATUS || "-")}</p>
          </div>
          <button type="button" class="modal-close" id="sd-close">×</button>
        </div>
        <div class="student-detail-body">
          <section class="student-detail-section"><h3>Data Pribadi</h3>
            <div class="student-detail-grid">
              <div><span>Nama</span><strong>${esc(student.NAMA || "-")}</strong></div>
              <div><span>ID</span><strong>${esc(student.ID_SISWA || "-")}</strong></div>
              <div><span>NIK</span><strong>${esc(student.NIK || "-")}</strong></div>
              <div><span>WhatsApp</span><strong>${esc(student.NO_WA || "-")}</strong></div>
              <div><span>Orang Tua</span><strong>${esc(student.NAMA_ORANG_TUA || "-")}</strong></div>
              <div><span>WA Ortu</span><strong>${esc(student.NO_WA_ORANG_TUA || "-")}</strong></div>
              <div><span>Asrama</span><strong>${esc(student.ASRAMA || "-")}</strong></div>
              <div><span>Tgl Masuk</span><strong>${esc(String(student.TANGGAL_MASUK||"").slice(0,10) || "-")}</strong></div>
            </div>
          </section>
          <section class="student-detail-section"><h3>Program SSW & Sertifikat</h3>
            <div class="student-detail-grid">
              <div><span>Ikut SSW</span><strong>${esc(student.SSW || "Belum diisi")}</strong></div>
              <div><span>Bidang SSW</span><strong>${esc(student.SSW_DETAIL || "-")}</strong></div>
              <div><span>Nilai SSW</span><strong>${esc(student.NILAI_SSW || "-")}</strong></div>
              <div><span>Level JFT</span><strong>${esc(student.JFT_LEVEL || "-")}</strong></div>
              <div><span>Level JLPT</span><strong>${esc(student.JLPT_LEVEL || "-")}</strong></div>
              <div><span>Tgl Sertifikat</span><strong>${esc(String(student.JFT_JLPT_DATE||"").slice(0,10) || "-")}</strong></div>
            </div>
          </section>
          <section class="student-detail-section"><h3>Berkas Siswa</h3>
            <div class="student-detail-grid">
              <div><span>Foto Siswa</span><strong>${student.FOTO_SISWA_URL ? `<a href="${esc(student.FOTO_SISWA_URL)}" target="_blank" rel="noopener">Lihat Foto</a>` : "-"}</strong></div>
              <div><span>File CV</span><strong>${student.CV_URL ? `<a href="${esc(student.CV_URL)}" target="_blank" rel="noopener">Lihat CV</a>` : "-"}</strong></div>
            </div>
          </section>
          <section class="student-detail-section"><h3>Rekap Absensi</h3>
            <div class="student-attendance-filter">
              <label>Dari<input type="date" id="sd-from" value="${defaultStartDate()}"></label>
              <label>Sampai<input type="date" id="sd-to" value="${defaultEndDate()}"></label>
              <button type="button" class="btn btn-primary" id="sd-apply">Terapkan</button>
            </div>
            <div id="sd-attendance-content"><div class="muted" style="padding:20px 0;text-align:center;">Memuat...</div></div>
          </section>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => { if (modal._chart) { try { modal._chart.destroy(); } catch(_){} } modal.remove(); };
    qs("#sd-close", modal).addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });

    const content = qs("#sd-attendance-content", modal);
    const fromInput = qs("#sd-from", modal);
    const toInput = qs("#sd-to", modal);

    async function loadAttendance() {
      content.innerHTML = `<div class="muted" style="padding:20px 0;text-align:center;">Memuat...</div>`;
      try {
        const r = await API.attendance();
        if (r?.success === false) throw new Error(r.message);
        const from = fromInput.value, to = toInput.value;
        const all = Array.isArray(r?.data) ? r.data : [];
        const sid = String(student.ID_SISWA || "").trim().toUpperCase();
        const filtered = all.filter(row => {
          if (String(row.ACTOR_ID || "").trim().toUpperCase() !== sid) return false;
          if (String(row.ACTOR_TYPE || "").trim().toUpperCase() !== "STUDENT") return false;
          const tgl = String(row.TANGGAL || "").slice(0, 10);
          if (from && tgl < from) return false;
          if (to && tgl > to) return false;
          return true;
        }).sort((a,b) => String(b.TANGGAL||"").localeCompare(String(a.TANGGAL||"")));
        const counts = { HADIR:0, IZIN:0, SAKIT:0, ALPA:0, TERLAMBAT:0 };
        filtered.forEach(row => { const s = String(row.STATUS||"").trim().toUpperCase(); if (counts[s] !== undefined) counts[s]++; });
        const total = filtered.length;
        const totalHadir = counts.HADIR + counts.TERLAMBAT;
        const pct = total ? Math.round(totalHadir / total * 100) : 0;
        if (!total) { content.innerHTML = `<div class="muted" style="padding:20px 0;text-align:center;">Tidak ada data absensi.</div>`; return; }
        content.innerHTML = `
          <div class="student-attendance-stats">
            <div class="stat-card hadir"><strong>${formatNumber(counts.HADIR+counts.TERLAMBAT)}</strong><span>Hadir</span></div>
            <div class="stat-card izin"><strong>${formatNumber(counts.IZIN+counts.SAKIT)}</strong><span>Izin/Sakit</span></div>
            <div class="stat-card alpa"><strong>${formatNumber(counts.ALPA)}</strong><span>Alpa</span></div>
            <div class="stat-card pct"><strong>${pct}%</strong><span>Kehadiran</span></div>
          </div>
          <div class="student-attendance-chart"><canvas id="sd-chart-canvas"></canvas></div>
          <div class="student-attendance-history"><table>
            <thead><tr><th>Tanggal</th><th>Masuk</th><th>Keluar</th><th>Status</th><th>Catatan</th></tr></thead>
            <tbody>${filtered.map(row => `<tr><td>${esc(String(row.TANGGAL||"").slice(0,10))}</td><td>${esc(String(row.JAM_MASUK||"-").slice(0,5))}</td><td>${esc(String(row.JAM_KELUAR||"-").slice(0,5))}</td><td><span class="student-badge ${String(row.STATUS||"").toLowerCase()}">${esc(row.STATUS||"-")}</span></td><td>${esc(row.CATATAN||"-")}</td></tr>`).join("")}</tbody>
          </table></div>`;
        try {
          const Chart = await ensureChartJs();
          if (modal._chart) { try { modal._chart.destroy(); } catch(_){} }
          const ctx = qs("#sd-chart-canvas", content).getContext("2d");
          modal._chart = new Chart(ctx, {
            type: "doughnut",
            data: { labels: ["Hadir","Terlambat","Izin","Sakit","Alpa"], datasets: [{ data: [counts.HADIR,counts.TERLAMBAT,counts.IZIN,counts.SAKIT,counts.ALPA], backgroundColor: ["#18794e","#2a4ea3","#d4a017","#c98a2e","#b4232c"], borderWidth: 2, borderColor: "#fff" }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { font: { size: 12 } } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed} (${Math.round(c.parsed/total*100)}%)` } } }, cutout: "60%" }
          });
        } catch (e) { console.warn("Chart:", e); }
      } catch (e) { content.innerHTML = `<div class="alert error">${esc(e.message || "Gagal memuat.")}</div>`; }
    }
    qs("#sd-apply", modal).addEventListener("click", loadAttendance);
    loadAttendance();
  }

  async function renderSensei(el) {
    try {
      const r = await API.sensei();
      const rows = r?.data || [];
      const cols = [
        { key: "ID_SENSEI", label: "ID" },
        { key: "NAMA", label: "Nama" },
        { key: "NO_WA", label: "WhatsApp" },
        { key: "EMAIL", label: "Email" },
        { key: "STATUS", label: "Status" }
      ];
      if (isAdminUser()) cols.splice(4, 0, { key: "TARIF_PER_JAM", label: "Tarif / JP", render: v => formatRupiah(v) });
      el.innerHTML = `
        ${pageHeader("Data Sensei", "Kelola data pengajar.", "Tambah Sensei", "btn-add-sensei")}
        <div class="card">${renderTable(rows, cols, { actions: row => `
          <button type="button" class="btn btn-small" data-edit-sensei="${esc(row.ID_SENSEI)}" data-row-number="${esc(row.__ROW_NUMBER||"")}">Edit</button>
          <button type="button" class="btn btn-small btn-danger" data-delete-sensei="${esc(row.ID_SENSEI)}" data-row-number="${esc(row.__ROW_NUMBER||"")}">Hapus</button>
        ` })}</div>`;
      qs("#btn-add-sensei")?.addEventListener("click", () => openFormModal("sensei"));
      qsa("[data-edit-sensei]").forEach(b => b.addEventListener("click", () => {
        const row = rows.find(it => String(it.__ROW_NUMBER) === String(b.dataset.rowNumber)) || rows.find(it => String(it.ID_SENSEI) === String(b.dataset.editSensei));
        if (row) openFormModal("sensei", row);
      }));
      qsa("[data-delete-sensei]").forEach(b => b.addEventListener("click", async () => {
        if (!confirm("Hapus data sensei ini?")) return;
        try {
          const res = await API.delete("sensei", { ID_SENSEI: b.dataset.deleteSensei, __ROW_NUMBER: b.dataset.rowNumber });
          if (res?.success === false) throw new Error(res.message);
          showToast("Data sensei berhasil dihapus.");
          await renderSensei(el);
        } catch (e) { showToast(e.message || "Gagal.", "error"); }
      }));
    } catch (e) { renderError(el, e); }
  }

  async function renderAttendance(el) {
    try {
      const [aR, sR, seR] = await Promise.all([API.attendance(), API.students(), API.sensei()]);
      [aR, sR, seR].forEach((r, i) => { if (r?.success === false) throw new Error(r.message || `Data ${["absensi","siswa","sensei"][i]} gagal.`); });
      const rows = Array.isArray(aR?.data) ? aR.data : [];
      const students = Array.isArray(sR?.data) ? sR.data : [];
      const sensei = Array.isArray(seR?.data) ? seR.data : [];
      const studentsWithoutIds = students.filter(r => { const id = String(r.ID_SISWA||"").trim(); return !id || /^SISWA\d+$/i.test(id); }).length;
      const senseiWithoutIds = sensei.filter(r => { const id = String(r.ID_SENSEI||"").trim(); return !id || /^SENSEI\d+$/i.test(id); }).length;
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth()+1).padStart(2,"0"), String(now.getDate()).padStart(2,"0")].join("-");
      let editingRecord = null;
      const findActor = (type, id) => {
        const recs = type === "STUDENT" ? students : sensei;
        const key = type === "STUDENT" ? "ID_SISWA" : "ID_SENSEI";
        return recs.find(r => String(r[key]||"") === String(id||"")) || null;
      };
      const actorName = row => findActor(row.ACTOR_TYPE, row.ACTOR_ID)?.NAMA || "ID tidak ditemukan";

      el.innerHTML = `
        ${pageHeader("Absensi", "Pilih ID siswa atau sensei untuk mencatat kehadiran.")}
        ${(studentsWithoutIds || senseiWithoutIds) ? `
          <div class="alert error attendance-id-warning">
            <span>${studentsWithoutIds ? formatNumber(studentsWithoutIds)+" siswa" : ""} ${studentsWithoutIds && senseiWithoutIds ? "dan" : ""} ${senseiWithoutIds ? formatNumber(senseiWithoutIds)+" sensei" : ""} belum memakai format ID baru.</span>
            <div class="toolbar">
              ${studentsWithoutIds ? `<button type="button" class="btn btn-small" id="btn-assign-student-ids">Buat ID Siswa</button>` : ""}
              ${senseiWithoutIds ? `<button type="button" class="btn btn-small" id="btn-assign-sensei-ids">Buat ID Sensei</button>` : ""}
            </div>
          </div>
        ` : ""}
        <section class="card attendance-form-card">
          <div class="section-head"><h2 id="attendance-form-title">Catat Kehadiran</h2><button type="button" class="btn btn-light hidden" id="attendance-cancel-edit">Batal Edit</button></div>
          <form id="attendance-form" class="form-grid">
            <div class="form-group"><label for="attendance-actor-type">Jenis peserta</label><select id="attendance-actor-type" name="ACTOR_TYPE" required><option value="STUDENT">Siswa</option><option value="SENSEI">Sensei</option></select></div>
            <div class="form-group"><label for="attendance-actor-id">ID / Nama</label><select id="attendance-actor-id" name="ACTOR_ID" required></select></div>
            <div class="attendance-person" id="attendance-person"><span class="muted">Pilih peserta.</span></div>
            <div class="form-group"><label for="attendance-date">Tanggal</label><input type="date" id="attendance-date" name="TANGGAL" value="${today}" required></div>
            <div class="form-group"><label for="attendance-status">Status</label><select id="attendance-status" name="STATUS" required>${["HADIR","IZIN","SAKIT","ALPA","TERLAMBAT"].map(s=>`<option value="${s}"${s==="HADIR"?" selected":""}>${s}</option>`).join("")}</select></div>
            <div class="form-group"><label id="attendance-check-in-label" for="attendance-check-in">Jam Masuk</label><input type="time" id="attendance-check-in" name="JAM_MASUK"></div>
            <div class="form-group"><label id="attendance-check-out-label" for="attendance-check-out">Jam Keluar</label><input type="time" id="attendance-check-out" name="JAM_KELUAR"></div>
            <div class="form-group" id="attendance-session-group"><label for="attendance-session">ID Sesi (opsional)</label><input type="text" id="attendance-session" name="SESSION_ID"></div>
            <div class="attendance-jp-note hidden" id="attendance-jp-note">Durasi mengajar 1 JP = 45 menit.</div>
            <div class="form-group form-group-wide"><label for="attendance-notes">Catatan</label><textarea id="attendance-notes" name="CATATAN" rows="2"></textarea></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary" id="attendance-submit">Simpan Absensi</button></div>
          </form>
        </section>
        <section class="section attendance-history"><div class="section-head"><h2>Riwayat Absensi</h2></div>
          <div class="card">${renderTable(rows, [
            { key: "TANGGAL", label: "Tanggal", render: v => esc(String(v||"").slice(0,10)) },
            { key: "ACTOR_TYPE", label: "Jenis", render: v => v === "STUDENT" ? "Siswa" : "Sensei" },
            { key: "ACTOR_ID", label: "ID" },
            { key: "NAMA", label: "Nama", render: (v, row) => esc(actorName(row)) },
            { key: "JAM_MASUK", label: "Masuk" },
            { key: "JAM_KELUAR", label: "Keluar" },
            { key: "STATUS", label: "Status" }
          ], { emptyText: "Belum ada catatan.", actions: row => `<button type="button" class="btn btn-small" data-edit-attendance="${esc(row.ATTENDANCE_ID||"")}" data-row-number="${esc(row.__ROW_NUMBER||"")}">Edit</button>` })}
          </div>
        </section>`;

      const form = qs("#attendance-form", el);
      const actorType = qs("#attendance-actor-type", el);
      const actorSelect = qs("#attendance-actor-id", el);
      const personCard = qs("#attendance-person", el);
      const submit = qs("#attendance-submit", el);
      const cancelEdit = qs("#attendance-cancel-edit", el);

      function updateAttendanceTimeFields() {
        const senseiSel = actorType.value === "SENSEI";
        const counts = senseiSel && ["HADIR","TERLAMBAT"].includes(qs("#attendance-status",el).value);
        qs("#attendance-check-in-label",el).textContent = senseiSel ? "Jam Mengajar Mulai" : "Jam Masuk";
        qs("#attendance-check-out-label",el).textContent = senseiSel ? "Jam Mengajar Selesai" : "Jam Keluar";
        qs("#attendance-check-in",el).required = counts;
        qs("#attendance-check-out",el).required = counts;
        qs("#attendance-session-group",el).classList.toggle("hidden", senseiSel);
        qs("#attendance-jp-note",el).classList.toggle("hidden", !senseiSel);
        if (senseiSel) qs("#attendance-session",el).value = "";
      }
      function populateActors(sel = "") {
        updateAttendanceTimeFields();
        const type = actorType.value;
        const recs = type === "STUDENT" ? students : sensei;
        const key = type === "STUDENT" ? "ID_SISWA" : "ID_SENSEI";
        const idt = recs.filter(r => String(r[key]||"").trim());
        actorSelect.innerHTML = idt.length ? `<option value="">Pilih...</option>${idt.map(r => `<option value="${esc(r[key])}">${esc(r[key])} - ${esc(r.NAMA||"-")}</option>`).join("")}` : `<option value="">${type === "STUDENT" ? "Belum ada ID siswa" : "Belum ada data sensei"}</option>`;
        actorSelect.value = sel;
        updateActorDetails();
      }
      function updateActorDetails() {
        const a = findActor(actorType.value, actorSelect.value);
        if (!a) { personCard.innerHTML = `<span class="muted">${actorType.value === "STUDENT" && studentsWithoutIds ? "Buat ID siswa dahulu." : "Pilih peserta."}</span>`; return; }
        const d = actorType.value === "STUDENT" ? `WA: ${a.NO_WA||"-"} · Program: ${a.PROGRAM||"-"}` : `WA: ${a.NO_WA||"-"} · ${a.STATUS||"-"}`;
        personCard.innerHTML = `<strong>${esc(a.NAMA||"-")}</strong><span>ID: ${esc(actorSelect.value)}</span><span>${esc(d)}</span>`;
      }
      function resetAttendanceForm() {
        editingRecord = null;
        form.reset();
        qs("#attendance-date",el).value = today;
        qs("#attendance-status",el).value = "HADIR";
        qs("#attendance-form-title",el).textContent = "Catat Kehadiran";
        submit.textContent = "Simpan Absensi";
        cancelEdit.classList.add("hidden");
        populateActors();
      }

      actorType.addEventListener("change", () => populateActors());
      actorSelect.addEventListener("change", updateActorDetails);
      qs("#attendance-status",el).addEventListener("change", updateAttendanceTimeFields);
      cancelEdit.addEventListener("click", resetAttendanceForm);

      form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!actorSelect.value) { showToast("Pilih peserta yang punya ID.", "error"); return; }
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.CLASS_ID = "";
        if (payload.ACTOR_TYPE === "SENSEI") payload.SESSION_ID = "";
        if (editingRecord) { payload.ATTENDANCE_ID = editingRecord.ATTENDANCE_ID || ""; payload.__ROW_NUMBER = editingRecord.__ROW_NUMBER; }
        submit.disabled = true; submit.textContent = "Menyimpan...";
        try {
          const r = editingRecord ? await API.update("attendance", payload) : await API.create("attendance", payload);
          if (r?.success === false) throw new Error(r.message);
          showToast(r?.message || "Absensi tersimpan.");
          await renderAttendance(el);
        } catch (e) { submit.disabled = false; submit.textContent = editingRecord ? "Simpan Perubahan" : "Simpan Absensi"; showToast(e.message || "Gagal.", "error"); }
      });

      qsa("[data-edit-attendance]",el).forEach(b => b.addEventListener("click", () => {
        const row = rows.find(it => String(it.__ROW_NUMBER) === String(b.dataset.rowNumber)) || rows.find(it => String(it.ATTENDANCE_ID) === String(b.dataset.editAttendance));
        if (!row) return;
        editingRecord = row;
        actorType.value = row.ACTOR_TYPE === "SENSEI" ? "SENSEI" : "STUDENT";
        populateActors(row.ACTOR_ID);
        qs("#attendance-date",el).value = String(row.TANGGAL||"").slice(0,10);
        qs("#attendance-status",el).value = row.STATUS || "HADIR";
        qs("#attendance-check-in",el).value = String(row.JAM_MASUK||"").includes("T") ? String(row.JAM_MASUK).slice(11,16) : String(row.JAM_MASUK||"").slice(0,5);
        qs("#attendance-check-out",el).value = String(row.JAM_KELUAR||"").includes("T") ? String(row.JAM_KELUAR).slice(11,16) : String(row.JAM_KELUAR||"").slice(0,5);
        qs("#attendance-session",el).value = row.SESSION_ID || "";
        qs("#attendance-notes",el).value = row.CATATAN || "";
        qs("#attendance-form-title",el).textContent = "Edit Absensi";
        submit.textContent = "Simpan Perubahan";
        cancelEdit.classList.remove("hidden");
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }));

      qs("#btn-assign-student-ids",el)?.addEventListener("click", async e => {
        if (!confirm(`Buat/perbarui ID ${studentsWithoutIds} siswa?`)) return;
        const btn = e.currentTarget; btn.disabled = true; btn.textContent = "Membuat...";
        try { const r = await API.assignStudentIds(); if (r?.success === false) throw new Error(r.message); showToast(r?.message || "OK"); await renderAttendance(el); }
        catch (e) { btn.disabled = false; btn.textContent = "Buat ID Siswa"; showToast(e.message || "Gagal.", "error"); }
      });
      qs("#btn-assign-sensei-ids",el)?.addEventListener("click", async e => {
        if (!confirm(`Buat/perbarui ID ${senseiWithoutIds} sensei?`)) return;
        const btn = e.currentTarget; btn.disabled = true; btn.textContent = "Membuat...";
        try { const r = await API.assignSenseiIds(); if (r?.success === false) throw new Error(r.message); showToast(r?.message || "OK"); await renderAttendance(el); }
        catch (e) { btn.disabled = false; btn.textContent = "Buat ID Sensei"; showToast(e.message || "Gagal.", "error"); }
      });
      populateActors();
    } catch (e) { renderError(el, e); }
  }

  async function renderReceipts(el) {
    if (!isAdminUser()) { el.innerHTML = `<div class="card"><h2>Akses Ditolak</h2></div>`; return; }
    try {
      const [pR, sR, bR] = await Promise.all([API.payments(), API.students(), API.billing()]);
      if (pR?.success === false) throw new Error(pR.message);
      if (sR?.success === false) throw new Error(sR.message);
      if (bR?.success === false) throw new Error(bR.message);

      const studentsMap = new Map((Array.isArray(sR?.data) ? sR.data : []).map(r => [String(r.ID_SISWA||"").trim(), r]));
      const billingRows = Array.isArray(bR?.data) ? bR.data : [];
      const payments = (Array.isArray(pR?.data) ? pR.data : []).slice().sort((a,b) => String(b.PAYMENT_DATE||"").localeCompare(String(a.PAYMENT_DATE||"")));
      
      const dateText = v => { const t = String(v||""); return /^\d{4}-\d{2}-\d{2}/.test(t) ? t.slice(0,10) : t; };
      const nameOf = r => studentsMap.get(String(r.ID_SISWA||"").trim())?.NAMA || "-";

      el.innerHTML = `
        ${pageHeader("Kuitansi", "Cetak bukti pembayaran siswa.")}
        <div class="report-toolbar"><div><label for="receipt-search">Cari</label><input id="receipt-search" type="search" placeholder="ID, nama, atau no. bayar" autocomplete="off"></div></div>
        <div id="receipt-list"></div>`;

      const listRoot = qs("#receipt-list", el);
      function draw(filter = "") {
        const kw = filter.trim().toLowerCase();
        const rows = payments.filter(r => !kw || [r.PAYMENT_ID, r.ID_SISWA, nameOf(r), r.BILLING_ID].some(v => String(v||"").toLowerCase().includes(kw)));
        if (!rows.length) { listRoot.innerHTML = `<div class="card"><div class="muted">${payments.length ? "Tidak cocok." : "Belum ada data."}</div></div>`; return; }
        listRoot.innerHTML = `<div class="table-wrap"><table class="data-table">
          <thead><tr><th>Tanggal</th><th>No. Bayar</th><th>ID Siswa</th><th>Nama</th><th>Jumlah</th><th>Metode</th><th></th></tr></thead>
          <tbody>${rows.map(r => `<tr>
            <td>${esc(dateText(r.PAYMENT_DATE))}</td><td>${esc(r.PAYMENT_ID)}</td><td>${esc(r.ID_SISWA)}</td><td>${esc(nameOf(r))}</td>
            <td class="receipt-amount">${esc(formatRupiah(r.AMOUNT))}</td><td>${esc(r.PAYMENT_METHOD||"-")}</td>
            <td><div class="receipt-actions">
              <button type="button" class="btn btn-primary" data-receipt-pdf="${esc(r.PAYMENT_ID)}">Cetak PDF</button>
              <button type="button" class="btn btn-light" data-receipt-wa="${esc(r.PAYMENT_ID)}">WhatsApp</button>
              <button type="button" class="btn btn-light" data-receipt-edit="${esc(r.PAYMENT_ID)}">Edit</button>
              <button type="button" class="btn btn-danger" data-receipt-delete="${esc(r.PAYMENT_ID)}">Hapus</button>
            </div></td>
          </tr>`).join("")}</tbody></table></div>`;
      }
      draw();
      qs("#receipt-search",el).addEventListener("input", e => draw(e.target.value));

      async function downloadReceipt(payment) {
        const student = studentsMap.get(String(payment.ID_SISWA||"").trim()) || {};
        // Cari data billing yang sesuai
        const billing = billingRows.find(b => String(b.BILLING_ID) === String(payment.BILLING_ID)) || {};
        // Kirim data billing ke parameter ke-3
        const { pdf, fileName } = await window.ArimaPdf.buildReceipt(payment, student, billing);
        pdf.save(fileName);
      }
      function sendWA(payment) {
        const student = studentsMap.get(String(payment.ID_SISWA||"").trim()) || {};
        let phone = String(student.NO_WA||"").replace(/\D/g,"");
        if (!phone) throw new Error("Nomor WA siswa belum tersedia.");
        if (phone.startsWith("0")) phone = `62${phone.slice(1)}`; else if (!phone.startsWith("62")) phone = `62${phone}`;
        const msg = ["LPKS Arima Persada - Kuitansi", `No: ${payment.PAYMENT_ID||"-"}`, `Nama: ${student.NAMA||"-"}`, `Tanggal: ${dateText(payment.PAYMENT_DATE)||"-"}`, `Jumlah: ${formatRupiah(payment.AMOUNT)}`, `Metode: ${payment.PAYMENT_METHOD||"-"}`, "Terima kasih."].join("\n");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
      }
      listRoot.addEventListener("click", async e => {
        const pb = e.target.closest("[data-receipt-pdf]");
        const wb = e.target.closest("[data-receipt-wa]");
        const db = e.target.closest("[data-receipt-delete]");
        const eb = e.target.closest("[data-receipt-edit]"); // Tangkap tombol Edit
        const b = pb || wb || db || eb; 
        
        if (!b) return;
        const id = b.dataset.receiptPdf || b.dataset.receiptWa || b.dataset.receiptDelete || b.dataset.receiptEdit;
        const payment = payments.find(r => String(r.PAYMENT_ID) === id); 
        if (!payment) return;
        
        try {
          if (eb) {
            // Buka form edit pembayaran
            openFormModal("payments", payment, {
              studentRows: Array.from(studentsMap.values()),
              billingRows: billingRows
            });
          } else if (db) {
            if (!confirm("Hapus pembayaran ini? Mutasi keuangan terkait juga akan dihapus.")) return;
            b.disabled = true;
            const res = await API.deleteRecord("payments", { PAYMENT_ID: id, __ROW_NUMBER: payment.__ROW_NUMBER });
            if (res?.success === false) throw new Error(res.message);
            showToast(res?.message || "Dihapus.");
            await renderReceipts(el);
          } else if (pb) { 
            b.disabled = true; 
            await downloadReceipt(payment); 
          } else { 
            sendWA(payment); 
          }
        } catch (err) { 
          showToast(err.message || "Gagal.", "error"); 
        } finally { 
          b.disabled = false; 
        }
      });
    } catch (e) { renderError(el, e); }
  }

  async function renderBilling(el) {
    if (!isAdminUser()) { el.innerHTML = `<div class="card"><h2>Akses Ditolak</h2></div>`; return; }
    try {
      const [bR, sR] = await Promise.all([API.billing(), API.students()]);
      if (bR?.success === false) throw new Error(bR.message);
      if (sR?.success === false) throw new Error(sR.message);
      const billings = Array.isArray(bR?.data) ? bR.data : [];
      const students = Array.isArray(sR?.data) ? sR.data : [];
      const params = new URLSearchParams(window.location.search);
      const initialId = params.get("studentId") || "";

      el.innerHTML = `
        ${pageHeader("Tagihan Siswa", "Cari ID atau nama siswa untuk melihat tagihan.", "Tambah Tagihan", "btn-add-billing")}
        <section class="card billing-lookup">
          <form id="billing-student-search" class="billing-search-form">
            <div><label for="billing-student-id">Cari Siswa</label><input id="billing-student-id" name="studentId" value="${esc(initialId)}" placeholder="ID / nama siswa" autocomplete="off" list="billing-student-list" required>
              <datalist id="billing-student-list">${students.filter(r => String(r.ID_SISWA||"").trim()).map(r => `<option value="${esc(r.ID_SISWA||"")}">${esc(r.NAMA||"")}</option>`).join("")}</datalist>
            </div>
            <button type="submit" class="btn btn-primary">Cari Data</button>
          </form>
          <p class="tiny">Bisa ketik ID, sebagian ID, atau nama siswa.</p>
        </section>
        <div id="billing-student-result" class="section"></div>`;

      const searchForm = qs("#billing-student-search", el);
      const idInput = qs("#billing-student-id", el);
      const addButton = qs("#btn-add-billing", el);
      const resultRoot = qs("#billing-student-result", el);
      let selectedStudent = null;

      const invoiceDate = v => { const t = String(v||""); return /^\d{4}-\d{2}-\d{2}/.test(t) ? t.slice(0,10) : t; };
      async function downloadInvoice(student, invoice) {
        const { pdf, fileName } = await window.ArimaPdf.buildInvoice(invoice, student);
        pdf.save(fileName);
      }
      function sendInvoiceWA(student, invoice) {
        let phone = String(student.NO_WA||"").replace(/\D/g,"");
        if (!phone) throw new Error("Nomor WA belum tersedia.");
        if (phone.startsWith("0")) phone = `62${phone.slice(1)}`; else if (!phone.startsWith("62")) phone = `62${phone}`;
        const msg = [`LPKS Arima Persada - Surat Tagihan`, `ID: ${student.ID_SISWA}`, `Nama: ${student.NAMA||"-"}`, `No: ${invoice.BILLING_ID||"-"}`, `Rincian: ${invoice.DESCRIPTION||"-"}`, `Jumlah: ${formatRupiah(invoice.AMOUNT)}`, `Jatuh tempo: ${invoiceDate(invoice.DUE_DATE)||"-"}`, `Status: ${invoice.STATUS||"-"}`, "Silakan hubungi LPKS."].join("\n");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
      }

      function renderStudentInvoices(student) {
        selectedStudent = student;
        if (!student) { resultRoot.innerHTML = `<div class="card billing-empty-state"><strong>Siswa tidak ditemukan.</strong></div>`; return; }
        const studentInvoices = billings.filter(r => String(r.ID_SISWA||"").trim().toUpperCase() === String(student.ID_SISWA||"").trim().toUpperCase());
        resultRoot.innerHTML = `
          <section class="card billing-student-card">
            <div><span class="billing-label">SISWA</span><h2>${esc(student.NAMA||"-")}</h2><span class="muted">ID ${esc(student.ID_SISWA)}</span></div>
            <div class="billing-contact"><span class="muted">WhatsApp</span><strong>${esc(student.NO_WA||"-")}</strong></div>
          </section>
          <section class="section billing-invoice-list">
            <div class="section-head"><h2>Daftar Tagihan (${formatNumber(studentInvoices.length)})</h2></div>
            <div class="card">${renderTable(studentInvoices, [
              { key: "BILLING_ID", label: "No. Tagihan", render: v => esc(v||"") },
              { key: "DESCRIPTION", label: "Rincian", render: v => esc(v||"") },
              { key: "DUE_DATE", label: "Jatuh Tempo", render: v => esc(invoiceDate(v)) },
              { key: "AMOUNT", label: "Jumlah", render: v => formatRupiah(v) },
              { key: "STATUS", label: "Status", render: v => esc(v||"") }
            ], { emptyText: "Belum ada tagihan.", actions: inv => `
              ${String(inv.STATUS||"").trim().toUpperCase() === "LUNAS"
                ? `<span class="badge" style="background:#eaf5ef;color:#19724d;padding:6px 10px;border-radius:99px;font-size:11px;font-weight:700;">✓ LUNAS</span>`
                : `<button type="button" class="btn btn-small btn-primary" data-pay-billing="${esc(inv.BILLING_ID||"")}">Bayar</button>`}
              <button type="button" class="btn btn-small" data-edit-billing="${esc(inv.BILLING_ID||"")}">Edit</button>
              <button type="button" class="btn btn-small" data-download-invoice="${esc(inv.BILLING_ID||"")}">PDF</button>
              <button type="button" class="btn btn-small btn-light" data-send-invoice="${esc(inv.BILLING_ID||"")}">WA</button>
              <button type="button" class="btn btn-small btn-danger" data-delete-billing="${esc(inv.BILLING_ID||"")}">Hapus</button>
            ` })}</div>
          </section>`;

        qsa("[data-edit-billing]", resultRoot).forEach(b => b.addEventListener("click", () => {
          const inv = studentInvoices.find(r => String(r.BILLING_ID) === String(b.dataset.editBilling));
          if (inv) openFormModal("billing", inv, { studentRows: students });
        }));
        qsa("[data-download-invoice]", resultRoot).forEach(b => b.addEventListener("click", async () => {
          const inv = studentInvoices.find(r => String(r.BILLING_ID) === String(b.dataset.downloadInvoice));
          if (!inv) return; b.disabled = true;
          try { await downloadInvoice(student, inv); } catch (e) { showToast(e.message || "PDF gagal.", "error"); } finally { b.disabled = false; }
        }));
        qsa("[data-send-invoice]", resultRoot).forEach(b => b.addEventListener("click", () => {
          const inv = studentInvoices.find(r => String(r.BILLING_ID) === String(b.dataset.sendInvoice));
          if (!inv) return;
          try { sendInvoiceWA(student, inv); } catch (e) { showToast(e.message || "WA gagal.", "error"); }
        }));
        qsa("[data-delete-billing]", resultRoot).forEach(b => b.addEventListener("click", async () => {
          const inv = studentInvoices.find(r => String(r.BILLING_ID) === String(b.dataset.deleteBilling));
          if (!inv) return;
          if (!confirm(`Hapus tagihan ${inv.BILLING_ID}?`)) return;
          b.disabled = true;
          try {
            const res = await API.deleteRecord("billing", { BILLING_ID: inv.BILLING_ID, __ROW_NUMBER: inv.__ROW_NUMBER });
            if (res?.success === false) throw new Error(res.message);
            showToast(res?.message || "Dihapus.");
            await renderBilling(el);
          } catch (e) { b.disabled = false; showToast(e.message || "Gagal.", "error"); }
        }));
        qsa("[data-pay-billing]", resultRoot).forEach(b => b.addEventListener("click", () => {
          const inv = studentInvoices.find(r => String(r.BILLING_ID) === String(b.dataset.payBilling));
          if (!inv) return;
          const today = new Date().toISOString().slice(0,10);
          openFormModal("payments", null, {
            studentRows: students, billingRows: studentInvoices,
            defaults: { BILLING_ID: inv.BILLING_ID||"", ID_SISWA: inv.ID_SISWA||student.ID_SISWA||"", PAYMENT_DATE: today, AMOUNT: inv.AMOUNT||0, PAYMENT_METHOD: "CASH", NOTES: "Pembayaran untuk tagihan " + (inv.DESCRIPTION||inv.BILLING_ID) }
          });
        }));
      }

      function findStudents(q) {
        const k = String(q||"").trim().toUpperCase();
        if (!k) return [];
        const exactId = students.find(r => String(r.ID_SISWA||"").trim().toUpperCase() === k);
        if (exactId) return [exactId];
        const exactName = students.filter(r => String(r.NAMA||"").trim().toUpperCase() === k);
        if (exactName.length === 1) return exactName;
        return students.filter(r => String(r.ID_SISWA||"").trim().toUpperCase().includes(k) || String(r.NAMA||"").trim().toUpperCase().includes(k));
      }

      function renderStudentPicker(cands) {
        resultRoot.innerHTML = `<section class="card"><div class="section-head"><h2>Pilih Siswa (${formatNumber(cands.length)} hasil)</h2></div>
          <div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Nama</th><th>WA</th><th></th></tr></thead>
          <tbody>${cands.map(r => `<tr><td>${esc(r.ID_SISWA||"")}</td><td>${esc(r.NAMA||"")}</td><td>${esc(r.NO_WA||"-")}</td><td><button type="button" class="btn btn-small btn-primary" data-pick-student="${esc(r.ID_SISWA||"")}">Pilih</button></td></tr>`).join("")}</tbody></table></div></section>`;
        qsa("[data-pick-student]", resultRoot).forEach(b => b.addEventListener("click", () => {
          const st = cands.find(r => String(r.ID_SISWA) === String(b.dataset.pickStudent));
          if (!st) return;
          idInput.value = st.ID_SISWA;
          const url = new URL(window.location.href); url.searchParams.set("studentId", st.ID_SISWA); window.history.replaceState({}, "", url);
          renderStudentInvoices(st);
        }));
      }

      searchForm.addEventListener("submit", e => {
        e.preventDefault();
        const v = idInput.value.trim(); if (!v) return;
        const m = findStudents(v);
        if (!m.length) { resultRoot.innerHTML = `<div class="card billing-empty-state"><strong>Tidak ditemukan.</strong><span>Tidak ada yang cocok dengan "${esc(v)}".</span></div>`; return; }
        if (m.length === 1) {
          const st = m[0]; idInput.value = st.ID_SISWA;
          const url = new URL(window.location.href); url.searchParams.set("studentId", st.ID_SISWA); window.history.replaceState({}, "", url);
          renderStudentInvoices(st); return;
        }
        renderStudentPicker(m);
      });

      addButton.addEventListener("click", () => openFormModal("billing", null, { studentRows: students, defaults: { ID_SISWA: selectedStudent?.ID_SISWA || "" } }));

      if (initialId) {
        const k = initialId.trim().toUpperCase();
        const st = students.find(r => String(r.ID_SISWA||"").trim().toUpperCase() === k) || students.find(r => String(r.NAMA||"").trim().toUpperCase() === k);
        renderStudentInvoices(st || null);
      } else {
        resultRoot.innerHTML = `<div class="card billing-empty-state"><strong>Cari tagihan berdasarkan ID atau nama.</strong></div>`;
      }
    } catch (e) { renderError(el, e); }
  }

  async function renderFinance(el) {
    try {
      const r = await API.finance();
      if (r?.success === false) throw new Error(r.message);
      const rows = Array.isArray(r?.data) ? r.data : [];
      const selectedMonth = new URLSearchParams(window.location.search).get("financeMonth") || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
      const monthRows = rows.filter(row => String(row.DATE||"").slice(0,7) === selectedMonth);
      const amt = v => { const n = Number(String(v||0).replace(/[^\d.-]/g,"")); return Number.isFinite(n)?n:0; };
      const inc = monthRows.filter(row => String(row.TYPE||"").trim().toUpperCase() === "PEMASUKAN");
      const exp = monthRows.filter(row => String(row.TYPE||"").trim().toUpperCase() === "PENGELUARAN");
      const totalInc = inc.reduce((s,r) => s + amt(r.AMOUNT), 0);
      const totalExp = exp.reduce((s,r) => s + amt(r.AMOUNT), 0);
      const net = totalInc - totalExp;

      el.innerHTML = `
        ${pageHeader("Mutasi Keuangan", "Catat pemasukan dan pengeluaran harian.", "Tambah Mutasi", "btn-add-finance")}
        <section class="report-toolbar finance-toolbar"><label for="finance-month">Periode</label><input type="month" id="finance-month" value="${esc(selectedMonth)}"></section>
        <div class="cards finance-summary">
          <div class="card"><div class="muted">Pemasukan</div><div class="metric finance-income">${formatRupiah(totalInc)}</div><div class="tiny">${formatNumber(inc.length)} transaksi</div></div>
          <div class="card"><div class="muted">Pengeluaran</div><div class="metric finance-expense">${formatRupiah(totalExp)}</div><div class="tiny">${formatNumber(exp.length)} transaksi</div></div>
          <div class="card"><div class="muted">Selisih</div><div class="metric ${net<0?"report-negative":"report-positive"}">${formatRupiah(net)}</div><div class="tiny">Bersih</div></div>
        </div>
        <section class="section card"><div class="section-head"><h2>Transaksi ${esc(selectedMonth)}</h2></div>
          ${renderTable(monthRows, [
            { key: "DATE", label: "Tanggal", render: v => esc(String(v||"").slice(0,10)) },
            { key: "TYPE", label: "Jenis", render: v => esc(v||"") },
            { key: "CATEGORY", label: "Kategori", render: v => esc(v||"") },
            { key: "DESCRIPTION", label: "Keterangan", render: v => esc(v||"") },
            { key: "AMOUNT", label: "Nominal", render: v => formatRupiah(v) },
            { key: "PAYMENT_METHOD", label: "Metode", render: v => esc(v||"") },
            { key: "REFERENCE_NO", label: "Referensi", render: v => esc(v||"") }
          ], { emptyText: "Belum ada transaksi.", actions: row => `<button type="button" class="btn btn-small" data-edit-finance="${esc(row.TRANSACTION_ID||"")}">Edit</button>` })}
        </section>`;

      qs("#finance-month",el)?.addEventListener("change", e => {
        const url = new URL(window.location.href); url.searchParams.set("financeMonth", e.target.value); window.history.replaceState({}, "", url);
        renderFinance(el);
      });
      qs("#btn-add-finance",el)?.addEventListener("click", () => openFormModal("finance"));
      qsa("[data-edit-finance]",el).forEach(b => b.addEventListener("click", () => {
        const row = rows.find(r => String(r.TRANSACTION_ID) === String(b.dataset.editFinance));
        if (row) openFormModal("finance", row);
      }));
    } catch (e) { renderError(el, e); }
  }

  async function renderSalary(el) {
    if (!isAdminUser()) { el.innerHTML = `<div class="card"><h2>Akses Ditolak</h2></div>`; return; }
    try {
      const [sR, seR] = await Promise.all([API.salary(), API.sensei()]);
      const senseiRows = Array.isArray(seR?.data) ? seR.data.filter(r => String(r.ID_SENSEI||"").trim()) : [];
      const rows = (Array.isArray(sR?.data) ? sR.data : []).map(row => ({ ...row, SENSEI_NAME: senseiRows.find(s => String(s.ID_SENSEI) === String(row.ID_SENSEI))?.NAMA || "Sensei tidak ditemukan" }));

      el.innerHTML = `
        ${pageHeader("Payroll Sensei", "Gaji otomatis dari absensi sensei.", "Tambah Payroll", "btn-add-salary")}
        <div class="section"><div class="card"><strong>Rumus payroll</strong><p class="muted">Menit mengajar (dikurangi istirahat) / 45 = JP, dikali tarif.</p></div></div>
        <div class="card">${renderTable(rows, [
          { key: "SALARY_ID", label: "ID" },
          { key: "ID_SENSEI", label: "ID Sensei" },
          { key: "SENSEI_NAME", label: "Nama Sensei" },
          { key: "PERIOD", label: "Periode", render: v => { const s = String(v||""); const m = s.match(/^(\d{4})-(\d{2})/); return m ? m[1]+"-"+m[2] : esc(s); } },
          { key: "MEETING_COUNT", label: "Pertemuan" },
          { key: "HOUR_COUNT", label: "JP" },
          { key: "BASE_AMOUNT", label: "Gaji Pokok", render: v => formatRupiah(v) },
          { key: "BONUS", label: "Bonus", render: v => formatRupiah(v) },
          { key: "TRANSPORT", label: "Transport", render: v => formatRupiah(v) },
          { key: "DEDUCTION", label: "Potongan", render: v => formatRupiah(v) },
          { key: "NET_SALARY", label: "Gaji Bersih", render: v => formatRupiah(v) },
          { key: "PAYMENT_STATUS", label: "Status" }
        ], { actions: row => `
          <button type="button" class="btn btn-small" data-edit-salary="${esc(row.SALARY_ID)}">Edit</button>
          <button type="button" class="btn btn-small btn-light" data-pdf-salary="${esc(row.SALARY_ID)}">Slip PDF</button>
          <button type="button" class="btn btn-small btn-light" data-email-salary="${esc(row.SALARY_ID)}">Email</button>
          <button type="button" class="btn btn-small btn-danger" data-delete-salary="${esc(row.SALARY_ID)}">Hapus</button>
        ` })}</div>`;

      qs("#btn-add-salary")?.addEventListener("click", () => openFormModal("salary", null, { senseiRows }));
      qsa("[data-edit-salary]").forEach(b => b.addEventListener("click", () => {
        const row = rows.find(r => String(r.SALARY_ID) === String(b.dataset.editSalary));
        if (row) openFormModal("salary", row, { senseiRows });
      }));
      qsa("[data-pdf-salary]").forEach(b => b.addEventListener("click", async () => {
        const row = rows.find(r => String(r.SALARY_ID) === String(b.dataset.pdfSalary));
        if (!row) return; b.disabled = true;
        try {
          const sensei = senseiRows.find(s => String(s.ID_SENSEI) === String(row.ID_SENSEI)) || {};
          const { pdf, fileName } = await window.ArimaPdf.buildSalarySlip(row, sensei);
          pdf.save(fileName);
        } catch (e) { showToast(e.message || "PDF gagal.", "error"); } finally { b.disabled = false; }
      }));
      qsa("[data-email-salary]").forEach(b => b.addEventListener("click", async () => {
        const row = rows.find(r => String(r.SALARY_ID) === String(b.dataset.emailSalary));
        if (!row) return; b.disabled = true; b.textContent = "Mengirim...";
        try {
          const sensei = senseiRows.find(s => String(s.ID_SENSEI) === String(row.ID_SENSEI)) || {};
          const { pdf } = await window.ArimaPdf.buildSalarySlip(row, sensei);
          const pdfBase64 = window.ArimaPdf.pdfToBase64(pdf);
          const res = await API.salaryEmail({ SALARY_ID: row.SALARY_ID, pdfBase64 });
          if (res?.success === false) throw new Error(res.message);
          showToast(res?.message || "Terkirim.");
        } catch (e) { showToast(e.message || "Email gagal.", "error"); }
        finally { b.disabled = false; b.textContent = "Email"; }
      }));
      qsa("[data-delete-salary]").forEach(b => b.addEventListener("click", async () => {
        const row = rows.find(r => String(r.SALARY_ID) === String(b.dataset.deleteSalary));
        if (!row) return;
        if (!confirm(`Hapus payroll ${row.SALARY_ID}?`)) return;
        b.disabled = true;
        try {
          const res = await API.deleteRecord("salary", { SALARY_ID: row.SALARY_ID, __ROW_NUMBER: row.__ROW_NUMBER });
          if (res?.success === false) throw new Error(res.message);
          showToast(res?.message || "Dihapus.");
          await renderSalary(el);
        } catch (e) { b.disabled = false; showToast(e.message || "Gagal.", "error"); }
      }));
    } catch (e) { renderError(el, e); }
  }

  async function renderReports(el) {
    if (!isAdminUser()) { el.innerHTML = `<div class="card"><h2>Akses Ditolak</h2></div>`; return; }
    try {
      const [bR, pR, sR, seR, stR] = await Promise.all([API.billing(), API.payments(), API.salary(), API.sensei(), API.students()]);
      const billings = Array.isArray(bR?.data) ? bR.data : [];
      const payments = Array.isArray(pR?.data) ? pR.data : [];
      const salaries = Array.isArray(sR?.data) ? sR.data : [];
      const senseiRows = Array.isArray(seR?.data) ? seR.data : [];
      const students = Array.isArray(stR?.data) ? stR.data : [];
      const selectedMonth = new URLSearchParams(window.location.search).get("reportMonth") || new Date().toISOString().slice(0,7);

      const monthOf = v => {
        if (v instanceof Date && !isNaN(v.getTime())) return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,"0")}`;
        const t = String(v||"").trim();
        const iso = t.match(/^(\d{4})-(\d{2})/); if (iso) return `${iso[1]}-${iso[2]}`;
        const loc = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/); if (loc) return `${loc[3]}-${String(loc[2]).padStart(2,"0")}`;
        return "";
      };
      const amt = v => { const n = Number(String(v||0).replace(/[^\d.-]/g,"")); return Number.isFinite(n)?n:0; };
      const sum = (rs, f) => rs.reduce((t,r) => t + amt(r[f]), 0);

      const mB = billings.filter(r => monthOf(r.DUE_DATE) === selectedMonth);
      const mP = payments.filter(r => monthOf(r.PAYMENT_DATE) === selectedMonth);
      const mS = salaries.filter(r => monthOf(r.PERIOD) === selectedMonth);
      const paidS = mS.filter(r => ["DIBAYAR","LUNAS","PAID"].includes(String(r.PAYMENT_STATUS||"").trim().toUpperCase()));
      const pendS = mS.filter(r => !["DIBAYAR","LUNAS","PAID"].includes(String(r.PAYMENT_STATUS||"").trim().toUpperCase()));
      const amtBilled = sum(mB, "AMOUNT");
      const amtColl = sum(mP, "AMOUNT");
      const amtOut = mB.reduce((t,b) => {
        const paid = payments.filter(p => String(p.BILLING_ID||"") === String(b.BILLING_ID||"")).filter(p => !monthOf(p.PAYMENT_DATE) || monthOf(p.PAYMENT_DATE) <= selectedMonth).reduce((a,p) => a + amt(p.AMOUNT), 0);
        return t + Math.max(0, amt(b.AMOUNT) - paid);
      }, 0);
      const payPaid = sum(paidS, "NET_SALARY");
      const payPend = sum(pendS, "NET_SALARY");
      const netCF = amtColl - payPaid;
      const senseiName = id => senseiRows.find(r => String(r.ID_SENSEI) === String(id))?.NAMA || "Sensei tidak ditemukan";
      const studentName = id => students.find(r => String(r.ID_SISWA) === String(id))?.NAMA || "-";

      el.innerHTML = `
        ${pageHeader("Laporan Keuangan", "Rekap tagihan, penerimaan, piutang, dan payroll.")}
        <div class="report-toolbar">
          <label for="report-month">Periode</label>
          <input type="month" id="report-month" value="${esc(selectedMonth)}">
          <button type="button" class="btn btn-light" id="export-finance-csv">↓ CSV</button>
        </div>
        <div class="cards report-metrics">
          <div class="card"><div class="muted">Tagihan</div><div class="metric">${formatRupiah(amtBilled)}</div><div class="tiny">${formatNumber(mB.length)} tagihan</div></div>
          <div class="card"><div class="muted">Masuk</div><div class="metric">${formatRupiah(amtColl)}</div><div class="tiny">${formatNumber(mP.length)} transaksi</div></div>
          <div class="card"><div class="muted">Piutang</div><div class="metric">${formatRupiah(amtOut)}</div><div class="tiny">Bulan ini</div></div>
          <div class="card"><div class="muted">Payroll dibayar</div><div class="metric">${formatRupiah(payPaid)}</div><div class="tiny">${formatNumber(paidS.length)} lunas</div></div>
        </div>
        <div class="section report-cashflow"><div class="card report-cashflow-row">
          <div><span class="muted">Payroll belum dibayar</span><strong>${formatRupiah(payPend)}</strong></div>
          <div><span class="muted">Arus kas bersih</span><strong class="${netCF<0?"report-negative":"report-positive"}">${formatRupiah(netCF)}</strong></div>
        </div></div>
        <section class="section report-ledger"><div class="section-head"><h2>Tagihan jatuh tempo</h2></div>
          <div class="card">${renderTable(mB, [
            { key: "BILLING_ID", label: "ID", render: v => esc(v||"") },
            { key: "ID_SISWA", label: "ID Siswa", render: v => esc(v||"") },
            { key: "NAMA", label: "Nama", render: (v,r) => esc(studentName(r.ID_SISWA)) },
            { key: "DESCRIPTION", label: "Deskripsi", render: v => esc(v||"") },
            { key: "DUE_DATE", label: "Jatuh Tempo", render: v => esc(String(v||"").slice(0,10)) },
            { key: "STATUS", label: "Status", render: v => esc(v||"") },
            { key: "AMOUNT", label: "Nominal", render: v => formatRupiah(v) }
          ], { emptyText: "Tidak ada tagihan." })}</div>
        </section>
        <section class="section report-ledger"><div class="section-head"><h2>Pembayaran diterima</h2></div>
          <div class="card">${renderTable(mP, [
            { key: "PAYMENT_DATE", label: "Tanggal", render: v => esc(String(v||"").slice(0,10)) },
            { key: "PAYMENT_ID", label: "ID", render: v => esc(v||"") },
            { key: "ID_SISWA", label: "ID Siswa", render: v => esc(v||"") },
            { key: "NAMA", label: "Nama", render: (v,r) => esc(studentName(r.ID_SISWA)) },
            { key: "BILLING_ID", label: "ID Tagihan", render: v => esc(v||"") },
            { key: "PAYMENT_METHOD", label: "Metode", render: v => esc(v||"") },
            { key: "AMOUNT", label: "Nominal", render: v => formatRupiah(v) }
          ], { emptyText: "Tidak ada pembayaran." })}</div>
        </section>
        <section class="section report-ledger"><div class="section-head"><h2>Payroll sensei</h2></div>
          <div class="card">${renderTable(mS, [
            { key: "ID_SENSEI", label: "ID", render: v => esc(v||"") },
            { key: "NAMA", label: "Nama", render: (v,r) => esc(senseiName(r.ID_SENSEI)) },
            { key: "HOUR_COUNT", label: "JP", render: v => formatNumber(v) },
            { key: "NET_SALARY", label: "Gaji Bersih", render: v => formatRupiah(v) },
            { key: "PAYMENT_STATUS", label: "Status", render: v => esc(v||"") },
            { key: "PAYMENT_DATE", label: "Tgl Bayar", render: v => esc(String(v||"").slice(0,10)) }
          ], { emptyText: "Belum ada payroll." })}</div>
        </section>`;

      qs("#report-month",el)?.addEventListener("change", e => {
        const url = new URL(window.location.href); url.searchParams.set("reportMonth", e.target.value); window.history.replaceState({}, "", url);
        renderReports(el);
      });
      qs("#export-finance-csv",el)?.addEventListener("click", () => {
        const records = [
          ["Jenis","Tanggal/Periode","ID","Pihak","Keterangan","Status","Nominal"],
          ...mB.map(r => ["TAGIHAN", r.DUE_DATE, r.BILLING_ID, studentName(r.ID_SISWA), r.DESCRIPTION, r.STATUS, r.AMOUNT]),
          ...mP.map(r => ["PEMBAYARAN", r.PAYMENT_DATE, r.PAYMENT_ID, studentName(r.ID_SISWA), r.PAYMENT_METHOD, "DITERIMA", r.AMOUNT]),
          ...mS.map(r => ["PAYROLL", r.PERIOD, r.SALARY_ID, senseiName(r.ID_SENSEI), r.ID_SENSEI, r.PAYMENT_STATUS, r.NET_SALARY])
        ];
        const csv = "\uFEFF" + records.map(row => row.map(v => `"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `laporan-keuangan-${selectedMonth}.csv`;
        document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
      });
    } catch (e) { renderError(el, e); }
  }

  async function renderSettings(el) {
    if (!isAdminUser()) {
      el.innerHTML = `${pageHeader("Pengaturan","Informasi sistem.")}
        <div class="card setting-info">
          <div class="setting-row"><div><strong>Nama Aplikasi</strong><div class="muted">ARIMA MANAGEMENT SYSTEM</div></div></div>
          <div class="setting-row"><div><strong>Perusahaan</strong><div class="muted">LPKS Arima Persada</div></div></div>
          <div class="setting-row"><div><strong>User</strong><div class="muted">${esc(user?.name || user?.NAME || "-")}</div></div></div>
        </div>`;
      return;
    }
    try {
      const [uR, stR, seR] = await Promise.allSettled([API.users(), API.students(), API.sensei()]);
      const errOf = (r, l) => r.status === "rejected" ? (r.reason?.message || `Data ${l} gagal.`) : (r.value?.success === false ? r.value.message : "");
      const usersResp = uR.status === "fulfilled" ? uR.value : null;
      const usersErr = errOf(uR, "akun");
      const dirErrors = [errOf(stR,"siswa"), errOf(seR,"sensei")].filter(Boolean);
      const students = stR.status === "fulfilled" && stR.value?.data ? stR.value.data : [];
      const sensei = seR.status === "fulfilled" && seR.value?.data ? seR.value.data : [];
      const users = usersResp?.data || [];
      const directories = { students, sensei };

      el.innerHTML = `
        ${pageHeader("Pengaturan","Informasi sistem dan akun pengguna.")}
        <div class="card setting-info">
          <div class="setting-row"><div><strong>Nama Aplikasi</strong><div class="muted">ARIMA MANAGEMENT SYSTEM</div></div></div>
          <div class="setting-row"><div><strong>Perusahaan</strong><div class="muted">LPKS Arima Persada</div></div></div>
          <div class="setting-row"><div><strong>Admin</strong><div class="muted">${esc(user?.name || user?.NAME || "-")}</div></div></div>
        </div>
        <section class="section account-management">
          <div class="section-head">
            <div><h2>Akun Pengguna</h2><p class="muted">ID login: 2 huruf awal nama + 4 angka terakhir WA.</p></div>
            <div class="toolbar">
              <button type="button" class="btn btn-light" id="btn-generate-user-ids">Generate USER ID</button>
              <button type="button" class="btn btn-primary" id="btn-add-account">+ Tambah Akun</button>
            </div>
          </div>
          <div class="card">
            ${usersErr ? `<div class="alert error">${esc(usersErr)}</div>` : ""}
            ${dirErrors.map(m => `<div class="alert error">${esc(m)}</div>`).join("")}
            ${renderTable(users, [
              { key: "USER_ID", label: "ID Akun", render: v => esc(v||"") },
              { key: "MASTER_ID", label: "ID Master", render: v => esc(v||"-") },
              { key: "NAMA", label: "Nama", render: v => esc(v||"") },
              { key: "ROLE", label: "Role", render: v => esc(v||"") }
            ], { emptyText: "Belum ada akun.", actions: a => `
              <button type="button" class="btn btn-small" data-reset-account="${esc(a.USER_ID)}">Reset Password</button>
              ${String(a.USER_ID).toUpperCase() === String(user?.id||user?.ID||"").toUpperCase() ? "" : `<button type="button" class="btn btn-small btn-danger" data-delete-account="${esc(a.USER_ID)}">Hapus</button>`}
            ` })}
          </div>
        </section>`;

      qs("#btn-add-account",el)?.addEventListener("click", () => openAccountModal("create", null, directories));
      qs("#btn-generate-user-ids",el)?.addEventListener("click", async e => {
        if (!confirm("Generate USER ID untuk akun siswa/sensei? ID login akan berubah.")) return;
        const b = e.currentTarget; b.disabled = true; b.textContent = "Memproses...";
        try { const r = await API.generateUserIds(); if (r?.success === false) throw new Error(r.message); showToast(r?.message || "OK"); await renderSettings(el); }
        catch (e) { b.disabled = false; b.textContent = "Generate USER ID"; showToast(e.message || "Gagal.", "error"); }
      });
      qsa("[data-reset-account]",el).forEach(b => b.addEventListener("click", () => {
        const a = users.find(x => String(x.USER_ID) === String(b.dataset.resetAccount));
        if (a) openAccountModal("reset", a, directories);
      }));
      qsa("[data-delete-account]",el).forEach(b => b.addEventListener("click", async () => {
        const id = b.dataset.deleteAccount;
        if (!confirm(`Hapus akun ${id}?`)) return;
        b.disabled = true;
        try { const r = await API.userDelete({ userId: id }); if (r?.success === false) throw new Error(r.message); showToast(r?.message || "Dihapus."); await renderSettings(el); }
        catch (e) { b.disabled = false; showToast(e.message || "Gagal.", "error"); }
      }));
    } catch (e) { renderError(el, e); }
  }

  function openAccountModal(mode, account, directories) {
    if (!isAdminUser()) { showToast("Hanya admin.", "error"); return; }
    document.getElementById("arima-account-modal")?.remove();
    const isReset = mode === "reset";
    const modal = document.createElement("div");
    modal.id = "arima-account-modal";
    modal.className = "modal-overlay form-modal account-form-modal";
    modal.innerHTML = `
      <div class="modal form-modal-shell" role="dialog" aria-modal="true">
        <div class="form-modal-header">
          <div class="form-modal-heading">
            <span class="form-modal-kicker">PENGATURAN AKUN</span>
            <h2>${isReset ? "Reset Password" : "Tambah Akun"}</h2>
            <p>${isReset ? "Password baru untuk akun ini." : "ID akun dari 2 huruf awal nama + 4 angka terakhir WA."}</p>
          </div>
          <button type="button" class="modal-close" id="account-modal-close">×</button>
        </div>
        <form id="account-form" class="form-grid form-modal-fields">
          ${isReset ? `
            <div class="form-group form-group-wide"><label>ID Akun</label><input type="text" value="${esc(account?.USER_ID||"")}" disabled><input type="hidden" name="userId" value="${esc(account?.USER_ID||"")}"></div>
          ` : `
            <div class="form-group form-group-wide"><label for="account-role">Jenis Akun</label><select id="account-role" name="role" required><option value="SISWA">Siswa</option><option value="SENSEI">Sensei</option><option value="ADMIN">Admin</option></select></div>
            <div class="form-group form-group-wide" id="account-linked-id-group"><label for="account-linked-id">Pilih ID Master</label><select id="account-linked-id" name="linkedId" required></select><span class="tiny">Format 2 huruf awal nama + 4 angka terakhir WA.</span></div>
            <div class="form-group" id="account-admin-id-group"><label for="account-admin-id">ID Admin</label><input type="text" id="account-admin-id" name="adminId" placeholder="ADMIN002"></div>
            <div class="form-group" id="account-admin-name-group"><label for="account-admin-name">Nama Admin</label><input type="text" id="account-admin-name" name="adminName" placeholder="Nama lengkap"></div>
            <div class="account-person-preview hidden" id="account-person-preview"></div>
          `}
          <div class="form-group form-group-wide"><label for="account-password">${isReset ? "Password Baru" : "Password Awal"}</label><input type="password" id="account-password" name="password" minlength="8" autocomplete="new-password" required><span class="tiny">Minimal 8 karakter. Disimpan sebagai hash.</span></div>
          <div class="modal-footer form-modal-footer">
            <button type="button" class="btn btn-light" id="account-modal-cancel">Batal</button>
            <button type="submit" class="btn btn-primary" id="account-modal-submit">${isReset ? "Simpan Password Baru" : "Buat Akun"}</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    qs("#account-modal-close", modal).addEventListener("click", close);
    qs("#account-modal-cancel", modal).addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });

    if (!isReset) {
      const roleSelect = qs("#account-role", modal);
      const linkedGroup = qs("#account-linked-id-group", modal);
      const linkedSelect = qs("#account-linked-id", modal);
      const adminIdGroup = qs("#account-admin-id-group", modal);
      const adminNameGroup = qs("#account-admin-name-group", modal);
      const adminId = qs("#account-admin-id", modal);
      const adminName = qs("#account-admin-name", modal);
      const preview = qs("#account-person-preview", modal);
      const genId = p => {
        const n = String(p?.NAMA||"").trim().match(/[A-Za-z]+/);
        const ph = String(p?.NO_WA||"").replace(/\D/g,"");
        if (!n || n[0].length < 2 || ph.length < 4) return "";
        return n[0].slice(0,2).toUpperCase() + ph.slice(-4);
      };
      const updateLinkedPreview = () => {
        const role = roleSelect.value;
        const people = role === "SISWA" ? directories.students : directories.sensei;
        const idKey = role === "SISWA" ? "ID_SISWA" : "ID_SENSEI";
        const person = people.find(x => String(x[idKey]) === String(linkedSelect.value));
        if (!person) { preview.innerHTML = "Pilih ID."; return; }
        preview.innerHTML = `<strong>${esc(person.NAMA||"-")}</strong><span>ID Master: ${esc(linkedSelect.value)}</span><span>ID Login: <strong>${esc(genId(person) || "Lengkapi nama & WA")}</strong></span>`;
      };
      const populateLinkedIds = () => {
        const role = roleSelect.value;
        const people = role === "SISWA" ? directories.students : directories.sensei;
        const idKey = role === "SISWA" ? "ID_SISWA" : "ID_SENSEI";
        const idt = people.filter(p => String(p[idKey]||"").trim());
        linkedSelect.innerHTML = idt.length ? `<option value="">Pilih ID...</option>${idt.map(p => `<option value="${esc(p[idKey])}">${esc(p[idKey])} · ${esc(p.NAMA||"-")}</option>`).join("")}` : `<option value="">${role === "SISWA" ? "Belum ada ID siswa" : "Belum ada ID sensei"}</option>`;
        preview.classList.toggle("hidden", role === "ADMIN");
        preview.innerHTML = idt.length ? "Pilih ID." : "Tidak ada ID.";
        updateLinkedPreview();
      };
      const updateRoleFields = () => {
        const isAdmin = roleSelect.value === "ADMIN";
        linkedGroup.classList.toggle("hidden", isAdmin);
        adminIdGroup.classList.toggle("hidden", !isAdmin);
        adminNameGroup.classList.toggle("hidden", !isAdmin);
        linkedSelect.required = !isAdmin;
        adminId.required = isAdmin;
        adminName.required = isAdmin;
        if (!isAdmin) populateLinkedIds();
      };
      roleSelect.addEventListener("change", updateRoleFields);
      linkedSelect.addEventListener("change", updateLinkedPreview);
      updateRoleFields();
    }

    qs("#account-form", modal).addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.currentTarget;
      const submit = qs("#account-modal-submit", modal);
      const v = new FormData(form);
      const payload = { password: v.get("password") };
      if (isReset) payload.userId = v.get("userId");
      else {
        payload.role = v.get("role");
        if (payload.role === "ADMIN") payload.userId = v.get("adminId");
        else payload.linkedId = v.get("linkedId");
        payload.name = payload.role === "ADMIN" ? v.get("adminName") : "";
      }
      submit.disabled = true;
      submit.textContent = isReset ? "Mereset..." : "Membuat...";
      try {
        const r = isReset ? await API.userReset(payload) : await API.userCreate(payload);
        if (r?.success === false) throw new Error(r.message);
        showToast(r?.message || "OK");
        close();
        await renderSettings(document.getElementById("page-content") || getAppRoot());
      } catch (e) {
        submit.disabled = false;
        submit.textContent = isReset ? "Simpan Password Baru" : "Buat Akun";
        showToast(e.message || "Gagal.", "error");
      }
    });
  }

  function openFormModal(type, existing = null, options = {}) {
    const config = FORM_CONFIG[type];
    if (!config) { showToast("Form belum tersedia.", "error"); return; }
    if (type === "salary" && !isAdminUser()) { showToast("Hanya admin.", "error"); return; }
    document.getElementById("arima-form-modal")?.remove();

    const isEdit = !!existing;
    const formFields = type === "sensei" && !isAdminUser()
      ? config.fields.filter(f => f.key !== "TARIF_PER_JAM")
      : config.fields;

    const fields = formFields.map(field => {
      const now = new Date();
      const curMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
      const curDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
      const defVal = type === "salary" && field.key === "PERIOD" ? curMonth
        : type === "finance" && field.key === "DATE" ? curDate
        : type === "salary" && field.key === "PAYMENT_STATUS" ? "PENDING" : "";
      const rawValue = existing?.[field.key] ?? options.defaults?.[field.key] ?? defVal;
      const value = field.type === "date" ? String(rawValue||"").slice(0,10)
        : field.type === "month" ? String(rawValue||"").slice(0,7) : rawValue;

      if (type === "salary" && field.key === "ID_SENSEI") {
        const rows = Array.isArray(options.senseiRows) ? options.senseiRows : [];
        return `<div class="form-group form-group-wide payroll-sensei-field">
          <label for="payroll-sensei-id">Sensei</label>
          <select id="payroll-sensei-id" name="ID_SENSEI" required>
            <option value="">Pilih ID Sensei...</option>
            ${rows.map(r => `<option value="${esc(r.ID_SENSEI)}" ${String(value)===String(r.ID_SENSEI)?"selected":""}>${esc(r.NAMA||"-")} · ${esc(r.ID_SENSEI)}</option>`).join("")}
          </select>
          <div class="payroll-sensei-preview muted" id="payroll-sensei-preview">Pilih sensei.</div>
        </div>`;
      }
      if (type === "billing" && field.key === "ID_SISWA") {
        const rows = Array.isArray(options.studentRows) ? options.studentRows : [];
        const known = rows.map(r => String(r.ID_SISWA||"").trim()).filter(Boolean);
        const legacy = value && !known.includes(String(value)) ? `<option value="${esc(value)}" selected>${esc(value)} · Siswa tidak ditemukan</option>` : "";
        return `<div class="form-group"><label for="billing-student-select">ID Siswa <span>*</span></label>
          <select id="billing-student-select" name="ID_SISWA" required>
            <option value="">Pilih siswa...</option>
            ${rows.filter(r => String(r.ID_SISWA||"").trim()).map(r => `<option value="${esc(r.ID_SISWA)}" ${String(value)===String(r.ID_SISWA)?"selected":""}>${esc(r.NAMA||"-")} · ${esc(r.ID_SISWA)}</option>`).join("")}
            ${legacy}
          </select></div>`;
      }
      if (type === "payments" && field.key === "ID_SISWA") {
        const rows = Array.isArray(options.studentRows) ? options.studentRows : [];
        const known = rows.map(r => String(r.ID_SISWA||"").trim()).filter(Boolean);
        const legacy = value && !known.includes(String(value)) ? `<option value="${esc(value)}" selected>${esc(value)}</option>` : "";
        return `<div class="form-group"><label for="payment-student-select">ID Siswa <span>*</span></label>
          <select id="payment-student-select" name="ID_SISWA" required>
            <option value="">Pilih siswa...</option>
            ${rows.filter(r => String(r.ID_SISWA||"").trim()).map(r => `<option value="${esc(r.ID_SISWA)}" ${String(value)===String(r.ID_SISWA)?"selected":""}>${esc(r.NAMA||"-")} · ${esc(r.ID_SISWA)}</option>`).join("")}
            ${legacy}
          </select></div>`;
      }
      if (type === "payments" && field.key === "BILLING_ID") {
        const rows = Array.isArray(options.billingRows) ? options.billingRows : [];
        const known = rows.map(r => String(r.BILLING_ID||"").trim()).filter(Boolean);
        const legacy = value && !known.includes(String(value)) ? `<option value="${esc(value)}" selected>${esc(value)}</option>` : "";
        return `<div class="form-group"><label for="payment-billing-select">ID Tagihan <span>*</span></label>
          <select id="payment-billing-select" name="BILLING_ID" required>
            <option value="">Pilih tagihan...</option>
            ${rows.filter(r => String(r.BILLING_ID||"").trim()).map(r => `<option value="${esc(r.BILLING_ID)}" data-student-id="${esc(r.ID_SISWA||"")}" data-amount="${esc(r.AMOUNT||0)}" ${String(value)===String(r.BILLING_ID)?"selected":""}>${esc(r.BILLING_ID)} · ${esc(r.DESCRIPTION||"")} · ${formatRupiah(r.AMOUNT||0)}</option>`).join("")}
            ${legacy}
          </select></div>`;
      }
      if (field.type === "file") {
        const fid = `file-${type}-${field.key}`;
        return `<div class="form-group">
          <label>${esc(field.label)}</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="file" id="${esc(fid)}" style="display:none;" />
            <button type="button" class="btn btn-light" onclick="document.getElementById('${esc(fid)}').click()">Pilih File</button>
            <input type="hidden" name="${esc(field.key)}" id="${esc(fid)}-url" value="${esc(value)}" />
            <span id="${esc(fid)}-name" style="font-size:12px;color:#666;">${value ? "File terpilih" : "Belum ada file"}</span>
          </div>
          <div id="${esc(fid)}-preview" style="margin-top:6px;font-size:12px;">${value ? `<a href="${esc(value)}" target="_blank" rel="noopener">Lihat File</a>` : ""}</div>
        </div>`;
      }
      if (field.type === "combo") {
        const lid = `combo-${type}-${field.key}`;
        return `<div class="form-group">
          <label>${esc(field.label)} ${field.required?"<span>*</span>":""}</label>
          <input type="text" name="${esc(field.key)}" value="${esc(value)}" placeholder="${esc(field.placeholder||"Pilih atau ketik...")}" list="${esc(lid)}" ${field.required?"required":""} autocomplete="off" />
          <datalist id="${esc(lid)}">${(field.options||[]).map(o => `<option value="${esc(o)}"></option>`).join("")}</datalist>
        </div>`;
      }
      if (field.type === "select") {
        return `<div class="form-group">
          <label>${esc(field.label)} ${field.required?"<span>*</span>":""}</label>
          <select name="${esc(field.key)}" ${field.required?"required":""}>
            <option value="">Pilih...</option>
            ${(field.options||[]).map(o => `<option value="${esc(o)}" ${String(value)===String(o)?"selected":""}>${esc(o)}</option>`).join("")}
          </select>
        </div>`;
      }
      if (field.type === "textarea") {
        return `<div class="form-group">
          <label>${esc(field.label)} ${field.required?"<span>*</span>":""}</label>
          <textarea name="${esc(field.key)}" placeholder="${esc(field.placeholder||"")}" ${field.required?"required":""}>${esc(value)}</textarea>
        </div>`;
      }
      return `<div class="form-group">
        <label>${esc(field.label)} ${field.required?"<span>*</span>":""}</label>
        <input type="${esc(field.type||"text")}" name="${esc(field.key)}" value="${esc(value)}" placeholder="${esc(field.placeholder||"")}" ${field.required?"required":""} />
      </div>`;
    }).join("");

    const modal = document.createElement("div");
    modal.id = "arima-form-modal";
    modal.className = `modal-overlay form-modal ${type}-form-modal`;
    modal.innerHTML = `
      <div class="modal form-modal-shell" role="dialog" aria-modal="true">
        <div class="form-modal-header">
          <div class="form-modal-heading">
            <span class="form-modal-kicker">ARIMA MANAGEMENT SYSTEM</span>
            <h2>${esc(isEdit ? config.editTitle : config.title)}</h2>
            <p>${esc(config.description || "Lengkapi data.")}</p>
          </div>
          <button type="button" class="modal-close" id="modal-close">×</button>
        </div>
        <form id="arima-form" class="form-grid form-modal-fields">
          ${fields}
          <div class="modal-footer form-modal-footer">
            <button type="button" class="btn" id="modal-cancel">Batal</button>
            <button type="submit" class="btn btn-primary" id="modal-submit">${isEdit ? "Simpan Perubahan" : "Simpan"}</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    qs("#modal-close", modal)?.addEventListener("click", close);
    qs("#modal-cancel", modal)?.addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });

    const form = qs("#arima-form", modal);

    modal.querySelectorAll('input[type="file"]').forEach(fileInput => {
      fileInput.addEventListener("change", async e => {
        const file = e.target.files[0]; if (!file) return;
        const key = fileInput.id.replace(`file-${type}-`, "");
        const preview = modal.querySelector(`#${fileInput.id}-preview`);
        const nameSpan = modal.querySelector(`#${fileInput.id}-name`);
        const hiddenUrl = modal.querySelector(`#${fileInput.id}-url`);
        preview.innerHTML = `<span style="color:#666;">Mengunggah...</span>`;
        try {
          const base64 = await new Promise(resolve => { const reader = new FileReader(); reader.onload = ev => resolve(ev.target.result.split(",")[1]); reader.readAsDataURL(file); });
          const res = await API.fileUpload({ fileName: file.name, mimeType: file.type, base64: base64 });
          if (res && res.success) {
            hiddenUrl.value = res.data.url;
            nameSpan.textContent = file.name;
            preview.innerHTML = `<a href="${res.data.url}" target="_blank" rel="noopener">Lihat File Terunggah</a>`;
            showToast("File berhasil diunggah");
          } else {
            throw new Error(res?.message || "Gagal upload");
          }
        } catch (err) {
          preview.innerHTML = `<span style="color:#b4232c;">${esc(err.message || "Gagal unggah.")}</span>`;
        }
      });
    });

    if (type === "salary") {
      const senseiSelect = qs("#payroll-sensei-id", modal);
      const periodInput = form?.elements.PERIOD;
      const bonusInput = form?.elements.BONUS;
      const deductionInput = form?.elements.DEDUCTION;
      const preview = qs("#payroll-sensei-preview", modal);
      let reqId = 0;
      const refreshPayrollPreview = async () => {
        const rid = ++reqId;
        const sel = (options.senseiRows || []).find(r => String(r.ID_SENSEI) === String(senseiSelect?.value || ""));
        if (!sel) { preview.innerHTML = "Pilih sensei."; return; }
        const profile = `<div class="payroll-profile-line"><strong>${esc(sel.NAMA||"-")}</strong><span>${esc(sel.ID_SENSEI)}</span></div><div class="payroll-rate-line">Tarif: ${formatRupiah(sel.TARIF_PER_JAM||0)} / JP</div>`;
        if (!periodInput?.value) { preview.innerHTML = profile + `<div class="muted">Pilih periode.</div>`; return; }
        preview.innerHTML = profile + `<div class="muted">Menghitung...</div>`;
        try {
          const r = await API.salaryPreview({ ID_SENSEI: senseiSelect.value, PERIOD: periodInput.value, BONUS: bonusInput?.value||"0", DEDUCTION: deductionInput?.value||"0" });
          if (rid !== reqId) return;
          if (!r?.success) { preview.innerHTML = profile + `<div class="payroll-preview-warning">${esc(r?.message || "Gagal.")}</div>`; return; }
          const s = r.data || {};
          preview.innerHTML = profile + `<div class="payroll-preview-stats"><span>${formatNumber(s.MEETING_COUNT)} pertemuan</span><span>${formatNumber(s.HOUR_COUNT)} JP</span><strong>${formatRupiah(s.NET_SALARY)}</strong></div>`;
        } catch (e) { if (rid === reqId) preview.innerHTML = profile + `<div class="payroll-preview-warning">${esc(e.message || "Gagal.")}</div>`; }
      };
      senseiSelect?.addEventListener("change", refreshPayrollPreview);
      periodInput?.addEventListener("change", refreshPayrollPreview);
      bonusInput?.addEventListener("input", refreshPayrollPreview);
      deductionInput?.addEventListener("input", refreshPayrollPreview);
      refreshPayrollPreview();
    }

    if (type === "payments") {
      const studentSelect = qs("#payment-student-select", modal);
      const billingSelect = qs("#payment-billing-select", modal);
      const amountInput = form?.elements.AMOUNT;
      if (billingSelect) {
        const allOpts = Array.from(billingSelect.querySelectorAll("option")).filter(o => o.value).map(o => ({ value: o.value, studentId: String(o.dataset.studentId||"").trim(), html: o.outerHTML }));
        const rebuildBillingOptions = () => {
          const sid = String(studentSelect?.value||"").trim();
          const filtered = sid ? allOpts.filter(o => o.studentId === sid) : allOpts;
          const cur = billingSelect.value;
          billingSelect.innerHTML = `<option value="">Pilih tagihan...</option>` + filtered.map(o => o.html).join("");
          if (Array.from(billingSelect.options).some(o => o.value === cur)) billingSelect.value = cur;
        };
        const fillFromBilling = () => {
          const opt = billingSelect.options[billingSelect.selectedIndex];
          if (!opt || !opt.value) return;
          if (studentSelect && opt.dataset.studentId) studentSelect.value = opt.dataset.studentId;
          if (amountInput && opt.dataset.amount) amountInput.value = opt.dataset.amount;
        };
        studentSelect?.addEventListener("change", rebuildBillingOptions);
        billingSelect?.addEventListener("change", fillFromBilling);
        if (studentSelect?.value) rebuildBillingOptions();
      }
    }

    form?.addEventListener("submit", async e => {
      e.preventDefault();
      const submit = qs("#modal-submit", modal);
      if (submit) { submit.disabled = true; submit.textContent = "Menyimpan..."; }
      try {
        const fd = new FormData(form);
        const payload = {};
        formFields.forEach(f => { payload[f.key] = fd.get(f.key) || ""; });
        if (existing?.__ROW_NUMBER) payload.__ROW_NUMBER = existing.__ROW_NUMBER;
        const response = isEdit ? await API.update(type, payload) : await API.create(type, payload);
        if (response && response.success === false) throw new Error(response.message || "Gagal.");
        showToast(isEdit ? "Diperbarui." : "Ditambahkan.");
        close();
        if (type === "billing") {
          const url = new URL(window.location.href);
          if (payload.ID_SISWA) url.searchParams.set("studentId", payload.ID_SISWA);
          window.history.replaceState({}, "", url);
        }
        if (type === "payments") {
          const url = new URL(window.location.href);
          if (payload.ID_SISWA) url.searchParams.set("studentId", payload.ID_SISWA);
          window.history.replaceState({}, "", url);
          await load("billing");
          return;
        }
        await load(type);
      } catch (err) {
        showToast(err.message || "Gagal.", "error");
        if (submit) { submit.disabled = false; submit.textContent = isEdit ? "Simpan Perubahan" : "Simpan"; }
      }
    });
  }

  async function init() {
    if (!requireAuth()) return;
    renderLayout();
    await load("dashboard");
  }

  return {
    init, load, logout,
    renderDashboard, renderStudents, renderSensei, renderAttendance,
    renderBilling, renderFinance, renderSalary, renderReports, renderSettings
  };
})();
