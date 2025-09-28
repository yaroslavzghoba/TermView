const slideDataFile = './data.json';
const textElement = document.getElementById('text');
const touchAreaElement = document.getElementById('touchArea');
const selectedClassName = 'selected';

const sourceTextNewLineCode = '\n'
const sourceTextHighlightCode = '\\~'
const sourceTextShortDelayCode = '\\ds'
const sourceTextMediumDelayCode = '\\dm'
const sourceTextLongDelayCode = '\\dl'
const outputTextNewLineCode = '<br>'
const outputTextHighlightOpenCode = `<span class="${selectedClassName}">`
const outputTextHighlightCloseCode = '</span>'
const outputTextSpaceCode = '&nbsp;'

let slides = []
let currentSlideIndex = 0;
let isAnimationInProgress = false
const minDelayBetweenCharsMs = 10;
const maxDelayBetweenCharsMs = 30;
const shortDelayBetweenCharsMs = 150;
const mediumDelayBetweenCharsMs = 300;
const longDelayBetweenCharsMs = 600;
const emptyLineCharacter = '~'
let previousScreenWidth = window.innerWidth;
let previousScreenHeight = window.innerHeight;
const characterDimensions = getCharacterDimensions();
const minLinesPerSlide = 2;
let linesPerSlide = minLinesPerSlide;
const minCharactersPerLine = 30;
let charactersPerLine = minCharactersPerLine;

// Initialize lines per slide and characters per line
window.addEventListener('load', () => {
    updateCharactersPerLine(textElement);
    updateLinesPerSlide(textElement);
});

window.addEventListener('resize', function() {
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;

    // Update lines per slide and characters per line if dimensions changed
    if (newWidth !== previousScreenWidth) updateCharactersPerLine(textElement);
    if (newHeight !== previousScreenHeight) updateLinesPerSlide(textElement);

    previousScreenWidth = newWidth;
    previousScreenHeight = newHeight;
});

document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Determine the new slide index based on the key pressed
    let newSlideIndex = currentSlideIndex;
    if (key === 'ArrowLeft') {
        console.log('Left arrow key pressed.');
        newSlideIndex = currentSlideIndex - 1;
    } else if (key === 'ArrowRight') {
        console.log('Right arrow key pressed.');
        newSlideIndex = currentSlideIndex + 1;
    } else {
        return;
    }

    if (newSlideIndex !== currentSlideIndex) {
        switchSlide(newSlideIndex);
    }
});

// Add event listeners for both touch and mouse events
touchAreaElement.addEventListener('touchstart', handleTouch);
touchAreaElement.addEventListener('mousedown', handleClick); // Use mousedown for instant response

// Function to handle the touch event
function handleTouch(event) {
    // Prevent default touch behaviors like scrolling or zooming
    event.preventDefault();
    const touch = event.touches[0] || event.changedTouches[0];
    const element = event.currentTarget;

    if (touch) {
        handleCoordinates(element, touch.clientX);
    }
}

// Function to handle mouse click for desktop support
function handleClick(event) {
    // Get the target element of the touch event
    const element = event.currentTarget;
    handleCoordinates(element, event.clientX);
}

// Calculate the exact position of the click relative to the element's top-left corner
function handleCoordinates(element, x) {
    const rect = element.getBoundingClientRect();
    const xFraction = Math.round(x - rect.left) / rect.width;
    
    // Determine the new slide index based on the 
    let newSlideIndex = currentSlideIndex;
    if (xFraction < 0.5) {
        console.log('Left side touched/clicked.');
        newSlideIndex = currentSlideIndex - 1;
    } else {
        console.log('Right side touched/clicked.');
        newSlideIndex = currentSlideIndex + 1;
    }

    if (newSlideIndex !== currentSlideIndex) {
        switchSlide(newSlideIndex);
    }
}

// Switch to a new slide by index
function switchSlide(newSlideIndex) {
    if (newSlideIndex < 0 || newSlideIndex >= slides.length) {
        console.log('Slide index out of bounds.');
        return;
    }
    if (isAnimationInProgress) {
        console.log('Animation in progress. Please wait until it finishes.');
        return;
    }
    console.log(`Current slide index: ${currentSlideIndex}, New slide index: ${newSlideIndex}`);
    currentSlideIndex = newSlideIndex;
    const currentSlide = slides[currentSlideIndex];
    setSlide(currentSlide);
}

