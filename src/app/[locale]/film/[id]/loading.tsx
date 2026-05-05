import { Skeleton } from "@/components/ui/skeleton";

export default function FilmLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b border-border/50 bg-background/80" />
      <div className="px-6 pt-10 pb-8 max-w-7xl mx-auto w-full">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-48 md:w-56 aspect-[2/3] rounded-xl shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
            </div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full max-w-2xl" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-8 max-w-7xl mx-auto w-full">
        <Skeleton className="h-7 w-40 mb-5" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}
