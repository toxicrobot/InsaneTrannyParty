
const menu = document.querySelector("#image-menu");
const body = document.querySelector(".body");
var selectedButtons = {}
async function getButtonPaths()  {
    const apiUrl =
    "https://api.github.com/repos/videomp4/v-s_vector_graphics/contents";
    const response = await fetch(apiUrl);
    const files = await response.json();
    const buttons = files
        .filter(file => file.type === "file" && file.name.endsWith(".svg"))
        .map(file => file.download_url);
        return buttons;
}


init();
async function init() {
    const buttons = await getButtonPaths();
    fillSelector(buttons);
}

function fillSelector(buttons) {
        // Create a number input for every image (fuck ugly, you can deal with making it pretty yourself xoxo )
    for (const path of buttons) {
        // We can instead get the filenames
        const filename = path.split("/").pop();

        const label = document.createElement("label");
        label.textContent = filename + " ";

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
        menu.appendChild(document.createElement("br"));
    }
}

function fillSheet(pins) {
        const sheets = document.querySelector(".sheets");
        const newSheets = document.createDocumentFragment();
        const sheetAmount = Math.max(Math.ceil(pins.length / 15),1);
        console.log(sheetAmount);
        var pindex = 0;
        for (let i = 0; i < sheetAmount; i++) {
            const sheet = document.createElement("div");
            sheet.className = "sheet"
            for (let i = 0; i < 15; i++) {
                const item = document.createElement("div");
                item.className = "pin";
                item.innerHTML = `
                    <img class="template" src="buttons/0_single_template-44mm.svg" alt="">
                    <img class="button" src="${pins[pindex] || 'buttons/0_single_template-44mm.svg'}" alt="">
                `;
                sheet.appendChild(item);
                pindex++;
            }
            newSheets.appendChild(sheet);
        }
        
        sheets.replaceChildren(newSheets);


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