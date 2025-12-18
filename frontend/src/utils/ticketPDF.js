import jsPDF from "jspdf";

export const generateTicketPDF = (bookingData) => {
  try {
    console.log("Starting PDF generation with data:", bookingData);

    const doc = new jsPDF();
    const pageWidth = 210; // A4 width in mm

    // Colors
    const primaryColor = [102, 126, 234]; // Purple
    const secondaryColor = [118, 75, 162]; // Darker purple
    const accentColor = [16, 185, 129]; // Green
    const textDark = [31, 41, 55];
    const textLight = [107, 114, 128];

    // Header with gradient effect (simulated with rectangles)
    const headerHeight = 45;
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / headerHeight;
      const r = primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * ratio;
      const g = primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * ratio;
      const b = primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 1, "F");
    }

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, "bold");
    doc.text("FLIGHT TICKET", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text("Limitless Journeys", pageWidth / 2, 28, { align: "center" });

    // Booking ID Badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 33, 65, 8, 2, 2, "F");
    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text(`Booking ID: ${bookingData.bookingId}`, 17, 38);

    // Status Badge
    doc.setFillColor(...accentColor);
    doc.roundedRect(pageWidth - 55, 33, 40, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("CONFIRMED", pageWidth - 52, 38);

    let yPos = 55;

    // Journey Info Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, "F");

    yPos += 8;
    doc.setTextColor(...textDark);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(
      `${bookingData.route.source} -> ${bookingData.route.destination}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...textLight);
    const journeyDate = new Date(bookingData.journeyDate).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
    doc.text(journeyDate, pageWidth / 2, yPos, { align: "center" });

    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text(
      `${bookingData.flight.name} | ${bookingData.flight.flightNumber}`,
      pageWidth / 2,
      yPos,
      {
        align: "center",
      }
    );

    yPos += 6;
    doc.setTextColor(...accentColor);
    doc.setFont(undefined, "bold");
    doc.text(
      `Departure: ${bookingData.route.departureTime} | Duration: ${bookingData.route.duration}h`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    yPos += 12;

    // Passenger Details Section
    doc.setFillColor(...primaryColor);
    doc.rect(15, yPos, pageWidth - 30, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("PASSENGER DETAILS", 18, yPos + 5);

    yPos += 12;
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...textDark);

    // Table header
    doc.text("No.", 20, yPos);
    doc.text("Name", 35, yPos);
    doc.text("Age", 95, yPos);
    doc.text("Gender", 115, yPos);
    doc.text("Seat", 145, yPos);

    yPos += 2;
    doc.setDrawColor(...textLight);
    doc.line(18, yPos, pageWidth - 18, yPos);

    yPos += 5;
    doc.setFont(undefined, "normal");
    bookingData.passengers.forEach((passenger, index) => {
      doc.text(`${index + 1}`, 20, yPos);
      doc.text(passenger.name, 35, yPos);
      doc.text(`${passenger.age}`, 97, yPos);
      doc.text(passenger.gender, 115, yPos);

      // Seat number in badge
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(143, yPos - 3, 15, 5, 1, 1, "F");
      doc.setTextColor(...accentColor);
      doc.setFont(undefined, "bold");
      doc.text(passenger.seatNumber, 150.5, yPos, { align: "center" });
      doc.setTextColor(...textDark);
      doc.setFont(undefined, "normal");

      yPos += 6;
    });

    yPos += 5;

    // Boarding & Dropping Points
    const pointsStartY = yPos;

    // Boarding Points (Left Column)
    doc.setFillColor(...primaryColor);
    doc.rect(15, yPos, 85, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("BOARDING POINTS", 18, yPos + 5);

    yPos += 12;
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...textDark);
    bookingData.route.boardingPoints.forEach((point) => {
      doc.setFillColor(255, 255, 255);
      doc.text(`> ${point.location}`, 18, yPos);
      doc.setTextColor(...accentColor);
      doc.setFont(undefined, "bold");
      doc.text(point.time, 90, yPos, { align: "right" });
      doc.setTextColor(...textDark);
      doc.setFont(undefined, "normal");
      yPos += 5;
    });

    // Dropping Points (Right Column)
    yPos = pointsStartY;
    doc.setFillColor(...primaryColor);
    doc.rect(105, yPos, 90, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("DROPPING POINTS", 108, yPos + 5);

    yPos += 12;
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...textDark);
    bookingData.route.droppingPoints.forEach((point) => {
      doc.text(`> ${point.location}`, 108, yPos);
      doc.setTextColor(...accentColor);
      doc.setFont(undefined, "bold");
      doc.text(point.time, 187, yPos, { align: "right" });
      doc.setTextColor(...textDark);
      doc.setFont(undefined, "normal");
      yPos += 5;
    });

    yPos = Math.max(yPos, pointsStartY + 35);

    // Payment Summary Box
    yPos += 3;
    doc.setFillColor(254, 252, 232);
    doc.roundedRect(15, yPos, pageWidth - 30, 20, 3, 3, "F");

    yPos += 7;
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...textDark);
    doc.text("PAYMENT SUMMARY", 20, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(`Number of Seats: ${bookingData.totalSeats}`, 20, yPos);

    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...accentColor);
    doc.text(`Rs ${bookingData.totalAmount}`, pageWidth - 20, yPos, {
      align: "right",
    });

    // Important Notice Box
    yPos += 15;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(15, yPos, pageWidth - 30, 18, 2, 2, "FD");

    yPos += 5;
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...primaryColor);
    doc.text("IMPORTANT INSTRUCTIONS", 18, yPos);

    yPos += 5;
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(
      "* Please carry a valid government-issued photo ID while traveling",
      18,
      yPos
    );
    yPos += 4;
    doc.text(
      "* Report to boarding point 15 minutes before departure time",
      18,
      yPos
    );
    yPos += 4;
    doc.text(
      "* Keep this ticket handy for verification during the journey",
      18,
      yPos
    );

    // Footer
    yPos += 12;
    doc.setDrawColor(...textLight);
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);

    yPos += 5;
    doc.setFontSize(8);
    doc.setTextColor(...textLight);
    doc.setFont(undefined, "normal");
    doc.text(
      "For support: support@travelbooking.com | Call: +91 1234567890",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    yPos += 4;
    doc.setFontSize(7);
    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN")}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    // Outer border
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.rect(10, 50, pageWidth - 20, yPos - 52);

    // Save PDF
    const filename = `Ticket_${bookingData.bookingId}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    console.log("PDF generated successfully, saving as:", filename);
    doc.save(filename);
    console.log("PDF download triggered");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert(
      `Failed to generate ticket PDF: ${error.message}\nPlease check the console for details.`
    );
  }
};
