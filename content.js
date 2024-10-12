function Extract(text) {
    // Keep the text before the colon (if present) and remove other symbols
    let filteredText = text.split(':')[0];  // Split at the first colon and take the part before it

    return filteredText
        .replace(/[^\w\s]/g, '')  // Remove all non-word characters (except spaces)
        .split(':')[0].replace(/[^\w\s]/g, '').trim()
        .split(' ')  // Split by spaces
        .filter(word => word.trim() !== '')  // Filter out empty strings
        .join('');  // Join the words into a single string without spaces
}

// Create a button
let button = document.createElement('button');
button.innerText = "Meet other attenders"; 

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

// Function to embed the button in the correct container based on the site
function embedButton(site) {
    let container;

    switch (site) {
        case 'lu.ma':
            container = document.querySelector('.event-page-left');
            break;
        case 'eventbrite.com':
            container = document.querySelector('.detail');
            break;
        case 'meetup.com':
            container = document.querySelector('#event-info.text-sm');
            break;
        default:
            console.warn('Unknown site:', site);
            return; // Exit if the site is unknown
    }

    // Check if the container exists
    if (container) {
        // Insert the button as the first child
        container.insertBefore(button, container.firstChild);
    } else {
        console.warn('Container not found for site:', site);
    }
}
// Detect the current site
const currentUrl = window.location.href;
let site = "";

if (currentUrl.includes('lu.ma')) {
    site = 'lu.ma';
} else if (currentUrl.includes('meetup.com')) {
    site = 'meetup.com';
} else if (currentUrl.includes('eventbrite.com')) {
    site = 'eventbrite.com';
} else {
    site = 'unknown';
}

// Call the function with the appropriate site
embedButton(site); 


// Debugging output
console.log("Button created");

let eventInfo = {
    title: "Default Event Title",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    location: {
        name: "Online",
        city: "Unknown City",
        province: "Unknown Province",
        country: "Unknown Country",
        streetAddress: "Unknown Street Address"
    },
    description: "Event description goes here."
};
function assignInfo(eventData) {
    eventInfo.title = eventData.name || eventInfo.title;
    eventInfo.startDate = eventData.startDate || eventInfo.startDate;
    eventInfo.endDate = eventData.endDate || eventInfo.endDate;
    eventInfo.location.name = eventData.location?.name || eventInfo.location.name;
    eventInfo.location.city = eventData.location?.address?.addressLocality || eventInfo.location.city;
    eventInfo.location.province = eventData.location?.address?.addressRegion || eventInfo.location.province;
    eventInfo.location.country = eventData.location?.address?.addressCountry || eventInfo.location.country;
    eventInfo.location.streetAddress = eventData.location?.address?.streetAddress || eventInfo.location.streetAddress;
    eventInfo.description = eventData.description || eventInfo.description;
}

// Function to extract event data based on the website
async function generateEventData(site) {
    

    var scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    var scriptTag = scriptTags[0];
    var scriptTag_Mode;
    var eventData;
    
    for (let st of scriptTags) {
        const data = JSON.parse(st.innerText);
        if (data.eventAttendanceMode) {
            scriptTag_Mode = st;
            break;
        }
    }
    
    switch (site) {
        case 'lu.ma':
            eventData = JSON.parse(scriptTag.innerText);
            assignInfo(eventData);
            break;
        case 'meetup.com':
            eventData = JSON.parse(scriptTag_Mode.innerText);
            assignInfo(eventData);
            break;
        case 'eventbrite.com':
            eventData = JSON.parse(scriptTag_Mode.innerText);
            assignInfo(eventData);
            break;
        default:
            // Use the default eventInfo object
            break;
    }

    // Get the startDate from the event object and format it to YYYYMMDD
    const startDate = new Date(eventInfo.startDate);
    const dateDigits = startDate.toISOString().split('T')[0].replace(/-/g, '');

    // Generate an abbreviation from the event name and location
    const eventTitle_Local = Extract(eventInfo.title) + Extract(eventInfo.location.name);
    console.log("Event Title and Local:", eventTitle_Local);

    // Combine the abbreviation with the date digits to create a unique event_id
    const eventId = `${eventTitle_Local}${dateDigits}`;
    console.log("Generated Event ID:", eventId);

    return { eventInfo, eventId };
}

// Click event listener
button.addEventListener('click', async () => {

    // Generate the event data for the detected site
    const { eventInfo, eventId } = await generateEventData(site);

    // Send the eventId to the backend
    const apiUrl = `https://beta.popin.site/?event_id=${eventId}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${errorText}`);
        }

        const data = await response.json();
        console.log("Response from server:", data);
    } catch (error) {
        console.error("Error sending eventId to the backend:", error);
    }

    // Open the popin page after sending the eventId
    // window.open("https://beta.popin.site", "_blank");
});

/* // Append the button to the webpage
document.body.appendChild(button);

// If inside an iframe, append the button to the parent document body
if (window.self !== window.top) {
    // Running inside iframe
    window.parent.document.body.appendChild(button);
} else {
    // Running in the top-level document
    document.body.appendChild(button);
} */
