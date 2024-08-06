# Alumni Management and Transcript Generation System

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Database Schema](#database-schema)
7. [Routes](#routes)
8. [Contributing](#contributing)
9. [Contact](#contact)

## Project Overview

The **Alumni Management and Transcript Generation System** is a web application designed to help universities manage information about alumni, including their current job positions and job history. It also facilitates the generation of transcripts for students.

## Features

- Alumni Registration
- Job History Management
- Transcript Generation
- Admin Dashboard for managing students and courses
- Secure Login for Admin and Students

## Technologies Used

- Node.js
- Express.js
- MySQL
- EJS (Embedded JavaScript)
- Axios
- Body-parser
- Express-session
- Multer

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aniket-thapa/alumni-management-and-transcript-generation-system.git
   cd alumni-management-and-transcript-generation-system
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up the MySQL database:

   - Create a database named `university_db`
   - Run the given SQL script [mysql_db_query.sql](https://github.com/aniket-thapa/alumni-management-and-transcript-generation-system/blob/main/mysql_db_query.sql) to create the necessary tables.

4. Configure the database connection in `db.js`:

5. Start the server:
   ```bash
   node app.js
   ```

## Usage

- Access the application at `http://localhost:3000`
- Admin login: `/admin/login`
- Student login: `/student/login`

## Routes

- **Home Route**:

  ```javascript
  app.get("/", (req, res) => {
    res.render("index");
  });
  ```

- **Student Routes**: `routes/student.js`
- **Admin Routes**: `routes/admin.js`

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## Contact

Created by [Aniket Thapa](https://www.linkedin.com/in/aniket-thapa) and [Mayank Verma](https://www.linkedin.com/in/mayank-verma04) - feel free to contact us!
