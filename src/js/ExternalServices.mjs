export default class ExternalServices {
  constructor() {
    this.checkoutURL = "https://wdd330-backend.onrender.com/checkout";
  }

  async checkout(orderData) {
    try {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      };

      const response = await fetch(this.checkoutURL, options);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Checkout failed: ${response.status} - ${text}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Checkout error:", err);
      throw err;
    }
  }
}
