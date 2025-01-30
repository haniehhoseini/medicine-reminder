const db = require('../utils/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = require('../config/keys').secretOrKey;
const Roles = require('../shared/role');



class Auth {
    
    formatDate(date) {
        
        if (!date || date.trim() === '') {
            return null; 
        }
           
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    formatInteger(value) {
        const parsedValue = parseInt(value, 10);
        return isNaN(parsedValue) || value.trim() === '' ? null : parsedValue;
    }

    async exitRegisterPatient(items) {
        const { codemeli } = items;
        const query = 'SELECT * FROM user WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerPatient(req, res) {
        const items = req.body; // فرض بر این است که داده‌ها از body درخواست گرفته می‌شود
        const requiredFields = [
            'codemeli', 
            'password', 
            'firstname', 
            'lastname', 
            'mobile', 
            'address', 
            'gender', 
            'birthday'
        ];
    
        // بررسی وجود فیلدهای الزامی
        for (const field of requiredFields) {
            if (!items[field]) {
                return res.status(401).json({ message: `فیلد ${field} الزامی است و نباید خالی باشد.` });
            }
        }
    
        // بررسی وجود کاربر با مشخصات داده شده
        if (await this.exitRegisterPatient(items)) {
            const { 
                codemeli, 
                password, 
                firstname, 
                lastname, 
                mobile, 
                address, 
                gender, 
                image_url, 
                birthday, 
                relatives_id, 
                role,
                ensurance 
            } = items;
    
            const query = `INSERT INTO user (
                                codemeli, 
                                password, 
                                firstname, 
                                lastname, 
                                mobile, 
                                address, 
                                gender, 
                                image_url, 
                                birthday, 
                                relatives_id, 
                                role,
                                ensurance ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
            const hashpassword = await bcrypt.hash(password, 10);
            const formattedBirthday = this.formatDate(birthday);
            const formattedRelativesId = this.formatInteger(relatives_id);
    
            const defaultMaleImageUrl = 'https://www.svgrepo.com/show/382101/male-avatar-boy-face-man-user.svg';
            const defaultFemaleImageUrl = 'https://cdn.icon-icons.com/icons2/2643/PNG/512/female_woman_avatar_people_person_white_tone_icon_159370.png';
    
            // تنظیم تصویر پیش‌فرض بر اساس جنسیت در صورتی که image_url خالی باشد
            let finalImageUrl = image_url;
            if (!finalImageUrl) {
                if (gender === 'مذکر') {
                    finalImageUrl = defaultMaleImageUrl;
                } else if (gender === 'مونث') {
                    finalImageUrl = defaultFemaleImageUrl;
                } else {
                    // اختیاری: مدیریت حالت‌هایی که جنسیت مشخص نشده یا دیگر است
                    finalImageUrl = defaultMaleImageUrl;
                }
            }
    
            const values = [
                codemeli ?? null,
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                mobile ?? null,
                address ?? null,
                gender ?? null,
                finalImageUrl,
                formattedBirthday,
                formattedRelativesId,
                role ?? Roles.PATIENT,
                ensurance ?? null,
            ];
    
            try {
                const [result] = await db.connection.execute(query, values);
                return res.status(201).json({ message: 'کاربر با موفقیت ثبت شد', result });
            } catch (message) {
                return res.status(500).json({ message: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.' });
            }
        } else {
            return res.status(400).json({ message: 'کاربری با این مشخصات قبلا ثبت نام کرده است' });
        }
    }
    
    async patientUpdate(req, res) {
        const items = req.body;
    
        try {
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ message: 'شناسه کاربر ارسال نشده است' });
            }
    
            const { password, firstname, lastname, mobile, address, gender, image_url, birthday, relatives_id, ensurance } = items;
    
            // فرمت مقادیر
            const formattedBirthday = this.formatDate(birthday);
            const formattedRelativesId = this.formatInteger(relatives_id);
            const hashpassword = password ? await bcrypt.hash(password, 10) : null;
    
            // کوئری SQL
            const query = `UPDATE user SET
                password = COALESCE(?, password),
                firstname = COALESCE(?, firstname),
                lastname = COALESCE(?, lastname),
                mobile = COALESCE(?, mobile),
                address = COALESCE(?, address),
                gender = COALESCE(?, gender),
                image_url = COALESCE(?, image_url),
                birthday = COALESCE(?, birthday),
                relatives_id = COALESCE(?, relatives_id),
                ensurance = COALESCE(?, ensurance)
                WHERE user_id = ?`;
    
            // آرایه مقادیر
            const values = [
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                mobile ?? null,
                address ?? null,
                gender ?? null,
                image_url ?? null,
                formattedBirthday,
                formattedRelativesId,
                ensurance ?? null,
                user_id
            ];
    
            // اجرای کوئری
            const [result] = await db.connection.execute(query, values);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'کاربری با این شناسه یافت نشد' });
            }
    
            return res.status(200).json({ message: 'کاربر با موفقیت بروزرسانی شد', result });
    
        } catch (error) {
            console.error('خطا در پردازش درخواست:', error);
            return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
        }
    }
    
    async exitRegisterDoctor(items) {
        const { codemeli } = items;
        const query = 'SELECT * FROM doctor WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerDoctor(req, res) {
        try {
            const items = req.body;
            const requiredFields = [
                'codemeli', 'password', 'firstname', 'lastname', 
                'mobile', 'address', 'gender', 'birthday', 
                'expertise', 'code', 'city', 'hospital'
            ];

            for (const field of requiredFields) {
                if (!items[field]) {
                    return res.status(401).json({ message: `فیلد ${field} الزامی است و نباید خالی باشد.` });
                }
            }

            // Extract and format data
            const {
                codemeli, password, firstname, lastname, 
                address, city, hospital, gender, image_url, 
                birthday, expertise, code, role
            } = items;

            const query = `INSERT INTO doctor (
                codemeli, password, firstname, lastname, 
                address, city, hospital, gender, image_url, 
                birthday, expertise, code, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const hashpassword = await bcrypt.hash(password, 10);
            const formattedBirthday = this.formatDate ? this.formatDate(birthday) : birthday;

            let finalImageUrl = image_url || 'https://icones.pro/wp-content/uploads/2021/03/symbole-du-docteur-icone-png-vert.png';

            const values = [
                codemeli ?? null, hashpassword, firstname ?? null, 
                lastname ?? null, address ?? null, city ?? null, 
                hospital ?? null, gender ?? null, finalImageUrl, 
                formattedBirthday, expertise ?? null, code ?? null, 
                role ?? Roles.DOCTOR
            ];

            const [dbResult] = await db.connection.execute(query, values);
            return res.status(201).json({ message: 'کاربر با موفقیت ثبت شد', result: dbResult });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'خطای داخلی سرور لطفا بعدا تلاش کنید' });
        }
    
    }

    async doctorUpdate(req, res) {
        const items = req.body;
    
        try {
            const { doctor_id } = req.params;
            if (!doctor_id) {
                return res.status(400).json({ message: 'شناسه پزشک ارسال نشده است' });
            }
    
            const { 
                password, 
                firstname, 
                lastname, 
                address, 
                city, 
                hospital, 
                gender, 
                image_url, 
                birthday, 
                expertise, 
                code 
            } = items;
    
            // فرمت مقادیر
            const formattedBirthday = this.formatDate(birthday);
            const hashpassword = password ? await bcrypt.hash(password, 10) : null;
    
            // کوئری SQL
            const query = `UPDATE doctor SET 
                password = COALESCE(?, password), 
                firstname = COALESCE(?, firstname), 
                lastname = COALESCE(?, lastname), 
                address = COALESCE(?, address), 
                city = COALESCE(?, city), 
                hospital = COALESCE(?, hospital), 
                gender = COALESCE(?, gender), 
                image_url = COALESCE(?, image_url), 
                birthday = COALESCE(?, birthday), 
                expertise = COALESCE(?, expertise), 
                code = COALESCE(?, code) 
                WHERE doctor_id = ?`;
    
            // آرایه مقادیر
            const values = [
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                address ?? null,
                city ?? null,
                hospital ?? null,
                gender ?? null,
                image_url ?? null,
                formattedBirthday,
                expertise ?? null,
                code ?? null,
                doctor_id
            ];
    
            // اجرای کوئری
            const [result] = await db.connection.execute(query, values);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'پزشکی با این شناسه یافت نشد' });
            }
    
            return res.status(200).json({ message: 'پزشک با موفقیت بروزرسانی شد', result });
    
        } catch (error) {
            console.error('خطا در پردازش درخواست:', error);
            return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
        }
    }

    async exitRegisterCompany(items){
        const { codemeli } = items;
        const query = 'SELECT * FROM company WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerCompany(req, res) {
        const items = req.body;
        console.log(items);
        
        const requiredFields = [
            'license_code', 
            'firstname',
            'lastname',
            'mobile',
            'codemeli',
            'password',
            'role',
        ];
    
        for (const field of requiredFields) {
            if (!items[field] || items[field].trim() === '') {
                return res.status(400).json({ message: `فیلد ${field} الزامی است و نباید خالی باشد.` });
            }
        }
    
        try {
            if (await this.exitRegisterCompany(items)) {
                const {
                    codemeli,
                    password,
                    firstname,
                    lastname,
                    license_code,
                    mobile,
                    role,
                    image_url
                } = items;
    
                const query = `INSERT INTO company (
                    codemeli,
                    password,
                    firstname,
                    lastname,
                    license_code, 
                    mobile,
                    role,
                    image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
                const hashpassword = await bcrypt.hash(password, 10);
    
                let finalImageUrl = image_url;
                if (!finalImageUrl) {
                    finalImageUrl = 'https://i.pngimg.me/thumb/f/720/m2i8A0K9A0b1G6H7.jpg';
                }
    
                const values = [
                    codemeli ?? null,
                    hashpassword,
                    firstname ?? null,
                    lastname ?? null,
                    license_code ?? null, 
                    mobile ?? null,
                    role ?? Roles.PHARMACIST,
                    finalImageUrl
                ];
    
                const [result] = await db.connection.execute(query, values);
                return res.status(201).json({ message: 'کاربر با موفقیت ثبت شد', result });
            } else {
                return res.status(409).json({ message: 'کاربری با این مشخصات قبلاً ثبت نام کرده است' });
            }
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'خطا در ثبت کاربر', error: error.message });
        }
    }
    async companyUpdate(req, res) {
        const items = req.body;
    
        try {
            const { company_id } = req.params;
            if (!company_id) {
                return res.status(400).json({ message: 'شناسه شرکت ارسال نشده است' });
            }
    
            const {       
                password,
                firstname,
                lastname,
                license_code,
                mobile,
                image_url 
            } = items;
    
            // هش کردن رمز عبور در صورت وجود
            const hashpassword = password ? await bcrypt.hash(password, 10) : null;
    
            // کوئری SQL
            const query = `UPDATE company SET 
                password = COALESCE(?, password), 
                firstname = COALESCE(?, firstname), 
                lastname = COALESCE(?, lastname), 
                license_code = COALESCE(?, license_code), 
                mobile = COALESCE(?, mobile), 
                image_url = COALESCE(?, image_url) 
                WHERE company_id = ?`;
    
            // مقادیر جایگذاری در کوئری
            const values = [
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                license_code ?? null,
                mobile ?? null,
                image_url ?? null,
                company_id
            ];
    
            // اجرای کوئری
            const [result] = await db.connection.execute(query, values);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'شرکتی با این شناسه یافت نشد' });
            }
    
            return res.status(200).json({ message: 'شرکت با موفقیت بروزرسانی شد', result });
    
        } catch (error) {
            console.error('خطا در پردازش درخواست:', error);
            return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
        }
    }

    async exitRegisterRelatives(items){
        const { codemeli } = items;
        const query = 'SELECT * FROM relatives WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerRelatives(req, res){
        const items = req.body;
        const requiredFields = [
            'codemeli', 
            'password', 
            'firstname', 
            'lastname', 
            'mobile', 
            'user_id'
        ];
    
        for (const field of requiredFields) {
            if (!items[field]) {
                return res.status(500).json({ message: `فیلد ${field} الزامی است و نباید خالی باشد.` });
            }
        }
        if (await this.exitRegisterRelatives(items)) {
            const { 
                codemeli, 
                password, 
                firstname, 
                lastname, 
                mobile,
                user_id, 
                image_url, 
                role
            } = items;
            const query = `INSERT INTO relatives (
                codemeli, 
                password, 
                firstname, 
                lastname, 
                mobile,
                user_id, 
                image_url, 
                role ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const hashpassword = await bcrypt.hash(password, 10);
    
        
                let finalImageUrl = image_url;
                if (!finalImageUrl) {
                    finalImageUrl = 'https://cdn-icons-png.flaticon.com/512/2749/2749769.png';
                }
    
                const values = [
                    codemeli ?? null, 
                    hashpassword, 
                    firstname ?? null, 
                    lastname ?? null, 
                    mobile ?? null,
                    user_id ?? null, 
                    finalImageUrl, 
                    role ?? Roles.RELATIVES
                ];
    
                try {
                    const [res] = await db.connection.execute(query, values);
                    return res.status(201).json({ message: 'کاربر با موفقیت ثبت شد', res });

                } catch (message) {
                    throw message;  
                }
        } else {
            return res.status(500).json({ message: 'کاربری با این مشخصات قبلا ثبت نام کرده است' });
        }
    }  
    async relativesUpdate(req, res) {
        const items = req.body;
    
        try {
            const { relatives_id } = req.params;
            if (!relatives_id) {
                return res.status(400).json({ message: 'شناسه وابسته ارسال نشده است' });
            }
    
            const {
                password, 
                firstname, 
                lastname, 
                mobile,
                user_id, 
                image_url 
            } = items;
    
            // هش کردن رمز عبور در صورت وجود
            const hashpassword = password ? await bcrypt.hash(password, 10) : null;
    
            // کوئری SQL
            const query = `UPDATE relatives SET 
                password = COALESCE(?, password), 
                firstname = COALESCE(?, firstname), 
                lastname = COALESCE(?, lastname), 
                mobile = COALESCE(?, mobile), 
                user_id = COALESCE(?, user_id), 
                image_url = COALESCE(?, image_url) 
                WHERE relatives_id = ?`;
    
            // مقادیر جایگذاری در کوئری
            const values = [
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                mobile ?? null,
                user_id ?? null,
                image_url ?? null,
                relatives_id
            ];
    
            // اجرای کوئری
            const [result] = await db.connection.execute(query, values);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'وابسته‌ای با این شناسه یافت نشد' });
            }
    
            return res.status(200).json({ message: 'اطلاعات وابسته با موفقیت بروزرسانی شد', result });
    
        } catch (error) {
            console.error('خطا در پردازش درخواست:', error);
            return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
        }
    }
    async login(req, res) {
        const { codemeli, password, role } = req.body;
    
        const roleTables = {
            DOCTOR: 'doctor',
            PHARMACIST: 'company',
            RELATIVES: 'relatives',
            PATIENT: 'user'
        };
    
        const tableName = roleTables[role];
        if (!tableName) {
            return res.status(400).json({ message: 'نقش کاربری نامعتبر است' });
        }
    
        const query = `
            SELECT password, role, firstname, lastname, image_url, ${tableName}_id 
            FROM ${tableName} 
            WHERE codemeli = ?
        `;
    
        try {
            const [list] = await db.connection.execute(query, [codemeli]);
            if (list.length === 0) {
                return res.status(401).json({ message: 'اطلاعات وارد شده صحیح نیست' });
            }
    
            const user = list[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
    
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'اطلاعات وارد شده صحیح نیست' });
            }
    
            const payload = {
                codemeli,
                role: user.role,
                firstname: user.firstname,
                lastname: user.lastname,
                image_url: user.image_url,
                user_id: user.user_id || null,
                doctor_id: user.doctor_id || null,
                company_id: user.company_id || null,
                relatives_id: user.relatives_id || null
            };
    
            const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    
            // Register user as logged in
            if (user.user_id) {
                require('../model/notification').setLoggedInUser(user.user_id);
            }
    
            return res.status(200).json({ token, message: 'با موفقیت وارد شدید' });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
        }
    }
  
    async getMe(req, res) {
        try {
            const { user_id, doctor_id, company_id, relatives_id } = req.body;
            
            // تعیین شناسه اصلی بر اساس داده‌های ارسالی
            const id = user_id || doctor_id || company_id || relatives_id;
            if (!id) {
                return res.status(400).json({ error: 'شناسه کاربر ارسال نشده است' });
            }
    
            // تعیین جدول مناسب بر اساس نوع شناسه ارسال شده
            const tableMapping = {
                user_id: 'user',
                doctor_id: 'doctor',
                company_id: 'company',
                relatives_id: 'relatives'
            };
            
            const tableName = Object.keys(tableMapping).find(key => req.body[key]);
            if (!tableName) {
                return res.status(400).json({ error: 'نوع شناسه نامعتبر است' });
            }
    
            const selectedTable = tableMapping[tableName];
            
            // دریافت اطلاعات از جدول مرتبط
            const query = `SELECT * FROM ${selectedTable} WHERE ${tableName} = ?`;
            const [rows] = await db.connection.execute(query, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ error: 'کاربری با این مشخصات یافت نشد' });
            }
    
            const user = rows[0];
            return res.status(200).json({ message: 'اطلاعات کاربر با موفقیت دریافت شد', user });
        } catch (error) {
            console.error('Error fetching user information:', error);
            return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
        }
    }
 
    async notificaionLogs(req, res) {
        const user_id  = req.params;
        try {
            const query = 'SELECT * FROM logs WHERE user_id = ? ORDER BY time DESC';
            const [logs] = await db.connection.execute(query, [userId]);
    
            if (logs.length === 0) {
                return res.status(404).json({ message: 'No notification logs found' });
            }
    
            res.status(200).json({ logs });
        } catch (error) {
            console.error('Error fetching notification logs:', error);
            res.status(500).json({ message: 'Server error' });
        }

    } 
    
}
module.exports = new Auth();