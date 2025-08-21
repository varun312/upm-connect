// Client-side Socket.IO for townhall chat
// Place this in public/js/townhall.js

document.addEventListener("DOMContentLoaded", function () {
  const socket = io();
  const form = document.querySelector(".chat-form");
  const input = form.querySelector('input[name="text"]');
  const messagesContainer = document.querySelector(".message-container");

  socket.on("chat message", function (msg) {
    // Create new message with proper government form styling
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message new";

    messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-user">${msg.username}</span>
                <span class="message-time">${msg.time}</span>
            </div>
            <div class="message-text">${msg.text}</div>
        `;

    messagesContainer.appendChild(messageDiv);

    // Auto-scroll to bottom
    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      fetch("/townhall/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "text=" + encodeURIComponent(text),
      }).then((res) => {
        if (res.ok) {
          input.value = "";
        }
      });
    }
  });
});
