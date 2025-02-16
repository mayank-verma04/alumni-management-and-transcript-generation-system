const express = require('express');
const fs = require('fs');
const router = express.Router();
const db = require('../db');
const path = require('path');

// Helper function to delete a file if it exists
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file: ${filePath}`, err);
    });
  }
}

// Admin Login
router.get('/login', (req, res) => {
  const message = req.session.message; // For Wrong Credentials or Wrong Password
  req.session.message = null; // Clear the message after displaying it once

  res.render('admin/login', { message });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM admin_login WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, result) => {
    // When there is no data is found in mySQL that means wrong details filled
    if (result.length === 0) {
      req.session.message = 'Wrong Credentials.';
      return res.redirect('/admin/login');
    }
    if (result.length > 0) {
      const studentQuery = 'SELECT * FROM admin_login WHERE username = ?';
      db.query(studentQuery, [username], (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .send('Error in SELECT * FROM admin_login WHERE username = ?');
          return;
        }
        req.session.admin = result[0]; //Store Admin Data in Session

        res.redirect('/admin/dashboard');
      });
    } else {
      res.redirect('/admin/login');
    }
  });
});

//

// Admin Dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  //else
  res.render('admin/dashboard');
});

// View All Students
router.get('/students', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  //else
  const query = 'SELECT * FROM students';
  db.query(query, (err, students) => {
    if (err) throw err;
    res.render('admin/student_list', { students });
  });
});

// Edit Student
router.get('/students/edit/:rollno', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  //else
  const { rollno } = req.params;
  const query = 'SELECT * FROM students WHERE rollno = ?';
  db.query(query, [rollno], (err, result) => {
    if (err) throw err;
    const student = result[0];
    res.render('admin/edit_student', { student });
  });
});

router.post('/update-student', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const student = req.body;
  const updatesql = `UPDATE students set student_name = ?, father_name = ?, dob = ?, gender = ?, religion = ?, category = ?, phone_no = ?, email = ?, department = ?, year_of_admission = ?, nationality = ?, domicile_state = ?, district = ?, pin_code = ?, permanent_address = ?, correspondence_address = ?, marital_status = ? WHERE rollno = ?`;

  db.query(
    updatesql,
    [
      student.student_name,
      student.father_name,
      student.dob,
      student.gender,
      student.religion,
      student.category,
      student.phone_no,
      student.email,
      student.department,
      student.year_of_admission,
      student.nationality,
      student.domicile_state,
      student.district,
      student.pin_code,
      student.permanent_address,
      student.correspondence_address,
      student.marital_status,
      student.rollno,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error registering student.');
      }
      res.redirect('/admin/dashboard');
    }
  );
});

// Helper function to delete files with a given prefix (Using callbacks)
const deleteFiles = (dir, prefix, callback) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return callback(err);
    }

    const matchingFiles = files.filter((file) => file.startsWith(prefix));
    let deleteCount = 0;

    if (matchingFiles.length === 0) return callback(null);

    matchingFiles.forEach((file) => {
      fs.unlink(path.join(dir, file), (err) => {
        if (err) console.error(`Error deleting file ${file}:`, err);

        deleteCount++;
        if (deleteCount === matchingFiles.length) {
          callback(null); // Call the callback after all files are deleted
        }
      });
    });
  });
};

// DELETE student route (Using callbacks)
router.delete('/students/delete/:rollno', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');

  const { rollno } = req.params;
  const deleteStudentQuery = 'DELETE FROM students WHERE rollno = ?';

  // Execute MySQL query using callback
  db.query(deleteStudentQuery, [rollno], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Define file directories
    const profilePicDir = path.join(
      __dirname,
      '..',
      'public',
      'uploads',
      'profile_pics'
    );
    const offerLetterDir = path.join(
      __dirname,
      '..',
      'public',
      'uploads',
      'offer_letters'
    );

    // Delete profile pictures
    deleteFiles(profilePicDir, `profile_pic_${rollno}`, (err) => {
      if (err) console.error('Error deleting profile picture:', err);

      // Delete offer letters
      deleteFiles(offerLetterDir, `offer_letter_${rollno}`, (err) => {
        if (err) console.error('Error deleting offer letter:', err);

        res.json({ success: true, message: 'Student deleted successfully!' });
      });
    });
  });
});

///////////////

// Search Students
router.post('/students/search', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const { search_query } = req.body;
  const query = `SELECT * FROM students WHERE student_name LIKE ? OR department LIKE ? OR rollno LIKE ?`;
  db.query(
    query,
    [`${search_query}%`, `${search_query}%`, `${search_query}%`],
    (err, students) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ students });
    }
  );
});

//
// Student Details
router.get('/student-details/:rollno', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  //else
  const rollno = req.params.rollno;
  const studentQuery = 'SELECT * FROM students WHERE rollno = ?';
  db.query(studentQuery, [rollno], (err, resultStudentDetails) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    const studentDetails = resultStudentDetails[0];
    const jobQuery = 'SELECT * FROM job_details WHERE rollno = ?';
    db.query(jobQuery, [rollno], (err, resultJobDetails) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      const jobDetails = resultJobDetails;
      res.render('admin/student_details', { studentDetails, jobDetails });
    });
  });
});

//

router.get('/student-job-details/:rollno', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  //else
  const rollno = req.params.rollno;
  const studentQuery = 'SELECT * FROM students WHERE rollno = ?';
  db.query(studentQuery, [rollno], (err, resultStudentDetails) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    const studentDetails = resultStudentDetails[0];
    const jobQuery = 'SELECT * FROM job_details WHERE rollno = ?';
    db.query(jobQuery, [rollno], (err, resultJobDetails) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      const jobDetails = resultJobDetails;

      res.render('admin/view_jobs', { studentDetails, jobDetails });
    });
  });
});

//

//

// Add courses
router.get('/add-courses', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const message = req.session.message;
  req.session.message = null;

  res.render('admin/add_courses', { message });
});

router.post('/add-courses', (req, res) => {
  const courseCodes = req.body.course_code;
  const courseNames = req.body.course_name;
  const courseTypes = req.body.course_type;
  const departments = req.body.department;
  const semesters = req.body.semester;
  const credits = req.body.credits;
  const minMarks = req.body.min_marks;
  const maxMarks = req.body.max_marks;

  for (let i = 0; i < courseCodes.length; i++) {
    const course = {
      course_code: courseCodes[i],
      course_name: courseNames[i],
      course_type: courseTypes[i],
      department: departments,
      semester: semesters,
      credits: credits[i],
      min_marks: minMarks[i],
      max_marks: maxMarks[i],
    };

    const query = 'INSERT INTO courses SET ?';
    db.query(query, course, (err, result) => {
      if (err) throw err;
    });
  }
  req.session.message = 'Course Details Added';
  res.redirect('/admin/view-courses');
});

//

//

//Add Marks
router.get('/add-marks/:rollno/:semester', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  //else
  const { rollno, semester } = req.params;
  // If marks are allready added for the semester
  const marksDetails =
    'SELECT * FROM student_marks WHERE rollno = ? AND semester = ?';

  db.query(marksDetails, [rollno, semester], (err, results) => {
    if (err) {
      return res.status(500).send('Database query error');
    }

    if (results.length > 0) {
      // Send a response and redirect the user
      return res.send(`
        <script>
          alert("Marks Already Added!");
          window.location.href = "/admin/student-details/${rollno}";
        </script>
      `);
    }

    // If not added marks
    const query = `
      SELECT c.* FROM courses c
      JOIN students s ON s.department = c.department
      WHERE s.rollno = ? AND c.semester = ?
    `;
    db.query(query, [rollno, semester], (err, results) => {
      if (err) throw err;
      const sum_min_marksQuery = `
      SELECT SUM(c.min_marks) AS total_min_marks, SUM(c.max_marks) AS total_max_marks, SUM(c.credits) AS total_credits
      FROM students s JOIN courses c ON s.department = c.department 
      WHERE s.rollno = ? AND c.semester = ?;
    `;
      db.query(sum_min_marksQuery, [rollno, semester], (err, sum_marks) => {
        if (err) throw err;

        total_min_marks = sum_marks[0].total_min_marks;
        total_max_marks = sum_marks[0].total_max_marks;
        total_credits = sum_marks[0].total_credits;
        db.query(
          `SELECT student_name, year_of_admission FROM students WHERE rollno = ?`,
          [rollno],
          (err, student_detail) => {
            if (err) throw err;
            res.render('admin/add_marks', {
              courses: results,
              rollno,
              student_name: student_detail[0].student_name,
              student_admission_year: student_detail[0].year_of_admission,
              semester,
              total_min_marks,
              total_max_marks,
              total_credits,
            });
          }
        );
      });
    });
  });
});

router.post('/add-marks', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const {
    rollno,
    semester,
    session,
    marks,
    total_min_marks,
    total_max_marks,
    total_credits,
    total_marks_obtained,
    gpa,
  } = req.body;
  const values = Object.keys(marks).map((course_code) => [
    rollno,
    course_code,
    session,
    marks[course_code].marks_obtained,
    marks[course_code].marks_internal || null,
    marks[course_code].grade,
    marks[course_code].semester,
  ]);

  const query = `
    INSERT INTO student_marks (rollno, course_code, session, marks_obtained, marks_internal, grade, semester)
    VALUES ?
    ON DUPLICATE KEY UPDATE
    marks_obtained = VALUES(marks_obtained),
    marks_internal = VALUES(marks_internal),
    grade = VALUES(grade),
    semester = VALUES(semester)
