import { Cart, User, Search } from '@/components/ui/Buttons';

export default function HeaderIcons({ className = '', isMobile = false }) {
  const size = isMobile ? 'w-6 h-6' : 'w-2 h-2';

  return (
    <div className={`flex items-center px-1 md:px-4 lg:px-6 gap-1 md:gap-4 lg:gap-6 ${className}`}>
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
