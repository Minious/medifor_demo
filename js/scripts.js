function randInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createPageManipulated(data, nbImages){
    return new Promise(function(resolve, reject) {
        // console.log(data)

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
        questionTag.innerText = "Which one has been manipulated?"
        headerTag.appendChild(questionTag);
        globalContainer.appendChild(headerTag);

        let footerTag = document.createElement("div");
        footerTag.className = "footer";
        let submitButton = document.createElement("button");
        submitButton.innerText = "Submit";
        submitButton.addEventListener('click', function (e) {
            // console.log(document.getElementsByClassName("imagesContainer")[0])
            // console.log(document.getElementsByClassName("imagesContainer")[0].childNodes)
            Array.from(document.getElementsByClassName("imagesContainer")[0].childNodes).map(div => div.childNodes[0]).forEach(el => {
                // console.log(el)
                let isSelected = !!el.selectedImage;
                let isManipulated = !!el.manipulated;
                // console.log(el.idx, isSelected, isManipulated)
                if(isSelected != isManipulated)
                    el.style.boxShadow = "0 0 20px 3px rgba(255, 0, 0, 1)";
                else
                    el.style.boxShadow = "0 0 20px 3px rgba(0, 255, 0, 1)";

                // window.setTimeout(main, 2000);
                resolve();
            });
        });
        footerTag.appendChild(submitButton);
        globalContainer.appendChild(footerTag);

        let nbImagesColumns = Math.ceil(Math.sqrt(nbImages));
        let nbImagesRows = Math.ceil(nbImages / nbImagesColumns);
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let ratioImage = 1.3;
        let widthImageCell = 200;
        let gapCell = 10;

        let imagesContainerTag = document.createElement("div");
        imagesContainerTag.className = "imagesContainer";
        // imagesContainerTag.className = "imagesContainer";
        imagesContainerTag.style.display = "grid";
        imagesContainerTag.style.gridGap = gapCell + "px";
        imagesContainerTag.style.width = (nbImagesColumns * widthImageCell + (nbImagesColumns - 1) * gapCell) + "px";
        imagesContainerTag.style.gridTemplateColumns = "1fr ".repeat(nbImagesColumns);

        let imagesToAppend = [];
        imagesToAppend = imagesToAppend.concat(createImagesTags(manipulatedImages, nbManipulatedImages, widthImageCell));
        imagesToAppend = imagesToAppend.concat(createImagesTags(notManipulatedImages, nbNotManipulatedImages, widthImageCell));
        shuffle(imagesToAppend)
        imagesToAppend.forEach(imageToAppend => imagesContainerTag.appendChild(imageToAppend));

        // console.log(footerTag.clientHeight)

        globalContainer.insertBefore(imagesContainerTag, footerTag);
    });
}

function createImagesTags(imageArray, nbImages, widthImageCell){
    imagesCellsTags = [];
    for(let i=0;i<nbImages;i+=1){
        let indexImage = randInt(0, imageArray.length);

        let imageCellTag = document.createElement("div");
        imageCellTag.style.width = widthImageCell + "px";

        let imageTag = document.createElement("img");
        imageTag.style.width = widthImageCell * 0.8 + "px";
        imageTag.src = "images/" + imageArray[indexImage].filename;
        imageTag.manipulated = imageArray[indexImage].manipulated;
        imageTag.idx = indexImage;
        imageTag.addEventListener('click', function (e) {
            e.target.selectedImage = !e.target.selectedImage;
            // console.log(e.target.selectedImage)
            if(e.target.selectedImage)
                e.target.style.boxShadow = "0 0 20px 3px rgba(255, 255, 255, 0.3)";
            else
                e.target.style.boxShadow = "0 0 20px 3px rgba(0, 0, 0, 0.3)";
        });
        imageCellTag.appendChild(imageTag);
        imagesCellsTags.push(imageCellTag);
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
        }).then(() => alert('DONE'));
    });
}

main();