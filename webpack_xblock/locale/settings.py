"""
Django settings for webpack_xblock project.
For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""
import os

SECRET_KEY = os.getenv('DJANGO_SECRET', 'open_secret')

# Application definition

INSTALLED_APPS = (
    'statici18n',
    'webpack_xblock',
)

# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_URL = '/static/'

# statici18n
# http://django-statici18n.readthedocs.io/en/latest/settings.html

STATICI18N_DOMAIN = 'text'
STATICI18N_PACKAGES = (
    'webpack_xblock.translations',
)
STATICI18N_ROOT = 'webpack_xblock/public/js'
STATICI18N_OUTPUT_DIR = 'translations'
