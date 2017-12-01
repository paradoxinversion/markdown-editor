const editor = document.getElementById("editor");
const preview = document.getElementById("preview-pane");
const saveButton = document.getElementById("save");
const fileName = document.getElementById("current-file-name");
const fileNameEditor = document.getElementById("file-name-edit");
const renameButton = document.getElementById("rename");
const signUpButton = document.getElementById("sidebar-sign-up");
const signInButton = document.getElementById("sidebar-sign-in");
const signOutButton = document.getElementById("sidebar-sign-out");

const authModalContainer = document.getElementById("auth-modal-container");
const signUpFormContainer = document.getElementById("sign-up-form-container");
const signInFormContainer = document.getElementById("sign-in-form-container");
const signUpForm = document.getElementById("sign-up-form");
const signInForm = document.getElementById("sign-in-form");
const confirmSignUpButton = document.getElementById("btn-confirm-sign-up");
const confirmSignInButton = document.getElementById("btn-confirm-sign-in");
const modalClose = document.getElementById("modal-close");
const userName = document.getElementById("sidebar-user-name");
const newFileButton = document.getElementById("sidebar-new-file");
const userFileArea = document.getElementById("user-file-area");
newFileButton.addEventListener("click", function(){
  loadNewMarkdown();
});

const updateMarkdown = function updateMarkdown(){
  preview.innerHTML = marked(editor.value);
};
let user;
const fileSelectionContainer = document.getElementById("file-selection-area");
const saveFile = function(){
  const fileText = editor.value;
  const payload = {
    fileName: fileName.innerText,
    fileText,
    user
  };
  fetch("http://localhost:3000/", {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "post",
    body: JSON.stringify(payload),
    credentials: 'include'
  })
    .then(response =>{
      console.log(response);
      updateUserFiles();
    })
    .catch(e => {
      throw e;
    });
};
const deleteFile = function(id){
  console.log("Deleting id:", id)
  fetch(`http://localhost:3000/file/delete/${id}`, {
    method: "delete",
    credentials: 'include'
  })
    .then(response =>{
      updateUserFiles();
    })
    .catch(e => {
      throw e;
    });
};

const loadFile = function loadFile(id){
  const uri = `http://localhost:3000/file/${id}`;
  fetch(uri, {
    method: "get",
    credentials: 'include'
  })
    .then(response => {
      response.json()
        .then(fileJSON =>{
          editor.value = fileJSON.markdown;
          fileName.innerText = fileJSON.name;
          updateMarkdown();
        });
      //Make a file button for each owned file
    })
    .catch(e => {
      console.log(e);
    });
};

const createFileButton = function createFileButton(name, id){
  const fileElement = document.createElement('div');
  fileElement.classList.add("file");
  fileElement.id = id;
  const fileName = document.createElement('p');
  fileName.innerText = name;
  fileName.classList.add("file-name");
  const icon = document.createElement("i");
  icon.classList.add("fa");
  icon.classList.add("fa-trash-o");
  icon.classList.add("file-icon");

  fileElement.appendChild(fileName);
  fileElement.appendChild(icon);
  userFileArea.appendChild(fileElement);


  fileName.addEventListener("click", function(){
    return loadFile(fileElement.id);
  });
  icon.addEventListener("click", function(){
    console.log(this.id)
    deleteFile(fileElement.id);
  });
};

const loadUserFiles = function(){
  const uri = `http://localhost:3000/?userId=${user.id}`;
  //Send a request for files by this user
  fetch(uri, {
    method: "get",
    credentials: 'include'
  })
    .then(response => {
      response.json()
        .then(fileJSON =>{
          fileJSON.forEach(element =>{
            createFileButton(element.name, element.id);
          });
        });
    })
    .catch(e => {
      console.log(e);
    });

};
const clearUserFiles = function clearUserFiles(){
  while(userFileArea.hasChildNodes()){
    userFileArea.removeChild(userFileArea.lastChild);
  }
};
const updateUserFiles = function updateUserFiles(){
  clearUserFiles();
  loadUserFiles();
};


const loadNewMarkdown = function(){
  editor.value = "";
  fileName.innerText = "Untitled.md";
  updateMarkdown();
};

const closeModal = function closeModal(){
  authModalContainer.classList.add("hidden");
  signInFormContainer.classList.add("hidden");
  signUpFormContainer.classList.add("hidden");
};

editor.addEventListener('input', function(){
  updateMarkdown();
});

fileName.addEventListener('click', function(){
  fileName.classList.add("hidden");
  fileNameEditor.classList.remove("hidden");
  document.getElementById("file-rename-input").value = fileName.innerText;
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
  const payload = {};
  for (var [key, value] of formData.entries()) {
    payload[key] = value;
  }

  fetch("http://localhost:3000/users/sign-up", {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "post",
    body: JSON.stringify(payload),
    credentials: 'include'
  })
    .then(rawResponse =>{
      rawResponse.json(rawResponse)
        .then(responseJSON =>{
          console.log(responseJSON);
          user = responseJSON;
          console.log(user);
          userName.innerText = user.username;
          signInButton.classList.add("hidden");
          signOutButton.classList.remove("hidden");
          signUpButton.classList.add("hidden");
          closeModal();
        });
    })
    .catch(e => {
      throw e;
    });
});

confirmSignInButton.addEventListener("click", function(event){
  event.preventDefault();
  const formData = new FormData(signInForm);
  const payload = {};
  for (var [key, value] of formData.entries()) {
    payload[key] = value;
  }

  fetch("http://localhost:3000/users/sign-in", {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "post",
    body: JSON.stringify(payload),
    credentials: 'include'
  })
    .then((res)=>{
      res.json()
        .then((responseData)=>{
          user = responseData.user;
          userName.innerText = user.username;
          signInButton.classList.add("hidden");
          signOutButton.classList.remove("hidden");
          signUpButton.classList.add("hidden");
          // loadUserFiles(user);
          updateUserFiles();

          if (responseData.last_edited){
            loadFile(responseData.last_edited);
          }
        });
      closeModal();
    })
    .catch(e => {
      throw e;
    });
});

signOutButton.addEventListener("click", function(event){
  event.preventDefault();
  fetch("http://localhost:3000/users/sign-out", {
    method: "get",
    credentials: 'include'
  })
    .then(()=>{
      userName.innerText = "Public";
      signInButton.classList.remove("hidden");
      signOutButton.classList.add("hidden");
      signUpButton.classList.remove("hidden");
      user = null;
      closeModal();
      clearUserFiles();
    })
    .catch(e => {
      throw e;
    });

});
loadNewMarkdown();
