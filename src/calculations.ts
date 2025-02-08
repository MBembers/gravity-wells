import { bogacki, constants } from "./consts.ts";
import { Constants, Mass } from "./types.ts";
import { add, abs, mul, subtract, add3, sum } from "./vector_math.ts";

export function calc_a(r: number[], v: number[], masses: Mass[]): number[] {
	let a = [0, 0, 0];
	for (let i = 0; i < masses.length; i++) {
		const mass = masses[i];

		let r_rel = subtract(mass.pos, r);
		const dist = abs(r_rel);
		let temp_a = mul(r_rel, 1 / (dist * dist * dist));
		temp_a = mul(temp_a, constants.G * mass.m);
		temp_a = subtract(temp_a, mul(v, constants.b));
		a = <number[]>add(a, temp_a);
	}
	return <number[]>a;
}

export function calc_v(r: number[], v: number[]): number[] {
	return <number[]>v;
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

// TODO fix adaptive step size
export function integrate(r: number[], masses: Mass[], ctx: CanvasRenderingContext2D, draw: boolean = false): number[] {
	if (draw) {
		ctx.lineWidth = 1;
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(r[0], r[1]);
	}

	let tol = 1e-2;
	let steps = 0;
	let rejected = 0;
	let t_max = 100;
	let i = 0;
	let h = 0.4;

	let t = [0];
	let r_arr = [r];
	let v_arr = [[0, 0, 0]];

	// DEBUG
	let h_tot = 0;

	while (true) {
		if (t[i] + h == t[i] || steps > constants.max_steps) {
			// console.log("end", steps, rejected);
			break;
		}
		if (h < 1e-5) {
			console.log("stepsize too small!");
			break;
		}

		let [t_new, r_high, r_low, v_high, v_low] = rk_adaptive_step(
			calc_v,
			calc_a,
			t[i],
			r_arr[i],
			v_arr[i],
			h,
			bogacki.s,
			bogacki.matrix,
			bogacki.w_low,
			bogacki.w_hi,
			bogacki.nodes,
			masses
		);
		let r_diff = subtract(r_low, r_high);
		let v_diff = subtract(v_high, v_low);
		let err_vector = [abs(r_diff), abs(v_diff), 0];
		let err = abs(err_vector);

		let curr_vector = [abs(r_arr[i]), abs(v_arr[i]), 0];
		let maxerr = tol * (1 + abs(curr_vector));

		// if (steps % 20 == 0) {
		// 	console.log("size: ", h);
		// 	// console.log("curr last: ", r_arr[i], v_arr[i]);
		// 	// console.log(t_new[0], r_low, r_high, v_low, v_high);
		// 	console.log("err | maxerr: ", err, maxerr);
		// }

		if (err < maxerr) {
			t.push(t_new[0]);
			r_arr.push(r_high);
			v_arr.push(v_high);
			i++;
			if (draw) ctx.lineTo(r_arr[i][0], r_arr[i][1]);
			steps++;
			h_tot += h;
		} else {
			rejected++;
		}

		let q = 0.8 * Math.pow(maxerr / err, 1 / bogacki.order);
		q = Math.min(q, 4);
		h = Math.min(q * h, t_max - t[i]);
	}

	if (draw) ctx.stroke();

	return r_arr[r_arr.length - 1];
}

// dr/dt = v  dv/dt = a
function rk4_step(x: number[], v: number[], masses: Mass[]): number[][] {
	const dx_1 = mul(v, constants.h);
	const dv_1 = mul(calc_a(x, v, masses), constants.h);
	dv_1[2] = 0;

	const dx_2 = mul(add(v, mul(dv_1, 1 / 2)), constants.h);
	const dv_2 = mul(calc_a(add(x, mul(dx_1, 1 / 2)), add(v, mul(dv_1, 1 / 2)), masses), constants.h);
	dv_2[2] = 0;

	const dx_3 = mul(add(v, mul(dv_2, 1 / 2)), constants.h);
	const dv_3 = mul(calc_a(add(x, mul(dx_2, 1 / 2)), add(v, mul(dv_2, 1 / 2)), masses), constants.h);
	dv_3[2] = 0;

	const dx_4 = mul(add(v, dv_3), constants.h);
	const dv_4 = mul(calc_a(add(x, dx_3), add(v, dv_3), masses), constants.h);
	dv_4[2] = 0;

	const dx = mul(add(dx_1, add(mul(dx_2, 2), add(mul(dx_3, 2), dx_4))), 1 / 6);
	const dv = mul(add(dv_1, add(mul(dv_2, 2), add(mul(dv_3, 2), dv_4))), 1 / 6);
	dx[2] = 0;
	dv[2] = 0;
	return [add(x, dx), add(v, dv)];
}

function rk_adaptive_step(
	f: Function,
	g: Function,
	t: number,
	r_0: number[],
	v_0: number[],
	h: number,
	s: number,
	a: number[][],
	b_l: number[],
	b: number[],
	c: number[],
	masses: Mass[]
) {
	// k[0] - r
	// l[1] - v
	// f = calc_v
	// g = calc_a
	let t_next = t + h;

	let r_1 = [0, 0, 0];
	let v_1 = [0, 0, 0];
	let r_1s = [0, 0, 0];
	let v_1s = [0, 0, 0];

	let k = new Array(s).fill(0);
	let l = new Array(s).fill(0);

	// console.log("RK STEP R0, V0: ", r_0, v_0);
	k[0] = mul(f(r_0, v_0), h);
	l[0] = mul(g(r_0, v_0, masses), h);
	l[0][2] = 0;
	k[1] = mul(f(add(r_0, mul(k[0], 1 / 2)), add(v_0, mul(l[0], 1 / 2))), h);
	l[1] = mul(g(add(r_0, mul(k[0], 1 / 2)), add(v_0, mul(l[0], 1 / 2)), masses), h);
	l[1][2] = 0;
	k[2] = mul(f(add(r_0, mul(k[1], 3 / 4)), add(v_0, mul(l[1], 3 / 4))), h);
	l[2] = mul(g(add(r_0, mul(k[1], 3 / 4)), add(v_0, mul(l[1], 3 / 4)), masses), h);
	l[2][2] = 0;
	r_1 = add(r_0, add3(mul(k[0], 2 / 9), mul(k[1], 1 / 3), mul(k[2], 4 / 9)));
	v_1 = add(v_0, add3(mul(l[0], 2 / 9), mul(l[1], 1 / 3), mul(l[2], 4 / 9)));
	k[3] = mul(f(r_1, v_1), h);
	l[3] = mul(g(r_1, v_1, masses), h);
	l[3][2] = 0;

	r_1s = sum(r_0, mul(k[0], -5 / 72), mul(k[1], 1 / 12), mul(k[2], 1 / 9), mul(k[3], -1 / 8));
	v_1s = sum(v_0, mul(l[0], -5 / 72), mul(l[1], 1 / 12), mul(l[2], 1 / 9), mul(l[3], -1 / 8));

	return [[t_next], r_1, r_1s, v_1, v_1s];
}
