from django.db import connections
from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import render
import json

from .models import Concept

def graph(request):
    return render(request, 'graph.html')

def graphJson(request):
    data = '[]'
    return HttpResponse(json.dumps(list(data)), content_type="application/json")

#def date_handler(obj):
#    if hasattr(obj, 'isoformat'):
#        return obj.isoformat()
#    else:
#        raise TypeError

#def play_count_by_month(request):
#    data = Play.objects.all() \
#        .extra(
#            select={
#                'month': connections[Play.objects.db].ops.date_trunc_sql('month', 'date')
#            }
#        ) \
#        .values('month') \
#        .annotate(count_items=Count('id'))
#    return HttpResponse(json.dumps(list(data), default=date_handler), content_type="application/json")
