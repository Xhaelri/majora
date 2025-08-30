"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  LucideIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Category } from "@prisma/client";
import type { FilterOptions } from "./ClientFilterList";

const MIN_PRICE = 0;
const MAX_PRICE = 3000;

type Props = {
  filters: FilterOptions;
  onUpdateFilter: (
    key: keyof FilterOptions,
    value: FilterOptions[keyof FilterOptions]
  ) => void;
  categories?: Category[];
};

const ClientFilterOptions = ({ filters, onUpdateFilter, categories = [] }: Props) => {
  return (
    <div className="container w-[250px] divide-y-1">
      <AvailabilityFilter 
        selectedAvailability={filters.availability} 
        onUpdate={(value) => onUpdateFilter('availability', value)}
      />
      <PriceRangeFilter 
        priceRange={filters.priceRange}
        onUpdate={(value) => onUpdateFilter('priceRange', value)}
      />
      {categories.length > 0 && (
        <CategoryFilter
          selectedCategories={filters.categories || []}
          categories={categories}
          onUpdate={(value) => onUpdateFilter('categories', value)}
        />
      )}
    </div>
  );
};

function PriceRangeFilter({ 
  priceRange, 
  onUpdate 
}: { 
  priceRange?: { from: number; to: number };
  onUpdate: (value: { from: number; to: number } | undefined) => void;
}) {
  const t = useTranslations("filters");
  
  const value = priceRange || { from: MIN_PRICE, to: MAX_PRICE };

  const handleChange = (newValue: { from: number; to: number }) => {
    // Ensure valid range
    const validFrom = Math.max(MIN_PRICE, Math.min(newValue.from, MAX_PRICE));
    const validTo = Math.max(validFrom, Math.min(newValue.to, MAX_PRICE));
    
    const finalValue = { from: validFrom, to: validTo };
    
    if (finalValue.from === MIN_PRICE && finalValue.to === MAX_PRICE) {
      onUpdate(undefined);
    } else {
      onUpdate(finalValue);
    }
  };

  return (
    <CollapsibleFilter title={t("price")} defaultOpen={false}>
      <div className="flex justify-between space-x-3 px-1">
        <Input
          type="number"
          value={value.from}
          onChange={(e) => {
            const numValue = parseFloat(e.target.value) || 0;
            handleChange({ from: numValue, to: value.to });
          }}
          className="w-28 h-10 lg:w-20"
          min={MIN_PRICE}
          max={MAX_PRICE}
          placeholder={t("minPrice")}
        />
        <Input
          type="number"
          value={value.to}
          onChange={(e) => {
            const numValue = parseFloat(e.target.value) || MAX_PRICE;
            handleChange({ from: value.from, to: numValue });
          }}
          className="w-28 h-10 lg:w-20"
          min={MIN_PRICE}
          max={MAX_PRICE}
          placeholder={t("maxPrice")}
        />
      </div>
      <Slider
        min={MIN_PRICE}
        max={MAX_PRICE}
        step={10}
        value={[value.from, value.to]}
        onValueChange={([from, to]) => handleChange({ from, to })}
        className="w-full mt-4 mb-3"
      />
    </CollapsibleFilter>
  );
}

function AvailabilityFilter({ 
  selectedAvailability, 
  onUpdate 
}: { 
  selectedAvailability?: "in-stock" | "out-of-stock";
  onUpdate: (value: "in-stock" | "out-of-stock" | undefined) => void;
}) {
  const t = useTranslations("filters");

  const handleAvailabilityChange = (value: "in-stock" | "out-of-stock", checked: boolean) => {
    if (checked) {
      // If checking a new option, clear the previous one and set the new one
      onUpdate(value);
    } else {
      // If unchecking, clear the filter
      onUpdate(undefined);
    }
  };

  return (
    <CollapsibleFilter title={t("availability")} defaultOpen={false}>
      <div className="mb-2 flex space-y-3 flex-col ms-5">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={selectedAvailability === "in-stock"}
            onCheckedChange={(checked) => 
              handleAvailabilityChange("in-stock", checked as boolean)
            }
          />
          <label htmlFor="in-stock" className="text-sm font-light tracking-wider leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t("inStock")}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="out-of-stock"
            checked={selectedAvailability === "out-of-stock"}
            onCheckedChange={(checked) => 
              handleAvailabilityChange("out-of-stock", checked as boolean)
            }
          />
          <label htmlFor="out-of-stock" className="text-sm font-light tracking-wider leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t("outOfStock")}
          </label>
        </div>
      </div>
    </CollapsibleFilter>
  );
}

function CategoryFilter({
  selectedCategories,
  categories,
  onUpdate
}: {
  selectedCategories: string[];
  categories: Category[];
  onUpdate: (value: string[]) => void;
}) {
  const t = useTranslations("filters");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      onUpdate([...selectedCategories, categoryId]);
    } else {
      onUpdate(selectedCategories.filter(id => id !== categoryId));
    }
  };

  return (
    <CollapsibleFilter title={t("categories")} defaultOpen={false}>
      <div className="mb-2 flex space-y-3 flex-col ms-5">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={(checked) => 
                handleCategoryChange(category.id, checked as boolean)
              }
            />
            <label 
              htmlFor={`category-${category.id}`} 
              className="text-sm font-light tracking-wider leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {(isRTL && category.nameAr) ? category.nameAr : category.name}
            </label>
          </div>
        ))}
      </div>
    </CollapsibleFilter>
  );
}

const CollapsibleFilter = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  defaultOpen: boolean;
}) => (
  <Collapsible defaultOpen={defaultOpen}>
    <CollapsibleTrigger className="group flex w-full items-center justify-between py-3 space-x-2 lg:w-50">
      <h3 className="flex items-center gap-2 font-extralight tracking-widest text-lg uppercase">
        {!!Icon && <Icon className="h-5 w-5" />} {title}
      </h3>
      <ChevronDown className="h-4 w-4 group-data-[state=open]:rotate-180 transition-transform text-muted-foreground" />
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-1 pb-3 font-light tracking-wider">
      {children}
    </CollapsibleContent>
  </Collapsible>
);

export default ClientFilterOptions;