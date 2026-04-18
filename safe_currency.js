const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function replaceCurrency(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js') && !filePath.endsWith('.php') && !filePath.endsWith('.blade.php')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Literal $ followed by a digit. Completely safe.
    content = content.replace(/\$([0-9])/g, '₱$1');
    
    // 2. React JSX: ">${Number(" -> ">₱{Number("
    content = content.replace(/>\$\{Number\(/g, '>₱{Number(');
    
    // 3. React JSX: " ${Number(" -> " ₱{Number(" 
    // And for tabs or newlines:
    content = content.replace(/\s\$\{Number\(/g, match => match.replace('$', '₱'));
    
    // 4. React JSX: "(${item.price" -> "(₱{item.price"
    content = content.replace(/\(\$\{item\.price/g, '(₱{item.price');
    content = content.replace(/\-\$\{Number/g, '-₱{Number');
    
    // 5. Intl.NumberFormat: usd to php
    content = content.replace(/currency:\s*'USD'/g, "currency: 'PHP'");
    content = content.replace(/currency:\s*"USD"/g, 'currency: "PHP"');
    content = content.replace(/'en-US'/g, "'en-PH'");
    content = content.replace(/"en-US"/g, '"en-PH"');
    
    // 6. Reports.jsx: Revenue: $$${data} -> Revenue: ₱$${data}
    content = content.replace(/Revenue: \$\$\{/g, 'Revenue: ₱${');
    content = content.replace(/Total: \$\$\{/g, 'Total: ₱${');
    content = content.replace(/Orders: \$\$\{/g, 'Orders: ₱${');
    
    // 7. Blade specific
    content = content.replace(/>\$\{\{/g, '>₱{{');

    // Home.jsx specific hero slide texts
    content = content.replace(/\$100/g, '₱5,000'); // Convert shipping tier locally

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Updated: ' + filePath);
    }
}

walkDir('./frontend/src', replaceCurrency);
walkDir('./backend/resources/views', replaceCurrency);
walkDir('./backend/app/Mail', replaceCurrency);

console.log('Currency safely updated');
