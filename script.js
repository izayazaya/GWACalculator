document.addEventListener("DOMContentLoaded", function () {
  let fileInput = document.getElementById("file-upload");
  let fileLabel = document.getElementById("file-label");
  let fileLabelSpan = fileLabel.querySelector("span");
  let progressBar = document.getElementById("progress-bar");
  let statusText = document.getElementById("status");
  let startOCRButton = document.getElementById("startOCR");
  let ocrOutput = document.querySelector("#ocr-output pre");

  let storedFileName = sessionStorage.getItem("uploadedFileName") || "";
  fileLabelSpan.textContent = storedFileName || "Upload File";

  fileInput.addEventListener("change", function () {
    handleFileSelection(this.files);
  });

  startOCRButton.addEventListener("click", function (event) {
    event.preventDefault();
    if (fileInput.files.length === 0) {
      alert("Please upload an image first.");
      return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    statusText.textContent = "Uploading...";
    progressBar.style.width = "0%";

    fetch("/grade", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          trackProgress(data.id);
        } else {
          statusText.textContent = "Error: Invalid server response";
        }
      })
      .catch(() => {
        statusText.textContent = "Error: Invalid server response";
      });
  });

  function trackProgress(id) {
    statusText.textContent = "Processing...";
    let interval = setInterval(async function () {
      try {
        let response = await fetch(`/progress/${id}`);
        if (!response.ok) throw new Error("Server error");
        let data = await response.json();

        progressBar.style.width = data.progress + "%";

        if (data.progress >= 100) {
          clearInterval(interval);
          ocrOutput.textContent = data.text;
          statusText.textContent = "OCR Complete!";

          fileInput.value = "";
          sessionStorage.removeItem("uploadedFileName");
          fileLabelSpan.textContent = "Upload File";
        } else if (data.progress === -1) {
          clearInterval(interval);
          statusText.textContent = "Error during OCR";
        }
      } catch (error) {
        console.error("Progress tracking error:", error);
        clearInterval(interval);
        statusText.textContent = "Error tracking progress";
      }
    }, 1000);
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    document.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  document.addEventListener("dragover", () => {
    document.body.classList.add("dragging");
  });

  document.addEventListener("dragleave", (e) => {
    if (e.clientY === 0) {
      document.body.classList.remove("dragging");
    }
  });

  document.addEventListener("drop", (e) => {
    document.body.classList.remove("dragging");
    handleFileSelection(e.dataTransfer.files);
  });

  function handleFileSelection(files) {
    if (files.length > 0) {
      let file = files[0];
      let ext = file.name.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png"].includes(ext)) {
        fileInput.files = files;
        fileLabelSpan.textContent = file.name;
        sessionStorage.setItem("uploadedFileName", file.name);
      } else {
        alert("Only JPG, JPEG, and PNG files are allowed!");
      }
    }
  }

  window.addEventListener("pageshow", function () {
    if (!fileInput.files.length) {
      sessionStorage.removeItem("uploadedFileName");
      fileLabelSpan.textContent = "Upload File";
    }
  });

  fileLabel.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });
});
