import express from "express";
import StudentSubmitAnswer, { GetPollResult } from "../Connection/StudentAnswerSubmit.js";


const studentRoute = express.Router();

studentRoute.post("/answer/submit", StudentSubmitAnswer);
studentRoute.get("/answer/result", GetPollResult);

export default studentRoute;
