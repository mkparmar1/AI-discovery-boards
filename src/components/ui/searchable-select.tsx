"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
    }
  }, [open]);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}
            >{selected ? selected.label : placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className={
          "z-50 min-w-[240px] rounded-md border bg-popover p-2 shadow-md"
        }
        sideOffset={6}
      >
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-8"
          />
        </div>

        <div className="max-h-48 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-2 py-2 text-sm text-muted-foreground">No results</div>
          ) : (
            filtered.map((o) => (
              <DropdownMenu.Item
                key={o.value}
                onSelect={(e) => {
                  e.preventDefault();
                  onChange(o.value);
                  setOpen(false);
                }}
                className={
                  "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                }
              >
                <div className="flex items-center gap-2">
                  {o.icon}
                  <span>{o.label}</span>
                </div>
                {value === o.value ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : null}
              </DropdownMenu.Item>
            ))
          )}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}