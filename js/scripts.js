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

function animatePos(el, x1, y1, duration) {
	let frameRate = 60;
	let interval = 1 / frameRate;
	let t = 0;

	let idInterval = setInterval(frame, interval * 1000);

	let x0 = parseFloat(el.style.left.slice(0, -2));
	let y0 = parseFloat(el.style.top.slice(0, -2));

	function easeInOutCubic(t){
		return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
	}

	function frame() {
		if (t >= duration) {
			clearInterval(idInterval);
		} else {
			t += interval;
			let easet = easeInOutCubic(t / duration)
			let x = x0 + (x1 - x0) * easet;
			let y = y0 + (y1 - y0) * easet;
			el.style.left = x + 'px';
			el.style.top = y + 'px';
		}
	}
}

function createPageManipulated(data, nbImages){
	return new Promise(function(resolve, reject) {
		document.body.style.backgroundImage = "none";

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
			// let imgQty = document.getElementsByClassName("imagesContainer")[0].childNodes.length;
			let currentScore = 0;

			Array.from(document.getElementsByClassName("imagesContainer")[0].childNodes).forEach(el => {
				let isSelected = !!el.selectedImage;
				let isManipulated = !!el.manipulated;
				currentScore += (isSelected == isManipulated);

				let x = randInt(0, imagesContainerTag.clientWidth);
				let y = randInt(0, imagesContainerTag.clientHeight);
				animatePos(el, x, y, 1);
			});

			scores.push(currentScore);
			// shuffleImages(currentScore, imgQty);

			document.getElementById('content').removeChild(document.getElementsByClassName('imagesContainer')[0]);
			let selectionAreas = [].slice.call(document.getElementsByClassName('selectionArea'));
			selectionAreas.forEach(selectionAreaTag => selectionAreaTag.style.flex = 'auto')
			let selectionAreasImagesContainers = [].slice.call(document.getElementsByClassName('selectionAreaImagesContainer'));
			selectionAreasImagesContainers.forEach(selectionAreaImagesContainerTag => {
				selectionAreaImagesContainerTag.style.flexWrap = 'wrap';
				selectionAreaImagesContainerTag.style.alignContent = 'center';
			});
			let imagesContainerInSelectionAreasImagesContainers = selectionAreasImagesContainers.map(
				selectionAreaImagesContainerTag => [].slice.call(selectionAreaImagesContainerTag.childNodes)
			).flat();
			imagesContainerInSelectionAreasImagesContainers.forEach(imageContainerTag => {
				imageContainerTag.style.marginRight = '5px';

				let imageName = imageContainerTag.childNodes[0].src.split('/').last();
				let isManipulated = data.filter(imageData => imageData.filename == imageName)[0].manipulated;
				let isInManipulatedArea = imageContainerTag.parentNode.id == 'manipulatedAreaImagesContainer';
				let isWrongAnswer = isManipulated != isInManipulatedArea;

				if(isWrongAnswer){
					let wrongAnswerContainerTag = document.createElement('div');
					wrongAnswerContainerTag.className = 'wrongAnswerContainer';
					let wrongAnswerImageTag = document.createElement('img');
					wrongAnswerImageTag.src = 'assets/close.png';
					wrongAnswerContainerTag.appendChild(wrongAnswerImageTag);
					imageContainerTag.appendChild(wrongAnswerContainerTag);
				}
			});

			let selectionAreaTextContainers = [].slice.call(document.getElementsByClassName('selectionAreaTextContainer'))
			selectionAreaTextContainers.forEach(el => el.parentNode.removeChild(el))

			resolve();
		});
		footerTag.appendChild(submitButton);
		globalContainer.appendChild(footerTag);

		let contentTag = document.createElement("div");
		contentTag.id = 'content';

		let imagesContainerTag = document.createElement("div");
		imagesContainerTag.className = "imagesContainer";

		function createSelectionArea(name, label) {
			let selectionAreaTag = document.createElement('div');
			selectionAreaTag.id = name + 'Area';
			selectionAreaTag.className = 'selectionArea';
			let selectionAreaTextContainerTag = document.createElement('div');
			selectionAreaTextContainerTag.className = 'selectionAreaTextContainer';
			let selectionAreaTextTag = document.createElement('p');
			selectionAreaTextTag.innerText = label;
			selectionAreaTextContainerTag.appendChild(selectionAreaTextTag);

			let selectionAreaImagesContainerTag = document.createElement('div');
			selectionAreaImagesContainerTag.id = name + 'AreaImagesContainer';
			selectionAreaImagesContainerTag.className = 'selectionAreaImagesContainer';

			selectionAreaTag.appendChild(selectionAreaTextContainerTag);
			selectionAreaTag.appendChild(selectionAreaImagesContainerTag);

			selectionAreaTag.ondragover = function(event){
				event.preventDefault();
			}
			selectionAreaTag.ondrop = imageDropAreaOnDrop(selectionAreaImagesContainerTag);

			return selectionAreaTag;
		}

		let manipulatedAreaTag = createSelectionArea('manipulated', 'Manipulated');
		let notManipulatedAreaTag = createSelectionArea('notManipulated', 'Not Manipulated');

		contentTag.appendChild(notManipulatedAreaTag);
		contentTag.appendChild(imagesContainerTag);
		contentTag.appendChild(manipulatedAreaTag);

		globalContainer.insertBefore(contentTag, footerTag);

		let imagesUrlList = getListUrlImages(data, nbManipulatedImages, nbNotManipulatedImages);
		createImageCollageLayout(imagesContainerTag, imagesUrlList);
	});
}

