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
    } catch (error) {
        console.log(`Error translatePersian: ${error.message}`);
    }
}

async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.error(`Error fetching HTML: ${error.message}`);
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
    } catch (error) {
        console.error(`Error fetching HTML: ${error.message}`);
        return null;
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
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
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
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
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
                    throw new Error('اختلال در گرفتن اطلاعات این دارو لطفا بعدا جستجو کنید');
                }
            } else {
                throw new Error('اطلاعاتی برای این دارو یافت نشد');
            }
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    


    async addMedicine(medicineData) {
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
            throw new Error('این کد قبلا برای داروی دیگری ثبت شده است');
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

        return 'دارو با موفقیت ثبت شد'; // Success message
    };

    
    
    
    async updateMedicine(old_ATCC_code, items) {
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
                // Medicine does not exist
                return 'همچین دارویی برای این شرکت ثبت نشده است';
            }
    
            // Check if the new ATCC_code is already in use by another record
            if (ATCC_code !== old_ATCC_code) {
                const [duplicateRows] = await db.connection.execute(duplicateCheckQuery, [ATCC_code]);
                if (duplicateRows.length > 0) {
                    return 'لطفا کد دیگری انتخاب کنید';
                }
            }
    
            // Medicine exists, proceed with update
            await db.connection.execute(updateQuery, updateValues);
            return 'دارو با موفیت تغییر یافت';
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    


    async deleteMedicine(items){
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
                return 'همچین دارویی در دیتابیس وجود ندارد';
            }
    
            // Medicine exists, proceed with deletion
            await db.connection.execute(deleteQuery, [ATCC_code, company_id]);
            return 'دارو با موفقیت از لیست داروها پاک شد';
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
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
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    };
}

module.exports = new Medicine();