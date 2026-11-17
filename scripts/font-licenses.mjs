import fs from "node:fs/promises";
for (const family of ["barlow", "barlowcondensed"]) {
  const url = `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`;
  const response = await fetch(url);
  if (!response.ok) throw Error(url);
  await fs.writeFile(
    `public/fonts/LICENSE-${family}.txt`,
    await response.text(),
  );
}
console.log("Licenças das fontes preservadas.");
