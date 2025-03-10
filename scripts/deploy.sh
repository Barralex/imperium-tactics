#!/bin/bash

# Salir si hay errores
set -e

# Cargar variables de entorno desde .env de forma más robusta
if [ -f .env ]; then
    # Método más robusto para leer .env
    export $(grep -v '^#' .env | xargs -0)
else
    echo "❌ Error: Archivo .env no encontrado. Por favor, crea un .env con APP_ID."
    exit 1
fi

# Validar que APP_ID esté definido
if [ -z "$APP_ID" ]; then
    echo "❌ Error: APP_ID no está definido en .env."
    exit 1
fi

# Variables de configuración
BRANCH="main"
REGION="us-east-1"
BUILD_DIR="dist"
ZIP_FILE="build.zip"

# Construir la aplicación
echo "🏗️ Construyendo la aplicación..."
npm run build

# Crear archivo zip
echo "📦 Creando archivo zip..."
if [ -d "$BUILD_DIR" ]; then
    cd "$BUILD_DIR"
    zip -r "../$ZIP_FILE" . -x ".*"
    cd ..
else
    echo "❌ Error: El directorio '$BUILD_DIR' no existe. ¿Se ejecutó correctamente 'npm run build'?"
    exit 1
fi

# Obtener URL de carga pre-firmada y Job ID
echo "🔑 Obteniendo URL de carga y Job ID..."
response=$(aws amplify create-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --region "$REGION" \
  --query '{zipUploadUrl: zipUploadUrl, jobId: jobId}' \
  --output json) || { echo "❌ Error al obtener la URL de carga."; exit 1; }

UPLOAD_URL=$(echo "$response" | jq -r '.zipUploadUrl')
JOB_ID=$(echo "$response" | jq -r '.jobId')

# Validar que se obtuvo la URL de carga y el Job ID
if [ -z "$UPLOAD_URL" ] || [ -z "$JOB_ID" ]; then
    echo "❌ Error: No se pudo obtener la URL de carga o el Job ID."
    exit 1
fi

# Subir archivo zip usando curl
echo "📤 Subiendo archivo zip a AWS..."
curl -H "Content-Type: application/zip" --upload-file "$ZIP_FILE" "$UPLOAD_URL" || { echo "❌ Error al subir el archivo ZIP."; exit 1; }

# Iniciar el despliegue
echo "🚀 Iniciando despliegue en Amplify..."
aws amplify start-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --job-id "$JOB_ID" \
  --region "$REGION" || { echo "❌ Error al iniciar el despliegue."; exit 1; }

echo "✅ Despliegue iniciado con Job ID: $JOB_ID"
echo "Puedes verificar el estado en la consola de AWS Amplify"