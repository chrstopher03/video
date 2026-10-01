<script>
/* =========================================================
   GENERADOR DE VIDEO — COMPATIBILIDAD PC + ANDROID + iPHONE
   ========================================================= */

const screens = [
  "img/pantalla1.svg",
  "img/pantalla2.svg",
  "img/pantalla3.svg",
  "img/pantalla4.svg",
  "img/pantalla5.svg",
  "img/pantalla6.svg"
];

const recordBtn = document.getElementById("recordVideo");
const recordStatus = document.getElementById("recordStatus");
const generatedVideo = document.getElementById("generatedVideo");
const downloadGenerated = document.getElementById("downloadGenerated");
const shareGenerated = document.getElementById("shareGenerated");

const captureArea = document.getElementById("videoCaptureArea");
const capturePhone = document.getElementById("videoCapturePhone");
const captureScreen = document.getElementById("videoCaptureScreen");

let generatedBlob = null;
let generatedUrl = null;
let isRecording = false;


/* =========================================================
   DETECTAR FORMATO COMPATIBLE
   ========================================================= */

function getSupportedMimeType() {

  if (!window.MediaRecorder) {
    return "";
  }

  const formats = [

    // Algunos navegadores móviles
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1",
    "video/mp4",

    // Chrome / Android / PC
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ];

  for (const format of formats) {
    try {
      if (MediaRecorder.isTypeSupported(format)) {
        return format;
      }
    } catch (error) {}
  }

  return "";
}


/* =========================================================
   NOMBRE DEL ARCHIVO
   ========================================================= */

function getVideoExtension(mime) {

  if (mime.includes("mp4")) {
    return "mp4";
  }

  return "webm";
}


/* =========================================================
   ESPERAR
   ========================================================= */

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* =========================================================
   ACTUALIZAR PANTALLA
   ========================================================= */

async function changeCaptureScreen(index) {

  if (!captureScreen) return;

  captureScreen.style.opacity = "0";

  await wait(180);

  captureScreen.src = screens[index % screens.length];

  await new Promise(resolve => {

    if (captureScreen.complete) {
      resolve();
      return;
    }

    captureScreen.onload = resolve;
    captureScreen.onerror = resolve;

  });

  await wait(100);

  captureScreen.style.opacity = "1";
}


/* =========================================================
   MOVIMIENTO REAL DEL TELÉFONO
   ========================================================= */

function animateCapturePhone(time) {

  if (!capturePhone) return;

  /*
    Movimiento suave en 3D.
    Esto se hace con JavaScript durante la grabación
    para que html2canvas capture el movimiento realmente.
  */

  const seconds = time / 1000;

  const y = Math.sin(seconds * 2.1) * 18;
  const x = Math.sin(seconds * 1.35) * 7;

  const rotateY = Math.sin(seconds * 1.4) * 10;
  const rotateX = Math.cos(seconds * 1.1) * 3;

  const rotateZ = Math.sin(seconds * 1.7) * 1.2;

  const scale =
    1 +
    (Math.sin(seconds * 1.15) * 0.012);

  capturePhone.style.transform = `
    perspective(1400px)
    translate3d(${x}px, ${y}px, 0)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    rotateZ(${rotateZ}deg)
    scale(${scale})
  `;
}


/* =========================================================
   CREAR VIDEO
   ========================================================= */

