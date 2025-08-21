// Client-side Socket.IO for townhall chat
// Place this in public/js/townhall.js

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const form = document.querySelector('.chat-form');
    const input = form.querySelector('input[name="text"]');
    const messagesDiv = document.getElementById('chat-messages');

    socket.on('chat message', function(msg) {
        const div = document.createElement('div');
        div.className = 'chat-message';
        div.innerHTML = `<span class="user">${msg.username}</span> <span class="time">${msg.time}</span>: <span class="text">${msg.text}</span>`;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            fetch('/townhall/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'text=' + encodeURIComponent(text)
            }).then(res => {
                if (res.ok) {
                    input.value = '';
                }
            });
        }
    });
});
