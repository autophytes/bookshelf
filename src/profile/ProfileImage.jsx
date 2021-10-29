import React, { useState, useEffect } from 'react';

import DefaultProfileSVG from '../_svg/DefaultProfileSVG';

const ProfileImage = ({ imgURL = '' }) => {
	const [imageFailed, setImageFailed] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageSrc, setImageSrc] = useState('');

	// Sets the image URL from the props
	useEffect(() => {
		setImageFailed(false); // I  think I need this? Added but haven't tested

		const urlPrefix =
			process.env.NODE_ENV === 'development'
				? 'http://' + window.location.hostname + ':3333'
				: '';

		setImageSrc(urlPrefix + imgURL);
	}, [imgURL]);

	return (
		<div className='profile-img-container user-profile'>
			<div className='profile-img-wrapper'>
				{!!imgURL ? (
					<>
						{!imageFailed && (
							// eslint-disable-next-line
							<img
								style={imageLoaded ? { display: 'none' } : {}} // Prevents extra space flicker
								className='profile-img'
								src={imageSrc}
								onError={() => setImageFailed(true)}
								onLoad={() => setImageLoaded(true)}
							/>
						)}
						{!!(!imageLoaded || imageFailed) && <DefaultProfileSVG className='profile-img' />}
					</>
				) : (
					<DefaultProfileSVG className='profile-img' />
				)}

				{/* UPLOAD BUTTON OVERLAY */}
				<button className='profile-img-upload-btn'>Upload</button>
			</div>
		</div>
	);
};

export default ProfileImage;
