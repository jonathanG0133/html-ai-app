const express = require('express');
const cors = require('cors');
const app = express();
const { OpenAI } = require('openai')
const fs = require('node:fs');
const fsPromise = require('node:fs/promises');
require('dotenv').config();

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('\db.db')


app.use(cors({
    origin: 'http://127.0.0.1:3000',
    optionsSuccessStatus: 200
}));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use(express.json());
app.use(express.text());
app.use(express.static('public'));


async function initializeOpenAI() {
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



let conversationId = null;

//          Whisper transcribe
app.post('/api/transcribe', upload.single('audioFile'), async (req, res) => {
     try {
        const openai = await initializeOpenAI();

        const filePath = req.file.path;
        console.log('transcription pending ...')

        transcript = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
            response_format: "text"
        });

        db.run('INSERT INTO conversations (transcript) VALUES (?)', [transcript], function(error) { 
          if (error) {
              console.error('Error inserting conversation record:', error);
              res.status(500).send(false);
          } else {
              deleteAudioFile(filePath);
              conversationId = this.lastID
              console.log(transcript);
              console.log('New conversation created with ID:', conversationId);
              console.log(filePath, conversationId)
              res.json({ filePath, conversationId }); // ???
          }
        });

    } catch (error) {
        console.error('transcribeAudio catch : Error transcribing audio:', error);
        res.send(error);
    }
});

//          ChatGPT-4
app.post('/api/completion', async (req, res) => {
    try {
        const prompt = req.body;
        const openai = await initializeOpenAI();

        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM messages WHERE conversation_id = ?', [conversationId], (err, rows) => {
                if (err) {
                    console.error('Error fetching previous messages:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        const conversationHistory = rows.map(row => `${row.body}`).join('\n');

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: `Jag är din hjälpsamma assistent som är designad för att hjälpa till med att diskutera och extrahera information från följande transkript: ${transcript}. Slut på transkript. Mitt mål är att ge insikter och stöd baserat på innehållet vi analyserar. Även om frågan går bortom transkriptet, är jag här för att hjälpa till med alla relevanta frågor eller ämnen.` },
                { role: "user", content: `Här kommer en fråga: ${prompt}. Använd denna fråga för att extrahera specifika detaljer från transkriptet. Här är vår tidigare konversationhistorik :${conversationHistory}. Du måste svara på engelska om frågan är på engelska` }
            ],
            stream: false
        });

        const extractionText = completion.choices[0].message.content;

// push user message to db
        db.run('INSERT INTO messages (role, body, conversation_id, timestamp) VALUES (?, ?, ?, ?)',
            ['user', 'user asked: ' + prompt, conversationId, currentDateAndTime], function (error) {
                if (error) {
                    console.error('Error inserting user message: ', error);
                    res.status(500).send(false);
                } else {
                    console.log('Prompt was: ', prompt);
                    console.log('New user message created with message_id: ', this.lastID, '~ Conversation ID: ', conversationId);
                }
            });
// push chatgpt message to db
        db.run('INSERT INTO messages (role, body, conversation_id) VALUES (?, ?, ?)',
            ['chatgpt', 'chatgpt responded: ' + extractionText, conversationId], function (error) {
                if (error) {
                    console.error('Error inserting chatgpt message: ', error);
                    res.status(500).send(false);
                } else {
                    console.log('The following was extracted: ', extractionText);
                    console.log('New ChatGPT message created with message_id: ', this.lastID, '~ Conversation ID: ', conversationId);
                    console.log('HISTORY for Conversation ID: ' + conversationId + '\n['  + conversationHistory + '\n]');
                    res.json(completion);
                }
            });

    } catch (error) {
        console.error('Error handling prompt submission: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





const deleteAudioFile = async (filePath) => {
    try {
        await fsPromise.unlink(filePath);
        console.log('Audio file deleted successfully:', filePath);
    } catch (error) {
        console.error('Error deleting audio file:', error);
    }
};

const currentDateAndTime = new Date().toLocaleString('sv-SE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});


