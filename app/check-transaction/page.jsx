
export default function CheckTransaction() {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Check Transaction</h2>
      <input className="w-full border p-2 mb-4" placeholder="Enter Reference Number" />
      <button className="bg-primary w-full py-2 text-white rounded">Check</button>
    </div>
  );
}
