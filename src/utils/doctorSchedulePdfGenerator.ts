import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import availabilityGrid from '@/data/consultationSchedule.json';

interface AvailabilitySlot {
  start: string;
  end: string;
  room: string;
  shortRoom: string;
  specialty: string;
  doctor: string;
  location?: string;
}

interface DayAvailability {
  day: string;
  slots: AvailabilitySlot[];
}

const scheduleData = availabilityGrid as DayAvailability[];

const normalizeDay = (day: string) =>
  day.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const createReportHTML = (selectedDay?: string): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '24px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#1f2937';
  container.style.backgroundColor = '#ffffff';

  const daysToDisplay = selectedDay
    ? scheduleData.filter((d) => normalizeDay(d.day) === normalizeDay(selectedDay))
    : scheduleData;

  const subtitle = selectedDay
    ? `Jour : ${daysToDisplay[0]?.day ?? selectedDay}`
    : 'Planning hebdomadaire';

  let html = `
    <div style="text-align: center; margin-bottom: 24px; border-bottom: 3px solid #0891b2; padding-bottom: 16px;">
      <h1 style="font-size: 22px; margin: 0 0 8px; color: #0e7490;">Planning des salles – Médecins</h1>
      <p style="font-size: 14px; margin: 0; color: #6b7280;">${subtitle}</p>
      <p style="font-size: 12px; margin: 8px 0 0; color: #9ca3af;">Généré le ${format(new Date(), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
    </div>
  `;

  if (daysToDisplay.length === 0) {
    html += '<p style="text-align: center; color: #6b7280;">Aucun créneau défini pour cette période.</p>';
  } else {
    for (const dayBlock of daysToDisplay) {
      html += `
        <div style="margin-bottom: 28px; page-break-inside: avoid;">
          <h2 style="font-size: 16px; color: #0e7490; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${dayBlock.day}
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #ecfeff;">
                <th style="padding: 10px; border: 1px solid #a5f3fc; text-align: left;">Horaire</th>
                <th style="padding: 10px; border: 1px solid #a5f3fc; text-align: left;">Salle</th>
                <th style="padding: 10px; border: 1px solid #a5f3fc; text-align: left;">Spécialité</th>
                <th style="padding: 10px; border: 1px solid #a5f3fc; text-align: left;">Médecin</th>
              </tr>
            </thead>
            <tbody>
              ${dayBlock.slots
                .map(
                  (slot) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${slot.start} – ${slot.end}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">${slot.shortRoom}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${slot.specialty}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${slot.doctor || '—'}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
};

export const generateDoctorSchedulePDF = async (selectedDay?: string) => {
  const reportElement = createReportHTML(selectedDay);

  try {
    const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const daySuffix = selectedDay
      ? `-${normalizeDay(selectedDay)}`
      : '-semaine';
    pdf.save(`planning-salles-medecins${daySuffix}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } finally {
    document.body.removeChild(reportElement);
  }
};
