import express from "express";
import TeacherCreateQuestion from "../Connection/TeacherCreateQuestion.js";

const teacherRoute = express.Router();

teacherRoute.post("/question", TeacherCreateQuestion);

export default teacherRoute;
