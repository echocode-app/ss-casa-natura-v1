export default function Client() {
  return (
    <div>
      <h4 className="font-semibold text-[14px] md:text-[16px] xl:text-[18px] uppercase mb-3 md:mb-4 lg:mb-6">
        Area clienti
      </h4>

      <ul className="flex flex-col">
        {['Missione', 'Ingredienti', 'Servizio clienti', 'Il mio account', 'Note legali'].map(
          (item) => (
            <li key={item} className="mb-2">
              <a
                href="#"
                className="font-normal text-[14px] md:text-[16px] xl:text-[18px] hover:underline"
              >
                {item}
              </a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
