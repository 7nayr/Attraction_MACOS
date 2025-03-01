import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  // Debug the request URL
  console.log(`Intercepting request to: ${request.url}`);

  // Get the current user from localStorage
  let token = null;

  try {
    const userStr = localStorage.getItem('user');
    console.log('User from localStorage:', userStr ? 'found' : 'not found');

    if (userStr && userStr.trim() !== '') {
      const user = JSON.parse(userStr);
      console.log('User parsed:', user);

      // Check different possible token properties
      token = user.token || user.accessToken || user.auth_token;

      if (!token) {
        console.warn('User found in localStorage but token is missing');
      } else {
        console.log('Token found in user object');
      }
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    token = null;
  }

  // Clone the request and add authorization header if token exists
  if (token) {
    console.log('Adding Authorization header');
    request = request.clone({
      setHeaders: {
        // Try different Authorization header formats
        'Authorization': `Token ${token}`
      }
    });
  } else {
    console.warn('No token available for request');
  }

  // Log the final headers for debugging
  console.log('Request headers:', request.headers);

  // Add response error handling for auth errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error in interceptor:', error);

      if (error.status === 401 || error.status === 403) {
        console.warn('Authentication error detected:', error.error);

        // Clear user data on auth error
        localStorage.removeItem('user');

        // Navigate to login with return URL
        const returnUrl = router.url || '/';
        router.navigate(['/login'], {
          queryParams: { returnUrl }
        });
      }
      return throwError(() => error);
    })
  );
};
