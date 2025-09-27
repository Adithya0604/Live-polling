import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Student.css";

const Student = () => {
  // Socket connection
  const [socket, setSocket] = useState(null);

  // Student states
  const [studentName, setStudentName] = useState("");
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Question states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null); // Store question for results

  // Initialize socket connection ONLY after name is entered
  const initializeSocket = () => {
    if (socket) {
      socket.close(); // Close existing connection if any
    }

    const newSocket = io("http://localhost:8000", {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    newSocket.on("join-emit", (data) => {
      console.log(data.message);
    });

    newSocket.on("join-error", (message) => {
      alert(message);
      setIsNameEntered(false);
    });

    newSocket.on("question-start", (questionData) => {
      const questionObj = {
        text: questionData.question,
        options: questionData.options.map((opt, index) => ({
          id: index,
          text: opt,
        })),
        timerSeconds: questionData.timerSeconds,
      };
      
      setCurrentQuestion(questionObj);
      setLastQuestion(questionObj); // Store for results display
      setTimeLeft(questionData.timerSeconds);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setShowResults(false);
    });

    newSocket.on("timer-tick", (remainingTime) => {
      setTimeLeft(remainingTime);
      if (remainingTime <= 0 && !hasSubmitted) {
        setHasSubmitted(true);
      }
    });

    newSocket.on("results-update", (resultsData) => {
      console.log("resultData:", resultsData);
      setResults(resultsData);
      setShowResults(true);
      setCurrentQuestion(null); // Clear current question but keep lastQuestion
    });

    return newSocket;
  };

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  // Handle student name submission
  const handleContinue = () => {
    if (!studentName.trim()) {
      alert("Please enter your name");
      return;
    }

    // Initialize socket connection when Continue is clicked
    const newSocket = initializeSocket();

    // Wait for connection before proceeding
    newSocket.on("connect", () => {
      // Emit join event directly after connection
      newSocket.emit("join", {
        role: "student",
        name: studentName.trim(),
      });

      setIsNameEntered(true);
    });

    // Handle connection error
    newSocket.on("connect_error", (error) => {
      console.error("Connection failed:", error);
      alert("Failed to connect to server. Please try again.");
      setIsConnected(false);
    });
  };

  // Handle answer selection
  const handleAnswerSelect = (optionId) => {
    if (!hasSubmitted && timeLeft > 0) {
      setSelectedAnswer(optionId);
      console.log("Option selected:", optionId);
      console.log("Option text:", currentQuestion?.options?.find(opt => opt.id === optionId)?.text);
    }
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (selectedAnswer !== null && socket && !hasSubmitted) {
      console.log("Submitting answer:", {
        studentName: studentName,
        selectedOption: selectedAnswer,
        selectedText: currentQuestion?.options?.find(opt => opt.id === selectedAnswer)?.text,
        submittedAt: Date.now(),
      });

      socket.emit("submit-answer", {
        studentName: studentName,
        selectedOption: selectedAnswer,
        submittedAt: Date.now(),
      });

      setHasSubmitted(true);
      console.log("Answer submitted successfully");
    }
  };

  const isWaiting = !currentQuestion && !showResults;

  if (!isNameEntered) {
    return (
      <div className="student-root">
        <div className="student-container">
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
            If you're a student, you'll be able to{" "}
            <strong>submit your answers</strong>, participate in live polls,
            and see how your responses compare with your classmates
          </p>

          <div style={{ marginTop: "50px", marginBottom: "40px" }}>
            <label
              style={{
                display: "block",
                fontSize: "18px",
                fontWeight: "600",
                color: "#373737",
                marginBottom: "20px",
                textAlign: "left",
              }}
            >
              Enter your Name
            </label>

            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: "20px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "16px",
                background: "#f8f8f8",
                color: "#373737",
                boxSizing: "border-box",
                marginBottom: "30px",
              }}
              onKeyPress={(e) => e.key === "Enter" && handleContinue()}
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={!studentName.trim()}
            style={{
              background: "linear-gradient(90deg, #8F64E1 0%, #1D68BD 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "50px",
              padding: "16px 48px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: !studentName.trim() ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(143, 100, 225, 0.25)",
              opacity: !studentName.trim() ? 0.6 : 1,
            }}
          >
            Continue
          </button>

          {socket && !isConnected && (
            <p
              style={{
                marginTop: "20px",
                color: "#FF4444",
                fontSize: "14px",
              }}
            >
              Connecting to server...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="student-root">
      <div className="student-container">
        {showResults && results ? (
          <div style={{ textAlign: "center", width: "100%" }}>
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
            <h1 style={{ fontSize: "32px", marginBottom: "10px", color: "#333" }}>
              Question 1
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "30px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#ff4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill="white"/>
                </svg>
              </div>
              <span style={{ color: "#ff4444", fontSize: "18px", fontWeight: "600" }}>00:00</span>
            </div>

            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
              <div style={{ background: "#6b7280", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px", fontSize: "16px", fontWeight: "500" }}>
                {lastQuestion?.text || "Question"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(results.optionCounts || []).map((count, index) => {
                  const percentage = results.optionPercentages ? parseFloat(results.optionPercentages[index]) : 0;
                  const isCorrect = index === results.correctOptionIndex;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        background: "#e5e7eb",
                        borderRadius: "8px",
                        overflow: "hidden",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          height: "100%",
                          width: `${percentage}%`,
                          background: isCorrect 
                            ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)",
                          transition: "width 0.8s ease-in-out",
                        }}
                      />
                      
                      <div style={{ 
                        position: "relative", 
                        zIndex: 2, 
                        display: "flex", 
                        alignItems: "center", 
                        width: "100%",
                        padding: "0 15px"
                      }}>
                        <div style={{ 
                          background: isCorrect ? "#10b981" : "#8b5cf6", 
                          color: "white", 
                          borderRadius: "50%", 
                          width: "24px", 
                          height: "24px", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          fontSize: "14px", 
                          fontWeight: "600",
                          marginRight: "12px"
                        }}>
                          {index + 1}
                        </div>
                        
                        <span style={{ 
                          color: "white", 
                          fontWeight: "500", 
                          fontSize: "15px",
                          flex: 1,
                          textAlign: "left"
                        }}>
                          {lastQuestion?.options?.[index]?.text || `Option ${index + 1}`}
                        </span>
                        
                        <span style={{ 
                          color: "white", 
                          fontWeight: "700", 
                          fontSize: "16px" 
                        }}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p style={{ color: "#666", fontSize: "16px" }}>
              Wait for the teacher to ask a new question..
            </p>
          </div>
        ) : isWaiting && !showResults ? (
          <>
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

            <div className="waiting-content">
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
              <h1 className="waiting-message">
                Hello {studentName}! Wait for the teacher to ask questions..
              </h1>
            </div>
          </>
        ) : currentQuestion && !showResults ? (
          <>
            <div className="question-header">
              <h2 className="question-title">Question</h2>
              <div className="timer">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#ff4444" strokeWidth="2"/>
                  <circle cx="10" cy="10" r="2" fill="#ff4444"/>
                </svg>
                00:{timeLeft.toString().padStart(2, "0")}
              </div>
            </div>

            <div className="question-box">
              <p className="question-text">{currentQuestion.text}</p>
            </div>

            <div className="options-container">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`option-item ${
                    selectedAnswer === option.id ? "selected" : ""
                  }`}
                  onClick={() => handleAnswerSelect(option.id)}
                  style={{
                    cursor:
                      hasSubmitted || timeLeft === 0
                        ? "not-allowed"
                        : "pointer",
                    opacity: hasSubmitted || timeLeft === 0 ? 0.6 : 1,
                  }}
                >
                  <div className="option-number">{option.id + 1}</div>
                  <span className="option-text">{option.text}</span>
                </div>
              ))}
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={
                selectedAnswer === null || hasSubmitted || timeLeft === 0
              }
              style={{
                // Force visibility with inline styles to override any CSS issues
                display: "block !important",
                visibility: "visible !important",
                opacity: selectedAnswer === null || hasSubmitted || timeLeft === 0 ? 0.6 : 1,
                background: hasSubmitted 
                  ? "linear-gradient(90deg, #10b981 0%, #059669 100%)" 
                  : "linear-gradient(90deg, #8F64E1 0%, #1D68BD 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "50px",
                padding: "16px 48px",
                fontSize: "18px",
                fontWeight: "600",
                cursor: selectedAnswer === null || hasSubmitted || timeLeft === 0 
                  ? "not-allowed" 
                  : "pointer",
                boxShadow: "0 4px 16px rgba(143, 100, 225, 0.25)",
                margin: "20px auto 0",
                width: "auto",
                minWidth: "150px",
                transition: "all 0.3s ease",
                zIndex: 999,
                position: "relative"
              }}
            >
              {hasSubmitted ? "Answer Submitted" : "Submit"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Student;