# Sound-Image File Interpreter

Lemmings stores it's sound and music in the `ADLIB.DAT` file. This file is compressed with the basic Lemmings
compressing. After unpacking you get a DOS .com file/driver that contains the **data** and the **program code**
to paly the music/sound.

If you have a look in the file you will find its author:

    AdLib Music by Sound Images (c) 1991

Tha basic file structure of a Sound-Images file is:

    +---------------------+
    | Interpreter code    |
    +---------------------+
    | channel config      |
    +---------------------+
    | instruments Table   |
    +---------------------+
    | Music Song 1        |
    +---------------------+
    | Music Song 2        |
    ..                   ..
    +---------------------+
    | Sound Effect 1      |
    +---------------------+
    | Sound Effect 2      |
    ..                   ..
    +---------------------+


Every Sound-Effect and Music-Song can consist of different instruments (OPL3 channels)
(Sounds only use one, Music can use up to 9 channels).

The Adlib/OPL3 value for each channel is not stored as plane value but it is generated out of
commands each Music-Song or Sound-Effect has. Also there are flow control commands that allow
the interpreter to repeat a sequence of commands:

  
    +------------------------+
    | Channel 1 commands     |
    +------------------------+
    | Channel 2 commands     |
    ..                      ..
    +------------------------+
    | Channel 1 flow control |
    +------------------------+
    | Channel 2 flow control |
    ..                      ..
    +------------------------+


