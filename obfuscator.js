// Heavy JavaScript Obfuscator
function obfuscate(code, options) {
    // Preserve comments and strings for flow preservation
    const preservedTokens = preserveTokens(code, options.preserveFlow);
    
    // Apply transformations based on level
    let obfuscatedCode = code;
    
    // String array encoding
    if (options.stringArray) {
        obfuscatedCode = encodeStrings(obfuscatedCode, options);
    }
    
    // Control flow flattening
    if (options.controlFlowFlattening) {
        obfuscatedCode = flattenControlFlow(obfuscatedCode, options.transformLevel);
    }
    
    // Dead code injection
    if (options.deadCodeInjection) {
        obfuscatedCode = injectDeadCode(obfuscatedCode);
    }
    
    // Variable and function name mangling
    obfuscatedCode = mangleIdentifiers(obfuscatedCode, options.transformLevel);
    
    // Debug protection
    if (options.debugProtection) {
        obfuscatedCode = addDebugProtection(obfuscatedCode);
    }
    
    // Domain lock
    if (options.domainLock) {
        obfuscatedCode = addDomainLock(obfuscatedCode);
    }
    
    // Restore preserved tokens
    if (options.preserveFlow) {
        obfuscatedCode = restoreTokens(obfuscatedCode, preservedTokens);
    }
    
    // Add header comment
    const header = generateHeaderComment(options);
    return header + obfuscatedCode;
}

