from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.notify import notify
from apps.accounts.models import Role
from apps.common.permissions import IsOwnerOrReadOnly

from .models import EmergencyRequest, EmergencyStatus
from .serializers import EmergencyRequestSerializer


class EmergencyRequestViewSet(viewsets.ModelViewSet):
    queryset = EmergencyRequest.objects.select_related("requester", "assigned_to").all()
    serializer_class = EmergencyRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["request_type", "status", "urgency"]

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            permission = IsOwnerOrReadOnly()
            permission.owner_field = "requester"
            return [permissions.IsAuthenticated(), permission]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        mine = self.request.query_params.get("mine")
        if mine == "requested":
            qs = qs.filter(requester=self.request.user)
        elif mine == "assigned":
            qs = qs.filter(assigned_to=self.request.user)
        return qs

    def perform_create(self, serializer):
        if self.request.user.role not in (Role.GENERAL, Role.RECEIVER, Role.ADMIN):
            raise PermissionDenied("Only receiver accounts can post emergency requests.")
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=["post"])
    def claim(self, request, pk=None):
        """A volunteer or NGO takes responsibility for responding."""
        req = self.get_object()
        if request.user.role not in (Role.VOLUNTEER, Role.NGO, Role.ADMIN):
            return Response({"detail": "Only volunteers and NGOs can respond to emergencies."}, status=status.HTTP_403_FORBIDDEN)
        if req.status != EmergencyStatus.OPEN:
            return Response({"detail": "This request already has a responder."}, status=status.HTTP_400_BAD_REQUEST)
        req.assigned_to = request.user
        req.status = EmergencyStatus.IN_PROGRESS
        req.save(update_fields=["assigned_to", "status", "updated_at"])
        notify(req.requester, f"{request.user.username} is responding to your emergency request.")
        return Response(EmergencyRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def fulfill(self, request, pk=None):
        req = self.get_object()
        if req.status != EmergencyStatus.IN_PROGRESS:
            return Response({"detail": "This request isn't in progress."}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.id not in {req.requester_id, req.assigned_to_id}:
            return Response({"detail": "Only the requester or responder can mark this fulfilled."}, status=status.HTTP_403_FORBIDDEN)
        req.status = EmergencyStatus.FULFILLED
        req.closed_at = timezone.now()
        req.save(update_fields=["status", "closed_at", "updated_at"])
        for u in {req.requester, req.assigned_to}:
            notify(u, "The emergency request has been marked fulfilled.")
        return Response(EmergencyRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        req = self.get_object()
        if req.requester_id != request.user.id:
            return Response({"detail": "Only the requester can close this."}, status=status.HTTP_403_FORBIDDEN)
        req.status = EmergencyStatus.CLOSED
        req.closed_at = timezone.now()
        req.save(update_fields=["status", "closed_at", "updated_at"])
        return Response(EmergencyRequestSerializer(req).data)
