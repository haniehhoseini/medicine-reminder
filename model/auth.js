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
    

    async exitRegisterDoctor(items) {
        const { codemeli } = items;
        const query = 'SELECT * FROM doctor WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerDoctor(req, res) {
        const items = req.body;
        const requiredFields = [
            'codemeli', 
            'password', 
            'firstname', 
            'lastname', 
            'mobile', 
            'address', 
            'gender', 
            'birthday',
            'expertise',
            'code',
            'city',
            'hospital',
        ];
    
        for (const field of requiredFields) {
            if (!items[field]) {
                return res.status(401).json({ message: `فیلد ${field} الزامی است و نباید خالی باشد.` });
            }
        }
        if (await this.exitRegisterDoctor(items)) {
        const { 
            codemeli, 
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
            code,
            role
        } = items;

        const query = `INSERT INTO doctor (
            codemeli, 
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
            code,
            role ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const hashpassword = await bcrypt.hash(password, 10);
            const formattedBirthday = this.formatDate(birthday);

    
            let finalImageUrl = image_url;
            if (!finalImageUrl) {
                finalImageUrl = 'https://icones.pro/wp-content/uploads/2021/03/symbole-du-docteur-icone-png-vert.png';
            }

            const values = [
                codemeli ?? null, 
                hashpassword, 
                firstname ?? null, 
                lastname ?? null, 
                address ?? null,
                city ?? null,
                hospital ?? null, 
                gender ?? null, 
                finalImageUrl, 
                formattedBirthday, 
                expertise ?? null,
                code ?? null,
                role ?? Roles.DOCTOR
            ];

            try {
                const [res] = await db.connection.execute(query, values);
                return res.status(201).json({ message: 'کاربر با موفقیت ثبت شد', res });
            } catch (message) {
                throw message;  
            }
        } else {
            return res.status(401).json({ message: 'کاربری با این مشخصات قبلا ثبت نام کرده است' });
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

    async login(req, res) {
        const items = req.body;
        const { codemeli, password, role } = items;
    
        let tableName;
        switch (role) {
            case 'doctor':
                tableName = 'doctor';
                break;
            case 'pharmacist':
                tableName = 'company';
                break;
            case 'relatives':
                tableName = 'relatives';
                break;
            case 'patient':
                tableName = 'user';
                break;
            default:
                return res.status(400).json({ message: 'نقش کاربری نامعتبر است' });
        }
    
        const query = `SELECT password, role, firstname, lastname, image_url FROM ${tableName} WHERE codemeli = ?`;
    
        try {
            const [list] = await db.connection.execute(query, [codemeli]);
            if (list.length === 0) {
                return res.status(401).json({ message: 'کدملی، رمز عبور یا نقش شما اشتباه است' });
            }
    
            const user = list[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
    
            if (isPasswordValid) {
                const token = jwt.sign(
                    { 
                        codemeli, 
                        role: user.role, 
                        firstname: user.firstname, 
                        lastname: user.lastname,
                        ensurance: user.ensurance,
                        image_url: user.image_url
                    },
                    secret,
                    { expiresIn: '1h' }
                );
                return res.status(200).json({ token, message: 'با موفقیت وارد شدید' });
            } else {
                return res.status(401).json({ message: 'کدملی، رمز عبور یا نقش شما اشتباه است' });
            }
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
        }
    }
    
    async getMe(req, res) {
        try {
            const decoded = req.user;
            
            let tableName;
            switch (decoded.role) {
                case 'doctor':
                    tableName = 'doctor';
                    break;
                case 'pharmacist':
                    tableName = 'company';
                    break;
                case 'relatives':
                    tableName = 'relatives';
                    break;
                case 'patient':
                    tableName = 'user';
                    break;
                default:
                    return res.status(400).json({ error: 'نقش کاربری نامعتبر است' });
            }
    
            const query = `SELECT * FROM ${tableName} WHERE codemeli = ?`;
            const [rows] = await db.connection.execute(query, [decoded.codemeli]);
    
            if (rows.length === 0) {
                return res.status(404).json({ error: 'کاربری با این مشخصات یافت نشد' });
            }
    
            const user = rows[0];
            return res.status(200).json({ message: 'اطلاعات کاربر با موفقیت دریافت شد', user });
    
        } catch (error) {
            console.error('Error verifying token:', error);
    
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'لطفا یکبار دیگر وارد شوید' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'احراز هویت نامعتبر است' });
            } else {
                return res.status(500).json({ message: 'خطایی در سرور رخ داده است' });
            }
        }
    }
    
    
}
module.exports = new Auth();