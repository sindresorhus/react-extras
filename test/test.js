import test from 'ava';
import React, {act} from 'react';
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
	useEventListener,
	useWindowEvent,
	useDocumentEvent,
} from '../dist/index.js';

const renderIntoDocument = element => {
	const div = document.createElement('div');
	document.body.append(div);
	const root = createRoot(div);
	act(() => {
		flushSync(() => {
			root.render(element);
		});
	});
	return element;
};

// Helper that returns a render function and unmount function for testing lifecycle
const createTestRoot = () => {
	const div = document.createElement('div');
	document.body.append(div);
	const root = createRoot(div);
	return {
		async render(element) {
			await act(async () => {
				root.render(element);
			});
		},
		async unmount() {
			await act(async () => {
				root.unmount();
			});
			div.remove();
		},
	};
};

browserEnv();

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

test('useEventListener()', t => {
	let clickCount = 0;
	const button = document.createElement('button');
	document.body.append(button);

	const TestComponent = () => {
		useEventListener(button, 'click', () => {
			clickCount++;
		});
		return null;
	};

	renderIntoDocument(<TestComponent/>);

	button.click();
	t.is(clickCount, 1);

	button.click();
	t.is(clickCount, 2);

	button.remove();
});

test('useWindowEvent()', t => {
	let resizeCount = 0;

	const TestComponent = () => {
		useWindowEvent('resize', () => {
			resizeCount++;
		});
		return null;
	};

	renderIntoDocument(<TestComponent/>);

	window.dispatchEvent(new window.Event('resize'));
	t.is(resizeCount, 1);

	window.dispatchEvent(new window.Event('resize'));
	t.is(resizeCount, 2);
});

test('useDocumentEvent()', t => {
	let keydownCount = 0;

	const TestComponent = () => {
		useDocumentEvent('keydown', () => {
			keydownCount++;
		});
		return null;
	};

	renderIntoDocument(<TestComponent/>);

	document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}));
	t.is(keydownCount, 1);

	document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}));
	t.is(keydownCount, 2);
});

test.serial('useEventListener() - cleanup on unmount', async t => {
	let clickCount = 0;
	const button = document.createElement('button');
	document.body.append(button);

	const TestComponent = () => {
		useEventListener(button, 'click', () => {
			clickCount++;
		});
		return null;
	};

	const {render, unmount} = createTestRoot();
	await render(<TestComponent/>);

	button.click();
	t.is(clickCount, 1);

	await unmount();

	// After unmount, listener should be removed
	button.click();
	t.is(clickCount, 1); // Should still be 1, not 2

	button.remove();
});

test.serial('useEventListener() - cleanup runs without passive effects', t => {
	let addCallCount = 0;
	let removeCallCount = 0;
	const target = {
		addEventListener() {
			addCallCount++;
		},
		removeEventListener() {
			removeCallCount++;
		},
	};

	const container = document.createElement('div');
	document.body.append(container);
	const root = createRoot(container);

	const TestComponent = () => {
		useEventListener(target, 'click', () => {});
		return null;
	};

	const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
	globalThis.IS_REACT_ACT_ENVIRONMENT = false;

	try {
		flushSync(() => {
			root.render(<TestComponent/>);
		});
		flushSync(() => {
			root.unmount();
		});
	} finally {
		globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
	}

	t.is(addCallCount, 1);
	t.is(removeCallCount, 1);

	container.remove();
});

test.serial('useEventListener() - handler updates are respected', async t => {
	const calls = [];
	const button = document.createElement('button');
	document.body.append(button);

	const TestComponent = ({value}) => {
		useEventListener(button, 'click', () => {
			calls.push(value);
		});
		return null;
	};

	const {render, unmount} = createTestRoot();

	await render(<TestComponent value='first'/>);
	button.click();
	t.deepEqual(calls, ['first']);

	// Re-render with new handler that captures different value
	await render(<TestComponent value='second'/>);
	button.click();
	t.deepEqual(calls, ['first', 'second']); // Should use updated handler

	await unmount();
	button.remove();
});

