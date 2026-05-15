import { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Contact from ${name || "Website visitor"}`;
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(
      message,
    )}`;
    // Open user's email client with prefilled message as a fallback
    window.location.href = `mailto:stackhirejobs@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${body}`;
  };

  return (
    <main className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Have a question or need help? Send us a message and we&apos;ll get back
        to you. You can also email us directly at{" "}
        <a
          className="text-primary underline"
          href="mailto:stackhirejobs@gmail.com"
        >
          stackhirejobs@gmail.com
        </a>
        .
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 4px rgba(106,100,241,0.18)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 4px rgba(106,100,241,0.18)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 4px rgba(106,100,241,0.18)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            placeholder="How can we help?"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold"
            style={{ backgroundColor: "#6a64f1", color: "#ffffff" }}
          >
            Send message
          </button>
          <Link to="/" className="text-sm text-muted-foreground">
            Back to jobs
          </Link>
        </div>
      </form>
    </main>
  );
}
