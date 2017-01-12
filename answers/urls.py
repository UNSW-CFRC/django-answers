from django.conf.urls import url


from .views import graph, graphJson

urlpatterns = [
    url(r'^$', graph),
    url(r'^api/graph', graphJson, name='graphJson'),
]
