/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

export const If = props => props.condition ? (props.render ? props.render() : props.children) : null;
If.propTypes = {
	condition: PropTypes.bool.isRequired,
	children: PropTypes.node,
	render: PropTypes.func
};

class ElementClass extends React.PureComponent {
	componentWillMount() {
		const {add, remove} = this.props;
		const {classList} = this.element;

		if (add) {
			classList.add(...add.trim().split(' '));
		}

		if (this.props.remove) {
			classList.remove(...remove.trim().split(' '));
		}
	}

	componentWillUnmount() {
		const {add, remove} = this.props;
		const {classList} = this.element;

		if (this.props.add) {
			classList.remove(...add.trim().split(' '));
		}

		if (this.props.remove) {
			classList.add(...remove.trim().split(' '));
		}
	}

	render() {
		return null;
	}
}
ElementClass.propTypes = {
	add: PropTypes.string,
	remove: PropTypes.string
};

export class RootClass extends ElementClass {
	constructor() {
		super();
		this.element = document.documentElement;
	}
}
RootClass.propTypes = ElementClass.propTypes;

export class BodyClass extends ElementClass {
	constructor() {
		super();
		this.element = document.body;
	}
}
BodyClass.propTypes = ElementClass.propTypes;
