const db = require('../utlis/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = "Hanieh"


class Auth{

    async exitRegister(user) {
        try {
            console.log('User object received:', user);
            const { codemeli } = user;
            console.log('codemeli:', codemeli);
            
            const query = "SELECT * FROM user WHERE codemeli = ?"; 
            let [res] = await db.connection.execute(query, [codemeli]);
            
            if (res.length > 0) {
                console.log('User already exists in the database.');
                return false;
            } else {
                console.log('User does not exist in the database.');
                return true;
            }
        } catch (error) {
            console.error('Error checking user registration:', error);
            return false;
        }
    }
    
    async register(items){
        if (await this.exitRegister(items)) {
            const { codemeli, password, firstname, lastname, mobile, address, gender, image_url, birthday, relatives_id , role } = items;
            const query = "INSERT INTO user (codemeli, password, firstname, lastname, mobile, address, gender, image_url, birthday, relatives_id , role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? )";
            const hashpassword = await bcrypt.hashSync(password, 10);
            
            const values = [
                codemeli ?? null,
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                mobile ?? null,
                address ?? null,
                gender ?? null,
                image_url ?? null,
                birthday ?? null,
                relatives_id ?? null,
                role ?? null
            ];
            
            let res;
            try {
                res = await db.connection.execute(query, values);
            } catch (error) {
                console.error('Error executing query:', error);
                throw error;  // or handle the error as needed
            }
            return res;
        }else{console.log("user exits");}
    }

    async login(items){
        const { codemeli , password } = items;
        console.log(password);
        const query = "select password from user where codemeli = ?";
        let [ list ] = await db.connection.execute(query ,[ codemeli ]);
        const truePassword = await bcrypt.compareSync(password , list[0].password);
        if (truePassword) {
            const token = jwt.sign({ codemeli }, secret , { expiresIn: "1h" });
            console.log("success");
            return token;
        }else {console.log("Invalid credentials")}
    }
}

module.exports = new Auth();