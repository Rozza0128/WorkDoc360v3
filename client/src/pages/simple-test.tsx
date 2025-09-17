export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-red-500 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">SIMPLE TEST PAGE</h1>
      
      <div className="bg-white p-4 rounded mb-4">
        <h2 className="text-xl font-bold text-black">Basic HTML Test</h2>
        <p>If you can see this text, React is working.</p>
      </div>

      {/* Test basic buttons */}
      <div className="space-x-4 mb-8">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Button 1</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded">Button 2</button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded">Button 3</button>
        <button className="bg-orange-500 text-white px-4 py-2 rounded">Button 4</button>
      </div>

      {/* Test CSS Grid */}
      <div className="grid grid-cols-8 gap-2 mb-8 bg-white p-4 rounded">
        <div className="bg-gray-200 p-2 text-center text-black">Tab 1</div>
        <div className="bg-gray-200 p-2 text-center text-black">Tab 2</div>
        <div className="bg-gray-200 p-2 text-center text-black">Tab 3</div>
        <div className="bg-gray-200 p-2 text-center text-black">Tab 4</div>
        <div className="bg-gray-200 p-2 text-center text-black">Tab 5</div>
        <div className="bg-gray-200 p-2 text-center text-black">Tab 6</div>
        <div className="bg-gray-200 p-2 text-center text-black">Tab 7</div>
        <div className="bg-gray-200 p-2 text-center text-black">Tab 8</div>
      </div>

      {/* Manual Tab Implementation */}
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold text-black mb-4">Manual Tabs (No React Components)</h2>
        <div className="flex space-x-1 mb-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-t cursor-pointer">Dashboard</div>
          <div className="bg-gray-300 text-black px-4 py-2 rounded-t cursor-pointer">Generate</div>
          <div className="bg-gray-300 text-black px-4 py-2 rounded-t cursor-pointer">Recommended</div>
          <div className="bg-gray-300 text-black px-4 py-2 rounded-t cursor-pointer">Upload</div>
          <div className="bg-gray-300 text-black px-4 py-2 rounded-t cursor-pointer">Library</div>
          <div className="bg-gray-300 text-black px-4 py-2 rounded-t cursor-pointer">Users</div>
          <div className="bg-gray-300 text-black px-4 py-2 rounded-t cursor-pointer">Billing</div>
          <div className="bg-gray-300 text-black px-4 py-2 rounded-t cursor-pointer">Settings</div>
        </div>
        <div className="bg-blue-50 p-4 border-t-2 border-blue-600">
          <p className="text-black">This is the Dashboard tab content. If you can see this and the 8 tabs above, the basic layout is working.</p>
        </div>
      </div>
    </div>
  );
}