export default function Line() {
  return (
    <div>
      <h4 className="font-semibold text-[14px] md:text-[16px] xl:text-[18px] uppercase mb-3 md:mb-4 lg:mb-6">
        Linee
      </h4>

      <ul className="flex flex-col">
        {['Lavanda', 'Brezza Marina', 'Agrumi di Sicilia', 'Fior di Loto', 'Neutro'].map((item) => (
          <li key={item} className="mb-2">
            <a
              href="#"
              className="font-normal text-[14px] md:text-[16px] xl:text-[18px] hover:underline"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
