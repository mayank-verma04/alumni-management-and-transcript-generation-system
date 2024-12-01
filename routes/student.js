const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

// Multer setup for profile pics
const storageProfilePic = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profile_pics");
  },
  filename: function (req, file, cb) {
    if (!req.session.student || !req.session.student.rollno) {
      return cb(new Error("Session data missing"));
    }
    const rollno = req.session.student.rollno;
    const extname = path.extname(file.originalname);
    cb(null, "profile_pic_" + rollno + path.extname(file.originalname));
  },
});
const uploadProfilePic = multer({ storage: storageProfilePic });

// Multer setup for offer letters
const storageOfferLetter = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/offer_letters");
  },
  filename: function (req, file, cb) {
    if (!req.session.student || !req.session.student.rollno) {
      //
      return cb(new Error("Session data missing")); //
    }
    const rollno = req.session.student.rollno; //
    const companyName = req.body.company_name.replace(/ /g, "_"); //
    cb(
      null,
      "offer_letter_" +
        rollno +
        "_" +
        companyName +
        path.extname(file.originalname)
    ); //
  },
});
const uploadOfferLetter = multer({ storage: storageOfferLetter });

// Student Registration Page for filling rollno. and dob as password
router.get("/registration", (req, res) => {
  res.render("student/registration");
});

router.post("/registration", (req, res) => {
  let rollno = req.body.rollno;
  let dob = req.body.dob;
  let captcha = req.body["g-recaptcha-response"];

  // Check if CAPTCHA is completed
  if (!captcha) {
    return res.render("student/registration", {
      error: "Please complete the CAPTCHA.",
    });
  }

  // Verify reCAPTCHA
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

  axios
    .post(verifyURL)
    .then((response) => {
      if (response.data.success !== true) {
        return res.render("student/registration", {
          error: "Captcha verification failed.",
        });
      }

      let checkRollno = "SELECT * FROM students WHERE rollno = ?";
      db.query(checkRollno, [rollno], function (error, results) {
        if (error) {
          console.log(error);
          res.status(500).send("Error checking roll number");
          return;
        } else if (results.length > 0) { 
          // Student already exists
          res.render("student/registration", {
            error: "exists",
          });
        } else {
          // Roll number does not exist, proceed with registration
          let insertInStudent =
            "INSERT INTO students (rollno, dob) VALUES (?, ?)";
          let insertInUsers =
            "INSERT INTO users (username, password) VALUES (?, ?)";
          let studentValues = [rollno, dob];
          let userValues = [rollno, dob]; // Using dob as the password

          db.query(insertInStudent, studentValues, function (error, result) {
            if (error) {
              console.log(error);
              res.status(500).send("Error inserting into students table");
              return;
            }

            db.query(insertInUsers, userValues, function (error, result) {
              if (error) {
                console.log(error);
                res.status(500).send("Error inserting into users table");
                return;
              }

              req.session.successMessage =
                "Registered successfully. Log in with your Date of Birth as password.";
              res.redirect("/student/login");
            });
          });
        }
      });
    })
    .catch((error) => {
      console.error("Error verifying CAPTCHA:", error);
      res.status(500).send("Captcha verification failed");
    });
});
//

// Student Login
router.get("/login", (req, res) => {
  const successMessage = req.session.successMessage; // For Password Changes Successfully
  req.session.successMessage = null; // Clear the message after displaying it once

  const message = req.session.message; // For Wrong Credentials or Wrong Password
  req.session.message = null; // Clear the message after displaying it once

  res.render("student/login", { successMessage, message });
});

