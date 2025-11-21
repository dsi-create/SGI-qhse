import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Exporte des données vers un fichier Excel
 * @param data - Tableau de données à exporter
 * @param headers - En-têtes des colonnes (clés et labels)
 * @param filename - Nom du fichier à générer
 * @param sheetName - Nom de la feuille Excel (optionnel)
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string,
  sheetName: string = 'Données'
) => {
  try {
    // Préparer les données pour Excel
    const excelData = data.map(item => {
      const row: Record<string, any> = {};
      headers.forEach(({ key, label }) => {
        const value = item[key];
        
        // Formater les dates
        if (value instanceof Date) {
          row[label] = format(value, 'dd/MM/yyyy HH:mm', { locale: fr });
        } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
          // Format ISO date string
          try {
            row[label] = format(new Date(value), 'dd/MM/yyyy', { locale: fr });
          } catch {
            row[label] = value;
          }
        } else if (value === null || value === undefined) {
          row[label] = '';
        } else if (typeof value === 'object') {
          // Pour les objets complexes, convertir en JSON string
          row[label] = JSON.stringify(value);
        } else {
          row[label] = value;
        }
      });
      return row;
    });

    // Créer un workbook
    const wb = XLSX.utils.book_new();
    
    // Convertir les données en worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajuster la largeur des colonnes
    const colWidths = headers.map(({ label }) => ({
      wch: Math.max(label.length, 15), // Largeur minimale de 15 caractères
    }));
    ws['!cols'] = colWidths;
    
    // Ajouter le worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Générer le fichier Excel
    const fileName = `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm', { locale: fr })}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error;
  }
};

/**
 * Exporte des statistiques vers Excel
 */
export const exportStatsToExcel = (
  stats: Record<string, any>,
  filename: string,
  title: string = 'Statistiques'
) => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Convertir les statistiques en tableau de clés-valeurs
    const statsData = Object.entries(stats).map(([key, value]) => ({
      Indicateur: key,
      Valeur: typeof value === 'object' ? JSON.stringify(value) : value,
    }));
    
    const ws = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, ws, title);
    
    const fileName = `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm', { locale: fr })}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erreur lors de l\'export des statistiques:', error);
    throw error;
  }
};

/**
 * Exporte plusieurs feuilles vers Excel
 */
export const exportMultipleSheetsToExcel = (
  sheets: Array<{ name: string; data: any[]; headers: { key: string; label: string }[] }>,
  filename: string
) => {
  try {
    const wb = XLSX.utils.book_new();
    
    sheets.forEach(({ name, data, headers }) => {
      const excelData = data.map(item => {
        const row: Record<string, any> = {};
        headers.forEach(({ key, label }) => {
          const value = item[key];
          if (value instanceof Date) {
            row[label] = format(value, 'dd/MM/yyyy HH:mm', { locale: fr });
          } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            try {
              row[label] = format(new Date(value), 'dd/MM/yyyy', { locale: fr });
            } catch {
              row[label] = value;
            }
          } else {
            row[label] = value ?? '';
          }
        });
        return row;
      });
      
      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = headers.map(({ label }) => ({ wch: Math.max(label.length, 15) }));
      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, name);
    });
    
    const fileName = `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm', { locale: fr })}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erreur lors de l\'export multi-feuilles:', error);
    throw error;
  }
};



