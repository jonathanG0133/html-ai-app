import { facadeLoadTranscript, facadeExtract } from './facade.js';

const selectingNewAudioFile = document.getElementById('select-audio-file-btn')
const submitFileBtn = document.getElementById('submit-audio-file-btn')
const submitPendingText = document.getElementById('submit-pending-text')
const audioUploadForm = document.getElementById('audio-upload-form')

const currentFileNameText = document.getElementById('chosen-file-name-text')

const chatContainer = document.querySelector('.chat-container')
const promptTextArea = document.querySelector('#chat-input')
const sendBtn = document.getElementById('send-btn')

const historyContainer = document.querySelector('#history-container')

let selectedAudioFile;
let loadedFileName;
let conversationId;

let userText = null;
let chatResponse;

selectingNewAudioFile.addEventListener('change', function(event) {
    const selectedFile = event.target.files[0];
    submitFileBtn.style.display = 'block';
    submitPendingText.style.display = 'none';
    selectedAudioFile = selectedFile;
    console.log('Selected file:', selectedFile);
});


// "Load file to AI" - laddar transcript till backend
audioUploadForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    submitFileBtn.style.display = 'none';
    submitPendingText.textContent = 'Pending...';
    submitPendingText.style.display = 'block';

    try {
        const data = await facadeLoadTranscript(selectedAudioFile);
        console.log('facadeLoad data return in script.js: ', data)
        if (data) {
            const { filePath, conversationId } = data; // loggas som undefined, undefined, men inte i server
            currentFileNameText.textContent = filePath;
            submitPendingText.textContent = 'Audio loaded';
            console.log('File loaded:', filePath, 'Conversation ID:', conversationId);
            //handleNewConversationHistory();
        } else {
            submitPendingText.textContent = 'Error loading file';
            submitFileBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        submitPendingText.textContent = 'Error loading file';
        submitFileBtn.style.display = 'block';
    }
});

sendBtn.addEventListener('click', async function() {
    userText = promptTextArea.value.trim();
    promptTextArea.value = '';
    console.log(userText);
    console.log(chatContainer)
    await handlePromptSubmission();
});

promptTextArea.addEventListener('keypress', async function(event) {
    if (event.key === 'Enter') {
        userText = promptTextArea.value.trim();
        promptTextArea.value = '';
        console.log(userText);
        await handlePromptSubmission();
    }
});



async function handlePromptSubmission() {
    handleOutgoingChat();
    showTypingAnimation();
    chatResponse = await facadeExtract(userText);
    handleIncomingChat();
} 

// User prompt html
const handleOutgoingChat = () => {
    console.log("handling outgoing chat")
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.png" width="22px">
                        <div class="message-container">
                            <p id="user-text">${userText}</p> 
                            <p id="chat-timestamp">${timestamp}</p>
                        </div>
                    </div>
                </div>`;
    const outgoingChatDiv = createChatDiv(html, "outgoing");
    chatContainer.appendChild(outgoingChatDiv);
}

// Chatgpt response html
const handleIncomingChat = () => {
    console.log("handling outgoing chat")
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/openai-logo.png" width="25px">
                        <p>${chatResponse}</p>
                    </div>
                </div>`;
    const outgoingChatDiv = createChatDiv(html, "incoming");
    chatContainer.removeChild(chatContainer.lastChild);
    chatContainer.appendChild(outgoingChatDiv);
}

const createChatDiv = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
}

// History item
const handleNewConversationHistory = (conversationId, loadedFileName) => {
    const html = `
        <div class="sidebar-item">
            <div class="item-content">
                <p class="history-conversationid">${conversationId}</p>
                <p class="history-filename" style="margin-top: -12px;">${loadedFileName}</p>
            </div>
        </div>`;
    const historyItem = createConversationHistoryDiv(html, "sidebar-item");
    historyContainer.appendChild(historyItem);
}

const createConversationHistoryDiv = (html, className) => {
    const element = document.createElement("div");
    element.classList.add(className);
    element.innerHTML = html;
    return element;
}

// . . . animation
const showTypingAnimation = () => {
    const html = `<div class="chat-content" style="padding-top: 24px">
                        <div class="chat-details">
                            <img src="images/openai-logo.png" width="25px">
                            <div class="typing-animation">
                                <div class="typing-dot" style="--delay: 0.2s"></div>
                                <div class="typing-dot" style="--delay: 0.3s"></div>
                                <div class="typing-dot" style="--delay: 0.4s"></div>
                            </div>
                        </div>
                        <span class="material-symbols-outlined">content_copy</span>
                    </div>`
    const outgoingChatDiv = createChatDiv(html, "incoming");
    chatContainer.appendChild(outgoingChatDiv);
}

const timestamp = new Date().toLocaleString('sv-SE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});