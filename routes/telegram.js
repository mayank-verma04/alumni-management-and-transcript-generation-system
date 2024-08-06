const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const router = express.Router();
const session = require("express-session");
const db = require("../db");
const fs = require("fs");
const path = require("path");

const bot = new TelegramBot("7261049172:AAGcq5Gdc_ZOVF0S2fYVas7kdph8-0ikYao", {
  polling: true,
});

// Session management for storing user sessions
const sessions = {};

const awaitingReply = {}; // Track users awaiting replies

// Bot commands
bot.onText(/\/start/, (msg) => {
  console.log(msg);
  bot.sendMessage(msg.chat.id, "Welcome! Please log in using /login");
});

// Prompt for Login Details
bot.onText(/\/login/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Please enter your rollno and password separated by a space (e.g., rollno password)"
  );
  awaitingReply[chatId] = "login";
});

// Handle user replies
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Check if we are awaiting a reply from this user
  if (awaitingReply[chatId] === "login") {
    const [rollno, password] = msg.text.split(" ");

    if (!rollno || !password) {
      bot.sendMessage(
        chatId,
        "Invalid format. Please enter your rollno and password separated by a space."
      );
      return;
    }

    // Authenticate User
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(query, [rollno, password], (err, result) => {
      if (err) {
        console.log(err);
        bot.sendMessage(chatId, "Error querying the database.");
        return;
      }

      if (result.length === 0) {
        bot.sendMessage(chatId, "Wrong Credentials or Not Registered.");
        return;
      }

      const studentQuery = "SELECT * FROM students WHERE rollno = ?";
      db.query(studentQuery, [rollno], (err, studentResult) => {
        if (err) {
          console.log(err);
          bot.sendMessage(chatId, "Error querying the students database.");
          return;
        }

        // Store student data in session
        sessions[chatId] = { student: studentResult[0] };

        const dob = sessions[chatId].student.dob;

        if (password === dob) {
          bot.sendMessage(chatId, "Please change your password.");
          // Redirect to change password process (implement as needed)
        } else {
          bot.sendMessage(
            chatId,
            "Login successful! You can now view your profile by using the /view_profile command."
          );
        }
      });
    });

    // Clear awaiting reply state
    delete awaitingReply[chatId];
  }
});

// View Profile Details
bot.onText(/\/view_profile/, (msg) => {
  const chatId = msg.chat.id;

  if (!sessions[chatId] || !sessions[chatId].student) {
    bot.sendMessage(
      chatId,
      "You need to log in first using the /login command."
    );
    return;
  }

  const studentRollno = sessions[chatId].student.rollno;

  const query = "SELECT * FROM students WHERE rollno = ?";
  db.query(query, [studentRollno], (err, results) => {
    if (err) {
      console.error("Error fetching student details:", err);
      bot.sendMessage(chatId, "Error fetching student details.");
      return;
    }

    const studentDetails = results[0];

    const detailsMessage = `
      Name: ${studentDetails.student_name}
      Roll Number: ${studentDetails.rollno}
      Date of Birth: ${studentDetails.dob}
      Email: ${studentDetails.email}
      Phone: ${studentDetails.phone_no}
    `;
    bot.sendMessage(chatId, detailsMessage);
  });
});

module.exports = router;
