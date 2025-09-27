import ApiError from "../SendingObject/ApiError.js";
import ApiResponse from "../SendingObject/ApiResponse.js";
import {currentPoll} from "./socket.js";

export default function TeacherCreateQuestion(req, res) {
  const { question, options, correctOptionIndex, timerSeconds } = req.body;

  try {
    if (
      !question ||
      !options ||
      correctOptionIndex === undefined ||
      !timerSeconds
    ) {
      return res
        .status(400)
        .json(new ApiError(400, "", "All Fields are Required"));
    }

    currentPoll.question = question;
    currentPoll.options = options;
    currentPoll.correctOptionIndex = correctOptionIndex;
    currentPoll.timerSeconds = timerSeconds;
    currentPoll.answers = {};

    return res
      .status(200)
      .json(new ApiResponse(200, currentPoll, "Question Created"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "", "Server Error"));
  }
}
