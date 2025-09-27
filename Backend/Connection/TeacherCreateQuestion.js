import ApiError from "../SendingObject/ApiError.js";
import ApiResponse from "../SendingObject/ApiResponse.js";
import { getIO, currentPoll } from "./socket.js";

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

export function TeacherAskQuestion(req, res) {
  const io = getIO();
  const { question, options, correctOptionIndex, timerSeconds } = req.body;

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

  if (!currentPoll.question) {
    return res.status(400).json({ message: "No question created yet" });
  }

  io.to("poll-room").emit("question-start", {
    question: currentPoll.question,
    options: currentPoll.options,
    timerSeconds: currentPoll.timerSeconds,
  });

  let remainingTime = currentPoll.timerSeconds;

  if (currentPoll.timerInterval) clearInterval(currentPoll.timerInterval);

  currentPoll.timerInterval = setInterval(() => {
    remainingTime--;
    io.to("poll-room").emit("timer-tick", remainingTime);

    if (remainingTime <= 0) {
      clearInterval(currentPoll.timerInterval);

      const totalStudents = currentPoll.students.size || 0;
      const optionCounts = new Array(currentPoll.options.length).fill(0);

      Object.values(currentPoll.answers).forEach((answerIndex) => {
        optionCounts[answerIndex] = (optionCounts[answerIndex] || 0) + 1;
      });

      const correctCount = optionCounts[currentPoll.correctOptionIndex] || 0;

      // Calculate percentages (same formula as API 2)
      const optionPercentages = optionCounts.map((count) =>
        totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : "0.00"
      );

      io.to("poll-room").emit("results-update", {
        optionCounts,
        optionPercentages, // Add percentages here
        correctCount,
        totalStudents,
        correctOptionIndex: currentPoll.correctOptionIndex,
      });

    }
  }, 1000);

  const safePoll = {
    question: currentPoll.question,
    options: currentPoll.options,
    timerSeconds: currentPoll.timerSeconds,
    answers: currentPoll.answers,
    students: Array.from(currentPoll.students),
    pollId: currentPoll.pollId,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, safePoll, "Question Created"));
}
