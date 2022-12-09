import {Component, createRef} from 'preact';

import '../css/modal.css';

export default class Modal extends Component {
	overlayRef = createRef();
	
	constructor(props) {
		super(props);
		
		this.state = {
			render: props.open ?? false,
			show: false
		};
		this.timeout = null;
	}
	
	onTimeout = () => {
		this.setState({render: false});
	};
	
	onClick = (event) => {
		// Filter click events to only those that target the overlay directly
		if (event.target == this.overlayRef.current) {
			if (this.props.onClick) {
				this.props.onClick(event);
			}
		}
	};
	
	componentDidMount() {
		if (this.props.open) {
			this.setState({show: true});
		}
	}
	
	componentDidUpdate(previousProps) {
		if (this.props.open !== previousProps.open) {
			if (this.props.open) {
				if (this.timeout !== null) {
					clearTimeout(this.timeout);
				}
				
				this.setState({render: true});
			} else {
				this.timeout = setTimeout(this.onTimeout, 200);
			}
		}
	}
	
	render() {
		if (!this.state.render) {
			return null;
		}
		
		const classList = ['modal', 'overlay'];
		if (this.props.open) {
			classList.push('open');
		}
		
		return <div ref={this.overlayRef} class={classList.join(' ')} onClick={this.onClick}>
			{this.props.children}
		</div>;
	}
}
