@echo off

:: win32
set dir=musicPlayer-win32-ia32
set name=Windows_x32
title Comprimiendo %name%
"C:\Program Files\7-Zip\7z" a -t7z ./compiled/%name%.7z %dir%
rmdir /s /q %dir%

:: win64
set dir=musicPlayer-win32-x64
set name=Windows_x64
title Comprimiendo %name%
"C:\Program Files\7-Zip\7z" a -t7z ./compiled/%name%.7z %dir%
rmdir /s /q %dir%

:: linuxArm
set dir=musicPlayer-linux-armv7l
set name=Linux_ARM
title Comprimiendo %name%
"C:\Program Files\7-Zip\7z" a -t7z ./compiled/%name%.7z %dir%
rmdir /s /q %dir%

:: linux32
set dir=musicPlayer-linux-ia32
set name=Linux_x32
title Comprimiendo %dir%
"C:\Program Files\7-Zip\7z" a -t7z ./compiled/%name%.7z %dir%
rmdir /s /q %dir%

:: linux64
set dir=musicPlayer-linux-x64
set name=Linux_x64
title Comprimiendo %name%
"C:\Program Files\7-Zip\7z" a -t7z ./compiled/%name%.7z %dir%
rmdir /s /q %dir%