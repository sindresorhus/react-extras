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
	<If condition={props.showUnicorn} className="unicorn">
		🦄
	</If>
);
```


## API

### `<If>`

React component that renders the children if the `condition` prop is `true`.


## Related

- [react-router-util](https://github.com/sindresorhus/react-router-util) - Useful components and utilities for working with React Router


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
