import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import TitlePage from "../components/TitlePage";

export default async function Apparel() {
  const apparelsFetch = await fetch("http://localhost:3000/api/apparels");
  const apparels = await apparelsFetch.json();

  return (
    <>
      <TitlePage title="Sports Apparel" subtitle="Book your favorite sports apparel today!" />

      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Filters />

          <div className="flex-1 bg-white rounded-2xl shadow-inner p-4">
            <div className="flex flex-wrap gap-8 items-center justify-center">
              {apparels?.map((f) => (
                <ProductCard
                  key={f._id}
                  id={f.id}
                  name={f.name}
                  price={f.price}
                  rating={f.rating}
                  image={f.thumbnail}
                  href={`/apparel/${f._id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
