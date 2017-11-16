// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const tinify = require("tinify");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // Get API Key
  tinify.key = vscode.workspace.getConfiguration("tinypng").get("apiKey");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.compressFile",
    function(file) {
      return tinify.fromFile(file.path).toFile(file.path, error => {
        if (error) {
          if (error instanceof tinify.AccountError) {
            vscode.window.showErrorMessage(
              "Authentification failed. Have you set the API Key?"
            );
            // Verify your API key and account limit.
          } else if (error instanceof tinify.ClientError) {
            // Check your source image and request options.
            vscode.window.showErrorMessage(
              "Ooops, there is an error. Please check your source image and settings."
            );
          } else if (error instanceof tinify.ServerError) {
            // Temporary issue with the Tinify API.
            vscode.window.showErrorMessage(
              "TinyPNG API is currently not available."
            );
          } else if (error instanceof tinify.ConnectionError) {
            // A network connection error occurred.
            vscode.window.showErrorMessage(
              "Network issue occurred. Please check your internet connectivity."
            );
          } else {
            // Something else went wrong, unrelated to the Tinify API.
            vscode.window.showErrorMessage(error.message);
          }
        } else {
          vscode.window.showInformationMessage(
            `Image ${file.path} successfully compressed!`
          );
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
