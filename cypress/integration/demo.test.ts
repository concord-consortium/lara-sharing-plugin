context("Test the demo app", () => {
  beforeEach(() => {
    cy.visit("/demo.html");
  });

  describe("Demo page", () => {
    it("renders the demo page with wrapper component", () => {
      const expectedText = "Interactive Sharing Text Here.";
      cy.get("#plugin").should((d) => expect(d).to.contain(expectedText));
    });
  });
});
