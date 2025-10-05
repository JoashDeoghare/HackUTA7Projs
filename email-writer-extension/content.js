console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
   const button = document.createElement('div');
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
   button.style.marginRight = '8px';
   button.innerHTML = 'AI Reply';
   button.setAttribute('role','button');
   button.setAttribute('data-tooltip','Generate AI Reply');
   return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return '';
    }
}


function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
        return null;
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled =  false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});


observer.observe(document.body, {
    childList: true,
    subtree: true
});



// console.log("Email Writer Extension - Content Script Loaded");

// // --- 1️⃣ Detect platform ---
// function detectPlatform() {
//     const host = window.location.hostname;
//     if (host.includes("mail.google.com")) return "gmail";
//     if (host.includes("outlook.live.com") || host.includes("outlook.office.com")) return "outlook";
//     return "unknown";
// }

// const platform = detectPlatform();

// // --- 2️⃣ Gmail-specific functions (your existing ones) ---
// function gmail_findComposeToolbar() { /* same logic as before */ }
// function gmail_getEmailContent() { /* same logic as before */ }
// function gmail_injectButton() { /* same logic as before */ }

// // --- 3️⃣ Outlook-specific equivalents ---
// function outlook_findComposeToolbar() {
//     return document.querySelector('[role="menubar"], .ms-CommandBar-primaryCommand'); // Outlook compose toolbar
// }

// function outlook_getEmailContent() {
//     const emailBody = document.querySelector('[aria-label="Message body"]');
//     return emailBody ? emailBody.innerText.trim() : '';
// }

// function outlook_injectButton() {
//     const toolbar = outlook_findComposeToolbar();
//     if (!toolbar) {
//         console.log("Outlook toolbar not found");
//         return;
//     }

//     const button = document.createElement("button");
//     button.textContent = "AI Reply";
//     button.className = "ai-reply-button";
//     button.style.cssText = "margin-right: 8px; padding: 6px 10px; background: #0078D4; color: white; border: none; border-radius: 4px; cursor: pointer;";
    
//     button.addEventListener("click", async () => {
//         button.textContent = "Generating...";
//         const emailContent = outlook_getEmailContent();
//         try {
//             const response = await fetch("http://localhost:8080/api/email/generate", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ emailContent, tone: "professional" })
//             });

//             const generatedReply = await response.text();
//             const composeBox = document.querySelector('[aria-label="Message body"]');
//             if (composeBox) {
//                 composeBox.focus();
//                 document.execCommand("insertText", false, generatedReply);
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Failed to generate reply");
//         } finally {
//             button.textContent = "AI Reply";
//         }
//     });

//     toolbar.insertBefore(button, toolbar.firstChild);
// }



// function outlook_findComposeToolbar() {
//     // Toolbar appears inside a rich compose container with "ms-CommandBar"
//     return document.querySelector('.ms-CommandBar-primaryCommand, [aria-label="Message toolbar"]');
// }

// function outlook_getComposeBox() {
//     // The editable area of the message body
//     return document.querySelector('[aria-label="Message body"], div[contenteditable="true"]');
// }

// function outlook_getEmailContent() {
//     const emailBody = document.querySelector('[aria-label="Message body"], div[contenteditable="true"]');
//     return emailBody ? emailBody.innerText.trim() : '';
// }

// function outlook_injectButton() {
//     if (document.querySelector('.ai-reply-button')) return; // Prevent duplicates

//     const toolbar = outlook_findComposeToolbar();
//     if (!toolbar) {
//         console.log("Outlook toolbar not found yet.");
//         return;
//     }

//     console.log("Outlook toolbar found, injecting button...");

//     const button = document.createElement("button");
//     button.textContent = "AI Reply";
//     button.className = "ai-reply-button";
//     button.style.cssText = `
//         margin-left: 8px;
//         background-color: #0078D4;
//         color: white;
//         border: none;
//         padding: 6px 12px;
//         border-radius: 4px;
//         cursor: pointer;
//         font-size: 13px;
//     `;

//     button.addEventListener("click", async () => {
//         button.textContent = "Generating...";
//         button.disabled = true;

//         const emailContent = outlook_getEmailContent();

//         try {
//             const response = await fetch("http://localhost:8080/api/email/generate", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     emailContent,
//                     tone: "professional"
//                 })
//             });

//             if (!response.ok) throw new Error("API request failed");

//             const generatedReply = await response.text();
//             const composeBox = outlook_getComposeBox();
//             if (composeBox) {
//                 composeBox.focus();
//                 document.execCommand("insertText", false, generatedReply);
//             } else {
//                 alert("Compose box not found!");
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Failed to generate reply");
//         } finally {
//             button.textContent = "AI Reply";
//             button.disabled = false;
//         }
//     });

//     toolbar.appendChild(button);
// }

// // Auto-observe Outlook’s dynamic React updates
// const outlookObserver = new MutationObserver(() => {
//     if (window.location.hostname.includes("outlook")) {
//         const composePanel = document.querySelector('[aria-label="New message"], [role="dialog"]');
//         if (composePanel) {
//             outlook_injectButton();
//         }
//     }
// });

// outlookObserver.observe(document.body, { childList: true, subtree: true });


