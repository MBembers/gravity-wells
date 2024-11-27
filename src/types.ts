export interface Mass {
	pos: [number, number, number];
	m: number;
	color: string;
}

export interface Constants {
	dt: number;
	G: number;
	b: number;
	epsilon: number;
	max_steps: number;
	size: number;
}
