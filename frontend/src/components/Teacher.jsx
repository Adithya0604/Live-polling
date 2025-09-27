import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Teacher.css";

const Teacher = () => {
  // Socket connection
  const [socket, setSocket] = useState(null);

  // Form states
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState("60 seconds");
  const [options, setOptions] = useState([
    { id: 1, text: "", isCorrect: false },
  ]);

  // Real-time data states
  const [isConnected, setIsConnected] = useState(false);
  const [questionCreated, setQuestionCreated] = useState(false);
  const [questionActive, setQuestionActive] = useState(false);
  const [results, setResults] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");

      // Join as teacher
      newSocket.emit("join", {
        role: "teacher",
        name: "Teacher" + Math.floor(Math.random() * 1000),
      });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    newSocket.on("join-emit", (data) => {
      console.log(data.message);
    });

    // Listen for question results and timer updates
    newSocket.on("timer-tick", (remainingTime) => {
      console.log("Timer:", remainingTime);
    });

    newSocket.on("results-update", (resultsData) => {
      setResults(resultsData);
      setQuestionActive(false);
      console.log("Results:", resultsData);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Add option function
  const addOption = () => {
    const newOption = {
      id: options.length + 1,
      text: "",
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  // Update option text
  const updateOption = (id, text) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  // Set correct answer
  const setCorrectAnswer = (id) => {
    setOptions(options.map((opt) => ({ ...opt, isCorrect: opt.id === id })));
  };

  // Simplified ask question handler - only makes the ask API call
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      alert("Please add at least 2 options");
      return;
    }

    const correctOption = options.find((opt) => opt.isCorrect);
    if (!correctOption) {
      alert("Please select a correct answer");
      return;
    }

    try {
      // Only call the ask question API
      const askResponse = await fetch(
        "http://localhost:8000/api/teacher/question/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            options: validOptions.map((opt) => opt.text),
            correctOptionIndex: validOptions.findIndex((opt) => opt.isCorrect),
            timerSeconds: parseInt(timeLimit.split(" ")[0]),
          }),
        }
      );

      // Reset form for next question
      setQuestion("");
      setOptions([{ id: 1, text: "", isCorrect: false }]);

      const askResult = await askResponse.json();

      if (askResult.success) {
        setQuestionActive(true);
        setResults(null);
        alert("Question sent to students! Timer started.");
      } else {
        alert(askResult.message || "Failed to ask question");
      }
    } catch (error) {
      console.error("Error asking question:", error);
      alert("Failed to ask question. Make sure your server is running.");
    }
  };

  return (
    <div className="teacher-root">
      <div className="teacher-container">
        <div className="poll-label">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.2762 8.76363C12.2775 8.96965 12.2148 9.17098 12.0969 9.33992C11.979 9.50887 11.8116 9.63711 11.6178 9.707L8.35572 10.907L7.15567 14.1671C7.08471 14.3604 6.95614 14.5272 6.78735 14.645C6.61855 14.7628 6.41766 14.826 6.21181 14.826C6.00596 14.826 5.80506 14.7628 5.63627 14.645C5.46747 14.5272 5.33891 14.3604 5.26794 14.1671L4.06537 10.9111L0.804778 9.71104C0.611716 9.63997 0.445097 9.5114 0.327404 9.34266C0.20971 9.17392 0.146606 8.97315 0.146606 8.76742C0.146606 8.56169 0.20971 8.36092 0.327404 8.19218C0.445097 8.02345 0.611716 7.89487 0.804778 7.82381L4.06688 6.62376L5.26693 3.36418C5.33799 3.17112 5.46657 3.0045 5.6353 2.88681C5.80404 2.76911 6.00482 2.70601 6.21054 2.70601C6.41627 2.70601 6.61705 2.76911 6.78578 2.88681C6.95452 3.0045 7.08309 3.17112 7.15416 3.36418L8.35421 6.62629L11.6138 7.82633C11.8074 7.8952 11.9749 8.02223 12.0935 8.19003C12.2121 8.35782 12.2759 8.55817 12.2762 8.76363Z"
              fill="white"
            />
          </svg>
          Intervue Poll
        </div>

        <h1>Let's Get Started</h1>
        <p className="subtitle">
          you'll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </p>

        <div className="form-content">
          <div className="question-section">
            <div className="question-header">
              <label className="question-label">Enter your question</label>
              <div className="time-selector">
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="time-dropdown"
                >
                  <option>6 seconds</option>
                  <option>30 seconds</option>
                  <option>90 seconds</option>
                  <option>120 seconds</option>
                </select>
                <span className="dropdown-arrow">▼</span>
              </div>
            </div>

            <div className="question-input-container">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask Question"
                className="question-input"
                maxLength={100}
              />
              <div className="char-counter">{question.length}/100</div>
            </div>
          </div>

          <div className="options-section">
            <div className="section-header">
              <h3>Edit Options</h3>
              <h3>Is it Correct?</h3>
            </div>

            {options.map((option) => (
              <div key={option.id} className="option-row">
                <div className="option-left">
                  <div className="option-number">{option.id}</div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    className="option-input"
                  />
                </div>
                <div className="option-right">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      checked={option.isCorrect}
                      onChange={() => setCorrectAnswer(option.id)}
                    />
                    <span className="radio-custom"></span>
                    Yes
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      checked={!option.isCorrect}
                      onChange={() => {}}
                    />
                    <span className="radio-custom"></span>
                    No
                  </label>
                </div>
              </div>
            ))}

            <button onClick={addOption} className="add-option-btn">
              + Add More option
            </button>
          </div>
        </div>

        <button
          onClick={handleAskQuestion}
          style={{
            background: "linear-gradient(90deg, #8F64E1 0%, #1D68BD 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "16px 48px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(143, 100, 225, 0.25)",
            marginTop: "30px",
          }}
        >
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default Teacher;
