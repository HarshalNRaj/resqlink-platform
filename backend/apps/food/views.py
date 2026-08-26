from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.models import Status
from apps.common.notify import notify
from apps.common.permissions import IsOwnerOrReadOnly
from apps.common.permissions import HasRole
from apps.accounts.models import Role

from .models import FoodListing
from .serializers import FoodListingSerializer


class FoodListingViewSet(viewsets.ModelViewSet):
    queryset = FoodListing.objects.select_related("provider", "requester", "volunteer").all()
    serializer_class = FoodListingSerializer
    owner_field = "provider"
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def get_permissions(self):
        if self.action in ("create", "request_item"):
            self.required_roles = {Role.DONOR, Role.ADMIN} if self.action == "create" else {Role.GENERAL, Role.RECEIVER, Role.ADMIN}
            return [permissions.IsAuthenticated(), HasRole()]
        if self.action in ("update", "partial_update", "destroy"):
            permission = IsOwnerOrReadOnly()
            permission.owner_field = self.owner_field
            return [permissions.IsAuthenticated(), permission]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        mine = self.request.query_params.get("mine")
        if mine == "provided":
            qs = qs.filter(provider=self.request.user)
        elif mine == "requested":
            qs = qs.filter(requester=self.request.user)
        elif mine == "volunteering":
            qs = qs.filter(volunteer=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

    @action(detail=True, methods=["post"])
    def request_item(self, request, pk=None):
        listing = self.get_object()
        if listing.status != Status.AVAILABLE:
            return Response({"detail": "This listing is no longer available."}, status=status.HTTP_400_BAD_REQUEST)
        if listing.provider_id == request.user.id:
            return Response({"detail": "You can't claim your own listing."}, status=status.HTTP_400_BAD_REQUEST)
        listing.requester = request.user
        listing.status = Status.REQUESTED
        listing.save(update_fields=["requester", "status", "updated_at"])
        notify(listing.provider, f"{request.user.username} claimed your food listing '{listing.title}'.")
        return Response(FoodListingSerializer(listing).data)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        if request.user.role not in (Role.VOLUNTEER, Role.NGO, Role.ADMIN):
            return Response({"detail": "Only volunteers and NGOs can deliver food."}, status=status.HTTP_403_FORBIDDEN)
        listing = self.get_object()
        if listing.status != Status.REQUESTED:
            return Response({"detail": "This listing isn't awaiting a volunteer yet."}, status=status.HTTP_400_BAD_REQUEST)
        listing.volunteer = request.user
        listing.status = Status.ASSIGNED
        listing.save(update_fields=["volunteer", "status", "updated_at"])
        notify(listing.provider, f"{request.user.username} will pick up '{listing.title}'.")
        notify(listing.requester, f"{request.user.username} will deliver '{listing.title}' to you.")
        return Response(FoodListingSerializer(listing).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        listing = self.get_object()
        if listing.status != Status.ASSIGNED:
            return Response({"detail": "This listing isn't ready to be marked complete."}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.id not in {listing.provider_id, listing.volunteer_id}:
            return Response({"detail": "Only the provider or assigned volunteer can complete this."}, status=status.HTTP_403_FORBIDDEN)
        listing.status = Status.COMPLETED
        listing.completed_at = timezone.now()
        listing.save(update_fields=["status", "completed_at", "updated_at"])
        for u in {listing.provider, listing.requester, listing.volunteer}:
            notify(u, f"'{listing.title}' was rescued successfully. Thanks for the impact!")
        return Response(FoodListingSerializer(listing).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        listing = self.get_object()
        if listing.provider_id != request.user.id:
            return Response({"detail": "Only the provider can cancel a listing."}, status=status.HTTP_403_FORBIDDEN)
        if listing.status == Status.COMPLETED:
            return Response({"detail": "A completed listing can't be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        listing.status = Status.CANCELLED
        listing.save(update_fields=["status", "updated_at"])
        return Response(FoodListingSerializer(listing).data)
