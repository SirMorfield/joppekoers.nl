function openPopup(id) {
	const { imgs, root } = projects[id]

	for (const img of imgs) {
		img.src = `${root}${img.src}`
	}

	let options = {
		loop: false,
		bgOpacity: 0.98,
		showAnimationDuration: 0,
		hideAnimationDuration: 0,
		pinchToClose: false,
	}

	let pswpElement = document.querySelectorAll('.pswp')[0]
	let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, imgs, options)
	gallery.init()
}
