import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../config/api";
import "../styles/SearchFlights.css";

const SearchFlights = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    airlines: [],
    minPrice: 0,
    maxPrice: 200000,
    stops: [], // direct, 1-stop, 2+-stops
    departureTimeRange: [0, 24],
    minRating: 0,
  });

  const [activeTab, setActiveTab] = useState("best");

  const source = searchParams.get("source");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const flightClass = searchParams.get("class");

  useEffect(() => {
    if (source && destination && date) {
      searchFlights();
    }
  }, [source, destination, date]);

  useEffect(() => {
    applyFilters();
  }, [flights, filters, activeTab]);

  const searchFlights = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(
        `/flights/search?source=${source}&destination=${destination}&date=${date}`
      );
      setFlights(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to search flights");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...flights];

    // Show ALL flights - no filtering for now
    console.log('Total flights before filtering:', flights.length);
    console.log('Flights data:', flights);

    // Simple sorting by price
    if (activeTab === "cheapest") {
      result.sort((a, b) => a.price - b.price);
    }
    
    console.log('Final filtered flights:', result.length);

    setFilteredFlights(result);
  };

  const handleAirlineChange = (airline) => {
    setFilters((prev) => ({
      ...prev,
      airlines: prev.airlines.includes(airline)
        ? prev.airlines.filter((t) => t !== airline)
        : [...prev.airlines, airline],
    }));
  };

  const handleSelectFlight = (flightId, routeId, price, flightClass, airline) => {
    navigate(`/seat-selection/${flightId}/${routeId}?date=${date}&price=${price}&class=${flightClass}&airline=${airline}`);
  };

  const getAirlineColor = (airline) => {
    const colors = {
      "IndiGo": "#003366",
      "Vistara": "#7B2D9B",
      "SpiceJet": "#FF0000",
      "AirAsia India": "#FF0000",
      "Akasa Air": "#FF6B00",
      "Air India": "#E31837",
      "Emirates": "#D71921",
      "British Airways": "#075AAA",
      "Singapore Airlines": "#003D7A",
      "Lufthansa": "#05203C",
      "Qatar Airways": "#5C0632"
    };
    return colors[airline] || "#05203c";
  };

  const getAirlineInitials = (airline) => {
    return airline.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTabStats = () => {
    if (flights.length === 0) return { cheapest: 5000, fastest: "2h 30m", best: 7500 };

    const cheapest = Math.min(...flights.map(f => f.price));
    const best = cheapest + 2500;

    return { cheapest, fastest: "2h 30m", best };
  };

  const stats = getTabStats();

  if (loading) {
    return <div className="loader">Searching flights...</div>;
  }

  // Get unique airlines for filter
  const uniqueAirlines = [...new Set(flights.map(item => item.airline || 'Test Airlines'))];

  return (
    <div className="search-flights">
      <div className="search-header">
        <div className="container">
          <h2>
            {source} → {destination}
          </h2>
          <p>
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-content">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>

          {/* Stops Filter */}
          <div className="filter-group">
            <h4>Stops</h4>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Direct</span>
              </label>
              <label className="filter-checkbox">
                <input type="checkbox" disabled />
                <span>1 stop</span>
              </label>
              <label className="filter-checkbox">
                <input type="checkbox" disabled />
                <span>2+ stops</span>
              </label>
            </div>
          </div>

          {/* Airline Filter */}
          <div className="filter-group">
            <h4>Airlines</h4>
            <div className="filter-options">
              {uniqueAirlines.slice(0, 5).map((airline) => (
                <label key={airline} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.airlines.includes(airline)}
                    onChange={() => handleAirlineChange(airline)}
                  />
                  <span>{airline}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <h4>Price Range</h4>
            <div className="price-slider-container">
              <div className="price-range">
                <span>₹0</span>
                <span>₹{filters.maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="5000"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: Number(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Departure Time */}
          <div className="filter-group">
            <h4>Departure times</h4>
            <div className="time-slider-container">
              <div className="time-range-display">
                {String(filters.departureTimeRange[0]).padStart(2, '0')}:00 - {String(filters.departureTimeRange[1]).padStart(2, '0')}:00
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={filters.departureTimeRange[1]}
                onChange={(e) =>
                  setFilters({ ...filters, departureTimeRange: [0, Number(e.target.value)] })
                }
              />
            </div>
          </div>

          <button
            className="clear-filters-btn"
            onClick={() =>
              setFilters({
                airlines: [],
                minPrice: 0,
                maxPrice: 200000,
                stops: [],
                departureTimeRange: [0, 24],
                minRating: 0,
              })
            }
          >
            Clear all
          </button>
        </aside>

        {/* Flights List */}
        <main className="flights-section">
          {/* Sort Tabs */}
          <div className="sort-tabs">
            <button
              className={`sort-tab ${activeTab === 'best' ? 'active' : ''}`}
              onClick={() => setActiveTab('best')}
            >
              <span className="sort-tab-label">Best</span>
              <span className="sort-tab-value">₹{stats.best.toLocaleString()}</span>
              <span className="sort-tab-subtitle">1h 23 average</span>
            </button>
            <button
              className={`sort-tab ${activeTab === 'cheapest' ? 'active' : ''}`}
              onClick={() => setActiveTab('cheapest')}
            >
              <span className="sort-tab-label">Cheapest</span>
              <span className="sort-tab-value">₹{stats.cheapest.toLocaleString()}</span>
              <span className="sort-tab-subtitle">1h 23 average</span>
            </button>
            <button
              className={`sort-tab ${activeTab === 'fastest' ? 'active' : ''}`}
              onClick={() => setActiveTab('fastest')}
            >
              <span className="sort-tab-label">Fastest</span>
              <span className="sort-tab-value">₹14,777</span>
              <span className="sort-tab-subtitle">1h 10 average</span>
            </button>
          </div>

          {filteredFlights.length === 0 && !loading && (
            <div className="no-results">
              <p>No flights found matching your filters.</p>
              <p>Try adjusting your filters or search criteria.</p>
            </div>
          )}

          <div className="flights-list">
            {filteredFlights.map((route) => (
              <div key={route._id} className="flight-card">
                {/* Airline Section */}
                <div className="flight-airline">
                  <div
                    className="airline-logo"
                    style={{ background: getAirlineColor(route.airline) }}
                  >
                    {getAirlineInitials(route.airline)}
                  </div>
                  <span className="airline-name">{route.airline}</span>
                </div>

                {/* Flight Timeline */}
                <div className="flight-timeline">
                  <div className="flight-time-point">
                    <span className="flight-time">{route.departureTime || '06:00'}</span>
                    <span className="flight-airport">
                      {route.source?.match(/\(([^)]+)\)/)?.[1] || route.source?.substring(0, 3).toUpperCase() || 'SRC'}
                    </span>
                  </div>

                  <div className="flight-duration-section">
                    <div className="flight-duration-time">{route.duration || '2h 30m'}</div>
                    <div className="flight-path"></div>
                    <div className="flight-stops">Direct</div>
                  </div>

                  <div className="flight-time-point">
                    <span className="flight-time">{route.arrivalTime || '08:30'}</span>
                    <span className="flight-airport">
                      {route.destination?.match(/\(([^)]+)\)/)?.[1] || route.destination?.substring(0, 3).toUpperCase() || 'DST'}
                    </span>
                  </div>
                </div>

                {/* Class Badge */}
                <div className="flight-class">
                  <span className="class-badge">{route.class || 'Economy'}</span>
                </div>

                {/* Price and Action */}
                <div className="flight-price-action">
                  <div className="flight-deals-info">7 deals from</div>
                  <div className="flight-price">₹{route.price.toLocaleString()}</div>
                  <div className="flight-price-total">₹{(route.price * 1.1).toLocaleString()} total</div>
                  <button
                    className="select-flight-btn"
                    onClick={() => handleSelectFlight(route._id, route._id, route.price, route.class, route.airline)}
                    disabled={route.availableSeats === 0}
                  >
                    {route.availableSeats === 0 ? "Sold Out" : "Select"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchFlights;
