const db = require('../utils/database');
const axios = require('axios');
const cheerio = require('cheerio');


async function loadTranslateModule() {
    return await import('translate');
}

async function translatePersian(text) {
    try {
        const translate = await loadTranslateModule();
        translate.engine = 'libre';
        const res = await translate.default(text, 'fa');
        console.log("Trans" , res);
        return res;
    } catch (message) {
        return message;
    }
}

async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (message) {
        return message;
    }
}

function extractDrugInfo(html) {
    const $ = cheerio.load(html);
    const paragraphs = [];
    $('p').each((i, element) => {
        const text = $(element).text().trim();
        if (text) {
            paragraphs.push(text);
        }
    });
    return paragraphs;
}

async function fetchHTMLPhotos(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (message) {
        return message;
    }
}

function extractImageUrls(html) {
    const $ = cheerio.load(html);
    let firstImageUrl = null;

    
    $('img').each((i, element) => {
        const imgUrl = $(element).attr('src');
        if (imgUrl && imgUrl.startsWith('http')) {
            firstImageUrl = imgUrl;
            return false; 
        }
    });

    return firstImageUrl;
}


class Medicine {

    async getMedicine(page) {
        const offset = (page - 1) * 10;
        const query = `SELECT * FROM medicine LIMIT 10 OFFSET ${offset}`;
        
        try {
            const [list] = await db.connection.execute(query);
            return list;
        } catch (message) {
            throw message;
        }
    }

    async searchMedicine(items) {
        const { drug_name, ATCC_code } = items;
        let query = "SELECT * FROM medicine WHERE 1=1";
        let queryParams = [];

        if (drug_name) {
            query += " AND drug_name LIKE ?";
            queryParams.push(`%${drug_name}%`);
        }

        if (ATCC_code) {
            query += " AND ATCC_code LIKE ?";
            queryParams.push(`%${ATCC_code}%`);
        }
        try {
            const [rows] = await db.connection.execute(query, queryParams);
            return rows;
        } catch (message) {
            throw message;
        }
    }

    async getMedicineById(id) {
        const query = "SELECT * FROM medicine WHERE ATCC_code = ?";
    
        try {
            const [rows] = await db.connection.execute(query, [id]);
    
            if (rows.length > 0) {
                const drugName = rows[0].drug_name;
                console.log(drugName);
                const translation = await translatePersian(drugName);
                console.log(translation);
                const url = `https://fa.wikipedia.org/wiki/${translation}`;
                const html = await fetchHTML(url);
    
                if (html) {
                    const drugInfo = extractDrugInfo(html);
                    return drugInfo;
                } else {
                    throw ('اختلال در گرفتن اطلاعات این دارو لطفا بعدا جستجو کنید');
                }
            } else {
                throw ('اطلاعاتی برای این دارو یافت نشد');
            }
        } catch (message) {
            throw message;
        }
    }
    


