import { currentPoll } from "./socket.js";
import ApiError from "../SendingObject/ApiError.js";
import ApiResponse from "../SendingObject/ApiResponse.js";

export default function StudentSubmitAnswer(req, res) {
  const { name, selectedOptionIndex } = req.body;

  try {
    if (!name || selectedOptionIndex === undefined) {
      return res
        .status(400)
        .json(new ApiError(400, "", "Student name and selected option are required"));
    }

    if (
      !currentPoll.options ||
      selectedOptionIndex < 0 ||
      selectedOptionIndex >= currentPoll.options.length
    ) {
      return res.status(400).json(new ApiError(400, "", "Invalid option selected"));
    }

    currentPoll.answers[name] = selectedOptionIndex;
    currentPoll.students.add(name);

    return res.status(200).json(new ApiResponse(200, null, "Answer submitted successfully"));
  } catch (error) {
    console.error("Error in StudentSubmitAnswer:", error);
    return res.status(500).json(new ApiError(500, "", "Internal Server Error"));
  }
}


export function GetPollResult(req, res) {
  try {
    if (currentPoll.timerInterval) {
      // Timer still running
      return res.status(200).json(new ApiResponse(200, null, "Results not ready yet. Please wait until timer ends."));
    }

    const totalStudents = currentPoll.students.size || 0;
    const optionCounts = new Array(currentPoll.options.length).fill(0);

    Object.values(currentPoll.answers).forEach((answerIndex) => {
      optionCounts[answerIndex] = (optionCounts[answerIndex] || 0) + 1;
    });

    const optionPercentages = optionCounts.map(count =>
      totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : "0.00"
    );

    const result = {
      optionCounts,
      optionPercentages,
      totalStudents,
      correctOptionIndex: currentPoll.correctOptionIndex,
    };

    return res.status(200).json(new ApiResponse(200, result, "Poll results"));
  } catch (error) {
    console.error("Error in GetPollResult:", error);
    return res.status(500).json(new ApiError(500, "", "Internal Server Error"));
  }
}