const editor = document.getElementById("editor");
const preview = document.getElementById("preview-pane");
const saveButton = document.getElementById("save");
const fileName = document.getElementById("current-file-name");
const fileNameEditor = document.getElementById("file-name-edit");
const renameButton = document.getElementById("rename");
const saveFile = function(){
  const fileText = editor.value;

  const payload = {
    fileName: fileName.innerText,
    fileText
  };
  fetch("http://localhost:3000/", {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "post",
    body: JSON.stringify(payload)
  })
    .catch(e => {
      throw e;
    });
};

const loadNewMarkdown = function(){
  editor.value = "";
  fileName.innerText = "Untitled.md";
};
editor.addEventListener('input', function(){

  preview.innerHTML = marked(editor.value);
});
fileName.addEventListener('click', function(){
  fileName.classList.add("hidden");
  fileNameEditor.classList.remove("hidden");
  document.getElementById("file-rename-input").value = fileName.innerText;
  // fileName.class = " hidden";
});
saveButton.addEventListener("click", function(){
  saveFile();
});
renameButton.addEventListener("click", function(){
  fileName.classList.remove("hidden");
  fileNameEditor.classList.add("hidden");
  fileName.innerText = document.getElementById("file-rename-input").value;
});
loadNewMarkdown();
