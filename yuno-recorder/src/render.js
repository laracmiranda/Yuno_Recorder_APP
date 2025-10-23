const videoSelectBtn = document.getElementById('videoSelectBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('videoElement');

let mediaRecorder;
const recordedChunks = [];

// Exibe as telas disponíveis
videoSelectBtn.onclick = async () => {
  const selectedSource = await window.electronAPI.selectSourceMenu();
  if (!selectedSource) return;
  await selectSource(selectedSource);
};

// Seleciona a tela para captura
async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  try {
    // Captura a tela e o áudio do sistema
    const screenSystemStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id
        }
      }
    });

    // Captura o áudio do microfone separadamente
    let micStream = null;
    micStream = await new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          resolve(mic);
        } catch (err) {
          console.warn('⚠️ Falha ao capturar microfone:', err);
          resolve(null);
        }
      }, 500); // pequena pausa antes de pedir o microfone pra evitar conflitos do chromium
    });

    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    const systemSource = audioContext.createMediaStreamSource(screenSystemStream);
    systemSource.connect(destination);

    if (micStream) {
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    }

    // Combina os treams 
    const combinedStream = new MediaStream([
      ...screenSystemStream.getVideoTracks(),
      ...destination.stream.getAudioTracks()
    ]);

    videoElement.srcObject = combinedStream;
    await videoElement.play();

    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(combinedStream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

  } catch (err) {
    console.error('Erro ao capturar a tela:', err);
  }
}


// Inicia a gravação
startBtn.onclick = () => {
  if (!mediaRecorder) {
    alert('Selecione uma tela antes de gravar!');
    return;
  }
  recordedChunks.length = 0; // Limpa a gravação
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording...';
};

// Para a gravação
stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
  }
};

// Captura dados do stream
function handleDataAvailable(e) {
  recordedChunks.push(e.data);
}

// Salva vídeo após gravação
async function handleStop() {
  const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp9' });
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const filePath = await window.electronAPI.showSaveDialog(`vid-${Date.now()}.webm`);
  if (!filePath) return;

  // Envia o conteúdo para o processo principal salvar
  window.electronAPI.saveFile(filePath, uint8Array);
}
