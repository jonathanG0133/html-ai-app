import './App.css';
import React, { useState } from 'react';
import OpenAI from 'openai';
import 'bootstrap/dist/css/bootstrap.min.css';

// Main app
export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcribedText, setTranscribedText] = useState('')
  const [fullText, setFullText] = useState('');
  const [completion, setCompletion] = useState('');
  const [chatState, setChatState] = useState('No current ChatState');

  let summarizeString = "Please summarize this text: "
  let extractTopicsString = "Please list the main topics within the following text: "

function initializeOpenAI() {
  try {
    const openai = new OpenAI({
      apiKey
    });
    return openai;
  } catch (error) {
    console.error("Error initializing OpenAI API with key", error);
    return null;
  }

}


 /// --- /// --- /// --- /// --- /// --- /// --- /// --- /// --- /// --- /// --- /// --- /// --- /// --- 

 // Whisper Full-Text transcribe | -> ChatGPT-4 if prompt
 async function transcribeAudio(selectedFile, prompt = null) {
  try {
    const openai = initializeOpenAI();
    const fullText = await openai.audio.transcriptions.create({
      file: selectedFile,
      model: "whisper-1"
    });

    let transcription = fullText.text;

    if (prompt !== null) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "assistant", content: `${prompt} ${fullText}`}],
        stream: true
      });

      transcription = completion.text;
    }

    // Simulate typing effect
    let index = 0;
    const interval = setInterval(() => {
      setTranscribedText(transcription.substring(0, index));
      index++;
      if (index > transcription.length) clearInterval(interval);
    }, 35);
  } catch (error) {
    console.error("Error transcribing audio: ", error);
  }
}

  // Summarize, Topics, Full-Text prompt buttons
  const renderPromptButtons = () => {
    return (
      <div className="prompt-button col"> 
        <button className="prompt-button" 
                onClick={() => {
                  transcribeAudio(selectedFile, summarizeString);
                  setChatState("Summary");
                }}>Summarize Text</button>
        <button className="prompt-button" 
                onClick={() => {
                  transcribeAudio(selectedFile, extractTopicsString);
                  setChatState("Topics");
                }}>Extract Main Topics</button>
        <button className="prompt-button" 
                onClick={() => {
                  transcribeAudio(selectedFile);
                  setChatState("Full-text");
                }}>Retrieve Full-Text</button>
      </div>
    );
  };

  // Render load file button
  const renderLoadFileButton = () => {

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      setSelectedFile(file);
  };
    return (
      <div className="load-file-div">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
        />
      </div>
    );
  };

  // ChatGPT-4 response window
  const renderChatResponseContainer = () => {
    return (
      <div className="chat-response-container">
        <p>{transcribedText}</p>
      </div>
    );
  };

  return (
  <div className="App-div">
    <header className="App-header">
      <p>This is a transcription application.</p>
      <p>Whisper   |   ChatGPT-4</p>
    </header>
    <div>{chatState}</div>
    <div className="content-container">
      <div className="chat-response-container">{renderChatResponseContainer()}</div>
      <div className="actions-div row">
        <div className="file-input">{renderLoadFileButton()}</div>
        <div className="buttons-and-input">{renderPromptButtons()}</div>
      </div>
    </div>
  </div>
  );
  
}