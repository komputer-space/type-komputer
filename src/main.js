import { TypeComputer } from "./TypeComputer";
import { CanvasExporter } from "./CanvasExporter.js";
import { SerialInput } from "./SerialInput.js";
import { mapRange } from "./helpers";

import * as debugLayer from "./debugLayer.js";
import "./styles/global.scss";

const app = {
  viewMode: false,
  smallScreen: false,
  touchDevice: false,
  domElement: document.getElementById("app"),
  canvas: document.getElementById("canvas"),
};

function setup() {
  app.typeComputer = new TypeComputer(app.canvas);
  app.canvasExporter = new CanvasExporter(app.canvas);
  app.serialInput = new SerialInput(115200);

  setupKeyInput();
  loadFonts();
  debugLayer.initDebugLayer();
  debugLayer.addObject(app);
  debugLayer.addObject(app.typeComputer);

  window.onresize = resize;
  resize();

  update();
}

function update() {
  // app.typeComputer.update();
  debugLayer.updateDebug();
  if (document.activeElement != document.body) document.activeElement.blur();
  if (app.serialInput.connected) processSerialData();
  window.requestAnimationFrame(update);
}

setup();

// ---------

function resize() {
  const width = window.innerWidth;
  if (width < 600) {
    app.smallScreen = true;
  } else {
    app.smallScreen = false;
  }
}

function processSerialData() {
  const data = app.serialInput.serialData;
  if (data) {
    const input = data.slice(1, -2);
    const splitted = input.split(".");
    const potValue = splitted[9];
    let fontSize = mapRange(potValue, 0, 100, 5, 500);
    app.typeComputer.setFontSize(fontSize);
  }
}

async function loadFonts() {
  let fonts = Array.from(document.fonts);
  fonts.forEach((font) => {
    font.load();
  });
}

function setupKeyInput() {
  document.onkeydown = processKeyInput;
}

function processKeyInput(e) {
  console.log(typeof app.typeComputer.activeElement == "undefined");
  if (!app.typeComputer.activeTypeElement) {
    // disable keyboard interactions
    console.log(app.typeComputer.activeElement);
    switch (e.code) {
      case "Space":
        toggleViewMode();
        break;
      case "KeyD":
        debugLayer.toggleDebugLayer();
        break;
      case "KeyR":
        if (app.viewMode) app.canvasExporter.toggleRecord();
        break;
      case "KeyS":
        if (app.viewMode) app.canvasExporter.saveImage();
        break;
    }
  }
}

function toggleViewMode() {
  console.log("toggle view mode");
  app.viewMode = !app.viewMode;
  const viewModeIndicator = document.getElementById("view-mode-indicator");
  viewModeIndicator.style.display = app.viewMode ? "flex" : "none";
  app.typeComputer.setViewMode(app.viewMode);
}
