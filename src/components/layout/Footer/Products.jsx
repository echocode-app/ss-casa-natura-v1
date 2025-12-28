export default function Products() {
  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        Prodotti
      </h4>

      <ul className="flex flex-col">
        {['Bucato', 'Cucina', 'Pulizia', 'Schede prodotti'].map((item) => (
          <li key={item} className="mb-2">
            <a
              href="#"
              className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
