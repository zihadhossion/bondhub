import { Link, Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <>
      <Link
        to="/"
        className="site-logo sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:text-[#ED1C24]"
        aria-label="BondHub brand logo - back to home"
      >
        BondHub brand name
      </Link>
      <Outlet />
    </>
  );
}
