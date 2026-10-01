/* =========================================================
   MOCHIS BURGERS
   SCRIPT COMPLETO
   - 6 pantallas
   - Subida de imágenes
   - Slideshow
   - Video independiente
   - Movimiento real del celular durante la grabación
   - Descarga automática
   ========================================================= */


/* =========================================================
   PANTALLAS
   ========================================================= */

const screens = [
  "img/pantalla1.svg",
  "img/pantalla2.svg",
  "img/pantalla3.svg",
  "img/pantalla4.svg",
  "img/pantalla5.svg",
  "img/pantalla6.svg"
];

const screenImage =
  document.getElementById("screenImage");

const generatorPreview =
  document.getElementById("generatorPreview");

const videoCaptureScreen =
  document.getElementById("videoCaptureScreen");

const videoCaptureArea =
  document.getElementById("videoCaptureArea");

const videoCapturePhone =
  document.getElementById("videoCapturePhone");

const thumbs = [
  ...document.querySelectorAll(".screen-thumb")
];

let current = 0;
let timer = null;

let recording = false;
let generatedUrl = null;
let generatedBlob = null;


/* =========================================================
   UTILIDADES
   ========================================================= */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* =========================================================
   CAMBIAR TODAS LAS PANTALLAS
   ========================================================= */

function updateScreenImages(src, animate = true) {

  if (screenImage) {

    if (animate) {
      screenImage.style.opacity = "0";

      setTimeout(() => {
        screenImage.src = src;
        screenImage.style.opacity = "1";
      }, 140);

    } else {
      screenImage.src = src;
    }
  }


  if (generatorPreview) {
    generatorPreview.src = src;
  }


  if (videoCaptureScreen) {
    videoCaptureScreen.src = src;
  }
}


/* =========================================================
   MOSTRAR PANTALLA
   ========================================================= */

function showScreen(index, restart = true) {

  if (
    index < 0 ||
    index >= screens.length ||
    !screens[index]
  ) {
    return;
  }

  current = index;

  updateScreenImages(
    screens[index],
    true
  );


  thumbs.forEach((button, i) => {

    button.classList.toggle(
      "active",
      i === index
    );

  });


  if (restart) {

    clearInterval(timer);

    timer = setInterval(() => {

      showScreen(
        (current + 1) % screens.length,
        false
      );

    }, 3000);

  }

}


/* =========================================================
   TRANSICIÓN DEL TELÉFONO PRINCIPAL
   ========================================================= */

if (screenImage) {
  screenImage.style.transition =
    "opacity .28s ease";
}


/* =========================================================
   BOTONES DE PANTALLAS
   ========================================================= */

thumbs.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const index =
        Number(button.dataset.index);

      if (!Number.isNaN(index)) {
        showScreen(index, true);
      }

    }
  );

});


/* =========================================================
   INICIAR SLIDESHOW
   ========================================================= */

showScreen(0, false);

timer = setInterval(() => {

  showScreen(
    (current + 1) % screens.length,
    false
  );

}, 3000);


/* =========================================================
   UPLOADER
   ========================================================= */

const uploader =
  document.getElementById("uploader");

const openUploader =
  document.getElementById("openUploader");

const openUploader2 =
  document.getElementById("openUploader2");

const closeUploader =
  document.getElementById("closeUploader");


if (openUploader) {

  openUploader.addEventListener(
    "click",
    () => {

      if (uploader) {
        uploader.classList.add("show");
      }

    }
  );

}


if (openUploader2) {

  openUploader2.addEventListener(
    "click",
    () => {

      if (uploader) {
        uploader.classList.add("show");
      }

    }
  );

}


if (closeUploader) {

  closeUploader.addEventListener(
    "click",
    () => {

      if (uploader) {
        uploader.classList.remove("show");
      }

    }
  );

}


if (uploader) {

  uploader.addEventListener(
    "click",
    event => {

      if (event.target === uploader) {
        uploader.classList.remove("show");
      }

    }
  );

}


/* =========================================================
   SUBIR LAS 6 IMÁGENES
   ========================================================= */

document
  .querySelectorAll(".upload-grid input")
  .forEach(input => {

    input.addEventListener(
      "change",
      event => {

        const file =
          event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

          alert(
            "Selecciona una imagen válida."
          );

          return;
        }


        const slot =
          Number(input.dataset.slot);


        if (
          Number.isNaN(slot) ||
          slot < 0 ||
          slot >= screens.length
        ) {
          return;
        }


        const url =
          URL.createObjectURL(file);


        screens[slot] = url;


        /* Miniatura */

        const thumb =
          document.querySelector(
            `.screen-thumb[data-index="${slot}"] img`
          );


        if (thumb) {
          thumb.src = url;
        }


        /* Si es la pantalla actual */

        if (slot === current) {

          updateScreenImages(
            url,
            true
          );

        }

      }
    );

  });


