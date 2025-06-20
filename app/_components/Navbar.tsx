import Link from "next/link";

const NavLinks = [
  { href: "/clients", label: "العملاء" },
  { href: "/suppliers", label: "الموردين" },
  { href: "/custodies", label: "العهدة" },
];

export function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="flex justify-center gap-8 p-4 mx-auto">
        {NavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xl font-medium text-gray-900 hover:opacity-75 transition-opacity"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}