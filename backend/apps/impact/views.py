from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.blood.models import BloodRequest, BloodRequestStatus
from apps.common.models import Status
from apps.emergency.models import EmergencyRequest, EmergencyStatus
from apps.food.models import FoodListing
from apps.resources.models import Resource


class ImpactSummaryView(APIView):
    """Every number here comes straight from a query against completed
    records — nothing is hardcoded, matching the synopsis's requirement
    that the dashboard report real, not fabricated, statistics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items_reused = Resource.objects.filter(status=Status.COMPLETED).count()
        food_portions = (
            FoodListing.objects.filter(status=Status.COMPLETED)
            .aggregate(total=Sum("quantity_servings"))["total"] or 0
        )
        blood_units = (
            BloodRequest.objects.filter(status=BloodRequestStatus.FULFILLED)
            .aggregate(total=Sum("units_needed"))["total"] or 0
        )
        emergencies_fulfilled = EmergencyRequest.objects.filter(
            status__in=[EmergencyStatus.FULFILLED, EmergencyStatus.CLOSED]
        ).count()

        active_listings = (
            Resource.objects.exclude(status__in=[Status.COMPLETED, Status.CANCELLED]).count()
            + FoodListing.objects.exclude(status__in=[Status.COMPLETED, Status.CANCELLED]).count()
        )
        open_emergencies = EmergencyRequest.objects.filter(status=EmergencyStatus.OPEN).count()
        open_blood_requests = BloodRequest.objects.filter(status=BloodRequestStatus.OPEN).count()

        by_month = (
            Resource.objects.filter(status=Status.COMPLETED)
            .annotate(month=TruncMonth("completed_at"))
            .values("month")
            .annotate(count=Sum("quantity"))
            .order_by("month")
        )
        monthly_items = [
            {"month": row["month"].strftime("%b %Y"), "count": row["count"] or 0}
            for row in by_month if row["month"]
        ]

        return Response({
            "items_reused": items_reused,
            "food_portions_rescued": food_portions,
            "blood_units_fulfilled": blood_units,
            "emergencies_fulfilled": emergencies_fulfilled,
            "active_listings": active_listings,
            "open_emergencies": open_emergencies,
            "open_blood_requests": open_blood_requests,
            "monthly_items_reused": monthly_items,
        })
