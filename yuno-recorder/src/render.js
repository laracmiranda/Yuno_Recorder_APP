const videoSelectBtn = document.getElementById('videoSelectBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('videoElement');
const includeSystemAudio = document.getElementById('includeSystemAudio');
const includeMicAudio = document.getElementById('includeMicAudio');

let mediaRecorder; 
const recordedChunks = [];
let selectedSource = null;

// Escolher a tela
videoSelectBtn.onclick = async() => {
    const selectedSource = await window.electronAPI.selectSourceMenu();
    if(!selectedSource) return;
    await selectSource(selectedSource);
};

// Recria o stream quando os checkboxes mudarem
includeSystemAudio.onchange = () => { if (selectedSource) selectSource(selectedSource); };
includeMicAudio.onchange = () => { if (selectedSource) selectSource(selectedSource); };

// Seleciona a fonte e configura o MediaRecorder para gravação
async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  // Define se deve capturar áudio do microfone e do sistema
  const captureSystemAudio = includeSystemAudio?.checked || false;
  const captureMicAudio = includeMicAudio?.checked || false;

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: captureSystemAudio
        ? {
            mandatory: {
              chromeMediaSource: 'system',
              chromeMediaSourceId: source.id,
            },
          }
        : false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
        },
      },
    });
  } catch (err) {
    console.error('Erro ao capturar tela:', err);
    alert('Erro ao capturar a tela. Verifique as permissões.');
    return;
  }

  console.log(stream.getAudioTracks())
  
  // Captura do microfone
  let micStream;
  if (captureMicAudio){
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch(err){
        console.warn('Erro ao capturar microfone:', err);
    }
  }

  // Combina ambos os áudios (sistema + microfone)
  const tracks = [
      ...stream.getVideoTracks(),
      ...(stream.getAudioTracks() || []),
      ...(micStream?.getAudioTracks() || [])
  ]
  
  const finalStream = new MediaStream(tracks);

  // Mostra no preview
  videoElement.srcObject = finalStream;
  await videoElement.play();

  // Configura o gravador
  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(finalStream, options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

// Botão start
startBtn.onclick = () => {
  if (!mediaRecorder) {
    alert('Selecione uma tela antes de gravar!');
    return;
  }

  recordedChunks.length = 0; // Limpa antes da nova gravação
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
