"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectOfficesProps {
  options: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function MultiSelectOffices({ options, selectedIds, onChange }: MultiSelectOfficesProps) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (id: string) => {
    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    onChange(nextIds);
  };

  const toggleAll = () => {
    if (selectedIds.length === options.length) {
      onChange([]); // Clear selections
    } else {
      onChange(options.map((o) => o.id)); // Select all items
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[260px] h-9 justify-between text-xs shadow-sm font-medium bg-background"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">
              {selectedIds.length === 0
                ? "Exclude All Offices"
                : selectedIds.length === options.length
                ? "All Offices Selected"
                : `${selectedIds.length} of ${options.length} Selected`}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search exchange..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs p-2 text-center text-muted-foreground">No exchange found.</CommandEmpty>
            <CommandGroup>
              {/* Select All Toggle Switch Row Entry */}
              <CommandItem
                onSelect={toggleAll}
                className="flex items-center gap-2 text-xs font-semibold border-b pb-2 cursor-pointer"
              >
                <Checkbox 
                  checked={selectedIds.length === options.length}
                  onCheckedChange={toggleAll}
                  className="h-3.5 w-3.5"
                />
                <span>Select All Exchanges</span>
              </CommandItem>
              
              {/* Individual Station Option Mapping */}
              {options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => toggleOption(option.id)}
                    className="flex items-center gap-2 text-xs cursor-pointer py-1.5"
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleOption(option.id)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="truncate">{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
