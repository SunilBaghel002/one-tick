const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const studentSchema = new mongoose.Schema({
  name: String,
  course: String,
  collegeName: String,
  marks: Number,
  email: String,
  image: String,
});

const Student = mongoose.model("Student", studentSchema);

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.get("/share/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).send("Student not found");
    }
    const baseUrl = process.env.VERCEL_URL || "http://localhost:8000";
    res.render("share", {
      ogTitle: `${student.name}'s Achievement`,
      ogDescription: `Rank #${
        (await Student.countDocuments({ marks: { $gt: student.marks } })) + 1
      } | ${student.course} | ${student.marks}% | ${student.collegeName}`,
      ogImage: student.image,
      ogUrl: `${baseUrl}/share/${student._id}`,
      twitterCard: "summary_large_image",
      twitterTitle: `${student.name}'s Achievement`,
      twitterDescription: `Rank #${
        (await Student.countDocuments({ marks: { $gt: student.marks } })) + 1
      } | ${student.course} | ${student.marks}% | ${student.collegeName}`,
      twitterImage: student.image,
    });
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).send("Server error");
  }
});

app.post("/admin/login", async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
  if (await bcrypt.compare(password, hashedPassword)) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid password" });
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, course, collegeName, marks, email, image } = req.body;
    const student = new Student({
      name,
      course,
      collegeName,
      marks,
      email,
      image,
    });
    await student.save();
    res.json({ success: true, message: "Student added successfully" });
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
