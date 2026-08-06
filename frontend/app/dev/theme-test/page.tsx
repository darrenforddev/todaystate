import {
  getThemesForIndicator,
  getSupportingIndicatorsForTheme,
} from "@/engine/themeEngine";

export default function ThemeTest() {
  const manufacturing = getThemesForIndicator("manufacturing-pmi");
  const industrial = getSupportingIndicatorsForTheme("industrial-recovery");

  return (
    <main className="p-8 text-white">
      <h1>Theme Engine Test</h1>

      <h2 className="mt-6">Manufacturing PMI</h2>

      <pre>{JSON.stringify(manufacturing, null, 2)}</pre>

      <h2 className="mt-6">Industrial Recovery</h2>

      <pre>{JSON.stringify(industrial, null, 2)}</pre>
    </main>
  );
}
