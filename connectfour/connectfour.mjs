export class ConnectFourAction
{
    player
    weight
    row
    col
    constructor(player, weight, row, col) {
        this.player = player
        this.weight = weight
        this.row = row
        this.col = col
    }
    equals(other) {
        return other.player === this.player
            && other.row === this.row
            && other.col === this.col
    }
}

const winFor = {
    '1': {1: 1, 2: 0},
    '2': {1: 0, 2: 1},
}
const tie = {1: 0.5, 2: 0.5}

export class ConnectFourState
{
    player
    board
    rowCount
    colCount
    constructor(player, board, rowCount, colCount) {
        this.player = player
        this.board = board
        this.rowCount = rowCount
        this.colCount = colCount
    }
    static createEmpty(width, height) {
        const board = new Uint8Array(width * height)
        return new ConnectFourState(1, board, height, width)
    }
    getActions() {
        const actions = []
        const board = this.board
        const colCount = this.colCount
        const rowCount = this.colCount
        for (let col = 0; col < colCount; col++) {
            let pos = col
            for (let row = 0; row < rowCount; row++) {
                if (board[pos] === 0) {
                    actions.push(this.placeMarker(row, col));
                    break;
                }
                pos += colCount
            }
        }
        return actions;
    }
    placeMarker(row, col) {
        const pos = row * this.colCount + col
        const next = Uint8Array.from(this.board)
        next[pos] = this.player
        return {
            action: new ConnectFourAction(this.player, 1.0, row, col),
            state: new ConnectFourState(this.player % 2 + 1, next, this.rowCount, this.colCount),
        }
    }
    isTerminal() {
        const result = this.getResult()
        return Boolean(result)
    }
    getWinningCells() {
        const cells = []
        const rowCount = this.rowCount
        const colCount = this.colCount
        const board = this.board
        for (let row = 0; row < rowCount; row++) {
            const rowOffset = row * colCount
            const rowUp1Offset = rowOffset + colCount
            const rowUp2Offset = rowUp1Offset + colCount
            const rowUp3Offset = rowUp2Offset + colCount
            const rowDown1Offset = rowOffset - colCount
            const rowDown2Offset = rowDown1Offset - colCount
            const rowDown3Offset = rowDown2Offset - colCount
            for (let col = 0; col < colCount; col++) {
                const c = board[rowOffset + col]
                if (c === 0) {
                    continue
                }

                // Check upward (if there is room)
                if (row < rowCount - 3 &&
                    board[rowUp1Offset + col] == c &&
                    board[rowUp2Offset + col] == c &&
                    board[rowUp3Offset + col] == c)
                {
                    cells.push(
                        [row, col],
                        [row+1, col],
                        [row+2, col],
                        [row+3, col])
                }

                if (col < colCount - 3)
                {
                    // Check to the right (if there is room)
                    if (col < colCount - 3 &&
                        board[rowOffset + col+1] == c &&
                        board[rowOffset + col+2] == c &&
                        board[rowOffset + col+3] == c)
                    {
                        cells.push(
                            [row, col],
                            [row, col+1],
                            [row, col+2],
                            [row, col+3])
                    }

                    // Check up and right
                    if (row < rowCount - 3 &&
                        board[rowUp1Offset + col+1] == c &&
                        board[rowUp2Offset + col+2] == c &&
                        board[rowUp3Offset + col+3] == c)
                    {
                        cells.push(
                            [row, col],
                            [row+1, col+1],
                            [row+2, col+2],
                            [row+3, col+3])
                    }

                    // Check down and right
                    if (row >= 3 &&
                        board[rowDown1Offset + col+1] == c &&
                        board[rowDown2Offset + col+2] == c &&
                        board[rowDown3Offset + col+3] == c)
                    {
                        cells.push(
                            [row, col],
                            [row-1, col+1],
                            [row-2, col+2],
                            [row-3, col+3])
                    }
                }
            }
        }
        return cells
    }
    getResult() {
        let hasEmptyCells = false
        const rowCount = this.rowCount
        const colCount = this.colCount
        const board = this.board
        for (let row = 0; row < rowCount; row++) {
            const rowOffset = row * colCount
            const rowUp1Offset = rowOffset + colCount
            const rowUp2Offset = rowUp1Offset + colCount
            const rowUp3Offset = rowUp2Offset + colCount
            const rowDown1Offset = rowOffset - colCount
            const rowDown2Offset = rowDown1Offset - colCount
            const rowDown3Offset = rowDown2Offset - colCount
            for (let col = 0; col < colCount; col++) {
                const c = board[rowOffset + col]
                if (c === 0) {
                    hasEmptyCells = true
                    continue
                }

                // Check upward (if there is room)
                if (row < rowCount - 3 &&
                    board[rowUp1Offset + col] == c &&
                    board[rowUp2Offset + col] == c &&
                    board[rowUp3Offset + col] == c)
                {
                    return winFor[c];
                }

                if (col < colCount - 3)
                {
                    // Check to the right (if there is room)
                    if (col < colCount - 3 &&
                        board[rowOffset + col+1] == c &&
                        board[rowOffset + col+2] == c &&
                        board[rowOffset + col+3] == c)
                    {
                        return winFor[c];
                    }

                    // Check up and right
                    if (row < rowCount - 3 &&
                        board[rowUp1Offset + col+1] == c &&
                        board[rowUp2Offset + col+2] == c &&
                        board[rowUp3Offset + col+3] == c)
                    {
                        return winFor[c];
                    }

                    // Check down and right
                    if (row >= 3 &&
                        board[rowDown1Offset + col+1] == c &&
                        board[rowDown2Offset + col+2] == c &&
                        board[rowDown3Offset + col+3] == c)
                    {
                        return winFor[c];
                    }
                }
            }
        }
        if (hasEmptyCells) {
            return null
        }
        return tie;
    }
}