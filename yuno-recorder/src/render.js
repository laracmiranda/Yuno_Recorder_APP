const videoSelectBtn = document.getElementById('videoSelectBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('videoElement');
const micCheckbox = document.getElementById('micCheckbox');
const statusElement = document.getElementById('status'); // opcional, exibe mensagens de status

let currentSource = null;
let mediaRecorder;
const recordedChunks = [];

// Seleciona a tela
videoSelectBtn.onclick = async () => {
  const selectedSource = await window.electronAPI.selectSourceMenu();
  if (!selectedSource) return;

  currentSource = selectedSource; // salva a tela atual
  await selectSource(selectedSource);
};

// Função principal de captura
async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  const micEnabled = micCheckbox.checked;

  try {
    // Para o stream anterior, se existir
    if (videoElement.srcObject) {
      const tracks = videoElement.srcObject.getTracks();
      tracks.forEach(t => t.stop());
    }

    // Captura a tela + áudio do sistema
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

    let micStream = null;

    // Captura o microfone se marcado
    if (micEnabled) {
      micStream = await new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('🎤 Microfone capturado com sucesso!');
            resolve(mic);
          } catch (err) {
            console.warn('⚠️ Falha ao capturar microfone:', err);
            resolve(null);
          }
        }, 500); // pausa para evitar conflitos
      });
    } else {
      console.log('🎧 Microfone desativado pelo usuário.');
    }

    // Mixagem de áudio
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    const systemSource = audioContext.createMediaStreamSource(screenSystemStream);
    systemSource.connect(destination);

    if (micStream) {
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    }

    // Combina vídeo e áudio final
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

    if (statusElement) {
      statusElement.innerText = micEnabled
        ? '🎤 Microfone ativado.'
        : '🎧 Microfone desativado pelo usuário.';
    }

  } catch (err) {
    console.error('Erro ao capturar a tela:', err);
    if (statusElement) statusElement.innerText = '❌ Erro ao capturar tela.';
  }
}

// Atualiza stream ao marcar/desmarcar a checkbox
micCheckbox.addEventListener('change', async () => {
  if (!currentSource) return; // só atualiza se já houver uma tela selecionada
  await selectSource(currentSource);
});

// Botão de iniciar
startBtn.onclick = () => {
  if (!mediaRecorder) {
    alert('Selecione uma tela antes de gravar!');
    return;
  }
  recordedChunks.length = 0;
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Gravando...';
};

// Botão de parar
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

  window.electronAPI.saveFile(filePath, uint8Array);
}