/* =========================================================
   ELEMENTOS DEL VIDEO
   ========================================================= */

const recordButton =
  document.getElementById("recordVideo");

const recordStatus =
  document.getElementById("recordStatus");

const generatedVideo =
  document.getElementById("generatedVideo");

const downloadGenerated =
  document.getElementById("downloadGenerated");

const shareGenerated =
  document.getElementById("shareGenerated");

const captureHelp =
  document.getElementById("captureHelp");


/* =========================================================
   MIME
   ========================================================= */

function getRecordingMime() {

  if (!window.MediaRecorder) {
    return "";
  }


  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ];


  return types.find(type =>
    MediaRecorder.isTypeSupported(type)
  ) || "";

}


/* =========================================================
   CARGAR HTML2CANVAS
   ========================================================= */

let html2CanvasPromise = null;


function loadHtml2Canvas() {

  if (window.html2canvas) {
    return Promise.resolve(
      window.html2canvas
    );
  }


  if (html2CanvasPromise) {
    return html2CanvasPromise;
  }


  html2CanvasPromise =
    new Promise((resolve, reject) => {

      const script =
        document.createElement("script");


      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";


      script.async = true;


      script.onload = () => {

        if (window.html2canvas) {

          resolve(
            window.html2canvas
          );

        } else {

          reject(
            new Error(
              "HTML2CANVAS_NO_DISPONIBLE"
            )
          );

        }

      };


      script.onerror = () => {

        reject(
          new Error(
            "HTML2CANVAS_ERROR"
          )
        );

      };


      document.head.appendChild(
        script
      );

    });


  return html2CanvasPromise;
}


/* =========================================================
   MOSTRAR VIDEO GENERADO
   ========================================================= */

function showGenerated(blob) {

  generatedBlob = blob;


  if (generatedUrl) {

    URL.revokeObjectURL(
      generatedUrl
    );

  }


  generatedUrl =
    URL.createObjectURL(blob);


  if (generatedVideo) {

    generatedVideo.src =
      generatedUrl;

    generatedVideo.hidden =
      false;

  }


  if (downloadGenerated) {

    downloadGenerated.href =
      generatedUrl;

    downloadGenerated.download =
      "Mochis-Burgers-Anuncio.webm";

    downloadGenerated.hidden =
      false;

  }


  if (shareGenerated) {

    shareGenerated.hidden =
      !(
        navigator.share &&
        navigator.canShare
      );

  }

}


/* =========================================================
   COMPARTIR
   ========================================================= */

async function saveOrShareVideo() {

  if (!generatedBlob) {
    return;
  }


  const file =
    new File(
      [generatedBlob],
      "Mochis-Burgers-Anuncio.webm",
      {
        type:
          generatedBlob.type ||
          "video/webm"
      }
    );


  try {

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [file]
      })
    ) {

      await navigator.share({

        title:
          "Mochis Burgers",

        text:
          "Video publicitario de Mochis Burgers",

        files: [file]

      });


      if (recordStatus) {

        recordStatus.textContent =
          "Video listo para guardar o compartir.";

      }


      return;

    }

  } catch (error) {

    if (
      error &&
      error.name === "AbortError"
    ) {
      return;
    }

  }


  if (generatedUrl) {

    window.open(
      generatedUrl,
      "_blank"
    );

  }

}


/* =========================================================
   PREPARAR ÁREA DEL VIDEO
   ========================================================= */

function prepareCaptureArea() {

  if (!videoCaptureArea) {

    throw new Error(
      "NO_VIDEO_CAPTURE_AREA"
    );

  }


  /*
    NO visibility:hidden.
    El elemento queda fuera de pantalla,
    pero sigue siendo renderizable.
  */

  videoCaptureArea.style.position =
    "fixed";

  videoCaptureArea.style.left =
    "-10000px";

  videoCaptureArea.style.top =
    "0px";

  videoCaptureArea.style.width =
    "900px";

  videoCaptureArea.style.height =
    "900px";

  videoCaptureArea.style.visibility =
    "visible";

  videoCaptureArea.style.opacity =
    "1";

  videoCaptureArea.style.pointerEvents =
    "none";

  videoCaptureArea.style.zIndex =
    "999999";


  if (videoCaptureScreen) {

    videoCaptureScreen.src =
      screens[current];

  }

}


/* =========================================================
   MOVIMIENTO DEL CELULAR
   ========================================================= */

/*
   ESTA ES LA PARTE NUEVA.

   En vez de confiar en @keyframes,
   nosotros calculamos el movimiento
   durante la grabación.

   Así html2canvas recibe un celular
   diferente en cada frame.
*/

