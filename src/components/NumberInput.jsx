import { Component } from 'preact';

export default class NumberInput extends Component {
	constructor() {
		super();

		this.state = {
			type: 'number',
			value: 0,
		};
	}

	onInput = (event) => {
		// this.setState({
		// 	luck: Math.max(1, Math.min(100, parseInt(event.target.value, 10)))
		// });
		if (
			event.target.type == 'number'
			|| event.target.dataset.type == 'number'
		) {
			let value = this.clampNumber(
				event.target,
				this.parseNumber(event.target),
			);

			this.setState(
				{
					[event.target.name]: value,
				},
				() => {
					if (event.target.dataset.postfix) {
						event.target.selectionStart = Math.min(
							value.toString().length,
							event.target.selectionStart,
						);
						event.target.selectionEnd = Math.min(
							value.toString().length,
							event.target.selectionEnd,
						);
					}
				},
			);
		} else if (event.target.type == 'checkbox') {
			this.setState({
				[event.target.name]: event.target.checked,
			});
		} else {
			console.log(event.target.name, event.target.value);
			this.setState({
				[event.target.name]: event.target.value,
			});
		}
	};

	onKeydown = (event) => {
		if (
			event.target.type == 'number'
			|| event.target.dataset.type == 'number'
		) {
			if (event.key == 'ArrowDown' || event.key == 'ArrowUp') {
				event.preventDefault();
				let value = this.parseNumber(event.target);
				value = this.clampNumber(
					event.target,
					value + (event.key == 'ArrowDown' ? -1 : 1),
				);

				this.setState(
					{
						[event.target.name]: value,
					},
					() => {
						if (event.target.dataset.postfix) {
							event.target.selectionStart = Math.min(
								value.toString().length,
								event.target.selectionStart,
							);
							event.target.selectionEnd = Math.min(
								value.toString().length,
								event.target.selectionEnd,
							);
						}
					},
				);
			}
		}
	};

	render() {
		return (
			<input
				style={this.props.style}
				type={this.state.type}
				value={this.state.value}
				onInput={this.onInput}
				onKeydown={this.onKeydown}
			/>
		);
	}
}
