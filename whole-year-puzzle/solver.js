const allTiles = [
    {
        color: '1',
        orientations: [
            [
                ' x ',
                'xxx',
                ' x ',
            ]
        ]
    }, {
        color: '2',
        orientations: [
            [
                'xx',
                'xx',
            ]
        ]
    }, {
        color: '3',
        orientations: [
            [
                'x ',
                'xx',
                'xx',
            ], [
                'xxx',
                'xx ',
            ], [
                'xx',
                'xx',
                ' x',
            ], [
                ' xx',
                'xxx'
            ], [
                ' x',
                'xx',
                'xx',
            ], [
                'xx ',
                'xxx',
            ], [
                'xx',
                'xx',
                'x ',
            ], [
                'xxx',
                ' xx',
            ]
        ]
    }, {
        color: '4',
        orientations: [
            [
                ' x',
                'xx',
                'x ',
            ], [
                'xx ',
                ' xx',
            ], [
                'x ',
                'xx',
                ' x',
            ], [
                ' xx',
                'xx ',
            ]
        ]
    }, {
        color: '5',
        orientations: [
            [
                'xx ',
                ' x ',
                ' xx',
            ], [
                ' xx',
                ' x ',
                'xx ',
            ], [
                'x  ',
                'xxx',
                '  x',
            ], [
                '  x',
                'xxx',
                'x  ',
            ]
        ]
    }, {
        color: '6',
        orientations: [
            [
                'x ',
                'xx',
                'x ',
            ], [
                ' x',
                'xx',
                ' x',
            ], [
                'xxx',
                ' x ',
            ], [
                ' x ',
                'xxx',
            ]
        ]
    }, {
        color: '7',
        orientations: [
            [
                'xx',
                'x ',
                'xx',
            ], [
                'xx',
                ' x',
                'xx',
            ], [
                'xxx',
                'x x',
            ], [
                'x x',
                'xxx',
            ]
        ]
    }, {
        color: '8',
        orientations: [
            [
                'xx',
                'x ',
                'x ',
            ], [
                'xxx',
                '  x',
            ], [
                ' x',
                ' x',
                'xx',
            ], [
                'x  ',
                'xxx',
            ], [
                'xx',
                ' x',
                ' x',
            ], [
                '  x',
                'xxx',
            ], [
                'x ',
                'x ',
                'xx',
            ], [
                'xxx',
                'x  ',
            ]
        ]
    }, {
        color: '9',
        orientations: [
            [
                'xx',
                'x ',
                'x ',
                'x ',
            ], [
                'xxxx',
                '   x',
            ], [
                ' x',
                ' x',
                ' x',
                'xx',
            ], [
                'x   ',
                'xxxx',
            ], [
                'xx',
                ' x',
                ' x',
                ' x',
            ], [
                '   x',
                'xxxx',
            ], [
                'x ',
                'x ',
                'x ',
                'xx',
            ], [
                'xxxx',
                'x   ',
            ]
        ]
    }
]

let candidatesPerFrame = 64
let solutions = new Set()
let stack = []
let stopWhenFound = true
let stopIteration = false
let previousTimestamp = 0
let inpRenderSolution = null
let stopped = function () {}

function findSolution(board, tiles)
{
    solutions.clear()
    stack = [{board, tiles}]
    previousTimestamp = 0
    requestAnimationFrame(iterate)
}

function iterate(ts)
{
    if (previousTimestamp !== 0) {
        const diff = ts - previousTimestamp
        if (diff < 100) {
            candidatesPerFrame *= 2
        } else if (diff > 200) {
            candidatesPerFrame /= 2
        }
    }
    previousTimestamp = ts
    for (let count = 0; count < candidatesPerFrame; count++) {
        const candidate = stack.pop()
        if (!candidate) {
            stopIteration = true
            console.log("All solutions found.  Total: %d", solutions.size)
            renderSolution(solutions.size - 1)
            break
        }
        if (count === 0) {
            render(candidate.board)
        }
        if (candidate.tiles.length === 0) {
            //console.log("solution found")
            //candidate.board.print()
            const serialized = candidate.board.grid.join('')
            if (solutions.has(serialized)) {
                //console.log("Found before")
            }
            else {
                solutions.add(serialized)
                if (inpRenderSolution) {
                    inpRenderSolution.value = solutions.size
                }
                console.log("Total solutions: %d", solutions.size)
                render(candidate.board)
                if (stopWhenFound) {
                    stopIteration = true
                    break
                }
            }
        }
        else {
            for (const tile of candidate.tiles) {
                const remaining = candidate.tiles.filter(t => t !== tile)
                for (const orientation of tile.orientations)
                {
                    const loc = findPlacement(candidate.board, orientation)
                    if (loc) {
                        const boardWithTile = place(candidate.board, tile, orientation, loc)
                        if (!impossible(boardWithTile)) {
                            stack.push({board: boardWithTile, tiles: remaining})
                        }
                    }
                }
            }
        }
    }

    if (stopIteration) {
        stopIteration = false
        continuation = iterate
        stopped()
    }
    else {
        requestAnimationFrame(iterate)
    }
}

