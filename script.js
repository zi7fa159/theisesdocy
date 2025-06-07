document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('contentArea');
    const addTextButton = document.getElementById('addText');
    const addImageButton = document.getElementById('addImage');
    const addListButton = document.getElementById('addList');

    // Function to add a new text block
    addTextButton.addEventListener('click', () => {
        const newParagraph = document.createElement('p');
        newParagraph.textContent = 'New text block. Edit me!';
        contentArea.appendChild(newParagraph);
        // Optionally, focus the content area or the new paragraph
        contentArea.focus();
    });

    // Placeholder for Add Image functionality
    addImageButton.addEventListener('click', () => {
        // Create an input element of type 'file'
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*'; // Accept only image files

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result; // This is the base64 data URL
                    img.alt = file.name; // Set alt text to the file name
                    img.style.maxWidth = '100%'; // Basic styling
                    img.style.display = 'block'; // Ensure it's on its own line
                    contentArea.appendChild(img);
                    contentArea.focus(); // Focus content area after adding image
                };
                reader.onerror = (error) => { // Add this block
                    console.error('Error reading file:', error);
                    alert('Error reading file: ' + file.name);
                };
                reader.readAsDataURL(file); // Read the file as a data URL
            }
        });

        fileInput.click(); // Programmatically click the file input to open the dialog
    });

    // Placeholder for Add List functionality
    addListButton.addEventListener('click', () => {
        const listType = prompt("Enter list type: 'ul' for unordered, 'ol' for ordered", "ul");
        let newList;

        if (listType === 'ul') {
            newList = document.createElement('ul');
        } else if (listType === 'ol') {
            newList = document.createElement('ol');
        } else {
            alert("Invalid list type. Please enter 'ul' or 'ol'.");
            return;
        }

        const listItem1 = document.createElement('li');
        listItem1.textContent = 'First item';
        const listItem2 = document.createElement('li');
        listItem2.textContent = 'Second item';

        newList.appendChild(listItem1);
        newList.appendChild(listItem2);
        contentArea.appendChild(newList);
        contentArea.focus(); // Focus content area
    });

    const exportButton = document.getElementById('exportDoc');

    exportButton.addEventListener('click', () => {
        const contentArea = document.getElementById('contentArea');
        let contentHtml = contentArea.innerHTML;

        // Ensure the HTML is well-formed and complete for html-docx-js
        // It needs a full HTML structure.
        // We can also embed styles directly if needed.
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Academic Memo</title>
    <style>
       body { font-family: sans-serif; margin: 1in; } /* Assuming 1 inch margin as per default in many word processors */
       p { margin-bottom: 1em; line-height: 1.5; }
       img { max-width: 100%; height: auto; display: block; margin-top: 0.5em; margin-bottom: 0.5em; border: 1px solid #ddd; }
       ul, ol { margin-left: 2em; margin-bottom: 1em; }
       li { margin-bottom: 0.5em; }
       /* Add more specific styles as needed, for example: */
       h1, h2, h3 { /* Basic heading styles if you plan to support them via direct HTML editing */
           margin-top: 1.2em;
           margin-bottom: 0.6em;
           font-weight: bold;
       }
       h1 { font-size: 2em; }
       h2 { font-size: 1.5em; }
       h3 { font-size: 1.17em; }
       /* It's generally better to keep styles simple for HTML-to-DOCX conversion,
          as complex CSS might not translate well. */
    </style>
</head>
<body>
    ${contentHtml}
</body>
</html>`;

        try {
            // Ensure htmlDocx is available (it's exposed to window by the UMD build)
            if (typeof htmlDocx === 'undefined' || typeof saveAs === 'undefined') {
                alert('Required libraries (html-docx.js or FileSaver.js) not loaded correctly.');
                return;
            }

            const converted = htmlDocx.asBlob(fullHtml, {
                orientation: 'portrait', // or 'landscape'
                margins: { // values in twentieths of a point (1440 = 1 inch)
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                    header: 720,
                    footer: 720,
                    gutter: 0
                }
            });
            saveAs(converted, 'academic-memo.docx');
        } catch (error) {
            console.error('Error during Word export:', error);
            alert('Error exporting to Word: ' + error.message);
        }
    });
});
