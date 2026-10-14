/**
 * ARIMA MANAGEMENT SYSTEM — PDF MODULE
 * Style: Modern Bold (Canva-inspired startup invoice)
 * =====================================
 */
window.ArimaPdf = (() => {
  "use strict";

  /* =========================================================
   * PALET
   * ========================================================= */

  const COLOR = {
    accent:   [215, 25, 32],       // merah ARIMA
    accentSoft: [252, 235, 236],    // merah muda untuk label
    dark:     [22, 22, 26],
    ink:      [40, 40, 46],
    body:     [80, 80, 88],
    muted:    [145, 145, 152],
    subtle:   [220, 220, 225],
    line:     [238, 238, 242],
    soft:     [248, 248, 250],
    white:    [255, 255, 255]
  };

  const MARGIN = 18;
  const HEADER_H = 46;             // tinggi blok header berwarna
  const FOOTER_OFFSET = 16;

  const COMPANY = {
    name:    "LPKS ARIMA PERSADA",
    short:   "ARIMA",
    tagline: "Menjembatani Kompetensi, Membuka Gerbang Karier ke Jepang",
    address: "Jl. Sidoharjo 1, Desa Negara Ratu, Kec. Natar, Kab. Lampung Selatan",
    phones:  "0813-7908-7768 · 0812-8267-4707",
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
        script.onload = () => window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error("Library PDF tidak tersedia."));
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
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
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

  function ellipsize(pdf, text, maxWidth) {
    const s = String(text || "");
    if (pdf.getTextWidth(s) <= maxWidth) return s;
    let out = s;
    while (out.length > 1 && pdf.getTextWidth(out + "…") > maxWidth) {
      out = out.slice(0, -1);
    }
    return out + "…";
  }


  /* =========================================================
   * HEADER — Blok merah penuh
   * ========================================================= */

  function drawHeader(pdf, opts = {}) {
    const pw = pdf.internal.pageSize.getWidth();

    // Blok merah full-width
    pdf.setFillColor(...COLOR.accent);
    pdf.rect(0, 0, pw, HEADER_H, "F");

    // Logo dalam lingkaran putih
    if (opts.logoData) {
      try {
        // Circle putih di belakang logo
        pdf.setFillColor(...COLOR.white);
        pdf.circle(MARGIN + 12, 23, 12, "F");
        pdf.addImage(opts.logoData, "PNG", MARGIN + 3, 14, 18, 18);
      } catch (_) {}
    }

    // Nama perusahaan (BIG, bold, putih)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(...COLOR.white);
    pdf.text(COMPANY.name, MARGIN + 28, 22);

    // Alamat ringkas (di bawah nama)
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(COMPANY.address, MARGIN + 28, 28);
    pdf.text(`${COMPANY.phones}  ·  ${COMPANY.email}`, MARGIN + 28, 33.5);

    // Document type (kanan, uppercase besar)
    if (opts.documentType) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(...COLOR.white);
      pdf.text(opts.documentType, pw - MARGIN, 21, { align: "right" });
    }
    if (opts.documentNumber) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(opts.documentNumber, pw - MARGIN, 28, { align: "right" });
    }
    if (opts.documentDate) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(opts.documentDate, pw - MARGIN, 33.5, { align: "right" });
    }

    return HEADER_H + 12;   // konten mulai di 58mm
  }


  /* =========================================================
   * SECTION LABEL — teks kecil uppercase dengan garis aksen
   * ========================================================= */

  function drawSectionLabel(pdf, x, y, text) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLOR.accent);
    pdf.text(text, x, y);

    // garis kecil di bawah label
    const w = pdf.getTextWidth(text);
    pdf.setDrawColor(...COLOR.accent);
    pdf.setLineWidth(0.5);
    pdf.line(x, y + 1.5, x + w, y + 1.5);
  }


  /* =========================================================
   * INFO GRID — 2 kolom, tanpa box, clean
   * ========================================================= */

  function drawInfoGrid(pdf, x, y, width, leftTitle, leftLines, rightTitle, rightLines) {
    const gap = 10;
    const colW = (width - gap) / 2;

    // LEFT
    drawSectionLabel(pdf, x, y, leftTitle);
    let ly = y + 8;
    leftLines.forEach((line, idx) => {
      if (idx === 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...COLOR.dark);
        pdf.text(ellipsize(pdf, line, colW), x, ly);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.8);
        ly += 5.5;
      } else {
        pdf.setTextColor(...COLOR.body);
        pdf.text(ellipsize(pdf, line, colW), x, ly);
        ly += 4.8;
      }
    });

    // RIGHT
    if (rightTitle && rightLines.length) {
      const rx = x + colW + gap;
      drawSectionLabel(pdf, rx, y, rightTitle);
      let ry = y + 8;
      rightLines.forEach((line, idx) => {
        if (idx === 0) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(...COLOR.dark);
          pdf.text(ellipsize(pdf, line, colW), rx, ry);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.8);
          ry += 5.5;
        } else {
          pdf.setTextColor(...COLOR.body);
          pdf.text(ellipsize(pdf, line, colW), rx, ry);
          ry += 4.8;
        }
      });
      return Math.max(ly, ry);
    }

    return ly;
  }


  /* =========================================================
   * TABLE — header tanpa background, garis tipis, modern
   * ========================================================= */

  function drawItemsTable(pdf, x, y, width, headers, rows, colWidths, alignMap = {}) {
    const rowH = 10;
    const headerH = 9;
    const lineH = 4.8;

    // Header text-only (uppercase, muted, small)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLOR.muted);

    let cx = x;
    headers.forEach((h, i) => {
      const align = alignMap[i] || (i === headers.length - 1 ? "right" : "left");
      if (align === "right") {
        pdf.text(h, x + width, y + 6, { align: "right" });
      } else if (align === "center") {
        pdf.text(h, cx + colWidths[i] / 2, y + 6, { align: "center" });
      } else {
        pdf.text(h, cx, y + 6);
      }
      cx += colWidths[i];
    });

    // Garis header
    pdf.setDrawColor(...COLOR.dark);
    pdf.setLineWidth(0.6);
    pdf.line(x, y + headerH, x + width, y + headerH);

    // Baris
    let ry = y + headerH;
    rows.forEach((row, rIdx) => {
      // Hitung tinggi baris (perlu wrap?)
      const cellLines = row.map((cell, i) => {
        const text = String(cell ?? "");
        return pdf.splitTextToSize(text, colWidths[i] - 4);
      });
      const maxLines = Math.max(1, ...cellLines.map(l => l.length));
      const thisRowH = Math.max(rowH, maxLines * lineH + 5);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      let rx = x;
      row.forEach((cell, i) => {
        const align = alignMap[i] || (i === row.length - 1 ? "right" : "left");
        const lines = cellLines[i];

        if (i === row.length - 1) {
          // Kolom jumlah: bold
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...COLOR.dark);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...COLOR.ink);
        }

        let textY = ry + 6.5;
        lines.forEach(line => {
          if (align === "right") {
            pdf.text(line, x + width, textY, { align: "right" });
          } else if (align === "center") {
            pdf.text(line, rx + colWidths[i] / 2, textY, { align: "center" });
          } else {
            pdf.text(line, rx, textY);
          }
          textY += lineH;
        });

        rx += colWidths[i];
      });

      ry += thisRowH;

      // Garis bawah baris tipis
      pdf.setDrawColor(...COLOR.line);
      pdf.setLineWidth(0.15);
      pdf.line(x, ry, x + width, ry);
    });

    return ry;
  }


  /* =========================================================
   * TOTAL — angka raksasa, kanan
   * ========================================================= */

  function drawTotal(pdf, x, y, width, label, value, opts = {}) {
    const valueColor = opts.accentValue === false ? COLOR.dark : COLOR.accent;

    // Label kecil uppercase
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(label, x + width, y, { align: "right" });

    // Value raksasa
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(...valueColor);
    pdf.text(value, x + width, y + 11, { align: "right" });

    // Garis aksen di bawah (pendek, rata kanan)
    pdf.setDrawColor(...valueColor);
    pdf.setLineWidth(1.2);
    pdf.line(x + width - 30, y + 14.5, x + width, y + 14.5);

    return y + 14.5;
  }


  /* =========================================================
   * STATUS PILL — badge kecil
   * ========================================================= */

  function drawStatusPill(pdf, x, y, label, value) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(label, x, y + 4);

    const text = String(value || "-").toUpperCase();
    const labelW = pdf.getTextWidth(label);
    const padX = 3;
    const padY = 2;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    const textW = pdf.getTextWidth(text);
    const boxW = textW + padX * 2;
    const boxH = 6;
    const boxX = x + labelW + 3;
    const boxY = y - 1;

    // Background pill
    pdf.setFillColor(...COLOR.accentSoft);
    pdf.roundedRect(boxX, boxY, boxW, boxH, 3, 3, "F");

    // Text
    pdf.setTextColor(...COLOR.accent);
    pdf.text(text, boxX + padX, y + 3.2);

    return boxX + boxW;
  }


  /* =========================================================
   * SIGNATURE — modern minimalis
   * ========================================================= */

  function drawSignature(pdf, x, y, city, role, name) {
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

    const blockW = 58;

    // Kota & tanggal
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(`${city}, ${today}`, x, y);

    // "Hormat kami," italic
    pdf.setFont("helvetica", "italic");
    pdf.text(role || "", x, y + 4.5);

    // Nama bold
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...COLOR.dark);
    pdf.text(personName || "-", x, y + 22);

    // Garis aksen merah pendek
    pdf.setDrawColor(...COLOR.accent);
    pdf.setLineWidth(0.6);
    pdf.line(x, y + 24, x + blockW, y + 24);

    // Jabatan muted
    if (personRole) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(personRole, x, y + 28.5);
    }
  }


  /* =========================================================
   * FOOTER — thin line + note
   * ========================================================= */

  function drawFooter(pdf, note) {
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const top = ph - FOOTER_OFFSET;

    pdf.setDrawColor(...COLOR.subtle);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, top, pw - MARGIN, top);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLOR.muted);
    const lines = pdf.splitTextToSize(note, pw - MARGIN * 2);
    pdf.text(lines, MARGIN, top + 4.5);
  }


  /* =========================================================
   * TERBILANG BAR
   * ========================================================= */

  function drawTerbilang(pdf, x, y, width, text) {
    pdf.setFillColor(...COLOR.soft);
    pdf.roundedRect(x, y - 4, width, 7, 1.5, 1.5, "F");

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR.body);
    pdf.text(ellipsize(pdf, text, width - 8), x + 4, y + 0.8);

    return y + 6;
  }


  /* =========================================================
   * KUITANSI PEMBAYARAN
   * ========================================================= */

  async function buildReceipt(payment, student) {
    const JsPDF = await ensurePdfLibrary();
    const logoData = await getLogoData();

    const pdf = new JsPDF({ unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const inner = pw - MARGIN * 2;

    let y = drawHeader(pdf, {
      logoData,
      documentType: "KUITANSI",
      documentNumber: "No " + (payment.PAYMENT_ID || "-"),
      documentDate: dateLong(payment.PAYMENT_DATE)
    });

    // Info grid: Diterima Dari + Detail Pembayaran
    y = drawInfoGrid(pdf, MARGIN, y, inner,
      "DITERIMA DARI",
      [
        (student && student.NAMA) || "-",
        "ID Siswa: " + (payment.ID_SISWA || "-"),
        "WhatsApp: " + ((student && student.NO_WA) || "-")
      ],
      "DETAIL",
      [
        "Metode: " + (payment.PAYMENT_METHOD || "-"),
        "Tagihan: " + (payment.BILLING_ID || "-"),
        "Penerima: " + (payment.REFERENCE_NO || "-")
      ]
    );
    y += 8;

    // Table
    y = drawItemsTable(pdf, MARGIN, y, inner,
      ["KETERANGAN", "JUMLAH"],
      [[
        payment.NOTES || ("Pembayaran tagihan " + (payment.BILLING_ID || "-")),
        formatRupiah(payment.AMOUNT)
      ]],
      [inner * 0.7, inner * 0.3],
      { 0: "left", 1: "right" }
    );
    y += 6;

    // Terbilang
    y = drawTerbilang(pdf, MARGIN, y, inner, "Terbilang: " + capitalize(terbilang(payment.AMOUNT)));
    y += 14;

    // Total
    y = drawTotal(pdf, MARGIN, y, inner, "TOTAL DITERIMA", formatRupiah(payment.AMOUNT));
    y += 26;

    // Signature
    const signer = String(payment.REFERENCE_NO || "Admin LPKS Arima Persada").trim();
    drawSignature(pdf, pw - MARGIN - 60, y, COMPANY.city, "Hormat kami,", signer);

    // Footer
    drawFooter(pdf,
      "Kuitansi ini sah sebagai bukti pembayaran yang tercatat di sistem LPKS Arima Persada. " +
      "Pembayaran yang sudah tercatat otomatis tersinkron dengan mutasi keuangan."
    );

    return { pdf, fileName: `kuitansi-${safeFileName(payment.PAYMENT_ID || "pembayaran")}.pdf` };
  }


  /* =========================================================
   * SURAT TAGIHAN
   * ========================================================= */

  async function buildInvoice(invoice, student) {
    const JsPDF = await ensurePdfLibrary();
    const logoData = await getLogoData();

    const pdf = new JsPDF({ unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const inner = pw - MARGIN * 2;

    let y = drawHeader(pdf, {
      logoData,
      documentType: "TAGIHAN",
      documentNumber: "No " + (invoice.BILLING_ID || "-"),
      documentDate: "Dicetak " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    });

    // Info grid
    y = drawInfoGrid(pdf, MARGIN, y, inner,
      "DITAGIHKAN KEPADA",
      [
        (student && student.NAMA) || "-",
        "ID Siswa: " + (invoice.ID_SISWA || "-"),
        "WhatsApp: " + ((student && student.NO_WA) || "-")
      ],
      "DETAIL TAGIHAN",
      [
        "Kategori: " + (invoice.CATEGORY || "-"),
        "Jatuh Tempo: " + dateLong(invoice.DUE_DATE),
        "Penerima: " + (invoice.PENERIMA || "-")
      ]
    );
    y += 8;

    // Table
    y = drawItemsTable(pdf, MARGIN, y, inner,
      ["DESKRIPSI", "JUMLAH"],
      [[
        invoice.DESCRIPTION || "-",
        formatRupiah(invoice.AMOUNT)
      ]],
      [inner * 0.7, inner * 0.3],
      { 0: "left", 1: "right" }
    );
    y += 6;

    // Status pill
    drawStatusPill(pdf, MARGIN, y, "Status", invoice.STATUS || "-");
    y += 10;

    // Terbilang
    y = drawTerbilang(pdf, MARGIN, y, inner, "Terbilang: " + capitalize(terbilang(invoice.AMOUNT)));
    y += 14;

    // Total
    y = drawTotal(pdf, MARGIN, y, inner, "TOTAL TAGIHAN", formatRupiah(invoice.AMOUNT));
    y += 14;

    // Notes
    if (invoice.NOTES) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("CATATAN", MARGIN, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.body);
      const noteLines = pdf.splitTextToSize(String(invoice.NOTES), inner);
      pdf.text(noteLines, MARGIN, y + 4.5);
      y += 4.5 + noteLines.length * 3.8 + 6;
    } else {
      y += 10;
    }

    // Signature
    const signer = String(invoice.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignature(pdf, pw - MARGIN - 60, y, COMPANY.city, "Hormat kami,", signer);

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
    const pw = pdf.internal.pageSize.getWidth();
    const inner = pw - MARGIN * 2;

    const period = monthLabel(salaryRow.PERIOD);

    let y = drawHeader(pdf, {
      logoData,
      documentType: "SLIP GAJI",
      documentNumber: "No " + (salaryRow.SALARY_ID || "-"),
      documentDate: period
    });

    // Info grid
    y = drawInfoGrid(pdf, MARGIN, y, inner,
      "DIBERIKAN KEPADA",
      [
        (senseiRow && senseiRow.NAMA) || "Sensei",
        "ID: " + (salaryRow.ID_SENSEI || "-"),
        "WA: " + ((senseiRow && senseiRow.NO_WA) || "-")
      ],
      "PERIODE",
      [
        period,
        "Email: " + ((senseiRow && senseiRow.EMAIL) || "-"),
        "Status: " + (salaryRow.PAYMENT_STATUS || "-")
      ]
    );
    y += 8;

    // Komponen
    const baseAmount = Number(salaryRow.BASE_AMOUNT || 0);
    const bonus = Number(salaryRow.BONUS || 0);
    const transport = Number(salaryRow.TRANSPORT || 0);
    const deduction = Number(salaryRow.DEDUCTION || 0);
    const netSalary = Number(salaryRow.NET_SALARY || 0);
    const rate = Number((senseiRow && senseiRow.TARIF_PER_JAM) || 0);
    const jp = Number(salaryRow.HOUR_COUNT || 0);
    const meetings = Number(salaryRow.MEETING_COUNT || 0);

    y = drawItemsTable(pdf, MARGIN, y, inner,
      ["KOMPONEN", "DETAIL", "JUMLAH"],
      [
        ["Gaji Pokok", `${formatNumber(jp)} JP × ${formatRupiah(rate)}`, formatRupiah(baseAmount)],
        ["Bonus", "—", formatRupiah(bonus)],
        ["Transport", "—", formatRupiah(transport)],
        ["Potongan", `${formatNumber(meetings)} pertemuan tercatat`, "- " + formatRupiah(deduction)]
      ],
      [inner * 0.35, inner * 0.35, inner * 0.3],
      { 0: "left", 1: "left", 2: "right" }
    );
    y += 6;

    // Terbilang
    y = drawTerbilang(pdf, MARGIN, y, inner, "Terbilang: " + capitalize(terbilang(netSalary)));
    y += 14;

    // Total
    y = drawTotal(pdf, MARGIN, y, inner, "GAJI BERSIH DITERIMA", formatRupiah(netSalary));
    y += 14;

    // Status + tanggal
    if (salaryRow.PAYMENT_DATE) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("Tanggal bayar: ", MARGIN, y);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLOR.dark);
      pdf.text(dateLong(salaryRow.PAYMENT_DATE), MARGIN + 22, y);
    }
    y += 10;

    // Notes
    if (salaryRow.NOTES) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text("CATATAN", MARGIN, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.body);
      const noteLines = pdf.splitTextToSize(String(salaryRow.NOTES), inner);
      pdf.text(noteLines, MARGIN, y + 4.5);
      y += 4.5 + noteLines.length * 3.8 + 6;
    } else {
      y += 6;
    }

    // Signature
    const signer = String(salaryRow.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignature(pdf, pw - MARGIN - 60, y, COMPANY.city, "Hormat kami,", signer);

    // Footer
    drawFooter(pdf,
      "Slip gaji ini dihasilkan otomatis dari sistem ARIMA MANAGEMENT SYSTEM. " +
      "Perhitungan JP: 1 JP = 45 menit, di luar waktu istirahat. Simpan sebagai bukti resmi."
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
