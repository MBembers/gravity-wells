import * as math from "mathjs";

const canvas = document.querySelector("#sim-canvas") as HTMLCanvasElement;
canvas.width = 500;
canvas.height = 500;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

interface Mass {
	pos: [number, number, number];
	m: number;
}

const step = 10;
const G = 6.674 * Math.pow(10, -11);
const dt = 0.1;
const b = 0.1;
const masses: Mass[] = [];

// TODO: types ????
const calc_a = (r: math.MathType, v: math.MathType): math.MathType => {
	let a: math.MathType = [0, 0, 0];
	masses.forEach((mass) => {
		const dist = math.distance(r, mass.pos);
		let temp_a = math.divide(r, math.pow(dist, 3));
		temp_a = math.multiply(G * mass.m, a);
		temp_a = math.subtract(a, math.multiply(b, v));
		a = math.add(a, temp_a);
	});
	return a;
};

masses.push({ position: [canvas.width / 2, canvas.height / 2, 5], mass: 1000 });
// GM/|r|^3 * r - b * dr/dt = d^2r/dt^2

for (let i = 0; i < canvas.width; i += step) {
	for (let j = 0; j < canvas.height; j += step) {
		const x = j * step + step / 2;
		const y = i * step + step / 2;

		let r = [x, y, 0];
		let v = [0, 0, 0];
		let a = [0, 0, 0];
	}
}
