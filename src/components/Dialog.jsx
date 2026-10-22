import { Component } from 'preact';
import Modal from './Modal.jsx';

export default class Dialog extends Component {
	onOverlayClick = (event) => {
		event.preventDefault();

		if (this.props.onDismiss) {
			this.props.onDismiss('cancel');
		}
	};

	onClick = (event) => {
		event.preventDefault();

		if (this.props.onDismiss) {
			this.props.onDismiss('ok');
		}
	};

	render() {
		return (
			<Modal
				open={this.props.open}
				onClick={this.onClick}
			>
				<div
					class='dialog'
					style={this.props.style}
				>
					<header>
						<h1>{this.props.title}</h1>
					</header>
					<main>{this.props.children}</main>
					<footer>
						{this.props.leftActions}
						<div style={{ flex: 1 }} />
						<button onClick={this.onClick}>OK</button>
					</footer>
				</div>
			</Modal>
		);
	}
}
