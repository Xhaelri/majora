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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

type PriceRange = { from: number; to: number };

const FilterOptions = () => {
  return (
    <div className="w-full max-w-xs divide-y-2">
      <AvailabilityFilter />
      <PriceRangeFilter />
    </div>
  );
};

const MIN_PRICE = 0;
const MAX_PRICE = 3000;

function PriceRangeFilter() {
  const t = useTranslations('filters');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [value, setValue] = useState<PriceRange>({
    from: MIN_PRICE,
    to: MAX_PRICE,
  });

  // Initialize from URL parameters
  useEffect(() => {
    const priceFrom = searchParams.get("priceFrom");
    const priceTo = searchParams.get("priceTo");
    
    setValue({
      from: priceFrom ? Number(priceFrom) : MIN_PRICE,
      to: priceTo ? Number(priceTo) : MAX_PRICE,
    });
  }, [searchParams]);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      
      return params.toString();
    },
    [searchParams]
  );

  const handleChange = (newValue: PriceRange) => {
    setValue(newValue);
    
    const updates: Record<string, string | null> = {};
    
    if (newValue.from !== MIN_PRICE) {
      updates.priceFrom = newValue.from.toString();
    } else {
      updates.priceFrom = null;
    }
    
    if (newValue.to !== MAX_PRICE) {
      updates.priceTo = newValue.to.toString();
    } else {
      updates.priceTo = null;
    }
    
    router.push(pathname + "?" + createQueryString(updates));
  };

  return (
    <CollapsibleFilter title={t('price')} defaultOpen={false}>
      <div className="flex justify-between space-x-3 px-1">
        <Input
          type="number"
          value={value.from}
          onChange={(e) =>
            handleChange({ from: +e.target.value, to: value.to })
          }
          className="w-28 h-10 lg:w-20"
          min={MIN_PRICE}
          max={MAX_PRICE}
          placeholder={t('minPrice')}
        />
        <Input
          type="number"
          value={value.to}
          onChange={(e) =>
            handleChange({ from: value.from, to: +e.target.value })
          }
          className="w-28 h-10 lg:w-20"
          min={MIN_PRICE}
          max={MAX_PRICE}
          placeholder={t('maxPrice')}
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

function AvailabilityFilter() {
  const t = useTranslations('filters');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);

  useEffect(() => {
    const availability = searchParams.get("availability");
    setSelectedAvailability(availability);
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      
      return params.toString();
    },
    [searchParams]
  );

  const handleAvailabilityChange = (value: string, checked: boolean) => {
    const newValue = checked ? value : null;
    setSelectedAvailability(newValue);
    
    router.push(pathname + "?" + createQueryString("availability", newValue));
  };

  return (
    <CollapsibleFilter title={t('availability')} defaultOpen={false} >
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
            {t('inStock')}
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
            {t('outOfStock')}
          </label>
        </div>
      </div>
    </CollapsibleFilter>
  );
}

const CollapsibleFilter = ({
  title,
  icon: Icon,
  children,
  defaultOpen= false
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  defaultOpen:boolean;
}) => (
  <Collapsible defaultOpen={defaultOpen}>
    <CollapsibleTrigger className="group flex w-full items-center justify-between py-3 space-x-2 lg:w-50 ">
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

export default FilterOptions;