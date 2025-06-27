document.addEventListener("DOMContentLoaded", () => {
  const adminAccessModal = document.getElementById("adminAccessModal");
  const adminContent = document.getElementById("adminContent");
  const submitPassword = document.getElementById("submitPassword");
  const adminPassword = document.getElementById("adminPassword");
  const studentForm = document.getElementById("studentForm");
  const adminStudentTable = document.getElementById("adminStudentTable");

  // Admin access with Ctrl+Shift+U
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "U") {
      adminAccessModal.classList.add("active");
    }
  });

  // Password validation via API
  submitPassword.addEventListener("click", async () => {
    const response = await fetch("/api/admin/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword.value }),
    });
    const result = await response.json();
    if (result.success) {
      adminAccessModal.classList.remove("active");
      adminContent.classList.remove("hidden");
      loadStudents();
    } else {
      alert("Incorrect password");
    }
  });

  // Load students
  async function loadStudents() {
    const response = await fetch("/api/students");
    const students = await response.json();
    adminStudentTable.innerHTML = students
      .map(
        (student) => `
      <tr class="border-b">
        <td class="py-4 px-6 text-sm text-gray-600">${student.name}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.course}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.collegeName}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.marks}%</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.email}</td>
        <td class="py-4 px-6">
          <button class="text-red-600 hover:text-red-800 delete-btn" data-student-id="${student._id}">Delete</button>
        </td>
      </tr>
    `
      )
      .join("");

    // Delete button handlers
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const studentId = e.target.dataset.studentId;
        await fetch(`/api/students/${studentId}`, { method: "DELETE" });
        loadStudents();
      });
    });
  }

  // Add student
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(studentForm);
    const student = {
      name: formData.get("name"),
      course: formData.get("course"),
      collegeName: formData.get("collegeName"),
      marks: parseInt(formData.get("marks")),
      email: formData.get("email"),
      image: formData.get("image"),
    };
    try {
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      studentForm.reset();
      loadStudents();
    } catch (err) {
      alert("Failed to add student");
    }
  });
});