function animateVideoPhone(time) {

  if (!videoCapturePhone) {
    return;
  }


  /*
    Tiempo en segundos
  */

  const t =
    time / 1000;


  /*
    Flotación vertical
  */

  const y =
    Math.sin(t * 1.8) * 18;


  /*
    Movimiento horizontal suave
  */

  const x =
    Math.sin(t * 1.05) * 10;


  /*
    Rotación izquierda/derecha
  */

  const rotateY =
    Math.sin(t * 1.25) * 8;


  /*
    Inclinación
  */

  const rotateZ =
    Math.sin(t * 1.55) * 3;


  /*
    Rotación X
  */

  const rotateX =
    Math.cos(t * 1.15) * 4;


  /*
    Escala ligera para dar
    sensación de movimiento
  */

  const scale =
    1 +
    Math.sin(t * 1.3) * 0.018;


  /*
    Aplicar transformación.

    IMPORTANTE:
    No usamos la animación CSS
    mientras grabamos.
  */

  videoCapturePhone.style.animation =
    "none";


  videoCapturePhone.style.transform =
    `
      translate3d(${x}px, ${y}px, 0)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      rotateZ(${rotateZ}deg)
      scale(${scale})
    `;

}


/* =========================================================
   MOVIMIENTO DE LAS LUCES
   ========================================================= */

function animateVideoLights(time) {

  if (!videoCaptureArea) {
    return;
  }


  const t =
    time / 1000;


  const glowLeft =
    videoCaptureArea.querySelector(
      ".glow-left"
    );

  const glowRight =
    videoCaptureArea.querySelector(
      ".glow-right"
    );


  if (glowLeft) {

    const x =
      Math.sin(t * 0.8) * 80;

    const y =
      Math.cos(t * 0.7) * 40;

    glowLeft.style.transform =
      `translate(${x}px, ${y}px)`;

  }


  if (glowRight) {

    const x =
      Math.cos(t * 0.9) * 80;

    const y =
      Math.sin(t * 0.75) * 40;

    glowRight.style.transform =
      `translate(${x}px, ${y}px)`;

  }

}


/* =========================================================
   CAPTURAR FRAME
   ========================================================= */

async function captureFrame(
  canvas,
  html2canvas
) {

  const frame =
    await html2canvas(
      videoCaptureArea,
      {

        backgroundColor:
          null,

        useCORS:
          true,

        allowTaint:
          false,

        logging:
          false,

        scale:
          1,

        width:
          900,

        height:
          900,

        imageTimeout:
          5000

      }
    );


  const ctx =
    canvas.getContext("2d");


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.drawImage(
    frame,
    0,
    0,
    canvas.width,
    canvas.height
  );

}


/* =========================================================
   CREAR VIDEO
   ========================================================= */

