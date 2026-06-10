const ROWS = 2;
const COLS = 3;

const VIEW_NAMES = [
  "front",
  "side",
  "back",
  "front_3q",
  "back_3q",
  "top_front",
];

const hubLink = document.getElementById("hub-link");
if (hubLink) {
  hubLink.href = window.TOOLS_HUB_URL;
}

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const fileNameEl = document.getElementById("file-name");
const sourceWrap = document.getElementById("source-wrap");
const sourcePreview = document.getElementById("source-preview");
const splitBtn = document.getElementById("split-btn");
const downloadAllBtn = document.getElementById("download-all-btn");
const resultsSection = document.getElementById("results");
const viewsGrid = document.getElementById("views-grid");

let loadedImage = null;
let sourceObjectUrl = null;
let currentViews = [];

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (sourceObjectUrl) {
      URL.revokeObjectURL(sourceObjectUrl);
    }
    sourceObjectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(sourceObjectUrl);
      sourceObjectUrl = null;
      reject(new Error("Не удалось прочитать изображение"));
    };
    img.src = sourceObjectUrl;
  });
}

function splitTurnaround(img) {
  const h = img.naturalHeight;
  const w = img.naturalWidth;
  const cellH = Math.floor(h / ROWS);
  const cellW = Math.floor(w / COLS);
  const views = [];
  let idx = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x1 = c * cellW;
      const y1 = r * cellH;
      const x2 = c === COLS - 1 ? w : (c + 1) * cellW;
      const y2 = r === ROWS - 1 ? h : (r + 1) * cellH;
      const cw = x2 - x1;
      const ch = y2 - y1;

      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, x1, y1, cw, ch, 0, 0, cw, ch);

      const name = VIEW_NAMES[idx] ?? `view_${idx + 1}`;
      views.push({ name, canvas, blob: null });
      idx++;
    }
  }

  return views;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderViews(views) {
  viewsGrid.innerHTML = "";

  views.forEach((view) => {
    const card = document.createElement("article");
    card.className = "view-card card";

    const label = document.createElement("p");
    label.className = "label";
    label.textContent = view.name;

    const preview = document.createElement("img");
    preview.className = "view-card__img";
    preview.src = view.canvas.toDataURL("image/png");
    preview.alt = `Ракурс ${view.name}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "button-link";
    btn.textContent = "Скачать PNG";
    btn.addEventListener("click", async () => {
      const blob = view.blob ?? (await canvasToBlob(view.canvas));
      view.blob = blob;
      downloadBlob(blob, `${view.name}.png`);
    });

    card.append(label, preview, btn);
    viewsGrid.appendChild(card);
  });

  resultsSection.hidden = false;
}

async function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  fileNameEl.textContent = file.name;
  fileNameEl.hidden = false;

  try {
    loadedImage = await loadImageFromFile(file);
    sourcePreview.src = sourceObjectUrl;
    sourceWrap.hidden = false;
    splitBtn.disabled = false;
    resultsSection.hidden = true;
    downloadAllBtn.hidden = true;
    currentViews = [];
  } catch {
    alert("Не удалось открыть файл. Попробуйте другой формат.");
  }
}

async function runSplit() {
  if (!loadedImage) return;

  splitBtn.disabled = true;
  splitBtn.textContent = "Режем…";

  currentViews = splitTurnaround(loadedImage);

  await Promise.all(
    currentViews.map(async (view) => {
      view.blob = await canvasToBlob(view.canvas);
    })
  );

  renderViews(currentViews);
  downloadAllBtn.hidden = false;
  splitBtn.disabled = false;
  splitBtn.textContent = "Разрезать";
}

async function downloadAllZip() {
  if (!currentViews.length || typeof JSZip === "undefined") {
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder("views");

  currentViews.forEach((view) => {
    folder.file(`${view.name}.png`, view.blob);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "views.zip");
}

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) handleFile(file);
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dropzone--active");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dropzone--active");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dropzone--active");
  const file = e.dataTransfer.files?.[0];
  if (file) handleFile(file);
});

splitBtn.addEventListener("click", runSplit);
downloadAllBtn.addEventListener("click", downloadAllZip);
