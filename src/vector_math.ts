export function add(v1: number[], v2: number[]): number[] {
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

export function add3(v1: number[], v2: number[], v3: number[]): number[] {
	return [v1[0] + v2[0] + v3[0], v1[1] + v2[1] + v3[1], v1[2] + v2[2] + v3[2]];
}

export function sum(...vectors: number[][]): number[] {
	let sum = [0, 0, 0];
	vectors.forEach((v) => {
		sum = add(sum, v);
	});
	return sum;
}

export function subtract(v1: number[], v2: number[]): number[] {
	return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

export function mul(v: number[], s: number): number[] {
	return [v[0] * s, v[1] * s, v[2] * s];
}

export function divide(v: number[], s: number): number[] {
	return [v[0] / s, v[1] / s, v[2] / s];
}

export function abs(v: number[]): number {
	return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}
