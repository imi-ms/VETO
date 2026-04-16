export interface KeyboardOption {
    key: string,
    keySymbol: string
    conflicts: boolean
}

export enum KeyboardAction {
    MOVE_LEFT = "MOVE_LEFT",
    MOVE_RIGHT = "MOVE_RIGHT",
    MOVE_UP = "MOVE_UP",
    MOVE_DOWN = "MOVE_DOWN",
    EXIT = "EXIT",
    TOGGLE_VALIDATION = "TOGGLE_VALIDATION",
    DELETE = "DELETE"
}

export const validKeys: Array<KeyboardOption> = [
    { key: ' ', keySymbol: 'Space', conflicts: true },
    { key: 'Enter', keySymbol: 'Enter', conflicts: false },
    { key: 'Escape', keySymbol: 'Escape', conflicts: false },
    { key: 'Delete', keySymbol: "Delete", conflicts: false },
    { key: 'ArrowLeft', keySymbol: 'Left', conflicts: false },
    { key: 'ArrowRight', keySymbol: 'Right', conflicts: false },
    { key: 'ArrowUp', keySymbol: 'Up', conflicts: false },
    { key: 'ArrowDown', keySymbol: 'Down', conflicts: false },
    { key: '0', keySymbol: '0', conflicts: true },
    { key: '1', keySymbol: '1', conflicts: true },
    { key: '2', keySymbol: '2', conflicts: true },
    { key: '3', keySymbol: '3', conflicts: true },
    { key: '4', keySymbol: '4', conflicts: true },
    { key: '5', keySymbol: '5', conflicts: true },
    { key: '6', keySymbol: '6', conflicts: true },
    { key: '7', keySymbol: '7', conflicts: true },
    { key: '8', keySymbol: '8', conflicts: true },
    { key: '9', keySymbol: '9', conflicts: true },
    { key: 'a', keySymbol: 'A', conflicts: true },
    { key: 'b', keySymbol: 'B', conflicts: true },
    { key: 'c', keySymbol: 'C', conflicts: true },
    { key: 'd', keySymbol: 'D', conflicts: true },
    { key: 'e', keySymbol: 'E', conflicts: true },
    { key: 'f', keySymbol: 'F', conflicts: true },
    { key: 'g', keySymbol: 'G', conflicts: true },
    { key: 'h', keySymbol: 'H', conflicts: true },
    { key: 'i', keySymbol: 'I', conflicts: true },
    { key: 'j', keySymbol: 'J', conflicts: true },
    { key: 'k', keySymbol: 'K', conflicts: true },
    { key: 'l', keySymbol: 'L', conflicts: true },
    { key: 'm', keySymbol: 'M', conflicts: true },
    { key: 'n', keySymbol: 'N', conflicts: true },
    { key: 'o', keySymbol: 'O', conflicts: true },
    { key: 'p', keySymbol: 'P', conflicts: true },
    { key: 'q', keySymbol: 'Q', conflicts: true },
    { key: 'r', keySymbol: 'R', conflicts: true },
    { key: 's', keySymbol: 'S', conflicts: true },
    { key: 't', keySymbol: 'T', conflicts: true },
    { key: 'u', keySymbol: 'U', conflicts: true },
    { key: 'v', keySymbol: 'V', conflicts: true },
    { key: 'w', keySymbol: 'W', conflicts: true },
    { key: 'x', keySymbol: 'X', conflicts: true },
    { key: 'y', keySymbol: 'Y', conflicts: true },
    { key: 'z', keySymbol: 'Z', conflicts: true }
]
