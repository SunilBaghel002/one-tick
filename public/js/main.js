import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm";

document.addEventListener("DOMContentLoaded", async () => {
  const topPerformersDiv = document.getElementById("top-performers");
  const studentTable = document.getElementById("student-table");
  const studentSidebar = document.getElementById("studentSidebar");
  const closeSidebar = document.getElementById("closeSidebar");
  const shareModal = document.getElementById("shareModal");
  const closeModal = document.getElementById("closeModal");
  const openShareModal = document.getElementById("openShareModal");
  const sidebarImage = document.getElementById("sidebarImage");
  const sidebarName = document.getElementById("sidebarName");
  const sidebarRank = document.getElementById("sidebarRank");
  const sidebarCourse = document.getElementById("sidebarCourse");
  const sidebarCollege = document.getElementById("sidebarCollege");
  const sidebarMarks = document.getElementById("sidebarMarks");
  const sidebarEmail = document.getElementById("sidebarEmail");
  const sidebarProgress = document.getElementById("sidebarProgress");
  const modalImage = document.getElementById("modalImage");
  const modalName = document.getElementById("modalName");
  const modalRank = document.getElementById("modalRank");
  const modalCourse = document.getElementById("modalCourse");
  const modalCollege = document.getElementById("modalCollege");
  const modalMarks = document.getElementById("modalMarks");
  const modalEmail = document.getElementById("modalEmail");
  const modalLink = document.getElementById("modalLink");
  const copyLinkBtn = document.getElementById("copyLinkBtn");
  const copyTooltip = document.getElementById("copyTooltip");
  const linkedinShareBtn = document.getElementById("linkedinShareBtn");
  const twitterShareBtn = document.getElementById("twitterShareBtn");
  const whatsappShareBtn = document.getElementById("whatsappShareBtn");
  const downloadQrBtn = document.getElementById("downloadQrBtn");
  const qrCode = document.getElementById("qrCode");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const baseUrl = window.location.hostname.includes("vercel.app")
    ? "https://one-tick.vercel.app"
    : "http://localhost:8000";
  let currentStudentId = null;
  let students = [];

  // Create canvas for QR code
  let qrCanvas = null;

  // Fetch students
  async function fetchStudents() {
    try {
      loadingSpinner.classList.remove("hidden");
      const response = await fetch("/api/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      students = await response.json();
      students.sort((a, b) => b.marks - a.marks);
      renderStudents();
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  }

  // Render students
  function renderStudents() {
    if (!topPerformersDiv || !studentTable) return;
    topPerformersDiv.innerHTML = students
      .slice(0, 3)
      .map((student, index) => {
        const colors = ["bg-primary", "bg-accent2", "bg-accent3"];
        const borderColors = [
          "border-primary",
          "border-accent2",
          "border-accent3",
        ];
        const scale =
          index === 0 ? "lg:scale-110 hover:rotate-2" : "hover:scale-105";
        const width = index === 0 ? "lg:w-1/3" : "lg:w-1/4";
        const order =
          index === 0
            ? "order-1 lg:order-2"
            : index === 1
            ? "order-2 lg:order-1"
            : "order-3";
        return `
        <div class="performer-card relative bg-white rounded-xl shadow-lg p-6 w-full ${width} ${order} flex flex-col items-center ${scale} ${
          index === 0 ? "border-t-4 border-primary" : ""
        }" data-student-id="${student._id}">
          <div class="position-badge ${colors[index]}">${index + 1}</div>
          <div class="w-24 h-24 rounded-full overflow-hidden border-4 ${
            borderColors[index]
          } shadow-md mb-4">
            <img src="${student.image}" alt="${
          student.name
        }" class="w-full h-full object-cover object-top" />
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-1">${
            student.name
          }</h3>
          <p class="text-gray-600 text-sm mb-3">${student.course}</p>
          <button class="share-card-btn bg-primary/10 text-primary px-4 py-2 rounded-button hover:bg-primary/20 transition-colors flex items-center gap-2" data-student-id="${
            student._id
          }" aria-label="Share profile">
            <i class="ri-share-line"></i> Share Profile
          </button>
          <div class="w-full space-y-3">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Marks</span>
                <span class="font-semibold">${student.marks}%</span>
              </div>
              <div class="progress-bar bg-gray-200">
                <div class="progress-fill ${colors[index]}" style="width: ${
          student.marks
        }%"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    studentTable.innerHTML = students
      .map(
        (student, index) => `
      <tr class="border-b hover:bg-gray-50">
        <td class="py-4 px-6 text-sm text-gray-600">${index + 1}</td>
        <td class="py-4 px-6">
          <div class="flex items-center">
            <img class="w-8 h-8 rounded-full mr-3 object-cover object-top" src="${
              student.image
            }" alt="${student.name}" />
            <span class="font-medium text-gray-800">${student.name}</span>
          </div>
        </td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.course}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.collegeName}</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.marks}%</td>
        <td class="py-4 px-6 text-sm text-gray-600">${student.email}</td>
        <td class="py-4 px-6">
          <button class="share-table-btn text-primary hover:text-primary/80" data-student-id="${
            student._id
          }" aria-label="Share profile">
            <i class="ri-share-line ri-lg"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    attachShareButtonListeners();
  }

  // Share button handlers
  function attachShareButtonListeners() {
    document
      .querySelectorAll(".share-card-btn, .share-table-btn")
      .forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const studentId =
            e.target.closest("button").dataset.studentId ||
            e.target.closest(".performer-card").dataset.studentId;
          currentStudentId = studentId;
          try {
            loadingSpinner.classList.remove("hidden");
            const response = await fetch(`/api/students/${studentId}`);
            if (!response.ok) throw new Error("Failed to fetch student");
            const student = await response.json();
            const rank = students.findIndex((s) => s._id === studentId) + 1;
            sidebarImage.src = student.image;
            sidebarName.textContent = student.name;
            sidebarRank.textContent = `Rank #${rank}`;
            sidebarCourse.textContent = student.course;
            sidebarCollege.textContent = student.collegeName;
            sidebarMarks.textContent = `${student.marks}%`;
            sidebarEmail.textContent = student.email;
            sidebarProgress.style.width = `${student.marks}%`;
            studentSidebar.classList.remove("translate-x-full");
          } catch (err) {
            console.error("Error fetching student:", err);
          } finally {
            loadingSpinner.classList.add("hidden");
          }
        });
      });
  }

  // Generate QR code
  async function generateQRCode(url) {
    qrCode.innerHTML = ""; // Clear previous QR code
    qrCanvas = document.createElement("canvas");
    qrCanvas.id = "qrCanvas";
    qrCode.appendChild(qrCanvas);
    try {
      await QRCode.toCanvas(qrCanvas, url, {
        width: 120,
        errorCorrectionLevel: "H",
      });
    } catch (err) {
      console.error("QR Code generation error:", err);
      qrCode.innerHTML =
        '<p class="text-red-500 text-sm">Failed to generate QR code</p>';
    }
  }

  // Open share modal
  openShareModal.addEventListener("click", async () => {
    if (!currentStudentId) return;
    try {
      loadingSpinner.classList.remove("hidden");
      const response = await fetch(`/api/students/${currentStudentId}`);
      if (!response.ok) throw new Error("Failed to fetch student");
      const student = await response.json();
      const rank = students.findIndex((s) => s._id === currentStudentId) + 1;
      modalImage.src = student.image;
      modalName.textContent = student.name;
      modalRank.textContent = `Rank #${rank}`;
      modalCourse.textContent = student.course;
      modalCollege.textContent = student.collegeName;
      modalMarks.textContent = `${student.marks}%`;
      modalEmail.textContent = student.email;
      modalLink.value = `${baseUrl}/share/${currentStudentId}`;
      await generateQRCode(modalLink.value);
      shareModal.classList.remove("opacity-0", "pointer-events-none");
      shareModal.querySelector(".modal-content").classList.remove("scale-95");
    } catch (err) {
      console.error("Error opening share modal:", err);
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  });

  // Download QR code
  downloadQrBtn.addEventListener("click", () => {
    if (qrCanvas && qrCanvas.getContext) {
      try {
        const dataUrl = qrCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `student-qr-${currentStudentId}.png`;
        link.click();
      } catch (err) {
        console.error("QR Code download error:", err);
        qrCode.innerHTML =
          '<p class="text-red-500 text-sm">Failed to download QR code</p>';
      }
    } else {
      console.error("QR Code canvas not available");
      qrCode.innerHTML =
        '<p class="text-red-500 text-sm">QR code not generated</p>';
    }
  });

  // Close sidebar
  closeSidebar.addEventListener("click", () => {
    studentSidebar.classList.add("translate-x-full");
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    shareModal.classList.add("opacity-0", "pointer-events-none");
    shareModal.querySelector(".modal-content").classList.add("scale-95");
  });
  shareModal.addEventListener("click", (e) => {
    if (e.target === shareModal) {
      shareModal.classList.add("opacity-0", "pointer-events-none");
      shareModal.querySelector(".modal-content").classList.add("scale-95");
    }
  });

  // Copy link
  copyLinkBtn.addEventListener("click", () => {
    modalLink.select();
    document.execCommand("copy");
    copyTooltip.classList.remove("opacity-0", "visibility-hidden");
    setTimeout(() => {
      copyTooltip.classList.add("opacity-0", "visibility-hidden");
    }, 2000);
  });

  // Social sharing
  const getShareMessage = () => {
    const student = students.find((s) => s._id === currentStudentId);
    if (!student) return `Check out this student's results: ${modalLink.value}`;
    return (
      `🎉 *${student.name}'s Achievement* 🎉\n` +
      `Rank: #${students.findIndex((s) => s._id === currentStudentId) + 1}\n` +
      `Course: ${student.course}\n` +
      `Marks: ${student.marks}%\n` +
      `College: ${student.collegeName}\n` +
      `View details: ${modalLink.value}`
    );
  };

  linkedinShareBtn.addEventListener("click", () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      modalLink.value
    )}&title=${encodeURIComponent("Check out this student's results!")}`;
    window.open(url, "linkedin-share-dialog", "width=600,height=400");
  });

  twitterShareBtn.addEventListener("click", () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      modalLink.value
    )}&text=${encodeURIComponent("Check out this student's results!")}`;
    window.open(url, "twitter-share-dialog", "width=600,height=400");
  });

  whatsappShareBtn.addEventListener("click", () => {
    const text = getShareMessage();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  });

  // Handle share page
  if (window.location.pathname.startsWith("/share")) {
    const studentId = window.location.pathname.split("/").pop();
    loadingSpinner.classList.remove("hidden");
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch student");
      const student = await response.json();
      if (student) {
        currentStudentId = studentId;
        document.getElementById("studentImage").src = student.image;
        document.getElementById("studentName").textContent = student.name;
        document.getElementById("studentCourse").textContent = student.course;
        document.getElementById("studentCollege").textContent =
          student.collegeName;
        document.getElementById(
          "studentMarks"
        ).textContent = `${student.marks}%`;
        document.getElementById("studentEmail").textContent = student.email;
        modalImage.src = student.image;
        modalName.textContent = student.name;
        modalRank.textContent = `Rank #${
          students.findIndex((s) => s._id === studentId) + 1 || "N/A"
        }`;
        modalCourse.textContent = student.course;
        modalCollege.textContent = student.collegeName;
        modalMarks.textContent = `${student.marks}%`;
        modalEmail.textContent = student.email;
        modalLink.value = `${baseUrl}/share/${studentId}`;
        await generateQRCode(modalLink.value);
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      qrCode.innerHTML =
        '<p class="text-red-500 text-sm">Failed to load student data</p>';
    } finally {
      loadingSpinner.classList.add("hidden");
    }
    openShareModal.addEventListener("click", () => {
      shareModal.classList.remove("opacity-0", "pointer-events-none");
      shareModal.querySelector(".modal-content").classList.remove("scale-95");
    });
  } else {
    fetchStudents();
  }
});
