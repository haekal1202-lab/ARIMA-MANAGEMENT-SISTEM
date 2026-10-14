(() => {
  "use strict";

  const root = document.getElementById("attendance-root");
  const SESSION_KEY = "arima_attendance_user";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
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
          <div>
            <strong>LPKS Arima Persada</strong>
            <span>Sistem Absensi Siswa dan Sensei</span>
          </div>
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

  let justSaved = false;

  function formatDuration(minutes) {
    const total = Number(minutes);
    if (!Number.isFinite(total) || total <= 0) return "-";
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    return hours ? `${hours} jam${rest ? ` ${rest} menit` : ""}` : `${rest} menit`;
  }

  function renderSummary(log, isSensei, today, fresh) {
    const rows = [
      ["Tanggal", today],
      ["Status", log.STATUS || "-"],
      [isSensei ? "Mulai" : "Jam masuk", log.JAM_MASUK || "-"]
    ];

    if (isSensei) {
      const breaksList = Array.isArray(log.ISTIRAHAT) ? log.ISTIRAHAT : [];
      const breaksText = breaksList.length
        ? breaksList.map(b => `${b[0]} – ${b[1]}`).join(" • ")
        : "-";
      rows.push(["Istirahat", breaksText]);
    }

    rows.push([isSensei ? "Selesai" : "Jam keluar", log.JAM_KELUAR || "-"]);

    if (isSensei) {
      rows.push(["Durasi dibayar", formatDuration(log.DURASI_MENIT)]);
      rows.push(["Jumlah JP (45 menit)", log.JP === null || log.JP === undefined || log.JP === "" ? "-" : String(log.JP)]);
    }
    rows.push(["Catatan", log.CATATAN || "-"]);

    const incomplete = isSensei && (log.DURASI_MENIT === null || log.DURASI_MENIT === undefined || log.DURASI_MENIT === "");
    const fotoKelas = log.FOTO_KELAS_URL ? `<a href="${escapeHtml(log.FOTO_KELAS_URL)}" target="_blank" rel="noopener">Lihat foto</a>` : "Belum ada";
    const fotoAbsensi = log.FOTO_ABSENSI_URL ? `<a href="${escapeHtml(log.FOTO_ABSENSI_URL)}" target="_blank" rel="noopener">Lihat foto</a>` : "Belum ada";

    return `
      <section class="attendance-panel attendance-summary" id="attendance-summary">
        ${fresh ? `<div class="attendance-success" role="status">Absensi berhasil disimpan.</div>` : ""}
        <span class="attendance-kicker">RINCIAN ABSENSI</span>
        <h2>Absensi Hari Ini</h2>
        <dl class="attendance-summary-list">
          ${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        </dl>
        ${isSensei ? `
          <dl class="attendance-summary-list">
            <div><dt>Foto kelas</dt><dd>${fotoKelas}</dd></div>
            <div><dt>Foto absensi siswa</dt><dd>${fotoAbsensi}</dd></div>
          </dl>
        ` : ""}
        ${incomplete ? `<p class="attendance-note">Durasi belum dapat dihitung karena jam mulai atau selesai belum lengkap.</p>` : ""}
      </section>
    `;
  }

  function renderAttendance(profile) {
    const isSensei = profile.role === "SENSEI";
    const todayLog = profile.todayAttendance || {};
    const today = localDate();
    const saved = Boolean(todayLog.ATTENDANCE_ID);
    const currentStart = todayLog.JAM_MASUK || localTime();

    // Ambil istirahat existing
    let initialBreaks = [];
    if (Array.isArray(todayLog.ISTIRAHAT) && todayLog.ISTIRAHAT.length) {
      initialBreaks = todayLog.ISTIRAHAT.slice();
    } else if (todayLog.ISTIRAHAT_MULAI || todayLog.ISTIRAHAT_SELESAI) {
      if (todayLog.ISTIRAHAT_MULAI && todayLog.ISTIRAHAT_SELESAI) {
        initialBreaks = [[todayLog.ISTIRAHAT_MULAI, todayLog.ISTIRAHAT_SELESAI]];
      }
    }
    if (!initialBreaks.length) initialBreaks = [["", ""]];

    root.innerHTML = `
      <div class="attendance-shell">
        <header class="attendance-brand">
          <img src="assets/logo.webp" alt="Logo LPKS Arima Persada">
          <div>
            <strong>LPKS Arima Persada</strong>
            <span>Sistem Absensi Siswa dan Sensei</span>
          </div>
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

        ${saved ? renderSummary(todayLog, isSensei, today, justSaved) : ""}

        <section class="attendance-panel">
          <div class="attendance-section-heading">
            <div>
              <span class="attendance-kicker">${escapeHtml(today)}</span>
              <h2>${saved ? "Perbarui Absensi Hari Ini" : "Catat Kehadiran"}</h2>
            </div>
            ${saved ? `<span class="attendance-saved">Sudah tercatat</span>` : ""}
          </div>
          ${saved ? `<p class="attendance-note">Anda dapat memperbarui absensi berkali-kali hari ini. Cukup ubah data dan simpan lagi.</p>` : ""}
          <form id="self-attendance-form" class="attendance-form attendance-record-form">
            <div class="attendance-form-row">
              <div>
                <label for="attendance-status">Status kehadiran</label>
                <select id="attendance-status" name="STATUS" required>
                  ${["HADIR", "IZIN", "SAKIT", "ALPA", "TERLAMBAT"].map(status => `<option value="${status}" ${String(todayLog.STATUS || "HADIR") === status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
              </div>
              <div>
                <label for="attendance-start">${isSensei ? "Mulai" : "Jam masuk"}</label>
                <input id="attendance-start" type="time" name="JAM_MASUK" value="${escapeHtml(currentStart)}">
              </div>
              <div>
                <label for="attendance-end">${isSensei ? "Selesai" : "Jam keluar"}</label>
                <input id="attendance-end" type="time" name="JAM_KELUAR" value="${escapeHtml(todayLog.JAM_KELUAR || "")}">
              </div>
            </div>

            ${isSensei ? `
              <div class="attendance-breaks-block">
                <label>Istirahat</label>
                <p class="attendance-note">Tambahkan jam istirahat jika ada. Bisa lebih dari satu.</p>
                <div id="attendance-breaks-list"></div>
                <button type="button" class="btn btn-light btn-small" id="add-break-btn">+ Tambah Istirahat</button>
              </div>
            ` : ""}

            ${isSensei ? `
              <p class="attendance-note">Durasi payroll menghitung 1 JP = 45 menit, di luar waktu istirahat yang Anda isi.</p>
            ` : ""}

            ${isSensei ? `
              <div class="attendance-photo-row">
                <div>
                  <label>Foto kelas</label>
                  <input type="file" id="attendance-photo-class" accept="image/*" capture="environment">
                  <input type="hidden" name="FOTO_KELAS_URL" id="attendance-photo-class-url" value="${escapeHtml(todayLog.FOTO_KELAS_URL || "")}">
                  <div class="attendance-photo-preview" id="attendance-photo-class-preview">${todayLog.FOTO_KELAS_URL ? `<a href="${escapeHtml(todayLog.FOTO_KELAS_URL)}" target="_blank" rel="noopener">Lihat foto tersimpan</a>` : ""}</div>
                </div>
                <div>
                  <label>Foto absensi siswa</label>
                  <input type="file" id="attendance-photo-absensi" accept="image/*" capture="environment">
                  <input type="hidden" name="FOTO_ABSENSI_URL" id="attendance-photo-absensi-url" value="${escapeHtml(todayLog.FOTO_ABSENSI_URL || "")}">
                  <div class="attendance-photo-preview" id="attendance-photo-absensi-preview">${todayLog.FOTO_ABSENSI_URL ? `<a href="${escapeHtml(todayLog.FOTO_ABSENSI_URL)}" target="_blank" rel="noopener">Lihat foto tersimpan</a>` : ""}</div>
                </div>
              </div>
            ` : ""}

            <label for="attendance-notes">Catatan ${isSensei ? "(wajib)" : "(opsional)"}</label>
            <textarea id="attendance-notes" name="CATATAN" rows="3" ${isSensei ? "required" : ""}>${escapeHtml(todayLog.CATATAN || "")}</textarea>
            <div class="attendance-error hidden" id="attendance-error" role="alert"></div>
            <button class="btn btn-primary attendance-submit" id="attendance-submit" type="submit">${saved ? "Simpan Perubahan" : "Simpan Absensi"}</button>
          </form>
        </section>
        <p class="attendance-footer">Data absensi tersimpan di sistem LPKS Arima Persada.</p>
      </div>
    `;

    // === UI Breaks ===
    const breaksList = document.getElementById("attendance-breaks-list");
    function renderBreaks(breaks) {
      breaksList.innerHTML = breaks.map((b, idx) => `
        <div class="break-row" data-idx="${idx}">
          <input type="time" class="break-start" value="${escapeHtml(b[0] || "")}">
          <span class="break-sep">–</span>
          <input type="time" class="break-end" value="${escapeHtml(b[1] || "")}">
          <button type="button" class="remove-break-btn" data-idx="${idx}" title="Hapus istirahat ini">Hapus</button>
        </div>
      `).join("");

      breaksList.querySelectorAll(".remove-break-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const current = collectBreaks();
          current.splice(Number(btn.dataset.idx), 1);
          renderBreaks(current.length ? current : [["", ""]]);
        });
      });
    }

    function collectBreaks() {
      const rows = breaksList.querySelectorAll(".break-row");
      const result = [];
      rows.forEach(row => {
        const start = row.querySelector(".break-start").value;
        const end = row.querySelector(".break-end").value;
        if (start || end) result.push([start, end]);
      });
      return result;
    }

    if (isSensei) {
      renderBreaks(initialBreaks);
      document.getElementById("add-break-btn").addEventListener("click", () => {
        const current = collectBreaks();
        current.push(["", ""]);
        renderBreaks(current);
      });
    }

    // === Logout ===
    document.getElementById("attendance-logout").addEventListener("click", () => {
      window.API.clearToken();
      localStorage.removeItem(SESSION_KEY);
      renderLogin();
    });

    // === Kompresi gambar ===
    async function compressImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 1280;
            let w = img.width, h = img.height;
            if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
            else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
            resolve(dataUrl.split(",")[1]);
          };
          img.onerror = () => reject(new Error("Gagal membaca file gambar."));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Gagal membaca file."));
        reader.readAsDataURL(file);
      });
    }

    async function uploadPhoto(file, type, urlInputId, previewId) {
      const preview = document.getElementById(previewId);
      preview.innerHTML = `Mengunggah...`;
      try {
        const base64 = await compressImage(file);
        const res = await window.API.call("attendancePhotoUpload", {
          type: type,
          fileName: file.name || (type + ".jpg"),
          mimeType: "image/jpeg",
          base64: base64
        });
        if (!res?.success || !res.data?.url) throw new Error(res?.message || "Gagal mengunggah foto.");
        document.getElementById(urlInputId).value = res.data.url;
        preview.innerHTML = `<a href="${escapeHtml(res.data.url)}" target="_blank" rel="noopener">Lihat foto terunggah</a>`;
        return res.data.url;
      } catch (err) {
        preview.innerHTML = `<span style="color:#b4232c">${escapeHtml(err.message || "Gagal unggah.")}</span>`;
        throw err;
      }
    }

    document.getElementById("attendance-photo-class")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) uploadPhoto(file, "KELAS", "attendance-photo-class-url", "attendance-photo-class-preview").catch(() => {});
    });
    document.getElementById("attendance-photo-absensi")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) uploadPhoto(file, "ABSENSI", "attendance-photo-absensi-url", "attendance-photo-absensi-preview").catch(() => {});
    });

    // === Submit ===
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
        const payload = {
          STATUS: formData.get("STATUS"),
          JAM_MASUK: formData.get("JAM_MASUK"),
          JAM_KELUAR: formData.get("JAM_KELUAR"),
          CATATAN: formData.get("CATATAN")
        };
        if (isSensei) {
          const breaks = collectBreaks().filter(b => b[0] && b[1]);
          payload.ISTIRAHAT_JSON = JSON.stringify(breaks);
          payload.FOTO_KELAS_URL = formData.get("FOTO_KELAS_URL") || "";
          payload.FOTO_ABSENSI_URL = formData.get("FOTO_ABSENSI_URL") || "";
        }
        if (isSensei && !String(payload.CATATAN || "").trim()) {
          throw new Error("Sensei wajib mengisi catatan absensi (mis. materi yang diajarkan).");
        }
        
        const result = await window.API.selfAttendance(payload);
        if (!result?.success) throw new Error(result?.message || "Absensi gagal disimpan.");
        justSaved = true;
        await loadProfile();
        document.getElementById("attendance-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
        justSaved = false;
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
