export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin" />
                </div>
                <p className="text-gray-500 text-sm font-medium tracking-wide">Loading KarigarSetu…</p>
            </div>
        </div>
    );
}
