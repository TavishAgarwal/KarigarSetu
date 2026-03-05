import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Demo Artisan Profiles ──────────────────────────────────────────────────

const DEMO_ARTISANS = [
    {
        name: 'Rajan Sharma',
        email: 'rajan.sharma@demo.karigarsetu.in',
        password: 'demo1234',
        craft: {
            craftType: 'Blue Pottery',
            craftSpecialization: 'Vases and Decorative Tiles',
            materialsUsed: 'Quartz stone powder, multani mitti, gum, glass',
            techniquesUsed: 'Hand-painting, kiln firing, turquoise glazing',
            location: 'Jaipur, Rajasthan',
            state: 'Rajasthan',
            district: 'Jaipur',
            experienceYears: 18,
            bio: 'Third-generation Blue Pottery artisan from Jaipur. Trained under master craftsman Kripal Singh Shekhawat. Specializes in traditional Mughal-era floral patterns.',
            productionCapacity: 15,
        },
    },
    {
        name: 'Meena Devi',
        email: 'meena.devi@demo.karigarsetu.in',
        password: 'demo1234',
        craft: {
            craftType: 'Madhubani Painting',
            craftSpecialization: 'Wall Art and Scrolls',
            materialsUsed: 'Natural dyes, handmade paper, bamboo nib pen',
            techniquesUsed: 'Line drawing, natural dye extraction, bharni style filling',
            location: 'Madhubani, Bihar',
            state: 'Bihar',
            district: 'Madhubani',
            experienceYears: 22,
            bio: 'Padma Shri nominated Madhubani artist from Mithila region. Her paintings depict fertility, love, and devotion using traditional Kohbar style.',
            productionCapacity: 8,
        },
    },
    {
        name: 'Abdul Kareem',
        email: 'abdul.kareem@demo.karigarsetu.in',
        password: 'demo1234',
        craft: {
            craftType: 'Brass & Metal Work',
            craftSpecialization: 'Lamps, Bells, and Utensils',
            materialsUsed: 'Brass, copper, bell metal',
            techniquesUsed: 'Lost wax casting, hand engraving, patina finishing',
            location: 'Moradabad, Uttar Pradesh',
            state: 'Uttar Pradesh',
            district: 'Moradabad',
            experienceYears: 25,
            bio: 'Master brassworker from the "Peetal Nagri" (Brass City) of Moradabad. Creates temple bells and ceremonial lamps using 200-year-old lost wax technique.',
            productionCapacity: 20,
        },
    },
    {
        name: 'Lakshmi Naidu',
        email: 'lakshmi.naidu@demo.karigarsetu.in',
        password: 'demo1234',
        craft: {
            craftType: 'Handloom Textiles',
            craftSpecialization: 'Silk Sarees and Shawls',
            materialsUsed: 'Pure silk, zari thread, natural dyes',
            techniquesUsed: 'Jacquard weaving, hand block printing, tie-dye',
            location: 'Kanchipuram, Tamil Nadu',
            state: 'Tamil Nadu',
            district: 'Kanchipuram',
            experienceYears: 30,
            bio: 'Fourth-generation silk weaver from Kanchipuram. Known for creating bridal sarees with intricate temple border motifs and gold zari work.',
            productionCapacity: 6,
        },
    },
    {
        name: 'Gopal Mahto',
        email: 'gopal.mahto@demo.karigarsetu.in',
        password: 'demo1234',
        craft: {
            craftType: 'Wood Carving',
            craftSpecialization: 'Furniture and Decorative Panels',
            materialsUsed: 'Sheesham, teak, sandalwood, walnut wood',
            techniquesUsed: 'Hand carving, jali work, inlay work, lacquer finishing',
            location: 'Saharanpur, Uttar Pradesh',
            state: 'Uttar Pradesh',
            district: 'Saharanpur',
            experienceYears: 20,
            bio: 'Expert woodcarver from Saharanpur known for intricate jali (lattice) work. His family has been creating carved wooden screens and furniture for five generations.',
            productionCapacity: 10,
        },
    },
];

// ─── Product Listings ────────────────────────────────────────────────────────

interface SeedProduct {
    title: string;
    description: string;
    story: string;
    price: number;
    category: string;
    tags: string[];
    imageUrl: string;
    stock: number;
    artisanIndex: number; // index into DEMO_ARTISANS
}

