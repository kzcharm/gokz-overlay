const fs = require("fs");
const path = require("path");

const staticDir = path.join(__dirname, "static");
const outputFile = path.join(__dirname, "src", "static-assets.ts");

function getAllFiles(dir, basePath = "") {
  const files = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      Object.assign(files, getAllFiles(fullPath, relativePath));
    } else {
      const filePath = path.relative(staticDir, fullPath).replace(/\\/g, "/");
      const content = fs.readFileSync(fullPath);
      
      // Check if it's a binary file (image, etc.)
      const isBinary = /\.(gif|png|jpg|jpeg|ico|svg|woff|woff2|ttf|eot)$/i.test(entry.name);
      
      if (isBinary) {
        // Convert to base64
        files[filePath] = {
          type: "base64",
          content: content.toString("base64"),
        };
      } else {
        // Text file
        files[filePath] = {
          type: "text",
          content: content.toString("utf-8"),
        };
      }
    }
  }

  return files;
}

function generateTypeScript(files) {
  let output = `// Auto-generated file - do not edit manually\n`;
  output += `// Run: node build-static.js\n\n`;
  output += `const assets: Record<string, { type: "text" | "base64"; content: string }> = {\n`;

  for (const [filePath, fileData] of Object.entries(files)) {
    const escapedPath = JSON.stringify(filePath);
    const escapedContent = JSON.stringify(fileData.content);
    output += `  ${escapedPath}: { type: ${JSON.stringify(fileData.type)}, content: ${escapedContent} },\n`;
  }

  output += `};\n\n`;
  output += `export function getAsset(path: string): string | Uint8Array | null {\n`;
  output += `  const asset = assets[path];\n`;
  output += `  if (!asset) return null;\n`;
  output += `  \n`;
  output += `  if (asset.type === "base64") {\n`;
  output += `    // Decode base64 to Uint8Array\n`;
  output += `    const binaryString = atob(asset.content);\n`;
  output += `    const bytes = new Uint8Array(binaryString.length);\n`;
  output += `    for (let i = 0; i < binaryString.length; i++) {\n`;
  output += `      bytes[i] = binaryString.charCodeAt(i);\n`;
  output += `    }\n`;
  output += `    return bytes;\n`;
  output += `  }\n`;
  output += `  \n`;
  output += `  return asset.content;\n`;
  output += `}\n`;

  return output;
}

// Main execution
try {
  console.log("Reading static files...");
  const files = getAllFiles(staticDir);
  console.log(`Found ${Object.keys(files).length} files`);

  console.log("Generating TypeScript module...");
  const tsContent = generateTypeScript(files);

  console.log("Writing to", outputFile);
  fs.writeFileSync(outputFile, tsContent, "utf-8");

  console.log("✓ Static assets bundled successfully!");
} catch (error) {
  console.error("Error building static assets:", error);
  process.exit(1);
}

