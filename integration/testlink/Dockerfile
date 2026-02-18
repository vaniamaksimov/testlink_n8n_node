FROM php:7.4-apache

RUN apt-get update && apt-get install -y \
    libldap2-dev \
    libxml2-dev \
    unzip \
    curl \
    default-mysql-client \
    && docker-php-ext-install mysqli pdo pdo_mysql xmlrpc ldap \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

ARG TESTLINK_VERSION=1.9.19

RUN curl -fSL "https://github.com/TestLinkOpenSourceTRMS/testlink-code/archive/refs/tags/${TESTLINK_VERSION}.tar.gz" \
    -o /tmp/testlink.tar.gz \
    && tar -xzf /tmp/testlink.tar.gz -C /var/www/html --strip-components=1 \
    && rm /tmp/testlink.tar.gz

RUN mkdir -p /var/testlink/logs /var/testlink/upload_area \
    && chown -R www-data:www-data /var/www/html /var/testlink \
    && chmod -R 775 /var/www/html /var/testlink

# Pre-configure TestLink DB connection via custom_config.inc.php
# Actual values are injected at runtime via entrypoint
RUN echo '<?php' > /var/www/html/custom_config.inc.php \
    && echo 'define("DB_TYPE", "mysql");' >> /var/www/html/custom_config.inc.php \
    && echo 'define("DB_HOST", getenv("TESTLINK_DB_HOST") ?: "mariadb");' >> /var/www/html/custom_config.inc.php \
    && echo 'define("DB_NAME", getenv("TESTLINK_DB_NAME") ?: "testlink");' >> /var/www/html/custom_config.inc.php \
    && echo 'define("DB_USER", getenv("TESTLINK_DB_USER") ?: "testlink");' >> /var/www/html/custom_config.inc.php \
    && echo 'define("DB_PASS", getenv("TESTLINK_DB_PASS") ?: "testlink");' >> /var/www/html/custom_config.inc.php \
    && echo 'define("DB_TABLE_PREFIX", "");' >> /var/www/html/custom_config.inc.php \
    && echo '$tlCfg->log_path = "/var/testlink/logs/";' >> /var/www/html/custom_config.inc.php \
    && echo '$tlCfg->default_language = "en_GB";' >> /var/www/html/custom_config.inc.php \
    && echo '$g_repositoryPath = "/var/testlink/upload_area/";' >> /var/www/html/custom_config.inc.php \
    && echo '?>' >> /var/www/html/custom_config.inc.php \
    && chown www-data:www-data /var/www/html/custom_config.inc.php

# Suppress PHP warnings/notices from corrupting XML-RPC responses
RUN { \
    echo 'display_errors = Off'; \
    echo 'log_errors = On'; \
    echo 'error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE'; \
    } > /usr/local/etc/php/conf.d/testlink-errors.ini

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
