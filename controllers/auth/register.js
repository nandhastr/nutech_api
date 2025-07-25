import db from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const Register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        if (!first_name) {
            return res.status(400).send({
                status: 400,
                message: "First name harus di isi",
            });
        }

        if (!last_name) {
            return res.status(400).send({
                status: 400,
                message: "Last name harus di isi",
            });
        }

        if (!email) {
            return res.status(400).send({
                status: 400,
                message: "parameter mail harus di isi",
            });
        }

        if (!regexEmail.test(email)) {
            return res.status(400).send({
                status: 400,
                message: "Parameter email tidak sesuai format",
                data: null,
            });
        }

         const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
         const user = rows[0];
        if (user) {
            return res.status(409).send({
                status: 409,
                message: "Email sudah terdaftar",
                data: null,
            });
        }

        if (!password) {
            return res.status(400).send({
                status: 400,
                message: "Password harus di isi",
                data: null
            });
        }

        if (password.length < 8) {
            return res.status(400).send({
                status: 400,
                message: "Password minimal 8 karakter",
                data: null
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)", [first_name, last_name, email, hashPassword]);


        return res.status(200).send({
            status:0,
            message: "Registrasi berhasil silahkan logn",
            data: null
        });
    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

export default Register;
