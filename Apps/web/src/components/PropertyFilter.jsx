import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PropertyFilter = ({ filters, setFilters, onSearch }) => {
  return (
    <div className="bg-card rounded-2xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          placeholder="Location"
          value={filters.location || ""}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="text-foreground"
        />

        <Select
          value={filters.propertyType || ""}
          onValueChange={(value) =>
            setFilters({ ...filters, propertyType: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Residential">Residential</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="Luxury">Luxury</SelectItem>
            <SelectItem value="Shortlet">Shortlet</SelectItem>
            <SelectItem value="Land">Land</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.bedrooms || ""}
          onValueChange={(value) => setFilters({ ...filters, bedrooms: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || ""}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
            <SelectItem value="Rented">Rented</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onSearch} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
};

export default PropertyFilter;
