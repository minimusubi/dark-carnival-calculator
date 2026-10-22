import { Component } from 'preact';
import Image from './Image.jsx';
import Hint from './Hint.jsx';
import '../css/options.css';

export default class StatusOptions extends Component {
	parseNumber = (input) => {
		let value = input.value;

		if (input.dataset.postfix) {
			let index = value.indexOf(input.dataset.postfix);
			value = value.substring(0, index == -1 ? value.length : index);
		}

		value = parseInt(value, 10);
		if (isNaN(value)) {
			value = null;
		}

		return value;
	};

	clampNumber = (input, value) => {
		return Math.max(
			input.min?.length > 0 ? parseInt(input.min, 10) : -Infinity,
			Math.min(
				input.max?.length > 0 ? parseInt(input.max, 10) : Infinity,
				value,
			),
		);
	};

	onInput = (event) => {
		if (
			event.target.type == 'number'
			|| event.target.dataset.type == 'number'
		) {
			let value = this.parseNumber(event.target);
			if (value == null) {
				return;
			}

			value = this.clampNumber(event.target, value);

			this.props.onChange(
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
			this.props.onChange({
				[event.target.name]: event.target.checked,
			});
		} else {
			this.props.onChange({
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

				let selectionStart = event.target.selectionStart;
				let selectionEnd = event.target.selectionEnd;
				let value = this.parseNumber(event.target);
				value = this.clampNumber(
					event.target,
					value + (event.key == 'ArrowDown' ? -1 : 1),
				);

				if (this.state[event.target.name] != value) {
					this.props.onChange(
						{
							[event.target.name]: value,
						},
						() => {
							if (event.target.dataset.postfix) {
								event.target.selectionStart = Math.min(
									value.toString().length,
									selectionStart,
								);
								event.target.selectionEnd = Math.min(
									value.toString().length,
									selectionEnd,
								);
							}
						},
					);
				}
			}
		}
	};

	render() {
		return (
			<div class='options'>
				<Hint
					content={
						<span>
							Enter the{' '}
							<span style={{ fontStyle: 'italic' }}>total</span>{' '}
							luck, as shown on your profile
						</span>
					}
				>
					<div class='two-tone'>
						<label>
							<Image src='../assets/luck.png' />
						</label>
						<input
							style={{ width: '48px' }}
							name='totalLuck'
							type='number'
							value={this.props.options.totalLuck}
							onInput={this.onInput}
							onKeydown={this.onKeydown}
						/>
					</div>
				</Hint>
				<Hint
					content={
						<span>
							Enter the{' '}
							<span style={{ fontStyle: 'italic' }}>total</span>{' '}
							gold multiplier, as shown on your profile
						</span>
					}
				>
					<div class='two-tone'>
						<label>
							<Image src='../assets/gold-multiplier.png' />
						</label>
						<input
							style={{ width: '48px' }}
							name='goldMultiplier'
							min='-50'
							max='38'
							data-type='number'
							data-postfix='%'
							value={`${this.props.options.goldMultiplier}%`}
							onInput={this.onInput}
							onKeydown={this.onKeydown}
						/>
					</div>
				</Hint>
				<Hint
					content={
						<span>
							Enable if you are encouraged{' '}
							<span style={{ fontStyle: 'italic' }}>
								(unverified accuracy)
							</span>
						</span>
					}
				>
					<div class='two-tone'>
						<label>
							<Image src='../assets/encourage.png' />
						</label>
						<div class='input'>
							<input
								name='encouraged'
								type='checkbox'
								checked={this.props.options.encouraged}
								onInput={this.onInput}
							/>
						</div>
					</div>
				</Hint>
				<Hint content={<span>Enable if you are shocked</span>}>
					<div class='two-tone'>
						<label>
							<Image src='../assets/shock.png' />
						</label>
						<div class='input'>
							<input
								name='shocked'
								type='checkbox'
								checked={this.props.options.shocked}
								onInput={this.onInput}
							/>
						</div>
					</div>
				</Hint>
				<Hint content={<span>Enable if you are scared</span>}>
					<div class='two-tone'>
						<label>
							<Image src='../assets/scare.png' />
						</label>
						<div class='input'>
							<input
								name='scared'
								type='checkbox'
								checked={this.props.options.scared}
								onInput={this.onInput}
							/>
						</div>
					</div>
				</Hint>
				<Hint
					content={
						<span>
							Enable if you have Droll Distraction{' '}
							<span style={{ fontStyle: 'italic' }}>
								(unverified accuracy)
							</span>
						</span>
					}
				>
					<div class='two-tone'>
						<label>
							<Image src='../assets/distraction.png' />
						</label>
						<div class='input'>
							<input
								name='drollDistracted'
								type='checkbox'
								checked={this.props.options.drollDistracted}
								onInput={this.onInput}
							/>
						</div>
					</div>
				</Hint>
				<Hint
					content={
						<span>
							Enable if it is storming{' '}
							<span style={{ fontStyle: 'italic' }}>
								(unverified accuracy)
							</span>
						</span>
					}
				>
					<div class='two-tone'>
						<label>
							<Image src='../assets/storm.png' />
						</label>
						<div class='input'>
							<input
								name='storming'
								type='checkbox'
								checked={this.props.options.storming}
								onInput={this.onInput}
							/>
						</div>
					</div>
				</Hint>
			</div>
		);
	}
}
