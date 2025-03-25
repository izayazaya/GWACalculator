document.addEventListener("DOMContentLoaded", function () {
  let fileInput = document.getElementById("file-upload");
  let fileLabel = document.getElementById("file-label");
  let fileLabelSpan = fileLabel.querySelector("span");
  let fileName = document.getElementById("file-name");
  let form = document.querySelector("form");

  if (!fileInput || !fileLabel || !fileLabelSpan || !fileName || !form) {
    console.error("One or more elements are missing!");
    return;
  }

  fileLabelSpan.textContent = fileName.textContent || "Upload File";

  fileInput.addEventListener("change", function () {
    console.log("File input changed");

    if (this.files.length > 0) {
      let fileNameText = this.files[0].name;
      fileLabelSpan.textContent = fileNameText;
      fileLabel.title = fileNameText;
    }
  });

  form.addEventListener("submit", function (event) {
    console.log("Submit event triggered");

    if (!fileInput.files.length) {
      console.log("No file selected!");
      event.preventDefault();
      alert("Please upload a file before submitting!");
      fileInput.focus();
      return false;
    }
  });

  document.getElementById("file-label").addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Prevent page scroll on Space
      document.getElementById("file-upload").click();
    }
  });
});
