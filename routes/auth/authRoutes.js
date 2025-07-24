import express from "express";
import Register from "../../controllers/auth/register.js";
import Login from "../../controllers/auth/login.js";
import Logout from "../../controllers/auth/logout.js";

const router = express.Router();


router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);


export default router;