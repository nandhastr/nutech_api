import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../../config/db.js';

dotenv.config();

const topUp = async (req, res) => {
    try {
        const { amount } = req.body;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.email;
        const userId = decoded.id;
         
        const [users] = await db.query("SELECT token FROM users WHERE id = ?", [userId]);

        if (!users.length || users[0].token !== token) {
            return res.status(401).send({
                status: 108,
                message: "Token tidak valid atau kadaluwarsa",
                data: null,
            });
        }
      

        if (amount === undefined || isNaN(amount)) {
            return res.status(400).send({
                status: 400,
                message: "Parameter amount harus berupa angka dan tidak boleh lebih kecil dari 0",
                data: null
            });
        }
        
        const amountValue = parseFloat(amount);
        if (amountValue <= 0) {
            return res.status(400).send({
                status: 400,
                message: "Parameter amount harus lebih besar dari 0",
                data: null
            })
        }
        
        const user = await db.query("SELECT * FROM users WHERE email = ?", [userEmail]);
        
        if (!user.length) {
            return res.status(404).send({
                status: 404,
                message: "User tidak ditemukan",
                data: null
            });
        }

        await db.query("INSERT INTO topups (user_id, type_topup, amount) VALUES (?, ?, ?)", [userId, "TOPUP", amount]);

        const [balanceCheck] = await db.query("SELECT * FROM balances WHERE user_id = ?", [userId]);

        if (balanceCheck.length === 0) {
            await db.query("INSERT INTO balances (user_id, balance) VALUES (?, ?)", [userId, amount]);
        } else {
            await db.query("UPDATE balances SET balance = balance + ? WHERE user_id = ?", [amount, userId]);
        }

        return res.status(200).send({
            status: 0,
            message: "Top up balance berhasil",
            data: {
                balance: amount,
            },
        });

    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Terjadi kesalahan pada server",
            error: error.message
        });
        
    }
}

export default topUp;