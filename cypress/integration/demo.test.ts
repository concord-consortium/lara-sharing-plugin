context("Test the demo app", () => {
  beforeEach(() => {
    cy.visit("/demo.html");
  });

  describe("Demo page", () => {
    const openViewClass = () => {
      cy.get("#plugin").find(".sharing-wrapper--icon--SharingPluginV1").eq(0).click();
      cy.get("#plugin").find(".sharing-wrapper--icon--SharingPluginV1").eq(1).click();
    };

    it("renders the demo page with wrapper component and svg icons", () => {
      cy.get("#plugin")
        .find("svg");
    });

    it("does not allow view class without share clicked first", () => {
      cy.get("#plugin").find(".sharing-wrapper--icon--SharingPluginV1").eq(1).click();
      cy.get("#plugin").find(".view-class--viewClass--SharingPluginV1").should("not.exist");
    });

    it("does allow view class after share clicked", () => {
      openViewClass();
      cy.get("#plugin").find(".view-class--viewClass--SharingPluginV1").should("exist");
      cy.get("#plugin").find(".view-class--titleBarContents--SharingPluginV1").contains("Demo Interactive");
    });

    it("shows the list of students in the class view", () => {
      openViewClass();
      cy.get("#plugin").find(".view-class--leftNavContents--SharingPluginV1 li").its("length").should("eq", 30);
    });

    it("shows the message to click on a student's name in the class view", () => {
      openViewClass();
      cy.get("#plugin").find(".view-class--viewerMessageContents--SharingPluginV1").first().contains("Click on a student's name to view their work.");
    });

    it("shows the iframe when a student's name is clicked", () => {
      openViewClass();
      cy.get("#plugin").find(".view-class--leftNavContents--SharingPluginV1 li").first().click();
      cy.get("#plugin").find(".view-class--viewerInteractiveIFrame--SharingPluginV1").should("exist");
    });
  });
});
