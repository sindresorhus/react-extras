import {Component as ReactComponent, ComponentClass, HTMLProps, ReactNode} from 'react';
import classNames = require('@sindresorhus/class-names');
import autoBind = require('auto-bind/react');

/**
Automatically binds your `Component` subclass methods to the instance.

@see https://github.com/sindresorhus/auto-bind#autobindreactself-options

@param self - Object with methods to bind.

@example
```
import {autoBind} = require('react-extras');

class Foo extends Component {
	constructor(props) {
		super(props);
		autoBind.react(this);
	}
	// …
}
```
*/
export {autoBind};

/**
Conditionally join CSS class names together.

@param input - Accepts a combination of strings and objects. Only object keys with truthy values are included. Anything else is ignored.

@example
```
import {classNames} = require('react-extras');

classNames('unicorn', 'rainbow');
//=> 'unicorn rainbow'

classNames({awesome: true, foo: false}, 'unicorn', {rainbow: false});
//=> 'awesome unicorn'

classNames('unicorn', null, undefined, 0, 1, {foo: null});
//=> 'unicorn'

const buttonType = 'main';
classNames({[`button-${buttonType}`]: true});
//=> 'button-main'
```

@example
```
import {classNames} = require('react-extras');

const Button = props => {
	const buttonClass = classNames(
		'button',
		{
			[`button-${props.type}`]: props.type,
			'button-block': props.block,
			'button-small': props.small
		}
	);

	console.log(buttonClass);
	//=> 'button button-success button-small'

	return <button className={buttonClass}>…</button>;
};
```
*/
export {classNames};

/**
Returns a boolean of whether the given `Component` is a functional stateless component.

@see https://javascriptplayground.com/functional-stateless-components-react/
*/
export function isStatelessComponent(component: ComponentClass): boolean;

/**
Returns the display name of the given `Component`.

@see https://reactjs.org/docs/react-component.html#displayname
*/
export function getDisplayName(component: ComponentClass): string;

/**
A boolean of whether you're running in a context with a DOM.

Can be used to check if your component is running in the browser or if it's being server-rendered.

@see https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
*/
export const canUseDOM: boolean;

interface IfProps {
	/**
	Condition to check. Children are only rendered if `true`.
	*/
	readonly condition: boolean;

	/**
	Children to render if `condition` is `true`.
	*/
	readonly children?: ReactNode;

	/**
	If you need the children to not be evaluated when `condition` is `false`, pass a function to the `render` prop that returns the children.
	*/
	readonly render?: () => ReactNode;
}

/**
React component that renders the children if the `condition` prop is `true`.

Beware that even though the children are not rendered when the `condition` is `false`, they're still evaluated.

If you need it to not be evaluated on `false`, you can pass a function to the `render` prop that returns the children:

@example
```
import {If} = require('react-extras');

<div>
	<If condition={props.error} render={() => (
		<h1>{props.error}</h1>
	)}/>
</div>
```

Or you could just use plain JavaScript:

@example
```
<div>
	{props.error && (
		<h1>{props.error}</h1>
	)}
</div>
```
*/
export class If extends ReactComponent<IfProps> {}

interface ChooseOtherwiseProps {
	/**
	Children to render in the default case.
	*/
	readonly children?: ReactNode;

	/**
	If you need the children to not be evaluated when a `<Condition.When>` component has a true condition, pass a function to the `render` prop that returns the children.
	*/
	readonly render?: () => ReactNode;
}

export class ChooseOtherwise extends ReactComponent<ChooseOtherwiseProps> {}

/**
React component similar to a switch case. `<Choose>` has 2 children components:

- `<Choose.When>` that renders the children if the `condition` prop is `true`.
- `<Choose.Otherwise>` that renders the children if has no `<Choose.When>` with `true` prop `condition`.

Note that even when the children are not rendered, they're still evaluated.

@example
```
import {Choose} = require('react-extras');

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
```

@example
```
<div>
	{(() => {
		if (props.success) {
			return <h1>{props.success}</h1>;
		}

		if (props.error) {
			return <h1>{props.error}</h1>;
		}

		return <h1>😎</h1>;
	})()}
</div>
```
*/
export class Choose extends ReactComponent {
	/**
	Renders the children if the `condition` prop is `true`.

	Use with `Choose` and `Choose.Otherwise`.
	*/
	static When: typeof If;

	/**
	Renders the children if there is no `<Choose.When>` with `true` prop `condition`.

	Use with `Choose` and `Choose.When`.
	*/
	static Otherwise: typeof ChooseOtherwise;
}

interface ForProps<T> {
	/**
	Items to iterate over. `render` will be called once per item.
	*/
	readonly of: readonly T[];

	/**
	Returns the element to render corresponding to an `item`.
	*/
	readonly render?: (item: T, index: number) => ReactNode;
}

/**
React component that iterates over the `of` prop and renders the `render` prop.

@example
```
import {For} = require('react-extras');

<div>
	<For of={['🌈', '🦄', '😎']} render={(item, index) =>
		<button key={index}>{item}</button>
	}/>
</div>
```

Or you could just use plain JavaScript:

@example
```
<div>
	{['🌈', '🦄', '😎'].map((item, index) =>
		<button key={index}>{item}</button>
	)}
</div>
```
*/
export class For<T> extends ReactComponent<ForProps<T>> {}

interface ImageProps extends HTMLProps<HTMLImageElement> {
	/**
	URL of the image. Use instead of `src`.
	*/
	readonly url: string;

	/**
	Fallback URL to display if the image does not load.

	Default: Hide the image if it fails to load.
	*/
	readonly fallbackUrl?: string;
}

/**
React component that improves the `<img>` element.

It makes the image invisible if it fails to load instead of showing the default broken image icon. Optionally, specify a fallback image URL.

@example
```
import {Image} = require('react-extras');

<Image
	url="https://sindresorhus.com/unicorn.jpg"
	fallbackUrl="https://sindresorhus.com/rainbow.jpg"
/>
```

It supports all the props that `<img>` supports, but you use the prop `url` instead of `src`.
*/
export class Image extends ReactComponent<ImageProps> {}

interface ElementClassProps {
	/**
	Classes to add to the root element.

	Either a single class or multiple classes separated by space.
	*/
	readonly add?: string;

	/**
	Classes to remove from the root element.

	Either a single class or multiple classes separated by space.
	*/
	readonly remove?: string;
}

/**
Renderless React component that can add and remove classes to the root `<html>` element. It accepts an `add` prop for adding classes, and a `remove` prop for removing classes. Both accept either a single class or multiple classes separated by space.

@example
```
import {If, RootClass} = require('react-extras');

<If condition={props.isDarkMode}>
	<RootClass add="dark-mode"/>
</If>
```

@example
```
import {RootClass} = require('react-extras');

<RootClass add="logged-in paid-user" remove="promo"/>
```
*/
export class RootClass extends ReactComponent<ElementClassProps> {}

/**
Same as `<RootClass/>` but for `<body>`.

Prefer `<RootClass/>` though, because it's nicer to put global classes on `<html>` as you can consistently prefix everything with the class:

@example
```css
.dark-mode body {
	background: #000;
}

.dark-mode a {
	…
}
```

With `<BodyClass/>` you need to do:

@example
```css
body.dark-mode {
	background: #000;
}

.dark-mode a {
	…
}
```
*/
export class BodyClass extends ReactComponent<ElementClassProps> {}
