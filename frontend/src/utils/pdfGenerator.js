import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

async function captureImage(element) {
  if (!element) return null;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    return canvas.toDataURL('image/jpeg', 1.0);
  } catch (error) {
    console.error('Error capturing image:', error);
    return null;
  }
}

async function addImageToPDF(doc, imageElement, margin, yPos, pageWidth) {
  if (!imageElement) return yPos;

  try {
    const imageData = await captureImage(imageElement);
    if (!imageData) return yPos + 10;

    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (imgWidth * 9) / 16;
    
    doc.addImage(imageData, 'JPEG', margin, yPos, imgWidth, imgHeight);
    return yPos + imgHeight + 10;
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    doc.text('Error loading image', margin, yPos);
    return yPos + 10;
  }
}

function addTableHeaders(doc, headers, colWidths, margin, yPos) {
  let xPos = margin;
  doc.setFontSize(12);
  doc.setTextColor(100);
  
  headers.forEach((header, idx) => {
    doc.text(header, xPos, yPos);
    xPos += colWidths[idx];
  });

  return yPos + 8;
}

function addTableRow(doc, rowData, colWidths, margin, yPos) {
  let xPos = margin;
  rowData.forEach((text, idx) => {
    doc.text(text.toString(), xPos, yPos);
    xPos += colWidths[idx];
  });
  return yPos + 8;
}

export async function generatePDF({
  images,
  damageAnnotations,
  referenceNo,
  totalCost
}) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Add header
    doc.setFontSize(20);
    doc.text('Vehicle Inspection Report', pageWidth / 2, yPosition, { align: 'center' });
    
    // Add reference number and date
    yPosition += 15;
    doc.setFontSize(12);
    doc.text(`Reference Number: ${referenceNo}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

    // Process each image and its damage details
    for (const [index, image] of images.entries()) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      // Add image section header
      yPosition += 15;
      doc.setFontSize(14);
      doc.text(`Image ${index + 1}`, margin, yPosition);
      yPosition += 10;

      // Add image
      const imageElement = document.querySelector(`#report-image-${index}`);
      yPosition = await addImageToPDF(doc, imageElement, margin, yPosition, pageWidth);

      // Add damage details
      const relevantAnnotations = damageAnnotations.filter(
        annotation => annotation.imageName === image.imageName
      );

      if (relevantAnnotations.length > 0) {
        const headers = ['Part', 'Damage Type', 'Action', 'Cost'];
        const colWidths = [60, 40, 30, 40];
        
        yPosition = addTableHeaders(doc, headers, colWidths, margin, yPosition);
        doc.setTextColor(0);

        for (const annotation of relevantAnnotations) {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }

          const rowData = [
            annotation.partName || 'N/A',
            ['Scratch', 'Dent', 'Broken'][annotation.DamageTypeID] || 'N/A',
            ['Repair', 'Replace'][annotation.RepairReplaceID] || 'N/A',
            `₹${annotation.ActualCostRepair || '0'}`
          ];

          yPosition = addTableRow(doc, rowData, colWidths, margin, yPosition);
        }
      }

      yPosition += 10;
    }

    // Add total cost
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255);
    doc.text(`Total Cost: ₹${totalCost.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

    // Save the PDF
    doc.save(`vehicle-inspection-${referenceNo}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}