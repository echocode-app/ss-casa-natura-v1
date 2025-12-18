import { Cart, User, Search } from '@/components/ui/Buttons';

export default function HeaderIcons({ className = '', isMobile = false }) {
  const size = isMobile ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className={`flex items-center px-6 gap-6 ${className}`}>
      {!isMobile && (
        <Search
          className={`${size} hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform`}
        />
      )}
      <User
        className={`${size} hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform`}
      />
      <Cart
        className={`${size} hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform`}
      />
    </div>
  );
}
