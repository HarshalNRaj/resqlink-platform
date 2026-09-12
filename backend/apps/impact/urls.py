from django.urls import path

from .views import ImpactSummaryView

urlpatterns = [
    path("summary/", ImpactSummaryView.as_view(), name="impact-summary"),
]