router.post("/login", (req, res) => {
  const { rollno, password, "g-recaptcha-response": captcha } = req.body;

  if (!captcha) {
    req.session.message = "Please complete the CAPTCHA.";
    return res.redirect("/student/login");
  }

  // Verify reCAPTCHA
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

  axios
    .post(verifyURL)
    .then((response) => {
      if (response.data.success !== true) {
        req.session.message = "Captcha verification failed.";
        return res.redirect("/student/login");
      }

      const query = "SELECT * FROM users WHERE username = ? AND password = ?";
      db.query(query, [rollno, password], (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error inserting into users table");
          return;
        }

        if (result.length === 0) {
          req.session.message = "Wrong Credentials or Not Registered.";
          return res.redirect("/student/login");
        }

        if (result.length > 0) {
          const studentQuery = "SELECT * FROM students WHERE rollno = ?";
          db.query(studentQuery, [rollno], (err, studentResult) => {
            if (err) {
              console.log(err);
              res
                .status(500)
                .send("Error in SELECT * FROM students WHERE rollno = ?");
              return;
            }

            req.session.student = studentResult[0]; // Store student data in session

            const dob = req.session.student.dob;

            if (password === dob) {
              res.redirect("/student/change-password");
            } else {
              res.redirect("/student/dashboard");
            }
          });
        } else {
          res.redirect("/student/login");
        }
      });
    })
    .catch((error) => {
      console.error("Error verifying CAPTCHA:", error);
      res.status(500).send("Captcha verification failed");
    });
});

// Password Change Route if password is DOB //
router.get("/change-password", (req, res) => {
  if (!req.session.student) {
    return res.redirect("/student/login");
  }

  if (req.session.passwordChanged) {
    return res.redirect("/student/dashboard"); // Redirect to dashboard if password has already been changed
  }

  res.render("student/change_password", { student: req.session.student });
});

router.post("/change-password", (req, res) => {
  const { dob, rollno, new_password, confirm_password } = req.body;

  if (new_password !== confirm_password) {
    return res.status(400).send("Passwords do not match");
  }

  const query = `SELECT * FROM students WHERE rollno = ? AND dob = ?`;
  db.query(query, [rollno, dob], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .send("Error in SELECT * FROM students WHERE rollno = ? AND dob = ?");
      return;
    }

    if (results.length > 0) {
      const updateQuery = `UPDATE users SET password = ? WHERE username = ?`;
      db.query(updateQuery, [new_password, rollno], (err, result) => {
        if (err) throw err;
        req.session.passwordChanged = true; // Set the passwordChanged flag in session
        req.session.successMessage =
          "Password changed successfully. Please login again."; // Store success message in session
        res.redirect("/student/login"); // Redirect to login page
      });
    } else {
      res.status(400).send("Invalid credentials");
    }
  });
});

// Password Reset or Forgert Password  //
router.get("/reset-password", (req, res) => {
  const message = req.session.message;
  req.session.successMessage = null; // Clear the message after displaying it once
  req.session.message = null;
  res.render("student/reset-password", { message });
});

// POST route to handle password reset form submission
router.post("/reset-password", (req, res) => {
  const { rollno, student_name, dob, phone_no, email, password } = req.body;

  // Verify user information
  const verifyQuery = `
    SELECT * FROM students WHERE rollno = ? AND student_name = ? AND dob = ? AND phone_no = ? AND email = ?
  `;
  db.query(
    verifyQuery,
    [rollno, student_name, dob, phone_no, email],
    (err, results) => {
      if (err) {
        console.error("Error verifying the information:", err);
        req.session.message =
          "An error occurred while verifying the information.";
        return res.redirect("/student/reset-password");
      }

      if (results.length === 0) {
        req.session.message =
          "Verification failed. Please check your details and try again.";
        return res.redirect("/student/reset-password");
      }

      // Update password in the users table
      const updatePasswordQuery = `
      UPDATE users
      SET password = ?
      WHERE username = ?
    `;
      db.query(updatePasswordQuery, [password, rollno], (err, updateResult) => {
        if (err) {
          console.error("Error updating password:", err);
          req.session.message = "An error occurred while updating password.";
          return res.redirect("/student/reset-password");
        }

        if (updateResult.affectedRows === 0) {
          req.session.message = "User not found or password update failed.";
          return res.redirect("/student/reset-password");
        }

        // Password updated successfully, redirect to login page
        req.session.successMessage = "Password updated successfully.";

        res.redirect("/student/login");
      });
    }
  );
});

//

// Dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");
  //else
  const studentRollno = req.session.student.rollno;

  // Example query to fetch student details from MySQL
  const query = "SELECT * FROM students WHERE rollno = ?";
  db.query(query, [studentRollno], (err, results) => {
    if (err) {
      console.error("Error fetching student details:", err);
      res.status(500).send("Error fetching student details");
      return;
    }

    //as we know only one detail in students table i.e. dob
    if (results[0].student_name === null) {
      res.render("student/dashboard", { studentDetails: null }); // it will send that studentDetails = null
    } else {
      // Render dashboard with student details
      const studentDetails = results[0]; // Assuming only one student detail is fetched
      res.render("student/dashboard", { studentDetails });
    }
  });
});

//

//

// Profile Details //
router.get("/profile", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");
  //else
  const studentRollno = req.session.student.rollno;

  const query = "SELECT * FROM students WHERE rollno = ?";
  db.query(query, [studentRollno], (err, results) => {
    if (err) {
      console.error("Error fetching student details:", err);
      res.status(500).send("Error fetching student details");
      return;
    }

    // Render Profile with student details
    const studentDetails = results[0]; // Assuming only one student detail is fetched
    res.render("student/profile", { studentDetails });
  });
});

// Student Details Register
router.get("/register", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");
  const student = req.session.student;
  if (student.student_name) {
    return res.redirect("/student/dashboard");
  }
  res.render("student/register", { student });
});

router.post("/register", uploadProfilePic.single("profile_pic"), (req, res) => {
  if (!req.session.student || !req.session.student.rollno) {
    return res.status(400).send("Session data missing Login and try Again");
  }
  const {
    student_name,
    gender,
    father_name,
    religion,
    category,
    marital_status,
    department,
    year_of_admission,
    phone_no,
    email,
    nationality,
    domicile_state,
    district,
    pin_code,
    permanent_address,
    correspondence_address,
  } = req.body;

  const rollno = req.session.student.rollno;

  const student = {
    student_name,
    gender,
    father_name,
    religion,
    category,
    marital_status,
    department,
    year_of_admission,
    phone_no,
    email,
    nationality,
    domicile_state,
    district,
    pin_code,
    permanent_address,
    correspondence_address,
    profile_pic: req.file.filename,
  };

  const sqlStudent = "UPDATE students SET ? WHERE rollno = ?";
  const values = [student, rollno];
  db.query(sqlStudent, values, (err, result) => {
    if (err) throw err;
    res.redirect("/student/dashboard");
  });
});

//

//

// Add Job Details
router.get("/job-details", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");
  const student = req.session.student;

  const message = req.session.message;
  req.session.message = null; // Clear the message after displaying it once

  res.render("student/job_details", { student, message });
});

router.post(
  "/job-details",
  uploadOfferLetter.single("offer_letter"),
  (req, res) => {
    if (!req.session.student) return res.redirect("/student/login");

    const {
      rollno,
      date_of_joining,
      company_name,
      address_of_company,
      date_of_leaving,
    } = req.body;
    const offer_letter = req.file.filename;

    // Ensure date_of_leaving is greater than date_of_joining
    if (new Date(date_of_leaving) <= new Date(date_of_joining)) {
      req.session.message =
        "Date of leaving must be greater than date of joining.";

      return res.redirect("/student/job-details");
    }

    const job = {
      rollno,
      date_of_joining,
      company_name,
      address_of_company,
      date_of_leaving,
      offer_letter,
    };

    const sql = "INSERT INTO job_details SET ?";
    db.query(sql, job, (err, result) => {
      if (err) throw err;
      res.redirect("/student/dashboard");
    });
  }
);

