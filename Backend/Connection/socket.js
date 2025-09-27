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
export function IntilizeSocketAndRoleConnection(io) {
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

