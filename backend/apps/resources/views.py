from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.models import Status
from apps.common.notify import notify
from apps.common.permissions import IsOwnerOrReadOnly

from .models import Resource
from .serializers import ResourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.select_related("owner", "requester", "volunteer").all()
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category", "status", "condition"]

    def get_permissions(self):
        # IsOwnerOrReadOnly only makes sense for editing/deleting the listing
        # itself — the lifecycle actions (request/assign/complete/cancel) have
        # their own in-method checks against the *relevant* party, not the owner.
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        mine = self.request.query_params.get("mine")
        if mine == "owned":
            qs = qs.filter(owner=self.request.user)
        elif mine == "requested":
            qs = qs.filter(requester=self.request.user)
        elif mine == "volunteering":
            qs = qs.filter(volunteer=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def request_item(self, request, pk=None):
        resource = self.get_object()
        if resource.status != Status.AVAILABLE:
            return Response({"detail": "This resource is no longer available."}, status=status.HTTP_400_BAD_REQUEST)
        if resource.owner_id == request.user.id:
            return Response({"detail": "You can't request your own listing."}, status=status.HTTP_400_BAD_REQUEST)
        resource.requester = request.user
        resource.status = Status.REQUESTED
        resource.save(update_fields=["requester", "status", "updated_at"])
        notify(resource.owner, f"{request.user.username} requested your item '{resource.title}'.")
        return Response(ResourceSerializer(resource).data)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        resource = self.get_object()
        if resource.status != Status.REQUESTED:
            return Response({"detail": "This item isn't awaiting a volunteer yet."}, status=status.HTTP_400_BAD_REQUEST)
        resource.volunteer = request.user
        resource.status = Status.ASSIGNED
        resource.save(update_fields=["volunteer", "status", "updated_at"])
        notify(resource.owner, f"{request.user.username} will handle pickup for '{resource.title}'.")
        notify(resource.requester, f"{request.user.username} will deliver '{resource.title}' to you.")
        return Response(ResourceSerializer(resource).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        resource = self.get_object()
        if resource.status != Status.ASSIGNED:
            return Response({"detail": "This item isn't ready to be marked complete."}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.id not in {resource.owner_id, resource.volunteer_id}:
            return Response({"detail": "Only the owner or assigned volunteer can complete this."}, status=status.HTTP_403_FORBIDDEN)
        resource.status = Status.COMPLETED
        resource.completed_at = timezone.now()
        resource.save(update_fields=["status", "completed_at", "updated_at"])
        for u in {resource.owner, resource.requester, resource.volunteer}:
            notify(u, f"'{resource.title}' has been marked complete. Thanks for the impact!")
        return Response(ResourceSerializer(resource).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        resource = self.get_object()
        if resource.owner_id != request.user.id:
            return Response({"detail": "Only the owner can cancel a listing."}, status=status.HTTP_403_FORBIDDEN)
        if resource.status == Status.COMPLETED:
            return Response({"detail": "A completed listing can't be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        resource.status = Status.CANCELLED
        resource.save(update_fields=["status", "updated_at"])
        return Response(ResourceSerializer(resource).data)
