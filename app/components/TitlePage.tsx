export default function TitlePage({ title, subtitle, bgColor = "bg-blue-900", textColor = "text-white" }) {
  return (
    <div className={`${bgColor} ${textColor} py-8 px-4 rounded-b-3xl shadow-md mb-8`}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-lg md:text-xl opacity-80">{subtitle}</p>}
      </div>
    </div>
  );
}
