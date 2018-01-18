/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

export const If = props => props.condition ? props.children : null;
If.propTypes = {
	condition: PropTypes.bool.isRequired,
	children: PropTypes.node
};
