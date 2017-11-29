const editor = document.getElementById("editor");
const preview = document.getElementById("preview-pane");
const saveButton = document.getElementById("save");
const fileName = document.getElementById("current-file-name");
const fileNameEditor = document.getElementById("file-name-edit");
const renameButton = document.getElementById("rename");
const signUpButton = document.getElementById("sidebar-sign-up");
const signInButton = document.getElementById("sidebar-sign-in");

const authModalContainer = document.getElementById("auth-modal-container");
const signUpFormContainer = document.getElementById("sign-up-form-container");
const signInFormContainer = document.getElementById("sign-in-form-container");
const signUpForm = document.getElementById("sign-up-form");

const confirmSignUpButton = document.getElementById("btn-confirm-sign-up");
const confirmSignInButton = document.getElementById("btn-confirm-sign-in");
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

signUpButton.addEventListener("click", function(){
  authModalContainer.classList.remove("hidden");
  signUpFormContainer.classList.remove("hidden");
});

signInButton.addEventListener("click", function(){
  authModalContainer.classList.remove("hidden");
  signInFormContainer.classList.remove("hidden");
});

confirmSignUpButton.addEventListener("click", function(event){
  event.preventDefault();
  const formData = new FormData(signUpForm);
  const payload = {}
  for (var [key, value] of formData.entries()) {
    payload[key] = value;
  }

  fetch("http://localhost:3000/users/sign-up", {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "post",
    body: JSON.stringify(payload)
  })
    .then(res =>{
      console.log(res);
      authModalContainer.classList.add("hidden");
      signUpFormContainer.classList.add("hidden");
    })
    .catch(e => {
      throw e;
    });
});

confirmSignInButton.addEventListener("click", function(event){
  event.preventDefault();
  const formData = new FormData(signUpForm);
  const payload = {}
  for (var [key, value] of formData.entries()) {
    payload[key] = value;
  }

  fetch("http://localhost:3000/users", {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "post",
    body: JSON.stringify(payload)
  })
    .then(res =>{
      console.log(res);
      authModalContainer.classList.add("hidden");
      signInFormContainer.classList.add("hidden");
    })
    .catch(e => {
      throw e;
    });
});
loadNewMarkdown();
