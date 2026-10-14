/**
 * ARIMA MANAGEMENT SYSTEM — PDF MODULE
 * =====================================
 * Menyediakan helper PDF profesional untuk:
 *  - Kuitansi pembayaran (PAYMENTS)
 *  - Surat tagihan siswa (BILLING)
 *  - Slip gaji sensei (SALARY)
 *
 * Dependency: jsPDF 2.5.2 (dimuat otomatis dari CDN saat pertama dipakai).
 * Semua fungsi publik diakses via window.ArimaPdf.
 */
window.ArimaPdf = (() => {
  "use strict";

  /* =========================================================
   * KONSTANTA
   * ========================================================= */

  const COLOR = {
    accent:  [215, 25, 32],
    dark:    [34, 34, 38],
    body:    [75, 75, 80],
    muted:   [140, 140, 148],
    light:   [247, 248, 250],
    zebra:   [249, 249, 251],
    border:  [228, 229, 233],
    line:    [235, 236, 240]
  };

  const MARGIN = 18;
  const HEADER_HEIGHT = 56;
  const FOOTER_OFFSET = 22;    // jarak footer dari bawah halaman

  const COMPANY = {
    name:    "LPKS ARIMA PERSADA",
    address: "Jl. Sidoharjo 1, Desa Negara Ratu, Kec. Natar, Kab. Lampung Selatan",
    phones:  "Telp/WA: 0813-7908-7768 · 0812-8267-4707 · 0823-7512-8230",
    email:   "Email: arimapersada@gmail.com",
    city:    "Lampung Selatan"
  };


  /* =========================================================
   * LOADER (jsPDF + logo)
   * ========================================================= */

  let __pdfLibPromise = null;
  function ensurePdfLibrary() {
    if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (!__pdfLibPromise) {
      __pdfLibPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js";
        script.onload = () => {
          if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
          else reject(new Error("Library PDF tidak tersedia setelah dimuat."));
        };
        script.onerror = () => reject(new Error("Library PDF tidak dapat dimuat. Periksa koneksi internet."));
        document.head.appendChild(script);
      });
    }
    return __pdfLibPromise;
  }

  let __logoPromise = null;
  function getLogoData() {
    if (!__logoPromise) {
      __logoPromise = new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (err) {
            reject(new Error("Logo tidak dapat diproses: " + err.message));
          }
        };
        image.onerror = () => reject(new Error("Logo LPKS Arima Persada tidak dapat dimuat."));
        image.src = new URL("assets/logo.webp", document.baseURI).href;
      });
    }
    return __logoPromise;
  }


  /* =========================================================
   * UTILITAS
   * ========================================================= */

  function formatRupiah(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number.isFinite(number) ? number : 0);
  }

  function formatNumber(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat("id-ID").format(Number.isFinite(number) ? number : 0);
  }

  function dateText(value) {
    const text = String(value || "");
    return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : text;
  }

  function monthLabel(period) {
    const p = String(period || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(p)) return p || "-";
    return new Date(p + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }

  function terbilang(value) {
    const units = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    const say = n => {
      n = Math.floor(n);
      if (n < 12) return units[n];
      if (n < 20) return `${say(n - 10)} belas`;
      if (n < 100) return `${say(n / 10)} puluh${n % 10 ? ` ${say(n % 10)}` : ""}`;
      if (n < 200) return `seratus${n - 100 ? ` ${say(n - 100)}` : ""}`;
      if (n < 1000) return `${say(n / 100)} ratus${n % 100 ? ` ${say(n % 100)}` : ""}`;
      if (n < 2000) return `seribu${n - 1000 ? ` ${say(n - 1000)}` : ""}`;
      if (n < 1e6) return `${say(n / 1000)} ribu${n % 1000 ? ` ${say(n % 1000)}` : ""}`;
      if (n < 1e9) return `${say(n / 1e6)} juta${n % 1e6 ? ` ${say(n % 1e6)}` : ""}`;
      if (n < 1e12) return `${say(n / 1e9)} miliar${n % 1e9 ? ` ${say(n % 1e9)}` : ""}`;
      return String(n);
    };
    const number = Math.round(Number(value) || 0);
    if (number <= 0) return "nol rupiah";
    return `${say(number)} rupiah`;
  }

  function capitalize(text) {
    return String(text || "").replace(/^./, c => c.toUpperCase());
  }

  function safeFileName(text) {
    return String(text || "dokumen").replace(/[^A-Za-z0-9_-]/g, "-");
  }


  /* =========================================================
   * GAMBAR KOMPONEN PDF
   * ========================================================= */

  function drawHeader(pdf, opts = {}) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const accent = opts.accent || COLOR.accent;

    pdf.setFillColor(...COLOR.light);
    pdf.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

    pdf.setFillColor(...accent);
    pdf.rect(0, HEADER_HEIGHT, pageWidth, 1.2, "F");

    if (opts.logoData) {
      try {
        pdf.addImage(opts.logoData, "PNG", MARGIN, 14, 26, 26);
      } catch (_) { /* lanjut tanpa logo */ }
    }

    pdf.setTextColor(...COLOR.dark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(COMPANY.name, MARGIN + 32, 22);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(115, 115, 122);
    pdf.text(COMPANY.address, MARGIN + 32, 29);
    pdf.text(COMPANY.phones, MARGIN + 32, 34.5);
    pdf.text(COMPANY.email, MARGIN + 32, 40);

    if (opts.documentType) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...accent);
      pdf.text(opts.documentType, pageWidth - MARGIN, 22, { align: "right" });
    }
    if (opts.documentNumber) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(115, 115, 122);
      pdf.text(opts.documentNumber, pageWidth - MARGIN, 29, { align: "right" });
    }
    if (opts.documentDate) {
      pdf.text(opts.documentDate, pageWidth - MARGIN, 34.5, { align: "right" });
    }

    return 68; // Y awal konten
  }

  function drawInfoBox(pdf, x, y, width, height, title, lines) {
    pdf.setFillColor(...COLOR.light);
    pdf.roundedRect(x, y, width, height, 2, 2, "F");
    pdf.setDrawColor(...COLOR.border);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, width, height, 2, 2, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(title, x + 6, y + 7);

    pdf.setFont("helvetica", "normal");
    let ly = y + 14;
    lines.forEach((line, idx) => {
      if (idx === 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...COLOR.dark);
        pdf.text(String(line), x + 6, ly);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        ly += 6;
      } else {
        pdf.setTextColor(90, 90, 96);
        pdf.text(String(line), x + 6, ly);
        ly += 5;
      }
    });
  }

  function drawItemsTable(pdf, x, y, width, headers, rows, colWidths) {
    const rowHeight = 8.5;
    const headerHeight = 9.5;
    const accent = COLOR.accent;

    // Header tabel
    pdf.setFillColor(...accent);
    pdf.rect(x, y, width, headerHeight, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);

    let cx = x + 4;
    headers.forEach((h, i) => {
      if (i === headers.length - 1) {
        pdf.text(h, x + width - 4, y + 6.3, { align: "right" });
      } else {
        pdf.text(h, cx, y + 6.3);
      }
      cx += colWidths[i];
    });

    // Baris data
    let ry = y + headerHeight;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    rows.forEach((row, idx) => {
      if (idx % 2 === 1) {
        pdf.setFillColor(...COLOR.zebra);
        pdf.rect(x, ry, width, rowHeight, "F");
      }
      let rx = x + 4;
      row.forEach((cell, i) => {
        pdf.setTextColor(50, 50, 55);
        if (i === row.length - 1) {
          pdf.text(String(cell ?? ""), x + width - 4, ry + 5.8, { align: "right" });
        } else {
          pdf.text(String(cell ?? ""), rx, ry + 5.8);
        }
        rx += colWidths[i];
      });
      ry += rowHeight;
      pdf.setDrawColor(...COLOR.line);
      pdf.setLineWidth(0.2);
      pdf.line(x, ry, x + width, ry);
    });

    // Outline
    pdf.setDrawColor(...COLOR.border);
    pdf.setLineWidth(0.3);
    pdf.rect(x, y, width, headerHeight + rows.length * rowHeight, "S");

    return ry;
  }

  function drawTotalBox(pdf, x, y, width, label, value, accentColor = COLOR.accent) {
    pdf.setFillColor(...COLOR.light);
    pdf.roundedRect(x, y, width, 22, 2, 2, "F");
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(0.8);
    pdf.roundedRect(x, y, width, 22, 2, 2, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...COLOR.body);
    pdf.text(label, x + 7, y + 14);

    pdf.setFontSize(15);
    pdf.setTextColor(...accentColor);
    pdf.text(value, x + width - 7, y + 15, { align: "right" });
  }

  function drawStatusRow(pdf, x, y, label, value, bold = true) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLOR.body);
    pdf.text(label, x, y);

    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setTextColor(...COLOR.dark);
    const labelWidth = pdf.getTextWidth(label);
    pdf.text(String(value || "-"), x + labelWidth + 1.5, y);
  }

  /**
   * Blok tanda tangan: Nama → Garis → Jabatan
   * Input name bisa "Nama - Jabatan" atau hanya "Nama".
   */
  function drawSignatureBlock(pdf, x, y, city, role, name) {
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });

    const raw = String(name || "").trim();
    let personName = raw;
    let personRole = "";
    const sepIdx = raw.lastIndexOf(" - ");
    if (sepIdx > 0) {
      personName = raw.slice(0, sepIdx).trim();
      personRole = raw.slice(sepIdx + 3).trim();
    }

    const blockWidth = 60;

    // Baris 1: Kota, tanggal
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLOR.body);
    pdf.text(`${city}, ${today}`, x, y);

    // Baris 2: "Hormat kami,"
    pdf.text(role || "", x, y + 5);

    // Ruang tanda tangan kosong, lalu nama
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...COLOR.dark);
    pdf.text(personName || "-", x, y + 24);

    // Garis tanda tangan
    pdf.setDrawColor(120, 120, 125);
    pdf.setLineWidth(0.3);
    pdf.line(x, y + 26.5, x + blockWidth, y + 26.5);

    // Jabatan di bawah garis
    if (personRole) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(personRole, x, y + 31);
    }

    return y + 31; // Y akhir block
  }

  /**
   * Footer di bottom halaman.
   */
  function drawFooter(pdf, note) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const footerTop = pageHeight - FOOTER_OFFSET;

    pdf.setDrawColor(...COLOR.border);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, footerTop, pageWidth - MARGIN, footerTop);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLOR.muted);
    const lines = pdf.splitTextToSize(note, pageWidth - MARGIN * 2);
    pdf.text(lines, MARGIN, footerTop + 5);
  }


  /* =========================================================
   * FUNGSI PUBLIK 1 — KUITANSI PEMBAYARAN
   * ========================================================= */

  async function buildReceipt(payment, student) {
    const JsPDF = await ensurePdfLibrary();
    const logoData = await getLogoData();

    const pdf = new JsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const inner = pageWidth - MARGIN * 2;

    let y = drawHeader(pdf, {
      logoData,
      documentType: "KUITANSI PEMBAYARAN",
      documentNumber: "No: " + (payment.PAYMENT_ID || "-"),
      documentDate: "Tanggal: " + (dateText(payment.PAYMENT_DATE) || "-")
    });

    // Info siswa
    drawInfoBox(pdf, MARGIN, y, inner, 34, "DITERIMA DARI", [
      (student && student.NAMA) || "-",
      "ID Siswa: " + (payment.ID_SISWA || "-"),
      "WhatsApp: " + ((student && student.NO_WA) || "-"),
      "Tagihan: " + (payment.BILLING_ID || "-")
    ]);
    y += 44;

    // Tabel rincian
    y = drawItemsTable(
      pdf, MARGIN, y, inner,
      ["Keterangan", "Metode", "Penerima", "Jumlah"],
      [[
        payment.NOTES || ("Pembayaran tagihan " + (payment.BILLING_ID || "-")),
        payment.PAYMENT_METHOD || "-",
        payment.REFERENCE_NO || "-",
        formatRupiah(payment.AMOUNT)
      ]],
      [inner * 0.55, inner * 0.15, inner * 0.15, inner * 0.15]
    );
    y += 10;

    // Terbilang
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(90, 90, 96);
    const terbilangText = "Terbilang: " + capitalize(terbilang(payment.AMOUNT));
    pdf.text(pdf.splitTextToSize(terbilangText, inner), MARGIN, y);
    y += 12;

    // Total
    drawTotalBox(pdf, MARGIN, y, inner, "TOTAL DITERIMA", formatRupiah(payment.AMOUNT));
    y += 22 + 24; // tinggi box + spacing ke TTD

    // Tanda tangan (kanan bawah)
    const receiptSigner = String(payment.REFERENCE_NO || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pageWidth - MARGIN - 60, y, COMPANY.city, "Hormat kami,", receiptSigner);

    // Footer (bottom halaman)
    drawFooter(pdf,
      "Kuitansi ini sah sebagai bukti pembayaran yang tercatat di sistem LPKS Arima Persada. " +
      "Pembayaran yang sudah tercatat otomatis tersinkron dengan mutasi keuangan."
    );

    const fileName = `kuitansi-${safeFileName(payment.PAYMENT_ID || "pembayaran")}.pdf`;
    return { pdf, fileName };
  }


  /* =========================================================
   * FUNGSI PUBLIK 2 — SURAT TAGIHAN SISWA
   * ========================================================= */

  async function buildInvoice(invoice, student) {
    const JsPDF = await ensurePdfLibrary();
    const logoData = await getLogoData();

    const pdf = new JsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const inner = pageWidth - MARGIN * 2;

    let y = drawHeader(pdf, {
      logoData,
      documentType: "SURAT TAGIHAN",
      documentNumber: "No: " + (invoice.BILLING_ID || "-"),
      documentDate: "Dicetak: " + new Date().toLocaleDateString("id-ID")
    });

    // Info siswa
    drawInfoBox(pdf, MARGIN, y, inner, 34, "DITAGIHKAN KEPADA", [
      (student && student.NAMA) || "-",
      "ID Siswa: " + (invoice.ID_SISWA || "-"),
      "WhatsApp: " + ((student && student.NO_WA) || "-"),
      "Program: " + ((student && student.PROGRAM) || "-")
    ]);
    y += 44;

    // Tabel rincian
    y = drawItemsTable(
      pdf, MARGIN, y, inner,
      ["Deskripsi", "Kategori", "Jatuh Tempo", "Jumlah"],
      [[
        invoice.DESCRIPTION || "-",
        invoice.CATEGORY || "-",
        dateText(invoice.DUE_DATE) || "-",
        formatRupiah(invoice.AMOUNT)
      ]],
      [inner * 0.5, inner * 0.18, inner * 0.16, inner * 0.16]
    );
    y += 10;

    // Status
    drawStatusRow(pdf, MARGIN, y, "Status tagihan: ", invoice.STATUS || "-");
    y += 6;

    // Penerima
    if (invoice.PENERIMA) {
      drawStatusRow(pdf, MARGIN, y, "Penerima: ", invoice.PENERIMA);
      y += 6;
    }
    y += 6;

    // Terbilang
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(90, 90, 96);
    const terbilangText = "Terbilang: " + capitalize(terbilang(invoice.AMOUNT));
    pdf.text(pdf.splitTextToSize(terbilangText, inner), MARGIN, y);
    y += 12;

    // Total
    drawTotalBox(pdf, MARGIN, y, inner, "TOTAL TAGIHAN", formatRupiah(invoice.AMOUNT));
    y += 22 + 12;

    // Catatan (jika ada)
    if (invoice.NOTES) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("CATATAN", MARGIN, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.body);
      const noteLines = pdf.splitTextToSize(String(invoice.NOTES), inner);
      pdf.text(noteLines, MARGIN, y + 5);
      y += 5 + noteLines.length * 4 + 8;
    } else {
      y += 12;
    }

    // Tanda tangan (kanan bawah)
    const invoiceSigner = String(invoice.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pageWidth - MARGIN - 60, y, COMPANY.city, "Hormat kami,", invoiceSigner);

    // Footer (bottom halaman)
    drawFooter(pdf,
      "Mohon melakukan pembayaran sebelum tanggal jatuh tempo. Apabila terdapat kendala pembayaran " +
      "atau membutuhkan informasi lebih lanjut, silakan menghubungi Pak Suwardi (0813-7908-7768), " +
      "Sensei Rachmat (0812-8267-4707), atau Admin LPKS Arima Persada (0823-7512-8230)."
    );

    const fileName = `tagihan-${safeFileName(invoice.BILLING_ID || invoice.ID_SISWA)}.pdf`;
    return { pdf, fileName };
  }


  /* =========================================================
   * FUNGSI PUBLIK 3 — SLIP GAJI SENSEI
   * ========================================================= */

  async function buildSalarySlip(salaryRow, senseiRow) {
    const JsPDF = await ensurePdfLibrary();
    const logoData = await getLogoData();

    const pdf = new JsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const inner = pageWidth - MARGIN * 2;

    const period = monthLabel(salaryRow.PERIOD);

    let y = drawHeader(pdf, {
      logoData,
      documentType: "SLIP GAJI",
      documentNumber: "No: " + (salaryRow.SALARY_ID || "-"),
      documentDate: "Periode: " + period
    });

    // Info sensei
    drawInfoBox(pdf, MARGIN, y, inner, 34, "DIBERIKAN KEPADA", [
      (senseiRow && senseiRow.NAMA) || "Sensei",
      "ID Sensei: " + (salaryRow.ID_SENSEI || "-"),
      "Email: " + ((senseiRow && senseiRow.EMAIL) || "-"),
      "WhatsApp: " + ((senseiRow && senseiRow.NO_WA) || "-")
    ]);
    y += 44;

    // Hitung komponen
    const baseAmount = Number(salaryRow.BASE_AMOUNT || 0);
    const bonus = Number(salaryRow.BONUS || 0);
    const transport = Number(salaryRow.TRANSPORT || 0);
    const deduction = Number(salaryRow.DEDUCTION || 0);
    const netSalary = Number(salaryRow.NET_SALARY || 0);
    const rate = Number((senseiRow && senseiRow.TARIF_PER_JAM) || 0);
    const jp = Number(salaryRow.HOUR_COUNT || 0);
    const meetings = Number(salaryRow.MEETING_COUNT || 0);

    // Tabel komponen
    y = drawItemsTable(
      pdf, MARGIN, y, inner,
      ["Komponen", "Jumlah"],
      [
        [`Gaji pokok (${formatNumber(jp)} JP × ${formatRupiah(rate)})`, formatRupiah(baseAmount)],
        ["Jumlah pertemuan tercatat", `${formatNumber(meetings)} pertemuan`],
        ["Bonus", formatRupiah(bonus)],
        ["Transport", formatRupiah(transport)],
        ["Potongan", "- " + formatRupiah(deduction)]
      ],
      [inner * 0.65, inner * 0.35]
    );
    y += 10;

    // Terbilang
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(90, 90, 96);
    const terbilangText = "Terbilang: " + capitalize(terbilang(netSalary));
    pdf.text(pdf.splitTextToSize(terbilangText, inner), MARGIN, y);
    y += 12;

    // Total gaji bersih
    drawTotalBox(pdf, MARGIN, y, inner, "GAJI BERSIH DITERIMA", formatRupiah(netSalary));
    y += 22 + 10;

    // Status pembayaran
    drawStatusRow(pdf, MARGIN, y, "Status pembayaran: ", salaryRow.PAYMENT_STATUS || "-");
    if (salaryRow.PAYMENT_DATE) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLOR.body);
      pdf.text("Tanggal bayar: ", pageWidth / 2, y);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLOR.dark);
      pdf.text(dateText(salaryRow.PAYMENT_DATE), pageWidth / 2 + 24, y);
    }
    y += 12;

    // Catatan (jika ada)
    if (salaryRow.NOTES) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("CATATAN", MARGIN, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.body);
      const noteLines = pdf.splitTextToSize(String(salaryRow.NOTES), inner);
      pdf.text(noteLines, MARGIN, y + 5);
      y += 5 + noteLines.length * 4 + 8;
    } else {
      y += 8;
    }

    // Tanda tangan (kanan bawah)
    const salarySigner = String(salaryRow.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pageWidth - MARGIN - 60, y, COMPANY.city, "Hormat kami,", salarySigner);

    // Footer (bottom halaman)
    drawFooter(pdf,
      "Slip gaji ini dihasilkan otomatis dari sistem ARIMA MANAGEMENT SYSTEM. " +
      "Perhitungan JP berdasarkan absensi mengajar sensei (1 JP = 45 menit, di luar waktu istirahat " +
      "10.00–10.15 dan 12.00–13.15). Simpan dokumen ini sebagai bukti resmi penerimaan gaji."
    );

    const fileName = `slip-gaji-${safeFileName(salaryRow.SALARY_ID || "sensei")}.pdf`;
    return { pdf, fileName };
  }


  /* =========================================================
   * FUNGSI BANTUAN LAIN
   * ========================================================= */

  function pdfToBase64(pdf) {
    const dataUri = pdf.output("datauristring");
    const commaIndex = dataUri.indexOf(",");
    return commaIndex >= 0 ? dataUri.slice(commaIndex + 1) : dataUri;
  }


  /* =========================================================
   * PUBLIC API
   * ========================================================= */

  return {
    buildReceipt,
    buildInvoice,
    buildSalarySlip,
    pdfToBase64,
    ensurePdfLibrary,
    formatRupiah,
    formatNumber,
    terbilang
  };

})();
