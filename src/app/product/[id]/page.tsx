import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import TranslateWidget from '@/components/TranslateWidget';
import AddToCartButton from '@/components/AddToCartButton';
import AuthenticitySection from '@/components/AuthenticitySection';
import ArtisanImpactCard from '@/components/ArtisanImpactCard';
import { calculateCraftImpact } from '@/lib/impactCalculator';
import AiCraftGuide from '@/components/AiCraftGuide';
import CraftOriginMap from '@/components/CraftOriginMap';
import { getCoordinates } from '@/lib/geocodeLocation';

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            artisan: {
                include: {
                    user: { select: { id: true, name: true } },
                    products: {
                        where: { id: { not: id } },
                        take: 3,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            },
            craftStory: true,
            craftProvenance: true,
            craftAuthenticity: true,
            artisanImpact: true,
        },
    });
    return product;
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const tags: string[] = (() => {
        try {
            return JSON.parse(product.tags);
        } catch {
            return [];
        }
    })();

    // Fetch trend insight for this craft category
    const trendInsight = await prisma.craftTrendInsight.findFirst({
        where: { craftType: product.category },
        orderBy: { createdAt: 'desc' },
    });

    // Compute or load artisan impact
    let impactData = product.artisanImpact;
    if (!impactData) {
        const impact = calculateCraftImpact({
            price: product.price,
            category: product.category,
            title: product.title,
            description: product.description,
            artisan: {
                craftType: product.artisan.craftType,
                experienceYears: product.artisan.experienceYears,
                materialsUsed: product.artisan.materialsUsed,
                techniquesUsed: product.artisan.techniquesUsed,
                workshopSize: product.artisan.workshopSize,
            },
        });

        // Persist the computed impact
        impactData = await prisma.artisanImpact.create({
            data: {
                productId: product.id,
                artisanId: product.artisanId,
                estimatedLaborHours: impact.estimatedLaborHours,
                artisanFamilyMembers: impact.familiesSupported,
                craftAgeYears: impact.craftAge,
                impactSummary: impact.impactSummary,
            },
        });
    }

    // Geocode artisan location for map
    const geocodeInput = [
        product.artisan.district,
        product.artisan.state || product.artisan.location,
    ].filter(Boolean).join(', ') || product.artisan.location;
    const coords = await getCoordinates(geocodeInput);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left: Image */}
                    <div>
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-lg">
                            <Image
                                src={product.imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>

                        {/* Artisan Info Card */}
                        <div className="mt-6 bg-orange-50 rounded-2xl p-6 border border-orange-100">
                            <Link href={`/artisan/${product.artisan.id}`} className="flex items-center gap-4 group">
                                <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">
                                        {product.artisan.user.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                                        {product.artisan.user.name}
                                    </p>
                                    <p className="text-orange-600 text-sm">{product.artisan.craftType} Artisan</p>
                                    <p className="text-gray-500 text-sm">{product.artisan.location}</p>
                                </div>
                            </Link>
                            <p className="mt-4 text-gray-600 text-sm leading-relaxed">{product.artisan.bio}</p>
                            <div className="mt-3 text-sm text-gray-500">
                                {product.artisan.experienceYears} years of experience
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                {product.category}
                            </Badge>
                            {product.stock > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                    {product.stock} in stock
                                </Badge>
                            )}
                            {product.craftProvenance && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                    ✓ AI Verified — {product.craftProvenance.authenticityScore}%
                                </Badge>
                            )}
                            {product.craftAuthenticity && product.craftAuthenticity.authenticityScore >= 80 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                    ✓ Verified Handmade — {product.craftAuthenticity.authenticityScore}%
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            {product.title}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-4xl font-bold text-orange-600">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <TranslateWidget
                            originalDescription={product.description}
                            originalStory={product.story || ''}
                        />

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
                                    Tags
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag: string) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100"
                                        >
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <AddToCartButton
                                productId={product.id}
                                title={product.title}
                                price={product.price}
                                imageUrl={product.imageUrl}
                                artisanName={product.artisan.user.name}
                            />
                            <button className="px-6 py-4 border-2 border-gray-200 hover:border-orange-300 text-gray-700 font-semibold rounded-xl transition-all">
                                ♡
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Support the Artisan Impact Counter ─── */}
                <div className="mt-12">
                    <ArtisanImpactCard
                        laborDays={Math.max(1, Math.round(impactData.estimatedLaborHours / 8))}
                        familiesSupported={impactData.artisanFamilyMembers}
                        craftAge={impactData.craftAgeYears}
                        impactSummary={impactData.impactSummary}
                    />
                </div>

                {/* ─── AI-Powered Sections ─── */}
                <div className="mt-16 space-y-8">

                    {/* Craft Story Section */}
                    {product.craftStory ? (
                        <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl p-8 border border-purple-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">The Story Behind This Craft</h2>
                                    <p className="text-sm text-gray-500">AI-generated heritage narrative</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">The Story</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftStory.craftStory}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Historical Origins</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftStory.craftHistory}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Artisan Journey</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftStory.artisanJourney}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Cultural Symbolism</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftStory.culturalSymbolism}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-500">Craft Story</h3>
                            <p className="text-sm text-gray-400 mt-1">AI heritage narrative will be available for new listings</p>
                        </div>
                    )}

                    {/* Craft Origin Map */}
                    <CraftOriginMap
                        location={product.artisan.location}
                        state={product.artisan.state ?? undefined}
                        district={product.artisan.district ?? undefined}
                        latitude={coords.lat}
                        longitude={coords.lon}
                        craftType={product.artisan.craftType}
                    />

                    {/* Craft Authenticity Section */}
                    {product.craftProvenance ? (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900">Craft Authenticity & Provenance</h2>
                                    <p className="text-sm text-gray-500">AI-powered verification assessment</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200">
                                        <span className="text-2xl font-bold text-white">{product.craftProvenance.authenticityScore}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Origin</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftProvenance.craftOrigin}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Traditional Technique</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftProvenance.traditionalTechnique}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Cultural Significance</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftProvenance.culturalSignificance}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Verification Summary</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.craftProvenance.verificationSummary}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-500">Craft Authenticity</h3>
                            <p className="text-sm text-gray-400 mt-1">AI verification will be available for new listings</p>
                        </div>
                    )}

                    {/* Handmade Authentication Section */}
                    <AuthenticitySection
                        productId={product.id}
                        imageUrl={product.imageUrl}
                        craftType={product.category}
                        initialData={product.craftAuthenticity ? {
                            authenticityScore: product.craftAuthenticity.authenticityScore,
                            handmadeSignals: JSON.parse(product.craftAuthenticity.handmadeSignals),
                            machineSignals: JSON.parse(product.craftAuthenticity.machineSignals),
                            verificationSummary: product.craftAuthenticity.verificationSummary,
                        } : null}
                    />

                    {/* Market Insights Section */}
                    {trendInsight ? (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Market Insights</h2>
                                    <p className="text-sm text-gray-500">AI-analyzed demand trends for {product.category}</p>
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Trend Summary</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{trendInsight.trendSummary}</p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Recommended Styles</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(() => { try { return JSON.parse(trendInsight.recommendedStyles); } catch { return []; } })().map((s: string, i: number) => (
                                                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Trending Colors</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(() => { try { return JSON.parse(trendInsight.recommendedColors); } catch { return []; } })().map((c: string, i: number) => (
                                                <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                                        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Target Markets</h3>
                                        <div className="space-y-1.5">
                                            {(() => { try { return JSON.parse(trendInsight.targetMarkets); } catch { return []; } })().map((m: string, i: number) => (
                                                <p key={i} className="text-xs text-gray-700">• {m}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-500">Market Insights</h3>
                            <p className="text-sm text-gray-400 mt-1">AI market trend analysis will be available for new listings</p>
                        </div>
                    )}

                    {/* AI Craft Guide */}
                    <AiCraftGuide
                        productId={product.id}
                        productTitle={product.title}
                        craftType={product.category}
                    />
                </div>

                {/* Related Products */}
                {product.artisan.products.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            More from {product.artisan.user.name}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {product.artisan.products.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/product/${related.id}`}
                                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                                >
                                    <div className="relative aspect-[4/3]">
                                        <Image
                                            src={related.imageUrl}
                                            alt={related.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="33vw"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
                                            {related.title}
                                        </h3>
                                        <p className="text-orange-600 font-bold mt-1">
                                            ₹{related.price.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
