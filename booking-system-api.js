// Booking System for Baromas Resort with API Integration
class BookingSystemAPI {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.tents = {};
        this.bookings = [];
        this.initializeRazorpay();
        this.loadTents();
    }

    // Load tents from API
    async loadTents() {
        try {
            const response = await fetch(`${this.apiBase}/tents`);
            if (!response.ok) {
                throw new Error('Failed to load tents');
            }
            const tentsData = await response.json();
            
            // Convert to the format expected by the booking form
            this.tents = {};
            tentsData.forEach(tent => {
                this.tents[tent.id] = {
                    name: tent.name,
                    price: tent.price,
                    maxGuests: tent.max_guests,
                    description: tent.description,
                    amenities: tent.amenities
                };
            });
            
            console.log('Tents loaded from API:', this.tents);
        } catch (error) {
            console.error('Error loading tents:', error);
            // Fallback to default tents if API fails
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
        }
    }

    // Load bookings from API
    async loadBookings() {
        try {
            const response = await fetch(`${this.apiBase}/bookings`);
            if (!response.ok) {
                throw new Error('Failed to load bookings');
            }
            this.bookings = await response.json();
            console.log('Bookings loaded from API:', this.bookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.bookings = [];
        }
    }

    // Check if tent is available for given dates
    async isAvailable(tentId, checkIn, checkOut) {
        try {
            const response = await fetch(`${this.apiBase}/availability?check_in=${checkIn}&check_out=${checkOut}`);
            if (!response.ok) {
                throw new Error('Failed to check availability');
            }
            const bookedDates = await response.json();
            
            // Check if the tent is booked for the given dates
            return !bookedDates[tentId] || bookedDates[tentId].length === 0;
        } catch (error) {
            console.error('Error checking availability:', error);
            // Fallback to local check
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            
            return !this.bookings.some(booking => {
                if (booking.tent_id !== tentId || booking.status === 'cancelled') return false;
                
                const bookingCheckIn = new Date(booking.check_in);
                const bookingCheckOut = new Date(booking.check_out);
                
                return (checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn);
            });
        }
    }

    // Get available tents for given dates
    async getAvailableTents(checkIn, checkOut) {
        const available = {};
        
        for (const [tentId, tent] of Object.entries(this.tents)) {
            const isAvailable = await this.isAvailable(tentId, checkIn, checkOut);
            if (isAvailable) {
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
        if (!document.getElementById('razorpay-script')) {
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.head.appendChild(script);
        }
    }

    // Process booking with API
    async processBooking(bookingData) {
        console.log('processBooking called with:', bookingData);
        
        const { tentId, checkIn, checkOut, guests, customerInfo } = bookingData;
        
        // Validate availability
        console.log('Checking availability for tent:', tentId, 'dates:', checkIn, 'to', checkOut);
        const isAvailable = await this.isAvailable(tentId, checkIn, checkOut);
        if (!isAvailable) {
            console.error('Tent not available for selected dates');
            throw new Error('Selected tent is not available for these dates');
        }
        console.log('Tent is available');

        const totalAmount = this.calculatePrice(tentId, checkIn, checkOut);
        const advanceAmount = Math.round(totalAmount * 0.3); // 30% advance
        
        console.log('Calculated amounts - Total:', totalAmount, 'Advance:', advanceAmount);
        
        const bookingId = this.generateBookingId();
        const tent = this.tents[tentId];

        // Create booking object for API
        const bookingPayload = {
            id: bookingId,
            tent_id: tentId,
            tent_name: tent.name,
            check_in: checkIn,
            check_out: checkOut,
            guests: guests,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_email: customerInfo.email,
            customer_address: customerInfo.address || '',
            special_requests: customerInfo.specialRequests || '',
            total_amount: totalAmount,
            advance_amount: advanceAmount,
            payment_id: 'TEST_PAYMENT_' + bookingId
        };

        console.log('Created booking payload:', bookingPayload);

        try {
            // Send booking to API
            const response = await fetch(`${this.apiBase}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create booking');
            }

            const booking = await response.json();
            console.log('Booking created successfully:', booking);
            
            // Reload bookings to update local cache
            await this.loadBookings();
            
            // Send notifications
            this.sendNotifications(booking);
            console.log('Notifications sent');
            
            return booking;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    // Send WhatsApp and Email notifications
    async sendNotifications(booking) {
        const message = this.formatNotificationMessage(booking);
        
        // Send WhatsApp notification
        await this.sendWhatsAppNotification(message);
        
        // Send Email notification
        await this.sendEmailNotification(booking, message);
    }

    // Format notification message
    formatNotificationMessage(booking) {
        const checkInDate = new Date(booking.check_in).toLocaleDateString('en-IN');
        const checkOutDate = new Date(booking.check_out).toLocaleDateString('en-IN');
        
        return `🏕️ NEW BOOKING ALERT 🏕️

Booking ID: ${booking.id}
Customer: ${booking.customer_name}
Phone: ${booking.customer_phone}
Email: ${booking.customer_email}

Tent: ${booking.tent_name}
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Guests: ${booking.guests}

Total Amount: ₹${booking.total_amount}
Advance Paid: ₹${booking.advance_amount}
Remaining: ₹${booking.total_amount - booking.advance_amount}

Payment ID: ${booking.payment_id}

Please call the customer to confirm booking details.`;
    }

    // Send WhatsApp notification (placeholder)
    async sendWhatsAppNotification(message) {
        const whatsappNumber = '+919999999999';
        console.log('WhatsApp notification would be sent to:', whatsappNumber);
        console.log('Message:', message);
    }

    // Send Email notification (placeholder)
    async sendEmailNotification(booking, message) {
        const teamEmail = 'bookings@baromasresort.com';
        console.log('Email notification would be sent to:', teamEmail);
        console.log('Subject: New Booking - ' + booking.id);
        console.log('Message:', message);
    }

    // Get booking by ID
    async getBooking(bookingId) {
        try {
            const response = await fetch(`${this.apiBase}/bookings/${bookingId}`);
            if (!response.ok) {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching booking:', error);
            return null;
        }
    }

    // Get all bookings
    async getAllBookings(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`${this.apiBase}/bookings?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    }

    // Cancel booking
    async cancelBooking(bookingId) {
        try {
            const response = await fetch(`${this.apiBase}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            // Reload bookings to update local cache
            await this.loadBookings();
            return true;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return false;
        }
    }

    // Get booked dates for calendar display
    async getBookedDates() {
        try {
            const response = await fetch(`${this.apiBase}/availability?check_in=2025-01-01&check_out=2025-12-31`);
            if (!response.ok) {
                throw new Error('Failed to get booked dates');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting booked dates:', error);
            return {};
        }
    }

    // Get booking statistics
    async getStats() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                total_bookings: 0,
                confirmed_bookings: 0,
                pending_bookings: 0,
                total_revenue: 0
            };
        }
    }
}

// Initialize booking system with API
window.bookingSystem = new BookingSystemAPI(); 