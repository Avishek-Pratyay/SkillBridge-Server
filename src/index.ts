import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import client from "./config/db";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);

async function run() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB Connected Successfully");

    app.get("/", (_req, res) => {
      res.send({
        success: true,
        message: "SkillBridge API is running...",
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
}

run();