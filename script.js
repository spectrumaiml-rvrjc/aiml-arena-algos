// =========================
// Shared Game Logic
// =========================

// Configurable duration (in seconds)
const GAME_DURATION = 180; // 3 mins for all pages

let timeLeft = GAME_DURATION;
let gameActive = false;
let timer;

// Cached DOM elements
let timerElement, algoContainer, blocksContainer, resultElement, startButton;

function initGame() {
  // Grab common elements from the page
  timerElement = document.getElementById("timer");
  algoContainer = document.getElementById("algo");
  blocksContainer = document.getElementById("blocks");
  resultElement = document.getElementById("result");
  startButton = document.getElementById("start-btn");

  if (startButton) {
    startButton.addEventListener("click", startGame);
  }
}

// Drag & Drop Setup
function setupDragAndDrop() {
  const blocks = document.querySelectorAll(".block");
  const dropzones = document.querySelectorAll(".dropzone");

  blocks.forEach((block) => {
    block.addEventListener("dragstart", dragStart);
    block.addEventListener("dragend", dragEnd);
  });

  dropzones.forEach((dropzone) => {
    dropzone.addEventListener("dragover", dragOver);
    dropzone.addEventListener("dragenter", dragEnter);
    dropzone.addEventListener("dragleave", dragLeave);
    dropzone.addEventListener("drop", drop);

    // Allow clearing filled dropzones
    dropzone.addEventListener("click", function () {
      if (this.classList.contains("filled") && gameActive) {
        const blockKey = this.getAttribute("data-content");
        const originalBlock = document.querySelector(
          `.block[data-key="${blockKey}"]`
        );
        if (originalBlock) {
          originalBlock.classList.remove("used");
        }
        this.textContent = "";
        this.classList.remove("filled");
        this.removeAttribute("data-content");
      }
    });
  });
}

// Drag & Drop Handlers
function dragStart(event) {
  if (this.classList.contains("used") || !gameActive) {
    event.preventDefault();
    return false;
  }
  this.classList.add("dragging");
  // transfer blockValue (display text)
  event.dataTransfer.setData("text/plain", this.getAttribute("data-value"));
}
function dragEnd() { this.classList.remove("dragging"); }
function dragOver(e) { if (gameActive) e.preventDefault(); }
function dragEnter(e) {
  if (!this.classList.contains("filled") && gameActive) {
    e.preventDefault();
    this.classList.add("highlight");
  }
}
function dragLeave() { this.classList.remove("highlight"); }

function drop(e) {
  e.preventDefault();
  if (!gameActive) return;

  this.classList.remove("highlight");

  const blockValue = e.dataTransfer.getData("text/plain"); // full text to display
  const block = document.querySelector(`.block[data-value="${blockValue}"]`);
  if (!block) return;

  const blockKey = block.getAttribute("data-key"); // short identifier

  // If already filled, release previous block
  if (this.classList.contains("filled")) {
    const prevKey = this.getAttribute("data-content");
    const prevBlock = document.querySelector(`.block[data-key="${prevKey}"]`);
    if (prevBlock) prevBlock.classList.remove("used");
  }

  // ✅ Show full text but save the key internally
  this.textContent = blockValue;        // visible text (human-friendly)
  this.classList.add("filled");
  this.setAttribute("data-content", blockKey);  // invisible key for checking

  // Mark the block as used
  block.classList.add("used");
}



// Game Control
function startGame() {
  gameActive = true;
  startButton.style.display = "none";
  timerElement.style.display = "block";
  algoContainer.style.display = "block";
  blocksContainer.style.display = "flex";

  setupDragAndDrop();
  startTimer();
}

function startTimer() {
  timeLeft = GAME_DURATION;
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      let minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
      let seconds = (timeLeft % 60).toString().padStart(2, "0");
      timerElement.innerText = `${minutes}:${seconds}`;
    } else {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  gameActive = false;
  timerElement.innerText = "Time's up!";

  document.querySelectorAll(".block").forEach((block) => {
    block.draggable = false;
    block.style.cursor = "default";
  });

  calculateScore();
}

function calculateScore() {
  const dropzones = document.querySelectorAll(".dropzone");
  let correctCount = 0;

  dropzones.forEach((zone) => {
    const userAnswer = zone.getAttribute("data-content"); // will be "A"
    const correctAnswer = zone.getAttribute("data-answer"); // also "A"


    if (userAnswer === correctAnswer) {
      correctCount++;
      zone.style.borderColor = "var(--string-color)";
      zone.style.backgroundColor = "rgba(195, 232, 141, 0.2)";
    } else {
      zone.style.borderColor = "var(--error)";
      zone.style.backgroundColor = "rgba(255, 83, 112, 0.2)";
    }
  });

  const totalDropzones = dropzones.length;
  resultElement.textContent = `Score: ${correctCount * 5}/${totalDropzones * 5}`;
  resultElement.style.color = (correctCount === totalDropzones)
    ? "var(--string-color)"
    : "var(--accent)";
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initGame);
