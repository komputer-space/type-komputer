export class ReferenceImage {
  constructor() {
    this.imgElement = document.getElementById("reference-image");
  }
  setImage(src) {
    console.log("set");
    this.imgElement.src = src;
  }
}
