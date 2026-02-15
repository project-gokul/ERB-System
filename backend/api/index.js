import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*", // temporary, we will restrict later
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend running on Vercel" });
});

export default app;