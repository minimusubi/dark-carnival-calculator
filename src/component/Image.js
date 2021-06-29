import {Component} from 'preact';

export default class Image extends Component {
	render() {
		let alternate;
		
		if (this.props.src !== undefined) {
			const segments = this.props.src.split('/').filter((segment) => {
				return segment.length > 0;
			});
			
			if (segments.length > 0) {
				alternate = segments[segments.length - 1];
				alternate = alternate.charAt(0).toLocaleUpperCase() + alternate.substring(1, alternate.lastIndexOf('.'));
			}
		}
		
		return <img alt={alternate} title={alternate} {...this.props} />;
	}
}
