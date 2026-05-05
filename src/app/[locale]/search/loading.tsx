import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b border-border/50" />
      <div className="flex-1 pt-24 pb-16 px-6 max-w-7xl mx-auto w-full">
        <Skeleton className="h-11 w-full max-w-xl mb-6 rounded-lg" />
        <div className="flex gap-2 mb-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
        </div>
        <div className="flex gap-6">
          <div className="w-48 shrink-0 space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({length:15}).map((_,i) => (
              <div key={i}>
                <Skeleton className="h-48 rounded-t-lg" />
                <div className="p-2 bg-card rounded-b-lg space-y-1">
                  <Skeleton className="h-2.5 w-4/5" />
                  <Skeleton className="h-2 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
