const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  course: String,
  collegeName: String,
  marks: Number,
  email: String,
  image: String,
});
const Student = mongoose.model("Student", studentSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  password: String,
});
const Admin = mongoose.model("Admin", adminSchema);

// Initialize admin password
async function initializeAdmin() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
      await new Admin({ password: hashedPassword }).save();
      console.log("Admin password initialized");
    }
  } catch (err) {
    console.error("Error initializing admin:", err.message);
  }
}
initializeAdmin();

// API Routes
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err.message);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err.message);
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json(student);
  } catch (err) {
    console.error("Error adding student:", err.message);
    res.status(500).json({ message: "Failed to add student" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting student:", err.message);
    res.status(500).json({ message: "Failed to delete student" });
  }
});

app.post("/api/admin/validate", async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await Admin.findOne();
    if (!admin) {
      return res.json({ success: false });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    res.json({ success: isMatch });
  } catch (err) {
    console.error("Error validating admin:", err.message);
    res.status(500).json({ message: "Failed to validate admin" });
  }
});

// Serve EJS pages
app.get("/", (req, res) => {
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

    const userAgent = req.headers["user-agent"]?.toLowerCase() || "";
    const isSocialCrawler =
      /whatsapp|facebookexternalhit|twitterbot|linkedinbot/i.test(userAgent);

    if (isSocialCrawler) {
      const baseUrl = process.env.VERCEL_URL || "https://one-tick.vercel.app";
      const shareUrl = `${baseUrl}/share/${req.params.id}`;
      const title = `${student.name}'s Result`;
      const description = `${student.name} achieved ${student.marks}% in ${student.course} at ${student.collegeName}.`;

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${student.image}" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:url" content="${shareUrl}" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${student.image}" />
        </head>
        <body>
          <h1>${title}</h1>
          <p>${description}</p>
          <img src="${student.image}" alt="${student.name}" />
        </body>
        </html>
      `);
    } else {
      res.render("share");
    }
  } catch (err) {
    console.error("Error in /share/:id:", err.message);
    res.status(500).send("Server error");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
