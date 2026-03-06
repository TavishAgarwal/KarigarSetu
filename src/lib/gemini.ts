/**
 * Barrel re-export for backward compatibility.
 * All AI functions are now organized in domain-specific modules under src/lib/ai/.
 *
 * New code should import directly from the specific module:
 *   import { analyzeCraftImage } from '@/lib/ai/vision';
 *
 * This file re-exports everything so existing imports continue to work.
 */

// ─── Shared Client ─────────────────────────────────────────────────────────
export { cleanJsonResponse } from './ai/client';

// ─── Vision ────────────────────────────────────────────────────────────────
export { analyzeCraftImage } from './ai/vision';
export type { VisionAnalysisResult } from './ai/vision';

// ─── Listing ───────────────────────────────────────────────────────────────
export { generateListing } from './ai/listing';
export type { AIListingResult } from './ai/listing';

// ─── Heritage & Craft Stories ──────────────────────────────────────────────
export { generateHeritageStory, generateCraftStory } from './ai/heritage';
export type { HeritageStoryResult, CraftStoryResult } from './ai/heritage';

// ─── Marketing ─────────────────────────────────────────────────────────────
export { generateMarketingContent } from './ai/marketing';
export type { MarketingContentResult } from './ai/marketing';

// ─── Trends ────────────────────────────────────────────────────────────────
export { generateTrendInsights, generateCraftTrendPrediction } from './ai/trends';
export type { CraftTrendPredictionResult } from './ai/trends';

// ─── Pricing ───────────────────────────────────────────────────────────────
export { estimateFairPrice } from './ai/pricing';
export type { PriceEstimateResult } from './ai/pricing';

// ─── Demand ────────────────────────────────────────────────────────────────
export { generateGlobalCraftDemand } from './ai/demand';
export type { GlobalDemandRegion, GlobalDemandResult } from './ai/demand';

// ─── Authentication ────────────────────────────────────────────────────────
export { authenticateCraft, authenticateHandmade } from './ai/authentication';
export type { CraftProvenanceResult, HandmadeAuthResult } from './ai/authentication';

// ─── Shopper ───────────────────────────────────────────────────────────────
export { parseShopperIntent, generateShopperResponse, generateShopperResponseStream } from './ai/shopper';
export type { ShopperIntent, ShopperProduct } from './ai/shopper';

// ─── Translation ───────────────────────────────────────────────────────────
export { translateText } from './ai/translation';

// ─── Production ────────────────────────────────────────────────────────────
export { generateProductionPlan } from './ai/production';
export type { ProductionPlanResult } from './ai/production';
