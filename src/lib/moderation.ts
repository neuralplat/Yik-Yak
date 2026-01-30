
const BANNED_WORDS = [
    'badword',
    'offensive',
    // In a real app, this would be the full list from the Notion doc
    'hate',
    'kill',
    'attack'
]

export function containsBannedWords(text: string): boolean {
    const lower = text.toLowerCase()
    return BANNED_WORDS.some(word => lower.includes(word))
}

export function moderateContent(text: string): { safe: boolean; reason?: string } {
    if (containsBannedWords(text)) {
        return { safe: false, reason: 'Content contains prohibited words.' }
    }
    return { safe: true }
}
