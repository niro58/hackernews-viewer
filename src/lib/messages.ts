export function addMessage(type: "warning" | "success", ...log: any[]) {
  const messages = document.getElementById("messages");
  if (!messages) return;

  // If there are already 3 messages, remove the oldest one immediately
  if (messages.children.length >= 3) {
    const oldestMessage = messages.firstElementChild;
    if (oldestMessage) {
      oldestMessage.remove(); // Remove the oldest message without waiting for animation
    }
  }

  const randId = Math.random().toString(36).slice(-8);

  const divEl = document.createElement("div");
  divEl.id = randId;
  divEl.innerHTML = log.join(" ");
  divEl.className = `py-2 px-4 rounded mb-2 w-full ${
    type === "success"
      ? "bg-green-500/50 text-green-100 border border-green-500"
      : "bg-red-500/50 text-red-100 border border-red-500"
  } animate-fade-in`;

  messages.appendChild(divEl);

  setTimeout(() => {
    divEl.classList.add("animate-fade-out");
    divEl.addEventListener(
      "animationend",
      () => {
        divEl.remove();
      },
      { once: true }
    ); // Ensure the event listener is only called once
  }, 2000);
}