// Update the number of characters per line based on the container width
function updateCharactersPerLine(container) {
    if (!container) throw new Error('Container element is missing.');

    const characterWidth = getCharacterDimensions().width;
    const containerWidth = container.offsetWidth;

    // Calculate the number of characters.
    if (characterWidth > 0) {
        const newCharactersPerLine = Math.floor(containerWidth / characterWidth);
        charactersPerLine = Math.max(minCharactersPerLine, newCharactersPerLine);
    } else {
        throw new Error('Character width is zero, cannot calculate a number of characters per line.');
    }
}

// Update the number of lines per slide based on the container height
function updateLinesPerSlide(container) {
    if (!container) throw new Error('Container element is missing.');

    const characterHeight = getCharacterDimensions().height;
    const containerHeight = container.offsetHeight;

    // Calculate the number of lines.
    if (characterHeight > 0) {
        const newLinesPerSlide = Math.floor(containerHeight / characterHeight);
        linesPerSlide = Math.max(minLinesPerSlide, newLinesPerSlide - 1);
    } else {
        throw new Error('Character height is zero, cannot calculate a number of lines per slide.');
    }
}

// Get the width and height of a single character
function getCharacterDimensions() {
    const style = getComputedStyle(textElement);
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre'; // Ensures consistent spacing
    tempSpan.style.fontFamily = style.getPropertyValue('font-family');
    tempSpan.style.fontSize = style.getPropertyValue('font-size');
    tempSpan.textContent = 'W';
    document.body.appendChild(tempSpan);

    const charWidth = tempSpan.offsetWidth;
    const charHeight = tempSpan.offsetHeight;
    document.body.removeChild(tempSpan);

    if (charWidth > 0 && charHeight > 0) {
        return { width: charWidth, height: charHeight };
    } else {
        throw new Error('Character width or height is zero, cannot calculate dimensions.');
    }
}

