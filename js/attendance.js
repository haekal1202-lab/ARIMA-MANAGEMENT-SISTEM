(() => {
  "use strict";

  const root = document.getElementById("attendance-root");
  const SESSION_KEY = "arima_attendance_user";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function localDate() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function localTime() {
    const date = new Date();
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (_) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function renderLogin(message = "") {
    root.innerHTML = `
      <div class="attendance-shell attendance-login-shell">
        <header class="attendance-brand">
          <img src="assets/logo.webp" alt="Logo LPKS Arima Persada">
          <div><strong>ARIMA</strong><span>ABSENSI LPKS</span></div>
        </header>
        <section class="attendance-panel attendance-login-panel">
          <span class="attendance-kicker">SISWA &amp; SENSEI</span>
          <h1>Masuk Absensi</h1>
          <p class="attendance-muted">Gunakan ID dan password akun Anda.</p>
          <form id="attendance-login-form" class="attendance-form">
            <label for="attendance-login-id">ID Pengguna</label>
            <input id="attendance-login-id" name="userId" autocomplete="username" required>
            <label for="attendance-login-password">Password</label>
            <input id="attendance-login-password" name="password" type="password" autocomplete="current-password" required>
            ${message ? `<div class="attendance-alert" role="alert">${escapeHtml(message)}</div>` : ""}
            <button class="btn btn-primary attendance-submit" type="submit">Masuk</button>
          </form>
          <a class="attendance-back-link" href="login.html">Kembali ke ARIMA Management System</a>
        </section>
      </div>
    `;

    document.getElementById("attendance-login-form").addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = form.querySelector("button[type=submit]");
      const formData = new FormData(form);
      submit.disabled = true;
      submit.textContent = "Memeriksa...";
      try {
        const result = await window.API.login(formData.get("userId"), formData.get("password"));
        if (!result?.success || !result.user) throw new Error(result?.message || "Login gagal.");
        const role = String(result.user.role || result.user.ROLE || "").toUpperCase();
        if (role !== "SISWA" && role !== "SENSEI") {
          window.API.clearToken();
          throw new Error("Aplikasi absensi ini khusus akun siswa dan sensei.");
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        await loadProfile();
      } catch (error) {
        renderLogin(error.message || "Tidak dapat masuk.");
      }
    });
  }

  async function loadProfile() {
    try {
      const response = await window.API.attendanceProfile();
      if (!response?.success || !response.data) throw new Error(response?.message || "Profil absensi tidak tersedia.");
      renderAttendance(response.data);
    } catch (error) {
      window.API.clearToken();
      localStorage.removeItem(SESSION_KEY);
      renderLogin(error.message || "Sesi berakhir. Silakan masuk kembali.");
    }
  }

  function renderAttendance(profile) {
    const isSensei = profile.role === "SENSEI";
    const todayLog = profile.todayAttendance || {};
    const today = localDate();
    const saved = Boolean(todayLog.ATTENDANCE_ID);
    const currentStart = todayLog.JAM_MASUK || localTime();

    root.innerHTML = `
      <div class="attendance-shell">
        <header class="attendance-brand">
          <img src="assets/logo.webp" alt="Logo LPKS Arima Persada">
          <div><strong>ARIMA</strong><span>ABSENSI LPKS</span></div>
          <button type="button" class="btn btn-light attendance-logout" id="attendance-logout">Keluar</button>
        </header>

        <section class="attendance-panel attendance-welcome">
          <span class="attendance-kicker">${isSensei ? "SENSEI" : "SISWA"}</span>
          <h1>${escapeHtml(profile.name || "")}</h1>
          <div class="attendance-identity">
            <span>ID <strong>${escapeHtml(profile.id)}</strong></span>
            ${profile.phone ? `<span>WhatsApp <strong>${escapeHtml(profile.phone)}</strong></span>` : ""}
          </div>
        </section>

        <section class="attendance-panel">
          <div class="attendance-section-heading">
            <div><span class="attendance-kicker">${escapeHtml(today)}</span><h2>${saved ? "Perbarui Absensi Hari Ini" : "Catat Kehadiran"}</h2></div>
            ${saved ? `<span class="attendance-saved">Sudah tercatat</span>` : ""}
          </div>
          <form id="self-attendance-form" class="attendance-form attendance-record-form">
            <div class="attendance-form-row">
              <div>
                <label for="attendance-status">Status kehadiran</label>
                <select id="attendance-status" name="STATUS" required>
                  ${["HADIR", "IZIN", "SAKIT", "ALPA", "TERLAMBAT"].map(status => `<option value="${status}" ${String(todayLog.STATUS || "HADIR") === status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
              </div>
              <div>
                <label for="attendance-start">${isSensei ? "Jam mengajar mulai" : "Jam masuk"}</label>
                <input id="attendance-start" type="time" name="JAM_MASUK" value="${escapeHtml(currentStart)}">
              </div>
              <div>
                <label for="attendance-end">${isSensei ? "Jam mengajar selesai" : "Jam keluar"}</label>
                <input id="attendance-end" type="time" name="JAM_KELUAR" value="${escapeHtml(todayLog.JAM_KELUAR || "")}">
              </div>
            </div>
            ${isSensei ? `<p class="attendance-note">Durasi payroll menghitung 1 JP = 45 menit, di luar istirahat 10.00–10.15 dan 12.00–13.15.</p>` : ""}
            <label for="attendance-notes">Catatan (opsional)</label>
            <textarea id="attendance-notes" name="CATATAN" rows="3">${escapeHtml(todayLog.CATATAN || "")}</textarea>
            <div class="attendance-error hidden" id="attendance-error" role="alert"></div>
            <button class="btn btn-primary attendance-submit" id="attendance-submit" type="submit">${saved ? "Simpan Perubahan" : "Simpan Absensi"}</button>
          </form>
        </section>
        <p class="attendance-footer">Data absensi tersimpan di sistem LPKS Arima Persada.</p>
      </div>
    `;

    document.getElementById("attendance-logout").addEventListener("click", () => {
      window.API.clearToken();
      localStorage.removeItem(SESSION_KEY);
      renderLogin();
    });

    document.getElementById("self-attendance-form").addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = document.getElementById("attendance-submit");
      const errorBox = document.getElementById("attendance-error");
      const formData = new FormData(form);
      submit.disabled = true;
      submit.textContent = "Menyimpan...";
      errorBox.classList.add("hidden");
      try {
        const result = await window.API.selfAttendance({
          STATUS: formData.get("STATUS"),
          JAM_MASUK: formData.get("JAM_MASUK"),
          JAM_KELUAR: formData.get("JAM_KELUAR"),
          CATATAN: formData.get("CATATAN")
        });
        if (!result?.success) throw new Error(result?.message || "Absensi gagal disimpan.");
        await loadProfile();
      } catch (error) {
        errorBox.textContent = error.message || "Absensi gagal disimpan.";
        errorBox.classList.remove("hidden");
        submit.disabled = false;
        submit.textContent = saved ? "Simpan Perubahan" : "Simpan Absensi";
      }
    });
  }

  const existingUser = readSession();
  if (existingUser && window.API.getToken()) loadProfile();
  else renderLogin();
})();
