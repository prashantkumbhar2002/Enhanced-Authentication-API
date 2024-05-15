import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { APIError } from "../src/utils/apiError.js";
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(helmet());
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(cookieParser());

// Rate limiting middleware
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);

app.use((err, req, res, next) => {
    if (err instanceof APIError) {
        console.error(err)
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
export default app;
