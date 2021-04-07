const getData = () => {
  if (localStorage.getItem("allUsers") <= 10) {
    let allUsers = document.getElementById("allUsers").value;
    let email = document.getElementById("email").value;
    localStorage.setItem("allUsers", allUsers);
    localStorage.setItem("email", email);
    document.getElementById("allUsers").remove();
    document.getElementById("email").remove();
  }
};
