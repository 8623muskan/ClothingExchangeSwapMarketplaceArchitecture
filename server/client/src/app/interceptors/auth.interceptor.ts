import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token =
    localStorage.getItem('token');

  /*
   * Marketplace item listing and individual item details
   * are public endpoints.
   *
   * Do not send an old/invalid token to these endpoints.
   */
  const isPublicItemRequest =
    req.url ===
      'http://127.0.0.1:5000/api/items' ||
    (
      req.url.startsWith(
        'http://127.0.0.1:5000/api/items/'
      ) &&
      req.method === 'GET'
    );

  if (
    !token ||
    isPublicItemRequest
  ) {
    return next(req);
  }

  const authenticatedRequest =
    req.clone({
      setHeaders: {
        Authorization:
          `Bearer ${token}`
      }
    });

  return next(authenticatedRequest);
};