from rest_framework import serializers
from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    requester_username = serializers.ReadOnlyField(source='requester.username')
    volunteer_username = serializers.ReadOnlyField(source='volunteer.username')

    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'status', 'requester', 'volunteer', 'created_at', 'updated_at', 'completed_at']
