var fs = require('fs');
var files = fs.readdirSync('/buttons/');
const buttons = files;
console.log(buttons)

async function getButtonPaths()  {
    console.log("AAAAAaa");
    const apiUrl =
    "https://api.github.com/repos/videomp4/v-s_vector_graphics/contents";
    const response = await fetch(apiUrl);
    const files = await response.json();
    const buttons = files
        .filter(file => file.type === "file" && file.name.endsWith(".svg"))
        .map(file => file.download_url);
        return buttons;
}