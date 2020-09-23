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

const projects = {"bigHammer":{imgs:[{src:"00.jpg",w:3024,h:4032},{src:"02.jpg",w:2596,h:3971},{src:"03.jpg",w:2711,h:3971},{src:"04.jpg",w:3024,h:4032}],root:"/img/projectImg/bigHammer/"},"boomicStand":{imgs:[{src:"02.jpg",w:3024,h:4032},{src:"03.jpg",w:3024,h:4032},{src:"05.jpg",w:3024,h:4032}],root:"/img/projectImg/boomicStand/"},"hammer":{imgs:[{src:"01.jpg",w:1200,h:1600},{src:"02.jpg",w:1200,h:1600},{src:"03.jpg",w:1200,h:1600}],root:"/img/projectImg/hammer/"},"jacobsLadder":{imgs:[{src:"01.jpg",w:1200,h:1600},{src:"02.jpg",w:1200,h:1600},{src:"03.jpg",w:1200,h:1600}],root:"/img/projectImg/jacobsLadder/"},"knife":{imgs:[{src:"01.jpg",w:3264,h:2448},{src:"02.jpg",w:3264,h:2448}],root:"/img/projectImg/knife/"},"opslag":{imgs:[{src:"01.jpg",w:779,h:1186},{src:"02.jpg",w:2268,h:4032},{src:"03.jpg",w:2268,h:4032},{src:"04.jpg",w:2268,h:4032},{src:"05.jpg",w:2268,h:4032},{src:"07.jpg",w:2268,h:4032},{src:"08.jpg",w:2268,h:4032},{src:"09.jpg",w:2266,h:3372}],root:"/img/projectImg/opslag/"},"rainbarrelStand":{imgs:[{src:"00.jpg",w:3024,h:4032},{src:"02.jpg",w:3024,h:4032},{src:"03.jpg",w:3024,h:4032},{src:"04.jpg",w:3024,h:4032},{src:"05.jpg",w:3024,h:4032},{src:"06.jpg",w:3024,h:4032}],root:"/img/projectImg/rainbarrelStand/"},"smallBox":{imgs:[{src:"02.jpg",w:3264,h:2448}],root:"/img/projectImg/smallBox/"},"speakers":{imgs:[{src:"01.jpg",w:3264,h:2448},{src:"02.jpg",w:1920,h:1080},{src:"03.jpg",w:2268,h:4032},{src:"04.jpg",w:4032,h:2268}],root:"/img/projectImg/speakers/"},"sword":{imgs:[{src:"01.jpg",w:1200,h:1600},{src:"02.jpg",w:1200,h:1600},{src:"03.jpg",w:1200,h:1600}],root:"/img/projectImg/sword/"},"sword2":{imgs:[{src:"01.jpg",w:1200,h:1600},{src:"02.jpg",w:1200,h:1600},{src:"03.jpg",w:1200,h:1600}],root:"/img/projectImg/sword2/"},"table":{imgs:[{src:"01.jpg",w:3264,h:2448},{src:"02.jpg",w:3264,h:2448},{src:"03.jpg",w:2448,h:3246}],root:"/img/projectImg/table/"},"tableLeg":{imgs:[{src:"00.jpg",w:2941,h:2893},{src:"02.jpg",w:3024,h:4032},{src:"04.jpg",w:4032,h:3024},{src:"05.jpg",w:4032,h:3024},{src:"06.jpg",w:3024,h:4032},{src:"07.jpg",w:3024,h:4032},{src:"08.jpg",w:3024,h:4032},{src:"09.jpg",w:4032,h:3024},{src:"10.jpg",w:2941,h:2893},{src:"14.jpg",w:4032,h:3024}],root:"/img/projectImg/tableLeg/"},"wolmolen":{imgs:[{src:"01.jpg",w:2756,h:1550},{src:"02.jpg",w:2756,h:1550},{src:"03.jpg",w:2756,h:1550},{src:"04.jpg",w:2756,h:1550},{src:"05.jpg",w:2756,h:1550},{src:"06.jpg",w:2756,h:1550},{src:"07.jpg",w:2756,h:1550},{src:"08.jpg",w:2756,h:1550},{src:"09.jpg",w:2756,h:1550},{src:"10.jpg",w:2756,h:1550},{src:"11.jpg",w:2756,h:1550},{src:"12.jpg",w:2756,h:1550},{src:"13.jpg",w:2756,h:1550}],root:"/img/projectImg/wolmolen/"}}

for (const project of Object.keys(projects)) {
	for (const img of projects[project].imgs) {
		img.src = `${projects[project].root}${img.src}`
	}
}
