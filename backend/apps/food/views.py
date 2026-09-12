from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import FoodListing
from .serializers import FoodListingSerializer
from ..common.permissions import IsVerifiedOrganization


class FoodListingViewSet(viewsets.ModelViewSet):
    queryset = FoodListing.objects.all().order_by('-created_at')
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifiedOrganization]

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'role', '') in ['general', 'receiver', 'volunteer', 'blood_bank']:
            raise exceptions.PermissionDenied("Only food donors and organization accounts can create food listings.")
        serializer.save(provider=user)

    def perform_update(self, serializer):
        user = self.request.user
        listing = self.get_object()
        if listing.provider != user and not getattr(user, 'is_staff', False) and getattr(user, 'role', '') != 'admin':
            raise exceptions.PermissionDenied("You do not have permission to edit this food listing.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.provider != user and not getattr(user, 'is_staff', False) and getattr(user, 'role', '') != 'admin':
            raise exceptions.PermissionDenied("You do not have permission to delete this food listing.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_food(self, request, pk=None):
        listing = self.get_object()
        if listing.status != FoodListing.Status.AVAILABLE:
            return Response({"detail": "Food listing is not available."}, status=status.HTTP_400_BAD_REQUEST)
        if listing.provider == request.user:
            return Response({"detail": "You cannot request your own food listing."}, status=status.HTTP_400_BAD_REQUEST)
        listing.status = FoodListing.Status.REQUESTED
        listing.requester = request.user
        listing.save()
        return Response(self.get_serializer(listing).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_item(self, request, pk=None):
        return self.request_food(request, pk)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsVerifiedOrganization])
    def assign_volunteer(self, request, pk=None):
        if getattr(request.user, 'role', '') in ['general', 'receiver']:
            return Response({"detail": "Receivers cannot accept volunteer delivery assignments."}, status=status.HTTP_403_FORBIDDEN)
        if getattr(request.user, 'role', '') not in ['volunteer', 'ngo', 'admin'] and not getattr(request.user, 'is_staff', False):
            return Response({"detail": "Only volunteers and organizations can accept delivery assignments."}, status=status.HTTP_403_FORBIDDEN)
        listing = self.get_object()
        if listing.status != FoodListing.Status.REQUESTED:
            return Response({"detail": "Listing is not in requested status."}, status=status.HTTP_400_BAD_REQUEST)
        listing.status = FoodListing.Status.ASSIGNED
        listing.volunteer = request.user
        listing.save()
        return Response(self.get_serializer(listing).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsVerifiedOrganization])
    def assign(self, request, pk=None):
        return self.assign_volunteer(request, pk)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        listing = self.get_object()
        if listing.status not in [FoodListing.Status.ASSIGNED, FoodListing.Status.REQUESTED]:
            return Response({"detail": "Food listing is not ready for completion."}, status=status.HTTP_400_BAD_REQUEST)
        allowed = [listing.provider, listing.requester, listing.volunteer]
        is_staff = getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', '') == 'admin'
        if request.user not in allowed and not is_staff:
            return Response({"detail": "You do not have permission to mark this food listing complete."}, status=status.HTTP_403_FORBIDDEN)
        listing.status = FoodListing.Status.COMPLETED
        listing.completed_at = timezone.now()
        listing.save()
        return Response(self.get_serializer(listing).data)
