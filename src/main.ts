const canvas = document.querySelector("#sim-canvas") as HTMLCanvasElement;
canvas.width = 500;
canvas.height = 500;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);
