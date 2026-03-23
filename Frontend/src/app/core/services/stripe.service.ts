import { Injectable, inject } from '@angular/core';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private api    = inject(ApiService);
  private stripe$: Promise<Stripe | null> = loadStripe(environment.stripePublishableKey);

  /**
   * Full payment flow:
   * 1. Backend creates a PaymentIntent and returns clientSecret
   * 2. Stripe.js confirms the payment on client side
   * 3. Backend webhook confirms success and updates DB
   */
  payWithCard(amount: number, type: string, referenceId: number, cardElement: StripeCardElement): Observable<{ success: boolean; error?: string }> {
    return this.api.createPaymentIntent({ amount, type, referenceId }).pipe(
      switchMap(async intent => {
        const stripe = await this.stripe$;
        if (!stripe) return { success: false, error: 'Stripe failed to load.' };

        const result = await stripe.confirmCardPayment(intent.clientSecret, {
          payment_method: { card: cardElement }
        });

        if (result.error) {
          return { success: false, error: result.error.message };
        }
        return { success: true };
      })
    );
  }

  /**
   * Mount a real Stripe card element into a DOM container
   */
  async mountCardElement(containerId: string): Promise<{ stripe: Stripe; card: StripeCardElement } | null> {
    const stripe = await this.stripe$;
    if (!stripe) return null;

    const elements = stripe.elements({
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#c8a84b',
          colorBackground: '#fafaf8',
          colorText: '#0a0a0f',
          colorDanger: '#c1121f',
          fontFamily: 'DM Sans, sans-serif',
          borderRadius: '10px',
        }
      }
    });

    const card = elements.create('card', {
      style: {
        base: { fontSize: '15px', color: '#0a0a0f', '::placeholder': { color: '#8888a4' } }
      }
    });

    const container = document.getElementById(containerId);
    if (container) card.mount(container);

    return { stripe, card };
  }
}
