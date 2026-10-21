/**
 * ARIMA MANAGEMENT SYSTEM — PDF MODULE
 * =====================================
 */
window.ArimaPdf = (() => {
  "use strict";

  /* =========================================================
   * PALET
   * ========================================================= */

  const COLOR = {
    black: [17, 17, 20],
    ink:   [40, 40, 46],
    body:  [80, 80, 88],
    muted: [140, 140, 148],
    soft:  [246, 246, 249],
    boxbg: [240, 240, 244],
    line:  [220, 220, 226],
    accent:[215, 25, 32],
    white: [255, 255, 255]
  };

  const MARGIN = 15;
  const FOOTER_OFFSET = 22;

  const COMPANY = {
    name:    "LPKS ARIMA PERSADA",
    tagline: "Menjembatani Kompetensi, Membuka Gerbang Karier ke Jepang",
    address: "Jl. Sidoharjo 1, Desa Negara Ratu, Kec. Natar, Lampung Selatan",
    phones:  "0813-7908-7768",
    phones2: "0812-8267-4707",
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

  function dateShort(value) {
    const text = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}/.test(text)) return text || "-";
    const d = new Date(text.slice(0, 10) + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
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

  function drawHeader(pdf, opts = {}) {
    const pw = pdf.internal.pageSize.getWidth();

    if (opts.logoData) {
      try { pdf.addImage(opts.logoData, "PNG", MARGIN, 12, 18, 18); } catch (_) {}
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...COLOR.black);
    pdf.text(COMPANY.name, MARGIN + 24, 19);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(COMPANY.address, MARGIN + 24, 24.5);
    pdf.text(`${COMPANY.phones}  ·  ${COMPANY.email}`, MARGIN + 24, 29);

    if (opts.documentType) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(...COLOR.black);
      pdf.text(opts.documentType, pw - MARGIN, 22, { align: "right" });
    }

    pdf.setDrawColor(...COLOR.black);
    pdf.setLineWidth(0.8);
    pdf.line(MARGIN, 38, pw - MARGIN, 38);

    return 44;
  }

  function drawMetaBox(pdf, x, y, width, cells) {
    const ratios = cells.length === 3 ? [0.42, 0.33, 0.25] : cells.map(() => 1 / cells.length);
    const colWidths = ratios.map(r => width * r);
    
    let heights = cells.map((cell, i) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(cell.big ? 10.5 : 9);
      const lines = pdf.splitTextToSize(String(cell.value || "-"), colWidths[i] - 8);
      return 12 + lines.length * 4.8;
    });
    const height = Math.max(...heights);

    pdf.setDrawColor(...COLOR.black);
    pdf.setLineWidth(0.4);
    pdf.rect(x, y, width, height, "S");

    cells.forEach((cell, i) => {
      const cx = x + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      
      if (i > 0) {
        pdf.setDrawColor(...COLOR.black);
        pdf.setLineWidth(0.3);
        pdf.line(cx, y, cx, y + height);
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(cell.label.toUpperCase(), cx + 5, y + 7);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(cell.big ? 10.5 : 9);
      pdf.setTextColor(...COLOR.black);
      const lines = pdf.splitTextToSize(String(cell.value || "-"), colWidths[i] - 8);
      let ly = y + 12;
      lines.forEach(line => {
        pdf.text(line, cx + 5, ly);
        ly += 4.5;
      });
    });

    return y + height;
  }

  function drawParty(pdf, x, y, width, label, name, contactLines) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLOR.muted);
    pdf.text(label.toUpperCase(), x, y);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...COLOR.black);
    const nameLines = pdf.splitTextToSize(String(name || "-"), width);
    let ly = y + 7;
    nameLines.forEach(line => {
      pdf.text(line, x, ly);
      ly += 5;
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.body);
    ly += 1;
    contactLines.forEach(line => {
      const wrapped = pdf.splitTextToSize(String(line), width);
      wrapped.forEach(wl => {
        pdf.text(wl, x, ly);
        ly += 4.2;
      });
    });

    return ly;
  }

  function drawItemsTable(pdf, x, y, width, headers, rows, colWidths, alignMap = {}) {
    const headerH = 8;
    const rowH = 9;

    pdf.setFillColor(...COLOR.black);
    pdf.rect(x, y, width, headerH, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLOR.white);

    let cx = x + 4;
    headers.forEach((h, i) => {
      const align = alignMap[i] || (i === headers.length - 1 ? "right" : "left");
      if (align === "right") {
        pdf.text(h.toUpperCase(), x + width - 4, y + 5.4, { align: "right" });
      } else if (align === "center") {
        pdf.text(h.toUpperCase(), cx + colWidths[i] / 2, y + 5.4, { align: "center" });
      } else {
        pdf.text(h.toUpperCase(), cx, y + 5.4);
      }
      cx += colWidths[i];
    });

    let ry = y + headerH;
    rows.forEach((row, rIdx) => {
      const wrapped = row.map((cell, i) =>
        pdf.splitTextToSize(String(cell ?? ""), colWidths[i] - 8)
      );
      const maxLines = Math.max(1, ...wrapped.map(w => w.length));
      const lineH = 3.8;
      const thisRowH = Math.max(rowH, maxLines * lineH + 4.5);

      let rx = x + 4;
      row.forEach((cell, i) => {
        const align = alignMap[i] || (i === row.length - 1 ? "right" : "left");
        const lines = wrapped[i];

        if (i === row.length - 1) {
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...COLOR.black);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...COLOR.ink);
        }
        pdf.setFontSize(8.5);

        let textY = ry + 4;
        lines.forEach(line => {
          if (align === "right") {
            pdf.text(line, x + width - 4, textY, { align: "right" });
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

      pdf.setDrawColor(...COLOR.line);
      pdf.setLineWidth(0.2);
      pdf.line(x, ry, x + width, ry);
    });

    return ry;
  }

  function drawTotals(pdf, x, y, width, items, totalLabel, totalValue, accentTotal = false) {
    const lineH = 6;
    let ly = y;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    items.forEach(item => {
      pdf.setTextColor(...COLOR.body);
      pdf.text(item.label, x, ly);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLOR.ink);
      pdf.text(item.value, x + width, ly, { align: "right" });
      pdf.setFont("helvetica", "normal");
      ly += lineH;
    });

    ly += 3;

    const boxH = 12;
    pdf.setFillColor(...COLOR.black);
    pdf.rect(x, ly, width, boxH, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLOR.white);
    pdf.text(totalLabel.toUpperCase(), x + 6, ly + 7.8);

    pdf.setFontSize(13);
    if (accentTotal) {
      pdf.setTextColor(255, 100, 100);
    } else {
      pdf.setTextColor(...COLOR.white);
    }
    pdf.text(totalValue, x + width - 6, ly + 8, { align: "right" });

    return ly + boxH;
  }

  function drawTerbilang(pdf, x, y, width, text) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8.5);
    const lines = pdf.splitTextToSize(String(text), width - 10);
    const height = 4 + lines.length * 4.5;

    pdf.setFillColor(...COLOR.soft);
    pdf.roundedRect(x, y, width, height, 1.2, 1.2, "F");

    pdf.setTextColor(...COLOR.body);
    let ly = y + 5.5;
    lines.forEach(line => {
      pdf.text(line, x + 5, ly);
      ly += 4.5;
    });

    return y + height;
  }

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
    pdf.setTextColor(...COLOR.body);
    pdf.text(`${city}, ${today}`, x, y);

    // "Hormat kami," italic
    pdf.setFont("helvetica", "italic");
    pdf.text(role || "", x, y + 4.5);

    // Ruang tanda tangan (garis)
    pdf.setDrawColor(...COLOR.black);
    pdf.setLineWidth(0.4);
    pdf.line(x, y + 20, x + blockWidth, y + 20);

    // Nama
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...COLOR.black);
    pdf.text(personName || "-", x, y + 25);

    // Jabatan
    if (personRole) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(personRole, x, y + 29.5);
    }
  }

  function drawFooter(pdf, note) {
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const inner = pw - MARGIN * 2;

    const top = ph - FOOTER_OFFSET - 24;

    pdf.setDrawColor(...COLOR.line);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, top, pw - MARGIN, top);

    const colW = inner / 3;
    const cols = [
      { label: "KONTAK", lines: [COMPANY.phones, COMPANY.phones2] },
      { label: "EMAIL", lines: [COMPANY.email] },
      { label: "ALAMAT", lines: [COMPANY.address] }
    ];

    cols.forEach((col, i) => {
      const cx = MARGIN + i * colW;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.setTextColor(...COLOR.muted);
      pdf.text(col.label, cx, top + 7);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...COLOR.ink);
      let ly = top + 12;
      col.lines.forEach(line => {
        const wrapped = pdf.splitTextToSize(String(line), colW - 4);
        wrapped.forEach(wl => {
          pdf.text(wl, cx, ly);
          ly += 3.8;
        });
      });
    });

    if (note) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(...COLOR.muted);
      const noteLines = pdf.splitTextToSize(note, inner);
      pdf.text(noteLines.slice(0, 2), MARGIN, ph - 6);
    }
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
      documentType: "KUITANSI"
    });

    const partyW = inner * 0.5;
    const metaW = inner * 0.48;
    const metaX = MARGIN + inner - metaW;

    drawParty(pdf, MARGIN, y, partyW, "Diterima dari", (student && student.NAMA) || "-", [
      "WhatsApp: " + ((student && student.NO_WA) || "-"),
      "ID Siswa: " + (payment.ID_SISWA || "-"),
      "Tagihan: " + (payment.BILLING_ID || "-")
    ]);

    drawMetaBox(pdf, metaX, y - 2, metaW, [
      { label: "Total Diterima", value: formatRupiah(payment.AMOUNT), big: true },
      { label: "Tanggal", value: dateShort(payment.PAYMENT_DATE) },
      { label: "No. Kuitansi", value: payment.PAYMENT_ID || "-" }
    ]);

    y += 40;

    y = drawItemsTable(pdf, MARGIN, y, inner,
      ["Keterangan", "Metode", "Penerima", "Jumlah"],
      [[
        payment.NOTES || ("Pembayaran tagihan " + (payment.BILLING_ID || "-")),
        payment.PAYMENT_METHOD || "-",
        payment.REFERENCE_NO || "-",
        formatRupiah(payment.AMOUNT)
      ]],
      [inner * 0.5, inner * 0.15, inner * 0.2, inner * 0.15],
      { 0: "left", 1: "left", 2: "left", 3: "right" }
    );
    y += 6;

    y = drawTerbilang(pdf, MARGIN, y, inner, "Terbilang: " + capitalize(terbilang(payment.AMOUNT)));
    y += 14;

    const totalsW = inner * 0.42;
    const totalsX = MARGIN + inner - totalsW;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR.muted);
    pdf.text("METODE PEMBAYARAN", MARGIN, y);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...COLOR.black);
    pdf.text(String(payment.PAYMENT_METHOD || "-").toUpperCase(), MARGIN, y + 6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.body);
    pdf.text("Referensi: " + (payment.REFERENCE_NO || "-"), MARGIN, y + 12);

    const totalBottom = drawTotals(pdf, totalsX, y - 4, totalsW, [], "Total Diterima", formatRupiah(payment.AMOUNT));

    y = Math.max(totalBottom, y + 20) + 15;

    const signer = String(payment.REFERENCE_NO || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pw - MARGIN - 60, y, COMPANY.city, "Hormat kami,", signer);

    drawFooter(pdf, "Kuitansi ini sah sebagai bukti pembayaran yang tercatat di sistem LPKS Arima Persada.");

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
      documentType: "TAGIHAN"
    });

    const partyW = inner * 0.5;
    const metaW = inner * 0.48;
    const metaX = MARGIN + inner - metaW;

    drawParty(pdf, MARGIN, y, partyW, "Ditagihkan kepada", (student && student.NAMA) || "-", [
      "WhatsApp: " + ((student && student.NO_WA) || "-"),
      "ID Siswa: " + (invoice.ID_SISWA || "-"),
      "Program: " + ((student && student.PROGRAM) || "-")
    ]);

    drawMetaBox(pdf, metaX, y - 2, metaW, [
      { label: "Total Tagihan", value: formatRupiah(invoice.AMOUNT), big: true },
      { label: "Jatuh Tempo", value: dateShort(invoice.DUE_DATE) },
      { label: "No. Tagihan", value: invoice.BILLING_ID || "-" }
    ]);

    y += 40;

    y = drawItemsTable(pdf, MARGIN, y, inner,
      ["Deskripsi", "Kategori", "Status", "Jumlah"],
      [[
        invoice.DESCRIPTION || "-",
        invoice.CATEGORY || "-",
        invoice.STATUS || "-",
        formatRupiah(invoice.AMOUNT)
      ]],
      [inner * 0.5, inner * 0.18, inner * 0.17, inner * 0.15],
      { 0: "left", 1: "left", 2: "left", 3: "right" }
    );
    y += 6;

    y = drawTerbilang(pdf, MARGIN, y, inner, "Terbilang: " + capitalize(terbilang(invoice.AMOUNT)));
    y += 14;

    const totalsW = inner * 0.42;
    const totalsX = MARGIN + inner - totalsW;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR.muted);
    pdf.text("CATATAN", MARGIN, y);

    if (invoice.NOTES) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...COLOR.body);
      const noteLines = pdf.splitTextToSize(String(invoice.NOTES), inner * 0.5);
      pdf.text(noteLines, MARGIN, y + 6);
    }

    const totalBottom = drawTotals(pdf, totalsX, y - 4, totalsW, [], "Total Tagihan", formatRupiah(invoice.AMOUNT));
    y = Math.max(totalBottom, y + 20) + 15;

    const signer = String(invoice.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pw - MARGIN - 60, y, COMPANY.city, "Hormat kami,", signer);

    drawFooter(pdf, "Mohon melakukan pembayaran sebelum tanggal jatuh tempo.");

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
      documentType: "SLIP GAJI"
    });

    const partyW = inner * 0.5;
    const metaW = inner * 0.48;
    const metaX = MARGIN + inner - metaW;

    drawParty(pdf, MARGIN, y, partyW, "Diberikan kepada", (senseiRow && senseiRow.NAMA) || "Sensei", [
      "ID Sensei: " + (salaryRow.ID_SENSEI || "-"),
      "Email: " + ((senseiRow && senseiRow.EMAIL) || "-"),
      "WhatsApp: " + ((senseiRow && senseiRow.NO_WA) || "-")
    ]);

    drawMetaBox(pdf, metaX, y - 2, metaW, [
      { label: "Gaji Bersih", value: formatRupiah(salaryRow.NET_SALARY), big: true },
      { label: "Periode", value: period },
      { label: "No. Slip", value: salaryRow.SALARY_ID || "-" }
    ]);

    y += 40;

    const baseAmount = Number(salaryRow.BASE_AMOUNT || 0);
    const bonus = Number(salaryRow.BONUS || 0);
    const transport = Number(salaryRow.TRANSPORT || 0);
    const deduction = Number(salaryRow.DEDUCTION || 0);
    const netSalary = Number(salaryRow.NET_SALARY || 0);
    const rate = Number((senseiRow && senseiRow.TARIF_PER_JAM) || 0);
    const jp = Number(salaryRow.HOUR_COUNT || 0);
    const meetings = Number(salaryRow.MEETING_COUNT || 0);

    y = drawItemsTable(pdf, MARGIN, y, inner,
      ["Komponen", "Detail", "Jumlah"],
      [
        ["Gaji Pokok", `${formatNumber(jp)} JP × ${formatRupiah(rate)}`, formatRupiah(baseAmount)],
        ["Bonus", "—", formatRupiah(bonus)],
        ["Transport", "—", formatRupiah(transport)],
        ["Potongan", "—", "- " + formatRupiah(deduction)]
      ],
      [inner * 0.35, inner * 0.35, inner * 0.3],
      { 0: "left", 1: "left", 2: "right" }
    );
    y += 6;

    y = drawTerbilang(pdf, MARGIN, y, inner, "Terbilang: " + capitalize(terbilang(netSalary)));
    y += 14;

    const totalsW = inner * 0.42;
    const totalsX = MARGIN + inner - totalsW;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR.muted);
    pdf.text("RINCIAN", MARGIN, y);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLOR.body);
    pdf.text(`Pertemuan: ${formatNumber(meetings)} tercatat`, MARGIN, y + 6);
    pdf.text(`Total JP: ${formatNumber(jp)} (45 menit/JP)`, MARGIN, y + 11);
    if (salaryRow.PAYMENT_DATE) {
      pdf.text(`Tanggal bayar: ${dateLong(salaryRow.PAYMENT_DATE)}`, MARGIN, y + 16);
    }

    const totalBottom = drawTotals(pdf, totalsX, y - 4, totalsW, [
      { label: "Subtotal", value: formatRupiah(baseAmount) },
      { label: "Bonus", value: formatRupiah(bonus) },
      { label: "Transport", value: formatRupiah(transport) },
      { label: "Potongan", value: "- " + formatRupiah(deduction) }
    ], "Total Gaji", formatRupiah(netSalary), true);

    y = Math.max(totalBottom, y + 24) + 15;

    const signer = String(salaryRow.PENERIMA || "Admin LPKS Arima Persada").trim();
    drawSignatureBlock(pdf, pw - MARGIN - 60, y, COMPANY.city, "Hormat kami,", signer);

    drawFooter(pdf, "Slip gaji dihasilkan otomatis oleh sistem ARIMA MANAGEMENT SYSTEM.");

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
