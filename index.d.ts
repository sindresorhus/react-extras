import * as React from 'react';

export function autoBind(el: React.ReactNode, options?: any): React.ReactNode;

export function classNames(...args: any[]): string;

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
	of: any[];
	render?: (item: any, index: number) => React.ReactNode;
}

export class For extends React.Component<ForProps> {}

interface ElementClassProps {
	add?: string;
	remove?: string;
}

export class RootClass extends React.Component<ElementClassProps> {}

export class BodyClass extends React.Component<ElementClassProps> {}
