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

// 创建按钮
let button = document.createElement('button');
button.innerText = "Meet other attendees at Popin's!"; 
button.className = "popin_button";

// 添加按钮样式
button.style.backgroundColor = "#FF4500";  // 更改背景颜色
button.style.color = "#fff";  // 保持文本颜色为白色
button.style.border = "none";
button.style.borderRadius = "5px";
button.style.cursor = "pointer";
button.style.height = "40px";
button.style.width = "auto";
button.style.padding = "5px 5px 5px 5px";
button.style.whiteSpace = "normal";

// 创建一个 div 包装按钮
let buttonContainer = document.createElement('div');
buttonContainer.className = "button_container";  // 设置 div 的类名
buttonContainer.appendChild(button);  // 将按钮添加到 div 中
buttonContainer.style.padding="10px 0"

// 函数在正确的容器中嵌入按钮
function embedButton(site) {
    let container;

    switch (site) {
        case 'lu.ma':
            container = document.querySelector('.event-page-left');
            break;
        case 'eventbrite.com':
            container = document.querySelector('div.detail__inner');
            break;
        case 'meetup.com':
            container = document.querySelector('#event-info.text-sm').firstChild;
            break;
        default:
            console.warn('Unknown site:', site);
            return; // 如果网站未知，则退出
    }

    // 检查 container 是否存在并且没有按钮容器
    if (container && !container.querySelector('.button_container')) {
        container.appendChild(buttonContainer); 
        console.log("Button container added to container:", container);
    }
}

// 检测当前网站
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

// 调用嵌入按钮的函数
embedButton(site); 

// 调试输出
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

// 根据网站生成事件数据的函数
async function generateEventData(site) {
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    const scriptTag_Mode = Array.from(scriptTags).find(st => {
        const data = JSON.parse(st.innerText);
        return data.eventAttendanceMode;
    });
    
    let eventData;
    
    switch (site) {
        case 'lu.ma':
            eventData = JSON.parse(scriptTags[0].innerText);
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
            // 使用默认的 eventInfo 对象
            break;
    }

    // 获取事件对象中的 startDate 并格式化为 YYYYMMDD
    const startDate = new Date(eventInfo.startDate);
    const dateDigits = startDate.toISOString().split('T')[0].replace(/-/g, '');

    // 生成来自事件名称和位置的缩写
    const eventTitle_Local = Extract(eventInfo.title) + Extract(eventInfo.location.name);
    console.log("Event Title and Local:", eventTitle_Local);

    // 将缩写与日期数字组合以创建唯一的 event_id
    const eventId = `${eventTitle_Local}${dateDigits}`;
    console.log("Generated Event ID:", eventId);

    return { eventInfo, eventId };
}

// 按钮的点击事件监听器
button.addEventListener('click', async () => {
    const { eventInfo, eventId } = await generateEventData(site);
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
});

// 创建 MutationObserver
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
            // 如果按钮被删除，重新插入它
            if (node === buttonContainer) {
                console.log("Button container was removed, re-inserting...");
                embedButton(site); 
            }
        });
    });
});

// 开始观察 DOM 变化
observer.observe(document.body, {
    childList: true,
    subtree: true // 监控整个文档的变化
});
