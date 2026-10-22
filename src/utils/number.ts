export function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

export function round(value: number) {
	return value > 0 ? Math.round(value) : -Math.round(-value);
}

export function fix(value: number, places: number) {
	let display = (round(value * 10 ** places) / 10 ** places).toString();

	if (places > 0) {
		let decimalIndex = display.indexOf('.');

		if (places > 0 && decimalIndex == -1) {
			display = `${display}.`;
			decimalIndex = display.length - 1;
		}

		return (
			display + '0'.repeat(places - (display.length - decimalIndex - 1))
		);
	}

	return display;
}
