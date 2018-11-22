const scale = 10
const xSize = 48 * scale
const ySize = 72 * scale
const pixSize = xSize / 48;

function setup() {
  createCanvas(xSize + 5, ySize + 5)
  background(230)
  for (let i = 0; i < xSize; i += pixSize) {
    line(i, 0, i, ySize)
  }
  for (let i = 0; i < ySize; i += pixSize) {
    line(0, i, xSize, i)
  }
}

function draw() {

}
