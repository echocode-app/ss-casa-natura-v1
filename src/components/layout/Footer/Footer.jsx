import Products from './Products';
import Line from './Line';
import Client from './Client';
import Contacts from './Contacts';
import Privacy from './Privacy';
import { Logo } from '../Header';

export default function Footer() {
  return (
    <footer>
      {/* Main footer */}
      <div className="bg-brand-soft overflow-x-hidden">
        <div
          className="
            mx-auto
            max-w-[1570px]
            pr-6 md:pr-8 lg:pr-10 xl:pr-12
            py-6 lg:py-8 xl:py-10
            pl-6 md:pl-20 lg:pl-24 xl:pl-26
            grid
            md:grid-cols-[auto_1fr]
            gap-10
          "
        >
          {/* Logo */}
          <div className="hidden md:flex shrink-0">
            <Logo />
          </div>

          {/* Content wrapper */}
          <div className="flex justify-center lg:ml-0">
            <div
              className="
                flex flex-col md:flex-row
                gap-4 lg:gap-10 xl:gap-14
                w-full
              "
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-10 xl:gap-14 md:ml-auto">
                <Products />
                <Line />
                <Client />
              </div>

              {/* Contacts */}
              <div className="md:ml-auto md:max-w-[140px] md:pr-2 lg:pr-0 lg:max-w-none">
                <Contacts />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-[#767676] overflow-x-hidden">
          <div
            className="
            mx-auto
            max-w-[1570px]
            pr-6 md:pr-8 lg:pr-10 xl:pr-12
            py-6 md:py-4
            pl-6 md:pl-20 lg:pl-24 xl:pl-26
            "
          >
            <Privacy />
          </div>
        </div>
      </div>
    </footer>
  );
}
