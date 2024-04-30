const express = require('express');
const cors = require('cors');
const app = express();
const { OpenAI } = require('openai')
const fs = require('fs');

require('dotenv').config();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    optionsSuccessStatus: 200
}));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use(express.json());

// OpenAI init
function initOpenAI() {
    try {
        const openai = new OpenAI({
            apiKey: process.env.API_KEY
        });
        console.log('initOpenAI success');
        return openai;

    } catch (error) {
        console.error('Error initializing OpenAI API with key', error);
        return null;
    }

}

// Define multer storage
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Set destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Keep original file name
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 // Set max file size to 1GB
    }
});

app.post('/api/transcribe', upload.single('audioFile'), async (req, res) => {
    try {
        const transcription = await transcribeAudio(req.body.audioFile);
        res.json({ transcription });
    } catch (error) {
        console.error('Error transcribing audio file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function transcribeAudio(audioFile) {
    try {
        const openai = initOpenAI();
        const whisperFullTranscript = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            response_format: 'text'
        });
        return whisperFullTranscript;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return null;
    }
}

// Function to delete audio file from multer storage
async function deleteAudioFileFromStorage(file) {
    try {
        fs.unlink(file.path); // Delete the file from multer storage
        console.log('Audio file deleted from multer storage:', file.path);
    } catch (error) {
        console.error('Error deleting audio file from multer storage:', error);
    }
}














//           ChatGPT-4
app.post('/api/submit-prompt', async (req, res) => {
    const { promptSubmission } = req.body;

    // Handle prompt submission
    try {
        const transcriptCompletion = await handlePromptSubmission(promptSubmission);
        res.json({ transcriptCompletion });
    } catch (error) {
        console.error('Error handling prompt submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

