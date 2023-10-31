const buttonSelector = ".toggle-button--button--SharingPluginV1";
const modalCloseButton = ".share-modal--icon--SharingPluginV1";
const closeModal = () => {
  cy.get("body").find(modalCloseButton).eq(1).click();
};

context("Test the demo app", () => {

  describe("Demo page", () => {

    it("renders the demo page with wrapper component and svg icons", () => {
      cy.visit("/demo.html");
      cy.get("#plugin")
        .find("svg");
    });

    it("does not allow view class without share clicked first", () => {
      cy.visit("/demo.html");
      cy.get("#plugin").find(buttonSelector).eq(1).click();
      cy.get("#plugin").find(".view-class--viewClass--SharingPluginV1").should("not.exist");
    });

    describe("The class dialog", () => {

    const openViewClass = () => {
      cy.wait(1000)
      cy.get("#plugin").find(buttonSelector).eq(0).click();
      cy.wait(3000)
      closeModal();
      cy.get("#plugin").find(buttonSelector).eq(1).click();
    };

      before(() => {
        cy.visit("/demo.html");
        openViewClass();
      })

      it("does allow view class after share clicked", () => {
        cy.get("body").find(".view-class--viewClass--SharingPluginV1").should("exist");
        cy.get("body").find(".view-class--titleBarContents--SharingPluginV1").contains("Demo Interactive");
      });

      it("shows the list of students in the class view", () => {
        cy.get("body").find(".left-nav--students--SharingPluginV1>div").its("length").should("eq", 26);
      });

      it("shows the message to click on a student's name in the class view", () => {
        cy.get("body").find(".view-class--viewerMessageContents--SharingPluginV1").first().contains("Click on a student's name to view their work.");
      });

      it("shows the iframe when a student's name is clicked", () => {
        cy.get("body").find(".left-nav--students--SharingPluginV1 div").first().click();
        cy.get("body").find(".view-class--viewerInteractiveIFrame--SharingPluginV1").should("exist");
      });

    });
  });
});
