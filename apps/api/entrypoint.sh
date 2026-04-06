#!/bin/sh
set -e

echo "Running database migrations..."
node apps/api/dist/database/migrate.js

echo "Starting server..."
exec node apps/api/dist/main.js
