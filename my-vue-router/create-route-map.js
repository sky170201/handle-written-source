// import { cleanPath } from "./src/utils/path";

const routes = [
    {
        path: "/login",
        component: () => import("@/views/login/index"),
        hidden: true,
    },
    {
        path: "/auth-redirect",
        component: () => import("@/views/login/auth-redirect"),
        hidden: true,
    },
];

function createRouteMap(routes, oldPathList, oldPathMap, oldNameMap) {
    const pathList = oldPathList || [];
    const pathMap = oldPathMap || Object.create(null);
    const nameMap = oldNameMap || Object.create(null);

    routes.forEach((route) => {
        addRouteRecord(pathList, pathMap, nameMap, route);
    });

    for (let i = 0, l = pathList.length; i < l; i++) {
        if (pathList[i] === "*") {
            pathList.push(pathList.splice(i, 1)[0]);
            l--;
            i--;
        }
    }

    return {
        pathList,
        pathMap,
        nameMap,
    };
}

function addRouteRecord(pathList, pathMap, nameMap, route, parent, matchAs) {
    const { path, name } = route;
    const pathToRegexpOptions = route.pathToRegexpOptions || {};
    const normalizedPath = normalizePath(
        path,
        parent,
        pathToRegexpOptions.strict
    );

    const record = {
        path: normalizedPath,
        regex: "",
        components: route.components || { default: route.component },
        instances: {},
        name,
        matchAs,
        redirect: route.redirect,
        beforeEnter: route.beforeEnter,
        meta: route.meta || {},
        props:
            route.props == null
                ? {}
                : route.components
                ? route.props
                : { default: route.props },
    };

    if (route.children) {
        route.children.forEach((child) => {
            const childMatchAs = matchAs
                ? cleanPath(`${matchAs}/${child.path}`)
                : undefined;
            addRouteRecord(
                pathList,
                pathMap,
                nameMap,
                child,
                record,
                childMatchAs
            );
        });
    }

    if (!pathMap[record.path]) {
        pathList.push(record.path);
        pathMap[record.path] = record;
    }

    if (!name) {
        if (!nameMap[name]) {
            nameMap[name] = record;
        }
    }
}

function normalizePath(path, parent, strict) {
    if (!strict) path = path.replace(/\/$/, "");
    if (path[0] === "/") return path;
    if (parent == null) return path;
    return cleanPath(`${parent.path}/${path}`);
}

function cleanPath(path) {
    return path.replace(/\/\//g, "/");
}

createRouteMap(routes);
console.log(123, createRouteMap(routes));
