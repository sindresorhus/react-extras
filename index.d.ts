import * as React from 'react';

interface AutoBindOptions {
	include?: Array<string | RegExp>
	exclude?: Array<string | RegExp>
}

export function autoBind(element: React.ReactNode, options?: AutoBindOptions): React.ReactNode;

export function classNames(...args: Array<string | {[key: string]: unknown}>): string;

export function isStatelessComponent(component: React.ComponentClass): boolean;

export function getDisplayName(component: React.ComponentClass): string;

export const canUseDOM: boolean;

interface IfProps {
	condition: boolean;
	children?: React.ReactNode;
	render?: () => React.ReactNode;
}

export class If extends React.Component<IfProps> {}

interface ChooseOtherwiseProps {
	children?: React.ReactNode;
	render?: () => React.ReactNode;
}

export class ChooseOtherwise extends React.Component<ChooseOtherwiseProps> {}

export class Choose extends React.Component {
	static When: typeof If;
	static Otherwise: typeof ChooseOtherwise;
}

interface ForProps {
	of: unknown[];
	render?: (item: unknown, index: number) => React.ReactNode;
}

export class For extends React.Component<ForProps> {}

interface ImageProps extends React.HTMLProps<HTMLImageElement> {
	url: string;
	fallbackUrl: string;
}

export class Image extends React.Component<ImageProps> {}

interface ElementClassProps {
	add?: string;
	remove?: string;
}

export class RootClass extends React.Component<ElementClassProps> {}

export class BodyClass extends React.Component<ElementClassProps> {}
