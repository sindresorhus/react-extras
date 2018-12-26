import {expectType} from 'tsd-check';
import {classNames} from '.';

expectType<string>(classNames('foo', {bar: true}));
