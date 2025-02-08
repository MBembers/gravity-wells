import { Constants } from "./types";

export const bogacki = {
	matrix: [[], [1 / 2], [0, 3 / 4], [2 / 9, 1 / 3, 4 / 9]],
	order: 3,
	s: 4,
	w_low: [-5 / 72, 1 / 12, 1 / 9, -1 / 8],
	w_hi: [2 / 9, 1 / 3, 4 / 9, 0],
	nodes: [0, 1 / 2, 3 / 4, 1],
};

const size = 10;
const h = 0.2;
const max_steps = 300;
const G = 6.674 * 10;
const b = 0.1;
const epsilon = 0.1;
export const constants: Constants = { h, G, b, epsilon, max_steps, size };
