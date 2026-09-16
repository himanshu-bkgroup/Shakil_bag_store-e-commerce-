import { db } from './db';
import { generatePersonalizedRecoveryCopy } from './gemini';
import { AbandonedCart } from '../src/types';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rawResponse?: any;
}

export async function sendWhatsAppMessage(toPhone: string, messageBody: string): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';

  // Sanitize phone number (e.g. +91 72178-76220 -> 917217876220)
  const cleanPhone = toPhone.replace(/[^0-9]/g, '');

  if (!token || !phoneNumberId) {
    console.log(`[WHATSAPP MOCK / LOG] To: +${cleanPhone}`);
    console.log(`[WHATSAPP BODY]:\n${messageBody}\n----------------------------------`);
    return {
      success: true,
      messageId: `wamid_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
  }

  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: true, body: messageBody }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('WhatsApp API Error:', data);
      return { success: false, error: data?.error?.message || 'WhatsApp API request failed', rawResponse: data };
    }

    const messageId = data?.messages?.[0]?.id || `wamid_${Date.now()}`;
    return { success: true, messageId, rawResponse: data };
  } catch (err: any) {
    console.error('WhatsApp network error:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export function isOptOutKeyword(text: string): boolean {
  const clean = text.trim().toUpperCase();
  const keywords = ['STOP', 'UNSUBSCRIBE', 'NO', 'DO NOT MESSAGE', 'CANCEL', 'QUIT', 'END', 'HALT'];
  return keywords.includes(clean);
}

export async function processCustomerOptOut(phone: string, reason = 'Customer text keyword'): Promise<void> {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const carts = await db.getAbandonedCarts();

  for (const cart of carts) {
    const cartPhone = (cart.phone || '').replace(/[^0-9]/g, '');
    if (cartPhone === cleanPhone || cartPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cartPhone)) {
      cart.optedOut = true;
      cart.consentStatus = false;
      cart.recoveryStatus = 'CANCELLED';
      await db.saveAbandonedCart(cart);
    }
  }

  // Also update user profile if exists
  const customers = await db.getAllCustomers();
  for (const user of customers) {
    const userPhone = (user.phone || '').replace(/[^0-9]/g, '');
    if (userPhone === cleanPhone || userPhone.endsWith(cleanPhone) || cleanPhone.endsWith(userPhone)) {
      user.whatsappOptIn = false;
      await db.saveUser(user);
    }
  }

  await db.addNotification(
    'WhatsApp Opt-Out Processed',
    `Customer phone +${cleanPhone} requested opt-out (${reason}). All recovery messages halted.`,
    'WHATSAPP'
  );
}

// Background scheduler continuously scanning abandoned carts
let schedulerRunning = false;

export function startAbandonedCartScheduler() {
  if (schedulerRunning) return;
  schedulerRunning = true;

  console.log('Abandoned Cart 5-Stage WhatsApp Scheduler activated (Checking every 60s)...');

  // Check every 60 seconds
  setInterval(async () => {
    try {
      await runAbandonedCartSweep();
    } catch (e) {
      console.error('Error during abandoned cart sweep:', e);
    }
  }, 60 * 1000);
}

export async function runAbandonedCartSweep() {
  const settings = await db.getSettings();
  if (!settings.abandonedCartEnabled) {
    return;
  }

  const abandonedCarts = await db.getAbandonedCarts();
  const now = Date.now();

  for (const cart of abandonedCarts) {
    // Check stop conditions
    if (cart.completed || cart.optedOut || cart.recoveryStatus === 'CANCELLED' || cart.recoveryStatus === 'RECOVERED') {
      continue;
    }

    // Verify whether an order was placed for this cart
    if (cart.orderId) {
      const order = await db.getOrderByIdOrOrderId(cart.orderId);
      if (order && (order.paymentStatus === 'PAID' || order.orderStatus !== 'CANCELLED')) {
        cart.completed = true;
        cart.recoveryStatus = 'RECOVERED';
        await db.saveAbandonedCart(cart);
        continue;
      }
    }

    if (!cart.phone || cart.phone.length < 7) {
      continue;
    }

    const abandonedAtTime = new Date(cart.abandonedAt || cart.createdAt).getTime();
    const elapsedMinutes = Math.floor((now - abandonedAtTime) / (60 * 1000));

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const checkoutLink = `${frontendUrl}/checkout?cartId=${cart.cartId}`;
    const productSummary = cart.items.map((i) => `• ${i.name} (Qty: ${i.quantity})`).join('\n');

    // EXACT STAGE 1: 60 MINUTES (>= 60 minutes)
    if (
      settings.stagesEnabled.stage_60m &&
      elapsedMinutes >= 60 &&
      cart.recovery_60m.status === 'SCHEDULED'
    ) {
      const message = await generatePersonalizedRecoveryCopy('60m', cart.customerName || 'Valued Customer', productSummary, cart.cartTotal, checkoutLink);
      const result = await sendWhatsAppMessage(cart.phone, message);

      cart.recovery_60m.status = result.success ? 'SENT' : 'FAILED';
      cart.recovery_60m.sentAt = new Date().toISOString();
      cart.recovery_60m.message = message;
      cart.lastMessageAt = new Date().toISOString();
      cart.attemptsCount = (cart.attemptsCount || 0) + 1;
      cart.recoveryStatus = 'IN_PROGRESS';
      await db.saveAbandonedCart(cart);
      await db.addNotification('WhatsApp Recovery Sent (60m)', `Sent to ${cart.customerName} (+${cart.phone}) for ₹${cart.cartTotal}`, 'WHATSAPP');
      continue;
    }

    // EXACT STAGE 2: 3 HOURS (>= 180 minutes)
    if (
      settings.stagesEnabled.stage_3h &&
      elapsedMinutes >= 180 &&
      cart.recovery_3h.status === 'SCHEDULED' &&
      cart.recovery_60m.status === 'SENT'
    ) {
      const message = await generatePersonalizedRecoveryCopy('3h', cart.customerName || 'Valued Customer', productSummary, cart.cartTotal, checkoutLink);
      const result = await sendWhatsAppMessage(cart.phone, message);

      cart.recovery_3h.status = result.success ? 'SENT' : 'FAILED';
      cart.recovery_3h.sentAt = new Date().toISOString();
      cart.recovery_3h.message = message;
      cart.lastMessageAt = new Date().toISOString();
      cart.attemptsCount = (cart.attemptsCount || 0) + 1;
      await db.saveAbandonedCart(cart);
      await db.addNotification('WhatsApp Recovery Sent (3h)', `Stage 2 reminder sent to ${cart.customerName}`, 'WHATSAPP');
      continue;
    }

    // EXACT STAGE 3: 6 HOURS (>= 360 minutes)
    if (
      settings.stagesEnabled.stage_6h &&
      elapsedMinutes >= 360 &&
      cart.recovery_6h.status === 'SCHEDULED' &&
      cart.recovery_3h.status === 'SENT'
    ) {
      const message = await generatePersonalizedRecoveryCopy('6h', cart.customerName || 'Valued Customer', productSummary, cart.cartTotal, checkoutLink);
      const result = await sendWhatsAppMessage(cart.phone, message);

      cart.recovery_6h.status = result.success ? 'SENT' : 'FAILED';
      cart.recovery_6h.sentAt = new Date().toISOString();
      cart.recovery_6h.message = message;
      cart.lastMessageAt = new Date().toISOString();
      cart.attemptsCount = (cart.attemptsCount || 0) + 1;
      await db.saveAbandonedCart(cart);
      await db.addNotification('WhatsApp Recovery Sent (6h)', `Stage 3 reminder sent to ${cart.customerName}`, 'WHATSAPP');
      continue;
    }

    // EXACT STAGE 4: 12 HOURS (>= 720 minutes)
    if (
      settings.stagesEnabled.stage_12h &&
      elapsedMinutes >= 720 &&
      cart.recovery_12h.status === 'SCHEDULED' &&
      cart.recovery_6h.status === 'SENT'
    ) {
      const message = await generatePersonalizedRecoveryCopy('12h', cart.customerName || 'Valued Customer', productSummary, cart.cartTotal, checkoutLink);
      const result = await sendWhatsAppMessage(cart.phone, message);

      cart.recovery_12h.status = result.success ? 'SENT' : 'FAILED';
      cart.recovery_12h.sentAt = new Date().toISOString();
      cart.recovery_12h.message = message;
      cart.lastMessageAt = new Date().toISOString();
      cart.attemptsCount = (cart.attemptsCount || 0) + 1;
      await db.saveAbandonedCart(cart);
      await db.addNotification('WhatsApp Recovery Sent (12h)', `Stage 4 reminder sent to ${cart.customerName}`, 'WHATSAPP');
      continue;
    }

    // EXACT STAGE 5: 24 HOURS (>= 1440 minutes)
    if (
      settings.stagesEnabled.stage_24h &&
      elapsedMinutes >= 1440 &&
      cart.recovery_24h.status === 'SCHEDULED' &&
      cart.recovery_12h.status === 'SENT'
    ) {
      const message = await generatePersonalizedRecoveryCopy('24h', cart.customerName || 'Valued Customer', productSummary, cart.cartTotal, checkoutLink);
      const result = await sendWhatsAppMessage(cart.phone, message);

      cart.recovery_24h.status = result.success ? 'SENT' : 'FAILED';
      cart.recovery_24h.sentAt = new Date().toISOString();
      cart.recovery_24h.message = message;
      cart.lastMessageAt = new Date().toISOString();
      cart.attemptsCount = (cart.attemptsCount || 0) + 1;
      // FINAL STAGE REACHED -> STOP AUTOMATIC SEQUENCE
      cart.recoveryStatus = 'EXPIRED';
      await db.saveAbandonedCart(cart);
      await db.addNotification('WhatsApp Final Recovery Sent (24h)', `Final Stage 5 sent to ${cart.customerName}. Automated sequence stopped.`, 'WHATSAPP');
      continue;
    }
  }
}
