import type { CartItem } from "@/components/cart/CartProvider";

export type CartReminderStage = 1 | 2 | 3;

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateCartReminderSubject(
  items: CartItem[],
  stage: CartReminderStage = 1,
): string {
  if (!items || items.length === 0) {
    if (stage === 2) return "⏳ Still thinking about it? Your Sawbhagya bag is in high demand";
    if (stage === 3) return "⚠️ Final call: Last chance to complete your Sawbhagya order";
    return "✨ You left something exquisite waiting in your Sawbhagya bag";
  }

  const cleanNames = items.map((i) => i.name.split("·")[0].trim());
  const firstName = cleanNames[0];

  if (stage === 2) {
    if (cleanNames.length === 1) {
      return `⏳ Still thinking? ${firstName} is in high demand in your bag`;
    }
    return `⏳ High demand alert: ${firstName} and your reserved pieces may sell out`;
  }

  if (stage === 3) {
    if (cleanNames.length === 1) {
      return `⚠️ Final call: Last chance to claim ${firstName} before cart release`;
    }
    return `⚠️ Final notice: We are releasing your reserved pieces soon`;
  }

  // Default Stage 1 (3 hrs)
  if (cleanNames.length === 1) {
    return `✨ Don't forget: ${firstName} is waiting in your Sawbhagya bag!`;
  }
  if (cleanNames.length === 2) {
    return `✨ ${cleanNames[0]} and ${cleanNames[1]} are waiting in your bag`;
  }
  const remaining = cleanNames.length - 2;
  return `✨ ${cleanNames[0]}, ${cleanNames[1]} and ${remaining} more item${remaining > 1 ? "s are" : " is"} waiting in your bag`;
}

export function generateCartReminderHtml(options: {
  customerName?: string | null;
  items: CartItem[];
  subtotal: number;
  cartUrl: string;
  stage?: CartReminderStage;
}): string {
  const { customerName, items, subtotal, cartUrl, stage = 1 } = options;
  const greeting = customerName ? `Hello ${customerName},` : "Hello,";

  let badgeText = "3-Hour Bag Reservation";
  let badgeColor = "#92400e";
  let badgeBorder = "#fde68a";
  let badgeBg = "#fef3c7";
  let heading = "You left something exquisite in your bag";
  let bodyText = `${greeting} We noticed you were exploring our handcrafted pieces earlier today. Because our artisan editions are created in small, limited batches, we have safely reserved them in your shopping bag so you won't lose your selection!`;
  let ctaText = "Complete Your Order Now →";

  if (stage === 2) {
    badgeText = "12-Hour Priority Alert";
    badgeColor = "#c2410c";
    badgeBorder = "#fed7aa";
    badgeBg = "#fff7ed";
    heading = "Your reserved pieces are in high demand";
    bodyText = `${greeting} Just checking in on your shopping bag! Our handcrafted sarees and silhouettes are produced in limited boutique quantities and are seeing high interest today. Your pieces are reserved and ready for swift door delivery whenever you're ready.`;
    ctaText = "Claim Your Reserved Pieces →";
  } else if (stage === 3) {
    badgeText = "Final Reservation Notice (18 Hours)";
    badgeColor = "#b91c1c";
    badgeBorder = "#fecaca";
    badgeBg = "#fef2f2";
    heading = "Final notice before your bag is released";
    bodyText = `${greeting} This is our final reminder before your reserved items are returned to general boutique stock for other customers. If you still wish to make them yours with complimentary express delivery, please finalize your order now.`;
    ctaText = "Finalize Order Before Release →";
  }

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

  const baseUrl = cartUrl.replace(/\/cart.*$/, "").replace(/\/$/, "");
  const logoUrl = `${baseUrl}/logo/logo.png`;

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
            <td align="center" style="padding: 32px 24px 24px 24px; background: linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%); border-bottom: 1px solid #f4efe8;">
              <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="${logoUrl}" alt="Sawbhagya" width="68" height="68" style="width: 68px; height: 68px; object-fit: contain; display: block; margin: 0 auto 12px auto; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" />
              </a>
              <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color: #1c1917; text-transform: uppercase;">
                SAWBHAGYA
              </div>
              <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #92400e; margin-top: 4px; font-weight: 600;">
                Handcrafted Luxury & Timeless Silhouettes
              </div>
            </td>
          </tr>

          <!-- Hero Message -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: left;">
              <div style="display: inline-block; font-size: 11px; font-weight: 700; color: ${badgeColor}; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; padding: 4px 12px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 12px;">
                ${badgeText}
              </div>
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #1c1917; margin: 0 0 14px 0; line-height: 1.3;">
                ${heading}
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0;">
                ${bodyText}
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
                      ${ctaText}
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
