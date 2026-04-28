import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <main className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Terms</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        By using StackHire, you agree to use the site lawfully and not attempt to
        disrupt or abuse the service.
      </p>
      <ul className="mt-4 list-disc pl-5 text-sm text-muted-foreground space-y-2">
        <li>Job listings are provided “as is” and may change or expire.</li>
        <li>Saved jobs are a convenience feature and are not guaranteed.</li>
        <li>
          We may update these terms as the product evolves; the latest version
          will be posted here.
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

