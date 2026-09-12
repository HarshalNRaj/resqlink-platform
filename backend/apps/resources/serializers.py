from rest_framework import serializers

from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    requester_username = serializers.CharField(source="requester.username", read_only=True, default=None)
    volunteer_username = serializers.CharField(source="volunteer.username", read_only=True, default=None)

    class Meta:
        model = Resource
        fields = (
            "id", "owner", "owner_username", "title", "category", "condition",
            "description", "quantity", "status", "requester", "requester_username",
            "volunteer", "volunteer_username", "address_text", "lat", "lng",
            "created_at", "updated_at", "completed_at",
        )
        read_only_fields = (
            "id", "owner", "status", "requester", "volunteer",
            "created_at", "updated_at", "completed_at",
        )
