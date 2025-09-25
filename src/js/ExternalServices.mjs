export default class ExternalServices {
  constructor() {
    this.checkoutURL = "http://wdd330-backend.onrender.com/checkout";
  }

  async checkout(orderData) {
    try {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      };
      const response = await fetch(this.checkoutURL, options);
      if (!response.ok) throw new Error("Checkout failed");
      return await response.json();
    } catch (err) {
      console.error("Checkout error:", err);
      throw err;
    }
  }
}
