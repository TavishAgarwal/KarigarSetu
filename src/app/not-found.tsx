import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="text-center max-w-lg">
                    <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-5xl">🪔</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
                    <p className="text-gray-500 mb-8 text-lg">
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back to exploring beautiful artisan crafts.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            Go Home
                        </Link>
                        <Link
                            href="/marketplace"
                            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
