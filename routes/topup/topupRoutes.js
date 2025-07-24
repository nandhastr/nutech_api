import express from "express";
import topUp from "../../controllers/topup/topup.js";

const router = express.Router();

router.post("/topup", topUp);

export default router;