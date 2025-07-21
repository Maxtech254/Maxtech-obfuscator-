document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const inputCode = document.getElementById('inputCode');
    const outputCode = document.getElementById('outputCode');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const obfuscateBtn = document.getElementById('obfuscateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // File upload handling
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            inputCode.value = e.target.result;
        };
        reader.readAsText(file);
    });

    // Obfuscate button
    obfuscateBtn.addEventListener('click', () => {
        const code = inputCode.value.trim();
        if (!code) {
            alert('Please enter some JavaScript code to obfuscate!');
            return;
        }
        
        // Get options
        const options = {
            transformLevel: document.getElementById('transformLevel').value,
            stringArray: document.getElementById('stringArray').checked,
            stringArrayRotate: document.getElementById('stringArrayRotate').checked,
            stringArrayShuffle: document.getElementById('stringArrayShuffle').checked,
            controlFlowFlattening: document.getElementById('controlFlowFlattening').checked,
            deadCodeInjection: document.getElementById('deadCodeInjection').checked,
            debugProtection: document.getElementById('debugProtection').checked,
            domainLock: document.getElementById('domainLock').checked,
            preserveFlow: document.getElementById('preserveFlow').checked
        };
        
        // Update button state
        obfuscateBtn.disabled = true;
        obfuscateBtn.textContent = 'Obfuscating...';
        
        // Obfuscate with slight delay to show processing
        setTimeout(() => {
            try {
                const obfuscatedCode = obfuscate(code, options);
                outputCode.value = obfuscatedCode;
            } catch (error) {
                outputCode.value = `// Obfuscation Error:\n// ${error.message}`;
                console.error('Obfuscation error:', error);
            } finally {
                obfuscateBtn.disabled = false;
                obfuscateBtn.textContent = 'Obfuscate Code';
            }
        }, 300);
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        if (!outputCode.value.trim()) {
            alert('No obfuscated code to copy!');
            return;
        }
        
        outputCode.select();
        document.execCommand('copy');
        alert('Obfuscated code copied to clipboard!');
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        inputCode.value = '';
        outputCode.value = '';
        fileInput.value = '';
    });

    // Download button
    downloadBtn.addEventListener('click', () => {
        const output = outputCode.value;
        if (!output.trim()) {
            alert('No obfuscated code to download!');
            return;
        }
        
        const blob = new Blob([output], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'obfuscated-code.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
