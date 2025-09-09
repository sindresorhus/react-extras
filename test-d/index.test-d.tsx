import {expectType} from 'tsd';
import * as React from 'react';
import {Component as ReactComponent} from 'react';
import {
	autoBind,
	classNames,
	isStatelessComponent,
	getDisplayName,
	canUseDOM,
	If,
	Choose,
	For,
	Image,
	RootClass,
	BodyClass,
	intersperse,
	Join,
} from '../index.js';

class Bar extends ReactComponent {
	constructor(props: Record<string, unknown>) {
		super(props);

		expectType<this>(autoBind(this));
		expectType<this>(autoBind(this, {include: ['foo', /bar/]}));
		expectType<this>(autoBind(this, {exclude: ['foo', /bar/]}));
	}
}

expectType<string>(classNames('foo', {bar: true}));

expectType<boolean>(isStatelessComponent(Bar));

expectType<string>(getDisplayName(Bar));

expectType<boolean>(canUseDOM);

const IfTest = (props: {error: boolean}) => (
	<div>
		<If condition={props.error} render={() => (
			<h1>{props.error}</h1>
		)}/>
	</div>
);

const ForTest = (
	<div>
		<For
			of={['🌈', '🦄', '😎']}
			render={(item, index) => <button key={index}>{item}</button>}
		/>
	</div>
);

const ChooseTest = (props: {success: boolean; error: boolean}) => (
	<div>
		<Choose>
			<Choose.When condition={props.success}>
				<h1>{props.success}</h1>
			</Choose.When>
			<Choose.When condition={props.error}>
				<h1>{props.error}</h1>
			</Choose.When>
			<Choose.Otherwise>
				<h1>😎</h1>
			</Choose.Otherwise>
		</Choose>
	</div>
);

const ImageTest = (
	<Image
		url='https://sindresorhus.com/unicorn.jpg'
		fallbackUrl='https://sindresorhus.com/rainbow.jpg'
	/>
);

const ImageTestNoFallback = (
	<Image url='https://sindresorhus.com/unicorn.jpg'/>
);

const RootTest = (props: {isDarkMode: boolean}) => (
	<If condition={props.isDarkMode}>
		<RootClass add='dark-mode'/>
		<RootClass add='logged-in paid-user' remove='promo'/>
		<BodyClass remove='dark-mode'/>
		<BodyClass add='logged-in paid-user' remove='promo'/>
	</If>
);

// Test intersperse function
const items = ['Apple', 'Orange', 'Banana'].map(item => <li key={item}>{item}</li>);

// Test with array of ReactNodes
expectType<React.ReactNode[]>(intersperse(items, ', '));

// Test with single ReactNode
expectType<React.ReactNode[]>(intersperse(<div>single</div>, ', '));

// Test with separator function
expectType<React.ReactNode[]>(intersperse(items, (index, count) =>
	index === count - 2 ? ' and ' : ', ',
));

// Test with no separator
expectType<React.ReactNode[]>(intersperse(items));

// Test Join component
const JoinTest = (
	<Join>
		<li>Apple</li>
		<li>Orange</li>
		<li>Banana</li>
	</Join>
);

const JoinWithCustomSeparator = (
	<Join separator=' | '>
		<a href='#'>Home</a>
		<a href='#'>About</a>
		<a href='#'>Contact</a>
	</Join>
);

const JoinWithFunctionSeparator = (
	<Join separator={(index, count) => index === count - 2 ? ' and ' : ', '}>
		<span>Apple</span>
		<span>Orange</span>
		<span>Banana</span>
	</Join>
);
