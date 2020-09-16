function openPopup(id) {
	const { imgs } = projects[id]

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

const projects = ["bigHammer","boomicStand","hammer","jacobsLadder","knife","opslag","rainbarrelStand","smallBox","speakers","sword","sword2","table","tableLeg","wolmolen"]

for (const project of Object.keys(projects)) {
	for (const img of projects[project].imgs) {
		img.src = `${projects[project].root}${img.src}`
	}
}
