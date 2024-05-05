import { facadeLoadTranscriptInBackend, facadeExtract } from './facade.js';

const audioActionContainer = document.getElementById('audio-action-container')
const fileInput = document.getElementById('select-audio-file-btn')
const loadFileDialogBtn = document.getElementById('load-file-dialog-btn')
const chosenFileNameText = document.getElementById('chosen-file-name-text')
const chosenFileLengthText = document.getElementById('file-length-text')
const chatWindowText = document.getElementById('text-response')
const promptSubmission = document.getElementById('prompt-text-area')
const sendBtn = document.getElementById('send-btn')

let currentLoadedAudio;

audioActionContainer.addEventListener('click', function() {
    fileInput.click(); 
});

// File change
fileInput.addEventListener('change', function() {
    const selectedFile = this.files[0];
    chosenFileNameText.textContent = selectedFile.name;
    
    const reader = new FileReader();
    
    reader.onload = function(chosenFile) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        audioContext.decodeAudioData(chosenFile.target.result, function(decodedData) {
            const duration = decodedData.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            chosenFileLengthText.textContent = `File length: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        });
    };
    loadFileDialogBtn.style.display = "block";
    console.log('fileinput listener, a file was chosen');
    currentLoadedAudio = this.files[0];
    reader.readAsArrayBuffer(selectedFile);
});

// Load file-knapp laddar upp råtext till backend
loadFileDialogBtn.addEventListener('click', async function() {
    await facadeLoadTranscriptInBackend(currentLoadedAudio);   // -----
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
    generateResponseVisual(
        facadeExtract(promptSubmission)
    );
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