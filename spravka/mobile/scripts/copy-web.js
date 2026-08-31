const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "../../web/dist");
const dest = path.resolve(__dirname, "../www");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(src)) {
  console.error("Сначала соберите web: npm --prefix ../web run build");
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
copyDir(src, dest);
console.log("Скопировано web/dist -> mobile/www");
