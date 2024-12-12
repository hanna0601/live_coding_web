import Image from "next/image";
import localFont from "next/font/local";
import Navbar from "./Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen text-foreground font-[family-name:var(--font-geist-sans)]`}
    >
      <Navbar isLoggedIn={false} />
      <main className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-foreground">
            Scriptorium
          </h1>
          <p className="text-2xl sm:text-3xl text-foreground/60">
            The new way of writing codes!
          </p>
          <div>
            <a
              href="/editor"
              className="inline-block bg-foreground text-background px-8 py-4 rounded-full text-lg font-semibold hover:bg-foreground/90 transition-colors"
            >
              Start Coding!
            </a>
          </div>
        </div>

        {/* About Section */}
        <section className="max-w-3xl mx-auto backdrop-blur-sm bg-secondary/30 p-8 rounded-2xl border border-foreground/10">
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground/90">
            About Scriptorium
          </h2>
          <p className="text-lg leading-relaxed text-foreground/70 text-center">
            Scriptorium is an innovative online platform where you can write,
            execute, and share code in multiple programming languages. Inspired by
            the ancient concept of a scriptorium, a place where manuscripts were
            crafted and preserved, Scriptorium modernizes this idea for the digital
            age. It offers a secure environment for geeks, nerds, and coding
            enthusiasts to experiment, refine, and save their work as reusable
            templates. Whether you're testing a quick snippet or building a
            reusable code example, Scriptorium is what you need to bring your
            ideas to life.
          </p>
        </section>
      </main>
    </div>
  );
}
