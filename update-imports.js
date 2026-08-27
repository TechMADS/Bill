const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('@/lib/store') || content.includes('@/lib/utils')) {
        content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]@\/lib\/store['"];?/g, (match) => {
          let imports = [];
          if (match.includes('Bill') || match.includes('getBills') || match.includes('saveBills') || match.includes('PaymentMethod')) {
            const extract = match.match(/(Bill|getBills|saveBills|PaymentMethod)/g);
            if (extract) imports.push(`import { ${[...new Set(extract)].join(', ')} } from "@/lib/bills";`);
          }
          if (match.includes('Customer') || match.includes('getCustomers') || match.includes('saveCustomers')) {
            const extract = match.match(/(Customer|getCustomers|saveCustomers)/g);
            if (extract) imports.push(`import { ${[...new Set(extract)].join(', ')} } from "@/lib/customers";`);
          }
          if (match.includes('BusinessSettings') || match.includes('getSettings') || match.includes('saveSettings')) {
            const extract = match.match(/(BusinessSettings|getSettings|saveSettings)/g);
            if (extract) imports.push(`import { ${[...new Set(extract)].join(', ')} } from "@/lib/settings";`);
          }
          return imports.join('\n');
        });
        
        content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]@\/lib\/utils['"];?/g, (match) => {
          let imports = [];
          if (match.includes('numberToWords') || match.includes('formatCurrency')) {
            const extract = match.match(/(numberToWords|formatCurrency)/g);
            if (extract) imports.push(`import { ${[...new Set(extract)].join(', ')} } from "@/lib/numberToWords";`);
          }
          return imports.join('\n');
        });
        
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src', 'app'));
replaceInDir(path.join(__dirname, 'src', 'components'));
