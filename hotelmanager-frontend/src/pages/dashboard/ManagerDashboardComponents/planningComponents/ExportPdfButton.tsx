import React from "react";
import { FileDown } from "lucide-react";
import { exportElementToPDF } from "../../../../utils/exportPdf";

type Props = {
  // match avec useRef<HTMLDivElement>(null)
  targetRef: React.MutableRefObject<HTMLDivElement | null>;
  fileName: string;
  headerText?: string;
};

export default function ExportPdfButton({ targetRef, fileName, headerText }: Props) {
  const onExport = async () => {
    const el = targetRef.current;
    if (!el) return;
    await exportElementToPDF(el, {
      fileName,
      orientation: "l",
      marginMm: 8,
      scale: 3,
      headerText,
    });
  };

  return (
    <button
      onClick={onExport}
      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 hover:text-blue-900 transition font-medium"
    >
      <FileDown className="w-4 h-4" />
      Exporter PDF
    </button>
  );
}
