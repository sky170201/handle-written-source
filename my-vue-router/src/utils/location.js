export function normalizeLocation(raw, currentRoute, append, router) {
    let next = typeof raw === "string" ? { path: raw } : raw;
    if (next.name || next._normalized) {
        return next;
    }

    if (!next.path && next.params && current) {
        next = assign({}, next);
        next._normalized = true;
        const params = assign(assign({}, current.params), next.params);
        if (current.name) {
            next.name = current.name;
            next.params = params;
        } else if (current.matched.length) {
            const rawPath = current.matched[current.matched.length - 1].path;
            next.path = fillParams(rawPath, params, `path ${current.path}`);
        }
        return next;
    }

    const parsedPath = parsePath(next.path || "");
    const basePath = (current && current.path) || "/";
    const path = parsedPath.path
        ? resolvePath(parsedPath.path, basePath, append || next.append)
        : basePath;

    // TODO
    const query = resolveQuery(
        parsedPath.query,
        next.query,
        router && router.options.parseQuery
    );
}
