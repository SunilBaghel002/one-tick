const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/student_results", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>console.log("database connected")).catch((err)=>console.log("error", err))

// Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  class: String,
  marks: Number,
  email: String,
  image: String,
});
const Student = mongoose.model("Student", studentSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  password: String, // Hashed password
});
const Admin = mongoose.model("Admin", adminSchema);

// Initialize admin password (run once to set up, e.g., via a setup script or manually)
async function initializeAdmin() {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10); // Default password: admin123
    await new Admin({ password: hashedPassword }).save();
    console.log("Admin password initialized");
  }
}
initializeAdmin();

// API Routes
app.get("/api/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.get("/api/students/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  res.json(student);
});

app.post("/api/students", async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json(student);
});

app.delete("/api/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin password validation
app.post("/api/admin/validate", async (req, res) => {
  const { password } = req.body;
  const admin = await Admin.findOne();
  if (!admin) {
    return res.json({ success: false });
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  res.json({ success: isMatch });
});

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/admin.html"));
});

app.get("/share/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/share.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
