
export function facadeLoadTranscriptInBackend(audioFile) {
    const formData = new FormData();
    formData.append('audioFile', audioFile);

    fetch('http://localhost:3000/api/transcribe', {
        method: 'POST',
        body: formData,
    });
}
export async function facadeExtract(promptSubmission) {
  try {
    const response = await fetch('/api/completion', {
      method: 'POST',
      body: promptSubmission
    });
    const extractionByPrompt = await response.json();
    return extractionByPrompt; 

  } catch (error) {
      console.error('Error fetching /api/completion through facade:', error);
    return null;
  }
}