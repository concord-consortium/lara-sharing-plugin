context("Test the demo app", () => {
  beforeEach(() => {
    cy.visit("/demo.html");
  });

  describe("Demo page", () => {
    it("renders the demo page with wrapper component and svg icons", () => {
      cy.get("#plugin")
        .find('svg');
    });
  });
});
