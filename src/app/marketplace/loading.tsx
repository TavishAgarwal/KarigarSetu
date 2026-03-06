export default function MarketplaceLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header skeleton */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse hidden md:block" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Title skeleton */}
                <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
                <div className="h-5 w-80 bg-gray-100 rounded-lg animate-pulse mb-8" />

                {/* Product grid skeleton */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                            <div className="aspect-square bg-gray-200 animate-pulse" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
