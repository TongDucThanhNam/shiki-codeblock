import { createFoldingHandler, createTitleFoldingHandler } from "./event-handlers"
import { getLanguageIcon } from "./language-utils"
import type { CodeBlockConfig, ShikiPluginSettings } from "./types"

export class TransformersManager {
    private settings: ShikiPluginSettings

    constructor(settings: ShikiPluginSettings) {
        this.settings = settings
    }

    updateSettings(settings: ShikiPluginSettings): void {
        this.settings = settings
    }

    applyCodeBlockTransformations(preElement: HTMLElement, config: CodeBlockConfig): void {
        // Note: data-original-code is already set in CodeProcessor before this method is called
        // Do not overwrite it here as it would replace the raw code with processed HTML

        // Add line numbers
        if (config.showLineNumbers || this.settings.enableLineNumbers) {
            this.addLineNumbers(preElement, config.startLineNumber)
        }

        // Add line highlighting
        if (config.highlightLines.length > 0) {
            this.addLineHighlighting(preElement, config.highlightLines)
        }

        // Add title
        if (config.title) {
            this.addTitle(preElement, config.title)
        }

        // Add code block header with filename and copy button
        this.addCodeBlockHeader(preElement, config)

        // Add folding capability
        if (config.fold || config.unfold) {
            this.addFoldingCapability(preElement, config.fold)
        }

        // Add interactive features that need JavaScript
        this.addInteractiveFeatures(preElement, config)
    }

    private addInteractiveFeatures(preElement: HTMLElement, _config: CodeBlockConfig): void {
        // Add folding functionality for foldable blocks
        if (preElement.classList.contains("shiki-foldable")) {
            this.addFoldingClickHandler(preElement)
        }
    }

    private addFoldingClickHandler(preElement: HTMLElement): void {
        const foldingHandler = createFoldingHandler(preElement)
        preElement.addEventListener("click", foldingHandler)
    }

    private addLineNumbers(preElement: HTMLElement, startNumber = 1): void {
        preElement.addClass("shiki-line-numbers")
        const lines = preElement.querySelectorAll(".line")

        lines.forEach((line, index) => {
            // Create a wrapper for the line content
            const lineWrapper = document.createElement("div")
            lineWrapper.className = "shiki-line-wrapper"

            // Create line number element
            const lineNumber = document.createElement("span")
            lineNumber.className = "shiki-line-number"
            lineNumber.textContent = (startNumber + index).toString()

            // Create content wrapper
            const contentWrapper = document.createElement("span")
            contentWrapper.className = "shiki-line-content"

            // Move all existing content to the content wrapper
            while (line.firstChild) {
                contentWrapper.appendChild(line.firstChild)
            }

            // Add line number and content to wrapper
            lineWrapper.appendChild(lineNumber)
            lineWrapper.appendChild(contentWrapper)

            // Replace line content with wrapper
            line.appendChild(lineWrapper)
        })
    }

    private addLineHighlighting(preElement: HTMLElement, highlightLines: number[]): void {
        const lines = preElement.querySelectorAll(".line")

        lines.forEach((line, index) => {
            if (highlightLines.includes(index + 1)) {
                line.addClass("highlighted-line")
            }
        })
    }

    private addTitle(preElement: HTMLElement, title: string): void {
        const titleElement = document.createElement("div")
        titleElement.className = "shiki-title"
        titleElement.textContent = title

        preElement.addClass("shiki-with-title")
        preElement.prepend(titleElement)
    }

