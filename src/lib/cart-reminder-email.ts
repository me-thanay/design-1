import type { CartItem } from "@/components/cart/CartProvider";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateCartReminderSubject(items: CartItem[]): string {
  if (!items || items.length === 0) {
    return "✨ You left items waiting in your Sawbhagya bag";
  }

  const cleanNames = items.map((i) => i.name.split("·")[0].trim());

  if (cleanNames.length === 1) {
    return `✨ Don't forget: ${cleanNames[0]} is waiting in your cart!`;
  }
  if (cleanNames.length === 2) {
    return `✨ ${cleanNames[0]} and ${cleanNames[1]} are waiting in your cart`;
  }
  const remaining = cleanNames.length - 2;
  return `✨ ${cleanNames[0]}, ${cleanNames[1]} and ${remaining} more item${remaining > 1 ? "s are" : " is"} waiting in your cart`;
}

export function generateCartReminderHtml(options: {
  customerName?: string | null;
  items: CartItem[];
  subtotal: number;
  cartUrl: string;
}): string {
  const { customerName, items, subtotal, cartUrl } = options;
  const greeting = customerName ? `Hello ${customerName},` : "Hello,";

  const itemsHtml = items
    .map((item) => {
      const variantInfo = [item.color ? `Color: ${item.color}` : null, item.size ? `Size: ${item.size}` : null]
        .filter(Boolean)
        .join(" | ");

      const imageHtml = item.image
        ? `<td style="width: 80px; padding: 12px 12px 12px 0; vertical-align: middle;">
            <img src="${item.image.startsWith("http") ? item.image : `${cartUrl.replace(/\/cart.*$/, "")}${item.image}`}" 
                 alt="${item.name}" 
                 style="width: 72px; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #f0eae1; display: block;" />
           </td>`
        : "";

      return `
        <tr style="border-bottom: 1px solid #f2ede4;">
          ${imageHtml}
          <td style="padding: 12px 0; vertical-align: middle;">
            <div style="font-size: 15px; font-weight: 600; color: #1c1917; font-family: 'Playfair Display', Georgia, serif; line-height: 1.3;">
              ${item.name}
            </div>
            ${
              variantInfo
                ? `<div style="font-size: 12px; color: #78716c; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                     ${variantInfo}
                   </div>`
                : ""
            }
            <div style="font-size: 13px; color: #a16207; font-weight: 600; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              Qty: ${item.qty} × ${formatINR(item.price)}
            </div>
          </td>
          <td style="padding: 12px 0 12px 12px; text-align: right; vertical-align: middle; font-size: 15px; font-weight: 700; color: #1c1917; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${formatINR(item.price * item.qty)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Sawbhagya Bag is Waiting</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eee7de;">
          
          <!-- Header Branding -->
          <tr>
            <td align="center" style="padding: 32px 24px 20px 24px; background: linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%); border-bottom: 1px solid #f4efe8;">
              <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; letter-spacing: 0.08em; color: #1c1917; text-transform: uppercase;">
                SAWBHAGYA
              </div>
              <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #92400e; margin-top: 4px; font-weight: 600;">
                Premium Ethnic Wear & Handcrafted Silhouettes
              </div>
            </td>
          </tr>

          <!-- Hero Message -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: left;">
              <div style="font-size: 13px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px;">
                Shopping Bag Reminder
              </div>
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #1c1917; margin: 0 0 14px 0; line-height: 1.3;">
                You left something exquisite in your bag
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0;">
                ${greeting} We noticed you were eyeing some handcrafted pieces. Handcrafted editions are created in small, limited batches and can sell out quickly. We have reserved them in your shopping bag so you won't miss out!
              </p>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #f2ede4;">
                ${itemsHtml}
              </table>

              <!-- Subtotal & Savings -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; padding: 16px; background-color: #faf7f2; border-radius: 12px; border: 1px solid #ede4d6;">
                <tr>
                  <td style="font-size: 14px; color: #57534e; font-weight: 500;">
                    Total Bag Value (${items.reduce((sum, i) => sum + i.qty, 0)} items):
                  </td>
                  <td style="font-size: 18px; color: #1c1917; font-weight: 800; text-align: right; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    ${formatINR(subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 6px; font-size: 12px; color: #047857; font-weight: 600;">
                    ✓ Free Delivery & Quality Guarantee Applied
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main CTA Button -->
          <tr>
            <td align="center" style="padding: 8px 32px 32px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 50px; background-color: #1c1917; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                    <a href="${cartUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 50px; letter-spacing: 0.04em; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                      Complete Your Order Now →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 12px; color: #78716c; margin-top: 12px;">
                No checkout friction • Secure Razorpay & UPI Payments
              </div>
            </td>
          </tr>

          <!-- Trust Badges -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fdfbf7; border-top: 1px solid #f4efe8; border-bottom: 1px solid #f4efe8;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px; width: 33.33%;">
                    <div style="font-size: 18px; margin-bottom: 4px;">✨</div>
                    <div style="font-size: 12px; font-weight: 700; color: #1c1917;">Artisan Handcrafted</div>
                    <div style="font-size: 11px; color: #78716c;">Pure fabrics & fits</div>
                  </td>
                  <td align="center" style="padding: 8px; width: 33.33%;">
                    <div style="font-size: 18px; margin-bottom: 4px;">🚚</div>
                    <div style="font-size: 12px; font-weight: 700; color: #1c1917;">Express Shipping</div>
                    <div style="font-size: 11px; color: #78716c;">Safe door delivery</div>
                  </td>
                  <td align="center" style="padding: 8px; width: 33.33%;">
                    <div style="font-size: 18px; margin-bottom: 4px;">🔒</div>
                    <div style="font-size: 12px; font-weight: 700; color: #1c1917;">100% Secure</div>
                    <div style="font-size: 11px; color: #78716c;">Verified checkout</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 32px; background-color: #faf8f5;">
              <div style="font-size: 12px; color: #78716c; line-height: 1.5;">
                Need assistance with sizes, styling or customization? Reply directly to this email or chat with our styling team.
              </div>
              <div style="font-size: 11px; color: #a8a29e; margin-top: 12px;">
                © ${new Date().getFullYear()} Sawbhagya. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
