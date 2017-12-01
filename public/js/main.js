let user;
const workspace= (()=>{
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview-pane");
  const saveButton = document.getElementById("save");
  const updateMarkdown = function updateMarkdown(){
    preview.innerHTML = marked(editor.value);
  };

  const loadNewMarkdown = function(){
    editor.value = "";
    currentFileName.updateFileNameLabel("Untitled Markdown");
    updateMarkdown();
  };

  const setEditorText = function(editorText){
    editor.value = editorText;
  };
  const getEditorText = function(){
    return editor.value;
  };
  const saveFile = function(){
    console.log(workspace.getEditorText())
    const fileText = workspace.getEditorText();
    const payload = {
      fileName: currentFileName.getFileName(),
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
        sidebar.updateUserFiles();
      })
      .catch(e => {
        throw e;
      });
  };
  editor.addEventListener('input', function(){
    updateMarkdown();
  });

  saveButton.addEventListener("click", function(){
    saveFile();
  });


  return {
    loadNewMarkdown,
    setEditorText,
    getEditorText,
    updateMarkdown
  };
})();

const currentFileName = (()=>{
  const fileName = document.getElementById("current-file-name");
  const fileNameEditor = document.getElementById("file-name-edit");
  const renameButton = document.getElementById("rename");

  const updateFileNameLabel = function(newName){
    fileName.innerText = newName;
  };

  const getFileName = function(){
    return fileName.innerText;
  };

  // Listen for clicks on the file name to start edit mode
  fileName.addEventListener('click', function(){
    fileName.classList.add("hidden");
    fileNameEditor.classList.remove("hidden");
    document.getElementById("file-rename-input").value = fileName.innerText;
  });

  // Listen for edit confirmation
  renameButton.addEventListener("click", function(){
    fileName.classList.remove("hidden");
    fileNameEditor.classList.add("hidden");
    updateFileNameLabel(document.getElementById("file-rename-input").value);
  });
  return {
    updateFileNameLabel,
    getFileName
  };
})();

const sidebar = (()=>{
  const userName = document.getElementById("sidebar-user-name");
  const newFileButton = document.getElementById("sidebar-new-file");
  const userFileArea = document.getElementById("user-file-area");
  newFileButton.addEventListener("click", function(){
    workspace.loadNewMarkdown();
  });
  const clearUserFiles = function clearUserFiles(){
    while(userFileArea.hasChildNodes()){
      userFileArea.removeChild(userFileArea.lastChild);
    }
  };
  const setUserName = function(newUserName){
    userName.innerText = newUserName;
  };
  const loadUserFiles = function(){
    const uri = `http://localhost:3000/?userId=${user.id}`;
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
  const updateUserFiles = function updateUserFiles(){
    clearUserFiles();
    loadUserFiles();
  };
  const deleteFile = function(id){
    fetch(`http://localhost:3000/file/delete/${id}`, {
      method: "delete",
      credentials: 'include'
    })
      .then(() =>{
        updateUserFiles();
      })
      .catch(e => {
        throw e;
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
      deleteFile(fileElement.id);
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
            console.log(fileJSON.markdown);
            workspace.setEditorText(fileJSON.markdown);
            currentFileName.updateFileNameLabel(fileJSON.name);
            workspace.updateMarkdown();
          });
      })
      .catch(e => {
        console.log(e);
        throw e;
      });
  };
  return {
    updateUserFiles,
    setUserName,
    clearUserFiles,
    loadFile
  };
})();

const authorizationModal = (()=>{
  const authModalContainer = document.getElementById("auth-modal-container");
  const signUpFormContainer = document.getElementById("sign-up-form-container");
  const signInFormContainer = document.getElementById("sign-in-form-container");
  const signUpForm = document.getElementById("sign-up-form");
  const signInForm = document.getElementById("sign-in-form");
  const confirmSignUpButton = document.getElementById("btn-confirm-sign-up");
  const confirmSignInButton = document.getElementById("btn-confirm-sign-in");
  const signUpButton = document.getElementById("sidebar-sign-up");
  const signInButton = document.getElementById("sidebar-sign-in");
  const signOutButton = document.getElementById("sidebar-sign-out");
  const modalCloseButton = document.getElementById("modal-close");
  const closeModal = function closeModal(){
    authModalContainer.classList.add("hidden");
    signInFormContainer.classList.add("hidden");
    signUpFormContainer.classList.add("hidden");
  };
  modalCloseButton.addEventListener("click", function(){
    closeModal();
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
            user = responseJSON;
            sidebar.setUserName(user.username);
            signInButton.classList.add("hidden");
            signOutButton.classList.remove("hidden");
            signUpButton.classList.add("hidden");
            closeModal();
          });
      })
      .catch(e => {
        throw e;
      });

    return {
      closeModal
    };
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
            sidebar.setUserName(user.username);
            signInButton.classList.add("hidden");
            signOutButton.classList.remove("hidden");
            signUpButton.classList.add("hidden");
            // loadUserFiles(user);
            sidebar.updateUserFiles();

            if (responseData.last_edited){
              sidebar.loadFile(responseData.last_edited);
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
        sidebar.setUserName("Public");
        signInButton.classList.remove("hidden");
        signOutButton.classList.add("hidden");
        signUpButton.classList.remove("hidden");
        user = null;
        closeModal();
        sidebar.clearUserFiles();
      })
      .catch(e => {
        throw e;
      });
  });
})();

workspace.loadNewMarkdown();
