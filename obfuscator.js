document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputCode = document.getElementById('inputCode');
    const outputCode = document.getElementById('outputCode');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const levelBtns = document.querySelectorAll('.level-btn');
    const status = document.getElementById('status');
    
    // Current obfuscation level
    let currentLevel = 'low';
    
    // Initialize
    init();
    
    function init() {
        // File upload
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
        
        // Level buttons
        levelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentLevel = btn.dataset.level;
                levelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showStatus(`Obfuscation level set to: ${formatLevelName(currentLevel)}`, 'info');
            });
        });
        
        // Set default level
        document.querySelector(`.level-btn[data-level="${currentLevel}"]`).classList.add('active');
        
        // Action buttons
        copyBtn.addEventListener('click', copyCode);
        downloadBtn.addEventListener('click', downloadCode);
        clearBtn.addEventListener('click', clearCode);
    }
    
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            inputCode.value = e.target.result;
            showStatus('File loaded successfully!', 'success');
        };
        reader.readAsText(file);
    }
    
    function obfuscateCode(level) {
        const code = inputCode.value.trim();
        if (!code) {
            showStatus('Please enter some code first!', 'error');
            return null;
        }
        
        try {
            showStatus(`Obfuscating with ${formatLevelName(level)} level...`, 'info');
            
            // Preserve comments and strings to maintain flow
            const preserved = preserveTokens(code);
            let obfuscated = preserved.code;
            
            // Apply obfuscation based on level
            switch(level) {
                case 'hard':
                    obfuscated = mangleIdentifiers(obfuscated, 2);
                    obfuscated = encodeStrings(obfuscated);
                    break;
                    
                case 'hardest':
                    obfuscated = mangleIdentifiers(obfuscated, 3);
                    obfuscated = encodeStrings(obfuscated);
                    obfuscated = flattenControlFlow(obfuscated);
                    obfuscated = addDeadCode(obfuscated);
                    break;
                    
                case 'most-hardest':
                    obfuscated = mangleIdentifiers(obfuscated, 4);
                    obfuscated = encodeStrings(obfuscated, true);
                    obfuscated = flattenControlFlow(obfuscated);
                    obfuscated = addDeadCode(obfuscated, true);
                    obfuscated = addDebugProtection(obfuscated);
                    break;
                    
                default: // low
                    obfuscated = mangleIdentifiers(obfuscated, 1);
            }
            
            // Restore preserved tokens
            obfuscated = restoreTokens(obfuscated, preserved);
            
            // Add header
            obfuscated = generateHeader(level) + obfuscated;
            
            showStatus('Obfuscation complete!', 'success');
            return obfuscated;
        } catch (err) {
            showStatus(`Obfuscation failed: ${err.message}`, 'error');
            console.error(err);
            return null;
        }
    }
    
    // Core obfuscation functions
    function preserveTokens(code) {
        const tokens = {
            comments: [],
            strings: []
        };
        
        // Preserve comments
        let commentIndex = 0;
        code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, match => {
            tokens.comments.push(match);
            return `/*COMMENT_${commentIndex++}*/`;
        });
        
        // Preserve strings
        let stringIndex = 0;
        code = code.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, match => {
            tokens.strings.push(match);
            return `/*STRING_${stringIndex++}*/`;
        });
        
        return { code, tokens };
    }
    
    function restoreTokens(code, { tokens }) {
        // Restore strings first
        code = code.replace(/\/\*STRING_(\d+)\*\//g, (_, index) => {
            return tokens.strings[parseInt(index)] || '""';
        });
        
        // Then restore comments
        code = code.replace(/\/\*COMMENT_(\d+)\*\//g, (_, index) => {
            return tokens.comments[parseInt(index)] || '';
        });
        
        return code;
    }
    
    function mangleIdentifiers(code, complexity = 1) {
        const identifierRegex = /\b(var|let|const|function)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\b/g;
        const usedNames = new Set();
        
        return code.replace(identifierRegex, (match, keyword, name) => {
            if (name.length < 2) return match; // Don't mangle very short names
            
            let newName;
            do {
                if (complexity === 1) {
                    newName = '_' + name.charAt(0) + Math.floor(Math.random() * 100);
                } else if (complexity === 2) {
                    newName = '_0x' + Math.random().toString(16).substr(2, 6);
                } else {
                    newName = '_0x' + Array.from({length: complexity + 4}, () => 
                        Math.floor(Math.random() * 16).toString(16)).join('');
                }
            } while (usedNames.has(newName));
            
            usedNames.add(newName);
            return `${keyword} ${newName}`;
        });
    }
    
    function encodeStrings(code, advanced = false) {
        const stringRegex = /(['"`])(?:(?=(\\?))\2.)*?\1/g;
        
        return code.replace(stringRegex, match => {
            if (advanced) {
                const rotated = match.split('').reverse().join('');
                return `(function(){ return atob('${btoa(rotated)}').split('').reverse().join('') })()`;
            }
            return `atob('${btoa(match)}')`;
        });
    }
    
    function flattenControlFlow(code) {
        const functionRegex = /function\s+([^\s(]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
        
        return code.replace(functionRegex, (match, name, params, body) => {
            const statements = body.split(';').filter(s => s.trim());
            if (statements.length < 2) return match;
            
            let newBody = `var _0xstate=0;while(true){switch(_0xstate){`;
            statements.forEach((stmt, i) => {
                newBody += `case ${i}:${stmt};_0xstate=${i+1};break;`;
                // Add some random cases for complexity
                newBody += `case ${i}.1:break;case ${i}.2:break;`;
            });
            newBody += `default:return;}}`;
            
            return `function ${name}(${params}){${newBody}}`;
        });
    }
    
    function addDeadCode(code, heavy = false) {
        const lines = code.split('\n');
        const insertPoints = [];
        
        // Find insertion points (not in strings/comments)
        for (let i = 0; i < lines.length; i++) {
            if (Math.random() > (heavy ? 0.7 : 0.9)) {
                insertPoints.push(i);
            }
        }
        
        // Insert dead code
        insertPoints.reverse().forEach(pos => {
            const deadCode = generateDeadCode(heavy);
            lines.splice(pos, 0, deadCode);
        });
        
        return lines.join('\n');
    }
    
    function generateDeadCode(heavy = false) {
        const vars = ['a','b','c','x','y','z','i','j','k','n','m','p','q','r','s','t','u','v'];
        const ops = ['+','-','*','/','%','&','|','^','<<','>>','>>>'];
        const funcs = ['toString','valueOf','charAt','slice','split','join','reverse'];
        
        const count = heavy ? 3 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 3);
        let code = '';
        
        for (let i = 0; i < count; i++) {
            const v1 = vars[Math.floor(Math.random() * vars.length)];
            const v2 = vars[Math.floor(Math.random() * vars.length)];
            const op = ops[Math.floor(Math.random() * ops.length)];
            const func = funcs[Math.floor(Math.random() * funcs.length)];
            const num = Math.floor(Math.random() * 1000);
            
            code += `var ${v1}=${num};var ${v2}=${v1}${op}${Math.floor(Math.random() * 100)};`;
            if (heavy) {
                code += `try{${v2}.${func}();}catch(e){};`;
            }
        }
        
        return code;
    }
    
    function addDebugProtection(code) {
        return `try{function _0xdebug(){setInterval(function(){debugger;},4000);}_0xdebug();}catch(e){}\n${code}`;
    }
    
    function generateHeader(level) {
        return `/**\n * Obfuscated with MaxTech Obfuscator\n * Level: ${formatLevelName(level)}\n * Owner: terrizev\n * GitHub: terrizev\n * Contact: 256784670936\n */\n\n`;
    }
    
    // UI Functions
    function copyCode() {
        if (!outputCode.value.trim()) {
            const obfuscated = obfuscateCode(currentLevel);
            if (!obfuscated) return;
            outputCode.value = obfuscated;
        }
        
        outputCode.select();
        document.execCommand('copy');
        showStatus('Copied to clipboard!', 'success');
    }
    
    function downloadCode() {
        let code = outputCode.value.trim();
        if (!code) {
            code = obfuscateCode(currentLevel);
            if (!code) return;
            outputCode.value = code;
        }
        
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `obfuscated-${currentLevel}.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('Download started!', 'success');
    }
    
    function clearCode() {
        inputCode.value = '';
        outputCode.value = '';
        fileInput.value = '';
        showStatus('Cleared all code!', 'info');
    }
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = 'status ' + type;
        setTimeout(() => status.textContent = '', 5000);
    }
    
    function formatLevelName(level) {
        return level.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
});
