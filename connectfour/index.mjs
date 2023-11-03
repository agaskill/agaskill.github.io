import { MonteCarloTreeSearch } from "./monte_carlo_tree_search.mjs"
import { ConnectFourAction, ConnectFourState } from "./connectfour.mjs"

const ko = window.ko
let mcts

const viewModel = {
    myturn: ko.observable(false),
    board: ko.observable(null),
    stats: ko.observable(null),
    showStats: ko.observable(false),
    computerStarts: ko.observable(false),
    gameOver: ko.observable(false),
    gameInProgress: ko.observable(false),
}

const tiles = [ "⬜️", "🟥", "🟨" ]

const rowCount = 6
const colCount = 7

function stateToGrid(node) {
    const state = node.state
    const action = node.action
    const rows = []
    let pos = 0
    for (let row = 0; row < state.rowCount; row++) {
        const rowtiles = []
        for (let col = 0; col < state.colCount; col++) {
            const tile = tiles[state.board[pos + col]]
            const lastPlaced = action && action.row == row && action.col == col
            rowtiles.push({tile, col, lastPlaced})
        }
        rows.unshift(rowtiles)
        pos += state.colCount
    }
    return { rows }
}

viewModel.startGame = function() {
    const state = ConnectFourState.createEmpty(colCount, rowCount)
    mcts = MonteCarloTreeSearch.create(state)
    viewModel.board(stateToGrid(mcts.tree))
    viewModel.myturn(viewModel.computerStarts())
    viewModel.gameOver(false)
    viewModel.gameInProgress(true)
    searchMoves()
}

viewModel.endGame = function() {
    viewModel.gameOver(true)
    viewModel.gameInProgress(false)
}

viewModel.toggleStats = function() {
    viewModel.showStats(!viewModel.showStats())
}

viewModel.drop = function(ctx, ev) {
    if (viewModel.myturn()) {
        console.log("not your turn")
        return
    }
    const col = Number(ev.target.dataset.col)
    if (isNaN(col)) {
        console.log("Clicked on something else")
        return
    }
    const action = getAction(col)
    if (!action) {
        console.log("No valid action")
        return
    }
    console.log(action)
    mcts = mcts.takeAction(action)
    viewModel.board(stateToGrid(mcts.tree))
    if (mcts.tree.state.isTerminal()) {
        viewModel.gameOver(true)
        viewModel.gameInProgress(false)
    } else {
        viewModel.myturn(true)
    }
}

function getAction(col) {
    const board = mcts.tree.state.board
    for (let row = 0; row < rowCount; row++) {
        const pos = row * colCount + col
        if (board[pos] === 0) {
            return new ConnectFourAction(viewModel.computerStarts() ? 2 : 1, 1, row, col)
        }
    }
}

ko.applyBindings(viewModel)

//let myturnStart = 0
function searchMoves() {
    requestAnimationFrame(function (time) {
        const action = mcts.findBestAction(200)
        const isTerminal = action.state.isTerminal()
        if (viewModel.myturn()) {
            if (mcts.tree.playouts > 100000 || isTerminal) {
            //if (!myturnStart) {
            //    myturnStart = time
            //}
            //if ((time - myturnStart) > 3000 || isTerminal) {
                console.log("Taking action", action.action)
                //console.log("From tree", mcts.tree)
                //myturnStart = 0
                mcts = mcts.takeAction(action.action)
                viewModel.myturn(false)
                viewModel.board(stateToGrid(mcts.tree))
                if (isTerminal) {
                    viewModel.gameOver(true)
                    viewModel.gameInProgress(false);
                }
            }
        }
        
        if (!viewModel.gameOver()) {
            viewModel.stats(getStats(mcts.tree))
            searchMoves()
        }
    })
}

function getStats(tree) {
    const options = tree.children.map(getOption)
    options.sort((a, b) => b.playouts - a.playouts)
    return {
        playouts: tree.playouts,
        options,
    }
}

function getOption(child) {
    return {
        action: child.action.col + 1,
        playouts: Math.round(100 * child.playouts / child.parent.playouts),
        avgUtility: Math.round(100 * child.totalUtility / child.playouts),
    }
}