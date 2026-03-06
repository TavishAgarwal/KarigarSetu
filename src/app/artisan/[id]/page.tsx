import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';

// Dynamic SEO metadata per artisan
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const artisan = await prisma.artisanProfile.findUnique({
        where: { id },
        include: { user: { select: { name: true } } },
    });

    if (!artisan) {
        return { title: 'Artisan Not Found — KarigarSetu' };
    }

    const title = `${artisan.user.name} — ${artisan.craftType} Artisan | KarigarSetu`;
    const description = `Discover handcrafted ${artisan.craftType} products by ${artisan.user.name} from ${artisan.location}. ${artisan.experienceYears} years of traditional craftsmanship.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'profile',
            ...(artisan.profileImage ? { images: [{ url: artisan.profileImage }] } : {}),
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
    };
}

async function getArtisan(id: string) {
    const profile = await prisma.artisanProfile.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, createdAt: true } },
            products: {
                orderBy: { createdAt: 'desc' },
                take: 20,
            },
        },
    });
    return profile;
}

export default async function ArtisanProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const artisan = await getArtisan(id);

    if (!artisan) {
        notFound();
    }

    const totalRevenue = artisan.products.reduce((sum, p) => sum + p.price, 0);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Breadcrumb Navigation */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Breadcrumb
                    items={[
                        { label: 'Marketplace', href: '/marketplace' },
                        { label: artisan.user.name, href: `/artisan/${artisan.id}` },
                    ]}
                />
            </div>

            {/* Hero Banner */}
            <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shrink-0">
                            {artisan.profileImage ? (
                                <Image
                                    src={artisan.profileImage}
                                    alt={artisan.user.name}
                                    width={96}
                                    height={96}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-orange-600">
                                    {artisan.user.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="text-white">
                            <h1 className="text-3xl sm:text-4xl font-bold">{artisan.user.name}</h1>
                            <p className="text-orange-100 mt-1">{artisan.craftType} Artisan</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-orange-100">
                                <span>📍 {artisan.location}</span>
                                <span>🎨 {artisan.experienceYears} years experience</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Info */}
                    <div className="space-y-6">
                        {/* Bio */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
                                About the Artisan
                            </h2>
                            <p className="text-gray-700 leading-relaxed">{artisan.bio}</p>
                        </div>

                        {/* Stats */}
                        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-4">
                                Portfolio Stats
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">Products Listed</span>
                                    <span className="font-bold text-gray-900">{artisan.products.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">Craft Type</span>
                                    <span className="font-bold text-gray-900">{artisan.craftType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">Experience</span>
                                    <span className="font-bold text-gray-900">{artisan.experienceYears} years</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">Portfolio Value</span>
                                    <span className="font-bold text-orange-600">₹{totalRevenue.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
                                Location
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span>📍</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{artisan.location}</p>
                                    <p className="text-sm text-gray-500">India</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Products */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Portfolio ({artisan.products.length} products)
                        </h2>
                        {artisan.products.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-12 text-center">
                                <p className="text-gray-500">No products listed yet.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {artisan.products.map((product) => {
                                    const tags: string[] = (() => {
                                        try { return JSON.parse(product.tags); } catch { return []; }
                                    })();

                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                                        >
                                            <div className="relative aspect-[4/3]">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 line-clamp-1">
                                                    {product.title}
                                                </h3>
                                                <p className="text-orange-600 font-bold mt-1">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </p>
                                                {tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {tags.slice(0, 3).map((tag: string) => (
                                                            <Badge
                                                                key={tag}
                                                                variant="secondary"
                                                                className="text-xs bg-orange-50 text-orange-700"
                                                            >
                                                                #{tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
