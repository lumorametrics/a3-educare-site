// Contact details supplied by A3 Educare Hub, shared by the Contact page and the WhatsApp button.
export const PHONE_DISPLAY = "+91 89698 86176";
export const PHONE_HREF = "tel:+918969886176";

const WHATSAPP_NUMBER = "918969886176"; // international format, digits only
export const WHATSAPP_MESSAGE = "Hello A3 EduCare Hub, I would like to know more about courses and admissions.";

/** wa.me link that opens a chat with the number and a pre-filled message (app on mobile, WhatsApp Web on desktop). */
export function whatsappChatUrl(message = WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
