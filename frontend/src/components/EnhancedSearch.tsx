import React, { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  totalResults?: number;
  isLoading?: boolean;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onSearch,
  onFilter,
  totalResults = 0,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    deviceType: string[];
    condition: string[];
    location: string;
    dateRange: string;
  }>({
    deviceType: [],
    condition: [],
    location: '',
    dateRange: ''
  });

  const deviceTypes: FilterOption[] = [
    { id: 'laptop', label: 'Laptops', count: 25 },
    { id: 'smartphone', label: 'Smartphones', count: 18 },
    { id: 'tablet', label: 'Tablets', count: 12 },
    { id: 'desktop', label: 'Desktop', count: 8 },
    { id: 'accessories', label: 'Accessories', count: 15 },
    { id: 'other', label: 'Other', count: 5 }
  ];

  const conditions: FilterOption[] = [
    { id: 'excellent', label: 'Excellent', count: 20 },
    { id: 'good', label: 'Good', count: 35 },
    { id: 'fair', label: 'Fair', count: 25 },
    { id: 'poor', label: 'Poor', count: 3 }
  ];

  const dateRanges: FilterOption[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' }
  ];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleFilter = (category: keyof typeof activeFilters, value: string) => {
    const newFilters = { ...activeFilters };
    
    if (category === 'location' || category === 'dateRange') {
      newFilters[category] = value;
    } else {
      const currentArray = newFilters[category] as string[];
      if (currentArray.includes(value)) {
        newFilters[category] = currentArray.filter(item => item !== value);
      } else {
        newFilters[category] = [...currentArray, value];
      }
    }
    
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      deviceType: [],
      condition: [],
      location: '',
      dateRange: ''
    };
    setActiveFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return activeFilters.deviceType.length + 
           activeFilters.condition.length + 
           (activeFilters.location ? 1 : 0) + 
           (activeFilters.dateRange ? 1 : 0);
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for devices, brands, or descriptions..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-0 focus:ring-2 focus:ring-primary/20 bg-white shadow-inner"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 relative"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {isLoading ? 'Searching...' : `${totalResults} devices found`}
            </span>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-primary hover:text-primary-glow"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="border-0 shadow-lg animate-slideUp">
          <CardContent className="p-6 space-y-6">
            {/* Device Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-gray-900">Device Type</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {deviceTypes.map((type) => (
                  <Badge
                    key={type.id}
                    variant={activeFilters.deviceType.includes(type.id) ? "default" : "outline"}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 px-3 py-1"
                    onClick={() => toggleFilter('deviceType', type.id)}
                  >
                    {type.label}
                    {type.count && (
                      <span className="ml-1 text-xs opacity-70">({type.count})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-gray-900">Condition</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition) => (
                  <Badge
                    key={condition.id}
                    variant={activeFilters.condition.includes(condition.id) ? "default" : "outline"}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 px-3 py-1"
                    onClick={() => toggleFilter('condition', condition.id)}
                  >
                    {condition.label}
                    {condition.count && (
                      <span className="ml-1 text-xs opacity-70">({condition.count})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location and Date Range */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Location Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <h3 className="font-semibold text-gray-900">Location</h3>
                </div>
                <Input
                  placeholder="Enter city or state..."
                  value={activeFilters.location}
                  onChange={(e) => toggleFilter('location', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Posted</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dateRanges.map((range) => (
                    <Badge
                      key={range.id}
                      variant={activeFilters.dateRange === range.id ? "default" : "outline"}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 px-3 py-1"
                      onClick={() => toggleFilter('dateRange', range.id)}
                    >
                      {range.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.deviceType.map((type) => (
            <Badge key={type} className="bg-primary/10 text-primary border-primary/20">
              {deviceTypes.find(d => d.id === type)?.label}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-primary-glow"
                onClick={() => toggleFilter('deviceType', type)}
              />
            </Badge>
          ))}
          {activeFilters.condition.map((condition) => (
            <Badge key={condition} className="bg-accent/10 text-accent border-accent/20">
              {conditions.find(c => c.id === condition)?.label}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-accent-foreground"
                onClick={() => toggleFilter('condition', condition)}
              />
            </Badge>
          ))}
          {activeFilters.location && (
            <Badge className="bg-secondary/10 text-secondary border-secondary/20">
              📍 {activeFilters.location}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-secondary-foreground"
                onClick={() => toggleFilter('location', '')}
              />
            </Badge>
          )}
          {activeFilters.dateRange && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              📅 {dateRanges.find(d => d.id === activeFilters.dateRange)?.label}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-purple-900"
                onClick={() => toggleFilter('dateRange', '')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;