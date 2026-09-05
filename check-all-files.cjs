const fs = require('fs');
const path = require('path');

// Recursively find all .jsx and .js files in frontend/src
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getFiles(path.join(__dirname, 'frontend', 'src'));
console.log(`Auditing ${files.length} frontend files...`);

for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  // Check for lucide-react imports vs usage
  const lucideMatch = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  const importedIcons = new Set();
  if (lucideMatch) {
    lucideMatch[1].split(',').forEach(i => {
      const name = i.trim().split(/\s+as\s+/)[0].trim();
      if (name) importedIcons.add(name);
    });
  }

  // Find all <Icon ... and Icon usage in JSX
  const jsxTagMatches = code.match(/<([A-Z][a-zA-Z0-9]+)/g) || [];
  const usedTags = jsxTagMatches.map(t => t.substring(1));

  // Common React and HTML tags / local components
  // Also check if any usedTag looks like a Lucide icon but is missing from imports
  // List of common Lucide icons used across project
  const commonLucideIcons = [
    'ShieldCheck', 'Landmark', 'Globe', 'Menu', 'ChevronDown', 'User', 'Sparkles',
    'LogOut', 'CheckCircle2', 'X', 'Search', 'Clock', 'FileText', 'Building2',
    'RefreshCw', 'ArrowRight', 'Check', 'ExternalLink', 'Calculator', 'Briefcase',
    'GraduationCap', 'Users', 'Building', 'Info', 'AlertTriangle', 'AlertCircle',
    'MapPin', 'Send', 'ChevronRight', 'FolderLock', 'CheckSquare2', 'Download',
    'ShieldAlert', 'BarChart3', 'Layers', 'GitBranch', 'Plus', 'TrendingUp',
    'TrendingDown', 'UserCheck', 'ToggleLeft', 'ToggleRight', 'Edit', 'Phone',
    'Mail', 'HelpCircle', 'Bot', 'Scale', 'MessageSquareText', 'FileSearch', 'Loader2',
    'Percent', 'Calendar', 'BookOpen', 'XCircle', 'Store', 'Tractor', 'Wrench',
    'Truck', 'RotateCcw', 'Navigation'
  ];

  for (const tag of usedTags) {
    if (commonLucideIcons.includes(tag)) {
      // Check if imported from lucide-react or anywhere in the file
      const isImported = code.includes(`import`) && code.includes(tag);
      const isLocallyDefined = code.includes(`function ${tag}`) || code.includes(`const ${tag}`) || code.includes(`let ${tag}`) || code.includes(`var ${tag}`);
      if (!isImported && !isLocallyDefined) {
        console.error(`[UNDEFINED ICON] in ${path.relative(__dirname, f)}: <${tag}> is used but NOT imported or defined!`);
      }
    }
  }
}

console.log("Check complete.");
