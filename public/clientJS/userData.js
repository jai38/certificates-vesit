const getData = () => {
  let tbody = document.getElementById("tableBody");
  document.getElementById("email").innerHTML = localStorage.getItem("email");
  let allUsers = JSON.parse(localStorage.getItem("allUsers"));
  let html = "";
  allUsers.forEach((c) => {
    if (c.timestamp) {
      console.log(c.timestamp);
    }
    html += `<tr>
    <td>${c.timestamp}</td>
    <td>${c.UID}</td>
    <td>${c.email}</td>
    <td>${c.studentName}</td>
    <td>${c.branch}</td>
    <td>${c.year}</td>
    <td>${c.name}</td>
    <td><a href='${c.link}' target="_blank">Click Here</td>
      </tr>`;
  });
  tbody.innerHTML = html;
};
