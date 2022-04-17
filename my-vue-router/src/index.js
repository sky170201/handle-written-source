// new VueRouter({
//     routes,
//     mode,
// })

import { inBrowser } from "./util/dom";
import { createMatcher } from "./create-matcher";
import { supportsPushState } from "./util/push-state";

class VueRouter {
    constructor(options) {
        this.app = null;
        this.apps = [];
        this.options = options;
        this.beforeHooks = [];
        this.resolveHooks = [];
        this.afterHooks = [];
        this.matcher = createMatcher(options.routes || [], this);

        let mode = options.mode || "hash";
        // history模式 && 不支持pushState
        this.fallback =
            mode === "history" &&
            !supportsPushState &&
            options.fallback !== false;
        if (this.fallback) mode = "hash";
        if (!inBrowser) mode = "abstract";
        this.mode = mode;

        switch (mode) {
            case "history":
                this.history = new HTML5History(this, options.base);
                break;
            case "hash":
                this.history = new HashHistory(
                    this,
                    options.base,
                    this.fallback
                );
                break;
            case "abstract":
                this.history = new AbstractHistory(this, options.base);
                break;
            default:
                break;
        }
    }
}

export default VueRouter;
