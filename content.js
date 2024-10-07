// Create a button
let button = document.createElement('button');
button.innerText = "Meet Them";  // Set the button text to "Meet Them"
button.style.position = "fixed";
button.style.top = "20px";  // Position the button from the top of the page
button.style.right = "20px";  // Position the button from the right of the page
button.style.zIndex = "1000";
button.style.padding = "10px";
button.style.backgroundColor = "#FF4500";  // Change the background color to a reddish-orange (hex code #FF4500)
button.style.color = "#fff";  // Keep the text color white
button.style.border = "none";
button.style.borderRadius = "5px";
button.style.cursor = "pointer";

// Add a bouncing animation effect
button.style.animation = "bounce 1.5s infinite";  // Apply the animation

// Define the keyframes for the bounce effect
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
@keyframes bounce {
    0%, 100% {
        transform: translateY(0);  // Start and end at the same position
    }
    50% {
        transform: translateY(-10px);  // Move up by 10px at the halfway point
    }
}`;
document.head.appendChild(styleSheet);

// Add click event listener to the button
button.addEventListener('click', async () => {
    // Gather the event information from the current page
    let eventInfo = {
        title: document.querySelector('h1')?.innerText || "Default Event Title",  // Get the event title or use a default value
        date: new Date().toISOString(),  // Get the current date and time in ISO format
        location: "Online",  // Set the default location to "Online"
        description: "Event description goes here."  // Set a default event description
    };

    // Convert the event information into a JSON string
    let eventJSON = JSON.stringify(eventInfo);

    // Send a POST request to the backend API and retrieve the event_id (example API)
    const response = await fetch('https://beta.popin.site/create-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Indicate that the request body is JSON
        },
        body: eventJSON  // Send the event data in the request body
    });

    // Check if the response from the API is successful
    if (response.ok) {
        const data = await response.json();  // Parse the JSON response
        const eventId = data.event_id;  // Assume the backend returns an event_id in the response

        // Redirect the user to the popin.site with the event_id as a query parameter
        window.location.href = `https://beta.popin.site/?event_id=${eventId}`;
    } else {
        alert('Failed to create event. Please try again.');  // Show an alert if the request fails
    }
});

// Append the button to the webpage
document.body.appendChild(button);
