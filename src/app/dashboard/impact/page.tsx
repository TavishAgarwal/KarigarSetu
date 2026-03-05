import DashboardSidebar from '@/components/DashboardSidebar';
import { prisma } from '@/lib/prisma';
import { Users, Package, Palette, IndianRupee, Globe, Award } from 'lucide-react';

async function getImpactData() {
    const [artisanCount, productCount, categoryData] = await Promise.all([
        prisma.artisanProfile.count(),
        prisma.product.count(),
        prisma.product.findMany({ select: { category: true } }),
    ]);

    const uniqueCategories = new Set(categoryData.map((p) => p.category));
    const totalRevenue = await prisma.product.aggregate({ _sum: { price: true } });

    return {
        artisansOnboarded: artisanCount,
        craftsDigitized: productCount,
        craftForms: uniqueCategories.size,
        estimatedRevenue: totalRevenue._sum.price || 0,
    };
}

export default async function ImpactPage() {
    const data = await getImpactData();

    const cards = [
        {
            label: 'Artisans Onboarded',
            value: data.artisansOnboarded.toLocaleString(),
            icon: <Users className="h-6 w-6" />,
            description: 'Skilled craftspeople empowered with digital tools',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Crafts Digitized',
            value: data.craftsDigitized.toLocaleString(),
            icon: <Package className="h-6 w-6" />,
            description: 'Traditional crafts listed with AI-generated stories',
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Craft Forms Preserved',
            value: data.craftForms.toLocaleString(),
            icon: <Palette className="h-6 w-6" />,
            description: 'Unique craft traditions represented on the platform',
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
        },
        {
            label: 'Est. Revenue Generated',
            value: `₹${data.estimatedRevenue.toLocaleString('en-IN')}`,
            icon: <IndianRupee className="h-6 w-6" />,
            description: 'Value of crafts listed, supporting rural livelihoods',
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
        },
    ];

    const milestones = [
        {
            icon: <Globe className="h-5 w-5 text-white" />,
            title: 'Global Reach',
            description: 'AI-translated listings making crafts accessible across 12+ countries',
            color: 'bg-blue-500',
        },
        {
            icon: <Award className="h-5 w-5 text-white" />,
            title: 'Heritage Preserved',
            description: 'Cultural stories generated for every craft, preserving intangible heritage',
            color: 'bg-purple-500',
        },
        {
            icon: <Users className="h-5 w-5 text-white" />,
            title: 'Rural Impact',
            description: 'Direct-to-buyer model ensuring 100% revenue reaches artisan families',
            color: 'bg-green-500',
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Impact Analytics</h1>
                        <p className="text-gray-500 mt-1">
                            Measuring our social and cultural impact — real data, real change.
                        </p>
                    </div>

                    {/* Impact Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
                            >
                                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                                    <div className={`${card.color} text-white w-10 h-10 rounded-lg flex items-center justify-center`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                                <p className="text-sm font-semibold text-gray-700">{card.label}</p>
                                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Mission Statement */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
                        <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                        <p className="text-orange-100 leading-relaxed max-w-3xl">
                            KarigarSetu bridges the gap between India&apos;s 7 million artisans and the global market.
                            By using AI to tell the stories behind every craft, we ensure that cultural heritage
                            isn&apos;t just preserved — it thrives. Every listing on our platform is a step toward
                            economic empowerment for rural artisan families.
                        </p>
                    </div>

                    {/* Milestones */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Key Impact Areas</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {milestones.map((m) => (
                                <div
                                    key={m.title}
                                    className="bg-white rounded-2xl p-6 border border-gray-100"
                                >
                                    <div className={`w-10 h-10 ${m.color} rounded-lg flex items-center justify-center mb-3`}>
                                        {m.icon}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{m.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{m.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
