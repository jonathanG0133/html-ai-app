const express = require('express');
const cors = require('cors');
const app = express();
const { OpenAI } = require('openai')

require('dotenv').config();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    optionsSuccessStatus: 200
}));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use(express.json());

app.use(express.static('public'));


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
const fs = require('node:fs')
const multer = require('multer');
const upload = multer({ dest: 'uploads/ '})




let whisperFullTranscript = "The introduction of your book can make or break a readers decision to buy it.That might sound like a lot of pressure, but thats because it kind of is—your books introduction is your books first impression (aside from the cover), and it’s important to make a good one. Regardless of what you write, whether it’s a fiction novel or a nonfiction book, you want to put your best foot forward. Thankfully, there are plenty of great book introductions out there for us to learn from. In this article, well cover a list of book introduction examples across five genres to give you a sense of what a good book introduction looks like. Then, we’ll talk about what these introductions have in common and what makes a good book introduction for fiction and nonfiction books. By the end, youll be able to apply these lessons to your own work, and youll be able to spot both weak and strong introductions from a mile away.";


//            Whisper,     req måste pre-processas på något sätt
app.post('/api/transcribe', upload.single('audioFile'), async (req) => {
     try {
        const openai = initializeOpenAI();
        whisperFullTranscript = await openai.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-1"
        });
    } catch (error) {
        console.error('-----------------transcribeAudio catch : Error transcribing audio:', error); // Blir fångad när man trycker "Click to prepare AI with your file"
        return null;
    }
});







//           ChatGPT-4
app.post('/api/completion', async (req, res) => {
    const prompt  = req.body;
    console.log("Your prompt: " + prompt)

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

      return completion;
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