import { facadeLoadTranscript, facadeExtract } from './facade.js';

const audioActionContainer = document.getElementById('audio-action-container')
const fileInput = document.getElementById('select-audio-file-btn')
const loadFileDialogBtn = document.getElementById('load-file-dialog-btn')
const chosenFileNameText = document.getElementById('chosen-file-name-text')
const chosenFileLengthText = document.getElementById('file-length-text')
const chatWindowText = document.getElementById('text-response')
const promptSubmission = document.getElementById('prompt-text-area')
const sendBtn = document.getElementById('send-btn')

let currentPickedAudio;
let fullTranscript;

audioActionContainer.addEventListener('click', function() {
    fileInput.click(); 
});

// Handle file change
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
    console.log('fileinput listener, a file was chosen');
    currentPickedAudio = this.files[0];
    reader.readAsArrayBuffer(selectedFile);
});

loadFileDialogBtn.addEventListener('click', async function() {
    fullTranscript = await facadeLoadTranscript(currentPickedAudio);
});

// Prompt SEND funktionalitet
promptSubmission.addEventListener('keypress', async function(event) {
    if (event.key === 'Enter') {
        handlePromptSubmission();
    }
});
// // //
sendBtn.addEventListener('click', function() {
    handlePromptSubmission();
})
// // // // // // // //

// Vad ska hända efter entertangent?
async function handlePromptSubmission(promptSubmission) {
    if(fullTranscript !== null) {
        console.log('handlePromptSubmission > fullTranscript exists')
        try {
            generateResponseVisual(
                facadeExtract(promptSubmission, fullTranscript)
                );
        } catch (error) {
            console.error('Error extracting specifics from transcript with ChatGPT: ' + error)
        }
    } else {
        console.log('Cannot transcribe with ChatGPT because no audio was loaded beforehand')
    }

}

// Sets chat window text on screen, text-roller loop, appends (hejdå   -> hej + 'd')
function generateResponseVisual(response) {
    console.log('generating visual response')
    let index = 0;
    const interval = setInterval(() => {
        chatWindowText.textContent.append(response.substring(index - 1, index).text);
        index++;
        if (index > transcription.length) clearInterval(interval);
    }, 9);

}