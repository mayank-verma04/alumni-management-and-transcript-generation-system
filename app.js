const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const app = express();

// Setup database
const db = require("./db");

// Setup body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "34te5yrhdgfsasegtryhdgrew4t5eg",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Setup EJS
app.set("view engine", "ejs");

// Setup static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");
const botRoutes = require("./routes/telegram");

app.use("/student", studentRoutes);
app.use("/admin", adminRoutes);
app.use("/", botRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

//

// For Wrong Routes redirect the user to " / "
app.use((req, res) => {
  res.redirect("/");
});

//

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
