import express from "express";
import dotenv from "dotenv";    

import db from "./config/db.js";
import AuthRoutes from "./routes/auth/authRoutes.js"
import BalanceRoutes from "./routes/balance/balanceRoutes.js"
import TopUpRoutes from "./routes/topup/topupRoutes.js"
import TransactionRoutes from "./routes/transaction/transactionRoutes.js"


dotenv.config();
const app = express();
app.use(express.json());






(async () => {
    try {
        await db.query("SELECT 1");
        console.log(" Database berhasil terhubung");
    } catch (error) {
        console.error("Gagal konek ke database:", error.message);
    }
})();


app.use(AuthRoutes);
app.use(BalanceRoutes);
app.use(TopUpRoutes);
app.use(TransactionRoutes);



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server berjalan di port: ${port}`);
});
