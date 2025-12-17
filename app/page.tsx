export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Restaurant POS System</h1>
        <p className="text-2xl text-gray-100 mb-8">Point of Sale Management Platform</p>
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li>✓ Cashier Interface</li>
            <li>✓ Table Management</li>
            <li>✓ Menu System</li>
            <li>✓ Inventory Tracking</li>
            <li>✓ Supplier Management</li>
            <li>✓ Real-time Reports</li>
            <li>✓ Alcohol Tracking</li>
          </ul>
        </div>
        <p className="text-gray-200 mt-8 text-sm">Powered by Next.js, React, TypeScript & Supabase</p>
      </div>
    </main>
  );
}
