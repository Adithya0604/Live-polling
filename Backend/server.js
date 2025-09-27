import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import {
  IntilizeSocketAndRoleConnection,
  currentPoll,
} from "./Connection/socket.js";
import teacherRoute from "./Routes/Teacher.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const FrontendURL =
  process.env.FRONTEND_PRODUCTION_URL || "http://localhost:3000";
const PORT = process.env.PORT || 8000;

const io = new Server(server, {
  cors: {
    origin: [FrontendURL, "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  },
});

IntilizeSocketAndRoleConnection(io);

app.use("/api/teacher", teacherRoute);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
