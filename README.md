# Baromas Resort & Camping - Booking System

A complete booking system for Baromas Resort with real-time availability, payment integration, and admin management.

## Quick Start

1. Open `index.html` in any modern browser to access the booking portal
2. Open `admin.html` to access the admin interface
3. For full functionality, configure:
   - Razorpay payment integration (see Setup Instructions)
   - WhatsApp/Email notifications
   - Database (localStorage used by default for demo)


## Features

### 🏕️ **Booking System**
- **Real-time Availability**: Dynamic calendar showing available/booked dates
- **8 Premium Tents**: 3 Triveni Tents + 5 Panchvati Tents
- **Multi-step Booking Process**: Dates → Customer Info → Payment
- **30% Advance Payment**: Integrated with Razorpay payment gateway
- **Automatic Notifications**: WhatsApp & Email alerts to team

### 💳 **Payment Integration**
- **Razorpay Integration**: Secure online payments
- **30% Advance Payment**: Remaining amount collected at resort
- **Payment Tracking**: All transactions logged with payment IDs

### 📱 **Notifications**
- **WhatsApp Alerts**: Instant booking notifications to team
- **Email Notifications**: Detailed booking confirmations
- **Customer Communication**: Direct call/WhatsApp from admin panel

### 🎛️ **Admin Panel**
- **Booking Management**: View, filter, and manage all bookings
- **Real-time Stats**: Revenue, occupancy, and booking metrics
- **Customer Communication**: Direct call/WhatsApp integration
- **Export Data**: CSV export for reporting
- **Booking Cancellation**: Cancel bookings with refund tracking

## File Structure

```
Baromas-Booking-Portal/
├── index.html              # Main website
├── index.js               # Original website functionality
├── style.css              # Styling
├── booking-system.js      # Core booking system logic
├── booking-form.js        # Enhanced booking form
├── admin.html            # Admin panel interface
├── admin.js              # Admin panel functionality
└── README.md             # This file
```

## Setup Instructions

### 1. **Razorpay Setup**
1. Create account at [Razorpay](https://razorpay.com)
2. Get your API keys from Dashboard
3. Update `booking-system.js` line 67:
   ```javascript
   key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay key
   ```

### 2. **WhatsApp Integration**
Choose one of these options:

#### Option A: WhatsApp Business API
1. Set up WhatsApp Business API
2. Update `sendWhatsAppNotification()` in `booking-system.js`

#### Option B: Third-party Service (Recommended)
1. Sign up for services like Twilio, MessageBird, or similar
2. Update the notification functions with your API credentials

### 3. **Email Integration**
Choose one of these options:

#### Option A: EmailJS (Client-side)
1. Create account at [EmailJS](https://emailjs.com)
2. Set up email template
3. Update `sendEmailNotification()` function

#### Option B: Backend Email Service
1. Set up SMTP service (SendGrid, Mailgun, etc.)
2. Create backend endpoint for email sending
3. Update notification function to call your endpoint

### 4. **Database Setup**
Current setup uses localStorage for demo purposes. For production:

#### Option A: Firebase (Recommended for small scale)
1. Create Firebase project
2. Set up Firestore database
3. Replace localStorage methods with Firebase calls

#### Option B: Backend Database
1. Set up backend with Node.js/PHP/Python
2. Create database (MySQL, PostgreSQL, MongoDB)
3. Create API endpoints for CRUD operations
4. Update booking system to use API calls

## Usage

### **Customer Booking Flow**
1. Visit website and click "Book Now"
2. Select check-in/check-out dates
3. Choose available tent
4. Enter customer information
5. Review booking and pay 30% advance
6. Receive booking confirmation

### **Admin Management**
1. Open `admin.html` in browser
2. View all bookings and statistics
3. Filter bookings by status, tent, dates
4. Click "View" to see detailed booking info
5. Use "Call" or WhatsApp buttons to contact customers
6. Export data as CSV for reporting

## Tent Configuration

### **Triveni Tents** (3 tents)
- **Triveni Tent 1**: ₹149/night, 2 guests, King bed
- **Triveni Tent 2**: ₹139/night, 2 guests, Queen bed  
- **Triveni Tent 3**: ₹159/night, 3 guests, King bed

### **Panchvati Tents** (5 tents)
- **Panchvati Tent 1**: ₹179/night, 4 guests, 2 Queen beds
- **Panchvati Tent 2**: ₹169/night, 2 guests, King bed
- **Panchvati Tent 3**: ₹199/night, 2 guests, King bed
- **Panchvati Tent 4**: ₹159/night, 2 guests, Queen bed
- **Panchvati Tent 5**: ₹189/night, 2 guests, King bed

## Customization

### **Adding New Tents**
1. Update `tents` object in `booking-system.js`
2. Add tent options in HTML forms
3. Update admin panel tent filter

### **Changing Pricing**
1. Update tent prices in `booking-system.js`
2. Modify advance payment percentage if needed

### **Notification Templates**
1. Edit `formatNotificationMessage()` in `booking-system.js`
2. Customize WhatsApp/Email templates

## Testing

### **Test Booking Flow**
1. Open `index.html` in browser
2. Click "Book Now" button
3. Select future dates
4. Choose a tent and fill customer info
5. Use Razorpay test cards for payment testing

### **Test Admin Panel**
1. Make a few test bookings
2. Open `admin.html` in browser
3. Verify bookings appear correctly
4. Test filtering and export features

## Production Deployment

### **Before Going Live**
1. ✅ Replace Razorpay test key with live key
2. ✅ Set up real WhatsApp/Email integration
3. ✅ Implement proper database (not localStorage)
4. ✅ Add SSL certificate for secure payments
5. ✅ Test all payment flows thoroughly
6. ✅ Set up backup and monitoring

### **Security Considerations**
- Never expose API keys in client-side code
- Validate all payments on server-side
- Implement rate limiting for booking attempts
- Use HTTPS for all payment-related pages
- Regularly backup booking data

## Support

For technical support or customization requests:
- Email: support@baromasresort.com
- Phone: +91-XXXX-XXXX-XX

## License

This booking system is proprietary software for Baromas Resort & Camping.

---

**Happy Camping! 🏕️**