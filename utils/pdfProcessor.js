// pdfProcessor.js

const fs = require('fs');
const pdfParser = require('pdf-parse');

// تابعی برای استخراج داروها از فایل PDF
async function extractMedicationsFromPdf(pdfPath) {
    const data = await pdfParser(fs.readFileSync(pdfPath));
    const text = data.text;

    // اینجا می‌توانید روش‌های خاصی برای شناسایی داروها از متن استفاده کنید.
    // برای مثال استفاده از یک regex ساده برای استخراج داروها:
    const medicationNames = [];
    const regex = /\b[A-Za-z0-9\s]+\b/g;  // این فقط یک مثال است که می‌توانید آن را بهبود دهید
    const matches = text.match(regex);

    if (matches) {
        matches.forEach(med => {
            medicationNames.push(med.trim());
        });
    }
    return medicationNames;
}

module.exports = { extractMedicationsFromPdf };
