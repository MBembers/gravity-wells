import { Constants, Mass } from "./types.ts";
import { add, abs, multiply, subtract } from "./vector_math.ts";

const calc_a = (r: number[], v: number[], masses: Mass[], consts: Constants): number[] => {
	let a = [0, 0, 0];
	for (let i = 0; i < masses.length; i++) {
		const mass = masses[i];

		let r_rel = subtract(mass.pos, r);
		const dist = abs(r_rel);
		let temp_a = multiply(r_rel, 1 / Math.pow(dist, 3));
		temp_a = multiply(temp_a, consts.G * mass.m);
		temp_a = subtract(temp_a, multiply(v, consts.b));
		a = <number[]>add(a, temp_a);
	}
	return <number[]>a;
};

const calc_v = (v: number[], a: number[], dt: number): number[] => {
	return <number[]>add(v, multiply(a, dt));
};

const calc_r = (r: number[], v: number[], dt: number): number[] => {
	return <number[]>add(r, multiply(v, dt));
};

const closest_mass = (r: number[], masses: Mass[]): Mass => {
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
