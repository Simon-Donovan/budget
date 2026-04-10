declare module 'connect-api-mocker' {
    import { RequestHandler } from 'express';
    function apiMocker(path: string): RequestHandler;
    export default apiMocker;
}
