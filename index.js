/* eslint-disable no-unused-vars */
import React from 'react';

export const If = ({condition, children, tag: Tag, ...rest}) =>
	condition ? <Tag {...rest}>{children}</Tag> : null;

If.defaultProps = {
	tag: 'div'
};
