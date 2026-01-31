import React from 'react';

const Skeleton = ({ className }) => (
    <div className={`skeleton rounded-md ${className}`} />
);

export const StoreCardSkeleton = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
    </div>
);

export default Skeleton;
