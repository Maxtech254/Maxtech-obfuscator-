document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const inputCode = document.getElementById('inputCode');
    const outputCode = document.getElementById('outputCode');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const obfuscateBtn = document.getElementById('obfuscateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const levelBtns = document.querySelectorAll('.level-btn');
    const status = document.getElementById('status');
    const charCount = document.getElementById('charCount');
    
    // Current obfuscation level
    let currentLevel = 'hardest';
    
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
        
        // Obfuscate button
        obfuscateBtn.addEventListener('click', () => {
            const code = inputCode.value.trim();
            if (!code) {
                showStatus('Please enter JavaScript code to obfuscate', 'error');
                return;
            }
            
            try {
                const obfuscated = obfuscateCode(code, currentLevel);
                outputCode.value = obfuscated;
                charCount.textContent = `${obfuscated.length} characters`;
                showStatus(`Code obfuscated with ${formatLevelName(currentLevel)} level!`, 'success');
            } catch (error) {
                showStatus(`Obfuscation error: ${error.message}`, 'error');
                console.error(error);
            }
        });
        
        // Copy button
        copyBtn.addEventListener('click', () => {
            if (!outputCode.value.trim()) {
                showStatus('No obfuscated code to copy', 'error');
                return;
            }
            
            outputCode.select();
            document.execCommand('copy');
            showStatus('Obfuscated code copied to clipboard!', 'success');
        });
        
        // Download button
        downloadBtn.addEventListener('click', () => {
            const code = outputCode.value;
            if (!code.trim()) {
                showStatus('No obfuscated code to download', 'error');
                return;
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
        });
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            inputCode.value = '';
            outputCode.value = '';
            fileInput.value = '';
            charCount.textContent = '0 characters';
            showStatus('All fields cleared!', 'success');
        });
        
        // Input character count
        inputCode.addEventListener('input', () => {
            charCount.textContent = `${inputCode.value.length} characters`;
        });
    }
    
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            inputCode.value = e.target.result;
            showStatus('File loaded successfully!', 'success');
            charCount.textContent = `${inputCode.value.length} characters`;
        };
        reader.readAsText(file);
    }
    
    // Safe string encoding that handles Unicode
    function safeBtoa(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    }
    
    function obfuscateCode(code, level) {
        // Header comment
        let obfuscated = `/**\n * Obfuscated with MaxTech Obfuscator\n`;
        obfuscated += ` * Level: ${formatLevelName(level)}\n`;
        obfuscated += ` * GitHub: terrizev\n * Contact: 256784670936\n */\n\n`;
        
        // Apply obfuscation based on level
        switch(level) {
            case 'low':
                obfuscated += mangleVariables(code, 1);
                break;
                
            case 'hard':
                obfuscated += mangleVariables(code, 2);
                obfuscated += encodeStrings(code);
                break;
                
            case 'hardest':
                obfuscated += mangleVariables(code, 3);
                obfuscated += encodeStrings(code);
                obfuscated += flattenControlFlow(code);
                obfuscated += addDeadCode(code);
                break;
                
            case 'most-hardest':
                obfuscated += mangleVariables(code, 4);
                obfuscated += encodeStrings(code, true);
                obfuscated += flattenControlFlow(code);
                obfuscated += addDeadCode(code, true);
                obfuscated += addDebugProtection();
                break;
        }
        
        return obfuscated;
    }
    
    function mangleVariables(code, complexity) {
        // Preserve global variables and built-in objects
        const preservedVars = ['window', 'document', 'console', 'alert', 'fetch', 'setTimeout', 'setInterval'];
        
        return code.replace(/\b(var|let|const|function)\s+([a-zA-Z_$][\w$]*)\b/g, (match, keyword, name) => {
            if (preservedVars.includes(name)) return match;
            
            let newName;
            if (complexity === 1) {
                newName = '_' + name.charAt(0) + Math.floor(Math.random() * 100);
            } else if (complexity === 2) {
                newName = '_0x' + Math.random().toString(16).substr(2, 6);
            } else {
                newName = '_0x' + Array.from({length: complexity + 4}, () => 
                    Math.floor(Math.random() * 16).toString(16)).join('');
            }
            
            return `${keyword} ${newName}`;
        });
    }
    
    function encodeStrings(code, advanced = false) {
        return code.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, match => {
            if (advanced) {
                const rotated = match.split('').reverse().join('');
                return `(function(){ return decodeURIComponent(escape(atob('${safeBtoa(rotated)}')) }).split('').reverse().join('') })()`;
            }
            return `decodeURIComponent(escape(atob('${safeBtoa(match)}'))`;
        });
    }
    
    function flattenControlFlow(code) {
        return code.replace(/function\s+([^\s(]+)\s*\(([^)]*)\)\s*{([^}]*)}/g, (match, name, params, body) => {
            const statements = body.split(';').filter(s => s.trim());
            if (statements.length < 2) return match;
            
            let newBody = `var _0xstate=0;while(true){switch(_0xstate){`;
            statements.forEach((stmt, i) => {
                newBody += `case ${i}:${stmt};_0xstate=${i+1};break;`;
                newBody += `case ${i}.1:break;case ${i}.2:break;`;
            });
            newBody += `default:return;}}`;
            
            return `function ${name}(${params}){${newBody}}`;
        });
    }
    
    function addDeadCode(code, heavy = false) {
        const lines = code.split('\n');
        const insertPoints = [];
        
        for (let i = 0; i < lines.length; i++) {
            if (Math.random() > (heavy ? 0.7 : 0.9)) {
                insertPoints.push(i);
            }
        }
        
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
    
    function addDebugProtection() {
        return `\n\n// Debug protection\n` +
               `try { \n` +
               `  const _0xdebug = () => { \n` +
               `    setInterval(() => { \n` +
               `      debugger; \n` +
               `    }, 4000); \n` +
               `  }; \n` +
               `  _0xdebug(); \n` +
               `} catch(e) {} \n`;
    }
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        
        // Auto hide status after 5 seconds
        setTimeout(() => {
            status.style.opacity = '1';
            let opacity = 1;
            const fadeOut = setInterval(() => {
                opacity -= 0.05;
                status.style.opacity = opacity;
                if (opacity <= 0) {
                    clearInterval(fadeOut);
                    status.className = 'status';
                    status.style.opacity = '1';
                }
            }, 50);
        }, 5000);
    }
    
    function formatLevelName(level) {
        const names = {
            'low': 'Level 1: Low',
            'hard': 'Level 2: Hard',
            'hardest': 'Level 3: Hardest',
            'most-hardest': 'Level 4: Extreme'
        };
        return names[level] || level;
    }
});
