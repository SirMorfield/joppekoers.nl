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

const projects = {
	wolmolen: {
		imgs: [{ src: "000.jpg", w: 2756, h: 1550 }, { src: "001.jpg", w: 2756, h: 1550 }, { src: "002.jpg", w: 2756, h: 1550 }, { src: "003.jpg", w: 2756, h: 1550 }, { src: "004.jpg", w: 2756, h: 1550 }, { src: "005.jpg", w: 2756, h: 1550 }, { src: "006.jpg", w: 2756, h: 1550 }, { src: "007.jpg", w: 2756, h: 1550 }, { src: "008.jpg", w: 2756, h: 1550 }, { src: "009.jpg", w: 2756, h: 1550 }, { src: "010.jpg", w: 2756, h: 1550 }, { src: "011.jpg", w: 2756, h: 1550 }, { src: "012.jpg", w: 2756, h: 1550 }],
		root: '/img/projectImg/wolmolen/'
	},
	hammer: {
		imgs: [{ src: "0.jpg", w: 1200, h: 1600 }, { src: "1.jpg", w: 1200, h: 1600 }, { src: "2.jpg", w: 1200, h: 1600 }],
		root: '/img/projectImg/hammer/'
	},
	jacobsLadder: {
		imgs: [{ src: "0.jpg", w: 1200, h: 1600 }, { src: "1.jpg", w: 1200, h: 1600 }, { src: "2.jpg", w: 1200, h: 1600 }],
		root: '/img/projectImg/jacobsLadder/'
	},
	knife: {
		imgs: [{ src: "0.jpg", w: 3264, h: 2448 }, { src: "1.jpg", w: 3264, h: 2448 }],
		root: '/img/projectImg/knife/'
	},
	smallBox: {
		imgs: [{ src: "0.jpg", w: 3264, h: 2448 }, { src: "1.jpg", w: 3264, h: 2448 }],
		root: '/img/projectImg/smallBox/'
	},
	speakers: {
		imgs: [{ src: "0.jpg", w: 3264, h: 2448 }, { src: "1.jpg", w: 1920, h: 1080 }],
		root: '/img/projectImg/speakers/'
	},
	sword: {
		imgs: [{ src: "0.jpg", w: 1200, h: 1600 }, { src: "1.jpg", w: 1200, h: 1600 }, { src: "2.jpg", w: 1200, h: 1600 }],
		root: '/img/projectImg/sword/'
	},
	sword2: {
		imgs: [{ src: "0.jpg", w: 1200, h: 1600 }, { src: "1.jpg", w: 1200, h: 1600 }, { src: "2.jpg", w: 1200, h: 1600 }],
		root: '/img/projectImg/sword2/'
	},
	table: {
		imgs: [{ src: "0.jpg", w: 3264, h: 2448 }, { src: "1.jpg", w: 3264, h: 2448 }, { src: "2.jpg", w: 2448, h: 3246 }],
		root: '/img/projectImg/table/'
	}
}