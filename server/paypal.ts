// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";

/* PayPal Controllers Setup */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn("PayPal credentials not configured - payment functionality will be disabled");
  console.warn("To enable payments, set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in deployment environment");
}

let client: Client | null = null;
let ordersController: OrdersController | null = null;
let oAuthAuthorizationController: OAuthAuthorizationController | null = null;

if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
  console.log("PayPal Client ID:", PAYPAL_CLIENT_ID.substring(0, 10) + "...");
  console.log("PayPal Client Secret:", PAYPAL_CLIENT_SECRET.substring(0, 10) + "...");
  
  client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: Environment.Production, // Using live credentials
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  });
  
  ordersController = new OrdersController(client);
  oAuthAuthorizationController = new OAuthAuthorizationController(client);
} else {
  console.warn("PayPal not initialized - credentials missing");
}

// Export the orders controller for use in other files (can be null if not configured)
export { ordersController };

/* Token generation helpers */

export async function getClientToken() {
  if (!oAuthAuthorizationController || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal not configured - payment functionality disabled");
  }
  
  try {
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");

    const { result } = await oAuthAuthorizationController.requestToken(
      {
        authorization: `Basic ${auth}`,
      },
      { intent: "sdk_init", response_type: "client_token" },
    );

    return result.accessToken;
  } catch (error) {
    console.error("PayPal token generation failed:", error);
    throw new Error("PayPal authentication failed");
  }
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    return res.status(503).json({ error: "PayPal payment system not configured" });
  }
  
  try {
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    return res.status(503).json({ error: "PayPal payment system not configured" });
  }
  
  try {
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    // Only return the PayPal response - do NOT credit user here
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function verifyPaypalTransaction(orderID: string) {
  if (!ordersController) {
    console.error("PayPal not configured - cannot verify transaction");
    return false;
  }
  
  try {
    const { body } = await ordersController.getOrder({ id: orderID });
    const orderData = JSON.parse(String(body));
    
    // Verify the order is actually completed and paid
    return orderData.status === 'COMPLETED' && 
           orderData.purchase_units?.[0]?.payments?.captures?.[0]?.status === 'COMPLETED';
  } catch (error) {
    console.error("Failed to verify PayPal transaction:", error);
    return false;
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  if (!ordersController || !oAuthAuthorizationController) {
    return res.status(503).json({ error: "PayPal payment system not configured" });
  }
  
  try {
    const clientToken = await getClientToken();
    res.json({ clientToken });
  } catch (error) {
    console.error("Failed to load PayPal default:", error);
    res.status(500).json({ error: "Failed to load PayPal default." });
  }
}
// <END_EXACT_CODE>