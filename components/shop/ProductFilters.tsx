"use client";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export interface FilterState {
  priceRange: {
    min: number | null;
    max: number | null;
  };
  categories: string[];
  types: string[];
  availability: "all" | "inStock" | "outOfStock";
  sortBy: string;
}

interface ProductFiltersProps {
  availableCategories: Array<{ id: string; name_en: string; name_ar: string }>;
  availableTypes: Array<{ id: string; name_en: string; name_ar: string }>;
  onFiltersChange: (filters: FilterState) => void;
  totalProducts: number;
  filteredProducts: number;
  className?: string;
}

export default function ProductFilters({
  availableCategories,
  availableTypes,
  onFiltersChange,
  totalProducts,
  filteredProducts,
  className = "",
}: ProductFiltersProps) {
  const t = useTranslations("filters");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: null, max: null },
    categories: [],
    types: [],
    availability: "all",
    sortBy: "featured",
  });

  const [openSections, setOpenSections] = useState({
    price: true,
    categories: true,
    types: true,
    availability: true,
  });

  const [searchTerms, setSearchTerms] = useState({
    categories: "",
    types: "",
  });

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handlePriceChange = (field: "min" | "max", value: string) => {
    const numValue = value === "" ? null : parseInt(value);
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: numValue,
      },
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleTypeToggle = (typeId: string) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(typeId)
        ? prev.types.filter((id) => id !== typeId)
        : [...prev.types, typeId],
    }));
  };

  const handleAvailabilityChange = (
    value: "all" | "inStock" | "outOfStock"
  ) => {
    setFilters((prev) => ({
      ...prev,
      availability: value,
    }));
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: { min: null, max: null },
      categories: [],
      types: [],
      availability: "all",
      sortBy: "featured",
    });
    setSearchTerms({ categories: "", types: "" });
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filteredCategories = availableCategories.filter((category) => {
    const name = locale === "ar" ? category.name_ar : category.name_en;
    return name.toLowerCase().includes(searchTerms.categories.toLowerCase());
  });

  const filteredTypes = availableTypes.filter((type) => {
    const name = locale === "ar" ? type.name_ar : type.name_en;
    return name.toLowerCase().includes(searchTerms.types.toLowerCase());
  });

  const displayedCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 5);

  const displayedTypes = showAllTypes
    ? filteredTypes
    : filteredTypes.slice(0, 5);

  const activeFiltersCount =
    (filters.priceRange.min || filters.priceRange.max ? 1 : 0) +
    filters.categories.length +
    filters.types.length +
    (filters.availability !== "all" ? 1 : 0);

  const sortOptions = [
    { value: "featured", label: t("sortBy.featured") },
    { value: "priceLowToHigh", label: t("sortBy.priceLowToHigh") },
    { value: "priceHighToLow", label: t("sortBy.priceHighToLow") },
    { value: "nameAtoZ", label: t("sortBy.nameAtoZ") },
    { value: "nameZtoA", label: t("sortBy.nameZtoA") },
    { value: "newest", label: t("sortBy.newest") },
    { value: "oldest", label: t("sortBy.oldest") },
  ];

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-500">
            <SlidersHorizontal className="w-5 h-5" />
            {t("title")}
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-600"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-green-500 hover:text-green-600 hover:bg-green-50"
            >
              <X className="w-4 h-4 mr-1" />
              {t("clearAll")}
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500">
          {t("results.showing")} {filteredProducts} {t("results.of")}{" "}
          {totalProducts} {t("results.products")}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sort By */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("sortBy.title")}</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <Collapsible
          open={openSections.price}
          onOpenChange={() => toggleSection("price")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-sm font-medium cursor-pointer">
              {t("price.title")}
            </Label>
            {openSections.price ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder={t("price.placeholder")}
                  value={filters.priceRange.min || ""}
                  onChange={(e) => handlePriceChange("min", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder={t("price.placeholderMax")}
                  value={filters.priceRange.max || ""}
                  onChange={(e) => handlePriceChange("max", e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">{t("price.currency")}</div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Availability */}
        <Collapsible
          open={openSections.availability}
          onOpenChange={() => toggleSection("availability")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-sm font-medium cursor-pointer">
              {t("availability.title")}
            </Label>
            {openSections.availability ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availability-all"
                  checked={filters.availability === "all"}
                  onCheckedChange={() => handleAvailabilityChange("all")}
                />
                <Label
                  htmlFor="availability-all"
                  className="text-sm cursor-pointer"
                >
                  {t("categories.all")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availability-instock"
                  checked={filters.availability === "inStock"}
                  onCheckedChange={() => handleAvailabilityChange("inStock")}
                />
                <Label
                  htmlFor="availability-instock"
                  className="text-sm cursor-pointer"
                >
                  {t("availability.inStock")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availability-outofstock"
                  checked={filters.availability === "outOfStock"}
                  onCheckedChange={() => handleAvailabilityChange("outOfStock")}
                />
                <Label
                  htmlFor="availability-outofstock"
                  className="text-sm cursor-pointer"
                >
                  {t("availability.outOfStock")}
                </Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Categories */}
        <Collapsible
          open={openSections.categories}
          onOpenChange={() => toggleSection("categories")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-sm font-medium cursor-pointer">
              {t("categories.title")}
              {filters.categories.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-600"
                >
                  {filters.categories.length}
                </Badge>
              )}
            </Label>
            {openSections.categories ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t("categories.placeholder")}
                value={searchTerms.categories}
                onChange={(e) =>
                  setSearchTerms((prev) => ({
                    ...prev,
                    categories: e.target.value,
                  }))
                }
                className="pl-10 text-sm"
              />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {displayedCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {locale === "ar" ? category.name_ar : category.name_en}
                  </Label>
                </div>
              ))}
            </div>
            {filteredCategories.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="w-full text-green-500 hover:text-green-600 hover:bg-green-50"
              >
                {showAllCategories
                  ? t("categories.showLess")
                  : t("categories.showMore")}
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Types */}
        {availableTypes.length > 0 && (
          <Collapsible
            open={openSections.types}
            onOpenChange={() => toggleSection("types")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <Label className="text-sm font-medium cursor-pointer">
                {t("types.title")}
                {filters.types.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-600"
                  >
                    {filters.types.length}
                  </Badge>
                )}
              </Label>
              {openSections.types ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t("types.placeholder")}
                  value={searchTerms.types}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({
                      ...prev,
                      types: e.target.value,
                    }))
                  }
                  className="pl-10 text-sm"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {displayedTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={filters.types.includes(type.id)}
                      onCheckedChange={() => handleTypeToggle(type.id)}
                    />
                    <Label
                      htmlFor={`type-${type.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {locale === "ar" ? type.name_ar : type.name_en}
                    </Label>
                  </div>
                ))}
              </div>
              {filteredTypes.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTypes(!showAllTypes)}
                  className="w-full text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  {showAllTypes ? t("types.showLess") : t("types.showMore")}
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
