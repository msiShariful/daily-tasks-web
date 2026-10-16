import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you are looking for does not exist or the date in the address is invalid.
      </p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-6")}>
        Go to today&apos;s log
      </Link>
    </div>
  );
}
