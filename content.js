function abbreviate(text) {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
}

// Create a button 
let button = document.createElement('button');
button.innerText = "Meet Them";  // Set the button text to "Meet Them"

// Add button styles
button.style.position = "fixed";
button.style.top = "20px";
button.style.right = "20px";
button.style.zIndex = "1000";
button.style.padding = "10px";
button.style.backgroundColor = "#FF4500";  // Change the background color
button.style.color = "#fff";  // Keep the text color white
button.style.border = "none";
button.style.borderRadius = "5px";
button.style.cursor = "pointer";

// Debugging output
console.log("Button created");

// Add click event listener to the button
button.addEventListener('click', async () => {
    // Gather the event information from the current page
    const scriptTag = document.querySelector('script[type="application/ld+json"]');
    let eventInfo = {};

    if (scriptTag) {
        const eventData = JSON.parse(scriptTag.innerText);
        eventInfo = {
            title: eventData.name || "Default Event Title",
            startDate: eventData.startDate || new Date().toISOString(),
            endDate: eventData.endDate || new Date().toISOString(),
            location: {
                name: eventData.location.name || "Online",
                city: eventData.location.address?.addressLocality || "Unknown City",
                province: eventData.location.address?.addressRegion || "Unknown Province",
                country: eventData.location.address?.addressCountry?.name || "Unknown Country"
            },
            description: eventData.description || "Event description goes here."
        };
    } else {
        eventInfo = {
            title: "Default Event Title",
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            location: {
                name: "Online",
                city: "Unknown City",
                province: "Unknown Province",
                country: "Unknown Country"
            },
            description: "Event description goes here."
        };
    }

    // Get the startDate from the event object and format it to YYYYMMDD
    const startDate = new Date(eventInfo.startDate);
    const dateDigits = startDate.toISOString().split('T')[0].replace(/-/g, '');

    // Generate an abbreviation from the event name and location
    const eventName = eventInfo.title;
    const location = eventInfo.location.name;

    // Debugging output
    console.log("Event Name:", eventName);
    console.log("Location:", location);

    const eventAbbreviation = abbreviate(eventName + ' ' + location);
    console.log("Event Abbreviation:", eventAbbreviation); // Check the abbreviation

    // Combine the abbreviation with the date digits to create a unique event_id
    const eventId = `${eventAbbreviation}${dateDigits}`;
    console.log("Generated Event ID:", eventId);  // Output eventId

    // Send the eventId to the backend
    const apiUrl = `https://beta.popin.site/?event_id=${eventId}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET', // Use GET method
            headers: {
                'Content-Type': 'application/json' 
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text(); 
            throw new Error(`Network response was not ok: ${errorText}`);
        }
        
        const data = await response.json(); // If there is a returned JSON data
        console.log("Response from server:", data); 
    } catch (error) {
        console.error("Error sending eventId to the backend:", error);
    }

    // Open the popin page after sending the eventId
    window.open("https://beta.popin.site", "_blank");
});

// Append the button to the webpage
document.body.appendChild(button);
