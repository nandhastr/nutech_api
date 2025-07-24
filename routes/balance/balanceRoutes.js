import express from "express";
import Balance from './../../controllers/balance/balance.js';

const router = express.Router();


router.get("/balance", Balance);


export default router;