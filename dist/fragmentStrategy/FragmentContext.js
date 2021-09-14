"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The FragmentContext defines the interface of interest to clients.
 */
class FragmentContext {
    /**
     * Usually, the Context accepts a strategy through the constructor, but also
     * provides a setter to change it at runtime.
     */
    constructor(strategy) {
        this.strategy = strategy;
    }
    /**
     * Usually, the Context allows replacing a Strategy object at runtime.
     */
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    /**
     * The Context delegates some work to the Strategy object instead of
     * implementing multiple versions of the algorithm on its own.
     */
    fragment(data, config) {
        this.strategy.fragment(data, config);
    }
}
exports.default = FragmentContext;