function impossible(board) {
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            const curr = board.get(x, y)
            const left = board.get(x - 1, y)
            const above = board.get(x, y - 1)
            const right = board.get(x + 1, y)
            const below = board.get(x, y + 1)
            if (curr === ' ' &&
                left !== ' ' &&
                right!== ' ' &&
                above !== ' ' &&
                below !== ' ') {
                    return true
                }
            if (curr === ' ' &&
                left !== ' ' &&
                right === ' ' &&
                board.get(x + 1, y - 1) !== ' ' &&
                board.get(x + 1, y + 1) !== ' ' &&
                board.get(x + 2, y) !== ' ' &&
                above !== ' ' &&
                below !== ' ') {
                    return true
                }
            if (curr === ' ' &&
                left !== ' ' &&
                right!== ' ' &&
                above !== ' ' &&
                below === ' ' &&
                board.get(x + 1, y + 1) !== ' ' &&
                board.get(x - 1, y + 1) !== ' ' &&
                board.get(x, y + 2) !== ' ') {
                    return true
                }
        }
    }
    return false
}

function findNextSolution() {
    if (continuation) {
        continuation()
    }
}

function findPlacement(board, orientation)
{
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            if (canPlace(board, orientation, x, y)) {
                return {x, y}
            }
        }
    }
    return null
}

function canPlace(board, orientation, posX, posY)
{
    let y = 0
    for (const row of orientation) {
        for (let x = 0; x < row.length; x++) {
            if (row[x] === 'x' && board.get(posX + x, posY + y) !== ' ') {
                return false
            }
        }
        y++
    }
    return true
}

function place(board, tile, orientation, pos)
{
    const boardWithTile = board.copy()
    let y = 0
    for (const row of orientation) {
        for (let x = 0; x < row.length; x++) {
            if (row[x] === 'x') {
                boardWithTile.set(pos.x + x, pos.y + y, tile.color)
            }
        }
        y++
    }
    return boardWithTile
}

class Board
{
    grid

    constructor(grid) {
        this.grid = grid
    }

    set(x, y, color) {
        if (x < 0 || x > 6 || y < 0 || y > 6) {
            throw `Out of range: (${x}, ${y})`
        }
        this.grid[y * 7 + x] = color
    }

    get(x, y) {
        if (x >= 0 && x < 7 && y >= 0 && y < 7) {
            return this.grid[y * 7 + x]
        }
        return '!'
    }

    copy() {
        return new Board(
            this.grid.slice())
    }

    print() {
        let rowstart = 0
        for (let y = 0; y < 7; y++) {
            const rowend = rowstart + 7
            console.log(this.grid.slice(rowstart, rowend).join(''))
            rowstart = rowend
        }
    }
}

function createBoard() {
    const grid = []
    grid.length = 49
    grid.fill(' ')
    grid[6] = '#'
    grid[13] = '#'
    grid[6*7 + 0] = '#'
    grid[6*7 + 1] = '#'
    grid[6*7 + 5] = '#'
    grid[6*7 + 6] = '#'
    return new Board(grid)
}

function solve(month, day)
{
    const board = createBoard()
    const monthY = Math.floor(month / 6)
    const monthX = month % 6
    board.set(monthX, monthY, 'O')
    const dayY = 2 + Math.floor(day / 7)
    let dayX = day % 7
    if (dayY === 6) {
        dayX += 2
    }
    board.set(dayX, dayY, 'O')

    findSolution(board, allTiles)
}

let renderContext

function render(board) {
    const ctx = renderContext || (renderContext = document.getElementById('canvas').getContext('2d'))
    ctx.clearRect(0, 0, 800, 800)
    let offset = 0;
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            const mark = board.grid[offset]
            if (mark === '#') {
                ctx.fillStyle = '#fff'
            }
            else if (mark === ' ') {
                ctx.fillStyle = '#000'
            } else if (mark === 'O') {
                ctx.fillStyle = '#c00'
            } else {
                ctx.fillStyle = `rgb(0, 0, ${mark * 20 + 75})`
            }
            ctx.fillRect(x*100, y*100, 100, 100)
            offset++
        }
    }
}

function renderSolution(idx) {
    solutions.values().forEach(function (solution, i) {
        if (i === idx) {
            render(new Board(solution))
        }
    })
}

if (typeof module === 'object') {
    module.exports.solve = solve
    module.exports.findNextSolution = findNextSolution
}

if (typeof requestAnimationFrame !== 'function') {
    requestAnimationFrame = function (cb) { setTimeout(cb, 0) }
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
        const monthSelect = this.document.getElementById('monthSelect')
        const daySelect = this.document.getElementById('daySelect')
        monthSelect.value = new Date().getMonth()
        daySelect.value = new Date().getDate()
        const btnGo = this.document.getElementById('btnGo')
        const btnStop = this.document.getElementById('btnStop')
        const btnContinue = this.document.getElementById('btnContinue')
        const chkStopWhenFound = this.document.getElementById('chkStopWhenFound')
        inpRenderSolution = this.document.getElementById('inpRenderSolution')
        btnStop.disabled = true
        btnContinue.disabled = true
        stopWhenFound = true
        btnGo.addEventListener('click', function () {
            const month = Number(monthSelect.value)
            const day = Number(daySelect.value) - 1
            btnGo.disabled = true
            btnContinue.disabled = true
            btnStop.disabled = false
            solve(month, day)
        })
        btnStop.addEventListener('click', function () {
            stopIteration = true
            btnGo.disabled = false
            btnContinue.disabled = false
            btnStop.disabled = true
        })
        btnContinue.addEventListener('click', function () {
            btnGo.disabled = true
            btnContinue.disabled = true
            btnStop.disabled = false
            previousTimestamp = 0
            requestAnimationFrame(iterate)
        })
        chkStopWhenFound.addEventListener('change', function (e) {
            stopWhenFound = e.target.checked
        })
        inpRenderSolution.addEventListener('change', function (e) {
            renderSolution(Number(e.target.value) - 1)
        })
        stopped = function () {
            btnGo.disabled = false
            btnContinue.disabled = false
            btnStop.disabled = true
        }
    })
}