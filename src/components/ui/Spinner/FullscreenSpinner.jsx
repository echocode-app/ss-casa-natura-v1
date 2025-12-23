import Spinner from './Spinner';

export default function FullscreenSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFFFF]/50 backdrop-blur-sm pointer-events-none">
      <Spinner size="xl" colorScheme="accent" />
    </div>
  );
}
