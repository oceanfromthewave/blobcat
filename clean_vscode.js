const fs = require('fs');
const path = require('path');

const jsPath = 'C:\\Users\\김재현\\AppData\\Local\\Programs\\Microsoft VS Code\\8b640eef5a\\resources\\app\\out\\vs\\workbench\\workbench.desktop.main.js';

if (fs.existsSync(jsPath)) {
    let content = fs.readFileSync(jsPath, 'utf-8');
    const patchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
    if (patchRegex.test(content)) {
        content = content.replace(patchRegex, '');
        fs.writeFileSync(jsPath, content);
        console.log('SUCCESS');
    } else {
        console.log('NO_PATCH_FOUND');
    }
} else {
    console.log('FILE_NOT_FOUND');
}
