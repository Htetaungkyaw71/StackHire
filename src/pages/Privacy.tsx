import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <main className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        We aim to collect the minimum data required to operate StackHire.
      </p>
      <ul className="mt-4 list-disc pl-5 text-sm text-muted-foreground space-y-2">
        <li>Authentication uses session cookies where applicable.</li>
        <li>
          Search and filtering parameters may be stored in the URL to improve
          sharing and navigation.
        </li>
        <li>
          We do not sell personal data. If this changes, this page will be
          updated.
        </li>
      </ul>

      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-foreground/90"
        >
          Back to jobs
        </Link>
      </div>
    </main>
  );
}

