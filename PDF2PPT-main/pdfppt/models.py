from django.db import models

# Create your models here.
class media(models.Model):
    doc = models.FileField(upload_to='media/')