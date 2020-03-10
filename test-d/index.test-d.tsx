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
	BodyClass
} from '..';

class Bar extends ReactComponent {
	constructor(props: object) {
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
		url="https://sindresorhus.com/unicorn.jpg"
		fallbackUrl="https://sindresorhus.com/rainbow.jpg"
	/>
);

const ImageTestNoFallback = (
	<Image url="https://sindresorhus.com/unicorn.jpg"/>
);

const RootTest = (props: {isDarkMode: boolean}) => (
	<If condition={props.isDarkMode}>
		<RootClass add="dark-mode"/>
		<RootClass add="logged-in paid-user" remove="promo"/>
		<BodyClass remove="dark-mode"/>
		<BodyClass add="logged-in paid-user" remove="promo"/>
	</If>
);
