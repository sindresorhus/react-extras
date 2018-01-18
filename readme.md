# react-extras [![Build Status](https://travis-ci.org/sindresorhus/react-extras.svg?branch=master)](https://travis-ci.org/sindresorhus/react-extras)

> Useful components and utilities for working with [React](https://reactjs.org)


## Install

```
$ npm install react-extras
```


## Usage

```js
import React from 'react';
import {If} from 'react-extras';

const App = props => (
	<If condition={props.showUnicorn}>
		<div className="unicorn">
			🦄
		</div>
	</If>
);
```


## API

### `<If>`

React component that renders the children if the `condition` prop is `true`.

Beware that even though the children are not rendered when the `condition` is `false`, they're still evaluated.

If you need it to not be evaluated on `false`, you can pass a function to the `render` prop that returns the children:

```jsx
<div>
	<If condition={props.error} render={() => (
		<h1>{props.error}</h1>
	)}/>
</div>
```

Or you could just use plain JavaScript:

```jsx
<div>
	{props.error && (
		<h1>{props.error}</h1>
	)}
</div>
```

### `<RootClass/>`

Renderless React component that can add and remove classes to the root `<html>` element. It accepts an `add` prop for adding classes, and a `remove` prop for removing classes. Both accept either a single class or multiple classes separated by space.

```jsx
<If condition={props.isDarkMode}>
	<RootClass add="dark-mode"/>
</If>
```

```jsx
<RootClass add="logged-in paid-user" remove="promo"/>
```

### `<BodyClass/>`

Same as `<RootClass/>` but for `<body>`.

Prefer `<RootClass/>` though, because it's nicer to put global classes on `<html>` as you can consistently prefix everything with the class:

```css
.dark-mode body {
	background: #000;
}

.dark-mode a {
	…
}
```

With `<BodyClass/>` you need to do:

```css
body.dark-mode {
	background: #000;
}

.dark-mode a {
	…
}
```


## Related

- [react-router-util](https://github.com/sindresorhus/react-router-util) - Useful components and utilities for working with React Router


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
