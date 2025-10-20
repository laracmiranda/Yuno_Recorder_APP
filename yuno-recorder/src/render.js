const videoSelectBtn = document.getElementById('videoSelectBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('videoElement');

let mediaRecorder; 
const recordedChunks = [];

// Obtém as fontes de vídeo disponíveis
videoSelectBtn.onclick = async() => {
    const selectedSource = await window.electronAPI.selectSourceMenu();
    if(!selectedSource) return;
    await selectSource(selectedSource);
};

// Seleciona a fonte e configura o MediaRecorder
async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  videoElement.srcObject = stream;
  await videoElement.play();

  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

// Botão start
startBtn.onclick = () => {
  if (!mediaRecorder) {
    alert('Selecione uma tela antes de gravar!');
    return;
  }
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording...';
};

// Botão stop
stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
  }
};

// Captura os pedaços de vídeo
function handleDataAvailable(e) {
  recordedChunks.push(e.data);
}

// Salva o arquivo
async function handleStop() {
  const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp9' });
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const filePath = await window.electronAPI.showSaveDialog(`vid-${Date.now()}.webm`);
  if (!filePath) return;

  // Envia o conteúdo para o processo principal salvar
  window.electronAPI.saveFile(filePath, uint8Array);
}
