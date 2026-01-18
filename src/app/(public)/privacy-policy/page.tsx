import IubendaPolicyEmbed from '@/components/legal/IubendaPolicyEmbed';

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-20 min-h-[70vh]">
      <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Privacy Policy</h1>

      <div className="mt-4 text-[clamp(14px,2vw,18px)] text-text-muted">
        <IubendaPolicyEmbed kind="privacy" openInNewTab={false} />
      </div>
    </div>
  );
}
