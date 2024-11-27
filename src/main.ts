import { Constants } from "./types.ts";
import { add, subtract, multiply, divide, abs } from "./vector_math.ts";

const canvas = document.querySelector("#sim-canvas") as HTMLCanvasElement;
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

interface Mass {
	pos: [number, number, number];
	m: number;
	color: string;
}

const step = 3;
const dt = 0.07;
const max_steps = 2000;
const h = 4;
const G = 6.674 * 10;
const b = 0.09;
const epsilon = 0.1;
const masses: Mass[] = [];

const constants: Constants = { dt, G, b, epsilon };

const calc_a = (r: number[], v: number[]): number[] => {
	let a = [0, 0, 0];
	for (let i = 0; i < masses.length; i++) {
		const mass = masses[i];

		let r_rel = subtract(mass.pos, r);
		const dist = abs(r_rel);
		let temp_a = multiply(r_rel, 1 / Math.pow(dist, 3));
		temp_a = multiply(temp_a, G * mass.m);
		temp_a = subtract(temp_a, multiply(v, b));
		a = <number[]>add(a, temp_a);
	}
	return <number[]>a;
};

const calc_v = (v: number[], a: number[]): number[] => {
	return <number[]>add(v, multiply(a, dt));
};

const calc_r = (r: number[], v: number[]): number[] => {
	return <number[]>add(r, multiply(v, dt));
};

const closest_mass = (r: number[]): Mass => {
	let closest = masses[0];
	let closest_dist = abs(subtract(r, masses[0].pos));
	masses.forEach((mass) => {
		const dist = abs(subtract(r, mass.pos));
		if (dist < closest_dist) {
			closest = mass;
			closest_dist = dist;
		}
	});
	return closest;
};

const integrate = (r: number[], draw: boolean = false): number[] => {
	let v = [0, 0, 0];
	let steps = 0;
	if (draw) {
		ctx.lineWidth = 1;
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(r[0], r[1]);
	}
	while (true) {
		const a = calc_a(r, v);
		v = calc_v(v, a);
		r = calc_r(r, v);
		r[2] = 0;

		if (steps > max_steps) {
			break;
		}

		if (draw) ctx.lineTo(r[0], r[1]);
		steps++;
	}

	if (draw) ctx.stroke();

	return r;
};

const mass1: Mass = { pos: [250, 300, h], m: 100, color: "#fa6670" };
const mass2: Mass = { pos: [300, 100, h], m: 300, color: "#1fc7ff" };
const mass3: Mass = { pos: [100, 200, h], m: 100, color: "#8bfa66" };

masses.push(mass1, mass2, mass3);
// GM/|r|^3 * r - b * dr/dt = d^2r/dt^2

let count = 0;
let err_count = 0;
let finals: number[][] = [];
let canvas_data: ImageData;
for (let i = 0; i < canvas.width; i += step) {
	const y = i + step / 2;
	for (let j = 0; j < canvas.height; j += step) {
		const x = j + step / 2;

		let r = [x, y, 0];
		const r_final = integrate(r);
		const closest = closest_mass(r_final);

		if ((abs(subtract(r_final, closest.pos)) as number) > 15) {
			err_count++;
		}

		ctx.fillStyle = closest.color;
		ctx.fillRect(x - step / 2, y - step / 2, step, step);

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
	integrate([x, y, 0], true);
});
