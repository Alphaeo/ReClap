import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-16 border-b border-border/50" />
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        <Skeleton className="h-6 w-48 mb-6 rounded-full" />
        <Skeleton className="h-16 w-2/3 mb-4" />
        <Skeleton className="h-16 w-1/2 mb-6" />
        <Skeleton className="h-6 w-xl mb-10 max-w-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-48 rounded-lg" />
          <Skeleton className="h-12 w-36 rounded-lg" />
        </div>
      </div>
      <div className="px-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1,2,3,4,5].map(i => (
            <div key={i}>
              <Skeleton className="h-52 rounded-t-lg" />
              <div className="p-3 space-y-2 bg-card rounded-b-lg">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
