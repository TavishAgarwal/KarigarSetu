import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">K</span>
                            </div>
                            <span className="text-xl font-bold text-white">KarigarSetu</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Preserving heritage, empowering hands, and bridging cultures through artificial intelligence.
                        </p>

                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Find Artisans', href: '/marketplace' },
                                { label: 'Craft Categories', href: '/marketplace' },
                                { label: 'Success Stories', href: '/#testimonials' },
                                { label: 'Our Mission', href: '/#how-it-works' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">
                            Support
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Artisan Help Center', href: '/help' },
                                { label: 'Shipping Policy', href: '/shipping' },
                                { label: 'Terms of Service', href: '/terms' },
                                { label: 'Privacy Policy', href: '/privacy' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
}
