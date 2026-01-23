export default function CookiePolicyPage() {
  return (
    <div className="container py-20 mx-auto min-h-[70vh]">
      <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Cookie Policy</h1>

      <div className="mt-4 max-w-3xl text-[clamp(14px,2vw,18px)] text-text-muted">
        <p>
          Questa pagina descrive l&apos;uso dei cookie su questo sito. Il testo definitivo verrà
          pubblicato a breve.
        </p>

        <p className="mt-4">
          Per dubbi o richieste puoi contattarci dalla pagina{' '}
          <a href="/contatti" className="underline hover:no-underline">
            Contatti
          </a>
          .
        </p>
      </div>
    </div>
  );
}
