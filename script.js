// JavaScript logic for course interactivity will be added here

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    // Call functions to initialize pages
    if (document.getElementById('chapter-list-ul')) {
        populateChapterList();
    }
    if (document.body.id === 'chapter-page') { // We'll add this ID to chapter_template.html body
        loadChapterContent();
    }
    if (document.getElementById('progress-tracker-div')) {
        displayProgress();
        const resetButton = document.getElementById('reset-progress-button');
        if (resetButton) {
            resetButton.addEventListener('click', resetAllProgress);
        }
    }
    if (document.getElementById('feedback-form')) {
        handleFeedbackForm();
    }
});

const courseData = {
    chapters: [
        { id: 1, title: "Unleashing Your Inner Boss: Mindset, Vision & Goals", file: "chapter1_content.md" },
        { id: 2, title: "From Idea to Action: Business Planning & Validation", file: "chapter2_content.md" },
        { id: 3, title: "Money Matters: Financial Literacy & Funding Your Dream", file: "chapter3_content.md" },
        { id: 4, title: "Getting the Word Out: Marketing & Sales Fundamentals", file: "chapter4_content.md" },
        { id: 5, title: "Building Your Empire: Operations, Systems & Growth", file: "chapter5_content.md" },
        { id: 6, title: "The Power of Connection: Building Your Network & Support System", file: "chapter6_content.md" }
    ],
    // We will store markdown content here after fetching
    chapterContents: {},
    // We will store quiz data here, potentially extracted from markdown or defined separately
    quizzes: {}
};

// --- chapters.html ---
function populateChapterList() {
    const chapterListUl = document.getElementById('chapter-list-ul');
    if (!chapterListUl) return;

    const progress = getProgress();

    courseData.chapters.forEach(chapter => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `chapter_template.html?chapter=${chapter.id}`;
        link.textContent = `Chapter ${chapter.id}: ${chapter.title}`;
        if (progress[chapter.id]?.completed) {
            link.classList.add('completed');
            link.textContent += " (Completed)";
        }
        listItem.appendChild(link);
        chapterListUl.appendChild(listItem);
    });
}

// --- chapter_template.html ---

// Mock function to simulate fetching and parsing markdown
// In a real scenario, this would fetch the .md file and parse it.
async function fetchAndParseMarkdown(chapterFile) {
    // This is a simplified mock. Replace with actual fetch and markdown parsing.
    // For now, we'll assume a global `chaptersContent` object exists,
    // which would be populated by the Python script creating these files.
    // Example: chaptersContent['chapter1_content.md'] = "Parsed HTML or raw markdown"

    // Simulating a delay for fetching
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if content is already "fetched" by the (yet to be created) Python script
    if (typeof chaptersContent !== 'undefined' && chaptersContent[chapterFile]) {
        const rawMarkdown = chaptersContent[chapterFile];

        // Basic Markdown to HTML conversion (very simplified)
        // Headlines (h1, h2, h3)
        let htmlContent = rawMarkdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        htmlContent = htmlContent.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        htmlContent = htmlContent.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        // Bold (**text** or __text__)
        htmlContent = htmlContent.replace(/\*\*(.*?)\*\*|__(.*?)__/gim, '<strong>$1$2</strong>');
        // Italic (*text* or _text_)
        htmlContent = htmlContent.replace(/\*(.*?)\*|_(.*?)_/gim, '<em>$1$2</em>');
        // Lists (- item or * item)
        htmlContent = htmlContent.replace(/^- (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>');
        htmlContent = htmlContent.replace(/^\* (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>');
        htmlContent = htmlContent.replace(/<\/ul>\n<ul>/gim, ''); // Combine adjacent lists
        // Paragraphs (split by newlines, filter empty)
        htmlContent = htmlContent.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
         // Remove <p> around <ul>
        htmlContent = htmlContent.replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>');


        // Extract quiz (assuming a specific format like "## Chapter X Quiz" followed by questions)
        const quizRegex = /# Chapter \d+ Quiz([\s\S]*)/i;
        const quizMatch = rawMarkdown.match(quizRegex);
        let quizHtml = '';
        let quizDataForStorage = [];

        if (quizMatch && quizMatch[1]) {
            const quizSectionMd = quizMatch[1].trim();
            // Remove quiz from main content
            htmlContent = htmlContent.replace(/<h1>Chapter \d+ Quiz[\s\S]*?<\/h1>/i, '');


            const questionsMd = quizSectionMd.split(/\n\s*\d+\.\s+/).slice(1); // Split by "1. ", "2. ", etc.

            quizHtml = questionsMd.map((qMd, index) => {
                const lines = qMd.split('\n').map(l => l.trim()).filter(l => l);
                const questionText = lines[0];
                const options = [];
                let correctAnswerLetter = '';

                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].startsWith('*')) { // Options like "* a) Option A"
                        const optionMatch = lines[i].match(/^\*\s*([a-d])\)\s*(.*)/i);
                        if (optionMatch) {
                            options.push({ letter: optionMatch[1], text: optionMatch[2].trim() });
                        }
                    } else if (lines[i].toLowerCase().startsWith('* **answer:')) {
                        correctAnswerLetter = lines[i].match(/\*\s*\*\*answer:\s*([a-d])\*\*/i)[1];
                    }
                }

                quizDataForStorage.push({
                    question: questionText,
                    options: options.map(opt => opt.text), // Store only text for simplicity in this example
                    correctAnswer: options.find(opt => opt.letter === correctAnswerLetter)?.text
                });

                let optionsHtml = options.map(opt => `
                    <label>
                        <input type="radio" name="question${index}" value="${opt.text.replace(/"/g, '&quot;')}">
                        ${opt.letter}) ${opt.text}
                    </label>
                `).join('');
                return `<div class="quiz-question" data-question-index="${index}"><p>${index + 1}. ${questionText}</p>${optionsHtml}</div>`;
            }).join('');
        }
         // Store the extracted quiz data
        const urlParams = new URLSearchParams(window.location.search);
        const chapterId = parseInt(urlParams.get('chapter'));
        if (chapterId && quizDataForStorage.length > 0) {
            courseData.quizzes[chapterId] = quizDataForStorage;
        }

        return { mainContent: htmlContent, quizContentHtml: quizHtml, quizData: quizDataForStorage };
    }
    return { mainContent: "<p>Chapter content not found.</p>", quizContentHtml: "<p>Quiz not found.</p>", quizData: [] };
}