function imageDropAreaOnDrop(selectionAreaImagesContainerTag){
	return function(event){
		let imageId = event
			.dataTransfer
			.getData('imageId');

		let imageTag = document.getElementById(imageId);
		let imagesContainerTag = document.getElementsByClassName('imagesContainer')[0];
		imagesContainerTag.removeChild(imageTag);

		let imageContainerTag = document.createElement('div');
		imageContainerTag.className = 'imageContainer';

		imageTag.style.top = null;
		imageTag.style.left = null;
		imageTag.style.maxWidth = null;
		imageTag.style.maxHeight = null;
		imageTag.style.position = null;

		imageContainerTag.appendChild(imageTag);
		selectionAreaImagesContainerTag.appendChild(imageContainerTag);

		event.preventDefault();
	}
}

function getListUrlImages(data, nbManipulatedImages, nbNotManipulatedImages){
	let manipulatedImages = data.filter(imageData => imageData.manipulated);
	let notManipulatedImages = data.filter(imageData => !imageData.manipulated);

	shuffle(manipulatedImages);
	shuffle(notManipulatedImages);

	let listImages = manipulatedImages.slice(0, nbManipulatedImages).concat(notManipulatedImages.slice(0, nbNotManipulatedImages));
	shuffle(listImages);

	return listImages.map(imageData => imageData.filename);
}

function getImagesSize(imagesSrc){
	return new Promise((resolve, reject) => {
		let nbImagesLoaded = 0;
		let totalImages = imagesSrc.length;
		let imagesData = [];
		function imageLoaded() {
			nbImagesLoaded++;
			if (nbImagesLoaded == totalImages) {
				allImagesLoaded();
			}
		}

		function allImagesLoaded(){
			resolve(imagesData.map(imageData => ({
				'url': imageData.url,
				'width': imageData.imageTag.width,
				'height': imageData.imageTag.height
			})));
		}

		for(let imageSrc of imagesSrc){
			let imageTag = document.createElement("img");
			imageTag.onload = function(){
				imageLoaded();
			};
			let url = 'images/' + imageSrc;
			imageTag.src = url;
			imagesData.push({
				'url': url,
				'imageTag': imageTag
			});
		}
	});
}

function createImageCollageLayout(imagesContainerTag, imagesSrc){
	let nbImagesColumns = Math.ceil(Math.sqrt(imagesSrc.length));
	let nbImagesRows = Math.ceil(imagesSrc.length / nbImagesColumns);

	let maxHeightRow = 200;
	let maxWidthColumn = 200;
	let gapWidth = 20;

	let minLeftMargin = 100;

	let heightRow = Math.min((imagesContainerTag.clientHeight - (nbImagesRows - 1) * gapWidth) / nbImagesRows, maxHeightRow);
	let widthColumn = Math.min(((imagesContainerTag.clientWidth - 2 * minLeftMargin) - (nbImagesColumns - 1) * gapWidth) / nbImagesColumns, maxWidthColumn);

	let widthRows = nbImagesColumns * widthColumn + (nbImagesColumns - 1) * gapWidth;

	let leftMargin = (imagesContainerTag.clientWidth - widthRows) / 2;

	getImagesSize(imagesSrc).then(imagesSize => {
		let imagesTags = imagesSize.map((imageSize, i) => {
			let columnIdx = i % nbImagesColumns;
			let rowIdx = Math.floor(i / nbImagesColumns);

			let imageId = 'image' + i;

			let imageTag = document.createElement("img");
			imageTag.id = imageId
			imageTag.src = imageSize.url;
			imageTag.style.position = 'absolute';
			let x = columnIdx * (widthColumn + gapWidth) + leftMargin;
			let y = rowIdx * (heightRow + gapWidth);
			let imageSizeClamped = clampImageSize(imageSize.width, imageSize.height, widthColumn, heightRow);
			imageTag.style.left = x + (widthColumn - imageSizeClamped.width) / 2 + 'px';
			imageTag.style.top = y + (heightRow - imageSizeClamped.height) / 2 + 'px';
			imageTag.style.maxWidth = widthColumn + 'px';
			imageTag.style.maxHeight = heightRow + 'px';

			imageTag.ondragstart = function(event) {
				event.dataTransfer.setData('imageId', imageId);
			}

			return imageTag;
		});
		imagesTags.forEach(imageTag => imagesContainerTag.appendChild(imageTag));
	});
}

function clampImageSize(imageWidth, imageHeight, targetWidth, targetHeight){
	let widthRatio = imageWidth / targetWidth;
	let widthRatioFixedImageHeight = imageHeight / widthRatio;
	if(widthRatioFixedImageHeight < targetHeight){
		return {
			'width': targetWidth,
			'height': widthRatioFixedImageHeight
		}
	} else {
		let heightRatio = imageHeight / targetHeight;
		let heightRatioFixedImageWidth = imageWidth / heightRatio;
		return {
			'width': heightRatioFixedImageWidth,
			'height': targetHeight
		}
	}
}

function createImagesTags(imageArray, imagesContainerTag){
	createImageCollageLayout(imagesContainerTag, imageArray.map(i => i.filename));
}

function loadData() {
	return new Promise((resolve, reject) => {
		fetch("data/data.json")
		.then(response => response.json())
		.then(data => resolve(data.images));
	});
}

function timeout(delay){
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), delay);
	})
}

function main(){
	if (!Array.prototype.last){
		Array.prototype.last = function(){
			return this[this.length - 1];
		};
	};

	loadData().then(data => {
		createPageManipulated(data, 2)
		.then(() => timeout(2000))
		.then(() => createPageManipulated(data, 4))
		.then(() => timeout(2000))
		.then(() => createPageManipulated(data, 9))
		.then(() => timeout(2000))
		.then(() => createPageManipulated(data, 16))
		.then(() => timeout(2000))
		.then(
			// TODO
			// - display final score in a cool way
			() => alert('DONE')
		);
	});
}

main();