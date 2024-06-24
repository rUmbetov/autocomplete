
// Создание и добавление эелментов в Body
const createInput = document.createElement("input");
createInput.classList.add("search");
const createDiv = document.createElement("div");
createDiv.classList.add("dropdown");
const createDivContainer = document.createElement("div");
createDivContainer.classList.add("dropdown-container");
const createRepoCard = document.createElement("div");
createRepoCard.classList.add("repo-card");
createDiv.appendChild(createInput);
createDiv.appendChild(createDivContainer);
createDiv.appendChild(createRepoCard);
const body = document.querySelector("body");
body.appendChild(createDiv);

// Очистка Input
function removeClear() {
  createInput.value = " ";
}

//Очистка dropdown-container
function clearList() {
  createDivContainer.innerHTML = "";
}

const debounce = (fn, debounceTime) => {
  let timeoutId;
  let lastInputValue;

  return function (...args) {
    const currentInputValue = args[0];

    clearTimeout(timeoutId);

    if (currentInputValue !== lastInputValue) {
      timeoutId = setTimeout(() => {
        if (timeoutId) {
          fn(currentInputValue);
          lastInputValue = currentInputValue;
        }
      }, debounceTime);
    }
  };
};

// Добавление новых карточек
const addCard = (item) => {
  let name = item.name;
  let owner = item.owner.login;
  let stars = item.stargazers_count;
  const newCard = document.createElement("div");
  newCard.classList.add("chosen");
  newCard.innerHTML = `Name: ${name}<br>Owner: ${owner}<br>Stars: ${stars}<button class="btn-close"></button>`;

  newCard.querySelector(".btn-close").addEventListener("click", () => {
    newCard.remove();
  });

  createRepoCard.appendChild(newCard);

  removeClear();

  clearList();
};

// Запрос на сервер
const getRepos = async (request) => {
  try {
    if (!request.trim()) {
      clearList();
      return;
    }

    const response = await fetch(
      `https://api.github.com/search/repositories?q=${request}`,
      {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const repos = await response.json();
    createDivContainer.innerHTML = "";
    const items = repos.items.slice(0, 5);
    if (items.length === 0) {
      createDivContainer.innerHTML = '<p class="no-results">No results...</p>';
    } else {
      items.forEach((item) => {
        const choice = document.createElement("p");
        choice.className = "choice";
        choice.textContent = `${item.name}`;
        choice.addEventListener("click", () => addCard(item));
        createDivContainer.append(choice);
      });
    }
  } catch (error) {
    console.error("Error during fetch:", error.message);
    createDivContainer.innerHTML = `<p class="error-message">Error fetching data: ${error.message}</p>`;
  }
};
const debounceGetRepos = debounce(getRepos, 1000);

createInput.addEventListener("input", () => {
  const inputValue = createInput.value.trim();

  if (createInput.value[0] === "") {
    clearList();
    return;
  }

  if (inputValue.includes(" ")) {
    return;
  }

  debounceGetRepos(inputValue);
});
