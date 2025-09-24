// Safe PayPal integration that won't crash deployment
import { Request, Response } from "express";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

// Check if PayPal is configured
const isPayPalConfigured = !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);

if (isPayPalConfigured) {
  console.log("PayPal configured successfully");
} else {
  console.warn("PayPal not configured - payment functionality disabled");
}

// Safe PayPal functions that won't crash
export async function createPaypalOrder(req: Request, res: Response) {
  if (!isPayPalConfigured) {
    return res.status(503).json({ error: "Payment system not configured" });
  }
  
  // If configured, import the real implementation
  try {
    const { createPaypalOrder: realCreateOrder } = await import("./paypal");
    return await realCreateOrder(req, res);
  } catch (error) {
    console.error("PayPal order creation failed:", error);
    return res.status(500).json({ error: "Payment system error" });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  if (!isPayPalConfigured) {
    return res.status(503).json({ error: "Payment system not configured" });
  }
  
  try {
    const { capturePaypalOrder: realCaptureOrder } = await import("./paypal");
    return await realCaptureOrder(req, res);
  } catch (error) {
    console.error("PayPal order capture failed:", error);
    return res.status(500).json({ error: "Payment system error" });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  if (!isPayPalConfigured) {
    return res.status(503).json({ error: "Payment system not configured" });
  }
  
  try {
    const { loadPaypalDefault: realLoadDefault } = await import("./paypal");
    return await realLoadDefault(req, res);
  } catch (error) {
    console.error("PayPal setup failed:", error);
    return res.status(500).json({ error: "Payment system error" });
  }
}

export async function verifyPaypalTransaction(orderID: string) {
  if (!isPayPalConfigured) {
    console.warn("PayPal not configured - cannot verify transaction");
    return false;
  }
  
  try {
    const { verifyPaypalTransaction: realVerify } = await import("./paypal");
    return await realVerify(orderID);
  } catch (error) {
    console.error("PayPal verification failed:", error);
    return false;
  }
}