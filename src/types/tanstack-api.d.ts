declare module "@tanstack/react-start/api" {
  type APIRequestContext = { request: Request };
  type APIRouteHandler = (context: APIRequestContext) => Response | Promise<Response>;
  export function createAPIFileRoute(_path: string): (handlers: {
    GET?: APIRouteHandler;
    POST?: APIRouteHandler;
    OPTIONS?: APIRouteHandler;
  }) => unknown;
}