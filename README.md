# Proyecto de Autenticación - SIA

Este proyecto es un ejemplo de autenticación usando Node.js, TypeORM y SQLite. Está diseñado para que el docente pueda validar fácilmente sin necesidad de configurar una base de datos externa.

---

## 1. Instalación de dependencias

Ejecuta el siguiente comando para instalar todas las dependencias del proyecto:

```bash
npm install
```

## 2. Ejecutar el proyecto en modo desarrollo
```bash
npm run dev
```

## 3. Probar el endpoint de autenticación
Valida el funcionamiento del endpoint POST /api/auth/login enviando un body con los datos de prueba:
```bash
{
  "document": "123456789", 
  "password": "123456789"
}
```
**Nota:** los datos del json representan a un usuario creado en la base de datos

## 4. Base de datos
Este proyecto utiliza SQLite para simplificar la validación del instructor.
No es necesario configurar una instancia externa de base de datos ni crearla manualmente.

El archivo de la base de datos se encuentra en:

```bash
src/db/sia-edutech.sqlite
```

SQLite permite que el proyecto funcione de manera inmediata sin instalaciones adicionales, facilitando la prueba y desarrollo.