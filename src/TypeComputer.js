import { PaperScope } from "paper";
import { randomInt } from "./helpers";
import { ReferenceImage } from "./ReferenceImage";
import { FileImporter } from "./FileImporter";
import { ParameterInput } from "./ParameterInput";
import { InfoLayer } from "./InfoLayer";

const PAPER = new PaperScope();

export class TypeComputer {
  constructor(canvas) {
    this.loadFonts();

    this.canvas = canvas;

    this.transparencyMode = false;
    this.freeze = false;

    this.infoLayer = new InfoLayer();
    this.FileImporter = new FileImporter(this);
    this.referenceImage = new ReferenceImage();

    PAPER.setup(this.canvas);
    this.typeElements = [];
    this.activeTypeElement = null;
    this.editingText = false;

    this.typeTool = new PAPER.Tool();
    this.activeTool = this.typeTool;
    this.typeTool.onMouseDown = (e) => this.typeToolMouseDown(e);
    this.typeTool.onKeyDown = (e) => this.typeToolKeyDown(e);

    this.fonts = [
      "Redaction35",
      "FavoritLining",
      "Astloch",
      "Helvetica",
      "ChaumontScript",
      "Compagnon",
      "Crimson",
      "Instrument",
    ];

    document.oncontextmenu = (e) => e.preventDefault();
    PAPER.tool = this.activeTool;

    this.parameterInput = new ParameterInput((param) => {
      this.setFontSize(param * 500 + 20);
    });

    this.createTypeElement(PAPER.view.size.divide(2));
  }

  update() {}

  resize(width, height) {}

  setViewMode(value) {
    this.freeze = value;
    PAPER.tool = value ? null : this.activeTool;
  }

  setTransparencyMode(value) {
    this.transparencyMode = value;
    this.setWireframe(value);
  }

  async loadFonts() {
    let fonts = Array.from(document.fonts);
    fonts.forEach((font) => {
      font.load();
    });
  }

  setWireframe(value) {
    this.typeElements.forEach((typeElement) => {
      typeElement.selected = value;
    });
  }

  updateTypeElements() {
    this.typeElements.forEach((typeElement) => {
      if (typeElement.content == "") this.deleteTypeElement(typeElement);
    });
    this.setWireframe(this.transparencyMode);
  }

  typeToolMouseDown(e) {
    if (e.item == null) {
      if (!this.activeTypeElement || this.activeTypeElement == null)
        this.createTypeElement(e.point);
      this.blurActiveElement();
    } else {
      const element = e.item;
      this.setTypeElementActive(element);
    }
  }

  typeToolKeyDown(e) {
    if (this.activeTypeElement != null) {
      let text = this.activeTypeElement.content;

      if (e.key == "backspace") {
        console.log("back");
        text = text.slice(0, -1);
        this.editingText = true;
      } else if (!isNaN(Number(e.key))) {
        console.log("filter");
        let fontIndex = Number(e.key) - 1;
        this.setFont(fontIndex);
      } else {
        console.log("edit");
        if (!this.editingText) {
          text = "";
          this.editingText = true;
        }
        text += e.character;
        console.log(this.activeTypeElement);
      }
      this.activeTypeElement.content = text;
    }
  }

  typeToolMouseDrag(e) {
    const typeElement = e.item;
    this.moveTypeElement(typeElement, e.point);
  }

  doubleClick(e) {
    console.log("double click");
    const typeElement = e.target;
    this.deleteTypeElement(typeElement);
  }

  processSerialData() {
    // const data = app.serialInput.serialData;
    // if (data) {
    //   const input = data.slice(1, -2);
    //   const splitted = input.split(".");
    //   const potValue = splitted[9];
    //   let fontSize = mapRange(potValue, 0, 100, 5, 500);
    //   app.typeComputer.setFontSize(fontSize);
    // }
  }

  createTypeElement(point) {
    console.log("new element");
    const typeElement = new PAPER.PointText(point);
    let font = this.fonts[randomInt(0, 8)];
    typeElement.fontFamily = font;
    typeElement.fontSize = 50;
    typeElement.justification = "center";
    typeElement.fillColor = "white";
    typeElement.selectedColor = "white";
    typeElement.content = "type";
    typeElement.onDoubleClick = (e) => this.doubleClick(e);
    typeElement.onMouseDrag = (e) => this.moveTypeElement(typeElement, e.delta);
    this.typeElements.push(typeElement);
    this.updateTypeElements();
  }

  deleteTypeElement(element) {
    console.log("remove");
    if (element == this.activeTypeElement) this.activeTypeElement = null;
    const index = this.typeElements.indexOf(element);
    this.typeElements.splice(index, 1);
    element.remove();
  }

  moveTypeElement(element, delta) {
    element.position = element.position.add(delta);
  }

  setTypeElementActive(element) {
    if (element != this.activeTypeElement) {
      if (this.activeTypeElement) this.activeTypeElement.fillColor = "white";
      this.activeTypeElement = element;
      this.activeTypeElement.fillColor = "#00ff9e";
      this.editingText = false;
    }
  }

  blurActiveElement() {
    if (this.activeTypeElement) this.activeTypeElement.fillColor = "white";
    this.activeTypeElement = null;
    this.editingText = false;
  }

  setFont(index) {
    if (!(index >= this.fonts.length)) {
      this.activeTypeElement.fontFamily = this.fonts[index];
    }
  }

  setFontSize(size) {
    if (this.activeTypeElement != null) this.activeTypeElement.fontSize = size;
  }

  // --- FILE IMPORTS

  importGlTF(url) {
    console.log("gltf");
    this.infoLayer.setActive(true);
    this.infoLayer.showInfo("3D Files not supported");
    setTimeout(() => {
      this.infoLayer.setActive(false);
    }, 1000);
  }

  importImage(url) {
    this.referenceImage.setImage(url);
  }
}
