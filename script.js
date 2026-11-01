

const buttons = [
    
];
const template = "buttons/template-44mm.png";
const positions = [];

const menu = document.querySelector("#image-menu");
const button = document.querySelector("#generate-pdfInator");


init();

// get all the files the github repo has and put the url in the files (only accept svgs in case someone was supid)
// WAAA WE CANT USE THOSE FUCK MY TRANNY LIFE IM KILLING MYSELF
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
async function init() {


    const buttons = await getButtonPaths();
    console.log(buttons);
    const templateImage = await loadImage(template);
    const templateWidth = templateImage.width;
    const templateHeight = templateImage.height;


    // I am So smart
    for (let x = -1; x < 2; x++) {
        for (let y = -2; y < 3; y++) {
            positions.push([
                ((templateWidth - 1083) / 2)+((1083+334)*x),
                ((templateHeight - 1083) / 2)+((1083+57)*y)
            ]);
        }
    }
    


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

        menu.appendChild(label);
        menu.appendChild(document.createElement("br"));
    }


    button.addEventListener("click", () => {
        const selectedButtons = [...menu.querySelectorAll("input")]
            .map(input => ({
                path: input.dataset.path,
                amount: Number(input.value)
            }))
            .filter(button => button.amount > 0);

        generatePdfInator(selectedButtons, templateImage);
    });
}


// generates all the images!!
async function generatePdfInator(buttons, templateImage) {
    // using some bullshit from the internet 
    const MAX_BUTTONS = 15;

    let canvases = [];
    let ctx = null;
    let canvas = null;
    let positionIndex = 0;

    // makes a new image with the template width and height and sets the ctx to that one
    function createCanvas() {
        canvas = document.createElement("canvas");
        canvas.width = templateImage.width;
        canvas.height = templateImage.height;
        ctx = canvas.getContext("2d");

        canvases.push(canvas);
    }
    
    createCanvas();

    for (const button of buttons) {
        const image = await loadImage(button.path);

        for (let i = 0; i < button.amount; i++) {

            // Start a new page/canvas after every 15 buttons
            if (positionIndex > 0 && positionIndex % MAX_BUTTONS === 0) {
                // Draw template onto the previous canvas before creating a new one
                ctx.drawImage(templateImage, 0, 0);
                // we begin again (this thing is so cool)
                createCanvas();
            }

            // Position within the current sheet
            const localIndex = positionIndex % MAX_BUTTONS;

            const x = positions[localIndex][0];
            const y = positions[localIndex][1];

            // set it to 1083 cus thats the size of the buttons fuck you
            ctx.drawImage(image, x, y, 1083, 1083);

            positionIndex++;
        }
    }

    // Draw template onto the final canvas
    ctx.drawImage(templateImage, 0, 0);
    NoJs(canvases,canvas.width,canvas.height);

}

// this is cool it opens up a printer which is literally what we wanna do anyways!!!!
function NoJs(canvases, width, height) {
    // Open a temporary window
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @page {
                    size: ${width}px ${height}px;
                    margin: 0;
                }

                body {
                    margin: 0;
                }

                img {
                    display: block;
                    width: ${width}px;
                    height: ${height}px;
                    page-break-after: always;
                }

                img:last-child {
                    page-break-after: auto;
                }
            </style>
        </head>
        <body>
            ${canvases.map(c => 
                `<img src="${c.toDataURL("image/png")}">`
            ).join("")}
        </body>
        </html>
    `);

    printWindow.document.close();

    // Wait for all images to load before printing
    Promise.all(
        [...printWindow.document.images].map(img =>
            img.decode()
        )
    ).then(() => {
        printWindow.focus();
        printWindow.print();
    });
}

// uses JS instead
function JsPrinting(canvases,width,height) {
    // Create new PDF
    const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height]
    });

    // Add each canvas as a page in the PDF
    for (let i = 0; i < canvases.length; i++) {
        if (i > 0) {
            pdf.addPage([width, height], width > height ? "landscape" : "portrait");
        }

        const dataUrl = canvases[i].toDataURL("image/png");
        pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
    }

    // Save and trigger download for the combined PDF file
    pdf.save("buttons.pdf");
}

// loads the image 
function loadImage(path) {
    return new Promise((resolve, reject) => {

        const image = new Image();

        image.crossOrigin = "anonymous";

        image.onload = () => resolve(image);
        image.onerror = () => reject(
            new Error(`Could not load image: ${path}`)
        );

        image.src = path;
    });
}