// // --- 4️⃣ Unified observer logic ---
// const observer = new MutationObserver(() => {
//     if (platform === "gmail") gmail_injectButton();
//     else if (platform === "outlook") outlook_injectButton();
// });

// observer.observe(document.body, { childList: true, subtree: true });




// console.log("Email Writer Extension - Content Script Loaded ✅");

// // ------------------------------
// // 1️⃣ Detect Platform
// // ------------------------------
// function detectPlatform() {
//     const host = window.location.hostname;
//     if (host.includes("mail.google.com")) return "gmail";
//     if (host.includes("outlook.live.com") || host.includes("outlook.office.com")) return "outlook";
//     return "unknown";
// }

// const platform = detectPlatform();
// console.log(`Detected platform: ${platform}`);


// // ------------------------------
// // 2️⃣ Gmail-specific functions
// // ------------------------------
// function gmail_findComposeToolbar() {
//     const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
//     for (const selector of selectors) {
//         const toolbar = document.querySelector(selector);
//         if (toolbar) return toolbar;
//     }
//     return null;
// }

// function gmail_getEmailContent() {
//     const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
//     for (const selector of selectors) {
//         const content = document.querySelector(selector);
//         if (content) return content.innerText.trim();
//     }
//     return '';
// }

// function gmail_injectButton() {
//     if (document.querySelector('.ai-reply-button')) return; // prevent duplicates
//     const toolbar = gmail_findComposeToolbar();
//     if (!toolbar) return;

//     console.log("Injecting AI Reply button into Gmail toolbar...");
//     const button = document.createElement('div');
//     button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
//     button.style.marginRight = '8px';
//     button.innerHTML = 'AI Reply';
//     button.setAttribute('role', 'button');
//     button.setAttribute('data-tooltip', 'Generate AI Reply');

//     button.addEventListener('click', async () => {
//         button.innerHTML = 'Generating...';
//         button.disabled = true;
//         try {
//             const emailContent = gmail_getEmailContent();
//             const response = await fetch('http://localhost:8080/api/email/generate', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ emailContent, tone: "professional" })
//             });
//             if (!response.ok) throw new Error('API Request Failed');

//             const generatedReply = await response.text();
//             const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
//             if (composeBox) {
//                 composeBox.focus();
//                 document.execCommand('insertText', false, generatedReply);
//             } else {
//                 alert('Compose box not found.');
//             }
//         } catch (err) {
//             console.error(err);
//             alert('Failed to generate reply');
//         } finally {
//             button.innerHTML = 'AI Reply';
//             button.disabled = false;
//         }
//     });

//     toolbar.insertBefore(button, toolbar.firstChild);
// }


// // ------------------------------
// // 3️⃣ Outlook-specific functions
// // ------------------------------
// function outlook_findComposeToolbar() {
//     // Toolbar inside new message window
//     return document.querySelector('.ms-CommandBar-primaryCommand, [aria-label="Message toolbar"], [role="menubar"]');
// }

// function outlook_getComposeBox() {
//     // Editable email body
//     return document.querySelector('[aria-label="Message body"], div[contenteditable="true"]');
// }

// function outlook_getEmailContent() {
//     const emailBody = outlook_getComposeBox();
//     return emailBody ? emailBody.innerText.trim() : '';
// }

// function outlook_injectButton() {
//     if (document.querySelector('.ai-reply-button')) return; // prevent duplicates
//     const toolbar = outlook_findComposeToolbar();
//     if (!toolbar) {
//         console.log("Outlook toolbar not found yet.");
//         return;
//     }

//     console.log("Injecting AI Reply button into Outlook toolbar...");

//     const button = document.createElement("button");
//     button.textContent = "AI Reply";
//     button.className = "ai-reply-button";
//     button.style.cssText = `
//         margin-left: 8px;
//         background-color: #0078D4;
//         color: white;
//         border: none;
//         padding: 6px 12px;
//         border-radius: 4px;
//         cursor: pointer;
//         font-size: 13px;
//     `;

//     button.addEventListener("click", async () => {
//         button.textContent = "Generating...";
//         button.disabled = true;

//         try {
//             const emailContent = outlook_getEmailContent();
//             const response = await fetch("http://localhost:8080/api/email/generate", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ emailContent, tone: "professional" })
//             });

//             if (!response.ok) throw new Error("API Request Failed");

//             const generatedReply = await response.text();
//             const composeBox = outlook_getComposeBox();
//             if (composeBox) {
//                 composeBox.focus();
//                 document.execCommand("insertText", false, generatedReply);
//             } else {
//                 alert("Compose box not found!");
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Failed to generate reply");
//         } finally {
//             button.textContent = "AI Reply";
//             button.disabled = false;
//         }
//     });

//     toolbar.appendChild(button);
// }


// // ------------------------------
// // 4️⃣ Mutation Observer Logic
// // ------------------------------
// const observer = new MutationObserver(() => {
//     if (platform === "gmail") {
//         const compose = document.querySelector('[role="dialog"], .btC');
//         if (compose) gmail_injectButton();
//     } 
//     else if (platform === "outlook") {
//         const composePanel = document.querySelector('[aria-label="New message"], [role="dialog"]');
//         if (composePanel) outlook_injectButton();
//     }
// });

// observer.observe(document.body, { childList: true, subtree: true });

// console.log("Email Writer content script is observing DOM changes...");
