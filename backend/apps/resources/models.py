from django.conf import settings
from django.db import models

from apps.common.models import LifecycleListing


class Category(models.TextChoices):
    CLOTHES = "clothes", "Clothes"
    ELECTRONICS = "electronics", "Electronics"
    FURNITURE = "furniture", "Furniture"
    BOOKS = "books", "Books"
    OTHER = "other", "Other"


class Condition(models.TextChoices):
    NEW = "new", "New"
    GOOD = "good", "Good"
    FAIR = "fair", "Fair"


class Resource(LifecycleListing):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resources_owned",
    )
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=Category.choices)
    condition = models.CharField(max_length=10, choices=Condition.choices, default=Condition.GOOD)
    description = models.TextField(blank=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.title
