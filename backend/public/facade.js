
export async function facadeLoadTranscript(audioFile) {
    const formData = new FormData();
    formData.append('audioFile', audioFile);

    try {
        const response = await fetch('http://localhost:3000/api/transcribe', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log('filename and conv id: ', data); // ???? loggas aldrig
        return data;
        
    } catch (error) {
        console.error('Error fetching transcription:', error);
        return false;
    }
}


export async function facadeExtract(promptSubmission) {
  console.log("trying facadeExtract")
  try {
    const response = await fetch('http://localhost:3000/api/completion', {
      method: 'POST',
      body: promptSubmission
    });
    console.log("ok return or catch? lets see ...")

    if (response.ok) {
      const completion = await response.json(); // Parse the JSON response
      const extraction = completion.choices[0].message.content; // Access the text content
      console.log(extraction);
      return extraction;
    }

  } catch (error) {
      console.error('Error fetching /api/completion from back-end through facade:', error);
      return null;
  }
}
