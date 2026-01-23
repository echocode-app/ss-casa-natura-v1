export default function PrivacyPolicyPage() {
  return (
    <div className="container py-20 min-h-[70vh]">
      <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Privacy Policy</h1>

      <div className="mt-4 max-w-3xl text-[clamp(14px,2vw,18px)] text-text-muted">
        <p>
          Questa pagina contiene l&apos;informativa sulla privacy del sito. Il testo definitivo{' '}
          verrà pubblicato a breve.
        </p>
        <p className="mt-4">
          Per qualsiasi richiesta relativa ai dati personali puoi contattarci dalla pagina{' '}
          <a href="/contatti" className="underline hover:no-underline">
            Contatti
          </a>
          .
        </p>
      </div>
    </div>
  );
}
