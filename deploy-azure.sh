#!/bin/bash
# Azure Deployment Script for School Management System
# Usage: bash deploy-azure.sh
# Prerequisites: Azure CLI logged in with contributor access

set -e

# Configuration - change these as needed
RESOURCE_GROUP="school-mgmt-rg"
LOCATION="eastus"
APP_NAME="school-mgmt-api"
DB_SERVER_NAME="school-mgmt-db"
STATIC_APP_NAME="school-mgmt-frontend"
DB_ADMIN_USER="schooladmin"
DB_ADMIN_PASSWORD="SchoolMgmt2026!" # Change this in production!

echo "=== Creating Resource Group ==="
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "=== Creating PostgreSQL Flexible Server ==="
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location $LOCATION \
  --admin-user $DB_ADMIN_USER \
  --admin-password $DB_ADMIN_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --public-access 0.0.0.0

echo "=== Creating Database ==="
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name school_management

echo "=== Creating App Service Plan ==="
az appservice plan create \
  --resource-group $RESOURCE_GROUP \
  --name "${APP_NAME}-plan" \
  --sku B1 \
  --is-linux

echo "=== Creating Backend Web App ==="
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --name $APP_NAME \
  --runtime "NODE:22-lts"

DB_HOST="${DB_SERVER_NAME}.postgres.database.azure.com"
DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_HOST}:5432/school_management?sslmode=require"

echo "=== Configuring Backend Environment Variables ==="
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    DATABASE_URL="$DATABASE_URL" \
    JWT_SECRET="$(openssl rand -hex 32)" \
    JWT_EXPIRES_IN="24h" \
    NODE_ENV="production" \
    CORS_ORIGIN="https://${STATIC_APP_NAME}.azurestaticapps.net"

echo "=== Creating Static Web App (Frontend) ==="
az staticwebapp create \
  --resource-group $RESOURCE_GROUP \
  --name $STATIC_APP_NAME \
  --location $LOCATION

echo ""
echo "=== Deployment Complete ==="
echo "Backend URL: https://${APP_NAME}.azurewebsites.net"
echo "Frontend URL: https://${STATIC_APP_NAME}.azurestaticapps.net"
echo "Database Host: $DB_HOST"
echo ""
echo "=== Next Steps ==="
echo "1. Deploy backend code:  az webapp up --name $APP_NAME --resource-group $RESOURCE_GROUP --src-path ./backend"
echo "2. Run migrations:       Set DATABASE_URL and run 'npx prisma migrate deploy'"
echo "3. Seed the database:    Set DATABASE_URL and run 'node prisma/seed.js'"
echo "4. Deploy frontend:      Get the deployment token from Azure Portal and set AZURE_STATIC_WEB_APPS_TOKEN in GitHub Secrets"
