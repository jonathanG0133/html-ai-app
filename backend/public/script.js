import { facadeLoadTranscriptInBackend, facadeExtract } from './facade.js';

const audioActionContainer = document.getElementById('audio-action-container')
const form = document.getElementById('audio-upload-form');
const fileInput = document.getElementById('select-audio-file-btn')
const loadFileDialogBtn = document.getElementById('load-file-dialog-btn')
const chosenFileNameText = document.getElementById('chosen-file-name-text')
const chosenFileLengthText = document.getElementById('file-length-text')
const chatWindowText = document.getElementById('text-response')
const promptSubmission = document.getElementById('prompt-text-area')
const sendBtn = document.getElementById('send-btn')

let selectedAudioFile;

fileInput.addEventListener('change', function(event) {
    selectedAudioFile = event.target.files[0];
});

// Load file-knapp laddar upp råtext till backend
loadFileDialogBtn.addEventListener('click', async function() {
    await facadeLoadTranscriptInBackend(selectedAudioFile);   // -----
});

// Prompt SEND funktionalitet
promptSubmission.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handlePromptSubmission();
    }
});
// 
sendBtn.addEventListener('click', function() {
    
    handlePromptSubmission();
})
// // // // // 

// Vad ska hända efter SEND?
function handlePromptSubmission(promptSubmission) {
    const extraction = facadeExtract(promptSubmission);
    generateResponseVisual(extraction);
} 

// Visuell text-roller loop för ChatGPT responser
function generateResponseVisual(response) {
    console.log('generating visual response')
    let index = 0;
    const interval = setInterval(() => {
        chatWindowText.textContent.append(response.substring(index - 1, index).text);
        index++;
        if (index > transcription.length) clearInterval(interval);
    }, 9);

}