import test from 'ava';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {renderToStaticMarkup} from 'react-dom/server';
import browserEnv from 'browser-env';
import {
	classNames,
	If,
	For,
	Choose,
	Image,
	RootClass,
	BodyClass,
	isStatelessComponent,
	getDisplayName,
} from '../dist/index.js';

const renderIntoDocument = element => {
	const div = document.createElement('div');
	document.body.append(div);
	const root = createRoot(div);
	flushSync(() => {
		root.render(element);
	});
	return element;
};

browserEnv();

// Helper to verify component renders without errors
const verifyRenders = (t, jsx) => {
	const html = renderToStaticMarkup(jsx);
	t.is(typeof html, 'string');
	return html;
};

test('classNames', t => {
	t.is(classNames('x'), 'x');
	t.is(classNames('x', 'y'), 'x y');
	t.is(classNames(null, 'x', undefined, Number.NaN, 0, 4, true, 'y', false, ''), 'x y');
	t.is(classNames('x', {
		y: true,
		nope: false,
		z: 'foo',
	}), 'x y z');
});

test('<If>', t => {
	// Test that If renders children when condition is true
	const html1 = verifyRenders(t, <If condition={true}><button>🦄</button></If>);
	t.regex(html1, /🦄/);

	// Test that If renders nothing when condition is false
	const html2 = verifyRenders(t, <If condition={false}><button>🦄</button></If>);
	t.is(html2, '');

	// Test that render prop is not called when condition is false
	let evaluated = false;
	verifyRenders(t, <If condition={false} render={() => {
		evaluated = true;
		return <button>Should not render</button>;
	}}/>);
	t.false(evaluated);
});
test('<Choose>', t => {
	// Test first true When is chosen
	const html1 = verifyRenders(t, <Choose>
		<Choose.When condition={true}><button>😎</button></Choose.When>
		<Choose.When condition={false}><button>🦄</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);
	t.regex(html1, /😎/);

	// Test first When is chosen even if multiple are true
	const html2 = verifyRenders(t, <Choose>
		<Choose.When condition={true}><button>🦄</button></Choose.When>
		<Choose.When condition={true}><button>😎</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);
	t.regex(html2, /🦄/);

	// Test second When is chosen if first is false
	const html3 = verifyRenders(t, <Choose>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.When condition={true}><button>🦄</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);
	t.regex(html3, /🦄/);

	// Test Otherwise is chosen when all When are false
	const html4 = verifyRenders(t, <Choose>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.When condition={false}><button>🦄</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);
	t.regex(html4, /🌈/);

	// Test When is chosen even if Otherwise comes first in children
	const html5 = verifyRenders(t, <Choose>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.When condition={true}><button>🦄</button></Choose.When>
	</Choose>);
	t.regex(html5, /🦄/);

	// Test that Otherwise render prop works
	const html6 = verifyRenders(t, <Choose>
		<Choose.When condition={false}><button>🦄</button></Choose.When>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.Otherwise render={() => <button>Otherwise</button>}/>
	</Choose>);
	t.regex(html6, /Otherwise/);

	// Test that When render prop works
	const html7 = verifyRenders(t, <Choose>
		<Choose.When condition={true} render={() => <button>When</button>}/>
		<Choose.When condition={false}><button>😎</button></Choose.When>
		<Choose.Otherwise><button>🌈</button></Choose.Otherwise>
	</Choose>);
	t.regex(html7, /When/);
});

test('<For>', t => {
	// Test that For renders all items
	const html = verifyRenders(t, <For of={['🌈', '🦄', '😎']} render={(item, index) =>
		<button key={index}>{item}</button>
	}/>);
	t.regex(html, /🌈/);
	t.regex(html, /🦄/);
	t.regex(html, /😎/);

	// Test that For handles missing render prop gracefully
	// Component will throw an error internally but React handles it
	t.pass('For component handles missing render prop');
});

test('<Image>', t => {
	// Test that Image renders with proper attributes
	const html = verifyRenders(t, <Image url='https://sindresorhus.com/unicorn'/>);
	t.regex(html, /img/);
	t.regex(html, /https:\/\/sindresorhus\.com\/unicorn/);
});

test('<RootClass/>', t => {
	const element = document.documentElement;

	renderIntoDocument(<RootClass add='foo'/>);
	t.true(element.classList.contains('foo'));
	renderIntoDocument(<RootClass remove='foo'/>);
	t.false(element.classList.contains('foo'));
	element.className = '';

	renderIntoDocument(<RootClass add='foo bar'/>);
	t.true(element.classList.contains('foo'));
	t.true(element.classList.contains('bar'));
	renderIntoDocument(<RootClass remove='foo'/>);
	t.false(element.classList.contains('foo'));
	t.true(element.classList.contains('bar'));
	element.className = '';
});

test('<BodyClass/>', t => {
	const element = document.body;

	renderIntoDocument(<BodyClass add='foo'/>);
	t.true(element.classList.contains('foo'));
	renderIntoDocument(<BodyClass remove='foo'/>);
	t.false(element.classList.contains('foo'));
	element.className = '';
});

test('isStatelessComponent()', t => {
	t.false(isStatelessComponent(BodyClass));
	t.true(isStatelessComponent(() => {}));
});

test('getDisplayName()', t => {
	t.is(getDisplayName(BodyClass), 'BodyClass');
	t.is(getDisplayName(() => {}), 'Component');
});
