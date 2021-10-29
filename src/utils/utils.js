export const getRootSize = () => {
	return Number(
		window
			.getComputedStyle(document.querySelector(':root'))
			.getPropertyValue('font-size')
			.replace('px', '')
	);
};
