from __future__ import unicode_literals

from django.db import models

class Concept(models.Model):
    term = models.CharField(max_length=100)
    prefLabel = models.CharField(max_length=100)