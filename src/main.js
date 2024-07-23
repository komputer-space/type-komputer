import "./styles/global.scss";
import { TypeKomputer } from "./TypeKomputer.js";
import { CanvasExporter } from "./CanvasExporter.js";
import { TransparencyLayer } from "./TransparencyLayer.js";

const app = {
  viewMode: false,
  inputActive: true,
  inputTimeout: null,
  transparencyMode: false,
  smallScreen: false,
  touchDevice: false,
  domElement: document.getElementById("app"),
  canvas: document.getElementById("canvas"),
};

function setup() {
  // app.sketchManual = new SketchManual();
  app.canvasExporter = new CanvasExporter(app.canvas);
  app.tool = new TypeKomputer(app.canvas);

  setupInputs();
  document.onkeydown = processKeyInput;
  document.onmousemove = inputTimeout;

  window.onresize = resize;

  app.transparencyLayer = new TransparencyLayer();
  app.transparencyLayer.addObject(app, "Application");
  app.transparencyLayer.addObject(app.transparencyLayer, "Transparency Layer");
  app.transparencyLayer.addObject(app.tool, "Type Komputer");

  setTransparencyMode(true);

  resize();
  update();
  inputTimeout();
}

function update() {
  app.tool.update();
  app.transparencyLayer.updateDebug();
  requestAnimationFrame(update);
}

setup();

// ---------

function processKeyInput(e) {
  document.activeElement.blur();
  inputTimeout();
  if (app.inputActive && !app.tool.activeTypeElement) {
    document.activeElement.blur();
    switch (e.code) {
      case "KeyF":
        toggleViewMode();
        break;
      case "Space":
        toggleTransparencyMode();
        break;
      case "KeyR":
        app.canvasExporter.toggleRecord();
        break;
      case "KeyS":
        if (app.viewMode) app.canvasExporter.saveImage();
        break;
      case "Escape":
        window.location.replace("https://toolbox.komputer.space");
        break;
    }
  }
}

function inputTimeout() {
  app.tool.setIdleMode(false);
  clearTimeout(app.inputTimeout);
  app.inputTimeout = setTimeout(function () {
    console.log("input timeout, enter idle");
    app.tool.setIdleMode(true);
  }, 30000);
}

function setupInputs() {
  // prevent tool inputs while typing into any text input fields
  const inputs = Array.from(document.querySelectorAll("input[type=text]"));
  inputs.forEach((input) => {
    input.onfocus = () => {
      app.inputActive = false;
    };
    input.onblur = () => {
      app.inputActive = true;
    };
  });
}

function toggleViewMode() {
  console.log("toggle view mode");
  app.viewMode = !app.viewMode;
  const viewModeIndicator = document.getElementById("view-mode-indicator");
  viewModeIndicator.style.display = app.viewMode ? "flex" : "none";
  app.tool.setViewMode(app.viewMode);
}

function toggleTransparencyMode() {
  console.log("toggle transparency layer");
  const active = !app.transparencyMode;
  setTransparencyMode(active);
}

function setTransparencyMode(val) {
  app.transparencyMode = val;
  app.transparencyLayer.setActive(val);
  app.tool.setTransparencyMode(val);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  app.tool.resize(width, height);
  if (width < 600) {
    app.smallScreen = true;
    // app.sketchManual.setSmallScreenGuides(true);
  } else {
    app.smallScreen = false;
    // app.sketchManual.setSmallScreenGuides(false);
  }
}
