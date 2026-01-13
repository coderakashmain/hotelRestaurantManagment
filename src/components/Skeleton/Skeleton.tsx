const MetricCardSkeleton = () => (
    <div className="card flex items-center justify-between">
      <div className="space-y-3 w-full">
        <div className="h-3 w-24 skeleton skeleton-rounded" />
        <div className="h-6 w-32 skeleton skeleton-rounded" />
        <div className="h-3 w-20 skeleton skeleton-rounded" />
      </div>
  
      <div className="h-10 w-10 skeleton skeleton-circle" />
    </div>
  );
  

  const ChartSkeleton = () => (
    <div className="card h-[320px] flex flex-col">
      <div className="h-4 w-48 skeleton skeleton-rounded mb-4" />
      <div className="flex-1 skeleton skeleton-rounded" />
    </div>
  );

  const DonutSkeleton = () => (
    <div className="card h-[320px] flex flex-col items-center justify-center gap-6">
      <div className="h-40 w-40 skeleton skeleton-circle" />
  
      <div className="space-y-3 w-full">
        <div className="flex justify-between">
          <div className="h-3 w-20 skeleton skeleton-rounded" />
          <div className="h-3 w-6 skeleton skeleton-rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-24 skeleton skeleton-rounded" />
          <div className="h-3 w-6 skeleton skeleton-rounded" />
        </div>
      </div>
    </div>
  );

  
  export default function DashboardSkeleton() {
    return (
      <div className="space-y-6">
  
        {/* Top metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
  
        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <DonutSkeleton />
        </div>
  
        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card space-y-4">
            <div className="h-4 w-40 skeleton skeleton-rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 skeleton skeleton-rounded" />
            ))}
          </div>
  
          <div className="card space-y-4">
            <div className="h-4 w-40 skeleton skeleton-rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 skeleton skeleton-rounded" />
            ))}
          </div>
        </div>
  
      </div>
    );
  }
  