`;

  db.query(query, [values], (err) => {
    if (err) throw err;
    const totalMarksQuery = 'INSERT INTO student_total_marks SET ?';

    const totalMarksValues = {
      rollno,
      semester,
      session,
      total_min_marks,
      total_max_marks,
      total_credits,
      total_marks_obtained,
      gpa,
    };
    db.query(totalMarksQuery, totalMarksValues, (err, result) => {
      if (err) throw err;
      res.redirect(`/admin/student-details/${rollno}`);
    });
  });
});

//

//

// View Student Marks
router.get('/marks/:rollno', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else

  const rollno = req.params.rollno;

  const query = `
  
  SELECT sm.semester, c.course_code, c.course_name, c.course_type, c.min_marks, c.max_marks, c.credits, sm.marks_obtained, sm.marks_internal, sm.grade, stm.total_min_marks, stm.total_max_marks, stm.total_marks_obtained, stm. total_credits, stm.gpa 
  FROM student_marks sm 
  JOIN courses c ON sm.course_code = c.course_code 
  JOIN student_total_marks stm ON sm.rollno = stm.rollno AND sm.semester = stm.semester 
  WHERE sm.rollno = ? ORDER BY sm.semester, c.course_code`;

  db.query(query, [rollno], (err, results) => {
    if (!req.session.admin) return res.redirect('/admin/login');
    // else
    if (err) throw err;

    if (results.length === 0) {
      // Marks not found
      res.status(404).send(`
        <script>
          alert("Marks Not Added!");
          window.location.href = "/admin/student-details/${rollno}";
        </script>
      `);
      return;
    }

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

    db.query(
      `SELECT student_name, department, profile_pic FROM students WHERE rollno = ?`,
      [rollno],
      (err, student_detail) => {
        if (err) throw err;
        res.render('admin/student_marks', {
          semesters,
          sem: semesterNumber,
          rollno,
          student_detail: student_detail[0],
        });
      }
    );
  });
});

//

//

// Route to get and display view courses
router.get('/view-courses', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const message = req.session.message; // It contains course added message from add-course route
  req.session.message = null;

  db.query('SELECT * FROM courses ORDER BY department', (err, courses) => {
    if (err) console.log(err);

    res.render('admin/view_courses', { message, courses });
  });
});

// Search Courses
router.post('/view-courses/search', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const { search_query } = req.body;
  const query = `SELECT * FROM courses WHERE course_code LIKE ? OR course_name LIKE ? OR semester LIKE ? OR department LIKE ?`;
  db.query(
    query,
    [
      `${search_query}%`,
      `${search_query}%`,
      `${search_query}%`,
      `${search_query}%`,
    ],
    (err, courses) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ courses });
    }
  );
});

// Route to edit a course
router.get('/edit-course/:course_code', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const course_code = req.params.course_code;
  const query = 'SELECT * FROM courses WHERE course_code = ?';

  db.query(query, [course_code], (err, result) => {
    if (err) console.log(err);
    res.render('admin/edit_course', { course: result[0] });
  });
});

router.post('/edit-course/:course_code', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  // else
  const { course_code } = req.params;
  const {
    course_name,
    course_type,
    department,
    semester,
    credits,
    min_marks,
    max_marks,
  } = req.body;

  const editQuery =
    'UPDATE courses SET course_name = ?, course_type = ?, department = ?, semester = ?, credits = ?, min_marks = ?, max_marks = ? WHERE course_code = ?';

  const values = [
    course_name,
    course_type,
    department,
    semester,
    credits,
    min_marks,
    max_marks,
    course_code,
  ];
  db.query(editQuery, values, (err, result) => {
    if (err) console.log(err);
    res.redirect('/admin/view-courses');
  });
});

// Route to delete a course
router.post('/delete/:course_code', (req, res) => {
  const course_code = req.params.course_code;
  db.query(
    'DELETE FROM courses WHERE course_code = ?',
    [course_code],
    (err, result) => {
      if (err) {
        req.session.message = 'You cannot Delete this course';
        return res.redirect('/admin/view-courses');
      }
      res.redirect('/admin/view-courses');
    }
  );
});

//

// Logout
router.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/admin/dashboard'); // If there's an error, redirect to the dashboard
    }

    // Clear the cookie
    res.clearCookie('connect.sid');

    // Redirect to the login page or homepage
    res.redirect('/admin/login');
  });
});

//

//

//
module.exports = router;
