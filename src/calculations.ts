import { Constants, Mass } from "./types.ts";
import { add, abs, mul, subtract } from "./vector_math.ts";

export function calc_a(r: number[], v: number[], masses: Mass[], consts: Constants): number[] {
	let a = [0, 0, 0];
	for (let i = 0; i < masses.length; i++) {
		const mass = masses[i];

		let r_rel = subtract(mass.pos, r);
		const dist = abs(r_rel);
		let temp_a = mul(r_rel, 1 / Math.pow(dist, 3));
		temp_a = mul(temp_a, consts.G * mass.m);
		temp_a = subtract(temp_a, mul(v, consts.b));
		a = <number[]>add(a, temp_a);
	}
	return <number[]>a;
}

export function calc_v(v: number[], a: number[], dt: number): number[] {
	return <number[]>add(v, mul(a, dt));
}

export function calc_r(r: number[], v: number[], dt: number): number[] {
	return <number[]>add(r, mul(v, dt));
}

export function closest_mass(r: number[], masses: Mass[]): Mass {
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
}

export function integrate(r: number[], masses: Mass[], consts: Constants, ctx: CanvasRenderingContext2D, draw: boolean = false): number[] {
	let v = [0, 0, 0];
	let steps = 0;
	if (draw) {
		ctx.lineWidth = 1;
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(r[0], r[1]);
	}
	while (true) {
		[r, v] = rk4_step(r, v, masses, consts);
		r[2] = 0;
		v[2] = 0;

		if (steps > consts.max_steps) break;

		if (draw) ctx.lineTo(r[0], r[1]);

		steps++;
	}

	if (draw) ctx.stroke();

	return r;
}

// dr/dt = v  dv/dt = a
function rk4_step(x: number[], v: number[], masses: Mass[], consts: Constants): number[][] {
	const dx_1 = mul(v, consts.h);
	const dv_1 = mul(calc_a(x, v, masses, consts), consts.h);
	dv_1[2] = 0;

	const dx_2 = mul(add(v, mul(dv_1, 1 / 2)), consts.h);
	const dv_2 = mul(calc_a(add(x, mul(dx_1, 1 / 2)), add(v, mul(dv_1, 1 / 2)), masses, consts), consts.h);
	dv_2[2] = 0;

	const dx_3 = mul(add(v, mul(dv_2, 1 / 2)), consts.h);
	const dv_3 = mul(calc_a(add(x, mul(dx_2, 1 / 2)), add(v, mul(dv_2, 1 / 2)), masses, consts), consts.h);
	dv_3[2] = 0;

	const dx_4 = mul(add(v, dv_3), consts.h);
	const dv_4 = mul(calc_a(add(x, dx_3), add(v, dv_3), masses, consts), consts.h);
	dv_4[2] = 0;

	const dx = mul(add(dx_1, add(mul(dx_2, 2), add(mul(dx_3, 2), dx_4))), 1 / 6);
	const dv = mul(add(dv_1, add(mul(dv_2, 2), add(mul(dv_3, 2), dv_4))), 1 / 6);
	dx[2] = 0;
	dv[2] = 0;
	return [add(x, dx), add(v, dv)];
}
