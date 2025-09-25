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
      const jsonResponse = await response.json(); // parse JSON first

      if (!response.ok) {
        // throw a custom error object with server response
        throw { name: 'servicesError', message: jsonResponse };
      }

      return jsonResponse; // happy path
    } catch (err) {
      console.error("Checkout error:", err);
      throw err; // re-throw so calling code can handle it
    }
  }
}
