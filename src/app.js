import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 3500;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import queryRoutes from "./routes/queryRoute.js";
app.use("/api", queryRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