async function createVideo() {

  if (isRecording) return;

  if (!window.html2canvas) {

    alert(
      "No se pudo cargar el sistema de captura. " +
      "Recarga la página e inténtalo nuevamente."
    );

    return;
  }

  if (!window.MediaRecorder) {

    alert(
      "Tu navegador no permite crear videos directamente. " +
      "Prueba con Chrome o Safari actualizado."
    );

    return;
  }

  isRecording = true;

  recordBtn.disabled = true;
  recordBtn.textContent = "● Creando video...";

  if (recordStatus) {
    recordStatus.textContent = "Preparando video...";
  }

  generatedVideo.hidden = true;
  downloadGenerated.hidden = true;
  shareGenerated.hidden = true;

  if (generatedUrl) {
    URL.revokeObjectURL(generatedUrl);
    generatedUrl = null;
  }

  generatedBlob = null;


  /* ---------------------------------------------
     PREPARAR ÁREA DE CAPTURA
     --------------------------------------------- */

  const oldVisibility = captureArea.style.visibility;
  const oldOpacity = captureArea.style.opacity;
  const oldLeft = captureArea.style.left;
  const oldAnimation = capturePhone.style.animation;
  const oldTransform = capturePhone.style.transform;

  captureArea.style.visibility = "visible";
  captureArea.style.opacity = "1";
  captureArea.style.left = "-10000px";

  /*
    Desactivamos la animación CSS temporalmente.
    JavaScript controlará el movimiento para que
    cada frame tenga una posición diferente.
  */

  capturePhone.style.animation = "none";


  /* ---------------------------------------------
     PREPARAR CANVAS
     --------------------------------------------- */

  const rect = captureArea.getBoundingClientRect();

  const width = Math.max(720, Math.round(rect.width));
  const height = Math.max(720, Math.round(rect.height));

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", {
    alpha: false
  });


  /* ---------------------------------------------
     STREAM DEL CANVAS
     --------------------------------------------- */

  const fps = 20;

  const stream = canvas.captureStream(fps);

  const mimeType = getSupportedMimeType();

  let recorder;

  try {

    recorder = mimeType
      ? new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6000000
        })
      : new MediaRecorder(stream);

  } catch (error) {

    console.error(error);

    capturePhone.style.animation = oldAnimation;
    capturePhone.style.transform = oldTransform;

    captureArea.style.visibility = oldVisibility;
    captureArea.style.opacity = oldOpacity;
    captureArea.style.left = oldLeft;

    recordBtn.disabled = false;
    recordBtn.textContent = "● Crear video";

    alert(
      "Tu navegador no permite generar este video. " +
      "Actualiza Chrome/Safari o prueba desde otro navegador."
    );

    isRecording = false;

    return;
  }


  const chunks = [];

  recorder.ondataavailable = event => {

    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }

  };


  /* ---------------------------------------------
     CUANDO TERMINA
     --------------------------------------------- */

  recorder.onstop = async () => {

    const finalType =
      recorder.mimeType ||
      mimeType ||
      "video/webm";

    generatedBlob = new Blob(chunks, {
      type: finalType
    });

    generatedUrl = URL.createObjectURL(generatedBlob);

    generatedVideo.src = generatedUrl;

    generatedVideo.controls = true;
    generatedVideo.playsInline = true;
    generatedVideo.preload = "metadata";

    generatedVideo.hidden = false;

    /*
      Importante para móviles:
      no intentamos reproducir automáticamente.
      El usuario puede tocar Play.
    */

    const extension = getVideoExtension(finalType);

    const fileName =
      "mochis-burgers-video-" +
      Date.now() +
      "." +
      extension;

    downloadGenerated.href = generatedUrl;
    downloadGenerated.download = fileName;
    downloadGenerated.hidden = false;

    shareGenerated.hidden = false;

    recordBtn.disabled = false;
    recordBtn.textContent = "● Crear video";

    if (recordStatus) {
      recordStatus.textContent =
        "Video creado correctamente. Toca ▶ para reproducirlo.";
    }


    /* ---------------------------------------------
       RESTAURAR CAPTURA
       --------------------------------------------- */

    capturePhone.style.animation = oldAnimation;
    capturePhone.style.transform = oldTransform;

    captureArea.style.visibility = oldVisibility;
    captureArea.style.opacity = oldOpacity;
    captureArea.style.left = oldLeft;

    isRecording = false;
  };


  recorder.onerror = error => {

    console.error("Error MediaRecorder:", error);

    try {
      recorder.stop();
    } catch (e) {}

  };


  /* ---------------------------------------------
     INICIAR GRABACIÓN
     --------------------------------------------- */

  await changeCaptureScreen(0);

  await wait(500);

  recorder.start(250);


  /* ---------------------------------------------
     CAPTURAR FRAMES
     --------------------------------------------- */

  const duration = 12000;

  const startTime = performance.now();

  let lastScreen = -1;

  async function captureFrame(now) {

    if (!isRecording) return;

    const elapsed = now - startTime;

    /* Movimiento real del teléfono */
    animateCapturePhone(elapsed);

    /* Cambiar pantalla cada 2 segundos */
    const screenIndex =
      Math.min(
        screens.length - 1,
        Math.floor(elapsed / 2000)
      );

    if (screenIndex !== lastScreen) {

      lastScreen = screenIndex;

      await changeCaptureScreen(screenIndex);
    }


    /* Capturar SOLO el área del video */

    try {

      const rendered = await html2canvas(captureArea, {

        backgroundColor: "#07070a",

        width: width,
        height: height,

        scale: 1,

        useCORS: true,

        allowTaint: false,

        logging: false,

        imageTimeout: 5000,

        removeContainer: true,

        foreignObjectRendering: false
      });


      ctx.clearRect(0, 0, width, height);

      ctx.drawImage(
        rendered,
        0,
        0,
        width,
        height
      );

    } catch (error) {

      console.warn(
        "No se pudo capturar un frame:",
        error
      );
    }


    if (elapsed < duration) {

      setTimeout(() => {
        requestAnimationFrame(captureFrame);
      }, 50);

    } else {

      if (recordStatus) {
        recordStatus.textContent =
          "Finalizando video...";
      }

      try {
        recorder.stop();
      } catch (error) {}

    }
  }


  requestAnimationFrame(captureFrame);
}


/* =========================================================
   BOTÓN CREAR VIDEO
   ========================================================= */

if (recordBtn) {

  recordBtn.addEventListener(
    "click",
    createVideo
  );

}


/* =========================================================
   COMPARTIR / GUARDAR EN CELULAR
   ========================================================= */

if (shareGenerated) {

  shareGenerated.addEventListener(
    "click",
    async () => {

      if (!generatedBlob) {
        alert("Primero crea el video.");
        return;
      }

      const mime =
        generatedBlob.type ||
        "video/webm";

      const extension =
        getVideoExtension(mime);

      const fileName =
        "mochis-burgers-video." +
        extension;

      const file = new File(
        [generatedBlob],
        fileName,
        {
          type: mime
        }
      );


      /* ---------------------------------------------
         SHARE API
         --------------------------------------------- */

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file]
        })
      ) {

        try {

          await navigator.share({
            title: "Mochis Burgers",
            text: "Video de Mochis Burgers",
            files: [file]
          });

          return;

        } catch (error) {

          /*
            Si el usuario cancela compartir,
            simplemente no hacemos nada.
          */

          if (error.name === "AbortError") {
            return;
          }

        }
      }


      /* ---------------------------------------------
         FALLBACK
         --------------------------------------------- */

      const link =
        document.createElement("a");

      link.href = generatedUrl;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

    }
  );

}


/* =========================================================
   LIMPIAR URL AL CERRAR LA PÁGINA
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (generatedUrl) {
      URL.revokeObjectURL(generatedUrl);
    }

  }
);
</script>