    async addMedicine(req, res) {
        const medicineData = req.body;
        // Destructure the medicine data
        const { drug_name, salt, dosag_form, strengh, route_of_use, ATCC_code, ingredient, approved_clinical_indication, access_level, remarks, date, company_id } = medicineData;

        // Validate the data
        if (!drug_name || !salt || !dosag_form || !strengh || !route_of_use || !ATCC_code || !ingredient || !approved_clinical_indication || !access_level || !remarks || !date || !company_id) {
            throw new Error('لطفا همه ی فیلدهارو پر کنید');
        }

        // Check if the medicine already exists
        const checkQuery = "SELECT * FROM medicine WHERE ATCC_code = ?";
        const [rows] = await db.connection.execute(checkQuery, [ATCC_code]);
        if (rows.length > 0) {
            throw ('این کد قبلا برای داروی دیگری ثبت شده است');
        }

        // Insert the new medicine
        const insertQuery = `
            INSERT INTO medicine (
                drug_name, salt, dosag_form, strengh, route_of_use, ATCC_code,
                ingredient, approved_clinical_indication, access_level, remarks, date, company_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [
            drug_name, salt, dosag_form, strengh, route_of_use, ATCC_code,
            ingredient, approved_clinical_indication, access_level, remarks, date, company_id
        ];

        await db.connection.execute(insertQuery, insertValues);

        return res.status(201).json({ message: 'دارو با موفقیت ثبت شد' });
       
    };
  
    async updateMedicine(req, res) {
        const old_ATCC_code = req.params.ATCC_code;
        const items = req.body;
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    
        if (!token) {
            return res.status(401).json({ error: 'لطفا ابتدا وارد شوید' });
        }
        const { 
            drug_name, 
            salt, 
            dosag_form, 
            strengh, 
            route_of_use, 
            ATCC_code, 
            ingredient, 
            approved_clinical_indication, 
            access_level, 
            remarks, 
            date,
            company_id 
        } = items;
    
        const checkQuery = "SELECT * FROM medicine WHERE ATCC_code = ? and company_id = ?";
        const duplicateCheckQuery = "SELECT * FROM medicine WHERE ATCC_code = ?";
        const updateQuery = `
            UPDATE medicine SET
                drug_name = ?,
                salt = ?,
                dosag_form = ?,
                strengh = ?,
                route_of_use = ?,
                ATCC_code = ?,
                ingredient = ?,
                approved_clinical_indication = ?,
                access_level = ?,
                remarks = ?,
                date = ?
            WHERE ATCC_code = ? and company_id = ?;
        `;
    
        const updateValues = [
            drug_name ?? null,
            salt ?? null,
            dosag_form ?? null,
            strengh ?? null,
            route_of_use ?? null,
            ATCC_code ?? null,
            ingredient ?? null,
            approved_clinical_indication ?? null,
            access_level ?? null,
            remarks ?? null,
            date ?? null,
            old_ATCC_code,
            company_id 
        ];
    
        try {
            // Check if the medicine exists
            const [rows] = await db.connection.execute(checkQuery, [old_ATCC_code, company_id]);
            if (rows.length === 0) {
                return res.status(401).json({ error: 'همچین دارویی برای این شرکت ثبت نشده است' });

            }
    
            // Check if the new ATCC_code is already in use by another record
            if (ATCC_code !== old_ATCC_code) {
                const [duplicateRows] = await db.connection.execute(duplicateCheckQuery, [ATCC_code]);
                if (duplicateRows.length > 0) {
                    return res.status(401).json({ error: 'لطفا کد دیگری انتخاب کنید' });

                }
            }
    
            // Medicine exists, proceed with update
            await db.connection.execute(updateQuery, updateValues);
            return res.status(201).json({ error: 'دارو با موفیت تغییر یافت' });

        } catch (message) {
            throw message;
        }
    }

    async deleteMedicine(req, res) {
        const items = req.body;
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    
        if (!token) {
            return res.status(401).json({ error: 'لطفا ابتدا وارد شوید' });
        }
        const { ATCC_code, company_id } = items;
    
        const checkQuery = "SELECT * FROM medicine WHERE ATCC_code = ? AND company_id = ?";
        const deleteQuery = "DELETE FROM medicine WHERE ATCC_code = ? AND company_id = ?";
    
        try {
            // Check if the medicine exists
            const [rows] = await db.connection.execute(checkQuery, [ATCC_code, company_id]);
    
            if (rows.length === 0) {
                // Medicine does not exist
                return res.status(401).json({ message: 'همچین دارویی در دیتابیس وجود ندارد' });

            }
    
            // Medicine exists, proceed with deletion
            await db.connection.execute(deleteQuery, [ATCC_code, company_id]);
            return res.status(201).json({ message: 'دارو با موفقیت از لیست داروها پاک شد' });

        } catch (message) {
            throw message;
        }
    }
    
    async getImageUrls(medicineCode) {

        const query = "SELECT * FROM medicine WHERE ATCC_code = ?";
        const [rows] = await db.connection.execute(query, [medicineCode]);
        if (rows.length > 0) {
            const drugName = rows[0].drug_name;
            console.log(drugName);
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(drugName)}&tbm=isch`;
            const html = await fetchHTMLPhotos(searchUrl);
            if (html) {
                return extractImageUrls(html);
            } else {
                return [];
            }
        }
    }

    async getMedicineByCompanyID(companyID) {
        const query = "SELECT * FROM medicine WHERE company_id =?";
        try {
            const [list] = await db.connection.execute(query, [companyID]);
            return list;
        } catch (message) {
            throw message;
        }
    };

    async getMedicationTimesFromDatabase(medications) {
        const medicationTimes = [];
        const seenDrugs = new Set(); // مجموعه‌ای برای پیگیری داروهای دیده شده
    
        for (const medName of medications) {
            // جستجو در دیتابیس برای پیدا کردن دارو
            const query = 'SELECT * FROM medicine WHERE drug_name LIKE ?'; 
            const [results] = await db.connection.execute(query, [`%${medName}%`]);
    
            if (results.length > 0) {
                const drug = results[0];
                // بررسی اینکه زمان مصرف دارو وجود دارد و دارو تکراری نیست
                if (drug.time && !seenDrugs.has(drug.drug_name)) {
                    medicationTimes.push({
                        drug_name: drug.drug_name,
                        time: drug.time // زمان مصرف دارو
                    });
                    seenDrugs.add(drug.drug_name); // دارو را به مجموعه اضافه کن
                }
            }
        }
    
        return medicationTimes;
    }

    async saveMedicationsToPrescription(userId, medications) {
        try {
            const seenDrugs = new Set(); 
            for (const med of medications) {
                const { drug_name, time } = med;
    
                // بررسی اینکه دارو قبلاً ثبت نشده باشد
                if (!seenDrugs.has(drug_name)) {
                    const query = `
                        INSERT INTO prescription
                        (user_id, drug_name, clock, count, amount_of_use) 
                        VALUES (?, ?, ?, ?, ?)
                    `;
    
                    
                    const count = 1; 
                    const amount_of_use = "1 عدد در هر وعده"; 
    
                    await db.connection.execute(query, [
                        userId,
                        drug_name,
                        time,
                        count,
                        amount_of_use,
                    ]);
    
                    seenDrugs.add(drug_name); 
                }
            }
    
            console.log("Medications saved successfully.");
        } catch (error) {
            console.error("Error saving medications to prescription:", error);
        }
    }
    
    async fetchUserMedications(userId) {
        try {
            const query = `
                SELECT drug_name, clock, count, amount_of_use 
                FROM prescription 
                WHERE user_id = ?
            `;
    
            const [medications] = await db.connection.execute(query, [userId]);
    
            if (medications.length === 0) {
                return { message: 'هیچ دارویی برای این کاربر ثبت نشده است', medications: [] };
            }
    
            return {
                message: 'لیست داروها با موفقیت دریافت شد',
                medications: medications
            };
        } catch (error) {
            console.error('Error fetching user medications:', error);
            return { message: 'خطایی در سرور رخ داده است', medications: [] };
        }
    }
   
    
}

module.exports = new Medicine();