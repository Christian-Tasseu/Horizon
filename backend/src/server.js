import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("Bonjour !");
});

app.listen(env.port, () => {
    console.log(`Serveur lancé sur http://localhost:${env.port}`);
});