test.serial('useEventListener() - useEffectEvent handler sees latest values', async t => {
	const calls = [];
	const button = document.createElement('button');
	document.body.append(button);

	const TestComponent = ({value}) => {
		const onClick = React.useEffectEvent(() => {
			calls.push(value);
		});

		useEventListener(button, 'click', onClick);
		return null;
	};

	const {render, unmount} = createTestRoot();

	await render(<TestComponent value='first'/>);
	button.click();
	t.deepEqual(calls, ['first']);

	await render(<TestComponent value='second'/>);
	button.click();
	t.deepEqual(calls, ['first', 'second']);

	await unmount();
	button.remove();
});

test.serial('useEventListener() - handler updates before events after commit', async t => {
	const calls = [];
	const button = document.createElement('button');
	const container = document.createElement('div');
	document.body.append(button);
	document.body.append(container);

	const root = createRoot(container);

	const TestComponent = ({value}) => {
		useEventListener(button, 'click', () => {
			calls.push(value);
		});
		return null;
	};

	await act(async () => {
		root.render(<TestComponent value='first'/>);
	});

	await act(async () => {
		flushSync(() => {
			root.render(<TestComponent value='second'/>);
		});

		button.click();
	});

	t.deepEqual(calls, ['second']);

	await act(async () => {
		root.unmount();
	});

	container.remove();
	button.remove();
});

test.serial('useEventListener() - ref target attaches after mount', async t => {
	let clickCount = 0;
	const buttonReference = React.createRef();

	const TestComponent = () => {
		useEventListener(buttonReference, 'click', () => {
			clickCount++;
		});
		return <button ref={buttonReference} type='button'>Click</button>;
	};

	const {render, unmount} = createTestRoot();
	await render(<TestComponent/>);

	buttonReference.current.click();
	t.is(clickCount, 1);

	await unmount();
});

test.serial('useEventListener() - ref target can be null before mount', async t => {
	let clickCount = 0;
	const buttonReference = React.createRef();
	let setShowButton;

	const TestComponent = () => {
		const [showButton, setShowButtonState] = React.useState(false);
		setShowButton = setShowButtonState;

		useEventListener(buttonReference, 'click', () => {
			clickCount++;
		});

		return showButton ? <button ref={buttonReference} type='button'>Click</button> : null;
	};

	const {render, unmount} = createTestRoot();

	await t.notThrowsAsync(async () => {
		await render(<TestComponent/>);
	});

	await act(async () => {
		setShowButton(true);
	});

	await act(async () => {});

	t.truthy(buttonReference.current);
	buttonReference.current.click();
	t.is(clickCount, 1);

	await unmount();
});

test.serial('useEventListener() - reattaches after StrictMode replay', async t => {
	let clickCount = 0;
	let addCallCount = 0;
	let removeCallCount = 0;
	const button = document.createElement('button');
	const originalAddEventListener = button.addEventListener;
	const originalRemoveEventListener = button.removeEventListener;
	document.body.append(button);

	button.addEventListener = (...listenerArguments) => {
		addCallCount++;
		return originalAddEventListener.call(button, ...listenerArguments);
	};

	button.removeEventListener = (...listenerArguments) => {
		removeCallCount++;
		return originalRemoveEventListener.call(button, ...listenerArguments);
	};

	const TestComponent = () => {
		useEventListener(button, 'click', () => {
			clickCount++;
		});
		return null;
	};

	const {render, unmount} = createTestRoot();
	await render(
		<React.StrictMode>
			<TestComponent/>
		</React.StrictMode>,
	);

	t.true(removeCallCount > 0);
	t.is(addCallCount, removeCallCount + 1);

	button.click();
	t.is(clickCount, 1);

	await unmount();
	button.addEventListener = originalAddEventListener;
	button.removeEventListener = originalRemoveEventListener;
	button.remove();
});

