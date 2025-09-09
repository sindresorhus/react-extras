import {
	Component as ReactComponent,
	type ComponentClass,
	type HTMLProps,
	type ReactNode,
	type JSX,
} from 'react';

/**
Automatically binds your `Component` subclass methods to the instance.

@see https://github.com/sindresorhus/auto-bind#autobindreactself-options

@param self - Object with methods to bind.

@example
```
import {autoBind} from 'react-extras';

class Foo extends Component {
	constructor(props) {
		super(props);
		autoBind.react(this);
	}
	// …
}
```
*/

/**
Conditionally join CSS class names together.

@param input - Accepts a combination of strings and objects. Only object keys with truthy values are included. Anything else is ignored.

@example
```
import {classNames} from 'react-extras';

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
import {classNames} from 'react-extras';

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

type IfProps = {
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
};

/**
React component that renders the children if the `condition` prop is `true`.

Beware that even though the children are not rendered when the `condition` is `false`, they're still evaluated.

If you need it to not be evaluated on `false`, you can pass a function to the `render` prop that returns the children:

@example
```
import {If} from 'react-extras';

<div>
	<If condition={props.error} render={() => (
		<h1>{props.error}</h1>
	)}/>
</div>
```

Or you could just use plain JavaScript:

@example
```
import {If} from 'react-extras';

<div>
	{props.error && (
		<h1>{props.error}</h1>
	)}
</div>
```
*/
export class If extends ReactComponent<IfProps> {}

type ChooseOtherwiseProps = {
	/**
	Children to render in the default case.
	*/
	readonly children?: ReactNode;

	/**
	If you need the children to not be evaluated when a `<Condition.When>` component has a true condition, pass a function to the `render` prop that returns the children.
	*/
	readonly render?: () => ReactNode;
};

export class ChooseOtherwise extends ReactComponent<ChooseOtherwiseProps> {}

/**
React component similar to a switch case. `<Choose>` has 2 children components:

- `<Choose.When>` that renders the children if the `condition` prop is `true`.
- `<Choose.Otherwise>` that renders the children if has no `<Choose.When>` with `true` prop `condition`.

Note that even when the children are not rendered, they're still evaluated.

@example
```
import {Choose} from 'react-extras';

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

type ForProps<T> = {
	/**
	Items to iterate over. `render` will be called once per item.
	*/
	readonly of: readonly T[];

	/**
	Returns the element to render corresponding to an `item`.
	*/
	readonly render?: (item: T, index: number) => ReactNode;
};

/**
React component that iterates over the `of` prop and renders the `render` prop.

@example
```
import {For} from 'react-extras';

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

type ImageProps = {
	/**
	URL of the image. Use instead of `src`.
	*/
	readonly url: string;

	/**
	Fallback URL to display if the image does not load.

	Default: Hide the image if it fails to load.
	*/
	readonly fallbackUrl?: string;
} & HTMLProps<HTMLImageElement>;

/**
React component that improves the `<img>` element.

It makes the image invisible if it fails to load instead of showing the default broken image icon. Optionally, specify a fallback image URL.

@example
```
import {Image} from 'react-extras';

<Image
	url="https://sindresorhus.com/unicorn.jpg"
	fallbackUrl="https://sindresorhus.com/rainbow.jpg"
/>
```

It supports all the props that `<img>` supports, but you use the prop `url` instead of `src`.
*/
export class Image extends ReactComponent<ImageProps> {}

type ElementClassProps = {
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
};

/**
Renderless React component that can add and remove classes to the root `<html>` element. It accepts an `add` prop for adding classes, and a `remove` prop for removing classes. Both accept either a single class or multiple classes separated by space.

@example
```
import {If, RootClass} from 'react-extras';

<If condition={props.isDarkMode}>
	<RootClass add="dark-mode"/>
</If>
```

@example
```
import {RootClass} from 'react-extras';

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

/**
Inserts a separator between each element of the children.

@param children - The elements to intersperse with separators.
@param separator - The separator to insert between elements. Can be a ReactNode or a function that returns a ReactNode.

@example
```
import {intersperse} from 'react-extras';

const items = ['Apple', 'Orange', 'Banana'];
const list = intersperse(
	items.map(item => <li key={item}>{item}</li>),
	', '
);
// => [<li>Apple</li>, ', ', <li>Orange</li>, ', ', <li>Banana</li>]
```

@example
```
import {intersperse} from 'react-extras';

const items = ['Apple', 'Orange', 'Banana'];
const list = intersperse(
	items.map(item => <li key={item}>{item}</li>),
	(index, count) => index === count - 2 ? ' and ' : ', '
);
// => [<li>Apple</li>, ', ', <li>Orange</li>, ' and ', <li>Banana</li>]
```
*/
export function intersperse(
	children: ReactNode,
	separator?: ReactNode | ((index: number, count: number) => ReactNode)
): ReactNode[];

type JoinProps = {
	/**
	The separator to insert between elements.

	Can be a ReactNode or a function that returns a ReactNode.

	@default ', '
	*/
	readonly separator?: ReactNode | ((index: number, count: number) => ReactNode);

	/**
	The elements to join with separators.
	*/
	readonly children: ReactNode;
};

/**
React component that renders the children with a separator between each element.

@example
```
import {Join} from 'react-extras';

<Join>
	<li>Apple</li>
	<li>Orange</li>
	<li>Banana</li>
</Join>
// => <li>Apple</li>, <li>Orange</li>, <li>Banana</li>
```

@example
```
import {Join} from 'react-extras';

<Join separator=" | ">
	<a href="#">Home</a>
	<a href="#">About</a>
	<a href="#">Contact</a>
</Join>
// => <a href="#">Home</a> | <a href="#">About</a> | <a href="#">Contact</a>
```

@example
```
import {Join} from 'react-extras';

<Join separator={(index, count) => index === count - 2 ? ' and ' : ', '}>
	<span>Apple</span>
	<span>Orange</span>
	<span>Banana</span>
</Join>
// => <span>Apple</span>, <span>Orange</span> and <span>Banana</span>
```
*/
export function Join(props: JoinProps): JSX.Element;

export {default as classNames} from '@sindresorhus/class-names';
export {default as autoBind} from 'auto-bind/react';
