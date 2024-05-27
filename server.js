const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()
const port = 9500

// Path to the courses.json file
const coursesFilePath = path.resolve(__dirname, "db.json")

// Function to read courses from the JSON file
const readCoursesFromFile = () => {
  const data = fs.readFileSync(coursesFilePath, "utf8")
  return JSON.parse(data)
}

// Function to write courses to the JSON file
const writeCoursesToFile = (courses) => {
  fs.writeFileSync(coursesFilePath, JSON.stringify(courses, null, 2), "utf8")
}

// Enable CORS for all routes
app.use(cors())

// Middleware to parse JSON
app.use(express.json())

// Route to get all courses
app.get("/api/v1/courses", (req, res) => {
  const courses = readCoursesFromFile()
  res.json(courses)
})

// Route to get courses enrolled by a specific user
app.get("/api/v1/courses/user/:userEmail", (req, res) => {
  // Updated route to avoid conflict with course title route
  const userEmail = req.params.userEmail
  const courses = readCoursesFromFile()

  const enrolledCourses = courses.filter((course) =>
    course.enrolledUsers.includes(userEmail)
  )

  res.json(enrolledCourses)
})

// Route to get a course by title
app.get("/api/v1/courses/title/:title", (req, res) => {
  // Updated route to avoid conflict with user email route
  const courseTitle = req.params.title
  const courses = readCoursesFromFile()

  const course = courses.find(
    (c) => c.title.toLowerCase() === courseTitle.toLowerCase()
  )

  if (course) {
    res.json(course)
  } else {
    res.status(404).json({ message: "Course not found" })
  }
})

// Route to enroll in a course
app.put("/api/v1/courses/:id/enroll", (req, res) => {
  const courseId = parseInt(req.params.id)
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "User email is required" })
  }

  const courses = readCoursesFromFile()
  const courseIndex = courses.findIndex((course) => course.id == courseId)

  if (courseIndex === -1) {
    return res.status(404).json({ message: "Course not found" })
  }

  if (!courses[courseIndex].enrolledUsers.includes(email)) {
    courses[courseIndex].enrolledUsers.push(email)
    writeCoursesToFile(courses) // Write the updated courses to the file
  }

  res.json(courses[courseIndex])
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
