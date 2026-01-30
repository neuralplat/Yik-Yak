
const ADJECTIVES = ['Happy', 'Lucky', 'Sunny', 'Purple', 'Orange', 'Mystic', 'Silent', 'Brave', 'Calm', 'Wild', 'Cosmic', 'Swift', 'Jolly', 'Clever']
const ANIMALS = ['Penguin', 'Fox', 'Bear', 'Eagle', 'Dolphin', 'Tiger', 'Panda', 'Wolf', 'Owl', 'Hawk', 'Koala', 'Lion', 'Otter', 'Badger']
const EMOJIS = ['🐧', '🦊', '🐻', '🦅', '🐬', '🐯', '🐼', '🐺', '🦉', '🦅', '🐨', '🦁', '🦦', '🦡']

export function generateYakkerId() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const index = Math.floor(Math.random() * ANIMALS.length)
    const animal = ANIMALS[index]
    const emoji = EMOJIS[index]

    return `${emoji} ${adj} ${animal}`
}
