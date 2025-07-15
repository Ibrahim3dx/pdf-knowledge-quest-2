from django.db import models

# Create your models here.
import uuid
from django.db import models

class Document(models.Model):
    STATUS_CHOICES = [
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('error', 'Error'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='documents/')
    name = models.CharField(max_length=255)
    size = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploading')
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
