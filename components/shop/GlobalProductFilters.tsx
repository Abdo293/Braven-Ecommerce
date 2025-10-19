"use client";
import { useState } from "react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ChevronDown,
  ChevronUp,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";

interface GlobalProductFiltersProps {
  availableCategories: Array<{ id: string; name_en: string; name_ar: string }>;
  availableTypes: Array<{ id: string; name_en: string; name_ar: string }>;
  className?: string;
  isMobile?: boolean;
}

export default function GlobalProductFilters({
  availableCategories = [],
  availableTypes = [],
  className = "",
  isMobile = false,
}: GlobalProductFiltersProps) {
  const t = useTranslations("filters");
  const locale = useLocale();

  // Zustand store
  const {
    filters,
    filteredProducts,
    totalProducts,
    updatePriceRange,
    toggleCategory,
    toggleType,
    setAvailability,
    setSortBy,
    clearAllFilters,
  } = useFilterStore();

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
  const [isOpen, setIsOpen] = useState(false);

  const handlePriceChange = (field: "min" | "max", value: string) => {
    const numValue = value === "" ? null : parseInt(value);
    updatePriceRange(field, numValue);
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t("sortBy.title")}</Label>
        <Select value={filters.sortBy} onValueChange={setSortBy}>
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
                  onCheckedChange={() => toggleCategory(category.id)}
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
                    onCheckedChange={() => toggleType(type.id)}
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
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {t("title")}
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-96">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-green-500">
                <SlidersHorizontal className="w-5 h-5" />
                {t("title")}
              </SheetTitle>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  {t("clearAll")}
                </Button>
              )}
            </div>
            <SheetDescription className="text-sm text-gray-500">
              {t("results.showing")} {filteredProducts.length} {t("results.of")}{" "}
              {totalProducts} {t("results.products")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

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
              onClick={handleClearAllFilters}
              className="text-green-500 hover:text-green-600 hover:bg-green-50"
            >
              <X className="w-4 h-4 mr-1" />
              {t("clearAll")}
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500">
          {t("results.showing")} {filteredProducts.length} {t("results.of")}{" "}
          {totalProducts} {t("results.products")}
        </div>
      </CardHeader>

      <CardContent>
        <FilterContent />
      </CardContent>
    </Card>
  );
}
