import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import db from '../../config/db.js';

const Login = async (req, res)=>{
    try {
        const { email, password } = req.body;
        const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        
        if (!password) {
            return res.status(400).send({
                status: 400,
                message: "parameter password harus di isi",
            });
        }
        if (!email) {
            return res.status(400).send({
                status: 400,
                message: "parameter email harus di isi",
            });
        }
        
        
        if (!regexEmail.test(email)) {
            return res.status(400).send({
                status: 400,
                message: "parameter email tidak valid",
            });
        }


        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0]
        if (!user) {
            return res.status(400).send({
                status: 400,
                message: "Email belum terdaftar",
            });
        }
        
        const matchPassword = await bcrypt.compare(password, user.password);
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "12h" });
        
        if (!matchPassword) {
            return res.status(400).send({
                status: 400,
                message: "Password salah",
            });
        }

        await db.query("UPDATE users SET token = ? WHERE id = ?", [token, user.id]);

        
        return res.status(200).send({
            email: user.email,
            password: user.password,
            token: token
        })
 
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Terjadi kesalahan pada server",
            error: error.message
        });
    }
}

export default Login;