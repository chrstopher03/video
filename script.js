const screens = [
  "img/pantalla1.svg",
  "img/pantalla2.svg",
  "img/pantalla3.svg",
  "img/pantalla4.svg"
];

const screenImage = document.getElementById("screenImage");
const thumbs = [...document.querySelectorAll(".screen-thumb")];
let current = 0;
let timer;

function showScreen(index, restart = true) {
  if (!screens[index]) return;
  current = index;
  if (screenImage) {
    screenImage.style.opacity = "0";
    setTimeout(() => {
      screenImage.src = screens[index];
      screenImage.style.opacity = "1";
    }, 140);
  }
  thumbs.forEach((b, i) => b.classList.toggle("active", i === index));
  const gp = document.getElementById("generatorPreview");
  if (gp) gp.src = screens[index];
  if (restart) {
    clearInterval(timer);
    timer = setInterval(() => showScreen((current + 1) % screens.length, false), 3000);
  }
}
thumbs.forEach(btn => btn.addEventListener("click", () => showScreen(Number(btn.dataset.index))));
if (screenImage) screenImage.style.transition = "opacity .28s ease";
timer = setInterval(() => showScreen((current + 1) % screens.length, false), 3000);

const uploader = document.getElementById("uploader");
document.getElementById("openUploader").onclick = () => uploader.classList.add("show");
document.getElementById("openUploader2").onclick = () => uploader.classList.add("show");
document.getElementById("closeUploader").onclick = () => uploader.classList.remove("show");
uploader.addEventListener("click", e => { if (e.target === uploader) uploader.classList.remove("show"); });

document.querySelectorAll('.upload-grid input').forEach(input => {
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const slot = Number(input.dataset.slot);
    const url = URL.createObjectURL(file);
    screens[slot] = url;
    const thumb = document.querySelector(`.screen-thumb[data-index="${slot}"] img`);
    if (thumb) thumb.src = url;
    if (slot === current && screenImage) screenImage.src = url;
    const gp = document.getElementById("generatorPreview");
    if (slot === current && gp) gp.src = url;
  });
});

// ---------------- VIDEO: ESCRITORIO = CAPTURA REAL / MÓVIL = CAPTURA REAL + GUARDADO COMPATIBLE ----------------
const recordButton = document.getElementById("recordVideo");
const recordStatus = document.getElementById("recordStatus");
const generatedVideo = document.getElementById("generatedVideo");
const downloadGenerated = document.getElementById("downloadGenerated");
const shareGenerated = document.getElementById("shareGenerated");
const captureHelp = document.getElementById("captureHelp");
let generatedUrl = null;
let generatedBlob = null;
let recording = false;

function getRecordingMime() {
  if (!window.MediaRecorder) return "";
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || "";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 700;
}

function showGenerated(blob) {
  generatedBlob = blob;
  if (generatedUrl) URL.revokeObjectURL(generatedUrl);
  generatedUrl = URL.createObjectURL(blob);
  generatedVideo.src = generatedUrl;
  generatedVideo.hidden = false;
  downloadGenerated.href = generatedUrl;
  downloadGenerated.download = "Mochis-Burgers-Anuncio-Animacion-Real.webm";
  downloadGenerated.hidden = false;
  if (shareGenerated) shareGenerated.hidden = !(navigator.share && navigator.canShare);
}

async function saveOrShareVideo() {
  if (!generatedBlob) return;
  const file = new File([generatedBlob], "Mochis-Burgers-Anuncio-Animacion-Real.webm", { type: generatedBlob.type || "video/webm" });
  try {
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Mochis Burgers",
        text: "Video publicitario de Mochis Burgers",
        files: [file]
      });
      recordStatus.textContent = "Video listo. Desde el menú de compartir puedes guardarlo en tu teléfono.";
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return;
  }
  // Fallback: abrir el video para que el navegador muestre sus controles de guardado.
  window.open(generatedUrl, "_blank");
  recordStatus.textContent = "Se abrió el video. Usa el menú del navegador para guardarlo en tu teléfono.";
}

async function captureRealTab() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new Error("NO_CAPTURE");
  }
  return navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: { ideal: 60, max: 60 },
      displaySurface: "browser",
      cursor: "never"
    },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
    surfaceSwitching: "exclude"
  });
}

