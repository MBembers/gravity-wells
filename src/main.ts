import { Mass } from "./types.ts";
import { subtract, abs } from "./vector_math.ts";
import { closest_mass, integrate } from "./calculations.ts";
import { constants } from "./consts.ts";

const canvas = document.querySelector("#sim-canvas") as HTMLCanvasElement;
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const z = 3;
const masses: Mass[] = [];
const mass1: Mass = { pos: [100, 200, z], m: 100, color: "#fa6670" };
const mass2: Mass = { pos: [200, 100, z], m: 100, color: "#1fc7ff" };
const mass3: Mass = { pos: [300, 250, z], m: 50, color: "#8bfa66" };

masses.push(mass1, mass2, mass3);

let count = 0;
let err_count = 0;
let finals: number[][] = [];
let canvas_data: ImageData;

for (let i = 0; i < canvas.width; i += constants.size) {
	const y = i + constants.size / 2;
	for (let j = 0; j < canvas.height; j += constants.size) {
		const x = j + constants.size / 2;

		let r = [x, y, 0];
		const r_final = integrate(r, masses, ctx);
		const closest = closest_mass(r_final, masses);

		if ((abs(subtract(r_final, closest.pos)) as number) > 15) {
			err_count++;
		}

		ctx.fillStyle = closest.color;
		ctx.fillRect(x - constants.size / 2, y - constants.size / 2, constants.size, constants.size);

		finals.push(r_final);
		count++;
		// break;
	}
	// break;
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

canvas.addEventListener("click", (e: MouseEvent) => {
	const x = e.offsetX;
	const y = e.offsetY;
	ctx.putImageData(canvas_data, 0, 0);
	ctx.fillStyle = "white";
	integrate([x, y, 0], masses, ctx, true);
});
