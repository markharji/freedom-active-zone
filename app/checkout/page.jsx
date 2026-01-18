
export default function Checkout() {
  const ref = Math.random().toString(36).substring(2, 10).toUpperCase();
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Payment Successful</h2>
      <p>Your reference number:</p>
      <p className="text-3xl font-mono">{ref}</p>
      <a href="/check-transaction" className="text-accent underline block mt-4">Check Transaction</a>
    </div>
  );
}
