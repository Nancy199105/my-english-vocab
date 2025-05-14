document.addEventListener("DOMContentLoaded", () => {
    const btnModule1 = document.getElementById("btn-module1");
    const btnModule2 = document.getElementById("btn-module2");
    const btnModule3 = document.getElementById("btn-module3");
    const moduleTitle = document.getElementById("module-title");
    const wordListContainer = document.getElementById("word-list-container");
    const alphabetFilterContainer = document.getElementById("alphabet-filter-container");

    let allWordsData = [];
    let currentModule = 1;
    let currentAlphabetFilter = "All";

    const pronunciationIconSvg = `
        <svg class="pronunciation-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
    `;

    async function loadWordData() {
        try {
            const response = await fetch("words_data.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allWordsData = await response.json();
            console.log("Word data loaded successfully:", allWordsData.length, "words");
            if (allWordsData.length === 0) {
                wordListContainer.innerHTML = `<p class="error-message">单词数据为空，请检查 words_data.json 文件。</p>`;
                return;
            }
            renderContent();
        } catch (error) {
            console.error("Error loading word data:", error);
            wordListContainer.innerHTML = `<p class="error-message">加载单词数据失败，请稍后重试或联系管理员。详情: ${error.message}</p>`;
        }
    }

    function getPronunciationLink(word) {
        // Clean the word: remove content in parentheses, trim spaces
        let cleanWord = word.replace(/\([^\)]+\)/g, \'").trim();
        // Replace multiple spaces with a single hyphen for Cambridge dictionary URL
        cleanWord = cleanWord.replace(/\s+/g, "-");
        return `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord)}`;
    }

    function renderModule1() {
        moduleTitle.textContent = "按字母顺序浏览 (A-K)";
        alphabetFilterContainer.style.display = "block";
        generateAlphabetFilter();

        let filteredWords = allWordsData.filter(item => {
            const firstChar = item.word.trim().charAt(0).toUpperCase();
            return firstChar >= "A" && firstChar <= "K";
        });

        if (currentAlphabetFilter !== "All") {
            filteredWords = filteredWords.filter(item => item.word.trim().charAt(0).toUpperCase() === currentAlphabetFilter);
        }

        filteredWords.sort((a, b) => a.word.localeCompare(b.word));

        if (filteredWords.length === 0) {
            wordListContainer.innerHTML = `<p class="loading-message">没有找到符合条件的单词。</p>`;
            return;
        }

        let html = "";
        filteredWords.forEach(item => {
            html += `
                <div class="word-item">
                    <div class="word-details">
                        <span class="word-text">${item.word}</span>
                        <span class="word-pos">(${item.pos})</span>
                    </div>
                    <a href="${getPronunciationLink(item.word)}" target="_blank" title="点击听发音 - ${item.word}">
                        ${pronunciationIconSvg}
                    </a>
                </div>
            `;
        });
        wordListContainer.innerHTML = html;
    }

    function generateAlphabetFilter() {
        let filterHtml = 
            `<button data-letter="All" class="${currentAlphabetFilter === 'All' ? 'active-filter' : ''}">ALL</button>`;
        for (let i = 0; i < 11; i++) { // A-K
            const letter = String.fromCharCode(65 + i);
            filterHtml += 
            `<button data-letter="${letter}" class="${currentAlphabetFilter === letter ? 'active-filter' : ''}">${letter}</button>`;
        }
        alphabetFilterContainer.innerHTML = filterHtml;

        alphabetFilterContainer.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", (e) => {
                currentAlphabetFilter = e.target.dataset.letter;
                renderModule1();
            });
        });
    }

    function renderModule2() {
        moduleTitle.textContent = "按单元浏览 (英文-词性)";
        alphabetFilterContainer.style.display = "none";
        currentAlphabetFilter = "All"; // Reset filter

        const wordsByUnit = groupWordsByUnit(allWordsData);
        if (Object.keys(wordsByUnit).length === 0) {
            wordListContainer.innerHTML = `<p class="loading-message">没有找到单词数据。</p>`;
            return;
        }

        let html = "";
        for (const unit in wordsByUnit) {
            html += `<div class="unit-group"><h3 class="unit-title">${unit}</h3>`;
            wordsByUnit[unit].forEach(item => {
                html += `
                    <div class="word-item">
                        <div class="word-details">
                            <span class="word-text">${item.word}</span>
                            <span class="word-pos">(${item.pos})</span>
                        </div>
                        <a href="${getPronunciationLink(item.word)}" target="_blank" title="点击听发音 - ${item.word}">
                           ${pronunciationIconSvg}
                        </a>
                    </div>
                `;
            });
            html += `</div>`;
        }
        wordListContainer.innerHTML = html;
    }

    function renderModule3() {
        moduleTitle.textContent = "按单元浏览 (中文-词性)";
        alphabetFilterContainer.style.display = "none";
        currentAlphabetFilter = "All"; // Reset filter

        const wordsByUnit = groupWordsByUnit(allWordsData);
        if (Object.keys(wordsByUnit).length === 0) {
            wordListContainer.innerHTML = `<p class="loading-message">没有找到单词数据。</p>`;
            return;
        }

        let html = "";
        for (const unit in wordsByUnit) {
            html += `<div class="unit-group"><h3 class="unit-title">${unit}</h3>`;
            wordsByUnit[unit].forEach(item => {
                html += `
                    <div class="word-item">
                        <div class="word-details">
                            <span class="word-meaning">${item.meaning}</span>
                            <span class="word-pos">(${item.pos})</span>
                        </div>
                        <a href="${getPronunciationLink(item.word)}" target="_blank" title="点击听发音 - ${item.word}">
                            ${pronunciationIconSvg}
                        </a>
                    </div>
                `;
            });
            html += `</div>`;
        }
        wordListContainer.innerHTML = html;
    }

    function groupWordsByUnit(data) {
        return data.reduce((acc, word) => {
            const unit = word.unit || "未知单元";
            if (!acc[unit]) {
                acc[unit] = [];
            }
            acc[unit].push(word);
            return acc;
        }, {});
    }

    function setActiveButton(activeBtn) {
        [btnModule1, btnModule2, btnModule3].forEach(btn => btn.classList.remove("active"));
        activeBtn.classList.add("active");
    }

    function renderContent() {
        wordListContainer.innerHTML = `<p class="loading-message">正在加载内容...</p>`;
        switch (currentModule) {
            case 1:
                renderModule1();
                break;
            case 2:
                renderModule2();
                break;
            case 3:
                renderModule3();
                break;
            default:
                renderModule1(); // Default to module 1
        }
    }

    btnModule1.addEventListener("click", () => {
        currentModule = 1;
        setActiveButton(btnModule1);
        renderContent();
    });

    btnModule2.addEventListener("click", () => {
        currentModule = 2;
        setActiveButton(btnModule2);
        renderContent();
    });

    btnModule3.addEventListener("click", () => {
        currentModule = 3;
        setActiveButton(btnModule3);
        renderContent();
    });

    // Initial load
    loadWordData();
});

