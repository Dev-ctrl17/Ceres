import { fixes, root } from "./_onpage_fixes1.mjs";
import { fixes2 } from "./_onpage_fixes2.mjs";
import { fixes3 } from "./_onpage_fixes3.mjs";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
let out = "";
let errors = 0;
const apply = (fx) => {
  const path = join(root, fx.f.replace(/\\/g, "/"));
  let s = readFileSync(path, "utf8");
  for (const [target, repl] of fx.finds) {
    const n = s.split(target).length - 1;
    if (n !== 1) { errors += 1; out += `MISS/MULTI ${n} ${fx.f} :: ${target.slice(0,60)}\n`; continue; }
    s = s.replace(target, repl);
  }
  writeFileSync(path, s, "utf8");
  out += `OK ${fx.f}\n`;
};
[...fixes, ...fixes2, ...fixes3].forEach(apply);
writeFileSync("C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_onpage_fix.out", out, "utf8");
console.log("done errors=" + errors);