let scores = [];

function randInt(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function shuffleImages() {
	// TODO
}

function buildScoreDiv() {
	/*
	 * Idees:
	 - ne l'afficher qu'a la fin des images
	 - afficher les 3 scores en cascade puis un total ; dessiner une grille ?
	 -> introduire la suite
	 */
	let darkDiv = document.createElement('div');
	darkDiv.classList.add('darkFrontDiv');
	darkDiv.style.opacity = '0.7';

	let scoreDiv = document.createElement('div');
	scoreDiv.classList.add('scoreDiv');

	let p0 = document.createElement('p');
	p0.innerText = 'Score #0: ' + scores[0] + '/2';
	let p1 = document.createElement('p');
	p1.innerText = 'Score #1: ' + scores[1] + '/4';
	let p2 = document.createElement('p');
	p2.innerText = 'Score #2: ' + scores[2] + '/9';
	let p3 = document.createElement('p');
	p3.innerText = 'Score #3: ' + scores[3] + '/16';

	let pBlank = document.createElement('p');
	
	let total = scores[0] + scores[1] + scores[2] + scores[3];
	let accuracy = Math.round(total / 31 * 10000) / 100;
	let pTotal = document.createElement('p');
	pTotal.innerText = 'Global accuracy: ' + accuracy + '%';

	scoreDiv.appendChild(p0);
	scoreDiv.appendChild(p1);
	scoreDiv.appendChild(p2);
	scoreDiv.appendChild(p3);
	scoreDiv.appendChild(pBlank);
	scoreDiv.appendChild(pTotal);
	darkDiv.appendChild(scoreDiv);
	document.body.appendChild(darkDiv);
}

function createPageManipulated(data, nbImages){
	return new Promise(function(resolve, reject) {
		document.body.style.backgroundImage = "none";
		
		let manipulatedImages = data.filter(imageData => imageData.manipulated);
		let notManipulatedImages = data.filter(imageData => !imageData.manipulated);

		let nbImageTypeOffset = Math.ceil(nbImages * 0.2)
		let nbManipulatedImages = randInt(nbImageTypeOffset, nbImages - nbImageTypeOffset);
		let nbNotManipulatedImages = nbImages - nbManipulatedImages;

		let globalContainer = document.getElementById("globalContainer");
		while (globalContainer.firstChild) {
			globalContainer.removeChild(globalContainer.firstChild);
		}

		let headerTag = document.createElement("div");
		headerTag.className = "header";
		let questionTag = document.createElement("p");
		questionTag.innerText = "Which one have been manipulated?"
		headerTag.appendChild(questionTag);
		globalContainer.appendChild(headerTag);

		let footerTag = document.createElement("div");
		footerTag.className = "footer";
		let submitButton = document.createElement("button");
		submitButton.innerText = "Submit";
		submitButton.addEventListener('click', function (e) {
			/* TODO
			- gradient + bouger les images suivant le score intermediaire
			document.body.style.backgroundImage = "linear-gradient(to right, green, rgb(78, 90, 102), red)";
			- 
			- puis scores
			 */
			let imgQty = document.getElementsByClassName("imagesContainer")[0].childNodes.length;
			let currentScore = 0;
			Array.from(document.getElementsByClassName("imagesContainer")[0].childNodes).map(div => div.childNodes[0]).forEach(el => {
				let isSelected = !!el.selectedImage;
				let isManipulated = !!el.manipulated;
				currentScore += (isSelected == isManipulated);
				// el.style.boxShadow = (isSelected != isManipulated ? "0 0 20px 3px rgba(255, 0, 0, 1)" : "0 0 20px 3px rgba(0, 255, 0, 1)");
			});
			scores.push(currentScore);
			shuffleImages(currentScore, imgQty);
			resolve();
		});
		footerTag.appendChild(submitButton);
		globalContainer.appendChild(footerTag);

		let nbImagesColumns = Math.ceil(Math.sqrt(nbImages));
		let widthImageCell = 200;
		let gapCell = 10;

		let imagesContainerTag = document.createElement("div");
		imagesContainerTag.className = "imagesContainer";
		imagesContainerTag.style.gridGap = gapCell + "px";
		imagesContainerTag.style.width = (nbImagesColumns * widthImageCell + (nbImagesColumns - 1) * gapCell) + "px";
		imagesContainerTag.style.gridTemplateColumns = "1fr ".repeat(nbImagesColumns);

		let imagesToAppend = [];
		imagesToAppend = imagesToAppend.concat(createImagesTags(manipulatedImages, nbManipulatedImages, widthImageCell));
		imagesToAppend = imagesToAppend.concat(createImagesTags(notManipulatedImages, nbNotManipulatedImages, widthImageCell));
		shuffle(imagesToAppend)
		imagesToAppend.forEach(imageToAppend => imagesContainerTag.appendChild(imageToAppend));

		globalContainer.insertBefore(imagesContainerTag, footerTag);
	});
}

function createImagesTags(imageArray, nbImages, widthImageCell){
	imagesCellsTags = [];
	for(let i=0;i<nbImages;i+=1){
		let indexImage = randInt(0, imageArray.length);

		let imageCellTag = document.createElement("div");
		imageCellTag.classList.add('imgCell');
		imageCellTag.style.width = widthImageCell + "px";

		let imageTag = document.createElement("img");
		imageTag.classList.add('exImg');
		imageTag.style.width = widthImageCell * 0.8 + "px";
		imageTag.style.maxHeight = imageTag.style.width;
		imageTag.src = "images/" + imageArray[indexImage].filename;
		imageTag.manipulated = imageArray[indexImage].manipulated;
		imageTag.idx = indexImage;

		imageCellTag.appendChild(imageTag);
		imagesCellsTags.push(imageCellTag);

		let absoluteBox = document.createElement('div');
		absoluteBox.classList.add('absBox');
		absoluteBox.style.width = imageCellTag.style.width;

		// zoomImg and tickImg are squares.
		let zoomImg = document.createElement('img');
		zoomImg.classList.add('hoverImg');
		zoomImg.src = 'assets/zoom-in.png';
		zoomImg.style.width = widthImageCell * 0.2 + "px";
		zoomImg.style.height = zoomImg.style.width;
		zoomImg.style.marginLeft = widthImageCell * 0.2 + "px";
		let tickImg = document.createElement('img');
		tickImg.classList.add('hoverImg');
		tickImg.src = 'assets/tick.png';
		tickImg.style.width = widthImageCell * 0.2 + "px";
		tickImg.style.height = tickImg.style.width;
		tickImg.style.marginLeft = widthImageCell * 0.2 + "px";
		// functions
		zoomImg.addEventListener('click', function (e) {
			let zoomDiv = document.createElement('div');
			zoomDiv.classList.add('darkFrontDiv')

			let zoomedPic = document.createElement('img');
			zoomedPic.src = imageTag.src;

			zoomDiv.addEventListener('click', function (e) {
				document.body.removeChild(zoomDiv);
			});

			zoomDiv.appendChild(zoomedPic);
			document.body.appendChild(zoomDiv);
		});
		tickImg.addEventListener('click', function (e) {
			imageTag.selectedImage = !imageTag.selectedImage;
			if (imageTag.selectedImage) {
				imageTag.style.boxShadow = "0 0 20px 5px rgba(255, 255, 255, 0.7)";
			} else {
				imageTag.style.boxShadow = "0 0 20px 5px rgba(0, 0, 0, 0.6)";
			}
		});
		absoluteBox.appendChild(zoomImg);
		absoluteBox.appendChild(tickImg);

		imageCellTag.addEventListener('mouseenter', function (e) {
			// if outside of the listener, img height is not defined yet --> jquery pls
			let buttonsTopMargin = imageCellTag.clientHeight / 2  - zoomImg.style.width.slice(0, -2) / 2 + 'px';
			zoomImg.style.marginTop = buttonsTopMargin;
			tickImg.style.marginTop = buttonsTopMargin;
			// ---
			imageCellTag.appendChild(absoluteBox);
		});
		imageCellTag.addEventListener('mouseleave', function (e) {
			imageCellTag.removeChild(absoluteBox);
		});
	}
	return imagesCellsTags;
}

function loadData() {
	return new Promise((resolve, reject) => {
		fetch("data/data.json")
		.then(response => response.json())
		.then(data => resolve(data.images));
	});
}

function main(){
	loadData().then(data => {
		createPageManipulated(data, 2).then(() => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(), 2000);
			})
		}).then(() => {
			return createPageManipulated(data, 4);
		}).then(() => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(), 2000);
			})
		}).then(() => {
			return createPageManipulated(data, 9);
		}).then(() => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(), 2000);
			})
		}).then(() => {
			return createPageManipulated(data, 16);
		}).then(() => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(), 2000);
			})
		}).then(
			// TODO
			// - display final score in a cool way
			() => alert('DONE')
		);
	});
}

main();