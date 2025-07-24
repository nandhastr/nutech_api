import dotenv from "dotenv";

import app from "./api/index.js";

dotenv.config();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server berjalan di port: ${port}`);
});
