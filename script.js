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
    // If slots 5/6 were added, no thumbnail is required; they still participate in the video.
  });
});

// ---------------- VIDEO GENERATOR: GRABAR LA ANIMACIÓN REAL ----------------
const recordButton = document.getElementById("recordVideo");
const recordStatus = document.getElementById("recordStatus");
const generatedVideo = document.getElementById("generatedVideo");
const downloadGenerated = document.getElementById("downloadGenerated");
const captureHelp = document.getElementById("captureHelp");
let generatedUrl = null;

function getRecordingMime() {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp8",
    "video/webm"
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || "";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createVideo() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    recordStatus.textContent = "Tu navegador no permite grabar la pestaña. Abre el sitio en Chrome o Edge actualizado.";
    return;
  }

  if (!window.MediaRecorder) {
    recordStatus.textContent = "Tu navegador no permite crear videos directamente.";
    return;
  }

  const mime = getRecordingMime();
  if (!mime) {
    recordStatus.textContent = "No se encontró un formato de video compatible.";
    return;
  }

  recordButton.disabled = true;
  recordButton.textContent = "● Preparando...";
  recordStatus.textContent = "Llevando la página a la animación principal...";

  // La grabación debe mostrar exactamente el hero que ves en la página.
  window.scrollTo({top: 0, behavior: "smooth"});
  await sleep(900);

  let stream = null;
  try {
    recordStatus.textContent = "En la ventana de captura, selecciona ESTA PESTAÑA y luego pulsa Compartir.";

    // Captura la pestaña real. No recreamos el teléfono en Canvas.
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: {ideal: 30, max: 60},
        displaySurface: "browser",
        cursor: "never"
      },
      audio: false,
      preferCurrentTab: true,
      selfBrowserSurface: "include",
      surfaceSwitching: "exclude"
    });

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) throw new Error("No se obtuvo la pista de video.");

    // Si el usuario cambia o detiene la captura desde el navegador, terminamos limpiamente.
    let stoppedByUser = false;
    videoTrack.addEventListener("ended", () => { stoppedByUser = true; });

    const chunks = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 10000000
    });

    recorder.ondataavailable = e => {
      if (e.data && e.data.size) chunks.push(e.data);
    };

    const stopped = new Promise(resolve => {
      recorder.addEventListener("stop", resolve, {once: true});
    });

    // Pequeña cuenta regresiva para que el inicio no quede cortado.
    recordStatus.textContent = "Grabando la animación real... 3";
    await sleep(1000);
    recordStatus.textContent = "Grabando la animación real... 2";
    await sleep(1000);
    recordStatus.textContent = "Grabando la animación real... 1";
    await sleep(1000);

    recorder.start(250);
    recordStatus.textContent = "🔴 Grabando exactamente lo que aparece en la página...";

    const duration = 12000;
    const start = performance.now();
    while (performance.now() - start < duration) {
      if (stoppedByUser || videoTrack.readyState === "ended") break;
      const progress = Math.min((performance.now() - start) / duration, 1);
      recordStatus.textContent = `🔴 Grabando la animación real... ${Math.round(progress * 100)}%`;
      await sleep(100);
    }

    if (recorder.state !== "inactive") recorder.stop();
    await stopped;

    const blob = new Blob(chunks, {type: mime});
    if (!blob.size) throw new Error("El video quedó vacío.");

    if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    generatedUrl = URL.createObjectURL(blob);

    generatedVideo.src = generatedUrl;
    generatedVideo.hidden = false;
    downloadGenerated.href = generatedUrl;
    downloadGenerated.download = "Mochis-Burgers-Anuncio-Animacion-Real.webm";
    downloadGenerated.hidden = false;

    // Descarga automática al terminar.
    const a = document.createElement("a");
    a.href = generatedUrl;
    a.download = "Mochis-Burgers-Anuncio-Animacion-Real.webm";
    document.body.appendChild(a);
    a.click();
    a.remove();

    recordStatus.textContent = stoppedByUser
      ? "La grabación se detuvo y el video quedó disponible abajo."
      : "¡Listo! Se descargó el video con la animación REAL de la página.";
    captureHelp.textContent = "El video conserva el diseño real del sitio: teléfono 3D, flotación, giro, luces, tarjetas y las pantallas que hayas cargado.";
  } catch (err) {
    console.error(err);
    if (err && err.name === "NotAllowedError") {
      recordStatus.textContent = "No se inició la grabación. Selecciona la pestaña actual y pulsa Compartir cuando aparezca la ventana.";
    } else {
      recordStatus.textContent = "No se pudo grabar la pestaña. Prueba nuevamente en Chrome o Edge actualizado.";
    }
  } finally {
    if (stream) stream.getTracks().forEach(track => track.stop());
    recordButton.disabled = false;
    recordButton.textContent = "● Crear video";
  }
}

recordButton.addEventListener("click", createVideo);
