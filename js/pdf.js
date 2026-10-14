/**
 * ARIMA MANAGEMENT SYSTEM — PDF MODULE
 * Design: Elegant black-dominant with subtle red accent
 * =====================================
 * Menyediakan helper PDF profesional untuk:
 *  - Kuitansi pembayaran (PAYMENTS)
 *  - Surat tagihan siswa (BILLING)
 *  - Slip gaji sensei (SALARY)
 *
 * Dependency: jsPDF 2.5.2 (dimuat otomatis dari CDN saat pertama dipakai).
 */
window.ArimaPdf = (() => {
  "use strict";

  /* =========================================================
   * PALET WARNA — DOMINAN HITAM
   * ========================================================= */

  const COLOR = {
    black:   [17, 17, 19],
    ink:     [30, 30, 34],
    body:    [75, 75, 80],
    muted:   [140, 140, 148],
    subtle:  [200, 200, 205],
    light:   [247, 248, 250],
    zebra:   [250, 250, 252],
    border:  [228, 229, 233],
    line:    [235, 236, 240],
    accent:  [215, 25, 32],
    white:   [255, 255, 255]
  };

  const MARGIN = 18;
  const HEADER_HEIGHT = 44;    // kompak (dari 56 → 44)
  const FOOTER_OFFSET = 18;

  const COMPANY = {
    name:    "LPKS ARIMA PERSADA",
    address: "Jl. Sidoharjo 1, Negara Ratu, Natar, Lampung Selatan",
    phones:  "0813-7908-7768  ·  0812-8267-4707",
    email:   "arimapersada@gmail.com",
    city:    "Lampung Selatan"
  };


  /* =========================================================
   * LOADER
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
        script.onerror = () => reject(new Error("Library PDF tidak dapat dimuat."));
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
            canvas.getContext("2d").drawImage(image, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (err) { reject(err); }
        };
        image.onerror = () => reject(new Error("Logo gagal dimuat."));
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
      style: "currency", currency: "IDR", maximumFractionDigits: 0
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

  function dateLong(value) {
    const text = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}/.test(text)) return text || "-";
    const d = new Date(text.slice(0, 10) + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
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
   * KOMPONEN PDF
   * ========================================================= */

  /**
   * Header kompak & elegan: logo kecil, nama perusahaan besar hitam,
   * dokumen type di kanan, garis bawah hitam tebal + aksen merah tipis.
   */
  function drawHeader(pdf, opts = {}) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Logo (kiri, kecil)
    if (opts.logoData) {
      try {
        pdf.addImage(opts.logoData, "PNG", MARGIN, 10, 22, 22);
      } catch (_) {}
    }

    // Nama perusahaan (kiri)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...COLOR.black);
    pdf.text(COMPANY.name, MARGIN + 28, 17);

    // Alamat & kontak (2 baris, small)
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(COMPANY.address, MARGIN + 28, 23);
    pdf.text(`${COMPANY.phones}  ·  ${COMPANY.email}`, MARGIN + 28, 28);

    // Dokumen type (kanan atas, UPPERCASE, letter-spacing feel)
    if (opts.documentType) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLOR.black);
      pdf.text(opts.documentType, pageWidth - MARGIN, 17, { align: "right" });
    }
    if (opts.documentNumber) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(opts.documentNumber, pageWidth - MARGIN, 23, { align: "right" });
    }
    if (opts.documentDate) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(opts.documentDate, pageWidth - MARGIN, 28, { align: "right" });
    }

    // Garis bawah header: hitam tebal + aksen merah tipis
    pdf.setFillColor(...COLOR.black);
    pdf.rect(0, HEADER_HEIGHT, pageWidth, 0.8, "F");
    pdf.setFillColor(...COLOR.accent);
    pdf.rect(0, HEADER_HEIGHT + 0.8, pageWidth, 0.35, "F");

    return HEADER_HEIGHT + 8; // mulai konten di 52mm
  }

  /**
   * Kotak info dengan border kiri hitam tebal.
   */
  function drawInfoBox(pdf, x, y, width, height, title, lines) {
    // Border kiri hitam
    pdf.setFillColor(...COLOR.black);
    pdf.rect(x, y, 1.2, height, "F");

    // Background sangat light
    pdf.setFillColor(...COLOR.light);
    pdf.rect(x + 1.2, y, width - 1.2, height, "F");

    // Title kecil muted uppercase
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(title, x + 7, y + 6.5);

    // Isi
    let ly = y + 13;
    lines.forEach((line, idx) => {
      if (idx === 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(...COLOR.black);
        pdf.text(String(line), x + 7, ly);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        ly += 5.5;
      } else {
        pdf.setTextColor(...COLOR.body);
        pdf.text(String(line), x + 7, ly);
        ly += 4.5;
      }
    });
  }

  /**
   * Tabel dengan header HITAM (bukan merah).
   */
  function drawItemsTable(pdf, x, y, width, headers, rows, colWidths) {
    const rowHeight = 8;
    const headerHeight = 8.5;

    // Header hitam
    pdf.setFillColor(...COLOR.black);
    pdf.rect(x, y, width, headerHeight, "F");
    pdf.setTextColor(...COLOR.white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    let cx = x + 4;
    headers.forEach((h, i) => {
      if (i === headers.length - 1) {
        pdf.text(h, x + width - 4, y + 5.7, { align: "right" });
      } else {
        pdf.text(h, cx, y + 5.7);
      }
      cx += colWidths[i];
    });

    // Baris data
    let ry = y + headerHeight;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    rows.forEach((row, idx) => {
      if (idx % 2 === 1) {
        pdf.setFillColor(...COLOR.zebra);
        pdf.rect(x, ry, width, rowHeight, "F");
      }
      let rx = x + 4;
      row.forEach((cell, i) => {
        pdf.setTextColor(...COLOR.ink);
        if (i === row.length - 1) {
          pdf.text(String(cell ?? ""), x + width - 4, ry + 5.5, { align: "right" });
        } else {
          pdf.text(String(cell ?? ""), rx, ry + 5.5);
        }
        rx += colWidths[i];
      });
      ry += rowHeight;
      pdf.setDrawColor(...COLOR.line);
      pdf.setLineWidth(0.15);
      pdf.line(x, ry, x + width, ry);
    });

    // Outline
    pdf.setDrawColor(...COLOR.border);
    pdf.setLineWidth(0.25);
    pdf.rect(x, y, width, headerHeight + rows.length * rowHeight, "S");

    return ry;
  }

  /**
   * Kotak total: HITAM pekat dengan label putih & value putih/merah.
   */
  function drawTotalBox(pdf, x, y, width, label, value, accentValue = true) {
    pdf.setFillColor(...COLOR.black);
    pdf.roundedRect(x, y, width, 20, 1.5, 1.5, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLOR.white);
    pdf.text(label, x + 8, y + 13);

    pdf.setFontSize(14);
    if (accentValue) {
      pdf.setTextColor(255, 90, 90);   // merah cerah untuk kontras di hitam
    } else {
      pdf.setTextColor(...COLOR.white);
    }
    pdf.text(value, x + width - 8, y + 13, { align: "right" });
  }

  function drawStatusRow(pdf, x, y, label, value) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(label, x, y);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...COLOR.black);
    const labelWidth = pdf.getTextWidth(label);
    pdf.text(String(value || "-"), x + labelWidth + 1.5, y);
  }

  /**
   * Blok tanda tangan: kota/tanggal → "Hormat kami," italic → nama → garis → jabatan.
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

    const blockWidth = 55;

    // Kota, tanggal
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(`${city}, ${today}`, x, y);

    // "Hormat kami," italic
    pdf.setFont("helvetica", "italic");
    pdf.text(role || "", x, y + 4.5);

    // Nama (bold hitam)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...COLOR.black);
    pdf.text(personName || "-", x, y + 22);

    // Garis hitam
    pdf.setDrawColor(...COLOR.black);
    pdf.setLineWidth(0.4);
    pdf.line(x, y + 24, x + blockWidth, y + 24);

    // Jabatan
    if (personRole) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(personRole, x, y + 28.5);
    }
  }

  /**
   * Footer elegan: garis hitam tipis + teks kecil.
   */
  function drawFooter(pdf, note) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const footerTop = pageHeight - FOOTER_OFFSET;

    pdf.setDrawColor(...COLOR.black);
    pdf.setLineWidth(0.4);
    pdf.line(MARGIN, footerTop, pageWidth - MARGIN, footerTop);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLOR.muted);
    const lines = pdf.splitTextToSize(note, pageWidth - MARGIN * 2);
    pdf.text(lines, MARGIN, footerTop + 4.5);
  }


  /* =========================================================
   * KUITANSI PEMBAYARAN
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
      documentDate: "Tanggal: " + (dateLong(payment.PAYMENT_DATE))
    });

    // Info siswa
    drawInfoBox(pdf, MARGIN, y, inner, 32, "DITERIMA DARI", [
      (student && student.NAMA) || "-",
      "ID Siswa: " + (payment.ID_SISWA || "-"),
      "WhatsApp: " + ((student && student.NO_WA) || "-"),
      "Tagihan: " + (payment.BILLING_ID || "-")
    ]);
    y += 40;

    // Tabel
    y = drawItemsTable(
      pdf, MARGIN, y, inner,
      ["KETERANGAN", "METODE", "PENERIMA", "JUMLAH"],
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
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.body);
    pdf.text(pdf.splitTextToSize("Terbilang: " + capitalize(terbilang(payment.AMOUNT)), inner), MARGIN, y);
    y += 12;

    // Total
    drawTotalBox(pdf, MARGIN, y, inner, "TOTAL DITERIMA", formatRupiah(payment.AMOUNT));
    y += 20 + 28;

    // TTD
    const receiptSigner = String(payment.REFERENCE_NO || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pageWidth - MARGIN - 60, y, COMPANY.city, "Hormat kami,", receiptSigner);

    // Footer
    drawFooter(pdf,
      "Kuitansi ini sah sebagai bukti pembayaran yang tercatat di sistem LPKS Arima Persada. " +
      "Pembayaran yang sudah tercatat otomatis tersinkron dengan mutasi keuangan."
    );

    return { pdf, fileName: `kuitansi-${safeFileName(payment.PAYMENT_ID || "pembayaran")}.pdf` };
  }


  /* =========================================================
   * SURAT TAGIHAN SISWA
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
    drawInfoBox(pdf, MARGIN, y, inner, 32, "DITAGIHKAN KEPADA", [
      (student && student.NAMA) || "-",
      "ID Siswa: " + (invoice.ID_SISWA || "-"),
      "WhatsApp: " + ((student && student.NO_WA) || "-"),
      "Program: " + ((student && student.PROGRAM) || "-")
    ]);
    y += 40;

    // Tabel
    y = drawItemsTable(
      pdf, MARGIN, y, inner,
      ["DESKRIPSI", "KATEGORI", "JATUH TEMPO", "JUMLAH"],
      [[
        invoice.DESCRIPTION || "-",
        invoice.CATEGORY || "-",
        dateLong(invoice.DUE_DATE),
        formatRupiah(invoice.AMOUNT)
      ]],
      [inner * 0.5, inner * 0.18, inner * 0.16, inner * 0.16]
    );
    y += 10;

    // Status
    drawStatusRow(pdf, MARGIN, y, "Status tagihan: ", invoice.STATUS || "-");
    y += 12;

    // Terbilang
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.body);
    pdf.text(pdf.splitTextToSize("Terbilang: " + capitalize(terbilang(invoice.AMOUNT)), inner), MARGIN, y);
    y += 12;

    // Total
    drawTotalBox(pdf, MARGIN, y, inner, "TOTAL TAGIHAN", formatRupiah(invoice.AMOUNT));
    y += 20 + 14;

    // Catatan
    if (invoice.NOTES) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("CATATAN", MARGIN, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.body);
      const noteLines = pdf.splitTextToSize(String(invoice.NOTES), inner);
      pdf.text(noteLines, MARGIN, y + 4.5);
      y += 4.5 + noteLines.length * 3.8 + 8;
    } else {
      y += 12;
    }

    // TTD
    const invoiceSigner = String(invoice.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pageWidth - MARGIN - 60, y, COMPANY.city, "Hormat kami,", invoiceSigner);

    // Footer
    drawFooter(pdf,
      "Mohon melakukan pembayaran sebelum tanggal jatuh tempo. Apabila terdapat kendala pembayaran " +
      "atau membutuhkan informasi lebih lanjut, silakan menghubungi Pak Suwardi (0813-7908-7768), " +
      "Sensei Rachmat (0812-8267-4707), atau Admin LPKS Arima Persada (0823-7512-8230)."
    );

    return { pdf, fileName: `tagihan-${safeFileName(invoice.BILLING_ID || invoice.ID_SISWA)}.pdf` };
  }


  /* =========================================================
   * SLIP GAJI SENSEI
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
    drawInfoBox(pdf, MARGIN, y, inner, 32, "DIBERIKAN KEPADA", [
      (senseiRow && senseiRow.NAMA) || "Sensei",
      "ID Sensei: " + (salaryRow.ID_SENSEI || "-"),
      "Email: " + ((senseiRow && senseiRow.EMAIL) || "-"),
      "WhatsApp: " + ((senseiRow && senseiRow.NO_WA) || "-")
    ]);
    y += 40;

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
      ["KOMPONEN", "JUMLAH"],
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
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.body);
    pdf.text(pdf.splitTextToSize("Terbilang: " + capitalize(terbilang(netSalary)), inner), MARGIN, y);
    y += 12;

    // Total
    drawTotalBox(pdf, MARGIN, y, inner, "GAJI BERSIH DITERIMA", formatRupiah(netSalary));
    y += 20 + 12;

    // Status
    drawStatusRow(pdf, MARGIN, y, "Status pembayaran: ", salaryRow.PAYMENT_STATUS || "-");
    if (salaryRow.PAYMENT_DATE) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("Tanggal bayar: ", pageWidth / 2, y);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLOR.black);
      pdf.text(dateLong(salaryRow.PAYMENT_DATE), pageWidth / 2 + 24, y);
    }
    y += 12;

    // Catatan
    if (salaryRow.NOTES) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("CATATAN", MARGIN, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.body);
      const noteLines = pdf.splitTextToSize(String(salaryRow.NOTES), inner);
      pdf.text(noteLines, MARGIN, y + 4.5);
      y += 4.5 + noteLines.length * 3.8 + 8;
    } else {
      y += 8;
    }

    // TTD
    const salarySigner = String(salaryRow.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pageWidth - MARGIN - 60, y, COMPANY.city, "Hormat kami,", salarySigner);

    // Footer
    drawFooter(pdf,
      "Slip gaji ini dihasilkan otomatis dari sistem ARIMA MANAGEMENT SYSTEM. " +
      "Perhitungan JP berdasarkan absensi mengajar sensei (1 JP = 45 menit, di luar waktu istirahat " +
      "10.00–10.15 dan 12.00–13.15). Simpan dokumen ini sebagai bukti resmi penerimaan gaji."
    );

    return { pdf, fileName: `slip-gaji-${safeFileName(salaryRow.SALARY_ID || "sensei")}.pdf` };
  }


  /* =========================================================
   * BANTUAN
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
