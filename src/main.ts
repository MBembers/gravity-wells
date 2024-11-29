import { Constants, Mass } from "./types.ts";
import { subtract, abs } from "./vector_math.ts";
import { closest_mass, integrate } from "./calculations.ts";

const canvas = document.querySelector("#sim-canvas") as HTMLCanvasElement;
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const size = 5;
const h = 0.2;
const max_steps = 300;
const z = 3;
const G = 6.674 * 10;
const b = 0.1;
const epsilon = 0.1;
const masses: Mass[] = [];

const constants: Constants = { h, G, b, epsilon, max_steps, size };

const mass1: Mass = { pos: [100, 200, z], m: 100, color: "#fa6670" };
const mass2: Mass = { pos: [200, 100, z], m: 100, color: "#1fc7ff" };
const mass3: Mass = { pos: [300, 200, z], m: 100, color: "#8bfa66" };

masses.push(mass1, mass2, mass3);

let count = 0;
let err_count = 0;
let finals: number[][] = [];
let canvas_data: ImageData;

for (let i = 0; i < canvas.width; i += size) {
	const y = i + size / 2;
	for (let j = 0; j < canvas.height; j += size) {
		const x = j + size / 2;

		let r = [x, y, 0];
		const r_final = integrate(r, masses, constants, ctx);
		const closest = closest_mass(r_final, masses);

		if ((abs(subtract(r_final, closest.pos)) as number) > 15) {
			err_count++;
		}

		ctx.fillStyle = closest.color;
		ctx.fillRect(x - size / 2, y - size / 2, size, size);

		finals.push(r_final);
		count++;
	}
}
console.log("total count: ", count);
console.log("error count: ", err_count);

const draw_masses = () => {
	masses.forEach((mass) => {
		ctx.beginPath();
		ctx.arc(mass.pos[0], mass.pos[1], 10, 0, 2 * Math.PI);
		ctx.fillStyle = mass.color;
		ctx.fill();
		ctx.lineWidth = 4;
		ctx.strokeStyle = "black";
		ctx.stroke();
	});
};

draw_masses();

ctx.fillStyle = "white";
finals.forEach((r) => {
	ctx.fillRect(Math.floor(r[0]), Math.floor(r[1]), 1, 1);
});
canvas_data = ctx.getImageData(0, 0, canvas.width, canvas.height);

canvas.addEventListener("mousemove", (e: MouseEvent) => {
	const x = e.offsetX;
	const y = e.offsetY;
	ctx.putImageData(canvas_data, 0, 0);
	integrate([x, y, 0], masses, constants, ctx, true);
});