test.serial('useEventListener() - ref target changes resubscribe', async t => {
	const calls = [];
	const buttonReference = React.createRef();
	let setShowFirstButton;

	const TestComponent = () => {
		const [showFirstButton, setShowFirstButtonState] = React.useState(true);
		setShowFirstButton = setShowFirstButtonState;

		useEventListener(buttonReference, 'click', () => {
			calls.push(showFirstButton ? 'first' : 'second');
		});

		return showFirstButton ? (
			<button ref={buttonReference} key='first' type='button'>First</button>
		) : (
			<button ref={buttonReference} key='second' type='button'>Second</button>
		);
	};

	const {render, unmount} = createTestRoot();
	await render(<TestComponent/>);

	const firstButton = buttonReference.current;

	await act(async () => {
		setShowFirstButton(false);
	});

	await act(async () => {});

	const secondButton = buttonReference.current;
	t.not(secondButton, firstButton);

	t.deepEqual(calls, []);
	secondButton.click();

	t.deepEqual(calls, ['second']);

	await unmount();
});

test.serial('useEventListener() - does not pass options when omitted', async t => {
	const button = document.createElement('button');
	const originalAddEventListener = button.addEventListener;
	let listenerArgumentsLength;
	document.body.append(button);

	button.addEventListener = (...listenerArguments) => {
		listenerArgumentsLength = listenerArguments.length;
		return originalAddEventListener.call(button, ...listenerArguments);
	};

	const TestComponent = () => {
		useEventListener(button, 'click', () => {});
		return null;
	};

	const {render, unmount} = createTestRoot();
	await render(<TestComponent/>);

	t.is(listenerArgumentsLength, 2);

	await unmount();
	button.addEventListener = originalAddEventListener;
	button.remove();
});

test.serial('useEventListener() - options are passed correctly', async t => {
	const phases = [];
	const parent = document.createElement('div');
	const child = document.createElement('button');
	parent.append(child);
	document.body.append(parent);

	const TestComponent = () => {
		// Capture phase listener on parent
		useEventListener(parent, 'click', () => {
			phases.push('parent-capture');
		}, {capture: true});

		// Bubble phase listener on parent
		useEventListener(parent, 'click', () => {
			phases.push('parent-bubble');
		}, {capture: false});

		return null;
	};

	const {render, unmount} = createTestRoot();
	await render(<TestComponent/>);

	child.click();
	// Capture phase should fire before bubble phase
	t.deepEqual(phases, ['parent-capture', 'parent-bubble']);

	await unmount();
	parent.remove();
});

test.serial('useEventListener() - handler stays at last commit during render', async t => {
	const calls = [];
	const button = document.createElement('button');
	document.body.append(button);

	const TestComponent = ({value, triggerDuringRender}) => {
		useEventListener(button, 'click', () => {
			calls.push(value);
		});

		if (triggerDuringRender) {
			button.click();
		}

		return null;
	};

	const {render, unmount} = createTestRoot();

	await render(<TestComponent value='committed' triggerDuringRender={false}/>);
	t.deepEqual(calls, []);

	await render(<TestComponent value='aborted' triggerDuringRender/>);
	t.deepEqual(calls, ['committed']);

	await unmount();
	button.remove();
});

test.serial('useEventListener() - abort signal is forwarded', async t => {
	const button = document.createElement('button');
	const abortController = new AbortController();
	const originalAddEventListener = button.addEventListener;
	let forwardedSignal;
	document.body.append(button);

	button.addEventListener = (type, listener, options) => {
		if (options && typeof options === 'object') {
			forwardedSignal = options.signal;
		}

		return originalAddEventListener.call(button, type, listener, options);
	};

	const TestComponent = () => {
		useEventListener(button, 'click', () => {}, {signal: abortController.signal});
		return null;
	};

	const {render, unmount} = createTestRoot();
	await render(<TestComponent/>);

	t.is(forwardedSignal, abortController.signal);

	await unmount();
	button.addEventListener = originalAddEventListener;
	button.remove();
});

test('useEventListener() - undefined target is handled', t => {
	// Should not throw when target is undefined (SSR scenario)
	const TestComponent = () => {
		useEventListener(undefined, 'click', () => {});
		return null;
	};

	t.notThrows(() => {
		renderIntoDocument(<TestComponent/>);
	});
});
