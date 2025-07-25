import db from "../../config/db.js";

const Logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).send({
                status: 401,
                message: "Token tidak ditemukan di header Authorization",
                data: null,
                error: "Unauthorized",
            });
        }

        const [user] = await db.query("SELECT * FROM users WHERE token = ?", [token]);
        
        if (user.length === 0) {
            return res.status(404).send({
                status: 404,
                message: "User tidak ditemukan atau sudah logout",
                data: null
            });
        }

        await db.query("UPDATE users SET token = NULL WHERE token = ?", [token]);

        return res.status(200).send({
            status: 200,
            message: "Berhasil logout",
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

export default Logout;
