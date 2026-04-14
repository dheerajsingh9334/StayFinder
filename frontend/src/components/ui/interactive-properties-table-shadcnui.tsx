import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Filter, Search, MapPin, Star, RefreshCw } from "lucide-react";
import React, { useMemo, useState } from "react";

import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> { variant?: string; }
function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", className)} {...props} />;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: string; size?: string; }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50", className)} {...props} />
));
Button.displayName = "Button";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input type={type} ref={ref} className={cn("flex h-10 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm", className)} {...props} />
));
Input.displayName = "Input";

import type { PropertyPayload } from "../../features/property/property.types";
import CalendarView from "../../pages/availbility/CalenderView";
import { ManageAvailability } from "../property/ManageAvailability";
import { useDeleteProperty } from "../../features/property/property.hooks";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface InteractivePropertiesTableProps {
  properties: PropertyPayload[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

type Filters = {
  status: string[];
  city: string[];
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  INACTIVE: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

function PropertyRow({
  property,
  expanded,
  onToggle,
}: {
  property: PropertyPayload;
  expanded: boolean;
  onToggle: () => void;
}) {
  const coverImage = property.images?.[0];
  const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this property? This action is soft-delete.")) {
      deleteProperty(property.id, {
        onSuccess: () => toast.success("Property deleted"),
        onError: (err) => toast.error(err.message || "Failed to delete property"),
      });
    }
  };

  return (
    <>
      <motion.button
        onClick={onToggle}
        className="w-full p-4 text-left transition-colors hover:bg-white/5 active:bg-white/10"
        whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </motion.div>

          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden border border-white/5">
            {coverImage ? (
              <img src={coverImage} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600 font-bold uppercase text-xs">NO IMG</div>
            )}
          </div>

          <Badge
            variant="outline"
            className={`flex-shrink-0 w-24 justify-center text-[10px] font-bold tracking-wider ${statusStyles[property.status] || "bg-white/10 text-zinc-300"}`}
          >
            {property.status}
          </Badge>

          <div className="flex-1 min-w-0 pr-4">
            <span className="block truncate text-sm font-semibold text-zinc-100">
              {property.title}
            </span>
            <span className="flex items-center gap-1 mt-1 text-xs text-zinc-400 truncate">
               <MapPin size={12} /> {property.city || "Unknown City"}, {property.state || "Unknown"}
            </span>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1 w-24 text-right">
             <Star size={14} className="text-amber-400" />
             <span className="text-sm font-medium text-zinc-200">{Number(property.averageRating || 0) > 0 ? Number(property.averageRating).toFixed(1) : 'New'}</span>
          </div>

          <span className="w-32 flex-shrink-0 text-right font-mono text-sm font-semibold text-zinc-300 whitespace-nowrap">
            ₹{Number(property.price || 0).toLocaleString('en-IN')} / night
          </span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key={`details-${property.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-[#111111]"
          >
            <div className="space-y-4 p-4 lg:p-6 pl-12 flex flex-col lg:flex-row gap-6">
              
              <div className="flex-1 space-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Property Description
                  </p>
                  <p className="rounded-lg bg-[#0a0a0a] border border-white/5 p-4 text-sm text-zinc-300 max-h-[120px] overflow-y-auto">
                    {property.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Capacity
                    </p>
                    <p className="font-mono text-zinc-200">{property.capacity || 0} Guests</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Rooms & Baths
                    </p>
                    <p className="font-mono text-xs text-zinc-200">
                      {property.bedrooms || 0} Bed / {property.bathrooms || 0} Bath
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Country
                    </p>
                    <p className="font-mono text-zinc-200">{property.country || "IN"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      ID
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400 truncate">
                      {property.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="lg:w-48 space-y-2 shrink-0">
                 <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</p>
                 <a href={`/properties/${property.id}?edit=true`} className="w-full flex items-center justify-center p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors text-xs font-semibold">
                    Edit Property
                 </a>
                 <a href={`/properties/${property.id}`} className="w-full flex items-center justify-center p-2 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors text-xs font-semibold">
                    View Live Page
                 </a>
                 {property.status !== "DELETED" && (
                   <button 
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="w-full flex items-center justify-center p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-semibold disabled:opacity-50"
                   >
                     {isDeleting ? "Deleting..." : <><Trash2 size={12} className="mr-2" /> Delete Property</>}
                   </button>
                 )}
              </div>
            </div>
            
            <div className="p-4 lg:p-6 border-t border-white/5 bg-[#0a0a0a]">
              <ManageAvailability propertyId={property.id} />
              
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mt-6">
                 Availability & Capacity Calendar
              </p>
              <div className="rounded-xl overflow-hidden border border-white/5 bg-[#111111] w-full" style={{ minHeight: "400px" }}>
                 <CalendarView propertyId={property.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterPanel({
  filters,
  onChange,
  properties,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  properties: PropertyPayload[];
}) {
  const statuses = Array.from(new Set(properties.map((p) => p.status))).filter(Boolean);
  const cities = Array.from(new Set(properties.map((p) => p.city))).filter(Boolean);

  const toggleFilter = (category: keyof Filters, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    onChange({
      ...filters,
      [category]: updated,
    });
  };

  const clearAll = () => {
    onChange({
      status: [],
      city: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (group) => group.length > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.05 }}
      className="flex h-[calc(100vh-160px)] flex-col space-y-6 overflow-y-auto bg-[#111111] p-4 custom-scrollbar"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 text-[10px] uppercase font-bold tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Status
        </p>
        <div className="space-y-2">
          {statuses.map((status) => {
            const selected = filters.status.includes(status);
            return (
              <motion.button
                key={status}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter("status", status)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : "border-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <span className="capitalize">{status}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          City Location
        </p>
        <div className="space-y-2">
          {cities.map((city) => {
            const selected = filters.city.includes(city);
            return (
              <motion.button
                key={city}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter("city", city)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                    : "border-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <span>{city}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function InteractivePropertiesTable({ properties, isLoading, onRefresh }: InteractivePropertiesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [filters, setFilters] = useState<Filters>({
    status: [],
    city: [],
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const lowerQuery = searchQuery.toLowerCase();

      const matchSearch =
        property.title.toLowerCase().includes(lowerQuery) ||
        (property.city && property.city.toLowerCase().includes(lowerQuery)) ||
        (property.state && property.state.toLowerCase().includes(lowerQuery));

      const matchStatus =
        filters.status.length === 0 || filters.status.includes(property.status);
      const matchCity =
        filters.city.length === 0 || filters.city.includes(property.city);

      return matchSearch && matchStatus && matchCity;
    });
  }, [filters, searchQuery, properties]);

  const activeFilters = filters.status.length + filters.city.length;
  
  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col font-sans">
      <div className="border-b border-white/5 bg-[#111111] p-4 lg:p-6 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
               My Properties 
               {isLoading && <RefreshCw size={16} className="text-zinc-500 animate-spin" />}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Showing {filteredProperties.length} of {properties.length} total properties in your catalog
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                placeholder="Search by title or city..."
                value={searchQuery}
                onChange={(event) => {
                   setSearchQuery(event.target.value);
                   setCurrentPage(1); // Reset to page 1 on search
                }}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#0a0a0a] border border-white/10 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-600 text-white"
              />
            </div>
            <button
              onClick={() => setShowFilters((current) => !current)}
              className={`relative flex items-center justify-center h-10 px-4 rounded-lg border transition-colors ${showFilters ? 'bg-indigo-500 text-white border-indigo-500/20' : 'bg-[#0a0a0a] border-white/10 text-zinc-300 hover:bg-white/5'}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Filter</span>
              {activeFilters > 0 && (
                <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border border-[#111111]">
                  {activeFilters}
                </div>
              )}
            </button>
            {onRefresh && (
               <button onClick={onRefresh} className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors">
                  <RefreshCw size={16} />
               </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-[400px]">
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              key="filters"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-r border-white/5 shrink-0"
            >
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                properties={properties}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="divide-y divide-white/5 overflow-y-auto flex-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {paginatedProperties.length > 0 ? (
                paginatedProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.02,
                    }}
                  >
                    <PropertyRow
                      property={property}
                      expanded={expandedId === property.id}
                      onToggle={() =>
                        setExpandedId((current) =>
                          current === property.id ? null : property.id
                        )
                      }
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-16 flex flex-col justify-center items-center h-full gap-4"
                >
                  <div className="p-4 rounded-full bg-white/5 border border-white/10">
                     <Search size={32} className="text-zinc-600" />
                  </div>
                  <div className="text-center">
                     <h3 className="text-lg font-bold text-zinc-300">No properties found</h3>
                     <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                       Try adjusting your search query or removing active filters to see more results.
                     </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Pagination Footer */}
          {totalPages > 1 && (
             <div className="border-t border-white/5 bg-[#111111] p-4 flex items-center justify-between px-6">
                <p className="text-xs text-zinc-500 font-medium">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="px-3 py-1.5 rounded-md bg-[#0a0a0a] border border-white/10 text-xs font-semibold disabled:opacity-50 hover:bg-white/5 transition-colors"
                   >
                      Previous
                   </button>
                   <button 
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     disabled={currentPage === totalPages}
                     className="px-3 py-1.5 rounded-md bg-[#0a0a0a] border border-white/10 text-xs font-semibold disabled:opacity-50 hover:bg-white/5 transition-colors"
                   >
                      Next
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
