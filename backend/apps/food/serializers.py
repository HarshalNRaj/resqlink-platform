from rest_framework import serializers
from .models import FoodListing


class FoodListingSerializer(serializers.ModelSerializer):
    provider_username = serializers.ReadOnlyField(source='provider.username')
    requester_username = serializers.ReadOnlyField(source='requester.username')
    volunteer_username = serializers.ReadOnlyField(source='volunteer.username')

    class Meta:
        model = FoodListing
        fields = '__all__'
        read_only_fields = ['id', 'provider', 'status', 'requester', 'volunteer', 'created_at', 'updated_at', 'completed_at']
