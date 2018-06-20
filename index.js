import React from 'react';
import PropTypes from 'prop-types';
import _autoBind from './auto-bind';
import _classNames from './class-names';

export const autoBind = _autoBind.react;

export const classNames = _classNames;

export const isStatelessComponent = Component => !(
	typeof Component.prototype !== 'undefined' &&
	typeof Component.prototype.render === 'function'
);

export const getDisplayName = Component => Component.displayName || Component.name || 'Component';

export const canUseDOM = typeof window !== 'undefined' && 'document' in window && 'createElement' in window.document;

export const If = props => props.condition ? (props.render ? props.render() : props.children) : null;
If.propTypes = {
	condition: PropTypes.bool.isRequired,
	children: PropTypes.node,
	render: PropTypes.func
};

export const Choose = props => {
	let when = null;
	let otherwise = null;

	React.Children.forEach(props.children, children => {
		if (children.props.condition === undefined) {
			otherwise = children;
		} else if (!when && children.props.condition === true) {
			when = children;
		}
	});

	return when || otherwise;
};
Choose.propTypes = {
	children: PropTypes.node
};

Choose.When = If;

Choose.Otherwise = ({render, children}) => render ? render() : children;
Choose.Otherwise.propTypes = {
	children: PropTypes.node,
	render: PropTypes.func
};

export const For = ({render, of}) => of.map((item, index) => render(item, index));
For.propTypes = {
	of: PropTypes.array.isRequired,
	render: PropTypes.func
};

class ElementClass extends React.PureComponent {
	componentWillMount() {
		const {add, remove} = this.props;
		const {classList} = this.element;

		if (add) {
			classList.add(...add.trim().split(' '));
		}

		if (remove) {
			classList.remove(...remove.trim().split(' '));
		}
	}

	componentWillUnmount() {
		const {add, remove} = this.props;
		const {classList} = this.element;

		if (add) {
			classList.remove(...add.trim().split(' '));
		}

		if (remove) {
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
