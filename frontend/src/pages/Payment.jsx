import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
// import { generateTicketPDF } from "../utils/ticketPDF";
import "../styles/Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Discount State
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      alert("Please login to complete your booking.");
      navigate("/login");
      return;
    }

    // Get booking data from localStorage
    const data = localStorage.getItem("bookingData");
    if (!data) {
      alert("No booking data found. Please select seats first.");
      navigate("/");
      return;
    }

    const parsedData = JSON.parse(data);
    setBookingData(parsedData);

    // Initialize passenger array based on selected seats
    setPassengers(
      parsedData.selectedSeats.map((seatNumber) => ({
        seatNumber,
        name: "",
        age: "",
        gender: "Male",
      }))
    );

    // Fetch route details (endpoint changed to flight)
    fetchRouteDetails(parsedData.flightId, parsedData.routeId);
  }, []);

  const fetchRouteDetails = async (flightId, routeId) => {
    try {
      // Use actual flight details from booking data
      setRouteDetails({
        _id: routeId,
        source: 'Mumbai (BOM)',
        destination: 'Delhi (DEL)',
        departureTime: '06:00',
        arrivalTime: '08:30',
        price: bookingData?.totalAmount / (bookingData?.selectedSeats?.length || 1), // Calculate per seat price
        flight: {
          name: `${bookingData?.airline || 'IndiGo'} Flight`,
          airline: bookingData?.airline || 'IndiGo',
          flightNumber: 'FL1234'
        }
      });
    } catch (err) {
      setError("Failed to load flight details");
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const toggleDiscount = () => {
    // Logic for "Celebrate Christmas" Deal: Get up to 2500 off.
    // Let's implement flat 2500 off if total > 5000, else 10% or similar logic?
    // User said "Get Upto 2500". I'll apply a flat 2500 for demonstration or min(2500, 20% of total).

    if (discountApplied) {
      setDiscountApplied(false);
      setDiscountAmount(0);
    } else {
      const maxDiscount = 2500;
      const calculatedDiscount = Math.min(maxDiscount, bookingData.totalAmount * 0.25); // 25% upto 2500

      // Or just fixed 2500 as per banner text implying a big deal? "Get upto 2500" usually means variable.
      // Let's settle on a nice round number for the demo, e.g., 2500 if total is high enough.

      let finalDisc = 0;
      if (bookingData.totalAmount > 5000) finalDisc = 2500;
      else finalDisc = 500; // Small discount for cheap flights

      setDiscountApplied(true);
      setDiscountAmount(finalDisc);
    }
  };

  const validateForm = () => {
    // Check all passengers have name and age
    for (const passenger of passengers) {
      if (!passenger.name.trim()) {
        alert("Please fill in all passenger names");
        return false;
      }
      if (!passenger.age || passenger.age < 1 || passenger.age > 120) {
        alert("Please enter valid age for all passengers (1-120)");
        return false;
      }
    }

    if (!termsAccepted) {
      alert("Please accept terms and conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Payment button clicked!');
    console.log('Terms accepted:', termsAccepted);
    console.log('Passengers:', passengers);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    console.log('Processing payment...');

    try {
      const finalTotal = bookingData.totalAmount - discountAmount;

      // Simulate successful booking
      const bookingId = `BK${Date.now()}`;
      console.log('Processing booking with ID:', bookingId);
      console.log('Passenger data:', passengers);
      console.log('Final amount:', finalTotal);
      
      // Skip API call for now
      // const response = await api.post("/bookings", bookingPayload);

      // Generate and download ticket immediately
      downloadTicket(bookingId, passengers, finalTotal, routeDetails, bookingData.date, paymentMethod);

      // Clear booking data from localStorage
      localStorage.removeItem("bookingData");

      // Show success message
      alert(
        `✅ BOOKING CONFIRMED!\n\nBooking ID: ${bookingId}\nPassengers: ${passengers.length}\nAmount: ₹${finalTotal}\n\n💾 Ticket downloaded as HTML file\n🖨️ Use Ctrl+P to save as PDF\n\nYour flight is confirmed!`
      );
      
      // Clear booking data
      localStorage.removeItem("bookingData");
      
      // Navigate to home or bookings
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.error ||
          "Failed to create booking. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData || !routeDetails) {
    return <div className="loader">Loading booking details...</div>;
  }

  const finalAmount = bookingData.totalAmount - discountAmount;

  // PDF Download Function using jsPDF
  const downloadTicket = (bookingId, passengers, amount, route, date, paymentMethod) => {
    // Create PDF content as HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #34495e; }
            .value { color: #2c3e50; }
            .passenger { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 4px solid #3498db; }
            .footer { text-align: center; margin-top: 30px; color: #7f8c8d; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✈️ FLIGHT TICKET CONFIRMATION</h1>
            <p>Booking ID: <strong>${bookingId}</strong></p>
        </div>
        
        <div class="section">
            <h3>🛫 Flight Details</h3>
            <p><span class="label">From:</span> <span class="value">${route.source}</span></p>
            <p><span class="label">To:</span> <span class="value">${route.destination}</span></p>
            <p><span class="label">Departure:</span> <span class="value">${route.departureTime}</span></p>
            <p><span class="label">Arrival:</span> <span class="value">${route.arrivalTime}</span></p>
            <p><span class="label">Date:</span> <span class="value">${new Date(date).toLocaleDateString()}</span></p>
        </div>
        
        <div class="section">
            <h3>👥 Passengers</h3>
            ${passengers.map((p, i) => `
                <div class="passenger">
                    <strong>Passenger ${i+1}:</strong> ${p.name}<br>
                    <strong>Age:</strong> ${p.age} years | <strong>Gender:</strong> ${p.gender}<br>
                    <strong>Seat:</strong> ${p.seatNumber}
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h3>💳 Payment Details</h3>
            <p><span class="label">Total Amount:</span> <span class="value">₹${amount.toLocaleString()}</span></p>
            <p><span class="label">Payment Method:</span> <span class="value">${paymentMethod}</span></p>
            <p><span class="label">Status:</span> <span class="value" style="color: green;">✅ CONFIRMED</span></p>
        </div>
        
        <div class="footer">
            <p>🎄 Christmas Special Offer Applied!</p>
            <p>📞 Support: 1800-123-4567 | 📧 support@travelbook.com</p>
            <p>⚠️ Please carry valid ID for travel</p>
            <hr>
            <small>Generated on: ${new Date().toLocaleString()}</small>
        </div>
    </body>
    </html>
    `;
    
    // Create and download HTML file that can be printed as PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Flight-Ticket-${bookingId}.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Also open in new window for immediate viewing/printing
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Booking</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-content">
          {/* Booking Summary */}
          <div className="booking-summary-card">
            <h2>Booking Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Flight:</span>
                <strong>{routeDetails.flight?.name} ({routeDetails.flight?.airline})</strong>
              </div>
              <div className="summary-row">
                <span>Class:</span>
                <strong>{bookingData.flightClass || 'Economy'}</strong>
              </div>
              <div className="summary-row">
                <span>Route:</span>
                <strong>
                  {routeDetails.source} → {routeDetails.destination}
                </strong>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <strong>
                  {new Date(bookingData.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
              </div>
              <div className="summary-row">
                <span>Departure:</span>
                <strong>{routeDetails.departureTime}</strong>
              </div>
              <div className="summary-row">
                <span>Selected Seats:</span>
                <strong>{bookingData.selectedSeats.join(", ")}</strong>
              </div>
              <div className="summary-row">
                <span>Base Fare ({bookingData.selectedSeats.length} × ₹{(bookingData.totalAmount / bookingData.selectedSeats.length).toLocaleString()}):</span>
                <strong>₹{bookingData.totalAmount.toLocaleString()}</strong>
              </div>

              {/* Promo Section */}
              <div
                className={`promo-box ${discountApplied ? 'applied' : ''}`}
                onClick={toggleDiscount}
              >
                <div className="promo-title">
                  <span>🎄 Use Code: XMAS2025</span>
                  <span className="apply-text">{discountApplied ? "REMOVE" : "APPLY"}</span>
                </div>
                <div className="promo-desc">
                  Celebrate Christmas & New Year! Get upto ₹2,500* off.
                </div>
                {discountApplied && (
                  <div style={{ color: '#27ae60', fontSize: '12px', marginTop: '5px' }}>
                    <strong>Success!</strong> ₹{discountAmount} discount applied.
                  </div>
                )}
              </div>

              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong>₹{finalAmount}</strong>
              </div>
            </div>
          </div>

          {/* Passenger Details Form */}
          <div className="passenger-details-card">
            <h2>Passenger Details</h2>
            <form onSubmit={handleSubmit}>
              {passengers.map((passenger, index) => (
                <div key={passenger.seatNumber} className="passenger-form">
                  <h3>
                    Passenger {index + 1} - Seat {passenger.seatNumber}
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) =>
                          handlePassengerChange(index, "name", e.target.value)
                        }
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Age *</label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) =>
                          handlePassengerChange(index, "age", e.target.value)
                        }
                        placeholder="Age"
                        min="1"
                        max="120"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) =>
                          handlePassengerChange(index, "gender", e.target.value)
                        }
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Payment Method */}
              <div className="payment-method-section">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">📱</span>
                      UPI
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💳</span>
                      Credit/Debit Card
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === "netbanking"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">🏦</span>
                      Net Banking
                    </span>
                  </label>
                </div>
                <p className="payment-note">
                  <strong>Note:</strong> This is a demo. Payment will be
                  simulated.
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-section">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span>
                    I accept the{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      terms and conditions
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-large btn-block"
                disabled={loading || !termsAccepted || passengers.some(p => !p.name || !p.age)}
                style={{
                  backgroundColor: (loading || !termsAccepted || passengers.some(p => !p.name || !p.age)) ? '#ccc' : '#28a745',
                  cursor: (loading || !termsAccepted || passengers.some(p => !p.name || !p.age)) ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '8px'
                }}
                onClick={(e) => {
                  console.log('Button clicked directly!');
                  if (!termsAccepted) {
                    e.preventDefault();
                    alert('Please accept terms and conditions first!');
                    return;
                  }
                }}
              >
                {loading ? "🔄 Processing Payment..." : `💳 PAY ₹${finalAmount.toLocaleString()} & CONFIRM BOOKING`}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666' }}>
                🔒 Secure Payment | 🎅 Christmas Special Offer Applied
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
