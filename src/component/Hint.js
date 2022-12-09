import {Component} from 'preact';

import '../css/hint.css';

export default class Hint extends Component {
	constructor() {
		super();
		
		this.state = {
			open: false
		};
	}
	
	show = () => {
		this.setState({open: true});
	};
	
	hide = () => {
		this.setState({open: false});
	};
	
	render() {
		const classList = ['modal', 'overlay'];
		if (this.props.open) {
			classList.push('open');
		}
		
		return <div class='hint-wrapper' onmouseover={this.show} onmouseout={this.hide}>
			{this.props.children}
			<div class={`hint${this.state.open ? ' open' : ''}`}>
				{this.props.content}
			</div>
		</div>;
	}
}