const SEED_PRODUCTS: SeedProduct[] = [
    // ── Blue Pottery (Artisan 0: Rajan Sharma) ──
    {
        title: 'Jaipur Blue Pottery Decorative Vase',
        description: 'A stunning 12-inch decorative vase crafted in the iconic Jaipur Blue Pottery style. Features hand-painted turquoise floral motifs with cobalt blue accents on a white quartz base. The smooth glaze finish and elegant tulip shape make it a perfect centerpiece for home décor.',
        story: 'This vase is handcrafted in Jaipur using a centuries-old technique that uniquely uses no clay. Instead, quartz stone powder is mixed with multani mitti and shaped by hand. The art was introduced by Mughal artisans in the 14th century and passed through generations. Each brushstroke is applied freehand, making every piece one-of-a-kind.',
        price: 1850,
        category: 'Blue Pottery',
        tags: ['handmade', 'blue pottery', 'ceramic', 'jaipur', 'home decor'],
        imageUrl: '/products/blue-pottery-vase.png',
        stock: 12,
        artisanIndex: 0,
    },
    {
        title: 'Blue Pottery Dinner Plate Set (4 Pieces)',
        description: 'Set of four hand-painted dinner plates in classic Jaipur Blue Pottery style. Each 10-inch plate features intricate Persian-inspired floral patterns in turquoise, cobalt, and white. Food-safe glaze ensures they are both decorative and functional. Microwave and dishwasher safe.',
        story: 'Blue Pottery is the only Indian ceramic tradition that does not use clay. Artisans mix quartz, glass, and Multani mitti into a dough, shape it on molds, and paint each design freehand before firing at low temperatures. This set celebrates the fusion of Persian and Rajasthani aesthetics.',
        price: 2400,
        category: 'Blue Pottery',
        tags: ['dinner set', 'blue pottery', 'tableware', 'jaipur', 'ceramics'],
        imageUrl: '/products/blue-pottery-plate.png',
        stock: 8,
        artisanIndex: 0,
    },
    {
        title: 'Blue Pottery Mughal Floral Tile (Set of 6)',
        description: 'Six handcrafted decorative tiles featuring traditional Mughal floral patterns. Each 4x4 inch tile is hand-painted with turquoise and cobalt blue on white base. Perfect for kitchen backsplash, bathroom accent, or wall art arrangement.',
        story: 'Decorative tiles were among the first Blue Pottery products created in Jaipur, inspired by the tilework of Persian mosques. Master artisans spend hours painting each tile freehand, resulting in slight variations that celebrate handmade imperfection.',
        price: 980,
        category: 'Blue Pottery',
        tags: ['tiles', 'blue pottery', 'wall decor', 'mughal', 'jaipur'],
        imageUrl: '/products/blue-pottery-tile.png',
        stock: 20,
        artisanIndex: 0,
    },
    {
        title: 'Blue Pottery Tea Set with Tray',
        description: 'Elegant 7-piece tea set featuring a teapot, four cups, a sugar bowl, and a serving tray. Hand-painted in traditional blue pottery style with intricate floral patterns. The set combines functionality with artistry — perfect for chai lovers who appreciate heritage.',
        story: 'Tea culture in Rajasthan is inseparable from its craft traditions. This tea set is made using the 14th-century Blue Pottery technique of Jaipur, where quartz powder replaces clay. Each element is individually painted and fired, creating a set that tells the story of Mughal-era artistry.',
        price: 3200,
        category: 'Blue Pottery',
        tags: ['tea set', 'blue pottery', 'kitchen', 'jaipur', 'ceramic'],
        imageUrl: '/products/blue-pottery-teaset.png',
        stock: 6,
        artisanIndex: 0,
    },
    {
        title: 'Blue Pottery Ceramic Door Knobs (Set of 8)',
        description: 'Set of eight handcrafted ceramic door knobs in vibrant Blue Pottery style. Each knob features unique hand-painted floral motifs in turquoise, cobalt, and white. Comes with brass fittings. Perfect for adding a pop of artisan character to cabinets and drawers.',
        story: 'These door knobs bring centuries of Jaipur craftsmanship to everyday use. Blue Pottery artisans have adapted their traditional techniques to create functional home accessories that allow people to hold a piece of cultural heritage in their hands every day.',
        price: 680,
        category: 'Blue Pottery',
        tags: ['door knobs', 'blue pottery', 'home hardware', 'handmade', 'jaipur'],
        imageUrl: '/products/blue-pottery-knobs.png',
        stock: 15,
        artisanIndex: 0,
    },

    // ── Madhubani Painting (Artisan 1: Meena Devi) ──
    {
        title: 'Madhubani Tree of Life Painting',
        description: 'A magnificent 24x18 inch Madhubani painting depicting the sacred Tree of Life surrounded by birds, fish, and floral motifs. Painted with natural dyes on handmade paper using the traditional Bharni (filled) style. Comes unframed, ready for custom framing.',
        story: 'The Tree of Life is one of the most sacred motifs in Mithila art, symbolizing the connection between earth and heaven. For centuries, women of the Mithila region in Bihar have painted these on their walls during marriages and festivals. This painting preserves that living tradition.',
        price: 4500,
        category: 'Madhubani Painting',
        tags: ['folk art', 'madhubani', 'painting', 'bihar', 'wall art'],
        imageUrl: '/products/madhubani-tree-of-life.png',
        stock: 5,
        artisanIndex: 1,
    },
    {
        title: 'Madhubani Krishna Leela Canvas',
        description: 'A vibrant 20x16 inch Madhubani painting on canvas depicting Lord Krishna playing the flute amidst gopis. Features the characteristic double-line fill technique with peacock and lotus border motifs. Rich earth-toned natural dyes create a warm, spiritual atmosphere.',
        story: 'Krishna is a beloved subject in Madhubani art. This painting uses the Kohbar style, originally reserved for bridal chambers, depicting divine love and devotion. The artist uses natural dyes from turmeric, indigo, and hibiscus flowers — the same palette used by Mithila women for over 2,500 years.',
        price: 3800,
        category: 'Madhubani Painting',
        tags: ['madhubani', 'krishna', 'folk art', 'canvas', 'spiritual'],
        imageUrl: '/products/madhubani-krishna.png',
        stock: 7,
        artisanIndex: 1,
    },
    {
        title: 'Madhubani Fish Wedding Panel',
        description: 'A traditional 18x12 inch Madhubani painting featuring twin fish — the most auspicious symbol in Mithila culture. Painted in the Kachni (line work) style using fine bamboo nib pen and natural inks on textured handmade paper. Double-matted and ready for framing.',
        story: 'The twin fish motif represents fertility and prosperity in Mithila tradition. This painting uses the intricate Kachni line-work technique, where the entire composition is built through fine, parallel lines without any color fill. It was traditionally painted on bridal chamber walls to bless newlyweds.',
        price: 2800,
        category: 'Madhubani Painting',
        tags: ['madhubani', 'fish motif', 'wedding art', 'line drawing', 'bihar'],
        imageUrl: '/products/madhubani-fish-wedding.png',
        stock: 10,
        artisanIndex: 1,
    },
    {
        title: 'Madhubani Peacock Textile Wall Hanging',
        description: 'A 36x24 inch Madhubani painting on natural cotton fabric featuring dancing peacocks surrounded by lotus blooms. Hand-painted with fabric-safe natural dyes. Includes wooden hanging rod and decorative tassels. Adds authentic folk art charm to any room.',
        story: 'The peacock represents grace, beauty, and rain in Mithila mythology. Traditionally, Madhubani art was painted on freshly plastered mud walls of homes. This textile adaptation allows the ancient art to travel beyond Mithila and into homes worldwide, while preserving the technique and symbolism.',
        price: 3200,
        category: 'Madhubani Painting',
        tags: ['madhubani', 'peacock', 'wall hanging', 'textile art', 'folk art'],
        imageUrl: '/products/madhubani-peacock.png',
        stock: 8,
        artisanIndex: 1,
    },

    // ── Brass & Metal Work (Artisan 2: Abdul Kareem) ──
    {
        title: 'Brass Lakshmi Diya Lamp',
        description: 'A beautifully hand-cast brass diya lamp featuring Goddess Lakshmi in the center with five oil wells. Standing 8 inches tall, this ceremonial lamp is perfect for puja rooms, temples, and festive decorations. Polished to a warm golden sheen.',
        story: 'The diya is central to Indian worship — symbolizing the triumph of light over darkness. This lamp is cast using the ancient lost-wax (cire perdue) method in Moradabad, where molten brass is poured into hand-sculpted clay molds. Each lamp takes 3 days to complete.',
        price: 1650,
        category: 'Brass & Metal Work',
        tags: ['brass', 'diya', 'temple', 'pooja', 'festive'],
        imageUrl: '/products/brass-diya.png',
        stock: 18,
        artisanIndex: 2,
    },
    {
        title: 'Hand-Engraved Brass Temple Bell',
        description: 'A traditional 6-inch temple bell crafted from bell metal alloy with intricate hand-engraved floral patterns. Produces a clear, resonant tone that sustains for 15+ seconds. Features a carved rosewood handle with brass chain.',
        story: 'Temple bells are crafted from a specific alloy of brass and copper that produces a unique sustained resonance believed to ward off negative energies. The engraving on this bell depicts sacred flowers and Om symbols, hand-chiseled by master artisans in Moradabad.',
        price: 1200,
        category: 'Brass & Metal Work',
        tags: ['brass', 'temple bell', 'handmade', 'spiritual', 'engraved'],
        imageUrl: '/products/brass-bell.png',
        stock: 14,
        artisanIndex: 2,
    },
    {
        title: 'Dokra Tribal Dancing Lady Sculpture',
        description: 'A 10-inch tribal art sculpture depicting a dancing woman, created using the ancient Dokra lost-wax casting technique. The rough, textured finish and hollow body are hallmarks of this 4,000-year-old art form. Each piece is unique with slight variations.',
        story: 'Dokra is one of the oldest known metal casting techniques in the world, dating back to the Harappan civilization. Tribal artisans in Chhattisgarh and West Bengal create these figures using a lost-wax process where the original wax model is destroyed during casting, ensuring no two pieces are identical.',
        price: 2500,
        category: 'Brass & Metal Work',
        tags: ['dokra', 'tribal art', 'metal sculpture', 'lost wax', 'handmade'],
        imageUrl: '/products/dokra-lady.png',
        stock: 9,
        artisanIndex: 2,
    },
    {
        title: 'Brass Urli Floating Flower Bowl',
        description: 'A traditional brass urli (shallow bowl) with a diameter of 14 inches. Features a hammered finish with a decorative scalloped rim. Ideal for floating flowers, candles, or as a fruit bowl. The antique patina finish adds a rustic elegance.',
        story: 'The Urli is a traditional vessel from Kerala and Tamil Nadu, originally used in temples to hold holy water and flowers. This Moradabad-made version uses traditional sheet metal hammering techniques, where artisans shape flat brass sheets into bowls using hundreds of precisely placed hammer strikes.',
        price: 1800,
        category: 'Brass & Metal Work',
        tags: ['brass', 'urli', 'flower bowl', 'home decor', 'traditional'],
        imageUrl: '/products/brass-urli.png',
        stock: 11,
        artisanIndex: 2,
    },
    {
        title: 'Copper Hammered Water Bottle (1L)',
        description: 'A 1-liter pure copper water bottle with hammered texture finish. Ayurveda recommends drinking water stored in copper vessels for health benefits. Leak-proof lacquered interior for safe daily use. Includes a matching copper cap.',
        story: 'Drinking water from copper vessels is a 5,000-year-old Ayurvedic practice. Copper naturally purifies water and offers health benefits. This bottle is hand-hammered by artisans in Moradabad, creating the distinctive textured finish that prevents fingerprints and adds structural strength.',
        price: 750,
        category: 'Brass & Metal Work',
        tags: ['copper', 'water bottle', 'ayurveda', 'hammered', 'health'],
        imageUrl: '/products/copper-bottle.png',
        stock: 25,
        artisanIndex: 2,
    },

    // ── Handloom Textiles (Artisan 3: Lakshmi Naidu) ──
    {
        title: 'Kanchipuram Pure Silk Saree – Temple Border',
        description: 'A magnificent 6-meter Kanchipuram silk saree in rich maroon with contrasting gold zari temple border. Woven with pure mulberry silk and 24K gold-dipped silver thread (zari). Features traditional checks body pattern and peacock motifs on the pallu.',
        story: 'Kanchipuram sarees have been woven for over 400 years in Tamil Nadu. Legend says the master weavers of Kanchipuram are descendants of Sage Markanda, the legendary weaver of the gods. Each saree takes 15-20 days to weave on a traditional jacquard loom, with the border and body woven separately and interlocked.',
        price: 5500,
        category: 'Handloom Textiles',
        tags: ['silk saree', 'kanchipuram', 'handloom', 'bridal', 'zari'],
        imageUrl: '/products/kanchipuram-saree.png',
        stock: 5,
        artisanIndex: 3,
    },
    {
        title: 'Banarasi Silk Stole – Gold Zari',
        description: 'An exquisite 70x30 inch Banarasi silk stole in royal blue with all-over gold zari buti work. Features traditional Jangla (vine) pattern with a heavy zari border. Lightweight yet rich, perfect for formal occasions and as a statement accessory.',
        story: 'Banarasi textiles date back to the Mughal era when Persian artisans settled in Varanasi and blended their designs with Indian motifs. The gold zari in this stole uses real silver thread coated with gold, woven on a traditional pit loom by master weavers whose families have practiced this art for centuries.',
        price: 2800,
        category: 'Handloom Textiles',
        tags: ['banarasi', 'silk stole', 'zari', 'handwoven', 'varanasi'],
        imageUrl: '/products/banarasi-stole.png',
        stock: 10,
        artisanIndex: 3,
    },
    {
        title: 'Indigo Hand Block Printed Cotton Table Runner',
        description: 'A 72x14 inch table runner in natural cotton, hand block printed with traditional indigo dye. Features geometric and floral motifs inspired by Rajasthani dabu printing. Finished with hand-stitched edges and decorative tassels.',
        story: 'Indigo dyeing and block printing in Rajasthan dates back over 500 years. Natural indigo is extracted from the Indigofera plant and applied through carved teak wood blocks. This runner uses the dabu (mud resist) technique where areas are covered with a clay mixture before dyeing, creating the white-on-blue pattern.',
        price: 950,
        category: 'Handloom Textiles',
        tags: ['block print', 'indigo', 'table runner', 'cotton', 'rajasthani'],
        imageUrl: '/products/indigo-runner.png',
        stock: 18,
        artisanIndex: 3,
    },
    {
        title: 'Pashmina Hand-Embroidered Shawl – Jamawar',
        description: 'A luxurious 80x40 inch pure Pashmina shawl in cream with intricate Jamawar hand-embroidery in multicolor silk thread. Features the iconic paisley (ambi) pattern. Incredibly soft and warm, woven from the fine underfur of Changthangi goats.',
        story: 'Pashmina shawls from Kashmir have adorned royalty for over 500 years. The word "Pashmina" comes from "pashm," meaning soft gold. This shawl is embroidered using the sozni needle technique, where artisans spend 6-8 months creating the intricate Jamawar patterns inspired by Mughal garden designs.',
        price: 5800,
        category: 'Handloom Textiles',
        tags: ['pashmina', 'shawl', 'kashmiri', 'embroidered', 'jamawar'],
        imageUrl: '/products/pashmina-shawl.png',
        stock: 4,
        artisanIndex: 3,
    },
    {
        title: 'Handwoven Ikat Silk Cushion Covers (Pair)',
        description: 'A pair of 16x16 inch cushion covers woven in the Pochampally Ikat technique using pure silk. Features vibrant geometric patterns in indigo and crimson created through the resist-dyeing process. Zip closure for easy washing.',
        story: 'Pochampally Ikat is a UNESCO-recognized craft from Telangana where yarns are tie-dyed before weaving, creating mesmerizing blurred geometric patterns. The "Ikkat" refers to the binding technique where each thread is precisely tied to create the design before it even reaches the loom.',
        price: 1400,
        category: 'Handloom Textiles',
        tags: ['ikat', 'silk', 'cushion covers', 'pochampally', 'handwoven'],
        imageUrl: '/products/ikat-cushion.png',
        stock: 12,
        artisanIndex: 3,
    },

    // ── Wood Carving (Artisan 4: Gopal Mahto) ──
    {
        title: 'Hand-Carved Sheesham Wood Jewelry Box',
        description: 'A beautifully carved jewelry box made from solid Sheesham (Indian Rosewood). Features intricate jali (lattice) work on the lid with a floral vine pattern. Interior lined with red velvet. Measures 8x6x4 inches with a brass hinge and clasp.',
        story: 'Saharanpur in Uttar Pradesh has been the center of Indian woodcarving for over 400 years. This jewelry box showcases the famous jali technique where artisans carve through solid wood to create delicate lattice patterns, originally seen in Mughal architectural screens.',
        price: 1800,
        category: 'Wood Carving',
        tags: ['wooden box', 'jewelry box', 'carved', 'sheesham', 'saharanpur'],
        imageUrl: '/products/sheesham-box.png',
        stock: 10,
        artisanIndex: 4,
    },
    {
        title: 'Sandalwood Carved Elephant Figurine',
        description: 'A 6-inch intricately carved elephant figurine made from genuine Mysore sandalwood. Features fine detailing with howdah (seat), decorative blanket, and ornamental tusk work. Emits a subtle, pleasant sandalwood fragrance. Comes in a presentation box.',
        story: 'The Indian elephant is a symbol of wisdom, strength, and good fortune. Mysore sandalwood carving is a 300-year-old craft tradition of Karnataka. Artisans use refined chiseling techniques to create minute details — the trunk position (raised for good luck), the ornate howdah, and each tiny bell on the ceremonial blanket.',
        price: 3500,
        category: 'Wood Carving',
        tags: ['sandalwood', 'elephant', 'figurine', 'mysore', 'carved'],
        imageUrl: '/products/sandalwood-elephant.png',
        stock: 6,
        artisanIndex: 4,
    },
    {
        title: 'Carved Walnut Wood Decorative Screen Panel',
        description: 'A stunning 24x12 inch carved walnut wood panel featuring traditional Kashmiri chinar leaf and vine motifs. Deep relief carving with a natural walnut finish. Can be mounted on a wall or used as a room divider accent piece.',
        story: 'Walnut wood carving is Kashmir\'s most celebrated craft, recognized with a GI tag. The chinar leaf motif on this panel represents the iconic chinar trees of Kashmir. Artisans in Srinagar carve these panels over several weeks using hand tools passed down through generations, creating depth and shadow play in the design.',
        price: 4200,
        category: 'Wood Carving',
        tags: ['walnut wood', 'kashmiri', 'carved panel', 'wall decor', 'chinar'],
        imageUrl: '/products/walnut-panel.png',
        stock: 5,
        artisanIndex: 4,
    },
    {
        title: 'Channapatna Lacquered Wooden Toy Set',
        description: 'A colorful set of five wooden stacking toys crafted in Channapatna, Karnataka. Made from ivory wood with non-toxic vegetable lacquer coating in vibrant primary colors. Each piece is hand-turned on a lathe. Child-safe and certified.',
        story: 'Channapatna toys have a GI (Geographical Indication) tag and a history dating back to the reign of Tipu Sultan, who invited Persian artisans to train local craftsmen. These toys are made from ivory wood, turned on hand-operated lathes, and coated with vegetable dye lacquer — making them safe for children and gentle on the planet.',
        price: 450,
        category: 'Wood Carving',
        tags: ['wooden toys', 'channapatna', 'eco-friendly', 'kids', 'lacquered'],
        imageUrl: '/products/channapatna-toys.png',
        stock: 22,
        artisanIndex: 4,
    },
    {
        title: 'Teak Wood Carved Ganesha Idol (8 inch)',
        description: 'A hand-carved 8-inch Lord Ganesha idol made from solid teak wood. Features detailed carving with traditional pose — seated on lotus with modak in hand. Finished with natural teak oil to preserve the warm golden-brown color.',
        story: 'Ganesha, the remover of obstacles, is one of the most beloved deities in Indian culture. This idol is carved from a single block of teak wood by artisans in Rajasthan who specialize in religious figurine making. The seated lotus pose with modak represents wisdom, success, and new beginnings.',
        price: 2200,
        category: 'Wood Carving',
        tags: ['ganesha', 'teak wood', 'carved idol', 'spiritual', 'handmade'],
        imageUrl: '/products/teak-ganesha.png',
        stock: 8,
        artisanIndex: 4,
    },
    {
        title: 'Handmade Jute & Cotton Basket – Natural',
        description: 'An eco-friendly round basket handwoven from natural jute and cotton rope. 12 inches in diameter and 8 inches tall. Features a braided rim and decorative cross-stitch pattern. Perfect for storage, planters, or decorative display.',
        story: 'Jute weaving is a centuries-old craft of Bengal, where artisans transform the "golden fiber" into functional art. This basket combines traditional rope-weaving with modern design aesthetics. Each basket takes a full day to hand-weave, with the artisan coiling jute rope and stitching it with cotton thread.',
        price: 550,
        category: 'Handloom Textiles',
        tags: ['jute', 'basket', 'eco-friendly', 'handwoven', 'storage'],
        imageUrl: '/products/jute-cotton-basket.png',
        stock: 20,
        artisanIndex: 3,
    },
    {
        title: 'Warli Art Tribal Canvas Painting',
        description: 'A 18x24 inch contemporary Warli art canvas painting depicting a village scene with dancing figures, huts, and sacred tree. White rice paste paint on terracotta-brown background using the traditional dot-and-dash technique.',
        story: 'Warli art originated in the tribal communities of Maharashtra over 2,500 years ago. Using only white rice paste on mud walls, Warli artists created geometric representations of daily life, harvests, and celebrations. The central tarpa dance motif in this painting depicts a community celebration that is still performed today.',
        price: 2800,
        category: 'Madhubani Painting',
        tags: ['warli art', 'tribal', 'canvas', 'maharashtra', 'folk art'],
        imageUrl: '/products/warli-art.png',
        stock: 7,
        artisanIndex: 1,
    },
];

