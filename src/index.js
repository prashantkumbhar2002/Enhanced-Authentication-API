import dotenv from "dotenv";
import app from './app.js'
import connectDB from "./db/index.js";
import swaggerSetup from './swagger.js';
dotenv.config({
    path: './env'
})
let PORT = process.env.PORT || 8001;
connectDB()
.then(() => {
    app.listen(PORT,() => {
        console.log(`⚙️ Server is up and running on the port ${process.env.PORT}`);
    });
    swaggerSetup(app, PORT);
})
.catch((err)=>{
    console.log("DB Connection FAILED ",err);
})