const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// A simple function to abbreviate a given text
function abbreviate(text) {
    return text.split(' ').map(word => word.charAt(0).toUpperCase()).join(''); // Get the first letter of each word and capitalize it
}

// Logic to generate an event_id
app.post('/create-event', (req, res) => {
    const event = req.body;  // Get the event details from the request body

    // Extract event title and location from the event object
    const eventName = event.title || "DefaultEvent"; // Use "DefaultEvent" if no title is provided
    const location = event.location || "Online";     // Use "Online" if no location is provided
    
    // Get the current date in YYYYMMDD format
    const date = new Date();
    const dateDigits = date.toISOString().split('T')[0].replace(/-/g, ''); // Remove dashes from the date
    
    // Generate an abbreviation from the event name and location
    const eventAbbreviation = abbreviate(eventName + ' ' + location);
    
    // Combine the abbreviation with the date digits to create a unique event_id
    const eventId = `${eventAbbreviation}${dateDigits}`;

    // Return the generated event_id as a JSON response
    res.json({ event_id: eventId });
});

// Start the server on a specified port or default to port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);  // Log that the server is running
});
