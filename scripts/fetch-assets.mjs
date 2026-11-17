import fs from "node:fs/promises";
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};
const css = await (
  await fetch(
    "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap",
    { headers },
  )
).text();
let local = css;
let i = 0;
for (const url of [
  ...new Set([...css.matchAll(/url\((https[^)]+)\)/g)].map((m) => m[1])),
]) {
  const name = `barlow-${i++}.woff2`;
  const r = await fetch(url);
  if (!r.ok) throw Error(url);
  await fs.writeFile(
    `public/fonts/${name}`,
    Buffer.from(await r.arrayBuffer()),
  );
  local = local.replaceAll(url, `/fonts/${name}`);
}
await fs.writeFile("src/fonts.css", local);
const earth = await fetch(
  "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
);
if (!earth.ok) throw Error("earth texture unavailable");
await fs.writeFile(
  "public/textures/earth.jpg",
  Buffer.from(await earth.arrayBuffer()),
);
console.log("Fonts and Earth texture saved");
