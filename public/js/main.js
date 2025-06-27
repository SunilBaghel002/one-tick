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

  let currentStudentId = null; // Store current student ID for sidebar and modal

  // Fetch students
  const response = await fetch("/api/students");
  const students = await response.json();
  students.sort((a, b) => b.marks - a.marks);

  // Render top performers (top 3)
  topPerformersDiv.innerHTML = students
    .slice(0, 3)
    .map((student, index) => {
      const colors = ["bg-primary", "bg-[#A7A7F3]", "bg-[#E6A97C]"];
      const borderColors = [
        "border-primary",
        "border-[#A7A7F3]",
        "border-[#E6A97C]",
      ];
      const scale = index === 0 ? "lg:scale-110" : "";
      const width = index === 0 ? "lg:w-1/3" : "lg:w-1/4";
      const order =
        index === 0
          ? "order-1 lg:order-2"
          : index === 1
          ? "order-2 lg:order-1"
          : "order-3";
      return `
      <div class="performer-card relative bg-white rounded-lg shadow-lg p-6 w-full ${width} ${order} flex flex-col items-center ${scale} ${
        index === 0 ? "border-t-4 border-primary" : ""
      }" data-student-id="${student._id}">
        <div class="position-badge ${colors[index]}">${index + 1}</div>
        <div class="w-24 h-24 rounded-full overflow-hidden border-4 ${
          borderColors[index]
        } mb-4">
          <img src="${student.image}" alt="${
        student.name
      }" class="w-full h-full object-cover object-top" />
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-1">${
          student.name
        }</h3>
        <p class="text-gray-500 text-sm mb-3">${student.course}</p>
        <button class="share-card-btn mt-4 bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary/20 transition-colors !rounded-button">
          <i class="ri-share-line"></i>
          <span>Share Profile</span>
        </button>
        <div class="w-full space-y-3">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Marks</span>
              <span class="font-semibold">${student.marks}%</span>
            </div>
            <div class="progress-bar">
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

  // Render student table
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
        <button class="text-primary hover:text-primary/80 share-table-btn" data-student-id="${
          student._id
        }">
          <i class="ri-share-line ri-lg"></i>
        </button>
      </td>
    </tr>
  `
    )
    .join("");

  // Share button handlers (open sidebar)
  document
    .querySelectorAll(".share-card-btn, .share-table-btn")
    .forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const studentId =
          e.target.closest("button").dataset.studentId ||
          e.target.closest(".performer-card").dataset.studentId;
        currentStudentId = studentId; // Store studentId for modal
        const response = await fetch(`/api/students/${studentId}`);
        const student = await response.json();
        const rank = students.findIndex((s) => s._id === studentId) + 1;
        sidebarImage.src = student.image;
        sidebarName.textContent = student.name;
        sidebarRank.textContent = `Rank #${rank}`;
        sidebarCourse.textContent = student.course;
        sidebarCollege.textContent = student.collegeName;
        sidebarMarks.textContent = `${student.marks}%`;
        sidebarEmail.textContent = student.email;
        studentSidebar.classList.remove("translate-x-full");
      });
    });

  // Open share modal from sidebar
  openShareModal.addEventListener("click", async () => {
    if (!currentStudentId) return; // Prevent modal if no studentId
    const response = await fetch(`/api/students/${currentStudentId}`);
    const student = await response.json();
    const rank = students.findIndex((s) => s._id === currentStudentId) + 1;
    modalImage.src = student.image;
    modalName.textContent = student.name;
    modalRank.textContent = `Rank #${rank}`;
    modalCourse.textContent = student.course;
    modalCollege.textContent = student.collegeName;
    modalMarks.textContent = `${student.marks}%`;
    modalEmail.textContent = student.email;
    modalLink.value = `${window.location.origin}/share/${currentStudentId}`;
    shareModal.classList.remove("opacity-0", "pointer-events-none");
    shareModal.querySelector(".modal-content").classList.remove("scale-95");
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
    copyTooltip.style.opacity = "1";
    copyTooltip.style.visibility = "visible";
    setTimeout(() => {
      copyTooltip.style.opacity = "0";
      copyTooltip.style.visibility = "hidden";
    }, 2000);
  });

  // Social sharing
  const shareUrl = () => modalLink.value;
  linkedinShareBtn.addEventListener("click", () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl()
    )}&title=${encodeURIComponent("Check out this student's results!")}`;
    window.open(url, "linkedin-share-dialog", "width=600,height=400");
  });
  twitterShareBtn.addEventListener("click", () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl()
    )}&text=${encodeURIComponent("Check out this student's results!")}`;
    window.open(url, "twitter-share-dialog", "width=600,height=400");
  });
  whatsappShareBtn.addEventListener("click", () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      "Check out this student's results: " + shareUrl()
    )}`;
    window.open(url, "whatsapp-share-dialog", "width=600,height=400");
  });
});
