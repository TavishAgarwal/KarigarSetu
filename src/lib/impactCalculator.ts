/**
 * Impact Calculator — estimates the real-world social impact of purchasing a craft product.
 *
 * Uses product price, craft type, artisan experience, and materials to compute
 * labor days supported, families helped, and heritage age preserved.
 */

/** Craft heritage age estimates (in years) by craft type keyword */
const CRAFT_HERITAGE_MAP: Record<string, number> = {
    madhubani: 2500,
    warli: 2000,
    chikankari: 400,
    kanjivaram: 500,
    dokra: 4000,
    blue_pottery: 300,
    block_print: 500,
    kalamkari: 3000,
    phulkari: 300,
    pashmina: 600,
    banarasi: 500,
    zardozi: 500,
    bidri: 600,
    pattachitra: 1000,
    tanjore: 400,
    meenakari: 500,
    // Broad fallbacks
    pottery: 5000,
    weaving: 3000,
    embroidery: 400,
    painting: 2000,
    metalwork: 3000,
    woodwork: 2000,
    textile: 1500,
    jewelry: 2000,
};

/** Average daily wage for skilled artisans (INR) */
const AVG_DAILY_WAGE = 500;

/** Average artisan family size in rural India */
const DEFAULT_FAMILY_MEMBERS = 4;

/** Labor hour multipliers based on material/technique complexity */
const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
    silk: 1.8,
    gold: 1.5,
    silver: 1.4,
    zari: 1.6,
    handwoven: 1.5,
    handloom: 1.4,
    'hand-embroidered': 1.6,
    intricate: 1.5,
    filigree: 2.0,
    lacquer: 1.3,
    terracotta: 1.1,
    brass: 1.3,
    copper: 1.3,
    wood: 1.2,
    cotton: 1.0,
    jute: 0.9,
};

export interface CraftImpact {
    laborDays: number;
    familiesSupported: number;
    craftAge: number;
    impactSummary: string;
    estimatedLaborHours: number;
}

/**
 * Calculate the social impact of a craft purchase.
 */
export function calculateCraftImpact(product: {
    price: number;
    category: string;
    title: string;
    description: string;
    artisan: {
        craftType: string;
        experienceYears: number;
        materialsUsed?: string | null;
        techniquesUsed?: string | null;
        workshopSize?: number | null;
    };
}): CraftImpact {
    // ── Labor days calculation ──
    // Base: price / daily wage
    let laborDays = Math.max(1, Math.round(product.price / AVG_DAILY_WAGE));

    // Apply complexity multiplier based on materials/techniques
    const allText = [
        product.category,
        product.title,
        product.description,
        product.artisan.craftType,
        product.artisan.materialsUsed || '',
        product.artisan.techniquesUsed || '',
    ]
        .join(' ')
        .toLowerCase();

    let complexityMultiplier = 1.0;
    for (const [keyword, multiplier] of Object.entries(COMPLEXITY_MULTIPLIERS)) {
        if (allText.includes(keyword)) {
            complexityMultiplier = Math.max(complexityMultiplier, multiplier);
        }
    }
    laborDays = Math.max(1, Math.round(laborDays * complexityMultiplier));

    const estimatedLaborHours = laborDays * 8;

    // ── Families supported ──
    // At minimum 1, scale with workshop size
    const workshopSize = product.artisan.workshopSize || 1;
    const familiesSupported = Math.max(1, Math.min(workshopSize, 5));

    // ── Craft heritage age ──
    const craftTextLower = [
        product.artisan.craftType,
        product.category,
        product.title,
    ]
        .join(' ')
        .toLowerCase()
        .replace(/[^a-z\s]/g, '');

    let craftAge = 200; // default
    for (const [keyword, age] of Object.entries(CRAFT_HERITAGE_MAP)) {
        if (craftTextLower.includes(keyword.replace('_', ' ')) || craftTextLower.includes(keyword)) {
            craftAge = Math.max(craftAge, age);
        }
    }

    // ── Impact summary ──
    const artisanYears = product.artisan.experienceYears;
    const impactSummary = `Your purchase supports ${laborDays} day${laborDays > 1 ? 's' : ''} of skilled artisan labor, ` +
        `sustaining ${familiesSupported} artisan ${familiesSupported > 1 ? 'families' : 'family'} practicing a ${craftAge.toLocaleString()}-year-old craft tradition. ` +
        `This artisan brings ${artisanYears} year${artisanYears > 1 ? 's' : ''} of master craftsmanship to every piece.`;

    return {
        laborDays,
        familiesSupported,
        craftAge,
        impactSummary,
        estimatedLaborHours,
    };
}
