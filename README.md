# UADI GUI: browse and inspect spatio-temporal data via RDF graph

## Quickstart for Geonode sites

Clone this repository.

Configure settings and URLs.

    cd ~geonode/geonode/geonode
    vi local_settings_gaz.py: add answers to INSTALLED_APPS
    vi urls.py: add code to import answers.urls

Install.

    cd ~geonode/geonode
    sudo -H pip install --upgrade ../django-answers
    sudo service apache2 restart

If you modify static files (css, js, images):

    sudo python manage.py collectstatic

See your graph at url:

    http://cfdev.intersect.org.au/answers