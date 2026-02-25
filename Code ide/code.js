// Simple Code IDE JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    // Load saved theme from localStorage (same as pixel art settings)
    const savedTheme = localStorage.getItem('pixelArtTheme') || 'light-mode';
    document.body.classList.add(savedTheme);

    console.log('Code IDE loaded with theme:', savedTheme);

    // Get elements
    const loadFolderBtn = document.getElementById('load-folder-btn');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');    const closeAllTabsBtn = document.getElementById('close-all-tabs-btn');    const newTabBtn = document.getElementById('new-tab-btn');
    const codeTextarea = document.getElementById('code-textarea');
    const codeHighlight = document.getElementById('code-highlight');
    const tabBar = document.getElementById('tab-bar');

    console.log('closeAllTabsBtn:', closeAllTabsBtn);

    // Syntax definitions
    const syntaxDefinitions = {
        javascript: {
            keywords: ["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "async", "await", "true", "false", "null", "undefined", "NaN", "Infinity"],
            builtins: ["Array", "Boolean", "Date", "Error", "Function", "JSON", "Math", "Number", "Object", "RegExp", "String", "Promise", "Map", "Set", "WeakMap", "WeakSet", "Symbol", "console", "window", "document", "navigator", "location", "history", "localStorage", "sessionStorage", "fetch", "XMLHttpRequest", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent"]
        },
        html: {
            tags: ["html", "head", "body", "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img", "input", "button", "form", "table", "tr", "td", "th", "ul", "ol", "li", "script", "style", "link", "meta", "title", "header", "footer", "nav", "section", "article", "aside", "main", "br", "hr"],
            attributes: ["id", "class", "style", "href", "src", "alt", "type", "value", "name", "placeholder", "onclick", "onload", "onchange", "onsubmit", "disabled", "checked", "selected", "width", "height", "border", "cellpadding", "cellspacing", "colspan", "rowspan"]
        },
        css: {
            properties: ["color", "background", "background-color", "border", "border-radius", "margin", "padding", "width", "height", "display", "position", "float", "clear", "font-family", "font-size", "font-weight", "text-align", "text-decoration", "line-height", "letter-spacing", "text-transform", "vertical-align", "overflow", "z-index", "opacity", "cursor", "transition", "animation", "transform", "box-shadow", "text-shadow", "background-image", "background-repeat", "background-position", "background-size", "flex", "flex-direction", "justify-content", "align-items", "grid", "grid-template-columns", "grid-template-rows"],
            values: ["none", "auto", "inherit", "initial", "unset", "block", "inline", "inline-block", "flex", "grid", "absolute", "relative", "fixed", "static", "left", "right", "center", "top", "bottom", "bold", "normal", "italic", "underline", "uppercase", "lowercase", "capitalize", "pointer", "default", "transparent", "white", "black", "red", "blue", "green", "yellow", "orange", "purple", "pink", "gray", "silver", "maroon", "navy", "olive", "teal", "lime", "aqua", "fuchsia"]
        },
        python: {
            keywords: ["and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else", "except", "False", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "None", "nonlocal", "not", "or", "pass", "raise", "return", "True", "try", "while", "with", "yield"],
            builtins: ["abs", "all", "any", "bin", "bool", "bytearray", "bytes", "callable", "chr", "classmethod", "compile", "complex", "delattr", "dict", "dir", "divmod", "enumerate", "eval", "exec", "filter", "float", "format", "frozenset", "getattr", "globals", "hasattr", "hash", "help", "hex", "id", "input", "int", "isinstance", "issubclass", "iter", "len", "list", "locals", "map", "max", "memoryview", "min", "next", "object", "oct", "open", "ord", "pow", "print", "property", "range", "repr", "reversed", "round", "set", "setattr", "slice", "sorted", "staticmethod", "str", "sum", "super", "tuple", "type", "vars", "zip", "__import__", "__name__"]
        },
        java: {
            keywords: ["abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "default", "do", "double", "else", "enum", "extends", "final", "finally", "float", "for", "goto", "if", "implements", "import", "instanceof", "int", "interface", "long", "native", "new", "package", "private", "protected", "public", "return", "short", "static", "strictfp", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "void", "volatile", "while", "true", "false", "null"],
            types: ["String", "Integer", "Double", "Boolean", "Character", "Byte", "Short", "Long", "Float", "Object", "ArrayList", "HashMap", "HashSet", "LinkedList", "Vector", "Stack", "Queue", "PriorityQueue", "TreeMap", "TreeSet", "LinkedHashMap", "LinkedHashSet", "System", "Math", "Arrays", "Collections", "Scanner", "Random", "File", "IOException", "Exception", "RuntimeException", "Class", "Method", "Field", "Constructor"]
        }
    };

    // Syntax highlighting function
    function updateSyntaxHighlighting() {
        const code = codeTextarea.value;
        const fileName = activeTabId ? tabs.find(t => t.id === activeTabId).fileName : '';
        const language = getLanguageFromFileName(fileName);

        if (!syntaxDefinitions[language]) {
            codeHighlight.innerHTML = escapeHtml(code);
            return;
        }

        let highlightedCode = escapeHtml(code);

        // Apply highlighting based on language
        switch(language) {
            case 'javascript':
                highlightedCode = highlightJavaScript(highlightedCode);
                break;
            case 'html':
                highlightedCode = highlightHTML(highlightedCode);
                break;
            case 'css':
                highlightedCode = highlightCSS(highlightedCode);
                break;
            case 'python':
                highlightedCode = highlightPython(highlightedCode);
                break;
            case 'java':
                highlightedCode = highlightJava(highlightedCode);
                break;
        }

        codeHighlight.innerHTML = highlightedCode;
    }

    function getLanguageFromFileName(fileName) {
        if (!fileName) return 'javascript';
        const ext = fileName.split('.').pop().toLowerCase();
        switch(ext) {
            case 'js': return 'javascript';
            case 'html': case 'htm': return 'html';
            case 'css': return 'css';
            case 'py': return 'python';
            case 'java': return 'java';
            default: return 'javascript';
        }
    }

    function highlightJavaScript(code) {
        const keywords = syntaxDefinitions.javascript.keywords.join('|');
        const builtins = syntaxDefinitions.javascript.builtins.join('|');

        // Strings
        code = code.replace(/(["'`])(.*?)\1/g, '<span class="string">$&</span>');
        // Comments
        code = code.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$&</span>');
        // Numbers
        code = code.replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>');
        // Keywords
        code = code.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="keyword">$&</span>');
        // Built-ins
        code = code.replace(new RegExp(`\\b(${builtins})\\b`, 'g'), '<span class="function">$&</span>');
        // Functions
        code = code.replace(/(\w+)\s*\(/g, '<span class="function">$1</span>(');
        // Variables (simple detection)
        code = code.replace(/\b(let|const|var)\s+(\w+)/g, '$1 <span class="variable">$2</span>');

        return code;
    }

    function highlightHTML(code) {
        const tags = syntaxDefinitions.html.tags.join('|');
        const attributes = syntaxDefinitions.html.attributes.join('|');

        // Comments
        code = code.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>');
        // Tags
        code = code.replace(new RegExp(`(&lt;/?(${tags})\\b)`, 'gi'), '<span class="keyword">$1</span>');
        // Attributes
        code = code.replace(new RegExp(`\\b(${attributes})\\s*=`, 'gi'), '<span class="variable">$1</span>=');
        // Strings
        code = code.replace(/(["'])(.*?)\1/g, '<span class="string">$&</span>');

        return code;
    }

    function highlightCSS(code) {
        const properties = syntaxDefinitions.css.properties.join('|');
        const values = syntaxDefinitions.css.values.join('|');

        // Comments
        code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$&</span>');
        // Properties
        code = code.replace(new RegExp(`\\b(${properties})\\s*:`, 'gi'), '<span class="function">$1</span>:');
        // Values
        code = code.replace(new RegExp(`:\\s*([^{};]+)`, 'g'), function(match, value) {
            return ': ' + value.replace(new RegExp(`\\b(${values})\\b`, 'gi'), '<span class="keyword">$1</span>');
        });
        // Selectors
        code = code.replace(/^([^{]+)\s*\{/gm, '<span class="variable">$1</span> {');
        // Numbers
        code = code.replace(/\b\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax)?\b/g, '<span class="number">$&</span>');

        return code;
    }

    function highlightPython(code) {
        const keywords = syntaxDefinitions.python.keywords.join('|');
        const builtins = syntaxDefinitions.python.builtins.join('|');

        // Strings
        code = code.replace(/(["'`])(.*?)\1/g, '<span class="string">$&</span>');
        // Comments
        code = code.replace(/(#.*$)/gm, '<span class="comment">$&</span>');
        // Numbers
        code = code.replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>');
        // Keywords
        code = code.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="keyword">$&</span>');
        // Built-ins
        code = code.replace(new RegExp(`\\b(${builtins})\\b`, 'g'), '<span class="function">$&</span>');
        // Functions
        code = code.replace(/(\w+)\s*\(/g, '<span class="function">$1</span>(');

        return code;
    }

    function highlightJava(code) {
        const keywords = syntaxDefinitions.java.keywords.join('|');
        const types = syntaxDefinitions.java.types.join('|');

        // Strings
        code = code.replace(/(["'`])(.*?)\1/g, '<span class="string">$&</span>');
        // Comments
        code = code.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$&</span>');
        // Numbers
        code = code.replace(/\b\d+(\.\d+)?[fdl]?\b/gi, '<span class="number">$&</span>');
        // Keywords
        code = code.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="keyword">$&</span>');
        // Types
        code = code.replace(new RegExp(`\\b(${types})\\b`, 'g'), '<span class="function">$&</span>');
        // Functions
        code = code.replace(/(\w+)\s*\(/g, '<span class="function">$1</span>(');

        return code;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ /g, '&nbsp;');
    }

    // Tab management
    let tabs = [];
    let activeTabId = null;
    let tabCounter = 0;

    // Create a new tab
    function createTab(fileName = 'Untitled', content = '') {
        const tabId = 'tab-' + tabCounter++;
        const tab = {
            id: tabId,
            fileName: fileName,
            content: content,
            isModified: false
        };

        tabs.push(tab);

        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.id = tabId;
        tabElement.innerHTML = `
            <span class="tab-title">${fileName}</span>
            <button class="tab-close" data-tab-id="${tabId}">×</button>
        `;

        // Insert before the new tab button
        tabBar.insertBefore(tabElement, newTabBtn);

        // Add event listeners
        tabElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                switchToTab(tabId);
            }
        });

        tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tabId);
        });

        return tab;
    }

    // Switch to a tab
    function switchToTab(tabId) {
        // Update active tab styling
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        // Load tab content
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            codeTextarea.value = tab.content;
            activeTabId = tabId;
            updateSyntaxHighlighting();
        }
    }

    // Close a tab
    function closeTab(tabId) {
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        // Remove tab element
        const tabElement = document.getElementById(tabId);
        if (tabElement) {
            tabElement.remove();
        }

        // Remove from tabs array
        tabs.splice(tabIndex, 1);

        // Switch to another tab if this was active
        if (activeTabId === tabId) {
            if (tabs.length > 0) {
                switchToTab(tabs[Math.max(0, tabIndex - 1)].id);
            } else {
                // No tabs left, clear editor
                codeTextarea.value = '';
                activeTabId = null;
            }
        }
    }

    // Save current tab content
    function saveCurrentTab() {
        if (activeTabId) {
            const tab = tabs.find(t => t.id === activeTabId);
            if (tab) {
                tab.content = codeTextarea.value;
            }
        }
    }

    // Create initial tab
    createTab();
    switchToTab(tabs[0].id);
    updateSyntaxHighlighting();

    // Theme change listener (for when theme changes from settings page)
    window.addEventListener('storage', function(e) {
        if (e.key === 'pixelArtTheme') {
            document.body.className = '';
            document.body.classList.add(e.newValue);
            updateSyntaxHighlighting();
        }
    });

    // New tab button
    newTabBtn.addEventListener('click', () => {
        const newTab = createTab();
        switchToTab(newTab.id);
    });

    // Save content when typing
    codeTextarea.addEventListener('input', () => {
        saveCurrentTab();
        updateSyntaxHighlighting();
    });

    // Load folder functionality - allows user to select a folder and create tabs for all files
    loadFolderBtn.addEventListener('click', function() {
        console.log('Load folder clicked');
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.webkitdirectory = true; // Allow folder selection
        input.addEventListener('change', function(e) {
            const files = e.target.files;
            console.log('Folder selected with', files.length, 'files');
            if (files.length > 0) {
                alert(`Loaded ${files.length} files from folder! Creating tabs...`);

                // Create tabs for each file
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const content = event.target.result;
                        const tab = createTab(file.name, content);
                        console.log(`Created tab for: ${file.name}`);
                    };
                    reader.readAsText(file);
                }

                // Switch to the first loaded file
                setTimeout(() => {
                    if (tabs.length > 1) { // More than just the initial tab
                        switchToTab(tabs[tabs.length - files.length].id);
                    }
                }, 100);
            } else {
                alert('No files selected');
            }
        });
        input.click();
    });

    // Export functionality - downloads the current tab's content
    exportBtn.addEventListener('click', function() {
        console.log('Export clicked');
        if (!activeTabId) {
            alert('No active tab to export!');
            return;
        }

        const tab = tabs.find(t => t.id === activeTabId);
        if (!tab) {
            alert('No active tab found!');
            return;
        }

        const content = tab.content || '// Empty file\nexport default {};';
        const fileName = tab.fileName || 'exported-code.txt';

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`Exported "${fileName}"`);
    });

    // Import functionality - allows user to select and import a file into a new tab
    importBtn.addEventListener('click', function() {
        console.log('Import clicked');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.js,.html,.css,.py,.java';
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected for import:', file.name);
                const reader = new FileReader();
                reader.onload = function(event) {
                    const content = event.target.result;
                    const tab = createTab(file.name, content);
                    switchToTab(tab.id);
                    alert(`File "${file.name}" imported into new tab!`);
                };
                reader.readAsText(file);
            } else {
                alert('No file selected');
            }
        });
    // Close all tabs functionality
    closeAllTabsBtn.addEventListener('click', function() {
        console.log('Close all tabs clicked');
        console.log('Current tabs:', tabs.length);
        if (confirm('Are you sure you want to close all tabs? Any unsaved changes will be lost.')) {
            console.log('Confirmed, closing all tabs');
            // Remove all tab elements except the new tab button
            const allTabs = document.querySelectorAll('.tab');
            console.log('Found tab elements:', allTabs.length);
            allTabs.forEach(tab => {
                tab.remove();
            });

            // Clear tabs array
            tabs.length = 0;

            // Clear editor
            codeTextarea.value = '';
            codeHighlight.innerHTML = '';
            activeTabId = null;

            // Create a new empty tab
            const newTab = createTab();
            console.log('Created new tab:', newTab.id);
            switchToTab(newTab.id);

            alert('All tabs closed. Created a new empty tab.');
        } else {
            console.log('Cancelled');
        }
    });
});
});
