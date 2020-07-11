Online Tic-Tac-toe
==========
An experiment in using GAS (Google App Script) to create a massively multiplayer game. For now the game is simply [tic-tac-toe](https://script.google.com/macros/s/AKfycbzu3mOvm6nqAH2lGgFltuolTqIXDmmMoXSGyEY3Ohu2D2NtcRo8/exec), but this example could provide a framework for more sophisticated multiplayer games. 
 
## How to Run and Contribute
This is a Google App Script (GAS) application. 
If you would like to contribute, first install [CLASP](https://github.com/google/clasp).
Next git clone this repository somewhere on your local machine. 
Then, from the TTTApp directory within the cloned project directory, run the following commands:
* clasp login     &nbsp; &nbsp;&nbsp; (_using gmail account_)
* clasp create --type webapp  &nbsp; (_this creates a script with this name in your Google Drive_)
* clasp push &nbsp;&nbsp;&nbsp; (_push all the files in the project directory into that script in the cloud_)
  
Now you are good to go. Deploy the web-app from your script on Google Drive.
Make changes locally (in IntelliJ for example), do "clasp push", and refresh the deployed app script page to see the change. 
Do git commit, push, and create pull requests through Github when you have a feature or fix to contribute.