async function loadChapterContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const chapterId = parseInt(urlParams.get('chapter'));

    if (!chapterId || chapterId < 1 || chapterId > courseData.chapters.length) {
        document.getElementById('chapter-content-article').innerHTML = "<p>Invalid chapter selected.</p>";
        return;
    }
    // Add id to body for page specific JS
    document.body.id = 'chapter-page';


    const chapter = courseData.chapters.find(c => c.id === chapterId);
    if (!chapter) {
        document.getElementById('chapter-content-article').innerHTML = "<p>Chapter not found.</p>";
        return;
    }

    document.title = `${chapter.title} - Be Your Own Damn Boss`;
    document.getElementById('chapter-main-title').textContent = chapter.title;

    const { mainContent, quizContentHtml, quizData } = await fetchAndParseMarkdown(chapter.file);

    const contentArticle = document.getElementById('chapter-content-article');
    contentArticle.innerHTML = mainContent; // Render main content

    const quizContentDiv = document.getElementById('quiz-content-div');
    if (quizContentHtml) {
        quizContentDiv.innerHTML = quizContentHtml; // Render quiz questions
        courseData.quizzes[chapterId] = quizData; // Store parsed quiz data
    } else {
        quizContentDiv.innerHTML = "<p>No quiz for this chapter.</p>";
        document.getElementById('submit-quiz-button').classList.add('hidden');
    }


    updateChapterCompletionStatus(chapterId);
    setupNavigationButtons(chapterId);

    const submitQuizButton = document.getElementById('submit-quiz-button');
    if (submitQuizButton && quizData.length > 0) {
        submitQuizButton.addEventListener('click', () => handleSubmitQuiz(chapterId));
    } else if (submitQuizButton) {
        submitQuizButton.classList.add('hidden'); // Hide if no quiz data
    }


    const markCompleteButton = document.getElementById('mark-complete-button');
    markCompleteButton.addEventListener('click', () => {
        markChapterComplete(chapterId);
        updateChapterCompletionStatus(chapterId);
        // Optionally, navigate to next chapter or chapters page
        // window.location.href = 'chapters.html';
    });
}

function handleSubmitQuiz(chapterId) {
    const quizData = courseData.quizzes[chapterId];
    if (!quizData) {
        document.getElementById('quiz-result-div').textContent = 'Quiz data not found.';
        return;
    }

    let score = 0;
    const questionsHtml = document.querySelectorAll('#quiz-content-div .quiz-question');

    questionsHtml.forEach((questionElement, index) => {
        const questionIndex = parseInt(questionElement.dataset.questionIndex); // Get original index
        const selectedOption = questionElement.querySelector(`input[name="question${questionIndex}"]:checked`);

        if (selectedOption) {
            // In our simplified quizData, correctAnswer is the text of the answer.
            if (selectedOption.value === quizData[questionIndex].correctAnswer) {
                score++;
            }
        }
    });

    const resultDiv = document.getElementById('quiz-result-div');
    const percentage = (score / quizData.length) * 100;
    resultDiv.textContent = `You scored ${score} out of ${quizData.length} (${percentage.toFixed(0)}%).`;

    // Optionally, mark chapter as complete if quiz score is sufficient
    if (percentage >= 0) { // Allow completion even if score is 0, or set a threshold like 75
        markChapterComplete(chapterId);
        updateChapterCompletionStatus(chapterId);
    }
}