async function createVideo() {

  if (recording) {
    return;
  }


  if (!window.MediaRecorder) {

    if (recordStatus) {

      recordStatus.textContent =
        "Tu navegador no permite crear videos. Usa Chrome actualizado.";

    }

    return;

  }


  const mime =
    getRecordingMime();


  if (!mime) {

    if (recordStatus) {

      recordStatus.textContent =
        "Este navegador no tiene un formato de video compatible.";

    }

    return;

  }


  recording = true;


  if (recordButton) {

    recordButton.disabled =
      true;

    recordButton.textContent =
      "● Preparando...";

  }


  if (recordStatus) {

    recordStatus.textContent =
      "Preparando el anuncio...";

  }


  clearInterval(timer);


  try {

    /* =========================================
       CARGAR MOTOR DE CAPTURA
       ========================================= */

    const html2canvas =
      await loadHtml2Canvas();


    /* =========================================
       PREPARAR ÁREA
       ========================================= */

    prepareCaptureArea();


    await sleep(500);


    /* =========================================
       CANVAS DEL VIDEO
       ========================================= */

    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      900;

    canvas.height =
      900;


    const stream =
      canvas.captureStream(20);


    const recorder =
      new MediaRecorder(
        stream,
        {

          mimeType:
            mime,

          videoBitsPerSecond:
            16000000

        }
      );


    const chunks = [];


    recorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size
        ) {

          chunks.push(
            event.data
          );

        }

      };


    /* =========================================
       INICIO
       ========================================= */

    const duration =
      12000;

    const start =
      performance.now();

    let lastCapture =
      0;

    let lastScreenChange =
      0;

    let videoScreen =
      current;


    /* =========================================
       PRIMER FRAME
       ========================================= */

    animateVideoPhone(0);

    animateVideoLights(0);

    await captureFrame(
      canvas,
      html2canvas
    );


    recorder.start(250);


    if (recordStatus) {

      recordStatus.textContent =
        "🔴 Creando anuncio... 0%";

    }


    /* =========================================
       LOOP PRINCIPAL
       ========================================= */

    while (
      performance.now() - start <
      duration
    ) {

      const now =
        performance.now();

      const elapsed =
        now - start;


      /*
        ========================================
        MOVIMIENTO DEL CELULAR
        ========================================
      */

      animateVideoPhone(
        elapsed
      );


      /*
        ========================================
        MOVIMIENTO DE LUCES
        ========================================
      */

      animateVideoLights(
        elapsed
      );


      /*
        ========================================
        CAMBIO DE PANTALLA
        Cada 2 segundos
        ========================================
      */

      if (
        elapsed -
        lastScreenChange >=
        2000
      ) {

        videoScreen =
          (
            videoScreen + 1
          ) %
          screens.length;


        current =
          videoScreen;


        if (videoCaptureScreen) {

          videoCaptureScreen.src =
            screens[videoScreen];

        }


        lastScreenChange =
          elapsed;


        /*
          Esperamos un poco para
          que cargue la imagen.
        */

        await sleep(70);

      }


      /*
        ========================================
        CAPTURA A 20 FPS
        ========================================
      */

      if (
        elapsed -
        lastCapture >=
        50
      ) {

        await captureFrame(
          canvas,
          html2canvas
        );


        lastCapture =
          elapsed;

      }


      /*
        ========================================
        PROGRESO
        ========================================
      */

      const percent =
        Math.min(
          100,
          Math.round(
            (elapsed / duration) *
            100
          )
        );


      if (recordStatus) {

        recordStatus.textContent =
          `🔴 Creando anuncio... ${percent}%`;

      }


      await sleep(5);

    }


    /* =========================================
       ÚLTIMO FRAME
       ========================================= */

    animateVideoPhone(
      duration
    );

    animateVideoLights(
      duration
    );


    await captureFrame(
      canvas,
      html2canvas
    );


    /* =========================================
       DETENER
       ========================================= */

    if (
      recorder.state !==
      "inactive"
    ) {

      recorder.stop();

    }


    await new Promise(resolve => {

      recorder.addEventListener(
        "stop",
        resolve,
        {
          once: true
        }
      );

    });


    stream
      .getTracks()
      .forEach(track =>
        track.stop()
      );


    /* =========================================
       CREAR BLOB
       ========================================= */

    const blob =
      new Blob(
        chunks,
        {
          type: mime
        }
      );


    if (!blob.size) {

      throw new Error(
        "EMPTY_VIDEO"
      );

    }


    showGenerated(
      blob
    );


    /* =========================================
       DESCARGA AUTOMÁTICA
       ========================================= */

    const link =
      document.createElement(
        "a"
      );


    link.href =
      generatedUrl;

    link.download =
      "Mochis-Burgers-Anuncio.webm";

    link.style.display =
      "none";


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    if (recordStatus) {

      recordStatus.textContent =
        "✅ ¡Video creado y descargado!";

    }


    if (captureHelp) {

      captureHelp.innerHTML =
        "El video contiene únicamente el <b>fondo, el celular animado y las 6 pantallas</b>.";

    }


  } catch (error) {

    console.error(
      "Error al crear video:",
      error
    );


    if (recordStatus) {

      recordStatus.textContent =
        "No se pudo crear el video. Revisa que exista #videoCaptureArea y vuelve a intentarlo.";

    }

  } finally {

    /* =========================================
       RESTAURAR CAPTURA
       ========================================= */

    if (videoCaptureArea) {

      videoCaptureArea.style.left =
        "-10000px";

      videoCaptureArea.style.visibility =
        "visible";

    }


    /*
      Quitamos la transformación
      manual del video.
    */

    if (videoCapturePhone) {

      videoCapturePhone.style.transform =
        "";

      videoCapturePhone.style.animation =
        "";

    }


    /* =========================================
       RESTAURAR SLIDESHOW
       ========================================= */

    clearInterval(timer);


    timer =
      setInterval(() => {

        showScreen(
          (current + 1) %
          screens.length,
          false
        );

      }, 3000);


    recording =
      false;


    if (recordButton) {

      recordButton.disabled =
        false;

      recordButton.textContent =
        "● Crear video";

    }

  }

}


/* =========================================================
   BOTONES
   ========================================================= */

if (recordButton) {

  recordButton.addEventListener(
    "click",
    createVideo
  );

}


if (shareGenerated) {

  shareGenerated.addEventListener(
    "click",
    saveOrShareVideo
  );

}


/* =========================================================
   LIMPIEZA
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (generatedUrl) {

      URL.revokeObjectURL(
        generatedUrl
      );

    }

  }
);