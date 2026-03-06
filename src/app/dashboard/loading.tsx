export default function DashboardLoading() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar skeleton */}
            <div className="hidden lg:block w-64 bg-white border-r border-gray-100 p-4">
                <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-8" />
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse mb-2" />
                ))}
            </div>

            {/* Main content skeleton */}
            <main className="flex-1 p-8">
                <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
                <div className="h-5 w-96 bg-gray-100 rounded-lg animate-pulse mb-8" />

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                    ))}
                </div>

                <div className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse mb-6" />

                <div className="grid sm:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            </main>
        </div>
    );
}
