const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.product.deleteMany();
    await prisma.artisanProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create artisan users
    const password = await bcrypt.hash('password123', 12);

    const user1 = await prisma.user.create({
        data: {
            name: 'Rameshwar Prasad',
            email: 'rameshwar@example.com',
            password,
            role: 'artisan',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Suman Devi',
            email: 'suman@example.com',
            password,
            role: 'artisan',
        },
    });

    const user3 = await prisma.user.create({
        data: {
            name: 'Amrit Lal',
            email: 'amrit@example.com',
            password,
            role: 'artisan',
        },
    });

    // Create artisan profiles
    const profile1 = await prisma.artisanProfile.create({
        data: {
            userId: user1.id,
            craftType: 'Pottery',
            location: 'Jaipur, Rajasthan',
            experienceYears: 25,
            bio: 'Master potter from Jaipur, specializing in traditional blue pottery and terracotta art forms passed down through five generations.',
            profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
        },
    });

    const profile2 = await prisma.artisanProfile.create({
        data: {
            userId: user2.id,
            craftType: 'Textiles',
            location: 'Varanasi, Uttar Pradesh',
            experienceYears: 18,
            bio: 'Silk weaver from Varanasi, creating exquisite Banarasi sarees and fabric with traditional handloom techniques.',
            profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
        },
    });

    const profile3 = await prisma.artisanProfile.create({
        data: {
            userId: user3.id,
            craftType: 'Pottery',
            location: 'Alwar, Rajasthan',
            experienceYears: 15,
            bio: 'Traditional terracotta artist creating functional and decorative pottery using centuries-old techniques.',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
    });

    // Create products
    const products = [
        {
            artisanId: profile1.id,
            title: 'Hand-painted Blue Pottery Vase',
            description: 'A stunning hand-painted blue pottery vase crafted using traditional Jaipur techniques. Made with Egyptian paste, quartz stone powder, and painted with natural cobalt oxide. Each piece is unique, reflecting centuries of artistic tradition.',
            story: 'In the narrow lanes of Jaipur, where the morning sun filters through ornate jharokhas, Rameshwar sits at his wheel, continuing a legacy that spans five generations. The blue pottery tradition, originally brought by Mughal artisans, found new life in Rajasthan through families like his.',
            price: 2499,
            category: 'Pottery',
            tags: JSON.stringify(['BluePottery', 'Handmade', 'Jaipur', 'HomeDecor', 'TraditionalArt']),
            imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
            stock: 5,
        },
        {
            artisanId: profile2.id,
            title: 'Handloom Silk Banarasi Saree',
            description: 'An exquisite Banarasi silk saree woven on traditional handlooms. Features intricate gold zari work with traditional motifs including kalga, bel, and jhal patterns. Made with pure mulberry silk and real gold-plated silver threads.',
            story: 'The ancient ghats of Varanasi echo with the rhythmic clatter of handlooms. Suman Devi, a master weaver, creates each saree as a canvas of cultural storytelling, weaving Mughal-era motifs that tell tales of emperors and artisans.',
            price: 12999,
            category: 'Textiles',
            tags: JSON.stringify(['BanarasiSilk', 'Handloom', 'Saree', 'WeddingWear', 'TraditionalTextile']),
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
            stock: 3,
        },
        {
            artisanId: profile1.id,
            title: 'Sheesham Wood Carved Box',
            description: 'Intricately carved wooden jewelry box made from premium sheesham wood. Features traditional Rajasthani jali work patterns, brass inlay, and velvet-lined interior. Perfect for storing precious jewelry and keepsakes.',
            story: 'The art of sheesham wood carving in Rajasthan dates back to the Marwar kingdom. Each box is carved from a single block of aged sheesham, using chisels and techniques unchanged for centuries.',
            price: 4200,
            category: 'Woodwork',
            tags: JSON.stringify(['WoodCarving', 'Sheesham', 'JewelryBox', 'Rajasthani', 'HandCarved']),
            imageUrl: 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=600',
            stock: 8,
        },
        {
            artisanId: profile3.id,
            title: 'Floral Terracotta Vase Set',
            description: 'A beautiful set of three terracotta vases with hand-painted floral motifs. Made from locally sourced clay, sun-dried, and kiln-fired using traditional methods. Decorated with natural mineral pigments.',
            story: 'Amrit learned the art of terracotta from his father, who learned from his father before him. In the pottery village of Alwar, every home has a wheel, and every artisan carries forward an ancient tradition of shaping earth into beauty.',
            price: 3450,
            category: 'Pottery',
            tags: JSON.stringify(['Terracotta', 'FlowerVase', 'Handmade', 'NaturalClay', 'HomeDecor']),
            imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600',
            stock: 12,
        },
        {
            artisanId: profile2.id,
            title: 'Indigo Ajrakh Block Print Fabric',
            description: 'Authentic Ajrakh block-printed fabric using natural indigo dye. Hand-stamped with carved wooden blocks featuring geometric and floral patterns. Made with 100% organic cotton and eco-friendly natural dyes.',
            story: 'Ajrakh printing is a 4,000-year-old craft that traces its roots to the Indus Valley civilization. Each meter of fabric undergoes up to 16 stages of printing and washing, resulting in rich, layered patterns.',
            price: 1200,
            category: 'Textiles',
            tags: JSON.stringify(['Ajrakh', 'BlockPrint', 'NaturalDye', 'Indigo', 'OrganicCotton']),
            imageUrl: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600',
            stock: 20,
        },
        {
            artisanId: profile3.id,
            title: 'Antique Brass Artifacts Set',
            description: 'A curated collection of brass artifacts including a small diya lamp, incense holder, and decorative bell. Each piece is hand-cast using the lost-wax technique, then finished with traditional patina.',
            story: 'Brass casting in India is an ancient art form, with the lost-wax (dhokra) technique dating back over 4,000 years. These pieces are created by tribal artisans who transform molten brass into timeless art.',
            price: 8750,
            category: 'Metalwork',
            tags: JSON.stringify(['BrassArt', 'Dhokra', 'LostWax', 'IndianArt', 'HomeDecor']),
            imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600',
            stock: 4,
        },
        {
            artisanId: profile2.id,
            title: 'Filigree Silver Earrings',
            description: 'Delicate silver filigree earrings featuring traditional Odisha design patterns. Made with 92.5% sterling silver, each piece is hand-twisted and soldered by master craftsmen.',
            story: 'The art of silver filigree in Cuttack, Odisha, involves twisting and curling fine silver wires into intricate patterns. This ancient craft transforms simple metal into wearable art that tells stories of tradition.',
            price: 4800,
            category: 'Jewelry',
            tags: JSON.stringify(['SilverFiligree', 'SterlingSilver', 'Odisha', 'Handcrafted', 'TraditionalJewelry']),
            imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
            stock: 10,
        },
        {
            artisanId: profile1.id,
            title: 'Embroidered Leather Mojaris',
            description: 'Traditional Rajasthani mojari shoes with intricate hand embroidery. Made from genuine leather with colorful silk thread work and comfortable cushioned insole. Available in multiple sizes.',
            story: 'Mojari making is a centuries-old craft practiced in the desert towns of Rajasthan. Each pair takes 3-4 days to hand-stitch, with artisans using techniques passed down through generations of cobbler families.',
            price: 2100,
            category: 'Leather',
            tags: JSON.stringify(['Mojari', 'Rajasthani', 'LeatherCraft', 'HandEmbroidered', 'TraditionalFootwear']),
            imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600',
            stock: 15,
        },
    ];

    for (const product of products) {
        await prisma.product.create({ data: product });
    }

    // Create a buyer user
    await prisma.user.create({
        data: {
            name: 'Priya Sharma',
            email: 'priya@example.com',
            password,
            role: 'buyer',
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log(`   Created 4 users, 3 artisan profiles, and ${products.length} products`);
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
