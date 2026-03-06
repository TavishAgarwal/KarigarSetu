'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface FilterSidebarProps {
    selectedCategories: string[];
    selectedRegions: string[];
    priceRange: [number, number];
    onCategoryChange: (categories: string[]) => void;
    onRegionChange: (regions: string[]) => void;
    onPriceChange: (range: [number, number]) => void;
}

const CATEGORIES = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Leather'];
const REGIONS = ['Rajasthan', 'West Bengal', 'Gujarat', 'Odisha', 'Uttar Pradesh', 'Kashmir'];

export default function FilterSidebar({
    selectedCategories,
    selectedRegions,
    priceRange,
    onCategoryChange,
    onRegionChange,
    onPriceChange,
}: FilterSidebarProps) {
    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            onCategoryChange(selectedCategories.filter((c) => c !== cat));
        } else {
            onCategoryChange([...selectedCategories, cat]);
        }
    };

    const toggleRegion = (reg: string) => {
        if (selectedRegions.includes(reg)) {
            onRegionChange(selectedRegions.filter((r) => r !== reg));
        } else {
            onRegionChange([...selectedRegions, reg]);
        }
    };

    return (
        <div className="space-y-8" role="region" aria-label="Product filters">
            <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>

            {/* Craft Type */}
            <fieldset>
                <legend className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
                    Craft Type
                </legend>
                <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                        <div key={cat} className="flex items-center gap-2">
                            <Checkbox
                                id={`cat-${cat}`}
                                checked={selectedCategories.includes(cat)}
                                onCheckedChange={() => toggleCategory(cat)}
                                className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <Label htmlFor={`cat-${cat}`} className="text-sm text-gray-700 cursor-pointer">
                                {cat}
                            </Label>
                        </div>
                    ))}
                </div>
            </fieldset>

            {/* Region */}
            <fieldset>
                <legend className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
                    Region
                </legend>
                <div className="space-y-2">
                    {REGIONS.map((reg) => (
                        <div key={reg} className="flex items-center gap-2">
                            <Checkbox
                                id={`reg-${reg}`}
                                checked={selectedRegions.includes(reg)}
                                onCheckedChange={() => toggleRegion(reg)}
                                className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <Label htmlFor={`reg-${reg}`} className="text-sm text-gray-700 cursor-pointer">
                                {reg}
                            </Label>
                        </div>
                    ))}
                </div>
            </fieldset>

            {/* Price Range */}
            <div role="group" aria-label="Price range filter">
                <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3" id="price-range-label">
                    Price Range
                </h3>
                <Slider
                    defaultValue={[priceRange[0]]}
                    max={25000}
                    min={500}
                    step={500}
                    onValueChange={(value) => onPriceChange([value[0], priceRange[1]])}
                    className="mb-4"
                    aria-labelledby="price-range-label"
                />
                <div className="flex items-center justify-between text-sm text-gray-500" aria-live="polite">
                    <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                    <span>₹25,000+</span>
                </div>
            </div>

            {/* Ethical badge */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h4 className="font-semibold text-orange-700 text-sm mb-1">Ethical & Direct</h4>
                <p className="text-xs text-orange-600/80">
                    100% of proceeds go directly to our karigars. Support traditional heritage.
                </p>
            </div>
        </div>
    );
}
