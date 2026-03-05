import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const CRAFT_TRADITIONS = [
    {
        name: 'Madhubani Painting',
        region: 'Mithila, Bihar',
        history: '2,500+ years old tradition originating from the Mithila region. Originally painted on freshly plastered walls during weddings and festivals.',
        technique: 'Natural dyes and pigments are used to create intricate geometric and figurative designs with fine bamboo nibs and matchsticks.',
        didYouKnow: 'Madhubani paintings were originally painted on mud walls during weddings by women of the Mithila region.',
        emoji: '🎨',
        category: 'Painting',
    },
    {
        name: 'Blue Pottery',
        region: 'Jaipur, Rajasthan',
        history: 'Brought to India via Persia and Central Asia. Unlike other pottery, it uses no clay — only quartz stone powder, glass, and multani mitti.',
        technique: 'The dough is shaped by hand, sun-dried, and decorated with iconic cobalt blue patterns before kiln firing.',
        didYouKnow: 'Blue Pottery is the only pottery in India that doesn\'t use clay. It\'s made from quartz and raw glaze!',
        emoji: '🏺',
        category: 'Pottery',
    },
    {
        name: 'Banarasi Silk Weaving',
        region: 'Varanasi, Uttar Pradesh',
        history: 'Dating back to the Mughal era, Banarasi silk is renowned worldwide. The craft was historically patronized by Mughal emperors.',
        technique: 'Gold and silver brocade (zari) is woven into fine silk using traditional pit looms, often taking weeks for a single saree.',
        didYouKnow: 'A single Banarasi saree can take up to 6 months to weave and contains real gold or silver threads!',
        emoji: '🧵',
        category: 'Textiles',
    },
    {
        name: 'Dhokra Metal Casting',
        region: 'Bastar, Chhattisgarh',
        history: 'One of the oldest known metal casting techniques, dating back over 4,000 years to the Indus Valley civilization.',
        technique: 'Lost-wax casting (cire perdue) where a clay core is covered with wax threads, then encased in clay. Molten brass replaces the melted wax.',
        didYouKnow: 'The "Dancing Girl" figurine found at Mohenjo-Daro (2500 BC) was made using the same Dhokra technique still practiced today!',
        emoji: '⚱️',
        category: 'Metalwork',
    },
    {
        name: 'Chikankari Embroidery',
        region: 'Lucknow, Uttar Pradesh',
        history: 'Introduced by Mughal empress Nur Jahan in the 17th century, Chikankari became the hallmark of Lucknow\'s refinement.',
        technique: 'Delicate hand embroidery on fine muslin or cotton using white thread, creating shadow-work and intricate floral patterns.',
        didYouKnow: 'Chikankari involves 36 different types of stitches, and a master artisan can take months to complete a single outfit!',
        emoji: '🪡',
        category: 'Embroidery',
    },
    {
        name: 'Bidriware',
        region: 'Bidar, Karnataka',
        history: 'A 14th-century craft born in the Bahmani Sultanate. The word "Bidri" comes from the town of Bidar where it originated.',
        technique: 'A zinc-copper alloy is cast, then intricate silver wire is inlaid into engraved patterns. A special soil treatment turns the base jet black.',
        didYouKnow: 'The special soil used to blacken Bidriware is found only at the Bidar Fort and cannot be replicated anywhere else in the world!',
        emoji: '🖤',
        category: 'Metalwork',
    },
    {
        name: 'Pattachitra',
        region: 'Raghurajpur, Odisha',
        history: 'An ancient cloth scroll painting tradition closely linked to Lord Jagannath worship, dating back over 1,000 years.',
        technique: 'Natural colors from stones, vegetables, and conch shells are used on specially treated cotton cloth (patta) with fine brushes made from mouse hair.',
        didYouKnow: 'Pattachitra artists use brushes made from mouse hair for ultra-fine detailing, and each painting can take 2-3 months!',
        emoji: '🖼️',
        category: 'Painting',
    },
    {
        name: 'Pashmina Weaving',
        region: 'Srinagar, Kashmir',
        history: 'The Pashmina tradition dates back to the 15th century when Sultan Zain-ul-Abidin brought weavers to Kashmir.',
        technique: 'Ultra-fine cashmere wool from Changthangi goats at 14,000+ feet altitude is hand-spun and woven on traditional looms.',
        didYouKnow: 'A single Pashmina shawl uses wool from 3-4 goats and can pass through a ring due to its incredible fineness!',
        emoji: '🧣',
        category: 'Textiles',
    },
    {
        name: 'Terracotta Craft',
        region: 'Bankura, West Bengal',
        history: 'One of the most ancient art forms in India, terracotta figurines have been found at Indus Valley sites dating to 3000 BC.',
        technique: 'Local river clay is shaped by hand or on wheels, sun-dried, and fired in traditional kilns. The iconic Bankura horse is carved without molds.',
        didYouKnow: 'The Bankura Horse has become such an iconic symbol that it\'s now the official logo of the All India Handicrafts Board!',
        emoji: '🐴',
        category: 'Pottery',
    },
];

export default function HeritagePage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
                        <span>🏛️</span> CRAFT HERITAGE DISCOVERY
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Discover India&apos;s Living <span className="text-orange-500">Heritage</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore centuries-old craft traditions that connect communities, preserve culture,
                        and tell the stories of India&apos;s master artisans.
                    </p>
                </div>
            </section>

            {/* Craft Traditions */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CRAFT_TRADITIONS.map((craft) => (
                            <div
                                key={craft.name}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-3xl">{craft.emoji}</span>
                                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
                                            {craft.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold">{craft.name}</h3>
                                    <p className="text-orange-100 text-sm mt-1">📍 {craft.region}</p>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
                                            History & Origin
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{craft.history}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
                                            Traditional Technique
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{craft.technique}</p>
                                    </div>

                                    {/* Did You Know */}
                                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                        <p className="text-xs font-bold text-orange-700 mb-1">💡 Did you know?</p>
                                        <p className="text-sm text-orange-800">{craft.didYouKnow}</p>
                                    </div>

                                    <Link
                                        href={`/marketplace?category=${craft.category}`}
                                        className="block text-center text-orange-600 hover:text-orange-700 text-sm font-medium pt-2"
                                    >
                                        Explore {craft.name} Products →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact */}
            <section className="bg-orange-500 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '45+', label: 'CRAFT TRADITIONS' },
                            { value: '500+', label: 'YEARS OF HISTORY' },
                            { value: '28', label: 'STATES REPRESENTED' },
                            { value: '∞', label: 'STORIES TO TELL' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-orange-100 text-sm mt-1 tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
