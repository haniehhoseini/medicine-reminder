const db = require('../utlis/database');
const axios = require('axios');
const cheerio = require('cheerio');

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


class Medicine{

    async getMedicine(){
        const query = "select * from medicine";
        let [ list ] = await db.connection.execute(query);
        return list;
    }

    async searchMedicine(items) {
        const { drug_name , ATCC_code } = items;
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
                const url = `https://en.wikipedia.org/wiki/${drugName}`;
                const html = await fetchHTML(url);

                if (html) {
                    const drugInfo = extractDrugInfo(html);
                    return drugInfo;
                } else {
                    res.status(500).send('Failed to retrieve HTML from Wikipedia');
                }
            } else {
                res.status(404).send('Drug not found');
            }
        } catch (error) {
            res.status(500).send('Database error');
            console.error('Database error:', error);
        }
    }
}

module.exports = new Medicine();