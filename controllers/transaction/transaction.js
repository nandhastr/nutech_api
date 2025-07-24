import  jwt  from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../../config/db.js';

dotenv.config();

const transaction = async (req, res) => {
    try {
        const { service_code, amount } = req.body;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
       
  
        const [users] = await db.query("SELECT token FROM users WHERE id = ?", [userId]);

        if (!users.length || users[0].token !== token) {
            return res.status(401).send({
                status: 108,
                message: "Token tidak valid atau kadaluwarsa",
                data: null,
            });
        }
        


        if (!service_code) {
            return res.status(400).send({
                status: 400,
                message: "Parameter service_code harus di isi",
            });
        }

        if (!amount) {
            return res.status(400).send({
                status: 400,
                message: "Parameter amount harus di isi",
            });
        }

        if (amount === undefined || isNaN(amount)) {
            return res.status(400).send({
                status: 400,
                message: "Parameter amount harus berupa angka",
            });
        }
        
        const [validCode] = await db.query("SELECT * FROM transactions WHERE service_code = ?", [service_code]);



        if(validCode === 0) {
            return res.status(400).send({
                status: 102,
                message: "Service atau layanan tidak ditemukan",
                data: null
            });
        }

        const [balanceCheck] = await db.query("SELECT SUM(balance) AS total_balance FROM balances WHERE user_id = ?", [userId]);

        const balance = balanceCheck.length > 0 ? parseFloat(balanceCheck[0].total_balance || 0) : 0;

        if (balance < parseFloat(amount)) {
            return res.status(400).send({
                status: 104,
                message: "Saldo tidak mencukupi",
                data: null
            });
        }
        
        const invoiceNumber = `INV${Date.now()}${userId}`;
        const service_name = service_code.toLowerCase();

        await db.query("INSERT INTO transactions (user_id, invoice_number, service_code, service_name, amount) VALUES (?, ?, ?, ?, ?)", [userId, invoiceNumber, service_code, service_name, amount]);
        
        
        
        const [Sum_balance] = await db.query("SELECT SUM(balance) AS total_balance from balances where user_id = ?", [userId]);
        
        const [transaction] = await db.query("SELECT amount AS pertransactions from transactions where user_id = ?", [userId]);
        
        const total_balance = parseFloat(Sum_balance[0].total_balance || 0);
        const total_transaction = parseFloat(transaction[0].pertransactions || 0);
        
        const amountBalance = total_balance - total_transaction;
        
        await db.query("UPDATE balances SET balance = balance - ? WHERE user_id = ?", [amountBalance, userId]);

        return res.status(200).send({
            status: 0,
            message: "Transaksi Berhasil",
            data: {
                invoice_number: invoiceNumber,
                service_code: service_code,
                service_name: service_name,
                transaction_type: "PAYMENT",
                amount: amount,
                created_at: new Date()
            }
        })
    }catch (error) {
       return res.status(500).send({
           status: 500,
           message: error.message
       })
    }
}


export default transaction;