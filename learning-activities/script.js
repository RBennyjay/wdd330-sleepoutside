const userList = document.getElementById("users");
const getButton = document.querySelector("button");

async function fetchAndDisplayUsers() {
  try {
    const apiUrl = "https://jsonplaceholder.typicode.com/users";
    const response = await fetch(apiUrl);

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const users = await response.json();

    // Clear old results before adding new ones
    userList.innerHTML = "";

    users.forEach((user) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${user.name}</strong> | ${user.email}`;
      userList.appendChild(li);
    });
  } catch (error) {
    userList.innerHTML = `Could not load users: Error: ${error.message}`;
  }
}

getButton.addEventListener("click", fetchAndDisplayUsers);
