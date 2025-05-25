function breakdownUrlPath(urlPath) {
  const pathParts = urlPath.split('/');
  const resourceName = pathParts[1] || null;
  const resourceId = pathParts[2] || null;

  const urlBreakdown = {
    resource: resourceName,
    id: resourceId,
    originalPath: urlPath, 
  };

  return urlBreakdown;
}

function buildRoutePattern(segments) {
  let routePattern = '';
  const { resource, id } = segments;

  if (resource) {
    routePattern = routePattern.concat(`/${resource}`);
  }

  if (id) {
    routePattern = routePattern.concat('/:id');
  }

  const finalRoute = routePattern || '/';
  return finalRoute;
}

export function getActivePathname() {
  const currentHash = location.hash;
  const cleanedPath = currentHash.replace('#', '') || '/';
  return cleanedPath;
}

export function getActiveRoute(routeMap) {
  const currentPathname = getActivePathname();
  const pathBreakdown = breakdownUrlPath(currentPathname);
  const matchedRoute = buildRoutePattern(pathBreakdown);

  const routeExists = routeMap && routeMap[matchedRoute];
  
  if (!routeExists) {
    const notFoundResult = {
      route: '/404', 
      segments: pathBreakdown,
    };
    return notFoundResult;
  }

  const foundResult = {
    route: matchedRoute,
    segments: pathBreakdown,
  };

  return foundResult;
}

export function parseActivePathname() {
  const currentPathname = getActivePathname();
  const parsedSegments = breakdownUrlPath(currentPathname);
  return parsedSegments;
}

export function getRoute(urlPath, routeMap) {
  const pathBreakdown = breakdownUrlPath(urlPath);
  const matchedRoute = buildRoutePattern(pathBreakdown);

  const routeExists = routeMap && routeMap[matchedRoute];
  
  if (!routeExists) {
    const notFoundResult = {
      route: '/404', 
      segments: pathBreakdown,
    };
    return notFoundResult;
  }

  const foundResult = {
    route: matchedRoute,
    segments: pathBreakdown,
  };

  return foundResult;
}

export function parsePathname(urlPath) {
  const parsedSegments = breakdownUrlPath(urlPath);
  return parsedSegments;
}