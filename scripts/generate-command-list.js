const fs = require('fs');
const path = require('path');

// Get all command files
const commandsDir = path.join(__dirname, '../src/terminal/commands');
const commandFiles = fs.readdirSync(commandsDir)
  .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

// Generate import statements
const imports = commandFiles.map(file => {
  const name = path.basename(file, path.extname(file));
  return `'${name}': () => import('./commands/${file}')`;
}).join(',\n  ');

// Create the command registry file
const content = `// Auto-generated file - DO NOT EDIT
export const commandModules = {
  ${imports}
};
`;

fs.writeFileSync(
  path.join(__dirname, '../src/terminal/commandModules.ts'),
  content
);

console.log('Command modules file generated successfully!');
