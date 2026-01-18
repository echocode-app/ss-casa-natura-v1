import IubendaPolicyEmbed from '@/components/legal/IubendaPolicyEmbed';

export default function CookiePolicyPage() {
  return (
    <div className="container py-20 mx-auto min-h-[70vh]">
      <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Cookie Policy</h1>

      <div className="mt-4 text-[clamp(14px,2vw,18px)] text-text-muted">
        <IubendaPolicyEmbed kind="cookie" openInNewTab={false} />
      </div>
    </div>
  );
}
