require('dotenv').config();
const app = require('./app.js');
const connectDB = require("./db/index.js");
const swaggerSetup = require('./swagger.js');
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