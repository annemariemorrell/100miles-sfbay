import Link from "next/link";
import { LogSwimForm } from "@/components/LogSwimForm";

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8 lg:py-12">
      <Link className="text-sm font-semibold text-[#1D9E75] hover:text-[#13785A]" href="/">
        &larr; Back to dashboard
      </Link>
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1D9E75]">Log a swim</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Add today&apos;s bay miles
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Save the date, distance, and any notes about conditions at Aquatic Park.
        </p>
      </div>
      <div className="mt-8">
        <LogSwimForm defaultDate={getTodayInputValue()} />
      </div>
    </main>
  );
}
