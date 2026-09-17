import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwapService {

  private readonly apiUrl =
    'http://127.0.0.1:5000/api/swaps';

  constructor(
    private readonly http: HttpClient
  ) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token
        ? `Bearer ${token}`
        : ''
    });
  }

  createSwap(data: {
    requestedItem: string;
    offeredItem?: string | null;
    message?: string;
  }): Observable<any> {

    return this.http.post(
      this.apiUrl,
      data,
      {
        headers: this.authHeaders()
      }
    );
  }

  sendSwapRequest(data: {
    requestedItem: string;
    offeredItem?: string | null;
    message?: string;
  }): Observable<any> {

    return this.createSwap(data);
  }

  getUserSwaps(userId: string): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/user/${userId}`,
      {
        headers: this.authHeaders()
      }
    );
  }

  getSwapById(
    swapId: string
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/${swapId}`,
      {
        headers: this.authHeaders()
      }
    );
  }

  updateSwap(
    swapId: string,
    status: string
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${swapId}`,
      { status },
      {
        headers: this.authHeaders()
      }
    );
  }

  updateSwapStatus(
    swapId: string,
    status: string
  ): Observable<any> {

    return this.updateSwap(
      swapId,
      status
    );
  }

  acceptSwap(
    swapId: string
  ): Observable<any> {

    return this.updateSwap(
      swapId,
      'accepted'
    );
  }

  rejectSwap(
    swapId: string
  ): Observable<any> {

    return this.updateSwap(
      swapId,
      'rejected'
    );
  }

  cancelSwap(
    swapId: string
  ): Observable<any> {

    return this.updateSwap(
      swapId,
      'cancelled'
    );
  }

  completeSwap(
    swapId: string
  ): Observable<any> {

    return this.updateSwap(
      swapId,
      'completed'
    );
  }
}