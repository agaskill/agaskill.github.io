export class MonteCarloTreeSearch
{
    tree;
    constructor(root)
    {
        this.tree = root
    }

    static create(initialState)
    {
        return new MonteCarloTreeSearch(new Node({
            action: { },
            state: initialState
        }))
    }

    takeAction(action)
    {
        this.expand(this.tree)
        for (const child of this.tree.children) {
            if (action === child.action || action.equals(child.action)) {
                child.parent = undefined
                return new MonteCarloTreeSearch(child)
            }
        }
        throw new Error("Not a matching action")
    }

    findBestAction(maxIterations)
    {
        //console.log("Finding best action from state", this.tree.state)

        if (this.tree.state.isTerminal()) {
            throw new Error("State is already terminal, nothing to do")
        }
        const immediate = this.checkImmediateEnd()
        if (immediate) {
            //console.log("Immediate ending action found")
            return immediate;
        }

        let iterations = 0
        while (iterations < maxIterations) {
            iterations++
            const leaf = this.select()
            const child = this.expand(leaf)
            const result = this.simulate(child)
            this.backPropagate(result, child)
        }
        //console.log(this.tree)
        return this.bestAction()
    }

    checkImmediateEnd()
    {
        this.expand(this.tree)
        let bestUtility = -Infinity
        let bestAction = null
        for (const child of this.tree.children) {
            if (child.state.isTerminal()) {
                const result = child.state.getResult()
                const utility = result[child.action.player]
                if (utility &&
                    utility > bestUtility &&
                    !Object.values(result).some(v => v > utility))
                {
                    bestUtility = utility
                    bestAction = child
                }
            }
        }
        return bestAction
    }

    bestAction()
    {
        let bestNode = null
        for (const child of this.tree.children) {
            if (!bestNode || child.playouts > bestNode.playouts) {
                bestNode = child
            }
        }
        if (!bestNode) {
            throw new Error("No actions to select from")
        }
        //console.log(bestNode.action)
        //console.log(bestNode.state)
        return bestNode
    }

    select()
    {
        // assumes children will be kept in sorted order (see BackPropagate)
        // with unexplored nodes sorted first
        let node = this.tree
        while (true) {
            if (!node.children || node.children[0].playouts === 0) {
                return node
            }
            node = node.children[0]
        }
    }

    expand(node)
    {
        if (!node.children) {
            if (node.state.isTerminal()) {
                return node
            }
            const state = node.state
            const actions = state.getActions()
            node.children = actions.map(action => new Node(action, node))
        }
        return node.children[0]
    }

    simulate(node)
    {
        let state = node.state
        while (!state.isTerminal()) {
            const actions = state.getActions()
            if (!actions.length) {
                throw new Error("No available actions, but not a terminal state")
            }
            const totalWeight = actions.reduce((sum, a) => sum + a.action.weight, 0)
            const choice = Math.random() * totalWeight
            let sumWeight = 0
            for (const candidate of actions) {
                sumWeight += candidate.action.weight
                if (sumWeight >= choice) {
                    state = candidate.state
                    break;
                }
            }
        }
        return state.getResult()
    }

    backPropagate(result, node)
    {
        while (node) {
            node.playouts++
            const utility = result[node.action.player]
            if (utility) {
                node.totalUtility += utility
            }
            if (node.children) {
                // because the parent playout count has increased, all children
                // must have their selection score updated.
                for (const child of node.children)
                {
                    child.updateSelectionScore()
                }
                node.children.sort(bySelectionScore)
            }
            node = node.parent
        }
    }
}

function bySelectionScore(a, b) {
    if (isFinite(b.selectionScore) || isFinite(a.selectionScore))
        return b.selectionScore - a.selectionScore
    return 0
}

class Node
{
    action
    state
    parent
    playouts = 0
    totalUtility = 0
    selectionScore = Infinity
    constructor(actionState, parent) {
        this.action = actionState.action
        this.state = actionState.state
        this.parent = parent
    }
    updateSelectionScore() {
        if (this.playouts > 0) {
            const avgUtility = this.totalUtility / this.playouts;
            if (this.parent) {
                this.selectionScore = avgUtility + 1.4 * Math.sqrt(Math.log(this.parent.playouts) / this.playouts)
            } else {
                this.selectionScore = avgUtility
            }
        }
    }
}