/* eslint-disable */
export default new Promise((resolve) => {
	window.onYouTubePlayerAPIReady = resolve;

	const tag = document.createElement('script');

	tag.src = 'https://www.youtube.com/iframe_api';
	const firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
