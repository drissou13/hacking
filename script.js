const storyElement = document.getElementById("story");
const choicesElement = document.getElementById("choices");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const puzzleElement = document.getElementById("puzzle");
const logElement = document.getElementById("log");

const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");

let timeLeft = 120; // Temps total en secondes
let timer;
let score = 0;
let hackingAttempts = 0; // Nombre de tentatives de hacking

// Journal des actions
function logAction(message) {
  const logMessage = document.createElement("p");
  logMessage.textContent = message;
  logElement.appendChild(logMessage);
  logElement.scrollTop = logElement.scrollHeight; // Scroll automatique
}

// Structure de l'histoire
const story = {
  start: {
    text: "Votre mission : identifier une faille critique. Que voulez-vous faire ?",
    choices: [
      { text: "Scanner le réseau", next: "scan_network" },
      { text: "Chercher une connexion vulnérable", next: "find_vulnerability" }
    ]
  },
  scan_network: {
    text: "Vous trouvez une machine avec un mot de passe par défaut. Que voulez-vous faire ?",
    choices: [
      { text: "Tenter de deviner le mot de passe", next: "password_puzzle" },
      { text: "Passer au scan suivant", next: "scan_next" }
    ]
  },
  password_puzzle: {
    puzzle: {
      question: "Mot de passe par défaut : admin, password ou root ?",
      answer: "admin",
      success: "default_password",
      fail: "scan_network"
    }
  },
  default_password: {
    text: "Mot de passe correct. Vous avez sécurisé l'accès !",
    points: 20,
    choices: [
      { text: "Hacker un système sécurisé", next: "hack_system" }, // Nouveau défi
      { text: "Revenir au menu principal", next: "start" }
    ]
  },
  scan_next: {
    text: "Aucune faille trouvée. Retour au menu principal.",
    points: -10,
    choices: [
      { text: "Revenir au menu principal", next: "start" }
    ]
  },
  find_vulnerability: {
    text: "Vous trouvez un port ouvert. Que voulez-vous faire ?",
    points: 15,
    choices: [
      { text: "Analyser le port", next: "analyze_port" },
      { text: "Retourner au menu principal", next: "start" }
    ]
  },
  analyze_port: {
    text: "Analyse réussie ! Vous avez sécurisé la faille.",
    points: 30,
    choices: [
      { text: "Retourner au menu principal", next: "start" }
    ]
  },
  hack_system: {
    text: "Vous tentez de hacker un système sécurisé. Il vous faut entrer un code de sécurité.",
    points: 50,
    puzzle: {
      question: "Entrez le code de sécurité pour hacker le système : 1234, 5678 ou 4321 ?",
      answer: "1234",
      success: "hack_success",
      fail: "hack_fail"
    }
  },
  hack_success: {
    text: "Vous avez pénétré avec succès le système ! Vous avez sécurisé un accès. Bravo !",
    points: 50,
    choices: [
      { text: "Revenir au menu principal", next: "start" }
    ]
  },
  hack_fail: {
    text: "Échec du hacking. Vous avez été repéré. Retour à l'étape précédente.",
    points: -20,
    choices: [
      { text: "Retourner au menu principal", next: "start" }
    ]
  }
};

// Chronomètre
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Temps restant : ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame("Temps écoulé ! Mission échouée.");
    }
  }, 1000);
}

// Puzzle interactif
function showPuzzle(puzzle) {
  puzzleElement.classList.remove("hidden");
  puzzleElement.innerHTML = `<p>${puzzle.question}</p>`;
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Votre réponse...";
  puzzleElement.appendChild(input);

  const submitButton = document.createElement("button");
  submitButton.textContent = "Valider";
  submitButton.addEventListener("click", () => {
    if (input.value === puzzle.answer) {
      puzzleElement.classList.add("hidden");
      updateStory(puzzle.success, true);
    } else {
      puzzleElement.classList.add("hidden");
      updateStory(puzzle.fail, false);
    }
  });
  puzzleElement.appendChild(submitButton);
}

// Mise à jour de l'histoire
function updateStory(step, success) {
  const currentStep = story[step];
  storyElement.innerHTML = `<p>${currentStep.text || ""}</p>`;
  choicesElement.innerHTML = "";

  if (currentStep.points !== undefined) {
    score += currentStep.points;
    scoreElement.textContent = `Score : ${score}`;
    logAction(`${success ? "Succès" : "Échec"} : ${currentStep.text}`);
    if (success) successSound.play();
    else failSound.play();
  }

  if (currentStep.choices) {
    currentStep.choices.forEach(choice => {
      const button = document.createElement("button");
      button.textContent = choice.text;
      button.addEventListener("click", () => updateStory(choice.next));
      choicesElement.appendChild(button);
    });
  } else if (currentStep.puzzle) {
    showPuzzle(currentStep.puzzle);
  }
}

// Fin de la partie
function endGame(message) {
  storyElement.innerHTML = `<p>${message}</p>`;
  choicesElement.innerHTML = '<button onclick="location.reload()">Rejouer</button>';
  clearInterval(timer);
}

// Initialisation
updateStory("start");
startTimer();
