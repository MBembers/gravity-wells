export function add(v1: number[], v2: number[]): number[] {
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
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
