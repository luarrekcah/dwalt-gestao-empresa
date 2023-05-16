const scrollDiv = document.getElementById("scroll");
scrollDiv.scrollTop = scrollDiv.scrollHeight;

function scrollToBottom() {
  scrollDiv.scrollTop = scrollDiv.scrollHeight;
}

scrollToBottom();

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    document.getElementById("sendMessage").click();
  }
});

function updateChat(msg) {
  const container = document.createElement("div");
  container.classList.add(
    "d-flex",
    "align-items-end",
    "justify-content-end",
    "mb-4"
  );

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("flex-grow-1", "me-3");

  const messageContent = document.createElement("div");
  messageContent.classList.add("bg-primary", "rounded", "py-2", "px-3", "mb-2");

  const messageText = document.createElement("p");
  messageText.classList.add("text-small", "mb-0", "text-white");
  messageText.textContent = msg.content;

  const messageTime = document.createElement("p");
  messageTime.classList.add("small", "text-muted", "text-end");
  messageTime.textContent = moment(msg.atTime).format("L LT");

  const avatarContainer = document.createElement("div");
  avatarContainer.classList.add("flex-shrink-0");

  const avatarImage = document.createElement("img");
  avatarImage.src = msg.icon;
  avatarImage.alt = "user avatar";
  avatarImage.width = "50";
  avatarImage.classList.add("rounded-circle");

  // Adicionar os elementos aos seus respectivos containers
  messageContent.appendChild(messageText);
  messageContainer.appendChild(messageContent);
  messageContainer.appendChild(messageTime);
  avatarContainer.appendChild(avatarImage);
  container.appendChild(messageContainer);
  container.appendChild(avatarContainer);

  // Adicionar o container ao messagesDiv
  const messagesDiv = document.getElementById("messagesDiv");
  messagesDiv.appendChild(container);

  scrollToBottom();
}

function sendMessage(from, icon, projoutKey) {
  if (document.getElementById("messageContent").value === "") {
    alert("Sua mensagem não possui conteúdo para enviar.");
  }
  console.log("send message");
  const msg = {
    from,
    atTime: moment().format(),
    content: document.getElementById("messageContent").value,
    type: "text",
    icon,
  };
  axios.post("/api/v1/updateProjout/newMessage", {
    message: msg,
    key: projoutKey,
  });
  document.getElementById("messageContent").value = "";

  updateChat(msg);
}

function updateAllChat(pjid, key) {
  const messagesDiv = document.getElementById("messagesDiv");

  axios.post("/api/v1/getProjout/messages", {key: pjid}).then((r) => {
    const messages = r.data;

    messagesDiv.innerHTML = "";

    messages.forEach((msg) => {
      if (msg.data.message.from !== key) {
        const div1 = document.createElement("div");
        div1.classList.add("d-flex", "align-items-start", "mb-4");

        const div2 = document.createElement("div");
        div2.classList.add("flex-shrink-0");

        const img = document.createElement("img");
        img.src = msg.data.message.icon;
        img.width = "50";
        img.alt = "user avatar";
        img.classList.add("rounded-circle");

        div2.appendChild(img);

        const div3 = document.createElement("div");
        div3.classList.add("flex-grow-1", "ms-3");

        const div4 = document.createElement("div");
        div4.classList.add("bg-light", "rounded", "py-2", "px-3", "mb-2");

        const p1 = document.createElement("p");
        p1.classList.add("text-small", "mb-0", "text-muted");
        p1.textContent = msg.data.message.content;

        div4.appendChild(p1);
        div3.appendChild(div4);

        const p2 = document.createElement("p");
        p2.classList.add("small", "text-muted");
        p2.textContent = moment(msg.data.message.atTime).format("L LT")

        div3.appendChild(p2);

        div1.appendChild(div2);
        div1.appendChild(div3);

        // Adicione div1 ao local desejado na página HTML
        messagesDiv.appendChild(div1);
      } else {
        const div1 = document.createElement("div");
        div1.classList.add(
          "d-flex",
          "align-items-end",
          "justify-content-end",
          "mb-4"
        );

        const div2 = document.createElement("div");
        div2.classList.add("flex-grow-1", "me-3");

        const div3 = document.createElement("div");
        div3.classList.add("bg-primary", "rounded", "py-2", "px-3", "mb-2");

        const p1 = document.createElement("p");
        p1.classList.add("text-small", "mb-0", "text-white");
        p1.textContent = msg.data.message.content;

        div3.appendChild(p1);
        div2.appendChild(div3);

        const p2 = document.createElement("p");
        p2.classList.add("small", "text-muted", "text-end");
        p2.textContent = moment(msg.data.message.atTime).format("L LT")

        div2.appendChild(p2);

        const div4 = document.createElement("div");
        div4.classList.add("flex-shrink-0");

        const img = document.createElement("img");
        img.src = msg.data.message.icon;
        img.alt = "user avatar";
        img.width = "50";
        img.classList.add("rounded-circle");

        div4.appendChild(img);

        div1.appendChild(div2);
        div1.appendChild(div4);

        messagesDiv.appendChild(div1); // Adicione div1 ao local desejado na página HTML
      }
    });
  });
}
