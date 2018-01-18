/* eslint-disable no-unused-vars */
import React from 'react';

export const If = ({condition, children, ...rest}) => condition ? <div {...rest}>{children}</div> : null;
