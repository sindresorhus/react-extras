/* eslint-disable no-unused-vars */
import test from 'ava';
import React from 'react';
import render from 'react-test-renderer';
import {If} from '..';

const snapshotJSX = (t, jsx) => t.snapshot(render.create(jsx).toJSON());

test('<If/>', t => {
	snapshotJSX(t, <If condition={true}><button>🦄</button></If>);
	snapshotJSX(t, <If condition={false}><button>🦄</button></If>);
});
