export {default as autoBind} from 'auto-bind/react';

export {default as classNames} from '@sindresorhus/class-names';

export const isStatelessComponent = Component => !(
	typeof Component.prototype !== 'undefined'
	&& typeof Component.prototype.render === 'function'
);

export const getDisplayName = Component => (
	Component.displayName
	|| Component.name
	|| 'Component'
);

export const canUseDOM = (
	typeof window !== 'undefined'
	&& 'document' in window
	&& 'createElement' in window.document
);

export {default as If} from './if.js';
export {default as Choose} from './choose.js';
export {default as For} from './for.js';
export {default as Image} from './image.js';
export {default as RootClass} from './root-class.js';
export {default as BodyClass} from './body-class.js';
