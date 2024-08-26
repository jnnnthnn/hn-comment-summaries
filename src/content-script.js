const verbose = false;
const chromeStorageKey = "openAiSecret";

function log(...message) {
  if (!verbose) {
    return;
  }
  console.log(...message);
}

function getCommentNodeIndentation(node) {
  const [indentationNode] = node.querySelectorAll(".ind");
  const indentation = parseInt(indentationNode.getAttribute("indent"), 10);
  return indentation;
}

async function processComments() {
  const { openAiSecret } = await chrome.storage.local.get(chromeStorageKey);

  const comments = Array.from(document.querySelectorAll(".athing.comtr"));
  const title = document.querySelector(".titleline").innerText;
  const toptext = document.querySelector(".toptext")?.textContent;

  let parentChain = [];
  for (let i = 0; i < comments.length; i++) {
    log("-------");
    log("IDX:", i);
    const current = comments[i];
    const currentText = current.querySelector(".commtext")?.innerText;
    if (!currentText) {
      log("no current text, skipping");
      continue;
    }
    // 0-indexed
    const indentation = getCommentNodeIndentation(current);
    if (indentation + 1 > parentChain.length) {
      parentChain.push(current);
    } else if (indentation + 1 < parentChain.length) {
      parentChain = parentChain.slice(0, indentation);
      parentChain.push(current);
    } else {
      // we're at a sibling of the previous post
      // combine the two above
      parentChain = parentChain.slice(0, indentation);
      parentChain.push(current);
    }
    const parentText =
      parentChain[parentChain.length - 2]?.querySelector(".commtext").innerText;
    log("CURRENT:", currentText);
    log("PARENT:", parentText);
    const summary = await getOpenAiSummary({
      openAiSecret,
      current: currentText,
      parent: parentText ?? toptext,
      title,
    });
    log("SUMMARY:", summary);
    const insertTarget =
      parentChain[parentChain.length - 1].querySelector(".default");
    // Assume you have the parent element and the new node
    const newNode = document.createElement("div"); // Replace with the node you want to add
    newNode.innerText = summary;
    newNode.style = `margin-top: 16px;margin-bottom: -10px;color: rgb(39, 161, 71);font-weight: bold`;

    // Add the new node as the second child
    if (insertTarget.children.length >= 1) {
      insertTarget.insertBefore(newNode, insertTarget.children[1]);
    } else {
      insertTarget.appendChild(newNode); // If there's no first child, just append
    }
  }
}

async function getOpenAiSummary({ openAiSecret, current, parent, title }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiSecret}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize the CURRENT forum comment given the context of the PREVIOUS one (if present) and the TITLE of the thread. Use no more than 3 words.",
        },
        {
          role: "user",
          content: `TITLE: ${title}${
            parent != null ? `\n\nPREVIOUS: ${parent}` : ""
          }\n\nCURRENT: ${current}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });
  return (await res.json()).choices[0].message.content;
}

processComments();
