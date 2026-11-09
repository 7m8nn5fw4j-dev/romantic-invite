const screens = {
  1: document.getElementById("screen1"),
  sure: document.getElementById("screenSure"),
  2: document.getElementById("screen2"),
  3: document.getElementById("screen3"),
  4: document.getElementById("screen4"),
  done: document.getElementById("screenDone")
};
const progress = document.getElementById("progressBar");
const stepLabel = document.getElementById("stepLabel");
let accepted = false;

function show(name, step) {
  Object.values(screens).forEach(el => el.classList.remove("active"));
  screens[name].classList.add("active");
  const current = step || (name === "sure" ? 1 : name === "done" ? 4 : Number(name));
  progress.style.width = `${current * 25}%`;
  stepLabel.textContent = name === "done" ? "ГОТОВО" : `ВОПРОС ${current} ИЗ 4`;
  stepLabel.style.display = name === "done" ? "none" : "block";
}
function goToDate() { accepted = true; show("2", 2); }

document.getElementById("yes1").addEventListener("click", goToDate);
document.getElementById("no1").addEventListener("click", () => show("sure", 1));
document.getElementById("yesSure").addEventListener("click", goToDate);
// Кнопка «Нет» намеренно не выполняет действие.
document.getElementById("noSure").addEventListener("click", e => e.preventDefault());

document.getElementById("next2").addEventListener("click", () => {
  const date = document.getElementById("date").value;
  if (!date) { document.getElementById("date").focus(); return; }
  show("3", 3);
});
document.getElementById("next3").addEventListener("click", () => {
  if (!document.getElementById("activity").value.trim()) {
    document.getElementById("activity").focus(); return;
  }
  show("4", 4);
});
document.getElementById("submit").addEventListener("click", async () => {
  const error = document.getElementById("error");
  const telegram = document.getElementById("telegram").value.trim().replace(/^@/, "");
  const activity = document.getElementById("activity").value.trim();
  const date = document.getElementById("date").value;
  error.textContent = "";
  if (!telegram || !/^[A-Za-z0-9_]{5,32}$/.test(telegram)) {
    error.textContent = "Введи корректный Telegram username (5–32 символа)."; return;
  }
  const button = document.getElementById("submit");
  button.disabled = true;
  button.textContent = "Отправляем...";
  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted, date, activity, telegram: "@" + telegram })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Ошибка отправки.");
    show("done", 4);
  } catch (err) {
    error.textContent = err.message;
    button.disabled = false;
    button.textContent = "Отправить ответ 💗";
  }
});