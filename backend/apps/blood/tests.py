from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import BloodBank, BloodRequest

User = get_user_model()


class BloodBankRoleWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users for testing
        self.verified_bb_user = User.objects.create_user(
            username="verified_bb",
            email="vbb@resqlink.org",
            password="Password123!",
            role="blood_bank",
            organization_name="Mysuru Central Blood Bank",
            is_verified=True,
        )
        self.unverified_bb_user = User.objects.create_user(
            username="unverified_bb",
            email="ubb@resqlink.org",
            password="Password123!",
            role="blood_bank",
            organization_name="Pending Community Blood Bank",
            is_verified=False,
        )
        self.other_bb_user = User.objects.create_user(
            username="other_bb",
            email="otherbb@resqlink.org",
            password="Password123!",
            role="blood_bank",
            organization_name="Other Blood Bank",
            is_verified=True,
        )
        self.donor_user = User.objects.create_user(
            username="donor1",
            email="donor@resqlink.org",
            password="Password123!",
            role="donor",
            blood_group="O+",
            is_verified=True,
        )
        self.receiver_user = User.objects.create_user(
            username="receiver1",
            email="receiver@resqlink.org",
            password="Password123!",
            role="receiver",
            is_verified=True,
        )
        self.ngo_user = User.objects.create_user(
            username="ngo1",
            email="ngo@resqlink.org",
            password="Password123!",
            role="ngo",
            organization_name="Red Crescent Relief",
            is_verified=True,
        )

        # Existing Blood Bank Profile for verified_bb_user
        self.bank_profile = BloodBank.objects.create(
            user=self.verified_bb_user,
            name="Mysuru Central Blood Bank",
            address_text="Sayyaji Rao Rd, Mysuru",
            contact_phone="+918212445566",
        )

        # Open Blood Request created by receiver
        self.blood_req = BloodRequest.objects.create(
            requester=self.receiver_user,
            blood_group="O+",
            units_needed=2,
            urgency="critical",
            hospital_name="Apollo Hospital",
            address_text="Kuvempunagar, Mysuru",
            status=BloodRequest.Status.OPEN,
        )

    def test_verified_blood_bank_can_supply_units(self):
        self.client.force_authenticate(user=self.verified_bb_user)
        res = self.client.post(f"/api/blood/requests/{self.blood_req.id}/match_blood_bank/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.blood_req.refresh_from_db()
        self.assertEqual(self.blood_req.status, BloodRequest.Status.MATCHED)
        self.assertEqual(self.blood_req.matched_blood_bank, self.bank_profile)

    def test_unverified_blood_bank_cannot_supply_units(self):
        self.client.force_authenticate(user=self.unverified_bb_user)
        res = self.client.post(f"/api/blood/requests/{self.blood_req.id}/match_blood_bank/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.blood_req.refresh_from_db()
        self.assertEqual(self.blood_req.status, BloodRequest.Status.OPEN)

    def test_donor_or_receiver_cannot_call_match_blood_bank(self):
        self.client.force_authenticate(user=self.donor_user)
        res = self.client.post(f"/api/blood/requests/{self.blood_req.id}/match_blood_bank/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.receiver_user)
        res2 = self.client.post(f"/api/blood/requests/{self.blood_req.id}/match_blood_bank/")
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

    def test_blood_bank_cannot_use_donor_offer_endpoint(self):
        self.client.force_authenticate(user=self.verified_bb_user)
        res = self.client.post(f"/api/blood/requests/{self.blood_req.id}/offer_to_donate/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_blood_bank_profile_crud_and_isolation(self):
        # Non-blood_bank role cannot create a blood bank profile
        self.client.force_authenticate(user=self.donor_user)
        res = self.client.post("/api/blood/banks/", {"name": "Fake Bank"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Blood bank user can access their profile via /me/
        self.client.force_authenticate(user=self.verified_bb_user)
        me_res = self.client.get("/api/blood/banks/me/")
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data["name"], "Mysuru Central Blood Bank")

        # Blood bank user can update their profile via /me/
        update_res = self.client.patch("/api/blood/banks/me/", {"contact_phone": "+918219998888"}, format="json")
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.bank_profile.refresh_from_db()
        self.assertEqual(self.bank_profile.contact_phone, "+918219998888")

        # Another blood bank user cannot modify this blood bank's profile
        self.client.force_authenticate(user=self.other_bb_user)
        tamper_res = self.client.patch(f"/api/blood/banks/{self.bank_profile.id}/", {"name": "Hacked Bank"}, format="json")
        self.assertEqual(tamper_res.status_code, status.HTTP_403_FORBIDDEN)
