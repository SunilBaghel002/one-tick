document.addEventListener("DOMContentLoaded", () => {
  const adminAccessModal = document.getElementById("adminAccessModal");
  const adminContent = document.getElementById("adminContent");
  const adminPassword = document.getElementById("adminPassword");
  const submitPassword = document.getElementById("submitPassword");
  const studentForm = document.getElementById("studentForm");
  const adminStudentTable = document.getElementById("adminStudentTable");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const toast = document.getElementById("toast");

  // Show toast notification
  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.classList.add(isError ? "bg-red-600" : "bg-green-600");
    toast.classList.remove("opacity-0");
    setTimeout(() => {
      toast.classList.add("opacity-0");
    }, 3000);
  }

  // Validate admin password
  submitPassword.addEventListener("click", async () => {
    const password = adminPassword.value;
    if (!password) {
      showToast("Please enter a password", true);
      return;
    }
    try {
      loadingSpinner.classList.remove("hidden");
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        adminAccessModal.classList.add("hidden");
        adminContent.classList.remove("hidden");
        fetchStudents();
      } else {
        showToast(result.message || "Invalid password", true);
      }
    } catch (err) {
      console.error("Error validating password:", err);
      showToast("Error validating password", true);
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  });

  // Fetch students
  async function fetchStudents() {
    try {
      loadingSpinner.classList.remove("hidden");
      const response = await fetch("/api/students");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const students = await response.json();
      renderStudents(students);
    } catch (err) {
      console.error("Error fetching students:", err);
      showToast("Error fetching students", true);
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  }

  // Render students
  function renderStudents(students) {
    adminStudentTable.innerHTML = students
      .map(
        (student) => `
      <tr class="border-b hover:bg-gray-50">
        <td class="py-4 px-6 text-sm text-gray-600">${student.name}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.course}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.collegeName}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.marks}%</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.email}</td>
        <td class="py-4 px-6">
          <button class="delete-btn text-red-500 hover:text-red-600" data-student-id="${student._id}" aria-label="Delete student">
            <i class="ri-delete-bin-line ri-lg"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    // Attach delete button listeners
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const studentId = e.target.closest("button").dataset.studentId;
        try {
          loadingSpinner.classList.remove("hidden");
          const response = await fetch(`/api/students/${studentId}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          if (result.success) {
            showToast("Student deleted successfully");
            fetchStudents();
          } else {
            showToast("Failed to delete student", true);
          }
        } catch (err) {
          console.error("Error deleting student:", err);
          showToast("Error deleting student", true);
        } finally {
          loadingSpinner.classList.add("hidden");
        }
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
      loadingSpinner.classList.remove("hidden");
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      if (response.ok) {
        showToast("Student added successfully");
        studentForm.reset();
        fetchStudents();
      } else {
        showToast("Failed to add student", true);
      }
    } catch (err) {
      console.error("Error adding student:", err);
      showToast("Error adding student", true);
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  });
});