// ─── Main Seed Function ──────────────────────────────────────────────────────

async function main() {
    console.log('🌱 Starting KarigarSetu marketplace seed...\n');

    // Create demo artisan users and profiles
    const artisanIds: string[] = [];

    for (const artisan of DEMO_ARTISANS) {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email: artisan.email },
            include: { artisanProfile: true },
        });

        if (existing?.artisanProfile) {
            console.log(`  ✓ Artisan "${artisan.name}" already exists (${existing.artisanProfile.id})`);
            artisanIds.push(existing.artisanProfile.id);
            continue;
        }

        const hashedPassword = await bcrypt.hash(artisan.password, 10);

        if (existing) {
            // User exists but no profile — create profile
            const profile = await prisma.artisanProfile.create({
                data: {
                    userId: existing.id,
                    ...artisan.craft,
                },
            });
            console.log(`  ✓ Created profile for existing user "${artisan.name}" (${profile.id})`);
            artisanIds.push(profile.id);
        } else {
            // Create user + profile
            const user = await prisma.user.create({
                data: {
                    name: artisan.name,
                    email: artisan.email,
                    password: hashedPassword,
                    role: 'artisan',
                    artisanProfile: {
                        create: artisan.craft,
                    },
                },
                include: { artisanProfile: true },
            });
            console.log(`  ✓ Created artisan "${artisan.name}" (${user.artisanProfile!.id})`);
            artisanIds.push(user.artisanProfile!.id);
        }
    }

    console.log(`\n📦 Creating ${SEED_PRODUCTS.length} craft listings...\n`);

    let created = 0;
    let skipped = 0;

    for (const product of SEED_PRODUCTS) {
        // Check for duplicate by title
        const existing = await prisma.product.findFirst({
            where: { title: product.title },
        });

        if (existing) {
            console.log(`  ⏭ Skipped "${product.title}" (already exists)`);
            skipped++;
            continue;
        }

        await prisma.product.create({
            data: {
                title: product.title,
                description: product.description,
                story: product.story,
                price: product.price,
                category: product.category,
                tags: JSON.stringify(product.tags),
                imageUrl: product.imageUrl,
                stock: product.stock,
                artisanId: artisanIds[product.artisanIndex],
            },
        });

        console.log(`  ✓ Created "${product.title}" — ₹${product.price}`);
        created++;
    }

    console.log(`\n✅ Seed complete! Created ${created} products, skipped ${skipped}.`);
    console.log(`   Total products in database: ${await prisma.product.count()}`);
    console.log(`   Total artisans: ${await prisma.artisanProfile.count()}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
