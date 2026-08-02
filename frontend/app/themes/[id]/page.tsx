export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#050b14] text-white p-10">
      <h1 className="text-5xl font-black">Theme Report</h1>

      <p className="mt-6 text-2xl text-cyan-300">Theme ID: {id}</p>
    </main>
  );
}
