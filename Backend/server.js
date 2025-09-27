import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

import { IntilizeSocketAndRoleConnection } from "./Connection/socket.js";
import teacherRoute from "./Routes/Teacher.js";
import studentRoute from "./Routes/Student.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const FrontendURL =
  process.env.FRONTEND_PRODUCTION_URL || "http://localhost:5173";
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: [FrontendURL],
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

IntilizeSocketAndRoleConnection(server);

app.use("/api/teacher", teacherRoute);
app.use("/api/student", studentRoute);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
