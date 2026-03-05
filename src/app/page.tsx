import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroButtons from '@/components/HeroButtons';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      artisan: {
        include: { user: { select: { name: true } } },
      },
    },
  });
  return products;
}

async function getPlatformStats() {
  const [artisanCount, productCount, categoryData, locationData] = await Promise.all([
    prisma.artisanProfile.count(),
    prisma.product.count(),
    prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
    prisma.artisanProfile.findMany({ select: { location: true }, distinct: ['location'] }),
  ]);

  // Calculate growth: products created in last 30 days vs previous 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const [recentCount, olderCount] = await Promise.all([
    prisma.product.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.product.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
  ]);
  const growthPct = olderCount > 0 ? Math.round(((recentCount - olderCount) / olderCount) * 100) : (recentCount > 0 ? 100 : 0);

  return {
    artisans: artisanCount,
    products: productCount,
    categories: categoryData.length,
    regions: locationData.length,
    growthPct,
  };
}

export default async function LandingPage() {
  const [featuredProducts, platformStats] = await Promise.all([
    getFeaturedProducts(),
    getPlatformStats(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
                <span className="animate-pulse">✦</span> EMPOWERING RURAL HERITAGE
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                KarigarSetu – AI that helps artisans{' '}
                <span className="text-orange-500">tell their story</span> and sell to the world
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Connecting traditional Indian craftsmanship with the global digital market through
                intelligent narrative generation and direct commerce tools.
              </p>
              <HeroButtons />
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=500&fit=crop"
                  alt="Traditional Indian Pottery"
                  width={600}
                  height={500}
                  className="object-cover w-full"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUpIcon />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{platformStats.growthPct > 0 ? `${platformStats.growthPct}%` : 'New'}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{platformStats.growthPct > 0 ? 'Monthly Growth' : 'Getting Started'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: platformStats.artisans > 0 ? platformStats.artisans.toLocaleString() : '0', label: 'ARTISANS' },
              { value: platformStats.products > 0 ? platformStats.products.toLocaleString() : '0', label: 'CRAFTS LISTED' },
              { value: platformStats.categories > 0 ? String(platformStats.categories) : '0', label: 'CRAFT TYPES' },
              { value: platformStats.regions > 0 ? String(platformStats.regions) : '0', label: 'REGIONS' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-orange-100 text-sm mt-1 tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artisan Crafts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Artisan Crafts</h2>
              <p className="text-gray-500 mt-2">
                Discover unique, handmade treasures crafted with centuries-old techniques, now
                presented through modern AI storytelling.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-orange-600 hover:text-orange-700 font-medium hidden sm:block"
            >
              View Gallery →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {product.title}
                </h3>
                <p className="text-orange-600 font-bold mt-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16">
            Our platform bridges the gap between rural workshops and global living rooms in three
            simple steps.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: '📸',
                title: '1. Upload Craft',
                desc: 'Artisans take simple photos of their work using our easy mobile interface.',
                color: 'bg-orange-100',
              },
              {
                icon: '✨',
                title: '2. AI Magic',
                desc: 'Our AI generates professional descriptions and tells the unique heritage story of each piece.',
                color: 'bg-orange-100',
              },
              {
                icon: '🌍',
                title: '3. Sell Globally',
                desc: 'Products go live on global marketplaces with integrated logistics and secure payments.',
                color: 'bg-orange-100',
              },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-2xl mb-6`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Voices of Impact</h2>
          <p className="text-gray-500 mb-16">
            Hear from the artisans who are redefining their future with KarigarSetu.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Rameshwar Prasad',
                title: 'Terracotta Artist, Rajasthan',
                quote:
                  '"I never thought my pottery would reach someone in London. KarigarSetu helped me describe the tradition my grandfather taught me in a way the world understands."',
                rating: 5,
              },
              {
                name: 'Suman Devi',
                title: 'Silk Weaver, Uttar Pradesh',
                quote:
                  '"The AI wrote such beautiful stories about my weaving patterns. My sales have tripled in the last six months, and I\'ve hired two more women from my village."',
                rating: 5,
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-gray-50 rounded-2xl p-8 text-left hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-orange-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-orange-600">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section id="heritage" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
                <span>🏛️</span> CRAFT HERITAGE
              </div>
              <h2 className="text-3xl font-bold text-gray-900">India&apos;s Living Heritage</h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                Discover centuries-old craft traditions that connect communities and preserve culture.
              </p>
            </div>
            <Link
              href="/heritage"
              className="text-orange-600 hover:text-orange-700 font-medium hidden sm:block"
            >
              Explore All Crafts →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Madhubani Painting',
                region: 'Mithila, Bihar',
                history: '2,500+ years old tradition originally painted on freshly plastered walls during weddings and festivals.',
                technique: 'Natural dyes and pigments create intricate geometric designs with fine bamboo nibs.',
                didYouKnow: 'Originally painted on mud walls during weddings by women of the Mithila region.',
                emoji: '🎨',
                category: 'Painting',
              },
              {
                name: 'Blue Pottery',
                region: 'Jaipur, Rajasthan',
                history: 'Brought to India via Persia and Central Asia — uniquely uses no clay, only quartz stone powder.',
                technique: 'Dough is shaped by hand, sun-dried, and decorated with iconic cobalt blue patterns.',
                didYouKnow: 'The only pottery in India that doesn\'t use clay. Made from quartz and raw glaze!',
                emoji: '🏺',
                category: 'Pottery',
              },
              {
                name: 'Banarasi Silk Weaving',
                region: 'Varanasi, Uttar Pradesh',
                history: 'Dating back to the Mughal era, historically patronized by emperors and renowned worldwide.',
                technique: 'Gold and silver brocade (zari) woven into fine silk on traditional pit looms.',
                didYouKnow: 'A single saree can take up to 6 months to weave and contains real gold or silver threads!',
                emoji: '🧵',
                category: 'Textiles',
              },
              {
                name: 'Dhokra Metal Casting',
                region: 'Bastar, Chhattisgarh',
                history: 'One of the oldest known metal casting techniques, dating back over 4,000 years.',
                technique: 'Lost-wax casting where a clay core is covered with wax threads, then encased in clay.',
                didYouKnow: 'The "Dancing Girl" from Mohenjo-Daro (2500 BC) was made using the same technique!',
                emoji: '⚱️',
                category: 'Metalwork',
              },
              {
                name: 'Chikankari Embroidery',
                region: 'Lucknow, Uttar Pradesh',
                history: 'Introduced by Mughal empress Nur Jahan in the 17th century, a hallmark of Lucknow.',
                technique: 'Delicate hand embroidery on fine muslin using white thread, creating shadow-work.',
                didYouKnow: 'Involves 36 different types of stitches — a master can take months to complete one outfit!',
                emoji: '🪡',
                category: 'Embroidery',
              },
              {
                name: 'Pashmina Weaving',
                region: 'Srinagar, Kashmir',
                history: 'Dates back to the 15th century when Sultan Zain-ul-Abidin brought weavers to Kashmir.',
                technique: 'Ultra-fine cashmere wool from Changthangi goats at 14,000+ feet, hand-spun and woven.',
                didYouKnow: 'A single shawl uses wool from 3-4 goats and can pass through a ring due to its fineness!',
                emoji: '🧣',
                category: 'Textiles',
              },
            ].map((craft) => (
              <div
                key={craft.name}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{craft.emoji}</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
                      {craft.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{craft.name}</h3>
                  <p className="text-orange-100 text-sm mt-0.5">📍 {craft.region}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                      History &amp; Origin
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{craft.history}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                      Traditional Technique
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{craft.technique}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <p className="text-xs font-bold text-orange-700 mb-0.5">💡 Did you know?</p>
                    <p className="text-sm text-orange-800">{craft.didYouKnow}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/heritage"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Explore All Crafts →
            </Link>
          </div>
        </div>
      </section>

      {/* KarigarSetu Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
            <span>❤️</span> REAL-WORLD IMPACT
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">KarigarSetu Impact</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-12">
            Every listing and every purchase creates measurable social change.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
            {[
              { emoji: '👥', value: platformStats.artisans, label: 'Artisans Onboarded' },
              { emoji: '📦', value: platformStats.products, label: 'Products Listed' },
              { emoji: '🎨', value: platformStats.categories, label: 'Craft Traditions' },
              { emoji: '📍', value: platformStats.regions, label: 'States Represented' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-all">
                <p className="text-2xl mb-2">{stat.emoji}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/impact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-200"
          >
            View Full Impact Dashboard →
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to showcase your craft?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Join the digital revolution and bring your heritage to the global stage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              Join as an Artisan
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/50 hover:bg-white/10 transition-colors"
            >
              Contact Partnership
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
