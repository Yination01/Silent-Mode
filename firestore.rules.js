match /promoCodes/{document} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth != null &&
    (request.auth.uid in get(/databases/$(database)/documents/admin/superusers).data.users);
}

match /referralCodes/{document} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null &&
    request.auth.uid == resource.data.userId;
}

match /referrals/{document} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
}

match /discounts/{document} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null;
}