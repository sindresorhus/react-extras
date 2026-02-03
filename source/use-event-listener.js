import {
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const normalizeOptions = options => {
	if (options === undefined) {
		return {type: 'none'};
	}

	if (typeof options === 'boolean') {
		return {
			type: 'boolean',
			capture: options,
		};
	}

	return {
		type: 'object',
		capture: options.capture ?? false,
		passive: options.passive,
		once: options.once ?? false,
		signal: options.signal,
	};
};

const createEffectOptions = options => {
	if (options.type === 'none') {
		return undefined;
	}

	if (options.type === 'boolean') {
		return options.capture;
	}

	const effectOptions = {capture: options.capture, once: options.once};

	if (options.passive !== undefined) {
		effectOptions.passive = options.passive;
	}

	if (options.signal !== undefined) {
		effectOptions.signal = options.signal;
	}

	return effectOptions;
};

const areOptionsEqual = (firstOptions, secondOptions) => {
	if (firstOptions?.type !== secondOptions?.type) {
		return false;
	}

	if (firstOptions?.type === 'none') {
		return true;
	}

	if (firstOptions?.type === 'boolean') {
		return firstOptions.capture === secondOptions.capture;
	}

	return firstOptions.capture === secondOptions.capture
		&& firstOptions.passive === secondOptions.passive
		&& firstOptions.once === secondOptions.once
		&& firstOptions.signal === secondOptions.signal;
};

// Support refs by returning their current value, treating null as no target.
const resolveTarget = target => {
	if (!target || typeof target !== 'object') {
		return target;
	}

	if (!Object.hasOwn(target, 'current')) {
		return target;
	}

	return target.current;
};

export function useEventListener(target, eventName, handler, options) {
	const handlerReference = useRef(handler);
	const listenerReference = useRef(event => handlerReference.current(event));
	const subscriptionReference = useRef({
		target: undefined,
		eventName: undefined,
		options: undefined,
	});

	useIsomorphicLayoutEffect(() => {
		handlerReference.current = handler;
	}, [handler]);

	useIsomorphicLayoutEffect(() => {
		const nextTarget = resolveTarget(target);
		const previousSubscription = subscriptionReference.current;
		const normalizedOptions = normalizeOptions(options);
		const hasSameTarget = previousSubscription.target === nextTarget;
		const hasSameEventName = previousSubscription.eventName === eventName;
		const hasSameOptions = areOptionsEqual(previousSubscription.options, normalizedOptions);

		// Avoid re-subscribing when target, event, and options are unchanged.
		if (hasSameTarget && hasSameEventName && hasSameOptions) {
			return;
		}

		const listener = listenerReference.current;

		// Tear down the previous subscription before attaching a new one.
		if (previousSubscription.target) {
			const previousEffectOptions = createEffectOptions(previousSubscription.options);

			if (previousEffectOptions === undefined) {
				previousSubscription.target.removeEventListener(previousSubscription.eventName, listener);
			} else {
				previousSubscription.target.removeEventListener(previousSubscription.eventName, listener, previousEffectOptions);
			}
		}

		// Subscribe when a target exists, otherwise treat as no-op.
		if (nextTarget) {
			const nextEffectOptions = createEffectOptions(normalizedOptions);

			if (nextEffectOptions === undefined) {
				nextTarget.addEventListener(eventName, listener);
			} else {
				nextTarget.addEventListener(eventName, listener, nextEffectOptions);
			}
		}

		subscriptionReference.current = {
			target: nextTarget,
			eventName,
			options: normalizedOptions,
		};
	});

	// Cleanup in layout effect so unmounts before passive effects still detach.
	useIsomorphicLayoutEffect(() => () => {
		const currentSubscription = subscriptionReference.current;

		if (!currentSubscription.target) {
			subscriptionReference.current = {
				target: undefined,
				eventName: undefined,
				options: undefined,
			};
			return;
		}

		const listener = listenerReference.current;
		const effectOptions = createEffectOptions(currentSubscription.options);

		if (effectOptions === undefined) {
			currentSubscription.target.removeEventListener(currentSubscription.eventName, listener);
		} else {
			currentSubscription.target.removeEventListener(currentSubscription.eventName, listener, effectOptions);
		}

		subscriptionReference.current = {
			target: undefined,
			eventName: undefined,
			options: undefined,
		};
	}, []);
}

export function useWindowEvent(eventName, handler, options) {
	useEventListener(typeof window === 'undefined' ? undefined : window, eventName, handler, options);
}

export function useDocumentEvent(eventName, handler, options) {
	useEventListener(typeof document === 'undefined' ? undefined : document, eventName, handler, options);
}
