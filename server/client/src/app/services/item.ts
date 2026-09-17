import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private readonly apiUrl =
    'http://127.0.0.1:5000/api/items';

  constructor(
    private readonly http: HttpClient
  ) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn(
        'ItemService: No authentication token found.'
      );
    }

    return new HttpHeaders({
      Authorization: token
        ? `Bearer ${token}`
        : ''
    });
  }

  getListings(
    filters?: Record<string, unknown>
  ): Observable<any> {

    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(
        ([key, value]) => {

          if (
            value !== null &&
            value !== undefined &&
            value !== ''
          ) {
            params = params.set(
              key,
              String(value)
            );
          }

        }
      );
    }

    return this.http.get(
      this.apiUrl,
      { params }
    );
  }

  getItemById(
    id: string
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/${id}`
    );
  }

  createListing(
    itemData: FormData
  ): Observable<any> {

    const token =
      localStorage.getItem('token');

    if (!token) {
      console.error(
        'ItemService: Cannot create listing because user is not logged in.'
      );
    }

    return this.http.post(
      this.apiUrl,
      itemData,
      {
        headers: this.authHeaders()
      }
    );
  }

  updateListing(
    id: string,
    itemData: FormData
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      itemData,
      {
        headers: this.authHeaders()
      }
    );
  }

  deleteListing(
    id: string
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`,
      {
        headers: this.authHeaders()
      }
    );
  }

  getMyListings(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/mine`,
      {
        headers: this.authHeaders()
      }
    );
  }
}