function updateChapterCompletionStatus(chapterId) {
    const progress = getProgress();
    const markCompleteButton = document.getElementById('mark-complete-button');
    if (progress[chapterId]?.completed) {
        markCompleteButton.textContent = 'Completed!';
        markCompleteButton.disabled = true;
        markCompleteButton.style.backgroundColor = '#28a745'; // Green
    } else {
        markCompleteButton.textContent = 'Mark as Complete';
        markCompleteButton.disabled = false;
        markCompleteButton.style.backgroundColor = '#007bff'; // Blue
    }
}

function setupNavigationButtons(chapterId) {
    const prevButton = document.getElementById('prev-chapter-button');
    const nextButton = document.getElementById('next-chapter-button');

    if (chapterId > 1) {
        prevButton.classList.remove('hidden');
        prevButton.onclick = () => { window.location.href = `chapter_template.html?chapter=${chapterId - 1}`; };
    } else {
        prevButton.classList.add('hidden');
    }

    if (chapterId < courseData.chapters.length) {
        nextButton.classList.remove('hidden');
        nextButton.onclick = () => { window.location.href = `chapter_template.html?chapter=${chapterId + 1}`; };
    } else {
        nextButton.classList.add('hidden');
    }
}


// --- Progress Management (localStorage) ---
const PROGRESS_KEY = 'courseProgress_bydb';

function getProgress() {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function markChapterComplete(chapterId) {
    const progress = getProgress();
    if (!progress[chapterId]) {
        progress[chapterId] = {};
    }
    progress[chapterId].completed = true;
    // Could also store quiz scores here: progress[chapterId].quizScore = score;
    saveProgress(progress);
    console.log(`Chapter ${chapterId} marked as complete. Progress:`, getProgress());
}

function resetChapterProgress(chapterId) {
    const progress = getProgress();
    if (progress[chapterId]) {
        progress[chapterId].completed = false;
        // progress[chapterId].quizScore = null;
    }
    saveProgress(progress);
}

function resetAllProgress() {
    if (confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
        localStorage.removeItem(PROGRESS_KEY);
        // Reflect changes on the current page if it's progress or chapter list
        if (document.getElementById('progress-tracker-div')) {
            displayProgress(); // Redraw progress
        }
        if (document.getElementById('chapter-list-ul')) {
            document.getElementById('chapter-list-ul').innerHTML = ''; // Clear list
            populateChapterList(); // Repopulate to remove "Completed" status
        }
         // If on a chapter page, update its completion button
        const urlParams = new URLSearchParams(window.location.search);
        const chapterId = parseInt(urlParams.get('chapter'));
        if (chapterId && document.getElementById('mark-complete-button')) {
            updateChapterCompletionStatus(chapterId);
        }

        console.log("All progress reset.");
    }
}


// --- progress.html ---
function displayProgress() {
    const progressTrackerDiv = document.getElementById('progress-tracker-div');
    if (!progressTrackerDiv) return;

    const progress = getProgress();
    let completedCount = 0;
    const totalChapters = courseData.chapters.length;

    const ul = document.createElement('ul');
    courseData.chapters.forEach(chapter => {
        const li = document.createElement('li');
        let status = "Not Started";
        if (progress[chapter.id]?.completed) {
            status = "Completed";
            completedCount++;
            li.classList.add('completed');
        }
        li.textContent = `Chapter ${chapter.id}: ${chapter.title} - ${status}`;
        ul.appendChild(li);
    });

    const summaryP = document.createElement('p');
    summaryP.textContent = `You have completed ${completedCount} out of ${totalChapters} chapters.`;

    progressTrackerDiv.innerHTML = ''; // Clear previous content
    progressTrackerDiv.appendChild(summaryP);
    progressTrackerDiv.appendChild(ul);
}

// --- feedback.html ---
function handleFeedbackForm() {
    const feedbackForm = document.getElementById('feedback-form');
    if (!feedbackForm) return;

    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const rating = document.getElementById('rating').value;
        const comments = document.getElementById('comments').value;

        // In a real application, you would send this data to a server.
        // For this project, we'll just log it and show a confirmation.
        console.log('Feedback Submitted:', { name, email, rating, comments });

        // Store feedback in localStorage (optional, just for this project)
        const feedbackData = JSON.parse(localStorage.getItem('courseFeedback_bydb')) || [];
        feedbackData.push({ name, email, rating, comments, date: new Date().toISOString() });
        localStorage.setItem('courseFeedback_bydb', JSON.stringify(feedbackData));

        feedbackForm.reset();
        document.getElementById('feedback-confirmation').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('feedback-confirmation').classList.add('hidden');
        }, 3000);
    });
}

// Placeholder for chapter content - this will be populated by Python script
// const chaptersContent = {
// "chapter1_content.md": `... markdown content ...`,
// ... etc.
// };
// This chaptersContent object needs to be written into script.js or a separate JS file
// by the Python script that has access to the markdown file contents.
// For development, you might manually paste some content here.
// For this project, the Python agent will need to create a new file `chapter_data.js`
// and populate it with this structure, then `script.js` would need to load it,
// or the agent could directly inject it into this `script.js` file.
// Given the tools, direct injection into script.js is more feasible.
// Let's assume the agent will modify this script.js to include chaptersContent.

console.log('script.js loaded and event listeners should be active.');
