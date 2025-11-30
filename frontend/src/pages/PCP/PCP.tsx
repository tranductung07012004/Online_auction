import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import ProductCard from './pcp/product-card';
import { Link } from 'react-router-dom';
import SearchBar from './pcp/search-bar';
import { getAllDresses, searchDresses, Dress } from '../../api/dress';

export default function WeddingDressPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [searchResults, setSearchResults] = useState<Dress[]>([]);
  const [filteredDresses, setFilteredDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleDresses, setVisibleDresses] = useState<number>(6); // Number of dresses to show initially
  const [isSearching, setIsSearching] = useState(false);

  // Filter and sort states
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('default');

  // Get unique styles for filter options
  const uniqueStyles = [
    ...new Set(dresses.map((dress) => dress.style).filter(Boolean)),
  ];

  useEffect(() => {
    const fetchDresses = async () => {
      try {
        setLoading(true);
        const dressesData = await getAllDresses();
        setDresses(dressesData);
        setSearchResults(dressesData);
        setFilteredDresses(dressesData);
        setError(null);
      } catch (error) {
        console.error('Error fetching dresses:', error);
        setError('Failed to load dresses');
      } finally {
        setLoading(false);
      }
    };

    fetchDresses();
  }, []);

  // Apply filters and sorting when filter options or search results change
  useEffect(() => {
    // Start with either search results (if a search was performed) or all dresses
    const dataToFilter = searchQuery.trim() ? searchResults : dresses;
    let result = [...dataToFilter];

    // Apply style filter
    if (styleFilter !== 'all') {
      result = result.filter((dress) => dress.style === styleFilter);
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'under50':
          result = result.filter((dress) => dress.dailyRentalPrice < 50);
          break;
        case '50to100':
          result = result.filter(
            (dress) =>
              dress.dailyRentalPrice >= 50 && dress.dailyRentalPrice <= 100,
          );
          break;
        case '100to200':
          result = result.filter(
            (dress) =>
              dress.dailyRentalPrice > 100 && dress.dailyRentalPrice <= 200,
          );
          break;
        case 'above200':
          result = result.filter((dress) => dress.dailyRentalPrice > 200);
          break;
      }
    }

    // Apply sorting
    if (sortOption !== 'default') {
      switch (sortOption) {
        case 'price-asc':
          result.sort((a, b) => a.dailyRentalPrice - b.dailyRentalPrice);
          break;
        case 'price-desc':
          result.sort((a, b) => b.dailyRentalPrice - a.dailyRentalPrice);
          break;
        case 'rating-desc':
          result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
          break;
      }
    }

    setFilteredDresses(result);
  }, [
    styleFilter,
    priceFilter,
    sortOption,
    searchResults,
    dresses,
    searchQuery,
  ]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // If search query is empty, reset search results to all dresses
      setSearchResults(dresses);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchDresses(query);
      setSearchResults(results);
      setError(null);
    } catch (error) {
      console.error('Error searching dresses:', error);
      setError('Failed to search dresses');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleDresses((prev) => prev + 6); // Load 6 more dresses
  };

  // Reset filters
  const handleResetFilters = () => {
    setPriceFilter('all');
    setStyleFilter('all');
    setSortOption('default');
  };

  // Map API data to the format expected by ProductCard
  const mapDressesToCardFormat = (apiDresses: Dress[]) => {
    return apiDresses.map((dress) => ({
      id: dress._id,
      name: dress.name,
      designer: dress.style || 'Designer',
      price: dress.dailyRentalPrice,
      rating: dress.avgRating || 4.5,
      status: 'Available' as const,
      mainImage:
        dress.images && dress.images.length > 0
          ? dress.images[0]
          : '/placeholder.svg?height=500&width=400',
      thumbnails:
        dress.images && dress.images.length > 0
          ? dress.images.slice(0, 3).map((img) => img)
          : [
              '/placeholder.svg?height=40&width=40',
              '/placeholder.svg?height=40&width=40',
              '/placeholder.svg?height=40&width=40',
            ],
    }));
  };

  // Get limited number of dresses to display
  const displayDresses = mapDressesToCardFormat(filteredDresses).slice(
    0,
    visibleDresses,
  );
  const hasMoreDresses = filteredDresses.length > visibleDresses;

  return (
    <div>
      <Header />
      <SearchBar placeholder="Mermaid Dress" onSearch={handleSearch} />
      <main className="container-custom py-8">
        <div className="flex items-center text-sm mb-6">
          <Link to="/category" className="text-gray-500 hover:text-primary">
            Category
          </Link>
          <span className="mx-2">&gt;</span>
          <span>Wedding Dress</span>
        </div>

        <h1 className="text-2xl font-medium mb-8">Wedding Dress</h1>

        {/* Filter and Sort UI */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <div className="flex items-center space-x-2">
            <label htmlFor="style-filter" className="text-sm font-medium">
              Style:
            </label>
            <div className="relative">
              <select
                id="style-filter"
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Styles</option>
                {uniqueStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="price-filter" className="text-sm font-medium">
              Price:
            </label>
            <div className="relative">
              <select
                id="price-filter"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Prices</option>
                <option value="under50">Under $50</option>
                <option value="50to100">$50 - $100</option>
                <option value="100to200">$100 - $200</option>
                <option value="above200">Above $200</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <label htmlFor="sort-option" className="text-sm font-medium">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-option"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating: High to Low</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            {loading || isSearching ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading dresses...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-red-500">{error}</p>
              </div>
            ) : displayDresses.length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <p>No dresses found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayDresses.map((dress) => (
                  <ProductCard key={dress.id} {...dress} />
                ))}
              </div>
            )}

            {hasMoreDresses && (
              <div className="flex justify-center mt-12">
                <button
                  className="border border-gray-300 rounded-md px-6 py-2 text-sm hover:bg-gray-50"
                  onClick={handleLoadMore}
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
