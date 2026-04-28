import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">About StackHire</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        StackHire helps developers find roles by the technologies they use in
        real work—frameworks, languages, and tooling—so the listings you see are
        relevant from the first scroll.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Browse jobs, filter by tech stack, and save roles you want to revisit.
      </p>

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

