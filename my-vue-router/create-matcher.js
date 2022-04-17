import { createRouteMap } from "./create-route-map";

export function createMatcher(routes, router) {
    const { pathList, pathMap, nameMap } = createRouteMap(routes);

    function addRoutes(routes) {
        createRouteMap(routes, pathList, pathMap, nameMap);
    }

    function match(raw, currentRoute, redirectedFrom) {
        const location = normalizeLocation(raw, currentRoute, false, router);
        const { name } = location;

        if (name) {
            const record = nameMap[name];
        }
        // TODO
    }
}
