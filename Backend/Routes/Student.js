import express from "express";
import StudentSubmitAnswer, { GetPollResult } from "../Connection/StudentAnswerSubmit.js";
import {StudentJoinPoll} from '../Connection/StudentAnswerSubmit.js'


const studentRoute = express.Router();

studentRoute.post("/answer/submit", StudentSubmitAnswer);
studentRoute.get("/answer/result", GetPollResult);
studentRoute.get("/join", StudentJoinPoll);

export default studentRoute;
