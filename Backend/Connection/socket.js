import { Server } from "socket.io";
import dotenv from 'dotenv'
dotenv.config()

let io;
export const currentPoll = {
  question: null,
  options: [],
  correctOptionIndex: null,
  timerSeconds: 0,
  timerInterval: null,
  answers: {},
  students: new Set(),
  pollId: "Poll-123",
};

// creating function regarding socket and role connection
export function IntilizeSocketAndRoleConnection(server) {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: ["https://idyllic-griffin-e4ef89.netlify.app/", process.env.FRONTEND_PRODUCTION_URL,"http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "PATCH"],
      credentials: true,
    },
  });

  // Connection of Socket
  io.on("connection", (socket) => {
    console.log("Socket Connected", socket.id);

    // Connection Socket of Student
    socket.on("join", ({ role, name }) => {
      socket.data.role = role;
      socket.data.name = name;

      // Lower Case Role Name
      if (role === "student") {
        if (currentPoll.students.has(name)) {
          socket.emit("join-error", "Student Name Already Taken");
          socket.disconnect();
          return;
        }
        currentPoll.students.add(name);
      }
      socket.join("poll-room");
      socket.emit("join-emit", { message: `Student ${name} joined poll room` });
    });

    socket.on("submit-answer", ({ studentName, selectedOption }) => {
      if (
        studentName &&
        typeof selectedOption === "number" &&
        currentPoll.students.has(studentName)
      ) {
        currentPoll.answers[studentName] = selectedOption;
        console.log(
          `Answer recorded: ${studentName} chose option ${selectedOption}`
        );
      }
    });

    // Disconnection of socket if student is deleted
    socket.on("disconnect", () => {
      const { role, name } = socket.data;
      if (role === "student" && name) {
        currentPoll.students.delete(name);
        delete currentPoll.answers[name];
        console.log(`Student ${name} disconneted.`);
      }
    });
  });
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