    private addCodeBlockHeader(preElement: HTMLElement, config: CodeBlockConfig): void {
        // Create header container
        const headerElement = document.createElement("div")
        headerElement.className = "shiki-header"

        headerElement.style.position = "sticky"
        headerElement.style.top = "0"
        headerElement.style.zIndex = "10"
        headerElement.style.backgroundColor = "var(--background-secondary)"
        headerElement.style.backdropFilter = "blur(8px)"

        // Create file icon (language-specific SVG icon)
        const fileIcon = document.createElement("div")
        fileIcon.className = "shiki-file-icon"
        const languageIconSvg = getLanguageIcon(config.language)

        if (languageIconSvg) {
            fileIcon.innerHTML = languageIconSvg
        } else {
            // Fallback to generic file icon if no specific icon is available
            fileIcon.innerHTML = `
                <svg viewBox="0 0 24 24" class="shiki-generic-icon">
                    <path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor"/>
                </svg>
            `
        }

        // Create filename element (or use language name as fallback)
        const filenameElement = document.createElement("div")
        filenameElement.className = "shiki-filename-display"
        filenameElement.textContent = config.filename || ""

        // Left side container
        const leftContainer = document.createElement("div")
        leftContainer.className = "shiki-header-left"
        leftContainer.appendChild(fileIcon)
        leftContainer.appendChild(filenameElement)

        headerElement.appendChild(leftContainer)

        // Add copy button if enabled
        if (this.settings.enableCodeCopy) {
            const copyButtonContainer = document.createElement("div")
            copyButtonContainer.className = "shiki-copy-container"

            const copyButton = document.createElement("button")
            copyButton.className = "shiki-copy-button"
            copyButton.setAttribute("aria-label", "Copy Text")

            copyButton.style.setProperty("pointer-events", "auto", "important")
            copyButton.style.setProperty("position", "relative", "important")
            copyButton.style.setProperty("cursor", "pointer", "important")
            copyButton.style.setProperty("display", "flex", "important")
            copyButton.style.setProperty("align-items", "center", "important")
            copyButton.style.setProperty("justify-content", "center", "important")
            copyButton.style.setProperty("z-index", "11", "important")

            copyButton.innerHTML = `
                <svg class="shiki-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
                <svg class="shiki-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `

            // Copy handler
            const copyHandler = (event: Event) => {
                event.preventDefault()
                event.stopPropagation()

                const originalCode = preElement.getAttribute("data-original-code") || ""

                if (!originalCode) {
                    copyButton.classList.add("shiki-copy-error")
                    setTimeout(() => {
                        copyButton.classList.remove("shiki-copy-error")
                    }, 2000)
                    return
                }

                if (!navigator.clipboard) {
                    // Fallback for older browsers
                    this.fallbackCopyTextToClipboard(originalCode, copyButton)
                    return
                }

                navigator.clipboard
                    .writeText(originalCode)
                    .then(() => {
                        // Show success state
                        const copyIcon = copyButton.querySelector(".shiki-copy-icon") as HTMLElement
                        const checkIcon = copyButton.querySelector(".shiki-check-icon") as HTMLElement

                        if (copyIcon && checkIcon) {
                            copyIcon.style.display = "none"
                            checkIcon.style.display = "block"
                            copyButton.classList.add("shiki-copy-success")

                            // Reset after 2 seconds
                            setTimeout(() => {
                                copyIcon.style.display = "block"
                                checkIcon.style.display = "none"
                                copyButton.classList.remove("shiki-copy-success")
                            }, 2000)
                        }
                    })
                    .catch(() => {
                        copyButton.classList.add("shiki-copy-error")
                        setTimeout(() => {
                            copyButton.classList.remove("shiki-copy-error")
                        }, 2000)
                    })
            }

            copyButton.addEventListener("click", copyHandler)

            copyButtonContainer.appendChild(copyButton)
            headerElement.appendChild(copyButtonContainer)
        }

        // Add header to the code block
        preElement.addClass("shiki-with-header")
        preElement.style.position = "relative"
        preElement.style.overflow = "hidden"
        preElement.style.borderRadius = "8px"

        const codeElement = preElement.querySelector("code")
        if (codeElement) {
            codeElement.style.display = "block"
            codeElement.style.paddingTop = "12px"
        }

        preElement.prepend(headerElement)
    }

    private addFoldingCapability(preElement: HTMLElement, folded = false): void {
        preElement.addClass("shiki-foldable")

        if (folded) {
            preElement.addClass("shiki-folded")
        }

        // Add click handler for folding
        const titleElement = preElement.querySelector(".shiki-title")
        if (titleElement) {
            const titleFoldingHandler = createTitleFoldingHandler(preElement)
            titleElement.addEventListener("click", titleFoldingHandler)
                ; (titleElement as HTMLElement).style.cursor = "pointer"
        }
    }

    private fallbackCopyTextToClipboard(text: string, copyButton: HTMLElement): void {
        const textArea = document.createElement("textarea")
        textArea.value = text

        // Avoid scrolling to bottom
        textArea.style.top = "0"
        textArea.style.left = "0"
        textArea.style.position = "fixed"
        textArea.style.opacity = "0"
        textArea.style.pointerEvents = "none"

        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            const successful = document.execCommand("copy")
            if (successful) {
                // Show success state
                const copyIcon = copyButton.querySelector(".shiki-copy-icon") as HTMLElement
                const checkIcon = copyButton.querySelector(".shiki-check-icon") as HTMLElement

                copyIcon.style.display = "none"
                checkIcon.style.display = "block"
                copyButton.classList.add("shiki-copy-success")

                // Reset after 2 seconds
                setTimeout(() => {
                    copyIcon.style.display = "block"
                    checkIcon.style.display = "none"
                    copyButton.classList.remove("shiki-copy-success")
                }, 2000)

                if (this.settings.debugMode) {
                    console.log("[Shiki Debug] Code copied successfully (fallback)")
                }
            } else {
                throw new Error("Copy command failed")
            }
        } catch (err) {
            copyButton.classList.add("shiki-copy-error")
            setTimeout(() => {
                copyButton.classList.remove("shiki-copy-error")
            }, 2000)

            if (this.settings.debugMode) {
                console.error("[Shiki Debug] Failed to copy code (fallback):", err)
            }
        } finally {
            document.body.removeChild(textArea)
        }
    }
}
