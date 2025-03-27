document.addEventListener("DOMContentLoaded", function () {
  let fileInput = document.getElementById("file-upload");
  let fileLabel = document.getElementById("file-label");
  let fileLabelSpan = fileLabel.querySelector("span");
  let fileName = document.getElementById("file-name");
  let form = document.querySelector("form");

  fileLabelSpan.textContent = fileName.textContent || "Upload File";

  fileInput.addEventListener("change", function () {
    console.log("File input changed");

    if (this.files.length > 0) {
      let fileNameText = this.files[0].name;
      fileLabelSpan.textContent = fileNameText;
      fileLabel.title = fileNameText;
    }

    let fileNameText = this.files[0].name;
    var idxDot = fileNameText.lastIndexOf(".") + 1;
    var extFile = fileNameText.substr(idxDot, fileNameText.length).toLowerCase();
    if (extFile === "jpg" || extFile === "jpeg" || extFile === "png") {
    } else {
      alert("Only jpg/jpeg and png files are allowed!");
      fileInput.value = "";
      fileLabelSpan.textContent = fileName.textContent || "Upload File";
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
      event.preventDefault();
      document.getElementById("file-upload").click();
    }
  });
});
