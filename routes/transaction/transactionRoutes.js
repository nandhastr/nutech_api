import express from "express";
import transaction from "../../controllers/transaction/transaction.js";

const router = express.Router();


router.post("/transaction", transaction);


export default router;