// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const tinify = require("tinify");

/**
 * Function to compress a single image.
 * @param {Object} file 
 */
const compressImage = file => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.text = `Compressing file ${file.path}...`;
  statusBarItem.show();
  return tinify.fromFile(file.path).toFile(file.path, error => {
    statusBarItem.hide();
    if (error) {
      if (error instanceof tinify.AccountError) {
        // Verify your API key and account limit.
        console.error("Authentification failed. Have you set the API Key?");
        vscode.window.showErrorMessage(
          "Authentification failed. Have you set the API Key?"
        );
      } else if (error instanceof tinify.ClientError) {
        // Check your source image and request options.
        console.error(
          "Ooops, there is an error. Please check your source image and settings."
        );
        vscode.window.showErrorMessage(
          "Ooops, there is an error. Please check your source image and settings."
        );
      } else if (error instanceof tinify.ServerError) {
        // Temporary issue with the Tinify API.
        console.error("TinyPNG API is currently not available.");
        vscode.window.showErrorMessage(
          "TinyPNG API is currently not available."
        );
      } else if (error instanceof tinify.ConnectionError) {
        // A network connection error occurred.
        console.error(
          "Network issue occurred. Please check your internet connectivity."
        );
        vscode.window.showErrorMessage(
          "Network issue occurred. Please check your internet connectivity."
        );
      } else {
        // Something else went wrong, unrelated to the Tinify API.
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
      }
    } else {
      vscode.window.showInformationMessage(
        `Image ${file.path} successfully compressed!`
      );
    }
  });
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  // Get API Key
  tinify.key = vscode.workspace.getConfiguration("tinypng").get("apiKey");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposableCompressFile = vscode.commands.registerCommand(
    "extension.compressFile",
    compressImage
  );

  context.subscriptions.push(disposableCompressFile);

  let disposableCompressFolder = vscode.commands.registerCommand(
    "extension.compressFolder",
    function(folder) {
      vscode.workspace
        .findFiles(
          new vscode.RelativePattern(folder.path, `**/*.{png,jpg,jpeg}`)
        )
        .then(files => files.forEach(compressImage));
    }
  );

  context.subscriptions.push(disposableCompressFolder);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
