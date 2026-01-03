import { Cart, User, Search } from '@/components/ui/Buttons';

export default function HeaderIcons({ className = '', isMobile = false }) {
  const size = isMobile ? 'w-6 h-6' : 'w-2 h-2';

  return (
    <div
      className={`flex items-center
    ${className}`}
    >
      {!isMobile && (
        <Search
          className={`${size} md:hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform`}
        />
      )}
      <User
        className={`${size} md:hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform`}
      />
      <Cart
        className={`${size} md:hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform`}
      />
    </div>
  );
}
