const getData = () => {
  let status = document.getElementById("status").value;
  console.log("Year->Branch->CouncilEmail->Name->studentName");
  console.log(status);
  if (status == "teacher ") {
    document.getElementById("details-btn").style.display = "none";
    document.getElementById("new-btn").style.display = "none";
    document.getElementById("branch-dropdown").style.display = "block";
  } else {
    document.getElementById("new-btn").style.display = "block";
    document.getElementById("details-btn").style.display = "block";
    document.getElementById("branch-dropdown").style.display = "none";
  }
  if (localStorage.getItem("allUsers") <= 10) {
    let allUsers = document.getElementById("allUsers").value;
    let email = document.getElementById("email").value;
    localStorage.setItem("allUsers", allUsers);
    localStorage.setItem("email", email);
    document.getElementById("allUsers").remove();
    document.getElementById("email").remove();
  }
};
