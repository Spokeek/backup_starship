# The Backup Starship

This project is a school project about starships's communication with tokens.

It will be used to implement backup policies.

## The Amiral

This spaceship is the master of a fleet, it will generate a token each 5 minutes
It  will display a web interface to allow sattelites to get the actual last token generated by the amiral.
To do so, they have to send an token that is not old enough to be considered expired. 

### Requirements
- Node version >= 8

### Depedencies
- Express
- SqlLite 3
- MomentJS

### Environements variables
- PORT : Changes the port number used for the application
- VERBOSE_LEVEL : Has to be at 'LOG' to enable all logs
- ID_FLEET : Name of the fleet