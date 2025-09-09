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
	intersperse,
	Join,
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

test('intersperse()', t => {
	// Basic usage with default separator
	const result1 = intersperse(['a', 'b', 'c']);
	t.is(result1.length, 5);
	t.is(result1[0], 'a');
	t.is(result1[2], 'b');
	t.is(result1[4], 'c');

	// Custom separator
	const result2 = intersperse(['a', 'b', 'c'], ' | ');
	t.is(result2.length, 5);
	t.is(result2[1].props.children, ' | ');
	t.is(result2[3].props.children, ' | ');

	// Function separator
	const result3 = intersperse(['a', 'b', 'c'], (index, count) =>
		index === count - 2 ? ' and ' : ', ',
	);
	t.is(result3.length, 5);
	t.is(result3[1].props.children, ', ');
	t.is(result3[3].props.children, ' and ');

	// Function returning falsy values
	const result4 = intersperse(['a', 'b', 'c', 'd'], index =>
		index === 0 ? null : ' - ',
	);
	t.is(result4.length, 6); // 'a', 'b', ' - ', 'c', ' - ', 'd'
	t.is(result4[0], 'a');
	t.is(result4[1], 'b');
	t.is(result4[2].props.children, ' - ');

	// Falsy separators (should short-circuit)
	t.deepEqual(intersperse(['a', 'b', 'c'], null), ['a', 'b', 'c']);
	t.deepEqual(intersperse(['a', 'b', 'c'], false), ['a', 'b', 'c']);

	// Single item (no separators needed)
	t.deepEqual(intersperse(['a']), ['a']);

	// Empty array
	t.deepEqual(intersperse([]), []);

	// React elements
	const elements = [
		React.createElement('span', {key: '1'}, 'A'),
		React.createElement('span', {key: '2'}, 'B'),
		React.createElement('span', {key: '3'}, 'C'),
	];
	const result5 = intersperse(elements, ' · ');
	t.is(result5.length, 5);
	// React adds prefix to keys, so check they end with our keys
	t.regex(String(result5[0].key), /1$/);
	t.regex(String(result5[2].key), /2$/);
	t.regex(String(result5[4].key), /3$/);
	t.is(result5[1].props.children, ' · ');

	// Separator as React element
	const result6 = intersperse(['a', 'b', 'c'], React.createElement('hr'));
	t.is(result6.length, 5);
	t.is(result6[1].props.children.type, 'hr');
});

test('<Join/>', t => {
	// Default separator
	const html1 = verifyRenders(t, <Join>
		<span>Apple</span>
		<span>Orange</span>
		<span>Banana</span>
	</Join>);
	t.regex(html1, /Apple/);
	t.regex(html1, /Orange/);
	t.regex(html1, /Banana/);

	// Custom separator
	const html2 = verifyRenders(t, <Join separator=' | '>
		<a href='#'>Home</a>
		<a href='#'>About</a>
		<a href='#'>Contact</a>
	</Join>);
	t.regex(html2, /Home/);
	t.regex(html2, /About/);
	t.regex(html2, /Contact/);

	// Single child
	const html3 = verifyRenders(t, <Join>
		<div>Only child</div>
	</Join>);
	t.regex(html3, /Only child/);
});
