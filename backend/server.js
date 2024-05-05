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


function initializeOpenAI() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.API_KEY
    });
    return openai;
  } catch (error) {
    console.error("Error initializing OpenAI API with key", error);
    return null;
  }

}

const multer = require('multer');
const { multipartFormRequestOptions } = require('openai/uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) 
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 
    }
});



let whisperFullTranscript;

//            Whisper 
app.post('/api/transcribe', upload.single('audioFile'), async (req) => {
     try {
        const openai = initializeOpenAI();
        whisperFullTranscript = await openai.audio.transcriptions.create({
        file: req.file,
        model: "whisper-1"
        });
    } catch (error) {
        console.error('-----------------transcribeAudio catch : Error transcribing audio:', error);
        return null;
    }
});







//           ChatGPT-4
app.post('/api/completion', async (req, res) => {
    const prompt  = req.body;
    console.log("Your prompt: " + req.body)

    try {
        const transcriptCompletion = await handlePromptSubmission(prompt);
        res.json({ transcriptCompletion });
    } catch (error) {
        console.error('Error handling prompt submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

//           Prompt / extraction
async function handlePromptSubmission(prompt) {
    if (prompt !== null) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "assistant", content: `${prompt} ${whisperFullTranscript}`}],
        stream: true
      });

      transcription = completion.text;
    }

}

/* Funktion som ska bort fil från "uploads" efter att råtexten från filen hämtats in
async function deleteAudioFileFromStorage(file) {
    try {
        fs.unlink(file.path); // Delete the file from multer storage
        console.log('Audio file deleted from multer storage:', file.path);
    } catch (error) {
        console.error('Error deleting audio file from multer storage:', error);
    }
}*/