async function createVideo() {
  if (recording) return;
  if (!window.MediaRecorder) {
    recordStatus.textContent = "Este navegador no permite crear videos. Prueba Chrome actualizado.";
    return;
  }

  const mime = getRecordingMime();
  if (!mime) {
    recordStatus.textContent = "Este navegador no tiene un formato de video compatible.";
    return;
  }

  recording = true;
  recordButton.disabled = true;
  recordButton.textContent = "● Preparando...";
  recordStatus.textContent = isMobile()
    ? "En el teléfono se grabará la animación real de esta página."
    : "Preparando la captura de la animación real...";

  clearInterval(timer);
  window.scrollTo({ top: 0, behavior: "instant" });
  await sleep(700);

  let stream = null;
  try {
    // La captura sigue siendo la página REAL. No se crea un video alternativo en Canvas.
    if (isMobile()) {
      recordStatus.textContent = "Si aparece una ventana de compartir pantalla, selecciona esta pestaña y pulsa Compartir.";
    } else {
      recordStatus.textContent = "Selecciona ESTA PESTAÑA y pulsa Compartir.";
    }

    stream = await captureRealTab();
    const track = stream.getVideoTracks()[0];
    if (!track) throw new Error("NO_TRACK");

    const chunks = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 20000000
    });

    recorder.ondataavailable = e => {
      if (e.data && e.data.size) chunks.push(e.data);
    };

    let stoppedByUser = false;
    track.addEventListener("ended", () => { stoppedByUser = true; });

    recordStatus.textContent = "🔴 Iniciando en 3...";
    await sleep(1000);
    recordStatus.textContent = "🔴 Iniciando en 2...";
    await sleep(1000);
    recordStatus.textContent = "🔴 Iniciando en 1...";
    await sleep(1000);

    recorder.start(250);
    recordStatus.textContent = "🔴 Grabando la animación REAL en alta calidad...";

    const duration = 12000;
    const start = performance.now();
    while (performance.now() - start < duration) {
      if (stoppedByUser || track.readyState === "ended") break;
      const pct = Math.round(Math.min((performance.now() - start) / duration, 1) * 100);
      recordStatus.textContent = `🔴 Grabando la página real... ${pct}%`;
      await sleep(150);
    }

    if (recorder.state !== "inactive") recorder.stop();
    await new Promise(resolve => recorder.addEventListener("stop", resolve, { once: true }));

    const blob = new Blob(chunks, { type: mime });
    if (!blob.size) throw new Error("EMPTY");
    showGenerated(blob);

    // En escritorio intenta descargar. En móvil prioriza compartir/guardar, porque muchos navegadores móviles bloquean <a download> para blobs grandes.
    if (!isMobile()) {
      const a = document.createElement("a");
      a.href = generatedUrl;
      a.download = "Mochis-Burgers-Anuncio-Animacion-Real.webm";
      document.body.appendChild(a);
      a.click();
      a.remove();
      recordStatus.textContent = "¡Listo! Se descargó la animación REAL en alta calidad.";
    } else {
      recordStatus.textContent = "¡Video listo! Pulsa GUARDAR / COMPARTIR VIDEO para guardarlo en tu teléfono.";
      setTimeout(() => saveOrShareVideo(), 250);
    }

    captureHelp.textContent = "El archivo conserva la animación real: teléfono 3D, flotación, inclinación, luces, tarjetas y las pantallas cargadas. Se graba hasta 60 fps y con bitrate alto cuando el dispositivo lo permite.";
  } catch (err) {
    console.error(err);
    if (err && err.name === "NotAllowedError") {
      recordStatus.textContent = "No se inició la grabación. Permite la captura de pantalla/pestaña y vuelve a intentarlo.";
    } else if (err && err.message === "NO_CAPTURE") {
      recordStatus.textContent = "Este navegador del teléfono no permite capturar la pestaña. Abre el sitio en Chrome actualizado o usa el botón de compartir del video.";
    } else {
      recordStatus.textContent = "No se pudo grabar la pestaña. Prueba de nuevo en Chrome actualizado.";
    }
  } finally {
    if (stream) stream.getTracks().forEach(track => track.stop());
    recording = false;
    recordButton.disabled = false;
    recordButton.textContent = "● Crear video";
    timer = setInterval(() => showScreen((current + 1) % screens.length, false), 3000);
  }
}

recordButton.addEventListener("click", createVideo);
if (shareGenerated) shareGenerated.addEventListener("click", saveOrShareVideo);
