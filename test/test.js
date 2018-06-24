/* eslint-disable no-unused-vars, no-return-assign */
import {serial as test} from 'ava';
import React from 'react';
import {renderIntoDocument} from 'react-dom/test-utils';
import render from 'react-test-renderer';
import browserEnv from 'browser-env';
import { // eslint-disable-line unicorn/import-index
	classNames,
	If,
	For,
	Choose,
	RootClass,
	BodyClass,
	isStatelessComponent,
	getDisplayName
} from '../index';

browserEnv();

const snapshotJSX = (t, jsx) => t.snapshot(render.create(jsx).toJSON());

test('classNames', t => {
	t.is(classNames('x'), 'x');
	t.is(classNames('x', 'y'), 'x y');
	t.is(classNames(null, 'x', undefined, NaN, 0, 4, true, 'y', false, ''), 'x y');
	t.is(classNames('x', {
		y: true,
		nope: false,
		z: 'foo'
	}), 'x y z');
});

test('<If>', t => {
	snapshotJSX(t, <If condition={true}><button>🦄</button></If>);
	snapshotJSX(t, <If condition={false}><button>🦄</button></If>);

	let evaluated = false;
	snapshotJSX(t, <If condition={false} render={() => (
		<button>{evaluated = true}</button>
	)}/>);
	t.false(evaluated);
});

test('<Choose>', t => {
	snapshotJSX(t, <Choose>
		<Choose.When condition={true}><button>😎</button></Choose.When>
		<Choose.When condition={false}><button>🦄</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);

	snapshotJSX(t, <Choose>
		<Choose.When condition={true}><button>🦄</button></Choose.When>
		<Choose.When condition={true}><button>😎</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);

	snapshotJSX(t, <Choose>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.When condition={true}><button>🦄</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);

	snapshotJSX(t, <Choose>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.When condition={false}><button>🦄</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);

	snapshotJSX(t, <Choose>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.When condition={true}><button>🦄</button></Choose.When>
	</Choose>);

	let evaluated = false;
	snapshotJSX(t, <Choose>
		<Choose.When condition={false}><button>🦄</button></Choose.When>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.Otherwise render={() => (
			<button>{evaluated = true}</button>
		)}/>
	</Choose>);
	t.true(evaluated);

	evaluated = false;
	snapshotJSX(t, <Choose>
		<Choose.When condition={true} render={() => (
			<button>{evaluated = true}</button>
		)}/>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);
	t.true(evaluated);
});

test('<For>', t => {
	snapshotJSX(t, <For of={['🌈', '🦄', '😎']} render={(item, index) =>
		<button key={index}>{item}</button>
	}/>);

	const error = t.throws(() => snapshotJSX(t, <For of={['🌈', '🦄', '😎']}/>), Error);
	error.message = error.message.replace(/(\n|\r| +(?= ))/g, '');

	const expectedErrorMessage = (
		'Warning: Failed prop type: The prop `render` is marked as required ' +
		'in `For`, but its value is `undefined`. in For'
	);
	t.is(error.message, expectedErrorMessage);
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

test('isStatelessComponent()', t => {
	t.false(isStatelessComponent(BodyClass));
	t.true(isStatelessComponent(() => {}));
});

test('getDisplayName()', t => {
	t.is(getDisplayName(BodyClass), 'BodyClass');
	t.is(getDisplayName(() => {}), 'Component');
});
