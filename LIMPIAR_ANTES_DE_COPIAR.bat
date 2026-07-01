@echo off
echo Limpiando archivos viejos del proyecto Impulso...
if exist "proyectonn-main" rmdir /s /q "proyectonn-main"
if exist "procesar.php" del /q "procesar.php"
echo Listo. Ahora copia el contenido del ZIP actualizado en esta carpeta.
pause
