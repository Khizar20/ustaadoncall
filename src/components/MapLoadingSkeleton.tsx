import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MapLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Map Container Skeleton */}
          <div className="w-full h-[50vh] min-h-[400px] rounded-lg border overflow-hidden bg-muted/20">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <Skeleton className="h-3 w-48 mx-auto" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Controls Skeleton */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 rounded" />
            ))}
          </div>

          {/* Legend Skeleton */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="space-y-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 