import express from "express";
import TeacherCreateQuestion from "../Connection/TeacherCreateQuestion.js";
import { TeacherAskQuestion } from "../Connection/TeacherCreateQuestion.js";

const teacherRoute = express.Router();

teacherRoute.post("/question", TeacherCreateQuestion);
teacherRoute.post("/question/ask", TeacherAskQuestion);

export default teacherRoute;
