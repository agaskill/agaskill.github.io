import { MonteCarloTreeSearch } from "./monte_carlo_tree_search.mjs"
import { ConnectFourAction, ConnectFourState } from "./connectfour.mjs"

let state = ConnectFourState.createEmpty(7, 6)
let mcts = MonteCarloTreeSearch.create(state)
mcts = mcts.takeAction(new ConnectFourAction(1, 1, 0, 3))
for (let i = 0; i < 100; i++) {
    let action = mcts.findBestAction(1000)
    console.log(action)
}