// Route to handle updating the date of leaving in View Job Details
router.post("/update-date-of-leaving", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");
  const rollno = req.session.student.rollno;
  const company_name = req.body.company_name;
  const date_of_leaving = req.body.date_of_leaving;

  // Retrieve the current date_of_joining from the database
  const getDateOfJoiningQuery =
    "SELECT date_of_joining FROM job_details WHERE rollno = ? AND company_name = ?";
  db.query(getDateOfJoiningQuery, [rollno, company_name], (err, result) => {
    if (err) {
      console.error("Error fetching date of joining:", err);
      return res
        .status(500)
        .send("Error updating date of leaving. Please try again later.");
    }

    const date_of_joining = result[0].date_of_joining;

    // Ensure date_of_leaving is greater than date_of_joining
    if (new Date(date_of_leaving) <= new Date(date_of_joining)) {
      req.session.message =
        "Date of leaving must be greater than date of joining.";
      return res.status(400).redirect("/student/view-jobs");
    }

    const sql =
      "UPDATE job_details SET date_of_leaving = ? WHERE rollno = ? AND company_name = ?";
    const values = [date_of_leaving, rollno, company_name];
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error updating date of leaving:", err);
        return res
          .status(500)
          .send("Error updating date of leaving. Please try again later.");
      }

      res.redirect("/student/view-jobs");
    });
  });
});

// Example route handler to render view-job-details.ejs
router.get("/view-jobs", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");

  const rollno = req.session.student.rollno;
  const studentQuery = "SELECT * FROM students WHERE rollno = ?";
  db.query(studentQuery, [rollno], (err, resultStudentDetails) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const studentDetails = resultStudentDetails;
    const jobQuery = "SELECT * FROM job_details WHERE rollno = ?";
    db.query(jobQuery, [rollno], (err, resultJobDetails) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      const jobDetails = resultJobDetails;

      const message = req.session.message;
      req.session.successMessage = null; // Clear the message after displaying it once

      req.session.message = null;
      res.render("student/view-jobs", { studentDetails, jobDetails, message });
    });
  });
});

// Logout
router.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/student/dashboard"); // If there's an error, redirect to the dashboard
    }

    // Clear the cookie
    res.clearCookie("connect.sid");

    // Redirect to the login page or homepage
    res.redirect("/student/login");
  });
});

//

//

// View Marks
router.get("/marks/:rollno", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");

  const rollno = req.params.rollno;

  const query = `
  
  SELECT sm.semester, c.course_code, c.course_name, c.course_type, c.min_marks, c.max_marks, c.credits, sm.marks_obtained, sm.marks_internal, sm.grade, stm.total_min_marks, stm.total_max_marks, stm.total_marks_obtained, stm. total_credits, stm.gpa 
  FROM student_marks sm 
  JOIN courses c ON sm.course_code = c.course_code 
  JOIN student_total_marks stm ON sm.rollno = stm.rollno AND sm.semester = stm.semester 
  WHERE sm.rollno = ? ORDER BY sm.semester, c.course_code`;

  db.query(query, [rollno], (err, results) => {
    if (err) throw err;

    // Group results by semester
    const semesters = {};
    results.forEach((result) => {
      if (!semesters[result.semester]) {
        semesters[result.semester] = {
          courses: [],
          total_min_marks: result.total_min_marks,
          total_max_marks: result.total_max_marks,
          total_marks_obtained: result.total_marks_obtained,
          total_credits: result.total_credits,
          gpa: result.gpa,
        };
      }
      semesters[result.semester].courses.push({
        course_code: result.course_code,
        course_name: result.course_name,
        course_type: result.course_type,
        min_marks: result.min_marks,
        max_marks: result.max_marks,
        credits: result.credits,
        marks_obtained: result.marks_obtained,
        marks_internal: result.marks_internal,
        grade: result.grade,
      });
    });

    const semesterNumber = Object.keys(semesters);

    if (
      typeof semesters === "object" &&
      semesters !== null &&
      Object.keys(semesters).length === 0
    ) {
      // semesters is an empty object
      console.log("Semesters is an empty object");
      res.status(404).send(`
        <script>
          alert("Marks Not Added!");
          window.location.href = "/student/dashboard";
        </script>
      `);
      return;
    }
    const studentDetails = req.session.student;

    res.render("student/student_marks", {
      semesters,
      sem: semesterNumber,
      studentDetails,
    });
  });
});

//

// For Wrong Routes redirect the user to " / "
router.use((req, res, next) => {
  res.redirect("/student/dashboard");
});

module.exports = router;
