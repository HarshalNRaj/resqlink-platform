from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.resources.models import Resource
from apps.food.models import FoodListing
from apps.emergency.models import EmergencyRequest
from apps.blood.models import BloodRequest, BloodBank

User = get_user_model()


class ReceiverRoleWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.receiver = User.objects.create_user(
            username="receiver_jane",
            email="receiver@resqlink.org",
            password="Password123!",
            role="receiver",
            is_verified=True,
        )
        self.other_receiver = User.objects.create_user(
            username="receiver_mark",
            email="mark@resqlink.org",
            password="Password123!",
            role="receiver",
            is_verified=True,
        )
        self.donor = User.objects.create_user(
            username="donor_john",
            email="donor@resqlink.org",
            password="Password123!",
            role="donor",
            is_verified=True,
        )
        self.volunteer = User.objects.create_user(
            username="volunteer_val",
            email="volunteer@resqlink.org",
            password="Password123!",
            role="volunteer",
            is_verified=True,
        )

        # Available Resource created by donor
        self.resource = Resource.objects.create(
            owner=self.donor,
            title="Wheelchair",
            category="medical",
            condition="good",
            quantity=1,
            status=Resource.Status.AVAILABLE,
        )

        # Available Food Listing created by donor
        self.food = FoodListing.objects.create(
            provider=self.donor,
            title="Surplus Packaged Meals",
            quantity_servings=20,
            status=FoodListing.Status.AVAILABLE,
        )

        # Blood Request created by receiver
        self.blood_req = BloodRequest.objects.create(
            requester=self.receiver,
            blood_group="B+",
            units_needed=2,
            urgency="high",
            hospital_name="JSS Hospital Mysuru",
            status=BloodRequest.Status.OPEN,
        )

    # 1. Resource requests & permissions
    def test_receiver_can_request_available_resource(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/resources/{self.resource.id}/request_item/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.status, Resource.Status.REQUESTED)
        self.assertEqual(self.resource.requester, self.receiver)

    def test_receiver_cannot_create_resource_listing(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post("/api/resources/", {
            "title": "Unauthorized Listing",
            "category": "supplies",
            "quantity": 5,
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_receiver_cannot_assign_volunteer_to_resource(self):
        self.resource.status = Resource.Status.REQUESTED
        self.resource.requester = self.receiver
        self.resource.save()

        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/resources/{self.resource.id}/assign/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_receiver_can_mark_completed_when_assigned(self):
        self.resource.status = Resource.Status.ASSIGNED
        self.resource.requester = self.receiver
        self.resource.volunteer = self.volunteer
        self.resource.save()

        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/resources/{self.resource.id}/complete/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.status, Resource.Status.COMPLETED)

    # 2. Food requests & permissions
    def test_receiver_can_request_food_listing(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/food/{self.food.id}/request_item/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.food.refresh_from_db()
        self.assertEqual(self.food.status, FoodListing.Status.REQUESTED)
        self.assertEqual(self.food.requester, self.receiver)

    def test_receiver_cannot_create_food_listing(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post("/api/food/", {
            "title": "Unauthorized Food",
            "quantity_servings": 10,
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_receiver_cannot_assign_volunteer_to_food(self):
        self.food.status = FoodListing.Status.REQUESTED
        self.food.requester = self.receiver
        self.food.save()

        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/food/{self.food.id}/assign/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # 3. Emergency Requests
    def test_receiver_can_create_emergency_request(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post("/api/emergency/", {
            "request_type": "rescue",
            "description": "Flash flooding near Chamundi foothills",
            "urgency": "critical",
            "people_affected": 4,
            "address_text": "Chamundi Hill Rd, Mysuru",
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        sos_id = res.data["id"]
        sos = EmergencyRequest.objects.get(id=sos_id)
        self.assertEqual(sos.requester, self.receiver)
        self.assertEqual(sos.status, EmergencyRequest.Status.OPEN)

    def test_receiver_cannot_claim_emergency_request(self):
        sos = EmergencyRequest.objects.create(
            requester=self.other_receiver,
            request_type="medical",
            description="Urgent assistance needed",
            urgency="high",
            status=EmergencyRequest.Status.OPEN,
        )
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/emergency/{sos.id}/claim/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_receiver_can_close_own_emergency_request(self):
        sos = EmergencyRequest.objects.create(
            requester=self.receiver,
            request_type="supplies",
            description="Temporary power outage",
            urgency="low",
            status=EmergencyRequest.Status.OPEN,
        )
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/emergency/{sos.id}/close/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        sos.refresh_from_db()
        self.assertEqual(sos.status, EmergencyRequest.Status.CLOSED)

    def test_receiver_cannot_close_other_user_emergency_request(self):
        sos = EmergencyRequest.objects.create(
            requester=self.other_receiver,
            request_type="supplies",
            description="Other user SOS",
            urgency="low",
            status=EmergencyRequest.Status.OPEN,
        )
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/emergency/{sos.id}/close/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # 4. Blood Request & Role Isolation
    def test_receiver_cannot_offer_blood_donation(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/blood/requests/{self.blood_req.id}/offer_to_donate/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_receiver_cannot_match_blood_bank(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post(f"/api/blood/requests/{self.blood_req.id}/match_blood_bank/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_receiver_cannot_manage_blood_bank_profiles(self):
        self.client.force_authenticate(user=self.receiver)
        res = self.client.post("/api/blood/banks/", {"name": "Unauthorized Facility"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
