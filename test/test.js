/* eslint-disable no-unused-vars */
import {serial as test} from 'ava';
import React from 'react';
import {renderIntoDocument} from 'react-dom/test-utils';
import render from 'react-test-renderer';
import browserEnv from 'browser-env';
import {If, RootClass, BodyClass} from '..';

browserEnv();

const snapshotJSX = (t, jsx) => t.snapshot(render.create(jsx).toJSON());

test('<If>', t => {
	snapshotJSX(t, <If condition={true}><button>🦄</button></If>);
	snapshotJSX(t, <If condition={false}><button>🦄</button></If>);
});

test('<RootClass/>', t => {
	const el = document.documentElement;

	renderIntoDocument(<RootClass add="foo"/>);
	t.true(el.classList.contains('foo'));
	renderIntoDocument(<RootClass remove="foo"/>);
	t.false(el.classList.contains('foo'));
	el.className = '';

	renderIntoDocument(<RootClass add="foo bar"/>);
	t.true(el.classList.contains('foo'));
	t.true(el.classList.contains('bar'));
	renderIntoDocument(<RootClass remove="foo"/>);
	t.false(el.classList.contains('foo'));
	t.true(el.classList.contains('bar'));
	el.className = '';
});

test('<BodyClass/>', t => {
	const el = document.body;

	renderIntoDocument(<BodyClass add="foo"/>);
	t.true(el.classList.contains('foo'));
	renderIntoDocument(<BodyClass remove="foo"/>);
	t.false(el.classList.contains('foo'));
	el.className = '';
});
