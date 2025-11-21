import { useState } from "react";
import { Button } from "../ui/button";
import { Icon } from "../Icon";
import { generatePortalReportPDF } from "@/utils/portalReportsGenerator";
import { showSuccess, showError } from "@/utils/toast";
import { PortalReportData } from "@/utils/portalReportsGenerator";

interface ExportPDFButtonProps {
  portalType: string;
  data: PortalReportData;
  className?: string;
}

export const ExportPDFButton = ({ portalType, data, className }: ExportPDFButtonProps) => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await generatePortalReportPDF(portalType, data);
      showSuccess('Rapport PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      showError('Erreur lors de la génération du rapport PDF.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateReport}
      disabled={isGeneratingReport}
      className={className || "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"}
      size="sm"
    >
      <Icon name={isGeneratingReport ? "Loader2" : "Download"} className={`mr-2 h-4 w-4 ${isGeneratingReport ? 'animate-spin' : ''}`} />
      {isGeneratingReport ? 'Génération...' : 'Exporter PDF'}
    </Button>
  );
};




