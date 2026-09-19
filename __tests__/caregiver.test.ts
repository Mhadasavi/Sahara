import { CaregiverContact } from "../lib/types";

// Caregiver contact business logic helpers
function resolveDefaultContact(contacts: CaregiverContact[]): CaregiverContact | null {
  if (!contacts || contacts.length === 0) return null;
  return contacts.find((c) => c.isDefault) || contacts[0];
}

function migrateLegacyCaregiver(legacyJson: string | null, contactsJson: string | null): CaregiverContact[] {
  if (contactsJson) {
    try {
      const parsed = JSON.parse(contactsJson);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  if (legacyJson) {
    try {
      const legacy = JSON.parse(legacyJson);
      if (legacy?.phone) {
        return [
          {
            id: "migrated-1",
            name: legacy.name || "Family Member",
            phone: legacy.phone,
            relation: "Family",
            isDefault: true,
          },
        ];
      }
    } catch {}
  }

  return [];
}

function updateContactInList(
  contacts: CaregiverContact[],
  updated: CaregiverContact
): CaregiverContact[] {
  return contacts.map((c) => (c.id === updated.id ? updated : updated.isDefault ? { ...c, isDefault: false } : c));
}

function deleteContactFromList(
  contacts: CaregiverContact[],
  targetId: string
): CaregiverContact[] {
  const filtered = contacts.filter((c) => c.id !== targetId);
  if (filtered.length > 0 && !filtered.some((c) => c.isDefault)) {
    filtered[0].isDefault = true;
  }
  return filtered;
}

describe("Sahara Caregiver & Family Contacts Engine", () => {
  const sampleContacts: CaregiverContact[] = [
    { id: "1", name: "Rohan", phone: "+919812345678", relation: "बेटा / Son", isDefault: true },
    { id: "2", name: "Priya", phone: "+919823456789", relation: "बेटी / Daughter", isDefault: false },
  ];

  test("Resolves explicit primary default contact", () => {
    const primary = resolveDefaultContact(sampleContacts);
    expect(primary?.name).toBe("Rohan");
    expect(primary?.isDefault).toBe(true);
  });

  test("Falls back to first contact if no contact has isDefault flag", () => {
    const withoutDefault = sampleContacts.map((c) => ({ ...c, isDefault: false }));
    const primary = resolveDefaultContact(withoutDefault);
    expect(primary?.name).toBe("Rohan");
  });

  test("Returns null when contact list is empty", () => {
    expect(resolveDefaultContact([])).toBeNull();
  });

  test("Updates existing contact phone number without duplicating entries", () => {
    const updated: CaregiverContact = {
      id: "1",
      name: "Rohan Sharma",
      phone: "+919999999999",
      relation: "बेटा / Son",
      isDefault: true,
    };
    const result = updateContactInList(sampleContacts, updated);
    expect(result.length).toBe(2);
    expect(result.find((c) => c.id === "1")?.phone).toBe("+919999999999");
  });

  test("Toggling default on a contact unsets default on previous contacts", () => {
    const updatedPriya: CaregiverContact = {
      ...sampleContacts[1],
      isDefault: true,
    };
    const result = updateContactInList(sampleContacts, updatedPriya);
    const priya = result.find((c) => c.id === "2");
    const rohan = result.find((c) => c.id === "1");

    expect(priya?.isDefault).toBe(true);
    expect(rohan?.isDefault).toBe(false);
  });

  test("Deleting a default contact automatically reassigns default to remaining member", () => {
    const remaining = deleteContactFromList(sampleContacts, "1");
    expect(remaining.length).toBe(1);
    expect(remaining[0].name).toBe("Priya");
    expect(remaining[0].isDefault).toBe(true);
  });

  test("Seamlessly migrates legacy single-contact storage without data loss", () => {
    const legacyStorage = JSON.stringify({ name: "Amitabh", phone: "+919123456789" });
    const migrated = migrateLegacyCaregiver(legacyStorage, null);

    expect(migrated.length).toBe(1);
    expect(migrated[0].name).toBe("Amitabh");
    expect(migrated[0].phone).toBe("+919123456789");
    expect(migrated[0].isDefault).toBe(true);
  });
});
