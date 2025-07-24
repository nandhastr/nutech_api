import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import db from '../../config/db.js';

dotenv.config();

const Balance = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const [user] = await db.query("SELECT token FROM users WHERE id = ?", [userId]);

        if (!user.length || user[0].token !== token) {
            return res.status(401).send({
                status: 108,
                message: "Token tidak valid atau kadaluwarsa",
                data: null,
            });
        }



        const [top_up] = await db.query("SELECT SUM(amount) AS total_top_up from topups where user_id = ?", [userId]);

        const [transaction] = await db.query("SELECT SUM(amount) AS total_transactions from transactions where user_id = ?", [userId]);
         
        const total_topup = parseFloat(top_up[0].total_top_up || 0);
        const total_transaction = parseFloat(transaction[0].total_transactions || 0);

        const balanceTotal = total_topup - total_transaction

        await db.query("UPDATE balances SET balance = ?  WHERE user_id = ?", [balanceTotal, userId]);


        return res.status(200).send({
            status: 0,
            message: "Get Balance Berhasil",
            data: {
                Balance: balanceTotal 
            }
        });

    } catch (error) {
        return res.status(500).send({
            status: 500,
            message: "Terjadi kesalahan pada server",
            error: error.message
        });
    }
}

export default Balance;