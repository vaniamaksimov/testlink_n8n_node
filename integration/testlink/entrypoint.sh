#!/bin/bash
set -e

DB_HOST="${TESTLINK_DB_HOST:-mariadb}"
DB_NAME="${TESTLINK_DB_NAME:-testlink}"
DB_USER="${TESTLINK_DB_USER:-testlink}"
DB_PASS="${TESTLINK_DB_PASS:-testlink}"
DB_ROOT_PASS="${MYSQL_ROOT_PASSWORD:-root}"
ADMIN_PASS="${TESTLINK_ADMIN_PASSWORD:-admin}"

# Wait for MariaDB to be ready
echo "Waiting for MariaDB at ${DB_HOST}..."
for i in $(seq 1 60); do
    if mysqladmin ping -h "$DB_HOST" -u root -p"$DB_ROOT_PASS" --silent 2>/dev/null; then
        echo "MariaDB is ready."
        break
    fi
    if [ "$i" = "60" ]; then
        echo "Timed out waiting for MariaDB."
        exit 1
    fi
    sleep 2
done

# Check if TestLink is already installed (tables exist)
TABLE_COUNT=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
    -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
    echo "Installing TestLink database schema..."

    # Find and execute the SQL schema file
    SCHEMA_FILE="/var/www/html/install/sql/mysql/testlink_create_tables.sql"
    DEFAULT_DATA="/var/www/html/install/sql/mysql/testlink_create_default_data.sql"

    if [ -f "$SCHEMA_FILE" ]; then
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SCHEMA_FILE"
        echo "Schema installed."
    else
        echo "ERROR: Schema file not found at $SCHEMA_FILE"
        ls -la /var/www/html/install/sql/mysql/ 2>/dev/null || echo "SQL directory not found"
        exit 1
    fi

    if [ -f "$DEFAULT_DATA" ]; then
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$DEFAULT_DATA"
        echo "Default data installed."
    fi

    # Update admin password (default user id=1)
    ADMIN_HASH=$(php -r "echo md5('$ADMIN_PASS');")
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
        -e "UPDATE users SET password='$ADMIN_HASH' WHERE login='admin';"
    echo "Admin password set."

    # Write config_db.inc.php so TestLink knows DB is configured
    cat > /var/www/html/config_db.inc.php <<DBEOF
<?php
define('DB_TYPE', 'mysql');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
define('DB_HOST', '$DB_HOST');
define('DB_NAME', '$DB_NAME');
define('DB_TABLE_PREFIX', '');
?>
DBEOF
    chown www-data:www-data /var/www/html/config_db.inc.php

    echo "TestLink installation complete."
else
    echo "TestLink database already exists ($TABLE_COUNT tables)."

    # Ensure config_db.inc.php exists
    if [ ! -f /var/www/html/config_db.inc.php ]; then
        cat > /var/www/html/config_db.inc.php <<DBEOF
<?php
define('DB_TYPE', 'mysql');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
define('DB_HOST', '$DB_HOST');
define('DB_NAME', '$DB_NAME');
define('DB_TABLE_PREFIX', '');
?>
DBEOF
        chown www-data:www-data /var/www/html/config_db.inc.php
    fi
fi

exec "$@"
