document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const inputCode = document.getElementById('inputCode');
    const outputCode = document.getElementById('outputCode');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const obfuscateBtn = document.getElementById('obfuscateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    const status = document.getElementById('status');

    // File upload
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);

    // Button events
    obfuscateBtn.addEventListener('click', obfuscateCode);
    downloadBtn.addEventListener('click', downloadCode);
    copyBtn.addEventListener('click', copyCode);

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            inputCode.value = e.target.result;
            showStatus('File loaded successfully', 'success');
        };
        reader.readAsText(file);
    }

    function obfuscateCode() {
        const code = inputCode.value.trim();
        if (!code) {
            showStatus('Please enter some code first', 'error');
            return;
        }

        showStatus('Obfuscating...', 'info');
        
        try {
            // Simple but effective obfuscation
            const obfuscated = `
// Obfuscated with JS Obfuscator (terrizev)
// GitHub: terrizev | Contact: 256784670936
${obfuscateStrings(code)}
${mangleVariables(code)}
${flattenControlFlow(code)}
`.trim();

            outputCode.value = obfuscated;
            showStatus('Obfuscation complete!', 'success');
        } catch (err) {
            showStatus('Obfuscation failed: ' + err.message, 'error');
            console.error(err);
        }
    }

    function obfuscateStrings(code) {
        // Find all strings and encode them
        const stringRegex = /(['"`])(?:(?=(\\?))\2.)*?\1/g;
        return code.replace(stringRegex, match => {
            return `atob("${btoa(match)}")`;
        });
    }

    function mangleVariables(code) {
        // Simple variable mangling
        const varRegex = /\b(var|let|const|function)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\b/g;
        const usedNames = new Set();
        
        return code.replace(varRegex, (match, decl, name) => {
            if (name.length < 2) return match;
            const newName = '_0x' + Math.random().toString(16).substr(2, 6);
            usedNames.add(newName);
            return `${decl} ${newName}`;
        });
    }

    function flattenControlFlow(code) {
        // Simple control flow flattening
        const functionRegex = /function\s+([^\s(]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
        return code.replace(functionRegex, (match, fnName, params, body) => {
            const statements = body.split(';').filter(s => s.trim());
            if (statements.length < 2) return match;
            
            let newBody = `var _0xstate=0;while(true){switch(_0xstate){`;
            statements.forEach((stmt, i) => {
                newBody += `case ${i}:${stmt};_0xstate=${i+1};break;`;
            });
            newBody += `default:return;}}`;
            
            return `function ${fnName}(${params}){${newBody}}`;
        });
    }

    function downloadCode() {
        const code = outputCode.value;
        if (!code.trim()) {
            showStatus('No obfuscated code to download', 'error');
            return;
        }
        
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'obfuscated.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('Download started', 'success');
    }

    function copyCode() {
        const code = outputCode.value;
        if (!code.trim()) {
            showStatus('No code to copy', 'error');
            return;
        }
        
        outputCode.select();
        document.execCommand('copy');
        showStatus('Copied to clipboard!', 'success');
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = 'status ' + type;
        setTimeout(() => status.textContent = '', 3000);
    }
});
