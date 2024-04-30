
export async function facadeLoadTranscript(audioFile) {
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('audioFile', audioFile);

    // Send audio file to backend for transcription
    const response = await fetch('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Transcription received from backend:', data);
      return data; 
    } else {
      console.error('Error transcribing audio file, catch 1:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error transcribing audio file, catch 2:', error);
    return null;
  }

}












export async function facadeExtract(promptSubmission) {
  try {
    const response = await fetch('/api/completion');
    const data = await response.json();
    console.log('facade.js fetchApiKey function received the key:' + data);
    return data; 

  } catch (error) {
      console.error('Error fetching /api/completion through facade:', error);
    return null;
  }

}