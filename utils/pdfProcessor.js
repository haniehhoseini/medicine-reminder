const Tesseract = require('tesseract.js');
const pdfPoppler = require('pdf-poppler');
const path = require('path');
const fs = require('fs');

async function extractMedicationsFromPdf(pdfPath) {
    try {
        // مسیر موقت برای ذخیره تصاویر
        const outputDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        // تبدیل PDF به تصاویر
        const opts = {
            format: 'jpeg',
            out_dir: outputDir,
            out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
            page: null, // تمام صفحات
        };

        await pdfPoppler.convert(pdfPath, opts);
        console.log('PDF converted to images.');

        // خواندن تمام تصاویر تولیدشده
        const imageFiles = fs
            .readdirSync(outputDir)
            .filter(file => file.startsWith(opts.out_prefix) && file.endsWith('.jpg'));

        const allText = [];

        // OCR برای هر تصویر
        for (const imageFile of imageFiles) {
            const imagePath = path.join(outputDir, imageFile);
            console.log(`Processing image: ${imageFile}`);

            const result = await Tesseract.recognize(imagePath, 'fas'); // زبان فارسی
            allText.push(result.data.text);

            // حذف فایل تصویر موقت
            fs.unlinkSync(imagePath);
        }

        // حذف دایرکتوری موقت
        fs.rmdirSync(outputDir);

        // ترکیب متن‌های استخراج‌شده
        const combinedText = allText.join(' ').replace(/\s+/g, ' ').trim();

        // Regex برای شناسایی داروها
        const regex = /\b(?:Paracetamol|Ibuprofen|Aspirin|Amoxicillin|[\u0600-\u06FF]+)\b/gi;
        const matches = combinedText.match(regex);

        // حذف موارد تکراری
        const medicationNames = matches ? [...new Set(matches.map(med => med.trim()))] : [];

        return medicationNames;
    } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
    }
}

module.exports = { extractMedicationsFromPdf };