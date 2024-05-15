import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGOURI}/${process.env.DB_Name}`)
        console.log(`\nMongodb connected!! \nDB host: ${connectionInstance.connection.host}`)
    }
    catch(err){
        console.log("Error while connecting to mongoDB: ",err);
        process.exit(1);
    }
}
export default connectDB;