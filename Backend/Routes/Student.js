import express from "express";
import StudentSubmitAnswer, {
  GetPollResult,
} from "../Connection/StudentAnswerSubmit.js";
import {
  StudentJoinPoll,
  createRemoveStudentRoute,
} from "../Connection/StudentAnswerSubmit.js";

const studentRoute = express.Router();

studentRoute.post("/answer/submit", StudentSubmitAnswer);
studentRoute.get("/answer/result", GetPollResult);
studentRoute.get("/join", StudentJoinPoll);
studentRoute.get("/remove", createRemoveStudentRoute);

export default studentRoute;
