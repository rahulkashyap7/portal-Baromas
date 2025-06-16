// Booking System for Baromas Resort
class BookingSystem {
    constructor() {
        this.bookings = this.loadBookings();
        this.tents = {
            'triveni-1': { name: 'Triveni Tent 1', price: 149, maxGuests: 2 },
            'triveni-2': { name: 'Triveni Tent 2', price: 139, maxGuests: 2 },
            'triveni-3': { name: 'Triveni Tent 3', price: 159, maxGuests: 3 },
            'panchvati-1': { name: 'Panchvati Tent 1', price: 179, maxGuests: 4 },
            'panchvati-2': { name: 'Panchvati Tent 2', price: 169, maxGuests: 2 },
            'panchvati-3': { name: 'Panchvati Tent 3', price: 199, maxGuests: 2 },
            'panchvati-4': { name: 'Panchvati Tent 4', price: 159, maxGuests: 2 },
            'panchvati-5': { name: 'Panchvati Tent 5', price: 189, maxGuests: 2 }
        };
        this.initializeRazorpay();
    }

    // Load bookings from localStorage (simulating database)
    loadBookings() {
        const stored = localStorage.getItem('baromas_bookings');
        return stored ? JSON.parse(stored) : [];
    }

    // Save bookings to localStorage
    saveBookings() {
        localStorage.setItem('baromas_bookings', JSON.stringify(this.bookings));
    }

    // Check if tent is available for given dates
    isAvailable(tentId, checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        return !this.bookings.some(booking => {
            if (booking.tentId !== tentId || booking.status === 'cancelled') return false;
            
            const bookingCheckIn = new Date(booking.checkIn);
            const bookingCheckOut = new Date(booking.checkOut);
            
            // Check for date overlap
            return (checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn);
        });
    }

    // Get available tents for given dates
    getAvailableTents(checkIn, checkOut) {
        const available = {};
        for (const [tentId, tent] of Object.entries(this.tents)) {
            if (this.isAvailable(tentId, checkIn, checkOut)) {
                available[tentId] = tent;
            }
        }
        return available;
    }

    // Calculate total price
    calculatePrice(tentId, checkIn, checkOut) {
        const tent = this.tents[tentId];
        if (!tent) return 0;
        
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        return tent.price * nights;
    }

    // Generate booking ID
    generateBookingId() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `BRM${year}${month}${day}${random}`;
    }

    // Initialize Razorpay
    initializeRazorpay() {
        // Load Razorpay script
        if (!document.getElementById('razorpay-script')) {
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.head.appendChild(script);
        }
    }

    // Process booking (payment bypass for testing)
    async processBooking(bookingData) {
        console.log('processBooking called with:', bookingData);
        
        const { tentId, checkIn, checkOut, guests, customerInfo } = bookingData;
        
        // Validate availability
        console.log('Checking availability for tent:', tentId, 'dates:', checkIn, 'to', checkOut);
        if (!this.isAvailable(tentId, checkIn, checkOut)) {
            console.error('Tent not available for selected dates');
            throw new Error('Selected tent is not available for these dates');
        }
        console.log('Tent is available');

        const totalAmount = this.calculatePrice(tentId, checkIn, checkOut);
        const advanceAmount = Math.round(totalAmount * 0.3); // 30% advance
        
        console.log('Calculated amounts - Total:', totalAmount, 'Advance:', advanceAmount);
        
        const bookingId = this.generateBookingId();
        const tent = this.tents[tentId];

        // Create booking object
        const booking = {
            id: bookingId,
            tentId,
            tentName: tent.name,
            checkIn,
            checkOut,
            guests,
            customerInfo,
            totalAmount,
            advanceAmount,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            paymentId: 'TEST_PAYMENT_' + bookingId
        };

        console.log('Created booking object:', booking);

        // Bypass payment for testing
        this.bookings.push(booking);
        this.saveBookings();
        console.log('Booking saved to storage');
        
        this.sendNotifications(booking);
        console.log('Notifications sent');
        
        return Promise.resolve(booking);
    }

    // Send WhatsApp and Email notifications
    async sendNotifications(booking) {
        const message = this.formatNotificationMessage(booking);
        
        // Send WhatsApp notification (using WhatsApp Business API or third-party service)
        await this.sendWhatsAppNotification(message);
        
        // Send Email notification
        await this.sendEmailNotification(booking, message);
    }

    // Format notification message
    formatNotificationMessage(booking) {
        const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
        const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');
        
        return `🏕️ NEW BOOKING ALERT 🏕️

Booking ID: ${booking.id}
Customer: ${booking.customerInfo.name}
Phone: ${booking.customerInfo.phone}
Email: ${booking.customerInfo.email}

Tent: ${booking.tentName}
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Guests: ${booking.guests}

Total Amount: ₹${booking.totalAmount}
Advance Paid: ₹${booking.advanceAmount}
Remaining: ₹${booking.totalAmount - booking.advanceAmount}

Payment ID: ${booking.paymentId}

Please call the customer to confirm booking details.`;
    }

    // Send WhatsApp notification (placeholder - integrate with your preferred service)
    async sendWhatsAppNotification(message) {
        // Example using WhatsApp Business API or services like Twilio, etc.
        const whatsappNumber = '+919999999999'; // Replace with your team's WhatsApp number
        
        // For demo purposes, we'll show an alert
        // In production, integrate with WhatsApp Business API
        console.log('WhatsApp notification would be sent to:', whatsappNumber);
        console.log('Message:', message);
        
        // You can integrate with services like:
        // - Twilio WhatsApp API
        // - WhatsApp Business API
        // - Third-party services like MessageBird, etc.
    }

    // Send Email notification (placeholder - integrate with your email service)
    async sendEmailNotification(booking, message) {
        // Example using EmailJS or your backend email service
        const teamEmail = 'bookings@baromasresort.com'; // Replace with your team email
        
        // For demo purposes, we'll show an alert
        // In production, integrate with email service
        console.log('Email notification would be sent to:', teamEmail);
        console.log('Subject: New Booking - ' + booking.id);
        console.log('Message:', message);
        
        // You can integrate with services like:
        // - EmailJS
        // - SendGrid
        // - Your backend email service
        // - SMTP services
    }

    // Get booking by ID
    getBooking(bookingId) {
        return this.bookings.find(booking => booking.id === bookingId);
    }

    // Get all bookings for a tent
    getTentBookings(tentId) {
        return this.bookings.filter(booking => 
            booking.tentId === tentId && booking.status !== 'cancelled'
        );
    }

    // Cancel booking
    cancelBooking(bookingId) {
        const booking = this.getBooking(bookingId);
        if (booking) {
            booking.status = 'cancelled';
            booking.cancelledAt = new Date().toISOString();
            this.saveBookings();
            return true;
        }
        return false;
    }

    // Get booked dates for calendar display
    getBookedDates() {
        const bookedDates = {};
        
        this.bookings.forEach(booking => {
            if (booking.status === 'confirmed') {
                if (!bookedDates[booking.tentId]) {
                    bookedDates[booking.tentId] = [];
                }
                
                // Add all dates between check-in and check-out
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                
                for (let date = new Date(checkIn); date < checkOut; date.setDate(date.getDate() + 1)) {
                    const dateStr = date.toISOString().split('T')[0];
                    bookedDates[booking.tentId].push(dateStr);
                }
            }
        });
        
        return bookedDates;
    }
}

// Initialize booking system
window.bookingSystem = new BookingSystem();