// Helper functions for obfuscation
function preserveTokens(code, preserveFlow) {
    if (!preserveFlow) return { comments: [], strings: [] };
    
    // Preserve comments
    const commentRegex = /(\/\*[\s\S]*?\*\/|\/\/.*$)/gm;
    const comments = [];
    code = code.replace(commentRegex, match => {
        comments.push(match);
        return `/*COMMENT_${comments.length - 1}*/`;
    });
    
    // Preserve strings
    const stringRegex = /(['"`])(?:(?=(\\?))\2.)*?\1/g;
    const strings = [];
    code = code.replace(stringRegex, match => {
        strings.push(match);
        return `/*STRING_${strings.length - 1}*/`;
    });
    
    return { code, comments, strings };
}

function restoreTokens(code, { comments, strings }) {
    // Restore strings first
    const stringPlaceholder = /\/\*STRING_(\d+)\*\//g;
    code = code.replace(stringPlaceholder, (_, index) => strings[parseInt(index)] || '""');
    
    // Then restore comments
    const commentPlaceholder = /\/\*COMMENT_(\d+)\*\//g;
    code = code.replace(commentPlaceholder, (_, index) => comments[parseInt(index)] || '');
    
    return code;
}

function encodeStrings(code, options) {
    // Find all strings in the code
    const stringRegex = /(['"`])(?:(?=(\\?))\2.)*?\1/g;
    const strings = [];
    let strIndex = 0;
    
    // Replace strings with array references
    code = code.replace(stringRegex, match => {
        strings.push(match);
        return `_0xstrings[${strIndex++}]`;
    });
    
    // Generate string array
    let stringArrayCode = '';
    if (strings.length > 0) {
        stringArrayCode += 'const _0xstrings=[';
        stringArrayCode += strings.map(str => {
            // Simple string encoding (could be enhanced with more complex encoding)
            if (options.stringArrayRotate) {
                return btoa(str).split('').reverse().join('');
            }
            return btoa(str);
        }).join(',');
        stringArrayCode += '];\n';
        
        // Add decoding function
        stringArrayCode += 'function _0xdecode(str) { ';
        if (options.stringArrayRotate) {
            stringArrayCode += 'return atob(str.split("").reverse().join(""));';
        } else {
            stringArrayCode += 'return atob(str);';
        }
        stringArrayCode += ' }\n';
        
        // Shuffle array if needed
        if (options.stringArrayShuffle && strings.length > 1) {
            stringArrayCode += `_0xstrings=_0xstrings.sort(()=>Math.random()-0.5);\n`;
        }
    }
    
    return stringArrayCode + code;
}

function flattenControlFlow(code, level) {
    // This is a simplified version - real implementation would parse the AST
    const functionRegex = /function\s+([^\s(]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
    
    return code.replace(functionRegex, (match, fnName, params, body) => {
        // Split body into statements
        const statements = body.split(';').filter(s => s.trim());
        
        // Only process if we have multiple statements
        if (statements.length < 2) return match;
        
        // Generate switch-based control flow
        let newBody = `var _0xstate=0;\n`;
        newBody += `while(true){\n`;
        newBody += `  switch(_0xstate){\n`;
        
        statements.forEach((stmt, i) => {
            newBody += `    case ${i}:\n`;
            newBody += `      ${stmt.trim()};\n`;
            newBody += `      _0xstate = ${i + 1};\n`;
            newBody += `      break;\n`;
            
            // Add some randomness for higher levels
            if (level === 'high' || level === 'extreme') {
                newBody += `    case ${i + 0.1}:\n`;
                newBody += `      _0xstate = ${i + 1};\n`;
                newBody += `      break;\n`;
            }
        });
        
        newBody += `    case ${statements.length}:\n`;
        newBody += `      return;\n`;
        newBody += `  }\n`;
        newBody += `}\n`;
        
        return `function ${fnName}(${params}){${newBody}}`;
    });
}

function mangleIdentifiers(code, level) {
    // Simple identifier mangling - real implementation would use AST parsing
    const identifierRegex = /\b(var|let|const|function)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\b/g;
    const usedNames = new Set();
    
    return code.replace(identifierRegex, (match, decl, name) => {
        if (name.length < 3) return match; // Don't mangle short names
        
        // Generate mangled name
        let newName;
        do {
            if (level === 'low') {
                newName = '_' + name.charAt(0) + Math.floor(Math.random() * 100);
            } else if (level === 'medium') {
                newName = '_0x' + Math.random().toString(16).substr(2, 6);
            } else {
                newName = '_0x' + Array.from({length: 8}, () => 
                    Math.floor(Math.random() * 16).toString(16)).join('');
            }
        } while (usedNames.has(newName));
        
        usedNames.add(newName);
        return `${decl} ${newName}`;
    });
}

function injectDeadCode(code) {
    // Inject random dead code blocks
    const deadCodeBlocks = [
        `if(false){${generateRandomCodeBlock()}}`,
        `while(1<0){${generateRandomCodeBlock()}}`,
        `function _0xdead${Math.floor(Math.random() * 1000)}(){${generateRandomCodeBlock()}}`,
        `var _0xunused=${Math.random()};`
    ];
    
    // Insert dead code randomly
    const lines = code.split('\n');
    const insertPoints = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (Math.random() > 0.9) {
            insertPoints.push(i);
        }
    }
    
    insertPoints.reverse().forEach(pos => {
        const deadCode = deadCodeBlocks[Math.floor(Math.random() * deadCodeBlocks.length)];
        lines.splice(pos, 0, deadCode);
    });
    
    return lines.join('\n');
}

function generateRandomCodeBlock() {
    const ops = ['+', '-', '*', '/', '%', '&', '|', '^'];
    const vars = ['a', 'b', 'c', 'x', 'y', 'z', 'i', 'j', 'k'];
    const methods = ['toString', 'valueOf', 'charAt', 'slice', 'split'];
    
    const statements = [];
    const count = 2 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < count; i++) {
        const v1 = vars[Math.floor(Math.random() * vars.length)];
        const v2 = vars[Math.floor(Math.random() * vars.length)];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const method = methods[Math.floor(Math.random() * methods.length)];
        
        statements.push(
            `var ${v1}=${Math.floor(Math.random() * 1000)};`,
            `var ${v2}=${v1}${op}${Math.floor(Math.random() * 100)};`,
            `${v2}.${method}();`
        );
    }
    
    return statements.join('\n');
}

function addDebugProtection(code) {
    return `try {
        const _0xdebugProtect = () => { 
            function _0xdebugFn() { 
                return function(){}.constructor("debugger").apply("state");
            }
            setInterval(_0xdebugFn, 4000);
        };
        _0xdebugProtect();
    } catch(e) {}
    ${code}`;
}

function addDomainLock(code) {
    return `if(!/^https?:\\/\\/(localhost|127\\.0\\.0\\.1|example\\.com)(:[0-9]+)?\\//.test(location.href)) {
        document.body.innerHTML = '<h1>Access Denied</h1><p>This code can only run on authorized domains.</p>';
        throw new Error("Domain not authorized");
    }
    ${code}`;
}

function generateHeaderComment(options) {
    let header = `/**\n * Heavy JS Obfuscator (terrizev)\n`;
    header += ` * Obfuscation level: ${options.transformLevel}\n`;
    header += ` * Options:\n`;
    
    for (const [key, value] of Object.entries(options)) {
        header += ` *   ${key}: ${value}\n`;
    }
    
    header += ` * GitHub: terrizev\n`;
    header += ` * Contact: 256784670936\n */\n\n`;
    return header;
  }
