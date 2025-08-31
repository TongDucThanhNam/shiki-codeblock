export function createCopyButtonHandler(preElement: HTMLElement, debugMode: boolean = false) {
    return async (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const copyButton = event.currentTarget as HTMLButtonElement;
        const codeContent = preElement.getAttribute("data-original-code") || "";

        try {
            await navigator.clipboard.writeText(codeContent);

            // Visual feedback
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `;
            copyButton.classList.add("shiki-copy-success");

            setTimeout(() => {
                copyButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                    </svg>
                `;
                copyButton.classList.remove("shiki-copy-success");
            }, 2000);

            if (debugMode) {
                console.log("Code copied to clipboard!");
            }
        } catch (error) {
            console.error("Failed to copy code:", error);

            // Error feedback
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
            copyButton.classList.add("shiki-copy-error");

            setTimeout(() => {
                copyButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                    </svg>
                `;
                copyButton.classList.remove("shiki-copy-error");
            }, 2000);
        }
    };
}

export function createFoldingHandler(preElement: HTMLElement) {
    return (event: MouseEvent) => {
        // Check if click is in the folding button area (top-left corner)
        const rect = preElement.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Folding button is positioned at top-left, roughly 30px x 30px area
        const isInFoldArea = clickX < 40 && clickY < 40;

        if (!isInFoldArea) return;

        preElement.classList.toggle("shiki-folded");
    };
}

export function createTitleFoldingHandler(preElement: HTMLElement) {
    return () => {
        preElement.toggleClass("shiki-folded", !preElement.hasClass("shiki-folded"));
    };
}
