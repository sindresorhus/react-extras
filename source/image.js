import React from 'react';
import PropTypes from 'prop-types';

const Image = ({url, fallbackUrl, ...props}) => (
	<img
		{...props}
		src={url}
		onError={event => {
			const element = event.currentTarget;

			if (fallbackUrl) {
				element.src = fallbackUrl;
			} else {
				element.style.visibility = 'hidden';
			}
		}}
	/>
);

Image.propTypes = {
	url: PropTypes.string.isRequired,
	fallbackUrl: PropTypes.string,
};

Image.defaultProps = {
	fallbackUrl: undefined,
};

export default Image;
