window.App = (() => {
  "use strict";

  const menus = [
    ["dashboard", "Dashboard", "▦"],
    ["students", "Siswa", "♙"],
    ["sensei", "Sensei", "◎"],
    ["attendance", "Absensi", "✓"],
    ["billing", "Tagihan", "Rp"],
    ["finance", "Mutasi Keuangan", "↔"],
    ["salary", "Payroll Sensei", "¥"],
    ["reports", "Laporan", "▤"],
    ["settings", "Pengaturan", "⚙"]
  ];

  let user = null;

  /*
   * =========================================================
   * FORM CONFIGURATION
   * =========================================================
   */

  const FORM_CONFIG = {

    students: {
      title: "Tambah Siswa",
      editTitle: "Edit Siswa",
      description: "Lengkapi identitas, kontak keluarga, dan program belajar siswa.",
      idField: "ID_SISWA",

      fields: [
        {
          key: "ID_SISWA",
          label: "ID Siswa",
          type: "text",
          required: false,
          placeholder: "Kosongkan untuk ID otomatis"
        },

        {
          key: "NAMA",
          label: "Nama Siswa",
          type: "text",
          required: true,
          placeholder: "Nama lengkap siswa"
        },

        {
          key: "NIK",
          label: "NIK",
          type: "text",
          required: false,
          placeholder: "Nomor Induk Kependudukan"
        },

        {
          key: "NO_WA",
          label: "No. WhatsApp",
          type: "text",
          required: true,
          placeholder: "08xxxxxxxxxx"
        },

        {
          key: "NAMA_ORANG_TUA",
          label: "Nama Orang Tua / Wali",
          type: "text",
          required: true,
          placeholder: "Nama orang tua / wali"
        },

        {
          key: "NO_WA_ORANG_TUA",
          label: "No. WhatsApp Orang Tua / Wali",
          type: "text",
          required: false,
          placeholder: "08xxxxxxxxxx"
        },

        {
          key: "PROGRAM",
          label: "Program",
          type: "select",
          required: true,
          options: [
            "MAGANG",
            "SSW",
            "ENGINEERING",
            "ENGINEER"
          ]
        },

        {
          key: "ASRAMA",
          label: "Asrama",
          type: "select",
          required: true,
          options: [
            "YA",
            "TIDAK"
          ]
        },

        {
          key: "TANGGAL_MASUK",
          label: "Tanggal Masuk",
          type: "date",
          required: true
        },

        {
          key: "STATUS",
          label: "Status",
          type: "select",
          required: true,
          options: [
            "AKTIF",
            "NONAKTIF",
            "LULUS",
            "KELUAR"
          ]
        }
      ]
    },


    sensei: {

      title: "Tambah Sensei",

      editTitle: "Edit Sensei",

      description: "Simpan profil pengajar dan tarif per JP untuk perhitungan payroll.",

      idField: "ID_SENSEI",

      fields: [

        {
          key: "ID_SENSEI",
          label: "ID Sensei",
          type: "text",
          required: false,
          placeholder: "Kosongkan untuk ID otomatis"
        },

        {
          key: "NAMA",
          label: "Nama Sensei",
          type: "text",
          required: true,
          placeholder: "Nama lengkap sensei"
        },

        {
          key: "NO_WA",
          label: "No. WhatsApp",
          type: "text",
          required: false,
          placeholder: "08xxxxxxxxxx"
        },

        {
          key: "EMAIL",
          label: "Email",
          type: "email",
          required: false,
          placeholder: "email@example.com"
        },

        {
          key: "TARIF_PER_JAM",
          label: "Tarif per JP (45 menit)",
          type: "number",
          required: false,
          placeholder: "0"
        },

        {
          key: "STATUS",
          label: "Status",
          type: "select",
          required: true,
          options: [
            "AKTIF",
            "NONAKTIF"
          ]
        }

      ]

    },


    attendance: {

      title: "Catat Absensi",

      editTitle: "Edit Absensi",

      idField: "ATTENDANCE_ID",

      fields: [

        {
          key: "ATTENDANCE_ID",
          label: "ID Absensi",
          type: "text",
          required: false,
          placeholder: "Kosongkan untuk ID otomatis"
        },

        {
          key: "ACTOR_ID",
          label: "ID Siswa / Sensei",
          type: "text",
          required: true,
          placeholder: "ID aktor"
        },

        {
          key: "ACTOR_TYPE",
          label: "Tipe Aktor",
          type: "select",
          required: true,
          options: [
            "STUDENT",
            "SENSEI"
          ]
        },

        {
          key: "SESSION_ID",
          label: "Session ID",
          type: "text",
          required: false,
          placeholder: "Session ID"
        },

        {
          key: "CLASS_ID",
          label: "Class ID",
          type: "text",
          required: false,
          placeholder: "Class ID"
        },

        {
          key: "TANGGAL",
          label: "Tanggal",
          type: "date",
          required: true
        },

        {
          key: "JAM_MASUK",
          label: "Jam Masuk",
          type: "time",
          required: false
        },

        {
          key: "JAM_KELUAR",
          label: "Jam Keluar",
          type: "time",
          required: false
        },

        {
          key: "STATUS",
          label: "Status",
          type: "select",
          required: true,
          options: [
            "HADIR",
            "IZIN",
            "SAKIT",
            "ALPA",
            "TERLAMBAT"
          ]
        },

        {
          key: "CATATAN",
          label: "Catatan",
          type: "textarea",
          required: false
        }

      ]

    },


    billing: {

      title: "Tambah Tagihan",

      editTitle: "Edit Tagihan",

      idField: "BILLING_ID",

      fields: [
        {
          key: "ID_SISWA",
          label: "ID Siswa",
          type: "text",
          required: true
        },

        {
          key: "DESCRIPTION",
          label: "Deskripsi",
          type: "text",
          required: true,
          placeholder: "Contoh: Biaya belajar bulan Oktober"
        },

        {
          key: "CATEGORY",
          label: "Kategori",
          type: "select",
          required: true,
          options: [
            "BELAJAR",
            "ASRAMA",
            "JOB",
            "LAINNYA"
          ]
        },

        {
          key: "AMOUNT",
          label: "Jumlah",
          type: "number",
          required: true,
          placeholder: "0"
        },

        {
          key: "DUE_DATE",
          label: "Jatuh Tempo",
          type: "date",
          required: true
        },

        {
          key: "STATUS",
          label: "Status",
          type: "select",
          required: true,
          options: [
            "PENDING",
            "BELUM BAYAR",
            "BELUM LUNAS",
            "LUNAS",
            "TERTUNGGAK",
            "CICILAN"
          ]
        },

        {
          key: "NOTES",
          label: "Catatan",
          type: "textarea",
          required: false
        }

      ]

    },

    finance: {
      title: "Tambah Mutasi Keuangan",
      editTitle: "Edit Mutasi Keuangan",
      description: "Catat pemasukan atau pengeluaran harian.",
      idField: "TRANSACTION_ID",
      fields: [
        {
          key: "DATE",
          label: "Tanggal",
          type: "date",
          required: true
        },
        {
          key: "TYPE",
          label: "Jenis Mutasi",
          type: "select",
          required: true,
          options: ["PEMASUKAN", "PENGELUARAN"]
        },
        {
          key: "CATEGORY",
          label: "Kategori",
          type: "select",
          required: true,
          options: [
            "SPP",
            "Pendaftaran",
            "Seragam",
            "Donasi",
            "Gaji",
            "Operasional",
            "Utilitas",
            "Transportasi",
            "Konsumsi",
            "Perlengkapan",
            "Lainnya"
          ]
        },
        {
          key: "DESCRIPTION",
          label: "Keterangan",
          type: "text",
          required: true,
          placeholder: "Contoh: pembayaran SPP bulan Oktober"
        },
        {
          key: "AMOUNT",
          label: "Nominal",
          type: "number",
          required: true,
          placeholder: "0"
        },
        {
          key: "PAYMENT_METHOD",
          label: "Metode",
          type: "select",
          required: true,
          options: ["CASH", "TRANSFER", "QRIS", "LAINNYA"]
        },
        {
          key: "REFERENCE_NO",
          label: "No. Referensi",
          type: "text",
          required: false
        },
        {
          key: "NOTES",
          label: "Catatan",
          type: "textarea",
          required: false
        }
      ]
    },

    payments: {

      title: "Tambah Pembayaran",

      editTitle: "Edit Pembayaran",

      idField: "PAYMENT_ID",

      fields: [
        {
          key: "BILLING_ID",
          label: "ID Tagihan",
          type: "text",
          required: true
        },

        {
          key: "ID_SISWA",
          label: "ID Siswa",
          type: "text",
          required: true
        },

        {
          key: "PAYMENT_DATE",
          label: "Tanggal Pembayaran",
          type: "date",
          required: true
        },

        {
          key: "AMOUNT",
          label: "Jumlah Pembayaran",
          type: "number",
          required: true
        },

        {
          key: "PAYMENT_METHOD",
          label: "Metode Pembayaran",
          type: "select",
          required: true,
          options: [
            "CASH",
            "TRANSFER",
            "QRIS",
            "LAINNYA"
          ]
        },

        {
          key: "REFERENCE_NO",
          label: "No. Referensi",
          type: "text",
          required: false
        },

        {
          key: "NOTES",
          label: "Catatan",
          type: "textarea",
          required: false
        }

      ]

    },


    salary: {

      title: "Payroll Sensei",

      editTitle: "Edit Payroll",

      description: "Pilih sensei dan periode untuk melihat ringkasan gaji dari absensi.",

      idField: "SALARY_ID",

      fields: [
        {
          key: "ID_SENSEI",
          label: "ID Sensei",
          type: "text",
          required: true
        },

        {
          key: "PERIOD",
          label: "Periode",
          type: "month",
          required: true
        },

        {
          key: "BONUS",
          label: "Bonus",
          type: "number",
          required: false
        },

        {
          key: "DEDUCTION",
          label: "Potongan",
          type: "number",
          required: false
        },

        {
          key: "PAYMENT_DATE",
          label: "Tanggal Pembayaran",
          type: "date",
          required: false
        },

        {
          key: "PAYMENT_STATUS",
          label: "Status Pembayaran",
          type: "select",
          required: true,
          options: [
            "PENDING",
            "DIBAYAR",
            "LUNAS"
          ]
        },

        {
          key: "NOTES",
          label: "Catatan",
          type: "textarea",
          required: false
        }

      ]

    }

  };


  /*
   * =========================================================
   * UTILITIES
   * =========================================================
   */

  function esc(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function formatNumber(value) {

    const number = Number(value || 0);

    return new Intl.NumberFormat(
      "id-ID"
    ).format(
      Number.isFinite(number)
        ? number
        : 0
    );

  }


  function formatRupiah(value) {

    const number = Number(value || 0);

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }
    ).format(
      Number.isFinite(number)
        ? number
        : 0
    );

  }


  function renderError(
    el,
    error
  ) {

    console.error(
      "ARIMA APP ERROR:",
      error
    );

    el.innerHTML = `

      <div class="card">

        <h3>
          Terjadi kesalahan
        </h3>

        <p class="muted">
          ${esc(
            error?.message ||
            error ||
            "Terjadi kesalahan pada aplikasi."
          )}
        </p>

      </div>

    `;

  }


  function showToast(
    message,
    type = "success"
  ) {

    let toast =
      document.getElementById(
        "arima-toast"
      );

    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "arima-toast";

      toast.style.position =
        "fixed";

      toast.style.right =
        "24px";

      toast.style.bottom =
        "24px";

      toast.style.zIndex =
        "99999";

      toast.style.padding =
        "14px 18px";

      toast.style.borderRadius =
        "10px";

      toast.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.18)";

      toast.style.background =
        "#111827";

      toast.style.color =
        "#fff";

      toast.style.fontSize =
        "14px";

      document.body.appendChild(
        toast
      );

    }

    toast.textContent =
      message;

    toast.dataset.type =
      type;

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(() => {

        toast.remove();

      }, 3000);

  }


  function qs(
    selector,
    root = document
  ) {

    return root.querySelector(
      selector
    );

  }


  function qsa(
    selector,
    root = document
  ) {

    return Array.from(
      root.querySelectorAll(
        selector
      )
    );

  }


  function getAppRoot() {

    return (
      document.getElementById(
        "app"
      ) ||
      document.getElementById(
        "app-root"
      ) ||
      document.querySelector(
        "main"
      ) ||
      document.body
    );

  }


  function getContentRoot() {

    return (
      document.getElementById(
        "page-content"
      ) ||
      document.getElementById(
        "content"
      ) ||
      document.getElementById(
        "app-content"
      ) ||
      document.querySelector(
        ".page-content"
      ) ||
      getAppRoot()
    );

  }


  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  function getStoredUser() {

    try {

      // Prefer the shared Auth module.
      if (
        window.Auth &&
        typeof window.Auth.current === "function"
      ) {

        const current =
          window.Auth.current();

        if (current) {
          return current;
        }

      }

      // Fallback for compatibility with older builds.
      const keys = [
        "arima_session",
        "ARIMA_USER",
        "ARIMA_SESSION"
      ];

      for (const key of keys) {

        const raw =
          localStorage.getItem(key);

        if (!raw) {
          continue;
        }

        const parsed =
          JSON.parse(raw);

        if (parsed && typeof parsed === "object") {
          return parsed;
        }

      }

      return null;

    } catch (error) {

      console.warn(
        "Gagal membaca user/session:",
        error
      );

      return null;

    }

  }


  function requireAuth() {

    const currentUser =
      getStoredUser();

    if (!currentUser) {

      console.warn(
        "ARIMA: session tidak ditemukan. Mengarahkan ke login."
      );

      window.location.replace(
        "login.html"
      );

      return null;

    }

    user =
      currentUser;

    // Keep both session keys synchronized so an old cached
    // page cannot accidentally log the user out.
    try {

      const value =
        JSON.stringify(
          currentUser
        );

      localStorage.setItem(
        "arima_session",
        value
      );

      localStorage.setItem(
        "ARIMA_USER",
        value
      );

    } catch (error) {

      console.warn(
        "Gagal menyinkronkan session:",
        error
      );

    }

    return currentUser;

  }

  function isAdminUser() {
    return String(user?.role || user?.ROLE || "")
      .trim()
      .toUpperCase() === "ADMIN";
  }


  function logout() {

    try {

      if (
        window.Auth &&
        typeof window.Auth.logout === "function"
      ) {

        window.Auth.logout();
        return;

      }

      localStorage.removeItem(
        "arima_session"
      );

      localStorage.removeItem(
        "ARIMA_USER"
      );

      localStorage.removeItem(
        "ARIMA_SESSION"
      );

      localStorage.removeItem(
        "ARIMA_TOKEN"
      );

      sessionStorage.removeItem(
        "ARIMA_TOKEN"
      );

    } catch (error) {

      console.warn(
        "Logout error:",
        error
      );

    }

    window.location.replace(
      "login.html"
    );

  }


  /*
   * =========================================================
   * LAYOUT
   * =========================================================
   */

  function renderLayout() {

    const root =
      getAppRoot();

    if (!root) {
      return;
    }

    const adminMenus = ["attendance", "billing", "finance", "salary", "reports", "settings"];
    const visibleMenus = menus.filter(
      menu => !adminMenus.includes(menu[0]) || isAdminUser()
    );

    root.innerHTML = `

      <div class="arima-layout">

        <aside
          class="sidebar"
          id="arima-sidebar"
        >

          <div class="sidebar-brand">

            <div class="sidebar-logo">
              <img src="assets/logo.webp" alt="Logo LPKS Arima Persada">
            </div>

            <div class="brand-copy">
            <div class="brand-title">
              ARIMA
            </div>

            <div class="brand-subtitle">
              MANAGEMENT SYSTEM
            </div>
            </div>

          </div>


          <nav
            class="sidebar-nav"
            id="arima-menu"
          >

            ${visibleMenus.map(
              menu => `

                <button
                  type="button"
                  class="nav-item"
                  data-page="${esc(menu[0])}"
                >

                  <span class="nav-icon">
                    ${menu[2]}
                  </span>

                  <span>
                    ${esc(menu[1])}
                  </span>

                </button>

              `
            ).join("")}

          </nav>


          <div class="sidebar-footer">

            <a
              class="nav-item nav-link"
              href="attendance.html"
            >

              <span class="nav-icon">✓</span>
              <span>Absensi Siswa / Sensei</span>

            </a>

            <button
              type="button"
              id="btn-logout"
              class="nav-item logout-button"
            >

              <span class="nav-icon">
                ⇥
              </span>

              <span>
                Keluar
              </span>

            </button>

          </div>

        </aside>


        <section
          class="main-area"
        >

          <header
            class="topbar"
          >

            <div>

              <button
                type="button"
                id="btn-sidebar"
                class="icon-button"
                aria-label="Menu"
              >
                ☰
              </button>

            </div>


            <div
              class="topbar-user"
            >

              <span
                id="topbar-user-name"
              >
                ${esc(
                  user?.name ||
                  user?.NAME ||
                  ""
                )}
              </span>

            </div>

          </header>


          <main
            id="page-content"
            class="page-content"
          >

            <div class="card">
              Memuat aplikasi...
            </div>

          </main>

        </section>

      </div>

    `;


    const menu =
      qs(
        "#arima-menu"
      );

    if (menu) {

      menu.addEventListener(
        "click",
        event => {

          const button =
            event.target.closest(
              "[data-page]"
            );

          if (!button) {
            return;
          }

          const page =
            button.dataset.page;

          load(page);

        }
      );

    }


    const logoutButton =
      qs(
        "#btn-logout"
      );

    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        logout
      );

    }


    const sidebarButton =
      qs(
        "#btn-sidebar"
      );

    if (sidebarButton) {

      sidebarButton.addEventListener(
        "click",
        () => {

          const sidebar =
            qs(
              "#arima-sidebar"
            );

          if (sidebar) {

            sidebar.classList.toggle(
              "collapsed"
            );

          }

        }
      );

    }

  }


  function setActiveMenu(
    page
  ) {

    qsa(
      "[data-page]"
    ).forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.page === page
        );

      }
    );

  }


  /*
   * =========================================================
   * PAGE LOAD
   * =========================================================
   */

  async function load(
    page
  ) {

    const el =
      getContentRoot();

    if (!el) {
      return;
    }

    setActiveMenu(
      page
    );

    el.innerHTML = `

      <div class="card">

        <div class="muted">
          Memuat...
        </div>

      </div>

    `;


    try {

      switch (
        String(page || "")
          .toLowerCase()
      ) {

        case "dashboard":

          await renderDashboard(
            el
          );

          break;


        case "students":

          await renderStudents(
            el
          );

          break;


        case "sensei":

          await renderSensei(
            el
          );

          break;


        case "attendance":

          await renderAttendance(
            el
          );

          break;


        case "billing":

          await renderBilling(
            el
          );

          break;


        case "finance":

          await renderFinance(
            el
          );

          break;


        case "salary":

          await renderSalary(
            el
          );

          break;


        case "reports":

          await renderReports(
            el
          );

          break;


        case "settings":

          await renderSettings(
            el
          );

          break;


        default:

          await renderDashboard(
            el
          );

          break;

      }

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  async function renderDashboard(
    el
  ) {

    try {

      const response =
        await API.dashboard();

      const data =
        response?.data || {};


      el.innerHTML = `

        <div class="page-title">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Ringkasan operasional
              LPKS Arima Persada.
            </p>

          </div>

        </div>


        <div class="cards">

          <div class="card">

            <div class="muted">
              Siswa Aktif
            </div>

            <div class="metric">
              ${formatNumber(
                data.students
              )}
            </div>

          </div>


          <div class="card">

            <div class="muted">
              Sensei Aktif
            </div>

            <div class="metric">
              ${formatNumber(
                data.sensei
              )}
            </div>

          </div>


          <div class="card">

            <div class="muted">
              Kehadiran
            </div>

            <div class="metric">
              ${formatNumber(
                data.attendance
              )}%
            </div>

          </div>


          <div class="card">

            <div class="muted">
              Tagihan Pending
            </div>

            <div class="metric">
              ${formatNumber(
                data.pendingBilling
              )}
            </div>

          </div>

        </div>


        <div class="section">

          <div class="card">

            <strong>
              Selamat datang,
              ${esc(
                user?.name ||
                user?.NAME ||
                "User"
              )}
            </strong>

            <p class="muted">
              Gunakan menu di sebelah kiri
              untuk mengelola sistem.
            </p>

          </div>

        </div>

      `;

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }
  /*
   * =========================================================
   * GENERIC TABLE
   * =========================================================
   */

  function renderTable(
    rows,
    columns,
    options = {}
  ) {

    const data =
      Array.isArray(rows)
        ? rows
        : [];

    const emptyText =
      options.emptyText ||
      "Belum ada data.";

    if (!data.length) {

      return `

        <div class="card">

          <div class="muted">
            ${esc(emptyText)}
          </div>

        </div>

      `;

    }


    return `

      <div class="table-wrap">

        <table class="data-table">

          <thead>

            <tr>

              ${columns.map(
                column => `

                  <th>
                    ${esc(
                      column.label ||
                      column.key
                    )}
                  </th>

                `
              ).join("")}

              ${
                options.actions
                  ? "<th>Aksi</th>"
                  : ""
              }

            </tr>

          </thead>


          <tbody>

            ${data.map(
              (row, index) => `

                <tr>

                  ${columns.map(
                    column => {

                      let value =
                        row[
                          column.key
                        ];

                      if (
                        typeof column.render ===
                        "function"
                      ) {

                        value =
                          column.render(
                            value,
                            row,
                            index
                          );

                      }

                      return `

                        <td>
                          ${
                            value === null ||
                            value === undefined
                              ? ""
                              : value
                          }
                        </td>

                      `;

                    }
                  ).join("")}


                  ${
                    options.actions
                      ? `

                        <td>

                          <div
                            class="table-actions"
                          >

                            ${
                              options.actions(
                                row,
                                index
                              )
                            }

                          </div>

                        </td>

                      `
                      : ""
                  }

                </tr>

              `
            ).join("")}

          </tbody>

        </table>

      </div>

    `;

  }


  /*
   * =========================================================
   * PAGE HEADER
   * =========================================================
   */

  function pageHeader(
    title,
    description,
    buttonText = "",
    buttonId = ""
  ) {

    return `

      <div class="page-title">

        <div>

          <h1>
            ${esc(title)}
          </h1>

          ${
            description
              ? `

                <p>
                  ${esc(description)}
                </p>

              `
              : ""
          }

        </div>


        ${
          buttonText
            ? `

              <button
                type="button"
                class="btn btn-primary"
                id="${esc(buttonId)}"
              >

                + ${esc(buttonText)}

              </button>

            `
            : ""
        }

      </div>

    `;

  }


  /*
   * =========================================================
   * STUDENTS
   * =========================================================
   */

  async function renderStudents(
    el
  ) {

    try {

      const response =
        await API.students();

      const rows =
        response?.data || [];


      el.innerHTML = `

        ${pageHeader(
          "Data Siswa",
          "Kelola data siswa LPKS Arima Persada.",
          "Tambah Siswa",
          "btn-add-student"
        )}


        <div class="card">

          ${renderTable(
            rows,
            [
              {
                key: "ID_SISWA",
                label: "ID"
              },

              {
                key: "NAMA",
                label: "Nama"
              },

              {
                key: "NIK",
                label: "NIK"
              },

              {
                key: "NO_WA",
                label: "WhatsApp"
              },

              {
                key: "PROGRAM",
                label: "Program"
              },

              {
                key: "ASRAMA",
                label: "Asrama"
              },

              {
                key: "STATUS",
                label: "Status"
              }
            ],
            {
              actions: row => `

                <button
                  type="button"
                  class="btn btn-small"
                  data-edit-student="${esc(
                    row.ID_SISWA
                  )}"
                  data-row-number="${esc(row.__ROW_NUMBER || '')}"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="btn btn-small btn-danger"
                  data-delete-student="${esc(
                    row.ID_SISWA
                  )}"
                  data-row-number="${esc(row.__ROW_NUMBER || '')}"
                >
                  Hapus
                </button>

              `
            }
          )}

        </div>

      `;


      const addButton =
        qs(
          "#btn-add-student"
        );

      if (addButton) {

        addButton.addEventListener(
          "click",
          () => {

            openFormModal(
              "students"
            );

          }
        );

      }


      qsa(
        "[data-edit-student]"
      ).forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset
                  .editStudent;
              const rowNumber = button.dataset.rowNumber;

              const row =
                rows.find(
                  item => rowNumber &&
                    String(item.__ROW_NUMBER) === String(rowNumber)
                ) || rows.find(
                  item =>
                    String(
                      item.ID_SISWA
                    ) === String(id)
                );

              if (row) {

                openFormModal(
                  "students",
                  row
                );

              }

            }
          );

        }
      );


      qsa(
        "[data-delete-student]"
      ).forEach(
        button => {

          button.addEventListener(
            "click",
            async () => {

              const id =
                button.dataset
                  .deleteStudent;

              if (
                !confirm(
                  "Hapus data siswa ini?"
                )
              ) {
                return;
              }

              try {

                const response = await API.delete(
                  "students",
                  {
                    ID_SISWA: id,
                    __ROW_NUMBER: button.dataset.rowNumber
                  }
                );
                if (response?.success === false) {
                  throw new Error(response.message || "Gagal menghapus data siswa.");
                }

                showToast(
                  "Data siswa berhasil dihapus."
                );

                await renderStudents(
                  el
                );

              } catch (error) {

                showToast(
                  error.message ||
                  "Gagal menghapus data.",
                  "error"
                );

              }

            }
          );

        }
      );

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * SENSEI
   * =========================================================
   */

  async function renderSensei(
    el
  ) {

    try {

      const response =
        await API.sensei();

      const rows =
        response?.data || [];

      const columns = [
        { key: "ID_SENSEI", label: "ID" },
        { key: "NAMA", label: "Nama" },
        { key: "NO_WA", label: "WhatsApp" },
        { key: "EMAIL", label: "Email" },
        { key: "STATUS", label: "Status" }
      ];
      if (isAdminUser()) {
        columns.splice(4, 0, {
          key: "TARIF_PER_JAM",
          label: "Tarif / JP (45 menit)",
          render: value => formatRupiah(value)
        });
      }


      el.innerHTML = `

        ${pageHeader(
          "Data Sensei",
          "Kelola data pengajar LPKS Arima Persada.",
          "Tambah Sensei",
          "btn-add-sensei"
        )}


        <div class="card">

          ${renderTable(
            rows,
            columns,
            {
              actions: row => `

                <button
                  type="button"
                  class="btn btn-small"
                  data-edit-sensei="${esc(
                    row.ID_SENSEI
                  )}"
                  data-row-number="${esc(row.__ROW_NUMBER || '')}"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="btn btn-small btn-danger"
                  data-delete-sensei="${esc(
                    row.ID_SENSEI
                  )}"
                  data-row-number="${esc(row.__ROW_NUMBER || '')}"
                >
                  Hapus
                </button>

              `
            }
          )}

        </div>

      `;


      const addButton =
        qs(
          "#btn-add-sensei"
        );

      if (addButton) {

        addButton.addEventListener(
          "click",
          () => {

            openFormModal(
              "sensei"
            );

          }
        );

      }


      qsa(
        "[data-edit-sensei]"
      ).forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset
                  .editSensei;
              const rowNumber = button.dataset.rowNumber;

              const row =
                rows.find(
                  item => rowNumber &&
                    String(item.__ROW_NUMBER) === String(rowNumber)
                ) || rows.find(
                  item =>
                    String(
                      item.ID_SENSEI
                    ) === String(id)
                );

              if (row) {

                openFormModal(
                  "sensei",
                  row
                );

              }

            }
          );

        }
      );


      qsa(
        "[data-delete-sensei]"
      ).forEach(
        button => {

          button.addEventListener(
            "click",
            async () => {

              const id =
                button.dataset
                  .deleteSensei;

              if (
                !confirm(
                  "Hapus data sensei ini?"
                )
              ) {
                return;
              }

              try {

                const response = await API.delete(
                  "sensei",
                  {
                    ID_SENSEI: id,
                    __ROW_NUMBER: button.dataset.rowNumber
                  }
                );
                if (response?.success === false) {
                  throw new Error(response.message || "Gagal menghapus data sensei.");
                }

                showToast(
                  "Data sensei berhasil dihapus."
                );

                await renderSensei(
                  el
                );

              } catch (error) {

                showToast(
                  error.message ||
                  "Gagal menghapus data.",
                  "error"
                );

              }

            }
          );

        }
      );

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * ATTENDANCE
   * =========================================================
   */

  async function renderAttendance(
    el
  ) {

    try {

      const [attendanceResponse, studentsResponse, senseiResponse] =
        await Promise.all([
          API.attendance(),
          API.students(),
          API.sensei()
        ]);

      [attendanceResponse, studentsResponse, senseiResponse].forEach((response, index) => {
        if (response?.success === false) {
          const labels = ["Absensi", "siswa", "sensei"];
          throw new Error((response.message || `Data ${labels[index]} gagal dimuat.`));
        }
      });
      const rows = Array.isArray(attendanceResponse?.data)
        ? attendanceResponse.data
        : [];
      const students = Array.isArray(studentsResponse?.data)
        ? studentsResponse.data
        : [];
      const sensei = Array.isArray(senseiResponse?.data)
        ? senseiResponse.data
        : [];
      const studentsWithoutIds = students.filter(row => {
        const id = String(row.ID_SISWA || '').trim();
        return !id || /^SISWA\d+$/i.test(id);
      }).length;
      const senseiWithoutIds = sensei.filter(row => {
        const id = String(row.ID_SENSEI || '').trim();
        return !id || /^SENSEI\d+$/i.test(id);
      }).length;
      const now = new Date();
      const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');
      let editingRecord = null;

      const findActor = (type, id) => {
        const records = type === 'STUDENT' ? students : sensei;
        const key = type === 'STUDENT' ? 'ID_SISWA' : 'ID_SENSEI';
        return records.find(row => String(row[key] || '') === String(id || '')) || null;
      };

      const actorName = row => findActor(row.ACTOR_TYPE, row.ACTOR_ID)?.NAMA || 'ID tidak ditemukan';

      el.innerHTML = `
        ${pageHeader(
          "Absensi",
          "Pilih ID siswa atau sensei untuk mencatat kehadiran."
        )}

        ${(studentsWithoutIds || senseiWithoutIds) ? `
          <div class="alert error attendance-id-warning">
            <span>
              ${studentsWithoutIds ? `${formatNumber(studentsWithoutIds)} siswa` : ""}
              ${studentsWithoutIds && senseiWithoutIds ? " dan " : ""}
              ${senseiWithoutIds ? `${formatNumber(senseiWithoutIds)} sensei` : ""}
              belum memakai format ID baru. ID dibuat dari 3 huruf awal nama + 4 angka terakhir WhatsApp.
            </span>
            <div class="toolbar">
              ${studentsWithoutIds ? `<button type="button" class="btn btn-small" id="btn-assign-student-ids">Buat ID Siswa</button>` : ""}
              ${senseiWithoutIds ? `<button type="button" class="btn btn-small" id="btn-assign-sensei-ids">Buat ID Sensei</button>` : ""}
            </div>
          </div>
        ` : ""}

        <section class="card attendance-form-card">
          <div class="section-head">
            <h2 id="attendance-form-title">Catat Kehadiran</h2>
            <button type="button" class="btn btn-light hidden" id="attendance-cancel-edit">Batal Edit</button>
          </div>

          <form id="attendance-form" class="form-grid">
            <div class="form-group">
              <label for="attendance-actor-type">Jenis peserta</label>
              <select id="attendance-actor-type" name="ACTOR_TYPE" required>
                <option value="STUDENT">Siswa</option>
                <option value="SENSEI">Sensei</option>
              </select>
            </div>

            <div class="form-group">
              <label for="attendance-actor-id">ID / Nama</label>
              <select id="attendance-actor-id" name="ACTOR_ID" required></select>
            </div>

            <div class="attendance-person" id="attendance-person" aria-live="polite">
              <span class="muted">Pilih peserta untuk melihat datanya.</span>
            </div>

            <div class="form-group">
              <label for="attendance-date">Tanggal</label>
              <input type="date" id="attendance-date" name="TANGGAL" value="${today}" required>
            </div>

            <div class="form-group">
              <label for="attendance-status">Status</label>
              <select id="attendance-status" name="STATUS" required>
                ${["HADIR", "IZIN", "SAKIT", "ALPA", "TERLAMBAT"].map(status => `
                  <option value="${status}" ${status === "HADIR" ? "selected" : ""}>${status}</option>
                `).join("")}
              </select>
            </div>

            <div class="form-group">
              <label id="attendance-check-in-label" for="attendance-check-in">Jam Masuk</label>
              <input type="time" id="attendance-check-in" name="JAM_MASUK">
            </div>

            <div class="form-group">
              <label id="attendance-check-out-label" for="attendance-check-out">Jam Keluar</label>
              <input type="time" id="attendance-check-out" name="JAM_KELUAR">
            </div>

            <div class="form-group" id="attendance-session-group">
              <label for="attendance-session">ID Sesi (opsional)</label>
              <input type="text" id="attendance-session" name="SESSION_ID">
            </div>

            <div class="attendance-jp-note hidden" id="attendance-jp-note">Durasi mengajar dihitung dengan 1 JP = 45 menit.</div>

            <div class="form-group form-group-wide">
              <label for="attendance-notes">Catatan (opsional)</label>
              <textarea id="attendance-notes" name="CATATAN" rows="2"></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="attendance-submit">Simpan Absensi</button>
            </div>
          </form>
        </section>

        <section class="section attendance-history">
          <div class="section-head"><h2>Riwayat Absensi</h2></div>
          <div class="card">
            ${renderTable(
              rows,
              [
                { key: "TANGGAL", label: "Tanggal", render: value => esc(String(value || "").slice(0, 10)) },
                { key: "ACTOR_TYPE", label: "Jenis", render: value => value === "STUDENT" ? "Siswa" : "Sensei" },
                { key: "ACTOR_ID", label: "ID" },
                { key: "NAMA", label: "Nama", render: (value, row) => esc(actorName(row)) },
                { key: "JAM_MASUK", label: "Masuk" },
                { key: "JAM_KELUAR", label: "Keluar" },
                { key: "STATUS", label: "Status" }
              ],
              {
                emptyText: "Belum ada catatan absensi.",
                actions: row => `
                  <button type="button" class="btn btn-small" data-edit-attendance="${esc(row.ATTENDANCE_ID || "")}" data-row-number="${esc(row.__ROW_NUMBER || "")}">Edit</button>
                `
              }
            )}
          </div>
        </section>
      `;

      const form = qs("#attendance-form", el);
      const actorType = qs("#attendance-actor-type", el);
      const actorSelect = qs("#attendance-actor-id", el);
      const personCard = qs("#attendance-person", el);
      const submit = qs("#attendance-submit", el);
      const cancelEdit = qs("#attendance-cancel-edit", el);

      function populateActors(selectedId = "") {
        updateAttendanceTimeFields();
        const type = actorType.value;
        const records = type === "STUDENT" ? students : sensei;
        const key = type === "STUDENT" ? "ID_SISWA" : "ID_SENSEI";
        const identified = records.filter(row => String(row[key] || "").trim());
        actorSelect.innerHTML = identified.length
          ? `<option value="">Pilih ID peserta...</option>${identified.map(row => `
              <option value="${esc(row[key])}">${esc(row[key])} - ${esc(row.NAMA || "Tanpa nama")}</option>
            `).join("")}`
          : `<option value="">${type === "STUDENT" ? "Belum ada ID siswa" : "Belum ada data sensei"}</option>`;
        actorSelect.value = selectedId;
        updateActorDetails();
      }

      function updateActorDetails() {
        const actor = findActor(actorType.value, actorSelect.value);
        if (!actor) {
          personCard.innerHTML = `<span class="muted">${actorType.value === "STUDENT" && studentsWithoutIds ? "Buat ID siswa terlebih dahulu." : "Pilih peserta dari daftar."}</span>`;
          return;
        }

        const detail = actorType.value === "STUDENT"
          ? `WhatsApp: ${actor.NO_WA || "-"} · Program: ${actor.PROGRAM || "-"}`
          : `WhatsApp: ${actor.NO_WA || "-"} · Status: ${actor.STATUS || "-"}`;
        personCard.innerHTML = `
          <strong>${esc(actor.NAMA || "Tanpa nama")}</strong>
          <span>ID: ${esc(actorSelect.value)}</span>
          <span>${esc(detail)}</span>
        `;
      }

      function updateAttendanceTimeFields() {
        const senseiSelected = actorType.value === "SENSEI";
        const countsForPayroll = senseiSelected && ["HADIR", "TERLAMBAT"].includes(qs("#attendance-status", el).value);
        qs("#attendance-check-in-label", el).textContent = senseiSelected ? "Jam Mengajar Mulai" : "Jam Masuk";
        qs("#attendance-check-out-label", el).textContent = senseiSelected ? "Jam Mengajar Selesai" : "Jam Keluar";
        qs("#attendance-check-in", el).required = countsForPayroll;
        qs("#attendance-check-out", el).required = countsForPayroll;
        qs("#attendance-session-group", el).classList.toggle("hidden", senseiSelected);
        qs("#attendance-jp-note", el).classList.toggle("hidden", !senseiSelected);
        if (senseiSelected) qs("#attendance-session", el).value = "";
      }

      function resetAttendanceForm() {
        editingRecord = null;
        form.reset();
        qs("#attendance-date", el).value = today;
        qs("#attendance-status", el).value = "HADIR";
        qs("#attendance-form-title", el).textContent = "Catat Kehadiran";
        submit.textContent = "Simpan Absensi";
        cancelEdit.classList.add("hidden");
        populateActors();
      }

      actorType.addEventListener("change", () => populateActors());
      actorSelect.addEventListener("change", updateActorDetails);
      qs("#attendance-status", el).addEventListener("change", updateAttendanceTimeFields);
      cancelEdit.addEventListener("click", resetAttendanceForm);

      form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!actorSelect.value) {
          showToast("Pilih siswa atau sensei yang memiliki ID.", "error");
          return;
        }

        const payload = Object.fromEntries(new FormData(form).entries());
        payload.CLASS_ID = "";
        if (payload.ACTOR_TYPE === "SENSEI") payload.SESSION_ID = "";
        if (editingRecord) {
          payload.ATTENDANCE_ID = editingRecord.ATTENDANCE_ID || "";
          payload.__ROW_NUMBER = editingRecord.__ROW_NUMBER;
        }

        submit.disabled = true;
        submit.textContent = "Menyimpan...";
        try {
          const response = editingRecord
            ? await API.update("attendance", payload)
            : await API.create("attendance", payload);
          if (response?.success === false) throw new Error(response.message || "Gagal menyimpan absensi.");
          showToast(response?.message || "Absensi berhasil disimpan.");
          await renderAttendance(el);
        } catch (error) {
          submit.disabled = false;
          submit.textContent = editingRecord ? "Simpan Perubahan" : "Simpan Absensi";
          showToast(error.message || "Gagal menyimpan absensi.", "error");
        }
      });

      qsa("[data-edit-attendance]", el).forEach(button => {
        button.addEventListener("click", () => {
          const row = rows.find(item => String(item.__ROW_NUMBER) === String(button.dataset.rowNumber))
            || rows.find(item => String(item.ATTENDANCE_ID) === String(button.dataset.editAttendance));
          if (!row) return;

          editingRecord = row;
          actorType.value = row.ACTOR_TYPE === "SENSEI" ? "SENSEI" : "STUDENT";
          populateActors(row.ACTOR_ID);
          qs("#attendance-date", el).value = String(row.TANGGAL || "").slice(0, 10);
          qs("#attendance-status", el).value = row.STATUS || "HADIR";
          qs("#attendance-check-in", el).value = String(row.JAM_MASUK || "").includes("T") ? String(row.JAM_MASUK).slice(11, 16) : String(row.JAM_MASUK || "").slice(0, 5);
          qs("#attendance-check-out", el).value = String(row.JAM_KELUAR || "").includes("T") ? String(row.JAM_KELUAR).slice(11, 16) : String(row.JAM_KELUAR || "").slice(0, 5);
          qs("#attendance-session", el).value = row.SESSION_ID || "";
          qs("#attendance-notes", el).value = row.CATATAN || "";
          qs("#attendance-form-title", el).textContent = "Edit Absensi";
          submit.textContent = "Simpan Perubahan";
          cancelEdit.classList.remove("hidden");
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      qs("#btn-assign-student-ids", el)?.addEventListener("click", async buttonEvent => {
        if (!window.confirm(`Buat/perbarui ID untuk ${studentsWithoutIds} siswa? ID lama seperti SISWA001 akan diganti. Referensi absensi, tagihan, pembayaran, serta USER ID yang terkait juga akan disesuaikan.`)) return;
        const button = buttonEvent.currentTarget;
        button.disabled = true;
        button.textContent = "Membuat ID...";
        try {
          const result = await API.assignStudentIds();
          if (result?.success === false) throw new Error(result.message || "Gagal membuat ID siswa.");
          showToast(result?.message || "ID siswa berhasil dibuat.");
          await renderAttendance(el);
        } catch (error) {
          button.disabled = false;
          button.textContent = "Buat ID Siswa";
          showToast(error.message || "Gagal membuat ID siswa.", "error");
        }
      });

      qs("#btn-assign-sensei-ids", el)?.addEventListener("click", async buttonEvent => {
        if (!window.confirm(`Buat/perbarui ID untuk ${senseiWithoutIds} sensei? ID lama seperti SENSEI001 akan diganti. Referensi absensi, payroll, serta USER ID yang terkait juga akan disesuaikan.`)) return;
        const button = buttonEvent.currentTarget;
        button.disabled = true;
        button.textContent = "Membuat ID...";
        try {
          const result = await API.assignSenseiIds();
          if (result?.success === false) throw new Error(result.message || "Gagal membuat ID sensei.");
          showToast(result?.message || "ID sensei berhasil dibuat.");
          await renderAttendance(el);
        } catch (error) {
          button.disabled = false;
          button.textContent = "Buat ID Sensei";
          showToast(error.message || "Gagal membuat ID sensei.", "error");
        }
      });

      populateActors();

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * BILLING
   * =========================================================
   */

  async function renderBilling(
    el
  ) {

    if (!isAdminUser()) {
      el.innerHTML = `<div class="card"><h2>Akses Ditolak</h2><p class="muted">Tagihan siswa hanya dapat dibuka oleh admin.</p></div>`;
      return;
    }

    try {

      const [billingResponse, studentsResponse] = await Promise.all([
        API.billing(),
        API.students()
      ]);
      if (billingResponse?.success === false) throw new Error(billingResponse.message || "Data tagihan gagal dimuat.");
      if (studentsResponse?.success === false) throw new Error(studentsResponse.message || "Data siswa gagal dimuat.");
      const billings = Array.isArray(billingResponse?.data) ? billingResponse.data : [];
      const students = Array.isArray(studentsResponse?.data) ? studentsResponse.data : [];
      const params = new URLSearchParams(window.location.search);
      const initialId = params.get("studentId") || "";

      el.innerHTML = `
        ${pageHeader("Tagihan Siswa", "Cari ID siswa untuk melihat dan mengirim surat tagihan.", "Tambah Tagihan", "btn-add-billing")}
        <section class="card billing-lookup">
          <form id="billing-student-search" class="billing-search-form">
            <div><label for="billing-student-id">ID Siswa</label><input id="billing-student-id" name="studentId" value="${esc(initialId)}" placeholder="Masukkan ID siswa" autocomplete="off" required></div>
            <button type="submit" class="btn btn-primary">Cari Data</button>
          </form>
          <p class="tiny">Nama dan nomor WhatsApp diambil otomatis dari data master siswa.</p>
        </section>
        <div id="billing-student-result" class="section"></div>
      `;

      const searchForm = qs("#billing-student-search", el);
      const idInput = qs("#billing-student-id", el);
      const addButton = qs("#btn-add-billing", el);
      const resultRoot = qs("#billing-student-result", el);
      let selectedStudent = null;

      async function ensurePdfLibrary() {
        if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Library PDF tidak dapat dimuat. Periksa koneksi internet."));
          document.head.appendChild(script);
        });
        if (!window.jspdf?.jsPDF) throw new Error("Library PDF tidak tersedia.");
        return window.jspdf.jsPDF;
      }

      let invoiceLogoPromise = null;
      function invoiceLogoData() {
        if (!invoiceLogoPromise) {
          invoiceLogoPromise = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              const context = canvas.getContext("2d");
              if (!context) {
                reject(new Error("Logo tidak dapat disiapkan untuk PDF."));
                return;
              }
              context.drawImage(image, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            };
            image.onerror = () => reject(new Error("Logo LPKS Arima Persada tidak dapat dimuat."));
            image.src = new URL("assets/logo.webp", document.baseURI).href;
          });
        }
        return invoiceLogoPromise;
      }

      function invoiceDate(value) {
        const text = String(value || "");
        if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
        return text;
      }

      function createInvoicePdf(student, invoice, logoData) {
        const JsPDF = window.jspdf?.jsPDF;
        if (!JsPDF) throw new Error("Library PDF belum siap.");
        const pdf = new JsPDF({ unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 18;
        const contentWidth = pageWidth - margin * 2;

        pdf.setFillColor(248, 249, 251);
        pdf.rect(0, 0, pageWidth, 52, "F");
        pdf.addImage(logoData, "PNG", margin, 12, 27, 27);
        pdf.setTextColor(34, 34, 38);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("LPKS ARIMA PERSADA", 51, 19);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(112, 112, 118);
        pdf.setFontSize(8.5);
        pdf.text(pdf.splitTextToSize("Jl. Sidoharjo 1, Desa Negara Ratu, Kecamatan Natar, Kabupaten Lampung Selatan", 140), 51, 26);
        pdf.text("Konfirmasi: 0813-7908-7768 · 0812-8267-4707 · 0823-7512-8230", 51, 36);
        pdf.text("Email: arimapersada@gmail.com", 51, 42);
        pdf.setDrawColor(215, 25, 32);
        pdf.setLineWidth(1);
        pdf.line(margin, 52, pageWidth - margin, 52);

        pdf.setTextColor(180, 20, 27);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("SURAT TAGIHAN SISWA", margin, 64);
        pdf.setTextColor(75, 75, 80);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(`No. Tagihan: ${invoice.BILLING_ID || "-"}`, margin, 72);
        pdf.text(`Tanggal cetak: ${new Date().toLocaleDateString("id-ID")}`, pageWidth - margin, 72, { align: "right" });

        pdf.setFillColor(248, 248, 249);
        pdf.roundedRect(margin, 80, contentWidth, 32, 2, 2, "F");
        pdf.setTextColor(112, 112, 118);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text("DITAGIHKAN KEPADA", margin + 6, 88);
        pdf.setTextColor(34, 34, 38);
        pdf.setFontSize(12);
        pdf.text(String(student.NAMA || "-"), margin + 6, 96);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(75, 75, 80);
        pdf.text(`ID Siswa: ${student.ID_SISWA || "-"}`, margin + 6, 104);
        pdf.text(`WhatsApp: ${student.NO_WA || "-"}`, pageWidth - margin - 6, 104, { align: "right" });

        pdf.setTextColor(34, 34, 38);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("RINCIAN TAGIHAN", margin, 124);
        pdf.setDrawColor(225, 226, 229);
        pdf.setLineWidth(0.3);
        pdf.line(margin, 128, pageWidth - margin, 128);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(75, 75, 80);
        const descriptionLines = pdf.splitTextToSize(String(invoice.DESCRIPTION || "-"), contentWidth - 4);
        pdf.text("Deskripsi", margin, 137);
        pdf.setTextColor(34, 34, 38);
        pdf.text(descriptionLines, margin + 32, 137);
        let detailsY = 137 + Math.max(1, descriptionLines.length) * 4.5;
        pdf.setTextColor(75, 75, 80);
        pdf.text("Kategori", margin, detailsY);
        pdf.setTextColor(34, 34, 38);
        pdf.text(String(invoice.CATEGORY || "-"), margin + 32, detailsY);
        detailsY += 7;
        pdf.setTextColor(75, 75, 80);
        pdf.text("Jatuh tempo", margin, detailsY);
        pdf.setTextColor(34, 34, 38);
        pdf.text(invoiceDate(invoice.DUE_DATE) || "-", margin + 32, detailsY);
        pdf.setTextColor(75, 75, 80);
        pdf.text("Status", pageWidth / 2 + 10, detailsY);
        pdf.setTextColor(34, 34, 38);
        pdf.text(String(invoice.STATUS || "-"), pageWidth / 2 + 32, detailsY);

        const totalY = detailsY + 12;
        pdf.setFillColor(248, 248, 249);
        pdf.roundedRect(margin, totalY, contentWidth, 24, 2, 2, "F");
        pdf.setTextColor(34, 34, 38);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("TOTAL TAGIHAN", margin + 7, totalY + 15);
        pdf.setTextColor(180, 20, 27);
        pdf.setFontSize(15);
        pdf.text(formatRupiah(invoice.AMOUNT), pageWidth - margin - 7, totalY + 15, { align: "right" });

        let footerY = 250;
        if (invoice.NOTES) {
          pdf.setTextColor(112, 112, 118);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.text("Catatan:", margin, totalY + 34);
          const noteLines = pdf.splitTextToSize(String(invoice.NOTES), contentWidth);
          const visibleNoteLines = noteLines.slice(0, 3);
          pdf.text(visibleNoteLines, margin, totalY + 39);
          footerY = Math.max(230, totalY + 45 + visibleNoteLines.length * 3.5);
        }
        const footerText = "Mohon melakukan pembayaran sebelum tanggal jatuh tempo. Apabila terdapat kendala dalam pembayaran atau membutuhkan pembicaraan terkait mekanisme penyelesaian pembayaran dapat menghubungi Pak Suwardi (0813-7908-7768), Sensei Rachmat (0812-8267-4707), Admin LPKS Arima Persada (0823-7512-8230)";
        const footerLines = pdf.splitTextToSize(footerText, contentWidth);
        const footerHeight = footerLines.length * 4;
        if (footerY + footerHeight > 289) {
          pdf.addPage();
          footerY = 24;
        }
        pdf.setDrawColor(225, 226, 229);
        pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        pdf.setTextColor(92, 92, 98);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(footerLines, margin, footerY);
        const fileId = String(invoice.BILLING_ID || student.ID_SISWA).replace(/[^A-Za-z0-9_-]/g, "-");
        return { pdf, fileName: `tagihan-${fileId}.pdf` };
      }

      async function downloadInvoice(student, invoice) {
        await ensurePdfLibrary();
        const logoData = await invoiceLogoData();
        const { pdf, fileName } = createInvoicePdf(student, invoice, logoData);
        pdf.save(fileName);
      }

      function sendInvoiceWhatsApp(student, invoice, targetWindow = null) {
        let phone = String(student.NO_WA || "").replace(/\D/g, "");
        if (phone.startsWith("0")) phone = `62${phone.slice(1)}`;
        else if (!phone.startsWith("62")) phone = `62${phone}`;
        if (!phone) throw new Error("Nomor WhatsApp siswa belum tersedia.");
        const message = [
          `LPKS Arima Persada - Surat Tagihan`,
          `ID Siswa: ${student.ID_SISWA}`,
          `Nama: ${student.NAMA || "-"}`,
          `No. Tagihan: ${invoice.BILLING_ID || "-"}`,
          `Rincian: ${invoice.DESCRIPTION || "-"}`,
          `Jumlah: ${formatRupiah(invoice.AMOUNT)}`,
          `Jatuh tempo: ${invoiceDate(invoice.DUE_DATE) || "-"}`,
          `Status: ${invoice.STATUS || "-"}`,
          "Silakan hubungi LPKS Arima Persada untuk informasi pembayaran."
        ].join("\n");
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }

      function renderStudentInvoices(student) {
        selectedStudent = student;
        if (!student) {
          resultRoot.innerHTML = `<div class="card billing-empty-state"><strong>ID siswa tidak ditemukan.</strong><span>Periksa kembali ID yang dimasukkan.</span></div>`;
          return;
        }

        const studentInvoices = billings.filter(row => String(row.ID_SISWA || "").trim().toUpperCase() === String(student.ID_SISWA || "").trim().toUpperCase());
        resultRoot.innerHTML = `
          <section class="card billing-student-card">
            <div><span class="billing-label">SISWA</span><h2>${esc(student.NAMA || "Tanpa nama")}</h2><span class="muted">ID ${esc(student.ID_SISWA)}</span></div>
            <div class="billing-contact"><span class="muted">WhatsApp</span><strong>${esc(student.NO_WA || "Nomor belum tersedia")}</strong></div>
          </section>
          <section class="section billing-invoice-list">
            <div class="section-head"><h2>Daftar Tagihan (${formatNumber(studentInvoices.length)})</h2></div>
            <div class="card">${renderTable(studentInvoices,[
              {key:"BILLING_ID",label:"No. Tagihan",render:value=>esc(value||"")},
              {key:"DESCRIPTION",label:"Rincian",render:value=>esc(value||"")},
              {key:"DUE_DATE",label:"Jatuh Tempo",render:value=>esc(invoiceDate(value))},
              {key:"AMOUNT",label:"Jumlah",render:value=>formatRupiah(value)},
              {key:"STATUS",label:"Status",render:value=>esc(value||"")}
            ],{
              emptyText:"Belum ada tagihan untuk siswa ini.",
              actions:invoice=>`
                <button type="button" class="btn btn-small" data-edit-billing="${esc(invoice.BILLING_ID||"")}">Edit</button>
                <button type="button" class="btn btn-small" data-download-invoice="${esc(invoice.BILLING_ID||"")}">Unduh PDF</button>
                <button type="button" class="btn btn-small btn-light" data-send-invoice="${esc(invoice.BILLING_ID||"")}">Kirim / WhatsApp</button>
              `
            })}</div>
          </section>
        `;

        qsa("[data-edit-billing]", resultRoot).forEach(button => button.addEventListener("click", () => {
          const invoice = studentInvoices.find(row => String(row.BILLING_ID) === String(button.dataset.editBilling));
          if (invoice) openFormModal("billing", invoice);
        }));
        qsa("[data-download-invoice]", resultRoot).forEach(button => button.addEventListener("click", async () => {
          const invoice = studentInvoices.find(row => String(row.BILLING_ID) === String(button.dataset.downloadInvoice));
          if (!invoice) return;
          button.disabled = true;
          try { await downloadInvoice(student, invoice); }
          catch (error) { showToast(error.message || "PDF gagal dibuat.", "error"); }
          finally { button.disabled = false; }
        }));
        qsa("[data-send-invoice]", resultRoot).forEach(button => button.addEventListener("click", async () => {
          const invoice = studentInvoices.find(row => String(row.BILLING_ID) === String(button.dataset.sendInvoice));
          if (!invoice) return;
          try { sendInvoiceWhatsApp(student, invoice); }
          catch (error) { showToast(error.message || "WhatsApp tidak dapat dibuka.", "error"); }
        }));
      }

      searchForm.addEventListener("submit", event => {
        event.preventDefault();
        const value = idInput.value.trim().toUpperCase();
        const student = students.find(row => String(row.ID_SISWA || "").trim().toUpperCase() === value);
        const url = new URL(window.location.href);
        if (student) url.searchParams.set("studentId", student.ID_SISWA);
        else url.searchParams.delete("studentId");
        window.history.replaceState({}, "", url);
        renderStudentInvoices(student || null);
      });

      addButton.addEventListener("click", () => {
        openFormModal("billing", null, {
          studentRows: students,
          defaults: { ID_SISWA: selectedStudent?.ID_SISWA || "" }
        });
      });

      if (initialId) {
        const student = students.find(row => String(row.ID_SISWA || "").trim().toUpperCase() === initialId.trim().toUpperCase());
        renderStudentInvoices(student || null);
      } else {
        resultRoot.innerHTML = `<div class="card billing-empty-state"><strong>Cari data tagihan berdasarkan ID siswa.</strong><span>Nama dan nomor WhatsApp akan muncul otomatis jika ID ditemukan.</span></div>`;
      }
      ensurePdfLibrary().catch(() => {});

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * FINANCE
   * =========================================================
   */

  async function renderFinance(
    el
  ) {

    try {

      const response =
        await API.finance();
      if (response?.success === false) throw new Error(response.message || "Data mutasi keuangan gagal dimuat.");

      const rows = Array.isArray(response?.data) ? response.data : [];
      const selectedMonth = new URLSearchParams(window.location.search).get("financeMonth")
        || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      const monthRows = rows.filter(row => String(row.DATE || "").slice(0, 7) === selectedMonth);
      const amount = value => {
        const number = Number(String(value || 0).replace(/[^\d.-]/g, ""));
        return Number.isFinite(number) ? number : 0;
      };
      const incomeRows = monthRows.filter(row => String(row.TYPE || "").trim().toUpperCase() === "PEMASUKAN");
      const expenseRows = monthRows.filter(row => String(row.TYPE || "").trim().toUpperCase() === "PENGELUARAN");
      const totalIncome = incomeRows.reduce((sum, row) => sum + amount(row.AMOUNT), 0);
      const totalExpense = expenseRows.reduce((sum, row) => sum + amount(row.AMOUNT), 0);
      const netCashFlow = totalIncome - totalExpense;

      el.innerHTML = `
        ${pageHeader("Mutasi Keuangan", "Catat pemasukan dan pengeluaran harian serta pantau rekap setiap bulan.", "Tambah Mutasi", "btn-add-finance")}
        <section class="report-toolbar finance-toolbar">
          <label for="finance-month">Periode rekap</label>
          <input type="month" id="finance-month" value="${esc(selectedMonth)}">
        </section>
        <div class="cards finance-summary">
          <div class="card"><div class="muted">Total pemasukan</div><div class="metric finance-income">${formatRupiah(totalIncome)}</div><div class="tiny">${formatNumber(incomeRows.length)} transaksi</div></div>
          <div class="card"><div class="muted">Total pengeluaran</div><div class="metric finance-expense">${formatRupiah(totalExpense)}</div><div class="tiny">${formatNumber(expenseRows.length)} transaksi</div></div>
          <div class="card"><div class="muted">Selisih bersih</div><div class="metric ${netCashFlow < 0 ? "report-negative" : "report-positive"}">${formatRupiah(netCashFlow)}</div><div class="tiny">Pemasukan dikurangi pengeluaran</div></div>
        </div>
        <section class="section card">
          <div class="section-head"><h2>Transaksi ${esc(selectedMonth)}</h2></div>
          ${renderTable(monthRows, [
            {key:"DATE",label:"Tanggal",render:value=>esc(String(value||"").slice(0,10))},
            {key:"TYPE",label:"Jenis",render:value=>esc(value||"")},
            {key:"CATEGORY",label:"Kategori",render:value=>esc(value||"")},
            {key:"DESCRIPTION",label:"Keterangan",render:value=>esc(value||"")},
            {key:"AMOUNT",label:"Nominal",render:value=>formatRupiah(value)},
            {key:"PAYMENT_METHOD",label:"Metode",render:value=>esc(value||"")},
            {key:"REFERENCE_NO",label:"Referensi",render:value=>esc(value||"")}
          ], {
            emptyText:"Belum ada transaksi pada bulan ini.",
            actions:row=>`<button type="button" class="btn btn-small" data-edit-finance="${esc(row.TRANSACTION_ID||"")}">Edit</button>`
          })}
        </section>
      `;

      qs("#finance-month", el)?.addEventListener("change", event => {
        const url = new URL(window.location.href);
        url.searchParams.set("financeMonth", event.target.value);
        window.history.replaceState({}, "", url);
        renderFinance(el);
      });
      qs("#btn-add-finance", el)?.addEventListener("click", () => openFormModal("finance"));
      qsa("[data-edit-finance]", el).forEach(button => button.addEventListener("click", () => {
        const row = rows.find(item => String(item.TRANSACTION_ID) === String(button.dataset.editFinance));
        if (row) openFormModal("finance", row);
      }));

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * SALARY
   * =========================================================
   */

  async function renderSalary(
    el
  ) {

    if (!isAdminUser()) {
      el.innerHTML = `
        <div class="card">
          <h2>Akses Ditolak</h2>
          <p class="muted">Menu payroll hanya tersedia untuk admin.</p>
        </div>
      `;
      return;
    }

    try {

      const [salaryResponse, senseiResponse] = await Promise.all([
        API.salary(),
        API.sensei()
      ]);
      const senseiRows = Array.isArray(senseiResponse?.data)
        ? senseiResponse.data.filter(row => String(row.ID_SENSEI || "").trim())
        : [];
      const rows = (Array.isArray(salaryResponse?.data) ? salaryResponse.data : [])
        .map(row => ({
          ...row,
          SENSEI_NAME: senseiRows.find(sensei => String(sensei.ID_SENSEI) === String(row.ID_SENSEI))?.NAMA || "Sensei tidak ditemukan"
        }));


      el.innerHTML = `

        ${pageHeader(
          "Payroll Sensei",
          "Gaji otomatis dari absensi sensei, berdasarkan tarif per JP (45 menit), di luar waktu istirahat.",
          "Tambah Payroll",
          "btn-add-salary"
        )}


        <div class="section">

          <div class="card">
            <strong>Rumus payroll</strong>
            <p class="muted">Total menit mengajar setelah dikurangi istirahat 10.00–10.15 dan 12.00–13.15, dibagi 45 menit, lalu dikali tarif per JP.</p>
          </div>

        </div>


        <div class="card">

          ${renderTable(
            rows,
            [
              {
                key: "SALARY_ID",
                label: "ID"
              },

              {
                key: "ID_SENSEI",
                label: "ID Sensei"
              },

              {
                key: "SENSEI_NAME",
                label: "Nama Sensei"
              },

              {
                key: "PERIOD",
                label: "Periode"
              },

              {
                key: "MEETING_COUNT",
                label: "Pertemuan"
              },

              {
                key: "HOUR_COUNT",
                label: "JP (45 menit)"
              },

              {
                key: "BASE_AMOUNT",
                label: "Gaji Pokok",
                render: value =>
                  formatRupiah(value)
              },

              {
                key: "BONUS",
                label: "Bonus",
                render: value =>
                  formatRupiah(value)
              },

              {
                key: "DEDUCTION",
                label: "Potongan",
                render: value =>
                  formatRupiah(value)
              },

              {
                key: "NET_SALARY",
                label: "Gaji Bersih",
                render: value =>
                  formatRupiah(value)
              },

              {
                key: "PAYMENT_STATUS",
                label: "Status"
              }
            ],
            {
              actions: row => `

                <button
                  type="button"
                  class="btn btn-small"
                  data-edit-salary="${esc(
                    row.SALARY_ID
                  )}"
                >
                  Edit
                </button>

              `
            }
          )}

        </div>

      `;


      const addButton =
        qs(
          "#btn-add-salary"
        );

      if (addButton) {

        addButton.addEventListener(
          "click",
          () => {

            openFormModal(
              "salary",
              null,
              { senseiRows }
            );

          }
        );

      }


      qsa(
        "[data-edit-salary]"
      ).forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset
                  .editSalary;

              const row =
                rows.find(
                  item =>
                    String(
                      item.SALARY_ID
                    ) === String(id)
                );

              if (row) {

                openFormModal(
                  "salary",
                  row,
                  { senseiRows }
                );

              }

            }
          );

        }
      );

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * REPORTS
   * =========================================================
   */

  async function renderReports(
    el
  ) {

    if (!isAdminUser()) {
      el.innerHTML = `
        <div class="card">
          <h2>Akses Ditolak</h2>
          <p class="muted">Laporan keuangan hanya dapat dibuka oleh admin.</p>
        </div>
      `;
      return;
    }

    try {

      const [billingResponse, paymentResponse, salaryResponse, senseiResponse] = await Promise.all([
        API.billing(),
        API.payments(),
        API.salary(),
        API.sensei()
      ]);
      const billings = Array.isArray(billingResponse?.data) ? billingResponse.data : [];
      const payments = Array.isArray(paymentResponse?.data) ? paymentResponse.data : [];
      const salaries = Array.isArray(salaryResponse?.data) ? salaryResponse.data : [];
      const senseiRows = Array.isArray(senseiResponse?.data) ? senseiResponse.data : [];
      const selectedMonth = new URLSearchParams(window.location.search).get("reportMonth")
        || new Date().toISOString().slice(0, 7);

      const monthOf = value => {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
          return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
        }
        const text = String(value || "").trim();
        const iso = text.match(/^(\d{4})-(\d{2})/);
        if (iso) return `${iso[1]}-${iso[2]}`;
        const local = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (local) return `${local[3]}-${String(local[2]).padStart(2, "0")}`;
        return "";
      };
      const amountOf = value => {
        const amount = Number(String(value || 0).replace(/[^\d.-]/g, ""));
        return Number.isFinite(amount) ? amount : 0;
      };
      const sum = (rows, field) => rows.reduce((total, row) => total + amountOf(row[field]), 0);
      const monthlyBillings = billings.filter(row => monthOf(row.DUE_DATE) === selectedMonth);
      const monthlyPayments = payments.filter(row => monthOf(row.PAYMENT_DATE) === selectedMonth);
      const monthlySalaries = salaries.filter(row => monthOf(row.PERIOD) === selectedMonth);
      const paidSalaries = monthlySalaries.filter(row => ["DIBAYAR", "LUNAS", "PAID"].includes(String(row.PAYMENT_STATUS || "").trim().toUpperCase()));
      const pendingSalaries = monthlySalaries.filter(row => !["DIBAYAR", "LUNAS", "PAID"].includes(String(row.PAYMENT_STATUS || "").trim().toUpperCase()));
      const amountBilled = sum(monthlyBillings, "AMOUNT");
      const amountCollected = sum(monthlyPayments, "AMOUNT");
      const amountOutstanding = monthlyBillings.reduce((total, billing) => {
        const paidToMonth = payments
          .filter(payment => String(payment.BILLING_ID || "") === String(billing.BILLING_ID || ""))
          .filter(payment => !monthOf(payment.PAYMENT_DATE) || monthOf(payment.PAYMENT_DATE) <= selectedMonth)
          .reduce((paid, payment) => paid + amountOf(payment.AMOUNT), 0);
        return total + Math.max(0, amountOf(billing.AMOUNT) - paidToMonth);
      }, 0);
      const payrollPaid = sum(paidSalaries, "NET_SALARY");
      const payrollPending = sum(pendingSalaries, "NET_SALARY");
      const netCashFlow = amountCollected - payrollPaid;
      const senseiName = id => senseiRows.find(row => String(row.ID_SENSEI) === String(id))?.NAMA || "Sensei tidak ditemukan";

      el.innerHTML = `
        ${pageHeader("Laporan Keuangan", "Rekap tagihan, penerimaan, piutang, dan payroll per bulan.")}

        <div class="report-toolbar">
          <label for="report-month">Periode laporan</label>
          <input type="month" id="report-month" value="${esc(selectedMonth)}">
          <button type="button" class="btn btn-light" id="export-finance-csv">↓ Unduh CSV</button>
        </div>

        <div class="cards report-metrics">
          <div class="card"><div class="muted">Tagihan jatuh tempo</div><div class="metric">${formatRupiah(amountBilled)}</div><div class="tiny">${formatNumber(monthlyBillings.length)} tagihan</div></div>
          <div class="card"><div class="muted">Pembayaran masuk</div><div class="metric">${formatRupiah(amountCollected)}</div><div class="tiny">${formatNumber(monthlyPayments.length)} transaksi</div></div>
          <div class="card"><div class="muted">Sisa piutang</div><div class="metric">${formatRupiah(amountOutstanding)}</div><div class="tiny">Dari tagihan jatuh tempo bulan ini</div></div>
          <div class="card"><div class="muted">Payroll dibayar</div><div class="metric">${formatRupiah(payrollPaid)}</div><div class="tiny">${formatNumber(paidSalaries.length)} payroll lunas</div></div>
        </div>

        <div class="section report-cashflow">
          <div class="card report-cashflow-row">
            <div><span class="muted">Payroll belum dibayar</span><strong>${formatRupiah(payrollPending)}</strong></div>
            <div><span class="muted">Arus kas bersih</span><strong class="${netCashFlow < 0 ? "report-negative" : "report-positive"}">${formatRupiah(netCashFlow)}</strong></div>
          </div>
        </div>

        <section class="section report-ledger">
          <div class="section-head"><h2>Tagihan jatuh tempo</h2></div>
          <div class="card">${renderTable(monthlyBillings,[
            {key:"BILLING_ID",label:"ID Tagihan",render:value=>esc(value||"")},
            {key:"ID_SISWA",label:"ID Siswa",render:value=>esc(value||"")},
            {key:"DESCRIPTION",label:"Deskripsi",render:value=>esc(value||"")},
            {key:"DUE_DATE",label:"Jatuh Tempo",render:value=>esc(String(value||"").slice(0,10))},
            {key:"STATUS",label:"Status",render:value=>esc(value||"")},
            {key:"AMOUNT",label:"Nominal",render:value=>formatRupiah(value)}
          ],{emptyText:"Tidak ada tagihan jatuh tempo pada periode ini."})}</div>
        </section>

        <section class="section report-ledger">
          <div class="section-head"><h2>Pembayaran diterima</h2></div>
          <div class="card">${renderTable(monthlyPayments,[
            {key:"PAYMENT_DATE",label:"Tanggal",render:value=>esc(String(value||"").slice(0,10))},
            {key:"PAYMENT_ID",label:"ID Pembayaran",render:value=>esc(value||"")},
            {key:"ID_SISWA",label:"ID Siswa",render:value=>esc(value||"")},
            {key:"BILLING_ID",label:"ID Tagihan",render:value=>esc(value||"")},
            {key:"PAYMENT_METHOD",label:"Metode",render:value=>esc(value||"")},
            {key:"AMOUNT",label:"Nominal",render:value=>formatRupiah(value)}
          ],{emptyText:"Tidak ada pembayaran pada periode ini."})}</div>
        </section>

        <section class="section report-ledger">
          <div class="section-head"><h2>Payroll sensei</h2></div>
          <div class="card">${renderTable(monthlySalaries,[
            {key:"ID_SENSEI",label:"ID Sensei",render:value=>esc(value||"")},
            {key:"NAMA",label:"Nama",render:(value,row)=>esc(senseiName(row.ID_SENSEI))},
            {key:"HOUR_COUNT",label:"JP",render:value=>formatNumber(value)},
            {key:"NET_SALARY",label:"Gaji Bersih",render:value=>formatRupiah(value)},
            {key:"PAYMENT_STATUS",label:"Status",render:value=>esc(value||"")},
            {key:"PAYMENT_DATE",label:"Tanggal Bayar",render:value=>esc(String(value||"").slice(0,10))}
          ],{emptyText:"Belum ada payroll pada periode ini."})}</div>
        </section>
      `;

      qs("#report-month", el)?.addEventListener("change", event => {
        const url = new URL(window.location.href);
        url.searchParams.set("reportMonth", event.target.value);
        window.history.replaceState({}, "", url);
        renderReports(el);
      });

      qs("#export-finance-csv", el)?.addEventListener("click", () => {
        const records = [
          ["Jenis", "Tanggal/Periode", "ID", "Pihak", "Keterangan", "Status", "Nominal"],
          ...monthlyBillings.map(row => ["TAGIHAN", row.DUE_DATE, row.BILLING_ID, row.ID_SISWA, row.DESCRIPTION, row.STATUS, row.AMOUNT]),
          ...monthlyPayments.map(row => ["PEMBAYARAN", row.PAYMENT_DATE, row.PAYMENT_ID, row.ID_SISWA, row.PAYMENT_METHOD, "DITERIMA", row.AMOUNT]),
          ...monthlySalaries.map(row => ["PAYROLL", row.PERIOD, row.SALARY_ID, senseiName(row.ID_SENSEI), row.ID_SENSEI, row.PAYMENT_STATUS, row.NET_SALARY])
        ];
        const csv = "\uFEFF" + records.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `laporan-keuangan-${selectedMonth}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      });

    } catch (error) {

      renderError(
        el,
        error
      );

    }

  }


  /*
   * =========================================================
   * SETTINGS
   * =========================================================
   */

  async function renderSettings(
    el
  ) {

    if (!isAdminUser()) {
      el.innerHTML = `
        ${pageHeader("Pengaturan", "Informasi sistem ARIMA Management System.")}
        <div class="card setting-info">
          <div class="setting-row"><div><strong>Nama Aplikasi</strong><div class="muted">ARIMA MANAGEMENT SYSTEM</div></div></div>
          <div class="setting-row"><div><strong>Perusahaan</strong><div class="muted">LPKS Arima Persada</div></div></div>
          <div class="setting-row"><div><strong>User Login</strong><div class="muted">${esc(user?.name || user?.NAME || "-")}</div></div></div>
        </div>
      `;
      return;
    }

    try {
      const [usersResult, studentsResult, senseiResult] = await Promise.allSettled([
        API.users(),
        API.students(),
        API.sensei()
      ]);
      const responseError = (result, label) => {
        if (result.status === "rejected") return result.reason?.message || `Data ${label} gagal dimuat.`;
        if (result.value?.success === false) return result.value.message || `Data ${label} gagal dimuat.`;
        return "";
      };
      const usersResponse = usersResult.status === "fulfilled" ? usersResult.value : null;
      const usersError = responseError(usersResult, "akun");
      const directoryErrors = [
        responseError(studentsResult, "siswa"),
        responseError(senseiResult, "sensei")
      ].filter(Boolean);
      const studentsResponse = studentsResult.status === "fulfilled" ? studentsResult.value : null;
      const senseiResponse = senseiResult.status === "fulfilled" ? senseiResult.value : null;
      const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
      const students = Array.isArray(studentsResponse?.data) ? studentsResponse.data : [];
      const sensei = Array.isArray(senseiResponse?.data) ? senseiResponse.data : [];
      const directories = { students, sensei };

      el.innerHTML = `
        ${pageHeader("Pengaturan", "Informasi sistem dan akun akses pengguna.")}

        <div class="card setting-info">
          <div class="setting-row"><div><strong>Nama Aplikasi</strong><div class="muted">ARIMA MANAGEMENT SYSTEM</div></div></div>
          <div class="setting-row"><div><strong>Perusahaan</strong><div class="muted">LPKS Arima Persada</div></div></div>
          <div class="setting-row"><div><strong>Admin Login</strong><div class="muted">${esc(user?.name || user?.NAME || "-")}</div></div></div>
        </div>

        <section class="section account-management">
          <div class="section-head">
            <div><h2>Akun Pengguna</h2><p class="muted">ID login siswa/sensei memakai 3 huruf awal nama + 4 angka terakhir WhatsApp; ID master tetap ditautkan.</p></div>
            <div class="toolbar">
              <button type="button" class="btn btn-light" id="btn-generate-user-ids">Generate USER ID</button>
              <button type="button" class="btn btn-primary" id="btn-add-account">+ Tambah Akun</button>
            </div>
          </div>
          <div class="card">
            ${usersError ? `<div class="alert error" role="alert">${esc(usersError)}</div>` : ""}
            ${directoryErrors.map(message => `<div class="alert error" role="alert">${esc(message)}</div>`).join("")}
            ${renderTable(users,[
              {key:"USER_ID",label:"ID Akun",render:value=>esc(value||"")},
              {key:"MASTER_ID",label:"ID Master",render:value=>esc(value||"-")},
              {key:"NAMA",label:"Nama",render:value=>esc(value||"")},
              {key:"ROLE",label:"Role",render:value=>esc(value||"")}
            ],{
              emptyText:"Belum ada akun yang terdaftar.",
              actions:account=>`
                <button type="button" class="btn btn-small" data-reset-account="${esc(account.USER_ID)}">Reset Password</button>
                ${String(account.USER_ID).toUpperCase()===String(user?.id||user?.ID||"").toUpperCase()?"":`<button type="button" class="btn btn-small btn-danger" data-delete-account="${esc(account.USER_ID)}">Hapus</button>`}
              `
            })}
          </div>
        </section>
      `;

      qs("#btn-add-account", el)?.addEventListener("click", () => openAccountModal("create", null, directories));
      qs("#btn-generate-user-ids", el)?.addEventListener("click", async event => {
        if (!confirm("Generate USER ID untuk akun siswa dan sensei yang belum memakai format baru? ID login akun yang diperbarui akan berubah.")) return;
        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = "Memproses...";
        try {
          const response = await API.generateUserIds();
          if (response?.success === false) throw new Error(response.message || "USER ID gagal dibuat.");
          showToast(response?.message || "USER ID berhasil dibuat.");
          await renderSettings(el);
        } catch (error) {
          button.disabled = false;
          button.textContent = "Generate USER ID";
          showToast(error.message || "USER ID gagal dibuat.", "error");
        }
      });
      qsa("[data-reset-account]", el).forEach(button => {
        button.addEventListener("click", () => {
          const account = users.find(item => String(item.USER_ID) === String(button.dataset.resetAccount));
          if (account) openAccountModal("reset", account, directories);
        });
      });
      qsa("[data-delete-account]", el).forEach(button => {
        button.addEventListener("click", async () => {
          const accountId = button.dataset.deleteAccount;
          if (!confirm(`Hapus akun ${accountId}? Data master siswa/sensei tidak akan dihapus.`)) return;
          button.disabled = true;
          try {
            const response = await API.userDelete({ userId: accountId });
            if (response?.success === false) throw new Error(response.message || "Gagal menghapus akun.");
            showToast(response?.message || "Akun berhasil dihapus.");
            await renderSettings(el);
          } catch (error) {
            button.disabled = false;
            showToast(error.message || "Gagal menghapus akun.", "error");
          }
        });
      });
    } catch (error) {
      renderError(el, error);
    }

  }


  function openAccountModal(mode, account, directories) {
    if (!isAdminUser()) {
      showToast("Pengelolaan akun hanya tersedia untuk admin.", "error");
      return;
    }

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
            <p>${isReset ? "Tentukan password baru untuk akun ini." : "ID akun siswa/sensei dibuat dari 3 huruf awal nama dan 4 angka terakhir nomor WhatsApp."}</p>
          </div>
          <button type="button" class="modal-close" id="account-modal-close" aria-label="Tutup">×</button>
        </div>
        <form id="account-form" class="form-grid form-modal-fields">
          ${isReset ? `
            <div class="form-group form-group-wide">
              <label>ID Akun</label>
              <input type="text" value="${esc(account?.USER_ID || "")}" disabled>
              <input type="hidden" name="userId" value="${esc(account?.USER_ID || "")}">
            </div>
          ` : `
            <div class="form-group form-group-wide">
              <label for="account-role">Jenis Akun</label>
              <select id="account-role" name="role" required>
                <option value="SISWA">Siswa</option>
                <option value="SENSEI">Sensei</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div class="form-group form-group-wide" id="account-linked-id-group">
              <label for="account-linked-id">Pilih ID Master</label>
              <select id="account-linked-id" name="linkedId" required></select>
              <span class="tiny">ID login mengikuti format 3 huruf awal nama + 4 angka terakhir WhatsApp.</span>
            </div>
            <div class="form-group" id="account-admin-id-group">
              <label for="account-admin-id">ID Admin</label>
              <input type="text" id="account-admin-id" name="adminId" placeholder="Contoh: ADMIN002">
            </div>
            <div class="form-group" id="account-admin-name-group">
              <label for="account-admin-name">Nama Admin</label>
              <input type="text" id="account-admin-name" name="adminName" placeholder="Nama lengkap">
            </div>
            <div class="account-person-preview hidden" id="account-person-preview"></div>
          `}
          <div class="form-group form-group-wide">
            <label for="account-password">${isReset ? "Password Baru" : "Password Awal"}</label>
            <input type="password" id="account-password" name="password" minlength="8" autocomplete="new-password" required>
            <span class="tiny">Minimal 8 karakter. Password disimpan dalam bentuk hash.</span>
          </div>
          <div class="modal-footer form-modal-footer">
            <button type="button" class="btn btn-light" id="account-modal-cancel">Batal</button>
            <button type="submit" class="btn btn-primary" id="account-modal-submit">${isReset ? "Simpan Password Baru" : "Buat Akun"}</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    qs("#account-modal-close", modal).addEventListener("click", close);
    qs("#account-modal-cancel", modal).addEventListener("click", close);
    modal.addEventListener("click", event => { if (event.target === modal) close(); });

    if (!isReset) {
      const roleSelect = qs("#account-role", modal);
      const linkedGroup = qs("#account-linked-id-group", modal);
      const linkedSelect = qs("#account-linked-id", modal);
      const adminIdGroup = qs("#account-admin-id-group", modal);
      const adminNameGroup = qs("#account-admin-name-group", modal);
      const adminId = qs("#account-admin-id", modal);
      const adminName = qs("#account-admin-name", modal);
      const preview = qs("#account-person-preview", modal);

      const generatedAccountId = person => {
        const name = String(person?.NAMA || "").trim().match(/[A-Za-z]+/);
        const phone = String(person?.NO_WA || "").replace(/\D/g, "");
        if (!name || name[0].length < 3 || phone.length < 4) return "";
        return name[0].slice(0, 3).toUpperCase() + phone.slice(-4);
      };

      const populateLinkedIds = () => {
        const role = roleSelect.value;
        const people = role === "SISWA" ? directories.students : directories.sensei;
        const idKey = role === "SISWA" ? "ID_SISWA" : "ID_SENSEI";
        const identified = people.filter(person => String(person[idKey] || "").trim());
        linkedSelect.innerHTML = identified.length
          ? `<option value="">Pilih ID...</option>${identified.map(person => `<option value="${esc(person[idKey])}">${esc(person[idKey])} · ${esc(person.NAMA || "Tanpa nama")}</option>`).join("")}`
          : `<option value="">${role === "SISWA" ? "Belum ada ID siswa" : "Belum ada ID sensei"}</option>`;
        preview.classList.toggle("hidden", role === "ADMIN");
        preview.innerHTML = identified.length ? "Pilih ID untuk melihat nama akun." : "Tidak ada ID master tersedia untuk role ini.";
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
      const updateLinkedPreview = () => {
        const role = roleSelect.value;
        const people = role === "SISWA" ? directories.students : directories.sensei;
        const idKey = role === "SISWA" ? "ID_SISWA" : "ID_SENSEI";
        const person = people.find(item => String(item[idKey]) === String(linkedSelect.value));
        if (!person) {
          preview.innerHTML = "Pilih ID untuk melihat nama akun dan ID login.";
          return;
        }
        const generatedId = generatedAccountId(person);
        preview.innerHTML = `
          <strong>${esc(person.NAMA || "Tanpa nama")}</strong>
          <span>ID Master: ${esc(linkedSelect.value)}</span>
          <span>ID Login: <strong>${esc(generatedId || "Tidak dapat dibuat: lengkapi nama dan nomor WhatsApp")}</strong></span>
        `;
      };
      linkedSelect.addEventListener("change", updateLinkedPreview);
      updateRoleFields();
    }

    qs("#account-form", modal).addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = qs("#account-modal-submit", modal);
      const values = new FormData(form);
      const payload = { password: values.get("password") };
      if (isReset) {
        payload.userId = values.get("userId");
      } else {
        payload.role = values.get("role");
        if (payload.role === "ADMIN") payload.userId = values.get("adminId");
        else payload.linkedId = values.get("linkedId");
        payload.name = payload.role === "ADMIN" ? values.get("adminName") : "";
      }

      submit.disabled = true;
      submit.textContent = isReset ? "Mereset..." : "Membuat...";
      try {
        const response = isReset ? await API.userReset(payload) : await API.userCreate(payload);
        if (response?.success === false) throw new Error(response.message || "Aksi akun gagal.");
        showToast(response?.message || "Akun berhasil diproses.");
        close();
        await renderSettings(document.getElementById("page-content") || getAppRoot());
      } catch (error) {
        submit.disabled = false;
        submit.textContent = isReset ? "Simpan Password Baru" : "Buat Akun";
        showToast(error.message || "Aksi akun gagal.", "error");
      }
    });
  }


  /*
   * =========================================================
   * FORM MODAL
   * =========================================================
   */

  function openFormModal(
    type,
    existing = null,
    options = {}
  ) {

    const config =
      FORM_CONFIG[type];

    if (!config) {

      showToast(
        "Form belum tersedia.",
        "error"
      );

      return;

    }

    if (type === "salary" && !isAdminUser()) {
      showToast("Payroll hanya dapat dikelola oleh admin.", "error");
      return;
    }


    const old =
      document.getElementById(
        "arima-form-modal"
      );

    if (old) {
      old.remove();
    }


    const isEdit =
      !!existing;


    const formFields = type === "sensei" && !isAdminUser()
      ? config.fields.filter(field => field.key !== "TARIF_PER_JAM")
      : config.fields;

    const fields =
      formFields.map(
        field => {

          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          const defaultValue = type === "salary" && field.key === "PERIOD"
            ? currentMonth
            : type === "finance" && field.key === "DATE"
              ? currentDate
            : type === "salary" && field.key === "PAYMENT_STATUS"
              ? "PENDING"
              : "";
          const rawValue = existing?.[field.key] ?? options.defaults?.[field.key] ?? defaultValue;
          const value = field.type === "date"
            ? String(rawValue || "").slice(0, 10)
            : field.type === "month"
              ? String(rawValue || "").slice(0, 7)
              : rawValue;


          if (type === "salary" && field.key === "ID_SENSEI") {
            const senseiRows = Array.isArray(options.senseiRows) ? options.senseiRows : [];
            return `
              <div class="form-group form-group-wide payroll-sensei-field">
                <label for="payroll-sensei-id">Sensei</label>
                <select id="payroll-sensei-id" name="ID_SENSEI" required>
                  <option value="">Pilih ID Sensei...</option>
                  ${senseiRows.map(row => `
                    <option value="${esc(row.ID_SENSEI)}" ${String(value) === String(row.ID_SENSEI) ? "selected" : ""}>
                      ${esc(row.ID_SENSEI)} · ${esc(row.NAMA || "Tanpa nama")}
                    </option>
                  `).join("")}
                </select>
                <div class="payroll-sensei-preview muted" id="payroll-sensei-preview">Pilih sensei untuk melihat tarif dan ringkasan payroll.</div>
              </div>
            `;
          }

          if (type === "billing" && field.key === "ID_SISWA") {
            const studentRows = Array.isArray(options.studentRows) ? options.studentRows : [];
            const knownIds = studentRows.map(row => String(row.ID_SISWA || "").trim()).filter(Boolean);
            const legacyOption = value && !knownIds.includes(String(value))
              ? `<option value="${esc(value)}" selected>${esc(value)} · Siswa tidak ditemukan</option>`
              : "";
            return `
              <div class="form-group">
                <label for="billing-student-select">ID Siswa <span>*</span></label>
                <select id="billing-student-select" name="ID_SISWA" required>
                  <option value="">Pilih siswa...</option>
                  ${studentRows.filter(row => String(row.ID_SISWA || "").trim()).map(row => `
                    <option value="${esc(row.ID_SISWA)}" ${String(value) === String(row.ID_SISWA) ? "selected" : ""}>
                      ${esc(row.ID_SISWA)} · ${esc(row.NAMA || "Tanpa nama")}
                    </option>
                  `).join("")}
                  ${legacyOption}
                </select>
              </div>
            `;
          }

          if (
            field.type ===
            "select"
          ) {

            return `

              <div class="form-group">

                <label>
                  ${esc(
                    field.label
                  )}

                  ${
                    field.required
                      ? "<span>*</span>"
                      : ""
                  }

                </label>


                <select
                  name="${esc(field.key)}"
                  ${
                    field.required
                      ? "required"
                      : ""
                  }
                >

                  <option value="">
                    Pilih...
                  </option>

                  ${(
                    field.options ||
                    []
                  ).map(
                    option => `

                      <option
                        value="${esc(option)}"
                        ${
                          String(
                            value
                          ) ===
                          String(
                            option
                          )
                            ? "selected"
                            : ""
                        }
                      >
                        ${esc(option)}
                      </option>

                    `
                  ).join("")}

                </select>

              </div>

            `;

          }


          if (
            field.type ===
            "textarea"
          ) {

            return `

              <div class="form-group">

                <label>
                  ${esc(
                    field.label
                  )}

                  ${
                    field.required
                      ? "<span>*</span>"
                      : ""
                  }

                </label>


                <textarea
                  name="${esc(field.key)}"
                  placeholder="${esc(
                    field.placeholder ||
                    ""
                  )}"
                  ${
                    field.required
                      ? "required"
                      : ""
                  }
                >${esc(
                  value
                )}</textarea>

              </div>

            `;

          }


          return `

            <div class="form-group">

              <label>

                ${esc(
                  field.label
                )}

                ${
                  field.required
                    ? "<span>*</span>"
                    : ""
                }

              </label>


              <input
                type="${esc(
                  field.type ||
                  "text"
                )}"
                name="${esc(
                  field.key
                )}"
                value="${esc(
                  value
                )}"
                placeholder="${esc(
                  field.placeholder ||
                  ""
                )}"
                ${
                  field.required
                    ? "required"
                    : ""
                }
              />

            </div>

          `;

        }
      ).join("");


    const modal =
      document.createElement(
        "div"
      );

    modal.id =
      "arima-form-modal";

    modal.className =
      `modal-overlay form-modal ${type}-form-modal`;


    modal.innerHTML = `

      <div
        class="modal form-modal-shell"
        role="dialog"
        aria-modal="true"
      >

        <div class="form-modal-header">

          <div class="form-modal-heading">

            <span class="form-modal-kicker">ARIMA MANAGEMENT SYSTEM</span>

            <h2>
              ${esc(
                isEdit
                  ? config.editTitle
                  : config.title
              )}
            </h2>

            <p>${esc(config.description || "Lengkapi data yang diperlukan.")}</p>

          </div>


          <button
            type="button"
            class="modal-close"
            id="modal-close"
          >
            ×
          </button>

        </div>


        <form
          id="arima-form"
          class="form-grid form-modal-fields"
        >

          ${fields}


          <div class="modal-footer form-modal-footer">

            <button
              type="button"
              class="btn"
              id="modal-cancel"
            >
              Batal
            </button>


            <button
              type="submit"
              class="btn btn-primary"
              id="modal-submit"
            >
              ${
                isEdit
                  ? "Simpan Perubahan"
                  : "Simpan"
              }
            </button>

          </div>

        </form>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    function close() {

      modal.remove();

    }


    qs(
      "#modal-close",
      modal
    )?.addEventListener(
      "click",
      close
    );


    qs(
      "#modal-cancel",
      modal
    )?.addEventListener(
      "click",
      close
    );


    modal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          modal
        ) {

          close();

        }

      }
    );


    const form =
      qs(
        "#arima-form",
        modal
      );

    if (type === "salary") {
      const senseiSelect = qs("#payroll-sensei-id", modal);
      const periodInput = form?.elements.PERIOD;
      const bonusInput = form?.elements.BONUS;
      const deductionInput = form?.elements.DEDUCTION;
      const preview = qs("#payroll-sensei-preview", modal);
      let previewRequest = 0;

      const refreshPayrollPreview = async () => {
        const requestId = ++previewRequest;
        const selectedSensei = (options.senseiRows || []).find(
          row => String(row.ID_SENSEI) === String(senseiSelect?.value || "")
        );

        if (!selectedSensei) {
          preview.innerHTML = "Pilih sensei untuk melihat tarif dan ringkasan payroll.";
          return;
        }

        const profile = `
          <div class="payroll-profile-line">
            <strong>${esc(selectedSensei.NAMA || "Tanpa nama")}</strong>
            <span>${esc(selectedSensei.ID_SENSEI)}</span>
          </div>
          <div class="payroll-rate-line">Tarif: ${formatRupiah(selectedSensei.TARIF_PER_JAM || 0)} / JP</div>
        `;

        if (!periodInput?.value) {
          preview.innerHTML = profile + `<div class="muted">Pilih periode untuk menghitung payroll.</div>`;
          return;
        }

        preview.innerHTML = profile + `<div class="muted">Menghitung dari absensi...</div>`;
        try {
          const response = await API.salaryPreview({
            ID_SENSEI: senseiSelect.value,
            PERIOD: periodInput.value,
            BONUS: bonusInput?.value || "0",
            DEDUCTION: deductionInput?.value || "0"
          });
          if (requestId !== previewRequest) return;
          if (!response?.success) {
            preview.innerHTML = profile + `<div class="payroll-preview-warning">${esc(response?.message || "Payroll belum dapat dihitung.")}</div>`;
            return;
          }

          const summary = response.data || {};
          preview.innerHTML = profile + `
            <div class="payroll-preview-stats">
              <span>${formatNumber(summary.MEETING_COUNT)} pertemuan</span>
              <span>${formatNumber(summary.HOUR_COUNT)} JP</span>
              <strong>${formatRupiah(summary.NET_SALARY)} estimasi bersih</strong>
            </div>
          `;
        } catch (error) {
          if (requestId === previewRequest) {
            preview.innerHTML = profile + `<div class="payroll-preview-warning">${esc(error.message || "Gagal memuat ringkasan payroll.")}</div>`;
          }
        }
      };

      senseiSelect?.addEventListener("change", refreshPayrollPreview);
      periodInput?.addEventListener("change", refreshPayrollPreview);
      bonusInput?.addEventListener("input", refreshPayrollPreview);
      deductionInput?.addEventListener("input", refreshPayrollPreview);
      refreshPayrollPreview();
    }


    form?.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const submit =
          qs(
            "#modal-submit",
            modal
          );

        if (submit) {

          submit.disabled =
            true;

          submit.textContent =
            "Menyimpan...";

        }


        try {

          const formData =
            new FormData(
              form
            );

          const payload =
            {};


          formFields.forEach(
            field => {

              payload[
                field.key
              ] =
                formData.get(
                  field.key
                ) || "";

            }
          );

          if (existing?.__ROW_NUMBER) {
            payload.__ROW_NUMBER = existing.__ROW_NUMBER;
          }


          let response;


          if (isEdit) {

            response =
              await API.update(
                type,
                payload
              );

          } else {

            response =
              await API.create(
                type,
                payload
              );

          }


          if (
            response &&
            response.success === false
          ) {

            throw new Error(
              response.message ||
              "Gagal menyimpan data."
            );

          }


          showToast(
            isEdit
              ? "Data berhasil diperbarui."
              : "Data berhasil ditambahkan."
          );


          close();

          if (type === "billing") {
            const url = new URL(window.location.href);
            if (payload.ID_SISWA) url.searchParams.set("studentId", payload.ID_SISWA);
            window.history.replaceState({}, "", url);
          }

          await load(
            type
          );


        } catch (error) {

          showToast(
            error.message ||
            "Gagal menyimpan data.",
            "error"
          );


          if (submit) {

            submit.disabled =
              false;

            submit.textContent =
              isEdit
                ? "Simpan Perubahan"
                : "Simpan";

          }

        }

      }
    );

  }


  /*
   * =========================================================
   * INIT
   * =========================================================
   */

  async function init() {

    console.log(
      "ARIMA MANAGEMENT SYSTEM initializing..."
    );


    if (
      !requireAuth()
    ) {

      return;

    }


    renderLayout();


    await load(
      "dashboard"
    );

  }


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  return {

    init,

    load,

    logout,

    renderDashboard,

    renderStudents,

    renderSensei,

    renderAttendance,

    renderBilling,

    renderFinance,

    renderSalary,

    renderReports,

    renderSettings

  };

})();
