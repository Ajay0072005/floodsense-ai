export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0] px-4 text-center">
      <div className="max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-[#1a237e] mb-3">Page not found</h1>
        <p className="text-sm text-gray-600">The route you tried to visit does not exist or is temporarily unavailable.</p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1a237e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#283593] transition">
          Return home
        </a>
      </div>
    </main>
  );
}