// Extract slide data from JSON file.
function getSlideData(filename) {
    console.log(`Reading the "${filename}" file.`);
    const slideData = fetch(filename)
        .then(response => response.json())
        .then(data => {
            console.log('Slide data extracted:', data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching slide data:', error);
        });

    if (!slideData) {
        throw new Error('Slide data is missing or invalid.');
    } {
        return slideData;
    }
}

// Add a HTML span to make passed character selected.
function applyHighlighting(text) {
    return `${outputTextHighlightOpenCode}${text}${outputTextHighlightCloseCode}`;
}

// Set text content of the paragraph element
function setText(text) {
    textElement.innerHTML = text;
}

// Format lines and print them to the text element
function printFormatted(text, slideName, currentLineNum, currentColumnNum) {
    let lines = text.split(outputTextNewLineCode);

    // Remove the first lines until the last ones are visible
    while (lines.length > linesPerSlide - 1) {
        lines.splice(0, 1);
    };
    // Add characters to the empty lines
    while (lines.length < linesPerSlide - 1) {
        lines.push(emptyLineCharacter);
    };

    // Closing row that contains slide name and cursor position.
    const footer = applyHighlighting(`${slideName} [+] ${currentLineNum},${currentColumnNum} All`);
    lines.push(footer);

    const textToPrint = lines.join(outputTextNewLineCode);
    setText(textToPrint);
}

// Delay function to pause execution for a specified time
function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Get a random delay between min and max values
// The he minimum is inclusive and the maximum is exclusive
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

// Replace all user-entered special formatting codes with codes required for printing.
function getCharactersToPrint(text) {
    console.log('Getting characters to print using provided text...')
    const charactersToPrint = [];
    // Specifies if is the last opening text highlight code not closed by a closing highlight code.
    let isTextHighlighting = false;

    while (text.length > 0) {
        if (text.startsWith(sourceTextNewLineCode)) {
            text = text.replace(sourceTextNewLineCode, '');
            charactersToPrint.push(outputTextNewLineCode);
            console.log(`    New line code was detected. Replacing the code with "${outputTextNewLineCode}"...`);
        } else if (text.startsWith(sourceTextHighlightCode)) {
            isTextHighlighting = !isTextHighlighting
            text = text.replace(sourceTextHighlightCode, '');
            console.log(`    Text highlight code was detected. ${isTextHighlighting ? 'Enabling' : 'Disabling'} text highlighting...`);
        } else if (text.startsWith(sourceTextShortDelayCode)) {
            text = text.replace(sourceTextShortDelayCode, '');
            charactersToPrint.push(sourceTextShortDelayCode);
            console.log(`    Short delay code was detected.`);
        } else if (text.startsWith(sourceTextMediumDelayCode)) {
            text = text.replace(sourceTextMediumDelayCode, '');
            charactersToPrint.push(sourceTextMediumDelayCode);
            console.log(`    Medium delay code was detected.`);
        } else if (text.startsWith(sourceTextLongDelayCode)) {
            text = text.replace(sourceTextLongDelayCode, '');
            charactersToPrint.push(sourceTextLongDelayCode);
            console.log(`    Long delay code was detected.`);
        } else {
            let sourceCharacter = text[0];
            text = text.replace(sourceCharacter, '');
            // Replace a regular space with a special code.
            sourceCharacter = (sourceCharacter === ' ') ? outputTextSpaceCode : sourceCharacter;
            // Apply highlighting to the character 
            // if there was unclosed opening highlight code in the text before.
            const characterToPrint = isTextHighlighting ? applyHighlighting(sourceCharacter) : sourceCharacter;
            charactersToPrint.push(characterToPrint);

            console.log(`    Handling "${sourceCharacter}" character...`);
            if (sourceCharacter === ' ') console.log(`        Replacing a regular space with a ${outputTextSpaceCode} code...`)
            if (isTextHighlighting) console.log(`        Applying highlight to the character...`);
        }
    }
    console.log(`Text to print: "${charactersToPrint.join('')}"`);
    return charactersToPrint
}

// Animate printing of the slide text
async function setSlide(slide) {
    if (!slide || !slide.slide_name) {
        throw new Error('Slide or its name is missing.');
    }
    const slideName = slide.slide_name;
    const slideText = slide.text;

    // Print each character one by one with the cursor
    isAnimationInProgress = true;
    const charactersToPrint = getCharactersToPrint(slideText);
    let currentLineNum = 1, currentColumnNum = 1;
    // Print a highlighted space to create a cursor effect.
    let spaceWithCursor = applyHighlighting(outputTextSpaceCode);
    printFormatted(spaceWithCursor, slideName, currentLineNum, currentColumnNum);
    const printedCharacters = []
    for (let characterIndex = 0; characterIndex < charactersToPrint.length; characterIndex++) {
        const sourceCharacter = charactersToPrint[characterIndex];

        // Set the corresponding delay if the output character is equal to one of the special delay codes, 
        // and skip printing the code
        if (sourceCharacter === sourceTextShortDelayCode) {
            console.log(`Short delay code was detected. Setting a delay of ${shortDelayBetweenCharsMs} milliseconds...`)
            await delay(shortDelayBetweenCharsMs);
            continue;
        } else if (sourceCharacter === sourceTextMediumDelayCode) {
            console.log(`Medium delay code was detected. Setting a delay of ${mediumDelayBetweenCharsMs} milliseconds...`)
            await delay(mediumDelayBetweenCharsMs);
            continue;
        } else if (sourceCharacter === sourceTextLongDelayCode) {
            console.log(`Long delay code was detected. Setting a delay of ${longDelayBetweenCharsMs} milliseconds...`)
            await delay(longDelayBetweenCharsMs);
            continue;
        }

        textToPrint = [...printedCharacters, sourceCharacter, spaceWithCursor].join('');
        if (sourceCharacter === outputTextNewLineCode) {
            currentLineNum++
            currentColumnNum = 1
        } else {
            currentColumnNum++
        }
        printFormatted(textToPrint, slideName, currentLineNum, currentColumnNum);
        // Save the unselected character to history to create illusion 
        // that cursor was moved after printing.
        printedCharacters.push(sourceCharacter);

        const delayMs = getRandomInt(minDelayBetweenCharsMs, maxDelayBetweenCharsMs);
        await delay(delayMs);
    }
    isAnimationInProgress = false;
}

async function main() {
    try {
        slides = await getSlideData(slideDataFile);
        if (!slides || slides.length === 0) {
            throw new Error('No slides found in the slide data.');
        }
        console.log(`Slides loaded successfully:`, slides);
    } catch (error) {
        console.error("Error loading slides:", error);
    }

    if (linesPerSlide < 2) {
        throw new Error('Maximum lines per slide must be at least 2.');
    }
    let currentSlide = slides[currentSlideIndex];
    setSlide(currentSlide);
}

main();