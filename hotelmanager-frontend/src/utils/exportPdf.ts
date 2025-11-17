import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getMyHotel } from "../api/hotelApi";

export type ExportOptions = {
  fileName?: string;
  scale?: number;
  orientation?: "p" | "l";
  marginMm?: number;
  headerText?: string;
};

export async function exportElementToPDF(
  element: HTMLElement,
  optionsOrFileName?: ExportOptions | string
): Promise<void> {
  let options: ExportOptions;
  if (typeof optionsOrFileName === "string") {
    options = { fileName: optionsOrFileName };
  } else {
    options = optionsOrFileName ?? {};
  }

  const {
    fileName = "planning.pdf",
    scale = 2,
    orientation = "l",
    marginMm = 8,
    headerText,
  } = options;

  let hotel: any = null;
  try {
    hotel = await getMyHotel();
  } catch (err) {
    console.error("Impossible de récupérer les infos hôtel :", err);
  }

  if ((document as any).fonts?.ready) {
    await (document as any).fonts.ready;
  }

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    windowWidth: element.scrollWidth,
  });

  const pdf = new jsPDF(orientation, "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const charcoal = "#1E1E2F"; 
  const gold = "#C9A227";     
  const textDark = "#111827";
  const textMuted = "#f0fdf4";

  const headerHeight = 35;

  pdf.setFillColor(charcoal);
  pdf.rect(0, 0, pageWidth, headerHeight, "F");

  try {
    const bgBlob = await fetch("/bg.png", { cache: "no-store" }).then(r => {
      if (!r.ok) throw new Error(`bg.png HTTP ${r.status}`);
      return r.blob();
    });
    const bgDataUrl = await blobToDataURL(bgBlob);
    const fmt = bgBlob.type.includes("jpeg") || bgBlob.type.includes("jpg") ? "JPEG" : "PNG";
    pdf.addImage(bgDataUrl, fmt as any, 0, 0, pageWidth, headerHeight);
  } catch (e) {
    console.warn("Background header image not added:", e);
  }

  pdf.setDrawColor(gold);
  pdf.setLineWidth(0.8);
  pdf.line(0, headerHeight, pageWidth, headerHeight);

  let logoW = 0;
  let logoH = 0;
  if (hotel?.logoUrl) {
    try {
      const logoBlob = await fetch(hotel.logoUrl, { mode: "cors" }).then(r => r.blob());
      const logoDataUrl = await blobToDataURL(logoBlob);
      logoW = 20;
      logoH = 50;
      const logoX = pageWidth - marginMm - logoW;
      const logoY = 7;
      const logoFmt = logoBlob.type.includes("jpeg") || logoBlob.type.includes("jpg") ? "JPEG" : "PNG";
      pdf.addImage(logoDataUrl, logoFmt as any, logoX, logoY, logoW, logoW);
    } catch (e) {
      console.warn("Erreur chargement logo:", e);
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor("#ffffff");
  pdf.text(hotel?.name ?? "Nom de l'hôtel", marginMm, 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(textMuted);
  let infoY = 17;
  if (hotel?.address) { pdf.text(hotel.address, marginMm, infoY); infoY += 5; }
  if (hotel?.phone)   { pdf.text(`Tel: ${hotel.phone}`, marginMm, infoY); infoY += 5; }
  if (hotel?.email)   { pdf.text(hotel.email, marginMm, infoY); infoY += 5; }
  if ((hotel as any)?.website) { pdf.text((hotel as any).website, marginMm, infoY); infoY += 5; }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(textDark);
  pdf.text(headerText ?? "Planning", pageWidth / 2, headerHeight + 10, { align: "center" });

  const usableWidth = pageWidth - marginMm * 2;
  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = headerHeight + 15;            
  let remainingHeight = imgHeight;
  let offsetMm = 0;

  while (remainingHeight > 0) {
    if (offsetMm > 0) {
      pdf.addPage();
      pdf.setDrawColor(gold);
      pdf.setLineWidth(0.4);
      pdf.line(marginMm, marginMm, pageWidth - marginMm, marginMm);
      y = marginMm + 4;
    }

    const availableMm = pageHeight - y - marginMm - 30; 
    const drawMm = Math.min(remainingHeight, availableMm);

    const mmToPx = (mm: number) => (mm * canvas.width) / imgWidth;
    const sliceStartPx = mmToPx(offsetMm);
    const sliceHeightPx = mmToPx(drawMm);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.min(canvas.height - sliceStartPx, sliceHeightPx);
    const ctx = pageCanvas.getContext("2d")!;
    ctx.drawImage(
      canvas,
      0, sliceStartPx,
      canvas.width, pageCanvas.height,
      0, 0,
      canvas.width, pageCanvas.height
    );

    const pageImg = pageCanvas.toDataURL("image/png");
    const pageImgHeightMm = (pageCanvas.height * imgWidth) / canvas.width;

    pdf.addImage(pageImg, "PNG", marginMm, y, imgWidth, pageImgHeightMm, undefined, "FAST");

    remainingHeight -= drawMm;
    offsetMm += drawMm;
  }

  const signY = pageHeight - 20;
  pdf.setDrawColor(gold);
  pdf.line(marginMm, signY, marginMm + 60, signY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor("#374151");
  pdf.text("Signature", marginMm, signY + 5);

  const today = new Date();
  pdf.text(`Date : ${today.toLocaleDateString()}`, pageWidth - marginMm - 40, signY + 5);

  pdf.setFontSize(8);
  pdf.setTextColor("#6b7280");
  pdf.text(
    `Document généré le ${today.toLocaleString()} - ${hotel?.name ?? ""}`,
    marginMm,
    pageHeight - 5
  );

  pdf.save(fileName);
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}
