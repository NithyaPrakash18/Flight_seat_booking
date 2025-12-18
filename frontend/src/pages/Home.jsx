import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);

  // Search State
  const [tripType, setTripType] = useState("oneway"); // oneway, round
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: new Date().toISOString().split('T')[0], // Today
    returnDate: "",
    travellers: 1,
    flightClass: "Economy"
  });

  // UI State
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);

  const travellerDropdownRef = useRef(null);

  useEffect(() => {
    fetchLocations();

    // Click outside handler for traveller dropdown
    const handleClickOutside = (event) => {
      if (travellerDropdownRef.current && !travellerDropdownRef.current.contains(event.target)) {
        setShowTravellerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get("/flights/locations");
      setLocations(response.data.data);
    } catch (error) {
      console.error("Failed to fetch locations", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/search?source=${searchParams.from}&destination=${searchParams.to}&date=${searchParams.date}&class=${searchParams.flightClass}`
    );
  };

  const swapLocations = () => {
    setSearchParams(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const filterLocations = (query) => {
    if (!query) return locations; // Show all locations if input is empty
    return locations.filter(loc =>
      loc.toLowerCase().includes(query.toLowerCase())
    );
  };

  const classOptions = [
    { id: "Economy", label: "Economy Class", desc: "Basic seating, lowest cost" },
    { id: "Premium Economy", label: "Premium Economy", desc: "Extra legroom and better service than economy" },
    { id: "Business", label: "Business Class", desc: "Lie-flat seats, premium meals, lounge access" },
    { id: "First Class", label: "First Class", desc: "Luxury suites, personalized service, highest cost" }
  ];

  return (
    <div className="home-remix">
      <div className="hero-section">
        {/* Decorative Background Elements */}
        <div className="hero-bg-effect"></div>
        <div className="hero-sub-bg"></div>

        <div className="container hero-content">
          {/* Left Side: Search Widget */}
          <div className="search-widget">
            {/* Header */}
            <div className="widget-header" style={{ padding: '20px 25px 0' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
                Book Your Flight
              </h2>
            </div>

            <div className="search-form-container">
              {/* Trip Type Radio */}
              <div className="trip-type-radios">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tripType"
                    value="round"
                    checked={tripType === "round"}
                    onChange={(e) => setTripType(e.target.value)}
                  />
                  Round Trip
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tripType"
                    value="oneway"
                    checked={tripType === "oneway"}
                    onChange={(e) => setTripType(e.target.value)}
                  />
                  One Way
                </label>
              </div>

              <form onSubmit={handleSearch}>
                {/* From Input */}
                <div className="input-group" style={{ borderRadius: '12px 12px 0 0', borderBottom: 'none' }}>
                  <div className="location-field">
                    <span className="field-icon">🛫</span>
                    <div className="field-content">
                      <label className="field-label">From</label>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="Origin City"
                        value={searchParams.from}
                        onChange={(e) => {
                          setSearchParams({ ...searchParams, from: e.target.value });
                          setShowFromSuggestions(true);
                        }}
                        onFocus={() => setShowFromSuggestions(true)}
                        // Delay blur to allow click on suggestion
                        onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                        required
                      />
                    </div>
                  </div>
                  {/* Suggestions Dropdown */}
                  {showFromSuggestions && filterLocations(searchParams.from).length > 0 && (
                    <ul style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'white', border: '1px solid #e2e8f0',
                      borderRadius: '8px', zIndex: 1000, listStyle: 'none', margin: 0, padding: 0
                    }}>
                      {filterLocations(searchParams.from).map((loc, idx) => (
                        <li key={idx}
                          onClick={() => setSearchParams(prev => ({ ...prev, from: loc }))}
                          style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        >
                          📍 {loc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Swap Button */}
                <div style={{ position: 'relative', height: 0, zIndex: 5 }}>
                  <div className="swap-btn" onClick={swapLocations} style={{ right: '20px', top: '0' }}>
                    ⇅
                  </div>
                </div>

                {/* To Input */}
                <div className="input-group" style={{ borderRadius: '0 0 12px 12px' }}>
                  <div className="location-field">
                    <span className="field-icon">🛬</span>
                    <div className="field-content">
                      <label className="field-label">To</label>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="Destination City"
                        value={searchParams.to}
                        onChange={(e) => {
                          setSearchParams({ ...searchParams, to: e.target.value });
                          setShowToSuggestions(true);
                        }}
                        onFocus={() => setShowToSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                        required
                      />
                    </div>
                  </div>
                  {showToSuggestions && filterLocations(searchParams.to).length > 0 && (
                    <ul style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'white', border: '1px solid #e2e8f0',
                      borderRadius: '8px', zIndex: 1000, listStyle: 'none', margin: 0, padding: 0
                    }}>
                      {filterLocations(searchParams.to).map((loc, idx) => (
                        <li key={idx}
                          onClick={() => setSearchParams(prev => ({ ...prev, to: loc }))}
                          style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        >
                          📍 {loc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Date Row */}
                <div className="dates-row">
                  <div className="date-group">
                    <label>Depart Date</label>
                    <input
                      type="date"
                      className="date-input"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="date-group" style={{ opacity: tripType === 'oneway' ? 0.6 : 1 }}>
                    <label>Return Date</label>
                    {tripType === 'round' ? (
                      <input
                        type="date"
                        className="date-input"
                        value={searchParams.returnDate}
                        onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                      />
                    ) : (
                      <span className="add-return" onClick={() => setTripType('round')}>
                        + Add Return Date
                      </span>
                    )}
                  </div>
                </div>

                {/* Travellers & Class Dropdown */}
                <div
                  className="travellers-group"
                  ref={travellerDropdownRef}
                  onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
                  style={{ position: 'relative' }}
                >
                  <span className="field-icon">👤</span>
                  <div className="field-content">
                    <label className="field-label" style={{ marginBottom: 0 }}>Travellers & Cabin</label>
                    <div className="travellers-text">
                      {searchParams.travellers} {searchParams.travellers > 1 ? "Travellers" : "Traveller"}, {classOptions.find(o => o.id === searchParams.flightClass)?.label || searchParams.flightClass}
                    </div>
                  </div>
                  <span style={{ color: '#ccc' }}>▼</span>

                  {/* Dropdown Menu */}
                  {showTravellerDropdown && (
                    <div className="traveller-dropdown" onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%', left: 0, right: 0,
                        background: 'white',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        borderRadius: '12px',
                        padding: '20px',
                        zIndex: 1000,
                        marginTop: '10px'
                      }}>
                      {/* Travellers Count */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Travellers</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <button type="button"
                            onClick={() => setSearchParams(prev => ({ ...prev, travellers: Math.max(1, prev.travellers - 1) }))}
                            style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', background: 'white' }}>-</button>
                          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{searchParams.travellers}</span>
                          <button type="button"
                            onClick={() => setSearchParams(prev => ({ ...prev, travellers: Math.min(9, prev.travellers + 1) }))}
                            style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', background: 'white' }}>+</button>
                        </div>
                      </div>

                      {/* Class Selection */}
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Cabin Class</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {classOptions.map(option => (
                            <label key={option.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="classSelect"
                                checked={searchParams.flightClass === option.id}
                                onChange={() => {
                                  setSearchParams(prev => ({ ...prev, flightClass: option.id }));
                                  // Don't close immediately to let them read descriptions
                                }}
                                style={{ marginTop: '4px' }}
                              />
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{option.label}</div>
                                <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.3' }}>{option.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginTop: '15px' }}>
                        <button type="button" onClick={() => setShowTravellerDropdown(false)}
                          style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold' }}
                        >Done</button>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="search-btn">
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Promo Banner */}
          <div className="promo-banner festive-banner">
            <div className="banner-overlay">
              <h2 className="banner-title">Celebrate <br /> Christmas & <br /> New Year</h2>
              <h3 className="banner-subtitle">WITH SPECIAL FLIGHT DEALS</h3>
              <div style={{ marginTop: '20px' }}>
                <span className="offer-sub">GET UPTO</span> <br />
                <span className="offer-amount">₹2,500*</span> <br />
                <span className="offer-sub">off on all flight ticket bookings.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Footer Area */}
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', opacity: 0.7, flexWrap: 'wrap' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" height="30" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>ISO 9001:2015</span>
            <span style={{ fontSize: '10px' }}>CERTIFIED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>PCI DSS</span>
            <span style={{ fontSize: '10px', marginLeft: '5px' }}>COMPLIANT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#2ecc71' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>100% SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
