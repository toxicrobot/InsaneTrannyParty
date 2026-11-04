
const menu = document.querySelector("#image-menu");
const body = document.querySelector(".body");
var selectedButtons = {}
const temporaryImageUrls = [];
const previewState = {
    sheets: [],
    currentIndex: 0,
};

async function getButtonPaths()  {
    const apiUrl =
    "https://api.github.com/repos/videomp4/v-s_vector_graphics/contents";
    const response = await fetch(apiUrl);
    const files = await response.json();
    const buttons = files
        .filter(file => file.type === "file" && file.name.endsWith(".svg") && !file.name.includes("template"))
        .map(file => file.download_url);
        return buttons;
}


init();
async function init() {
    const buttons = await getButtonPaths();
    fillSelector(buttons);
    const prevButton = document.querySelector("#preview-prev");
    const nextButton = document.querySelector("#preview-next");
    const templateCheckbox = document.querySelector("#templateToggle");
    const imageUpload = document.querySelector("#image-upload");

    prevButton.addEventListener("click", () => movePreview(-1));
    nextButton.addEventListener("click", () => movePreview(1));
    imageUpload.addEventListener("change", (event) => {
        addImage(event);
    });

    window.addEventListener("beforeunload", () => {
        temporaryImageUrls.forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
    });
   
    fillSheet([]);
    templateCheckbox.addEventListener("change", function() {
        document.querySelectorAll(".template").forEach((templateImage) => {
            templateImage.style.display = this.checked ? "block" : "none";
        });
    });

}

function addImage(event) {
    const files = Array.from(event.target.files).filter((file) => file.type.startsWith("image/"));
    const imagePaths = files.map((file) => {
        const imageUrl = URL.createObjectURL(file);
        temporaryImageUrls.push(imageUrl);
        return imageUrl;
    });

    if (imagePaths.length) {
        fillSelector(imagePaths);
    }
    event.target.value = "";
}

function fillSelector(buttons) {
    for (const path of buttons) {
        // We can instead get the filenames
        const filename = path.split("/").pop();

        const label = document.createElement("label");
        label.className = "buttonSelector";

        const image = document.createElement("img");
        image.className = "previewImage";
        image.src = path;
        label.appendChild(image);

        /**
        const name = document.createElement("div");
        name.className = "buttonName";
        name.textContent = filename;
        label.appendChild(name);
        */

        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.value = "0";
        input.step = "1";
        input.dataset.path = path;

        label.appendChild(input);
        
        input.addEventListener("change", (event) => {
            selectedButtons[path] = event.target.value;
            const buttonList = buttonListOutOfSelectedButtons(selectedButtons);
            fillSheet(buttonList);
        });
        menu.appendChild(label);
    }
}

function fillSheet(pins) {
    const sheets = document.querySelector(".sheets");
    const showTemplate = document.querySelector("#templateToggle").checked;
    const sheetAmount = Math.max(Math.ceil(pins.length / 15), 1);
    const allSheets = [];
    let pindex = 0;

    for (let i = 0; i < sheetAmount; i++) {
        const sheet = document.createElement("div");
        sheet.className = "sheet";
        for (let j = 0; j < 15; j++) {
            const item = document.createElement("div");
            item.className = "pin";
            item.innerHTML = `
                <img class="button" src="${pins[pindex] || 'buttons/0_single_template-44mm.svg'}" alt="">
                <img class="template" src="buttons/0_single_template-44mm.svg" alt="">
            `;
            item.querySelector(".template").style.display = showTemplate ? "block" : "none";
            sheet.appendChild(item);
            pindex++;
        }
        allSheets.push(sheet);
    }

    previewState.sheets = allSheets;
    previewState.currentIndex = 0;
    sheets.replaceChildren(...allSheets);
    updatePreview();
}

function updatePreview() {
    const previewSheet = document.querySelector(".preview-sheet");
    const indexLabel = document.querySelector("#preview-index");
    const prevButton = document.querySelector("#preview-prev");
    const nextButton = document.querySelector("#preview-next");

    if (!previewSheet) return;

    if (!previewState.sheets.length) {
        previewSheet.replaceChildren();
        if (indexLabel) indexLabel.textContent = "Sheet 0 / 0";
        if (prevButton) prevButton.disabled = true;
        if (nextButton) nextButton.disabled = true;
        return;
    }

    previewState.currentIndex = Math.min(
        Math.max(previewState.currentIndex, 0),
        previewState.sheets.length - 1
    );

    const previewClone = previewState.sheets[previewState.currentIndex].cloneNode(true);
    previewSheet.replaceChildren(previewClone);

    if (indexLabel) {
        indexLabel.textContent = `Sheet ${previewState.currentIndex + 1} / ${previewState.sheets.length}`;
    }

    if (prevButton) prevButton.disabled = previewState.currentIndex === 0;
    if (nextButton) nextButton.disabled = previewState.currentIndex === previewState.sheets.length - 1;
}

function movePreview(direction) {
    if (!previewState.sheets.length) return;
    previewState.currentIndex = Math.min(
        Math.max(previewState.currentIndex + direction, 0),
        previewState.sheets.length - 1
    );
    updatePreview();
}

function buttonListOutOfSelectedButtons(selectedButtons) {
    var buttonList = []
    for (button in selectedButtons) {
        for(let i = 0; i < selectedButtons[button]; i++) {
            buttonList.push(button);
        }
    }
    return buttonList;

}