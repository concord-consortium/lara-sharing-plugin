# LARA Sharing Plugin

A LARA plugin that allows students to share work with each other.

Link for how to add and author LARA Sharing Plugin on an interactive:  
https://docs.google.com/document/d/1miUegNqEISfpm675uCSdDKxCKD16a9Kzw2-VKMvRGpA/edit?usp=sharing

1. As a LARA Admin add this Plugin to your LARA instances, using `LaraSharingPlugin`
as the plugin's `Label`. Use the URL where the script is hosted.
2. Add the plugin to your activity in the assessment block section.
3. Authoring:  The only supported authoring field is `firebaseAppName` which you
are discouraged from using. You can leave the authoring field completely blank
in which case this plugin will correctly use the firebaseAppName `lara-sharing`
which is correct.
4. In the Portal you will have to manually create an instance of a `FirebaseApp`
model with that name if it doesn't already exist.

### Basic Steps to setup LARA Sharing Plugin embedded with shareable interactive:

#### Edit interactive

1. URL: Use Sage Modeler or CODAP LARA sharing URL
2. Save State: Must be selected for sharing interactive state with LARA
3. Save interactive

#### Edit Plugin Embeddable

1. Plugin: Select LARA Sharing Plugin
2. Wrapped Embeddable: Choose interactive for sharing.
3. Author Data: Leave blank (Should be `{ }` by default)

## Development

### Initial steps

1. Clone this repo and `cd` into it
2. Run `npm install` to pull dependencies
3. Run `npm start` to run `webpack-dev-server` in development mode with hot module replacement

### Building

If you want to build a local version run `npm build`, it will create the files in the `dist` folder.
You *do not* need to build to deploy the code, that is automatic.  See more info in the Deployment section below.

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by Travis
for each branch pushed to GitHub and each merge into master.

Merges into master are deployed to http://lara-sharing-plugin.concord.org.

Other branches are deployed to http://lara-sharing-plugin.concord.org/branch/<name>.

You can view the status of all the branch deploys [here](https://travis-ci.org/concord-consortium/lara-sharing-plugin/branches).

To deploy a production release:

1. Increment version number in package.json
2. Create new entry in CHANGELOG.md
3. Run `git log --pretty=oneline --reverse <last release tag>...HEAD | grep '#' | grep -v Merge` and add contents (after edits if needed to CHANGELOG.md)
4. Run `npm run build`
5. Copy asset size markdown table from previous release and change sizes to match new sizes in `dist`
6. Create `release-<version>` branch and commit changes, push to GitHub, create PR and merge
7. Checkout master and pull
8. Checkout production
9. Run `git merge master --no-ff`
10. Push production to GitHub
11. Use https://github.com/concord-consortium/teacher-edition-tips-plugin/releases to create a new release tag

### Testing

Run `npm test` to run jest tests. Run `npm run test:full` to run jest and Cypress tests.

## License

Teacher Edition Tips Plugin are Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See `LICENSE` for the complete license text.

