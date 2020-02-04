/**
 * Returns an random integer between min (included) and max (excluded)
 * 
 * @param {integer} min lower boundary (included)
 * @param {integer} max upper boundary (excluded)
 * 
 * @returns {integer} A random integer
 */
function randInt(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Shuffles an array without changing the existing one but instead
 * returning a new array.
 * 
 * @param {array} array The array to shuffle
 */
function shuffle(array) {
	array = array.slice();
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
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

/**
 * Returns the number of images of each type (manipulated and not manipulated)
 * based on the total number of images and a minimum offset. The offset is a
 * the minimal percentage of number of each type of image (Ex: for an offset of
 * 0.2 for a total of 10 images, the minimal amount of images of each type is
 * going to be 2).
 * 
 * @param {integer} nbImages Total number of images
 * @param {float} offset Percentage being the minimal amount of images of each type
 * 
 * @returns {object} An object with two integer properties 'nbManipulatedImages' and
 * 'nbNotManipulatedImages'
 */
function getNbImages(nbImages, offset){
	let nbImageTypeOffset = Math.ceil(nbImages * offset)
	let nbManipulatedImages = randInt(nbImageTypeOffset, nbImages - nbImageTypeOffset);
	let nbNotManipulatedImages = nbImages - nbManipulatedImages;
	return {nbManipulatedImages, nbNotManipulatedImages};
}

/**
 * Create the header div tag containing the title of the page.
 * 
 * @returns {HTMLDivElement} The header div tag
 */
function createHeader(){
	let headerTag = document.createElement("div");
	headerTag.id = "header";

	let questionTag = document.createElement("p");
	questionTag.innerText = "Which ones have been manipulated?";

	headerTag.appendChild(questionTag);

	return headerTag;
}

/**
 * Create the footer div tag containing the submit button.
 * 
 * @returns {HTMLDivElement} The footer div tag
 */
function createFooter(){
	let footerTag = document.createElement("div");
	footerTag.id = "footer";

	let submitButton = document.createElement("button");
	submitButton.id = 'submitButton';
	submitButton.innerText = "Submit";

	footerTag.appendChild(submitButton);

	return footerTag;
}

function createContent(pageState){
	let contentTag = document.createElement("div");
	contentTag.id = 'content';

	let imagesContainerTag = document.createElement("div");
	imagesContainerTag.id = "imagesContainer";

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
		selectionAreaTag.ondrop = imageDropAreaOnDrop(name, selectionAreaImagesContainerTag, pageState);

		return selectionAreaTag;
	}

	let manipulatedAreaTag = createSelectionArea('manipulated', 'Manipulated');
	let notManipulatedAreaTag = createSelectionArea('notManipulated', 'Not Manipulated');

	contentTag.appendChild(notManipulatedAreaTag);
	contentTag.appendChild(imagesContainerTag);
	contentTag.appendChild(manipulatedAreaTag);

	return contentTag;
}

function onSubmitButtonClick(resolve, jsonData, pageState){
	return function (e) {
		let imagesContainerTag = document.getElementById('imagesContainer');
		document.getElementById('content').removeChild(imagesContainerTag);

		let selectionAreasTags = [].slice.call(document.getElementsByClassName('selectionArea'));
		selectionAreasTags.forEach(selectionAreaTag => selectionAreaTag.style.flex = 'auto');

		let selectionAreasImagesContainers = [].slice.call(document.getElementsByClassName('selectionAreaImagesContainer'));
		selectionAreasImagesContainers.forEach(selectionAreaImagesContainerTag => {
			selectionAreaImagesContainerTag.style.flexWrap = 'wrap';
			selectionAreaImagesContainerTag.style.alignContent = 'center';
		});

		function displayAnswer(imageData, isManipulatedArea){
			let imageTag = imageData.tag;
			let isManipulated = imageData.manipulated;
			let imageContainerTag = imageTag.parentNode;

			imageContainerTag.style.marginRight = '5px';

			let answerContainerTag = document.createElement('div');
			let answerImageTag = document.createElement('img');
			let isWrongAnswer = isManipulatedArea == isManipulated;
			if(isWrongAnswer){
				answerContainerTag.className = 'answerContainer wrongAnswerContainer';
				answerImageTag.src = 'assets/close.png';
			} else {
				answerContainerTag.className = 'answerContainer rightAnswerContainer';
				answerImageTag.src = 'assets/tick.png';
			}
			answerContainerTag.appendChild(answerImageTag);
			imageContainerTag.appendChild(answerContainerTag);
		}

		Object.values(pageState.images.manipulatedArea).forEach(imageData => displayAnswer(imageData, true));
		Object.values(pageState.images.notManipulatedArea).forEach(imageData => displayAnswer(imageData, false));

		let selectionAreaTextContainers = [].slice.call(document.getElementsByClassName('selectionAreaTextContainer'))
		selectionAreaTextContainers.forEach(el => el.parentNode.removeChild(el))

		resolve();
	}
}

async function createPageManipulated(jsonData, nbImages){
	let pageState = {
		'images': {
			'startingArea': {},
			'manipulatedArea': {},
			'notManipulatedArea': {},
		}
	};

	return new Promise(async function(resolve, reject) {
		let globalContainer = document.getElementById("globalContainer");
		while (globalContainer.firstChild) {
			globalContainer.removeChild(globalContainer.firstChild);
		}

		let headerTag = createHeader();
		globalContainer.appendChild(headerTag);

		let footerTag = createFooter();
		globalContainer.appendChild(footerTag);

		let contentTag = createContent(pageState);
		globalContainer.insertBefore(contentTag, footerTag);

		let minimalAmountOfImagesPerTypeRatio = 0.2;
		let {nbManipulatedImages, nbNotManipulatedImages} = getNbImages(nbImages, minimalAmountOfImagesPerTypeRatio);
		let imagesUrlList = getListUrlImages(jsonData, nbManipulatedImages, nbNotManipulatedImages);
		await createImageCollageLayout(imagesUrlList, jsonData, pageState);

		let submitButton = document.getElementById('submitButton');
		submitButton.addEventListener('click', onSubmitButtonClick(resolve, jsonData, pageState));
	});
}

function imageDropAreaOnDrop(nameArea, selectionAreaImagesContainerTag, pageState){
	return function(event){
		let imageId = event
			.dataTransfer
			.getData('imageId');
		let imageSrc = event
			.dataTransfer
			.getData('imageSrc');

		let imageTag = document.getElementById(imageId);
		let imagesContainerTag = document.getElementById('imagesContainer');
		imagesContainerTag.removeChild(imageTag);

		let imageContainerTag = document.createElement('div');
		imageContainerTag.className = 'imageContainer';

		let newImageTag = document.createElement('img');
		newImageTag.src = imageTag.src;
		newImageTag.id = imageTag.id;

		imageContainerTag.appendChild(newImageTag);
		selectionAreaImagesContainerTag.appendChild(imageContainerTag);

		let newCategory = nameArea == 'manipulated' ? 'manipulatedArea' : 'notManipulatedArea';
		pageState.images[newCategory][imageSrc] = pageState.images.startingArea[imageSrc];
		delete pageState.images.startingArea[imageSrc];
		pageState.images[newCategory][imageSrc].tag = newImageTag;

		event.preventDefault();
	}
}

function getListUrlImages(data, nbManipulatedImages, nbNotManipulatedImages){
	let manipulatedImages = data.filter(imageData => imageData.manipulated);
	let notManipulatedImages = data.filter(imageData => !imageData.manipulated);

	manipulatedImages = shuffle(manipulatedImages);
	notManipulatedImages = shuffle(notManipulatedImages);

	let listImages = manipulatedImages.slice(0, nbManipulatedImages).concat(notManipulatedImages.slice(0, nbNotManipulatedImages));
	listImages = shuffle(listImages);

	return listImages.map(imageData => imageData.filename);
}

async function getImagesSize(imagesSrc){
	return new Promise((resolve, reject) => {
		let imagesLoadingPromises = imagesSrc.map(imageSrc => {
			let imageTag = document.createElement("img");
			let url = 'images/' + imageSrc;

			let imageLoadingPromise = new Promise((resolve, reject) => {
				imageTag.addEventListener("load", function(){
					resolve({imageSrc, imageTag});
				});
			});

			imageTag.src = url;

			return imageLoadingPromise;
		});

		Promise.all(imagesLoadingPromises).then(imagesData => {
			let result = imagesData.reduce(function(map, imageData) {
				map[imageData.imageSrc] = {
					'width': imageData.imageTag.width,
					'height': imageData.imageTag.height
				};
				return map;
			}, {});

			resolve(result);
		});
	});
}

function getNbRowAndColumnsFromCellsAmount(cellsAmount){
	let nbImagesColumns = Math.ceil(Math.sqrt(cellsAmount));
	let nbImagesRows = Math.ceil(cellsAmount / nbImagesColumns);

	return {nbImagesColumns, nbImagesRows};
}

async function createImageCollageLayout(imagesSrc, jsonData, pageState){
	let imagesContainerTag = document.getElementById('imagesContainer');

	let {nbImagesColumns, nbImagesRows} = getNbRowAndColumnsFromCellsAmount(imagesSrc.length);

	let maxHeightRow = 200;
	let maxWidthColumn = 200;
	let gapWidth = 20;

	let minLeftMargin = 100;

	let heightRow = Math.min((imagesContainerTag.clientHeight - (nbImagesRows - 1) * gapWidth) / nbImagesRows, maxHeightRow);
	let widthColumn = Math.min(((imagesContainerTag.clientWidth - 2 * minLeftMargin) - (nbImagesColumns - 1) * gapWidth) / nbImagesColumns, maxWidthColumn);

	let widthRows = nbImagesColumns * widthColumn + (nbImagesColumns - 1) * gapWidth;

	let leftMargin = (imagesContainerTag.clientWidth - widthRows) / 2;

	let imagesSize = await getImagesSize(imagesSrc);

	Object.entries(imagesSize).forEach(([imageSrc, imageSize], imageIdx) => {
		let imageTag = createImageTagInGrid(imageSrc, imageSize, imageIdx, nbImagesColumns, widthColumn, heightRow, gapWidth, leftMargin);
		pageState.images.startingArea[imageSrc] = {
			'tag': imageTag,
			'manipulated': jsonData.filter(imageData => imageData.filename == imageSrc)[0].manipulated,
		};

		// Zoom
		imageTag.addEventListener('click', function (e) {
			let zoomDiv = document.createElement('div');
			zoomDiv.id = 'darkFrontDiv';

			let zoomedImage = document.createElement('img');
			zoomedImage.src = imageTag.src;

			zoomDiv.addEventListener('click', function (e) {
				document.body.removeChild(zoomDiv);
			});

			zoomDiv.appendChild(zoomedImage);
			document.body.appendChild(zoomDiv);
		});

		imagesContainerTag.appendChild(imageTag);
	});
}

function createImageTagInGrid(imageSrc, imageSize, imageIdx, nbImagesColumns, widthColumn, heightRow, gapWidth, leftMargin){
	let columnIdx = imageIdx % nbImagesColumns;
	let rowIdx = Math.floor(imageIdx / nbImagesColumns);

	let imageId = 'image' + imageIdx;

	let imageTag = document.createElement("img");
	imageTag.id = imageId
	imageTag.src = '/images/' + imageSrc;
	let x = columnIdx * (widthColumn + gapWidth) + leftMargin;
	let y = rowIdx * (heightRow + gapWidth);
	let imageSizeClamped = clampImageSize(imageSize.width, imageSize.height, widthColumn, heightRow);
	imageTag.style.position = 'absolute';
	imageTag.style.left = x + (widthColumn - imageSizeClamped.width) / 2 + 'px';
	imageTag.style.top = y + (heightRow - imageSizeClamped.height) / 2 + 'px';
	imageTag.style.maxWidth = widthColumn + 'px';
	imageTag.style.maxHeight = heightRow + 'px';

	imageTag.ondragstart = function(event) {
		event.dataTransfer.setData('imageId', imageId);
		event.dataTransfer.setData('imageSrc', imageSrc);
	}

	return imageTag;
}

/**
 * Clamps width and height to fit in a target width and height.
 * 
 * Clamps imageWidth and imageHeight to keep aspect ratio and have both of them inferior or equal to
 * respectively targetWidth and targetHeight.
 * 
 * Example :
 *                  _ _ _ _ _
 * imageWidth   6  |         |
 * imageHeight  3  |         |
 *                 |_ _ _ _ _|
 *                     _ _
 * targetWidth  2     |   |
 * targetHeight 2     |_ _|
 * 
 * finalWidth   2      _ _
 * finalHeight  1     |_ _|
 * 
 * @returns {object} An object with both width and height properties.
 */
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

async function loadJson(url) {
	return new Promise((resolve, reject) => {
		fetch(url)
		.then(response => response.json())
		.then(data => resolve(data.images));
	});
}

async function loadData() {
	return await loadJson("data/data.json");
}

async function timeout(delay){
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), delay);
	})
}

async function main(){
	if (!Array.prototype.last){
		Array.prototype.last = function(){
			return this[this.length - 1];
		};
	};

	let data = await loadData();

	await createPageManipulated(data, 2);
	await timeout(2000);
	await createPageManipulated(data, 4);
	await timeout(2000);
	await createPageManipulated(data, 9);
	await timeout(2000);
	await createPageManipulated(data, 16);
	await timeout(2000);

	alert('DONE');
}

main();