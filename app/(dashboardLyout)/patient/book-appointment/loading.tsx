import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Progress Steps Skeleton */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-full" />
              {i < 3 && <Skeleton className="w-12 h-1 mx-2" />}
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Doctor Cards Skeleton */}
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
