"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import { serviceOptions } from "@/lib/services"
import { Badge } from "@/components/ui/badge"

export interface SearchFilters {
  query: string
  serviceType: string
  location: string
  minRating: number
  maxPrice: number
  availability: string
}

interface SearchComponentProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
  loading?: boolean
}

export function SearchComponent({ filters, onFiltersChange, onSearch, loading }: SearchComponentProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      query: "",
      serviceType: "",
      location: "",
      minRating: 0,
      maxPrice: 100,
      availability: ""
    })
  }

  const activeFiltersCount = [
    filters.serviceType,
    filters.location,
    filters.minRating > 0,
    filters.maxPrice < 100,
    filters.availability
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Find Workers</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters {activeFiltersCount > 0 && <Badge className="ml-2">{activeFiltersCount}</Badge>}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or service..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="flex-1"
          />
          <Button onClick={onSearch} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select
                  value={filters.serviceType}
                  onValueChange={(value) => updateFilter("serviceType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any service</SelectItem>
                    {serviceOptions.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => updateFilter("location", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    <SelectItem value="kigali">Kigali</SelectItem>
                    <SelectItem value="northern">Northern Province</SelectItem>
                    <SelectItem value="southern">Southern Province</SelectItem>
                    <SelectItem value="eastern">Eastern Province</SelectItem>
                    <SelectItem value="western">Western Province</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Minimum Rating: {filters.minRating}/5</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => updateFilter("minRating", value[0])}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Maximum Price: ${filters.maxPrice}</Label>
              <Slider
                value={[filters.maxPrice]}
                onValueChange={(value) => updateFilter("maxPrice", value[0])}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={filters.availability}
                onValueChange={(value) => updateFilter("availability", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any time</SelectItem>
                  <SelectItem value="today">Available today</SelectItem>
                  <SelectItem value="this-week">Available this week</SelectItem>
                  <SelectItem value="weekend">Weekend only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
              <Button onClick={onSearch} disabled={loading}>
                {loading ? "Searching..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
