export default function Loading() {
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin border-t-primary" />
          <div className="absolute inset-3 rounded-full border border-violet-500/30 animate-spin border-t-violet-500" style={{ animationDirection: "reverse", animationDuration: "0.7s" }} />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading AetherGrid...</p>
      </div>
    </div>
  );
}
